import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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

serve(async (req) => {
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

    // Validate input
    if (!user_id || !plan_name || !amount || !phone_number) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get M-Pesa credentials from admin settings (encrypted)
    const { data: settingsData, error: settingsError } = await supabaseClient
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', 'mpesa_subscription_credentials')
      .single();

    if (settingsError || !settingsData) {
      console.error('Failed to fetch M-Pesa credentials:', settingsError);
      return new Response(
        JSON.stringify({ error: 'Payment service configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const mpesaCredentials = settingsData.setting_value;
    const { consumer_key, consumer_secret, shortcode, passkey } = mpesaCredentials;

    // Get M-Pesa access token
    const auth = btoa(`${consumer_key}:${consumer_secret}`);
    const tokenResponse = await fetch(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      }
    );

    if (!tokenResponse.ok) {
      throw new Error('Failed to get M-Pesa access token');
    }

    const { access_token } = await tokenResponse.json();

    // Prepare STK Push request
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = btoa(`${shortcode}${passkey}${timestamp}`);

    // Format phone number (remove + and ensure it starts with 254)
    const formattedPhone = phone_number.replace(/^\+/, '').replace(/^0/, '254');

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
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
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

    if (!stkResponse.ok || stkData.ResponseCode !== '0') {
      console.error('M-Pesa STK Push failed:', stkData);
      return new Response(
        JSON.stringify({ 
          error: 'Payment initiation failed', 
          details: stkData.CustomerMessage || stkData.errorMessage 
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

