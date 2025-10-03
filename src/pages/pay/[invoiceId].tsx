import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, Phone, CreditCard } from "lucide-react";
import { phoneNumberSchema } from "@/lib/validations";

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string | null;
  amount: number;
  currency: string;
  description: string | null;
  status: string;
  created_at: string;
  expires_at: string | null;
  user_id: string;
}

const PayInvoice = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "pending" | "success" | "failed">("idle");
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);

  // Fetch invoice details
  useEffect(() => {
    const fetchInvoice = async () => {
      if (!invoiceId) return;

      try {
        const { data, error } = await supabase
          .from("invoices")
          .select("*")
          .eq("id", invoiceId)
          .single();

        if (error) throw error;

        setInvoice(data);

        // Check if invoice is already paid or expired
        if (data.status === "paid") {
          setPaymentStatus("success");
        } else if (data.expires_at && new Date(data.expires_at) < new Date()) {
          toast.error("This invoice has expired");
        }
      } catch (error: any) {
        console.error("Error fetching invoice:", error);
        toast.error("Invoice not found");
        setTimeout(() => navigate("/"), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId, navigate]);

  // Poll payment status
  useEffect(() => {
    if (!checkoutRequestId || paymentStatus !== "pending") return;

    const pollInterval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from("transactions")
          .select("status")
          .eq("transaction_ref", checkoutRequestId)
          .single();

        if (error) throw error;

        if (data.status === "completed") {
          setPaymentStatus("success");
          toast.success("Payment received successfully!");
          clearInterval(pollInterval);
          
          // Refresh invoice status
          if (invoiceId) {
            const { data: invoiceData } = await supabase
              .from("invoices")
              .select("*")
              .eq("id", invoiceId)
              .single();
            
            if (invoiceData) setInvoice(invoiceData);
          }
        } else if (data.status === "failed") {
          setPaymentStatus("failed");
          toast.error("Payment failed. Please try again.");
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error("Error polling payment status:", error);
      }
    }, 3000); // Poll every 3 seconds

    // Stop polling after 2 minutes
    const timeout = setTimeout(() => {
      clearInterval(pollInterval);
      if (paymentStatus === "pending") {
        setPaymentStatus("failed");
        toast.error("Payment timeout. Please try again.");
      }
    }, 120000);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(timeout);
    };
  }, [checkoutRequestId, paymentStatus, invoiceId]);

  const handlePayment = async () => {
    if (!invoice || !phoneNumber) {
      toast.error("Please enter your phone number");
      return;
    }

    // Validate phone number using Zod schema
    const phoneValidation = phoneNumberSchema.safeParse(phoneNumber.trim());
    if (!phoneValidation.success) {
      toast.error(phoneValidation.error.errors[0].message);
      return;
    }

    setProcessing(true);
    setPaymentStatus("pending");
    
    const validatedPhone = phoneValidation.data;

    try {
      // Call STK Push edge function
      const { data, error } = await supabase.functions.invoke("mpesa-stk-push", {
        body: {
          invoiceId: invoice.id,
          phoneNumber: validatedPhone,
          amount: invoice.amount,
          description: invoice.description || `Payment for ${invoice.invoice_number}`,
        },
      });

      if (error) throw error;

      if (data.success) {
        setCheckoutRequestId(data.checkoutRequestId);
        toast.success("Payment request sent! Please check your phone.");
      } else {
        throw new Error(data.error || "Failed to initiate payment");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Failed to initiate payment. Please try again.");
      setPaymentStatus("failed");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-6 w-6" />
              Invoice Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">This invoice does not exist or has been deleted.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12 px-4">
      <div className="container max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">LipaSasa</h1>
          <p className="text-muted-foreground">Secure Payment Portal</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <CardTitle>Invoice #{invoice.invoice_number}</CardTitle>
            <CardDescription>
              From: Merchant | To: {invoice.customer_name}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Invoice Details */}
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Customer Name</p>
                  <p className="font-medium">{invoice.customer_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Invoice Date</p>
                  <p className="font-medium">{new Date(invoice.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {invoice.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">{invoice.description}</p>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <p className="text-2xl font-bold">Total Amount</p>
                  <p className="text-3xl font-bold text-primary">
                    {invoice.currency} {invoice.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            {paymentStatus === "success" ? (
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
                <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-2">Payment Successful!</h3>
                <p className="text-green-700 dark:text-green-300">
                  Your payment has been received and the invoice has been marked as paid.
                </p>
              </div>
            ) : paymentStatus === "failed" ? (
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
                <XCircle className="h-16 w-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">Payment Failed</h3>
                <p className="text-red-700 dark:text-red-300 mb-4">
                  The payment was not completed. Please try again.
                </p>
                <Button onClick={() => setPaymentStatus("idle")} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : paymentStatus === "pending" ? (
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
                <Loader2 className="h-16 w-16 text-blue-600 dark:text-blue-400 mx-auto mb-4 animate-spin" />
                <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">Processing Payment...</h3>
                <p className="text-blue-700 dark:text-blue-300">
                  Please check your phone and enter your M-PESA PIN to complete the payment.
                </p>
              </div>
            ) : (
              <>
                {/* Payment Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Phone className="inline h-4 w-4 mr-1" />
                      M-PESA Phone Number
                    </label>
                    <Input
                      type="tel"
                      placeholder="e.g., 0712345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={processing}
                      className="text-lg"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter the phone number to receive the payment prompt
                    </p>
                  </div>

                  <Button
                    onClick={handlePayment}
                    disabled={processing || !phoneNumber || invoice.status === "paid"}
                    className="w-full text-lg h-12"
                    size="lg"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Initiating Payment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-5 w-5" />
                        Pay {invoice.currency} {invoice.amount.toLocaleString()}
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  <p>🔒 Secure payment powered by M-PESA</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PayInvoice;
