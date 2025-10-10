import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import { createHmac } from "https://deno.land/std@0.190.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, paypal-transmission-id, paypal-transmission-time, paypal-transmission-sig, paypal-cert-url, paypal-auth-algo',
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

    const webhookData = await req.json();
    console.log('Received PayPal webhook:', webhookData.event_type);

    const { event_type, resource } = webhookData;

    // Handle different webhook events
    switch (event_type) {
      case 'CHECKOUT.ORDER.APPROVED':
      case 'PAYMENT.CAPTURE.COMPLETED': {
        const orderId = resource.id || resource.supplementary_data?.related_ids?.order_id;
        
        if (!orderId) {
          console.error('No order ID found in webhook');
          return new Response(
            JSON.stringify({ error: 'Invalid webhook data' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Find the subscription record
        const { data: subscription, error: findError } = await supabaseClient
          .from('subscriptions')
          .select('*')
          .eq('paypal_order_id', orderId)
          .single();

        if (findError || !subscription) {
          console.error('Subscription not found for order:', orderId);
          return new Response(
            JSON.stringify({ error: 'Subscription not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Skip if already processed
        if (subscription.status === 'active') {
          console.log('Subscription already active:', subscription.id);
          return new Response(
            JSON.stringify({ success: true, message: 'Already processed' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Calculate subscription dates (30 days from now)
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);

        // Update subscription status
        const { error: updateError } = await supabaseClient
          .from('subscriptions')
          .update({
            status: 'active',
            paypal_capture_id: resource.id,
            paid_at: new Date().toISOString(),
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            updated_at: new Date().toISOString(),
            metadata: {
              ...subscription.metadata,
              paypal_capture: resource,
            },
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
            amount: subscription.amount,
            currency: subscription.currency,
            status: 'completed',
            payment_method: 'paypal',
            description: `Subscription payment - ${subscription.plan_name}`,
            metadata: {
              subscription_id: subscription.id,
              paypal_order_id: orderId,
              paypal_capture_id: resource.id,
            },
          });

        if (txError) {
          console.error('Failed to create transaction record:', txError);
        }

        console.log(`Subscription activated for user ${subscription.user_id}: ${subscription.plan_name}`);

        return new Response(
          JSON.stringify({ success: true, message: 'Subscription activated' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'PAYMENT.CAPTURE.DENIED':
      case 'CHECKOUT.ORDER.VOIDED': {
        const orderId = resource.id || resource.supplementary_data?.related_ids?.order_id;
        
        const { error: updateError } = await supabaseClient
          .from('subscriptions')
          .update({
            status: 'failed',
            failure_reason: `PayPal: ${event_type}`,
            updated_at: new Date().toISOString(),
          })
          .eq('paypal_order_id', orderId);

        if (updateError) {
          console.error('Failed to update subscription failure:', updateError);
        }

        console.log(`Subscription payment failed for order ${orderId}: ${event_type}`);

        return new Response(
          JSON.stringify({ success: true, message: 'Subscription marked as failed' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        console.log(`Unhandled PayPal webhook event: ${event_type}`);
        return new Response(
          JSON.stringify({ success: true, message: 'Event acknowledged' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error: any) {
    console.error('PayPal webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

