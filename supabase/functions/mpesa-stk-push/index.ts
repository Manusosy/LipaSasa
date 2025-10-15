import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StkPushRequest {
  invoiceId?: string;
  phoneNumber: string;
  amount: number;
  description?: string;
  isTest?: boolean;
}

interface MpesaCredentials {
  shortcode: string;
  consumer_key: string;
  consumer_secret: string;
  passkey: string;
  environment: 'sandbox' | 'production';
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { invoiceId, phoneNumber, amount, description, isTest }: StkPushRequest = await req.json();

    console.log('STK Push request:', { userId: user.id, invoiceId, phoneNumber, amount, isTest });

    // Validate inputs
    if (!phoneNumber || !amount) {
      return new Response(
        JSON.stringify({ error: 'Phone number and amount are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format phone number (remove + or leading 0, ensure 254 prefix)
    let formattedPhone = phoneNumber.replace(/[\s\-\+]/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    }
    if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

    // Validate Kenyan phone number format
    if (!/^254[17]\d{8}$/.test(formattedPhone)) {
      return new Response(
        JSON.stringify({ error: 'Invalid Kenyan phone number format. Use 254XXXXXXXXX' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch merchant's M-PESA credentials
    const { data: credentials, error: credError } = await supabaseClient
      .from('mpesa_credentials')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (credError || !credentials) {
      console.error('Credentials fetch error:', credError);
      return new Response(
        JSON.stringify({ error: 'M-PESA credentials not found. Please set up your M-PESA integration in Payment Methods first.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const mpesaCreds: MpesaCredentials = {
      shortcode: credentials.shortcode,
      consumer_key: credentials.consumer_key,
      consumer_secret: credentials.consumer_secret,
      passkey: credentials.passkey,
      environment: credentials.environment || 'sandbox',
    };

    // Determine API URL based on environment
    const apiUrl = mpesaCreds.environment === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';

    console.log(`Using ${mpesaCreds.environment} environment`);

    // Step 1: Get OAuth token from Safaricom
    console.log('Requesting OAuth token...');
    const auth = btoa(`${mpesaCreds.consumer_key}:${mpesaCreds.consumer_secret}`);
    
    const tokenResponse = await fetch(
      `${apiUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      }
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('OAuth token error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to authenticate with M-PESA. Please check your credentials.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { access_token } = await tokenResponse.json();
    console.log('OAuth token obtained successfully');

    // Step 2: Generate STK Push password
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = btoa(`${mpesaCreds.shortcode}${mpesaCreds.passkey}${timestamp}`);

    // Step 3: Prepare callback URL
    const callbackUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/mpesa-callback`;

    // Step 4: Send STK Push request
    console.log('Sending STK Push request...');
    const stkPayload = {
      BusinessShortCode: mpesaCreds.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(amount), // Ensure integer
      PartyA: formattedPhone,
      PartyB: mpesaCreds.shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: invoiceId || `PAY-${Date.now()}`,
      TransactionDesc: description || 'Payment',
    };

    const stkResponse = await fetch(
      `${apiUrl}/mpesa/stkpush/v1/processrequest`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stkPayload),
      }
    );

    const stkResult = await stkResponse.json();
    console.log('STK Push response:', stkResult);

    if (stkResult.ResponseCode !== '0') {
      return new Response(
        JSON.stringify({ 
          error: stkResult.ResponseDescription || 'STK Push request failed',
          details: stkResult 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 5: Store transaction in database
    const { data: transaction, error: txError } = await supabaseClient
      .from('transactions')
      .insert({
        user_id: user.id,
        invoice_id: invoiceId || null,
        amount: amount,
        phone_number: formattedPhone,
        transaction_ref: stkResult.CheckoutRequestID,
        status: 'pending',
      })
      .select()
      .single();

    if (txError) {
      console.error('Transaction insert error:', txError);
      return new Response(
        JSON.stringify({ error: 'Failed to record transaction' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ STK Push initiated successfully:', stkResult.CheckoutRequestID);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'STK Push sent successfully. Please check your phone.',
        checkoutRequestId: stkResult.CheckoutRequestID,
        transactionId: transaction?.id,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
