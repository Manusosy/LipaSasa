import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StkPushRequest {
  linkSlug: string;
  phoneNumber: string;
  amount: number;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client (service role for fetching payment link data without auth)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body
    const { linkSlug, phoneNumber, amount }: StkPushRequest = await req.json();

    console.log('Payment link STK Push request:', { linkSlug, phoneNumber, amount });

    // Validate inputs
    if (!linkSlug || !phoneNumber || !amount) {
      return new Response(
        JSON.stringify({ error: 'Link slug, phone number, and amount are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch payment link details
    const { data: link, error: linkError } = await supabaseClient
      .from('payment_links')
      .select('*')
      .eq('link_slug', linkSlug)
      .eq('status', 'active')
      .single();

    if (linkError || !link) {
      console.error('Payment link fetch error:', linkError);
      return new Response(
        JSON.stringify({ error: 'Payment link not found or inactive' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate amount against minimum
    if (amount < link.min_amount) {
      return new Response(
        JSON.stringify({ error: `Amount must be at least ${link.currency} ${link.min_amount}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format phone number (remove + or leading 0, ensure East African format)
    let formattedPhone = phoneNumber.replace(/[\s\-\+]/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    }
    if (!formattedPhone.startsWith('254') && !formattedPhone.startsWith('255') && 
        !formattedPhone.startsWith('256') && !formattedPhone.startsWith('250')) {
      formattedPhone = '254' + formattedPhone;
    }

    // Validate East African phone number format
    if (!/^(254|255|256|250)[17]\d{8}$/.test(formattedPhone)) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number format. Use format like 254712345678' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch merchant's M-PESA credentials
    const { data: credentials, error: credError } = await supabaseClient
      .from('mpesa_credentials')
      .select('*')
      .eq('user_id', link.user_id)
      .eq('is_active', true)
      .single();

    if (credError || !credentials) {
      console.error('Credentials fetch error:', credError);
      return new Response(
        JSON.stringify({ error: 'M-PESA credentials not configured. Please contact the merchant.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine API URL based on environment
    const apiUrl = credentials.environment === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';

    console.log(`Using ${credentials.environment || 'sandbox'} environment`);

    // Step 1: Get OAuth token from Safaricom
    console.log('Requesting OAuth token...');
    const auth = btoa(`${credentials.consumer_key}:${credentials.consumer_secret}`);
    
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
        JSON.stringify({ error: 'Failed to authenticate with M-PESA. Please contact the merchant.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { access_token } = await tokenResponse.json();
    console.log('OAuth token obtained successfully');

    // Step 2: Generate STK Push password
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = btoa(`${credentials.shortcode}${credentials.passkey}${timestamp}`);

    // Step 3: Prepare callback URL
    const callbackUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-link-callback`;

    // Step 4: Send STK Push request
    console.log('Sending STK Push request...');
    const stkPayload = {
      BusinessShortCode: credentials.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(amount),
      PartyA: formattedPhone,
      PartyB: credentials.shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: `LINK-${link.id.substring(0, 8)}`,
      TransactionDesc: link.description || link.title,
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

    const checkoutRequestId = stkResult.CheckoutRequestID;
    
    console.log('Payment initiated via aggregator:', checkoutRequestId);

    // Store transaction in database
    const { data: transaction, error: txError } = await supabaseClient
      .from('transactions')
      .insert({
        user_id: link.user_id,
        link_id: link.id,
        amount: amount,
        phone_number: formattedPhone,
        transaction_ref: checkoutRequestId,
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

    console.log('Transaction recorded:', transaction.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payment request sent. Please check your phone and enter your M-PESA PIN.',
        checkoutRequestId: checkoutRequestId,
        transactionId: transaction.id,
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

