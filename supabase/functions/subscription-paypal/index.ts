import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PayPalSubscriptionRequest {
  user_id: string;
  plan_name: string;
  amount: number;
  currency: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestData: PayPalSubscriptionRequest = await req.json();
    const { user_id, plan_name, amount, currency } = requestData;

    console.log('PayPal subscription request:', { user_id, plan_name, amount, currency });

    // Validate input
    if (!user_id || !plan_name || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get PayPal credentials from admin_payment_settings table
    const { data: settingsData, error: settingsError } = await supabaseClient
      .from('admin_payment_settings')
      .select('settings')
      .eq('payment_gateway', 'paypal')
      .eq('is_active', true)
      .single();

    if (settingsError || !settingsData) {
      console.error('Failed to fetch PayPal credentials:', settingsError);
      return new Response(
        JSON.stringify({ error: 'PayPal payment gateway not configured. Please contact support.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const paypalSettings = settingsData.settings as any;
    const { client_id, client_secret, mode } = paypalSettings;

    if (!client_id || !client_secret) {
      console.error('Incomplete PayPal credentials in admin settings');
      return new Response(
        JSON.stringify({ error: 'PayPal configuration incomplete. Please contact support.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Determine PayPal API base URL based on mode
    const paypalBaseUrl = mode === 'live' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';

    console.log(`Using PayPal ${mode} environment`);

    // Get PayPal access token
    const auth = btoa(`${client_id}:${client_secret}`);
    const tokenResponse = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Failed to get PayPal access token:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to authenticate with PayPal. Please contact support.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { access_token } = await tokenResponse.json();
    console.log('PayPal access token obtained');

    // Create PayPal order
    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: `SUB-${user_id.slice(0, 8)}`,
          description: `LipaSasa ${plan_name} Subscription`,
          amount: {
            currency_code: currency || 'USD',
            value: amount.toFixed(2),
          },
        },
      ],
      application_context: {
        brand_name: 'LipaSasa',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: `${Deno.env.get('SUPABASE_URL').replace('//', '//').replace('supabase.co', 'vercel.app')}/dashboard/subscription?status=success`,
        cancel_url: `${Deno.env.get('SUPABASE_URL').replace('//', '//').replace('supabase.co', 'vercel.app')}/dashboard/subscription?status=cancelled`,
      },
    };

    console.log('Creating PayPal order for subscription:', orderPayload.purchase_units[0].reference_id);

    const orderResponse = await fetch(`${paypalBaseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload),
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      console.error('PayPal order creation failed:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to create PayPal order', details: errorData }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const orderData = await orderResponse.json();
    console.log('PayPal order created:', orderData.id);

    // Store pending subscription in database
    const { error: dbError } = await supabaseClient
      .from('subscriptions')
      .insert({
        user_id: user_id,
        plan_name: plan_name,
        amount: amount,
        currency: currency || 'USD',
        status: 'pending',
        payment_method: 'paypal',
        paypal_order_id: orderData.id,
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
        currency: currency || 'USD',
        payment_method: 'paypal',
        status: 'pending',
        transaction_ref: orderData.id,
      });

    // Extract approval URL for redirect
    const approvalLink = orderData.links.find((link: any) => link.rel === 'approve');

    console.log('✅ PayPal order created, approval URL:', approvalLink?.href);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'PayPal order created',
        order_id: orderData.id,
        approval_url: approvalLink?.href,
        status: orderData.status,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('PayPal subscription error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
