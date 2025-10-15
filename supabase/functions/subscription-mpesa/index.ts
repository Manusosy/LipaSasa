import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubscriptionPaymentRequest {
  user_id: string;
  plan_name: string;
  amount: number;
  phone_number: string;
  currency: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestData: SubscriptionPaymentRequest = await req.json();
    const { user_id, plan_name, amount, phone_number, currency } = requestData;

    console.log('Subscription payment request:', { user_id, plan_name, amount, currency });

    // Validate input
    if (!user_id || !plan_name || !amount || !phone_number) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get M-Pesa credentials from admin_payment_settings table
    const { data: settingsData, error: settingsError } = await supabaseClient
      .from('admin_payment_settings')
      .select('settings')
      .eq('payment_gateway', 'mpesa')
      .eq('is_active', true)
      .single();

    if (settingsError || !settingsData) {
      console.error('Failed to fetch M-Pesa credentials:', settingsError);
      return new Response(
        JSON.stringify({ error: 'M-Pesa payment gateway not configured. Please contact support.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const mpesaSettings = settingsData.settings as any;
    const { consumer_key, consumer_secret, shortcode, passkey, environment } = mpesaSettings;

    if (!consumer_key || !consumer_secret || !shortcode || !passkey) {
      console.error('Incomplete M-Pesa credentials in admin settings');
      return new Response(
        JSON.stringify({ error: 'M-Pesa configuration incomplete. Please contact support.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine API URL based on environment
    const apiUrl = environment === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';

    // Get M-Pesa access token
    console.log('Requesting OAuth token...');
    const auth = btoa(`${consumer_key}:${consumer_secret}`);
    const tokenResponse = await fetch(
      `${apiUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      }
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Failed to get M-Pesa access token:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to authenticate with M-Pesa. Please contact support.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { access_token } = await tokenResponse.json();
    console.log('OAuth token obtained successfully');

    // Prepare STK Push request
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = btoa(`${shortcode}${passkey}${timestamp}`);

    // Format phone number (remove + and spaces, ensure it starts with 254)
    let formattedPhone = phone_number.replace(/[\s\-\+]/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

    // Validate phone number format
    if (!/^254[17]\d{8}$/.test(formattedPhone)) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number format. Use 254XXXXXXXXX' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const stkPushPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(amount), // Ensure integer
      PartyA: formattedPhone,
      PartyB: shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: `${Deno.env.get('SUPABASE_URL')}/functions/v1/subscription-mpesa-callback`,
      AccountReference: `SUB-${user_id.slice(0, 8)}`,
      TransactionDesc: `LipaSasa ${plan_name} Subscription`,
    };

    console.log('Initiating M-Pesa STK Push for subscription:', stkPushPayload.AccountReference);

    const stkResponse = await fetch(
      `${apiUrl}/mpesa/stkpush/v1/processrequest`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stkPushPayload),
      }
    );

    const stkData = await stkResponse.json();
    console.log('STK Push response:', stkData);

    if (!stkResponse.ok || stkData.ResponseCode !== '0') {
      console.error('M-Pesa STK Push failed:', stkData);
      return new Response(
        JSON.stringify({ 
          error: 'Payment initiation failed', 
          details: stkData.CustomerMessage || stkData.errorMessage || stkData.ResponseDescription
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store pending subscription in database
    const { error: dbError } = await supabaseClient
      .from('subscriptions')
      .insert({
        user_id: user_id,
        plan_name: plan_name,
        amount: amount,
        currency: currency || 'KES',
        status: 'pending',
        payment_method: 'mpesa',
        checkout_request_id: stkData.CheckoutRequestID,
        merchant_request_id: stkData.MerchantRequestID,
        phone_number: formattedPhone,
      });

    if (dbError) {
      console.error('Failed to store subscription record:', dbError);
    }

    // Also record in subscription_history
    await supabaseClient
      .from('subscription_history')
      .insert({
        user_id: user_id,
        plan_name: plan_name,
        amount: amount,
        currency: currency || 'KES',
        payment_method: 'mpesa',
        status: 'pending',
        transaction_ref: stkData.CheckoutRequestID,
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payment initiated. Please complete the payment on your phone.',
        checkout_request_id: stkData.CheckoutRequestID,
        merchant_request_id: stkData.MerchantRequestID,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Subscription payment error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
