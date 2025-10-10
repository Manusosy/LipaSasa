import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const callbackData = await req.json();
    console.log('Received subscription M-Pesa callback:', JSON.stringify(callbackData, null, 2));

    const { Body } = callbackData;
    const { stkCallback } = Body;

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = stkCallback;

    // Find the subscription record
    const { data: subscription, error: findError } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('checkout_request_id', CheckoutRequestID)
      .single();

    if (findError || !subscription) {
      console.error('Subscription not found:', CheckoutRequestID);
      return new Response(
        JSON.stringify({ error: 'Subscription not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Payment successful
    if (ResultCode === 0) {
      const metadata = CallbackMetadata?.Item || [];
      const amount = metadata.find((item: any) => item.Name === 'Amount')?.Value || 0;
      const mpesaReceiptNumber = metadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value || '';
      const transactionDate = metadata.find((item: any) => item.Name === 'TransactionDate')?.Value || '';
      const phoneNumber = metadata.find((item: any) => item.Name === 'PhoneNumber')?.Value || '';

      // Calculate subscription dates (30 days from now)
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      // Update subscription status
      const { error: updateError } = await supabaseClient
        .from('subscriptions')
        .update({
          status: 'active',
          mpesa_receipt_number: mpesaReceiptNumber,
          paid_at: new Date(String(transactionDate)).toISOString(),
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id);

      if (updateError) {
        console.error('Failed to update subscription:', updateError);
      }

      // Update user's plan in profiles
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .update({
          selected_plan: subscription.plan_name,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', subscription.user_id);

      if (profileError) {
        console.error('Failed to update user profile:', profileError);
      }

      // Create transaction record for audit
      const { error: txError } = await supabaseClient
        .from('transactions')
        .insert({
          user_id: subscription.user_id,
          amount: amount,
          currency: subscription.currency,
          status: 'completed',
          payment_method: 'mpesa',
          mpesa_receipt_number: mpesaReceiptNumber,
          phone_number: phoneNumber,
          description: `Subscription payment - ${subscription.plan_name}`,
          metadata: {
            subscription_id: subscription.id,
            merchant_request_id: MerchantRequestID,
            checkout_request_id: CheckoutRequestID,
          },
        });

      if (txError) {
        console.error('Failed to create transaction record:', txError);
      }

      // TODO: Send confirmation email to user
      console.log(`Subscription activated for user ${subscription.user_id}: ${subscription.plan_name}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Subscription activated successfully',
          result_code: ResultCode,
          result_desc: ResultDesc,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      // Payment failed
      const { error: updateError } = await supabaseClient
        .from('subscriptions')
        .update({
          status: 'failed',
          failure_reason: ResultDesc,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id);

      if (updateError) {
        console.error('Failed to update subscription failure:', updateError);
      }

      console.log(`Subscription payment failed for user ${subscription.user_id}: ${ResultDesc}`);

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Payment failed',
          result_code: ResultCode,
          result_desc: ResultDesc,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: any) {
    console.error('Subscription callback error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

