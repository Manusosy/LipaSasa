import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CallbackMetadata {
  Item: Array<{
    Name: string;
    Value: string | number;
  }>;
}

interface StkCallback {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: number;
  ResultDesc: string;
  CallbackMetadata?: CallbackMetadata;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== M-PESA Callback Received ===');
    
    // SECURITY: Validate request origin
    // In production, add IP whitelist for Safaricom IPs or signature verification
    const origin = req.headers.get('origin');
    const userAgent = req.headers.get('user-agent');
    console.log('Request origin:', origin, 'User-Agent:', userAgent);
    
    // Initialize Supabase client with service role key for server-side operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse callback payload
    const callbackPayload = await req.json();
    console.log('Callback payload:', JSON.stringify(callbackPayload, null, 2));

    const stkCallback: StkCallback = callbackPayload.Body?.stkCallback;

    if (!stkCallback) {
      console.error('Invalid callback format - missing stkCallback');
      return new Response(
        JSON.stringify({ error: 'Invalid callback format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = stkCallback;

    console.log('Processing callback:', {
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
    });

    // Find the transaction by CheckoutRequestID
    const { data: transaction, error: findError } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('transaction_ref', CheckoutRequestID)
      .single();

    if (findError || !transaction) {
      console.error('Transaction not found:', CheckoutRequestID, findError);
      // Still return success to M-PESA to avoid retries
      return new Response(
        JSON.stringify({ message: 'Transaction not found but acknowledged' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Transaction found:', transaction.id);

    // Check if transaction is already processed (idempotency)
    if (transaction.status !== 'pending') {
      console.log('Transaction already processed:', transaction.status);
      return new Response(
        JSON.stringify({ message: 'Transaction already processed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine payment status
    const isSuccess = ResultCode === 0;
    const newStatus = isSuccess ? 'completed' : 'failed';

    // Extract metadata if payment was successful
    let mpesaReceiptNumber: string | null = null;
    let amountPaid: number | null = null;

    if (isSuccess && CallbackMetadata?.Item) {
      for (const item of CallbackMetadata.Item) {
        if (item.Name === 'MpesaReceiptNumber') {
          mpesaReceiptNumber = String(item.Value);
        }
        if (item.Name === 'Amount') {
          amountPaid = Number(item.Value);
        }
      }
      console.log('Payment metadata:', { mpesaReceiptNumber, amountPaid });
    }

    // Update transaction
    const { error: updateError } = await supabaseClient
      .from('transactions')
      .update({
        status: newStatus,
        result_code: String(ResultCode),
        result_desc: ResultDesc,
        mpesa_receipt_number: mpesaReceiptNumber,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transaction.id);

    if (updateError) {
      console.error('Failed to update transaction:', updateError);
      throw updateError;
    }

    console.log('Transaction updated:', { id: transaction.id, status: newStatus });

    // Update invoice if applicable
    if (transaction.invoice_id && isSuccess) {
      const { error: invoiceError } = await supabaseClient
        .from('invoices')
        .update({
          status: 'paid',
          updated_at: new Date().toISOString(),
        })
        .eq('id', transaction.invoice_id);

      if (invoiceError) {
        console.error('Failed to update invoice:', invoiceError);
      } else {
        console.log('Invoice marked as paid:', transaction.invoice_id);
      }
    }

    console.log('=== Callback Processing Complete ===');

    // Always return success to M-PESA to avoid retries
    return new Response(
      JSON.stringify({
        ResultCode: 0,
        ResultDesc: 'Success',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Callback processing error:', error);
    
    // Still return success to M-PESA to avoid retries
    return new Response(
      JSON.stringify({
        ResultCode: 0,
        ResultDesc: 'Accepted',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
