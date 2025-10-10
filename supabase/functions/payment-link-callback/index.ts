import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AggregatorCallback {
  checkout_request_id: string;
  result_code: string;
  result_description: string;
  mpesa_receipt_number?: string;
  transaction_date?: string;
  phone_number?: string;
  amount?: number;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse callback payload from aggregator
    const payload: AggregatorCallback = await req.json();

    console.log('Payment link callback received:', payload);

    const { 
      checkout_request_id, 
      result_code, 
      result_description,
      mpesa_receipt_number,
      phone_number,
      amount 
    } = payload;

    // Find the transaction by checkout request ID
    const { data: transaction, error: txFetchError } = await supabaseClient
      .from('transactions')
      .select('*, payment_links(*)')
      .eq('transaction_ref', checkout_request_id)
      .single();

    if (txFetchError || !transaction) {
      console.error('Transaction not found:', checkout_request_id, txFetchError);
      return new Response(
        JSON.stringify({ error: 'Transaction not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine if payment was successful
    const isSuccessful = result_code === '0';
    const status = isSuccessful ? 'completed' : 'failed';

    // Update transaction status
    const { error: updateError } = await supabaseClient
      .from('transactions')
      .update({
        status,
        result_code,
        result_desc: result_description,
        mpesa_receipt_number: mpesa_receipt_number || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transaction.id);

    if (updateError) {
      console.error('Failed to update transaction:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update transaction' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Transaction ${transaction.id} updated to ${status}`);

    // TODO: Optionally trigger webhook to merchant if they have one configured
    // This would notify the merchant's system about the payment status

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Callback processed successfully',
        transaction_id: transaction.id,
        status,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Unexpected error in callback:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

