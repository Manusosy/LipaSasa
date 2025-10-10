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

    // ============================================
    // TODO: INTEGRATE WITH AGGREGATOR API
    // ============================================
    // For now, this is a placeholder that simulates the aggregator call
    // Replace this section with actual Lipia Online or chosen aggregator API
    
    const aggregatorApiUrl = Deno.env.get('AGGREGATOR_API_URL') || 'https://api.lipia.online/v1/stk-push';
    const aggregatorApiKey = Deno.env.get('AGGREGATOR_API_KEY') || '';
    
    // Prepare callback URL for this specific payment
    const callbackUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-link-callback`;
    
    // Prepare aggregator STK Push request
    const aggregatorPayload = {
      phone_number: formattedPhone,
      amount: Math.ceil(amount),
      currency: link.currency,
      description: link.description || link.title,
      reference: `link_${link.id}`,
      callback_url: callbackUrl,
      // Settlement details based on payment method
      settlement: {
        type: link.method_type,
        destination: link.method_value,
      },
    };

    console.log('Calling aggregator API...');
    
    // For MVP: Simulate aggregator response
    // TODO: Uncomment when aggregator is configured
    /*
    const aggregatorResponse = await fetch(aggregatorApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${aggregatorApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(aggregatorPayload),
    });

    if (!aggregatorResponse.ok) {
      const errorText = await aggregatorResponse.text();
      console.error('Aggregator API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to initiate payment. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aggregatorResult = await aggregatorResponse.json();
    const checkoutRequestId = aggregatorResult.checkout_request_id;
    */

    // Simulated response for MVP
    const checkoutRequestId = `ws_CO_${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
    
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

