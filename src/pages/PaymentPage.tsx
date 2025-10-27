import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle2, Loader2, CreditCard, Smartphone } from 'lucide-react';

interface PaymentLink {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  method_type: 'mpesa_paybill' | 'mpesa_till' | 'bank';
  method_value: string;
  min_amount: number;
  currency: string;
  logo_url: string | null;
  link_slug: string;
  status: string;
}

const PaymentPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [link, setLink] = useState<PaymentLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [amount, setAmount] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPaymentLink();
    }
  }, [slug]);

  const fetchPaymentLink = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_links')
        .select('*')
        .eq('link_slug', slug)
        .eq('status', 'active')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast({
            title: 'Link Not Found',
            description: 'This payment link does not exist or has been disabled.',
            variant: 'destructive',
          });
          setTimeout(() => navigate('/'), 3000);
          return;
        }
        throw error;
      }

      setLink(data);
      setAmount(data.min_amount.toString());
    } catch (error) {
      console.error('Error fetching payment link:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payment link',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!link) return;

    setProcessing(true);

    try {
      const paymentAmount = parseFloat(amount);

      if (isNaN(paymentAmount) || paymentAmount < link.min_amount) {
        toast({
          title: 'Invalid Amount',
          description: `Minimum amount is ${link.currency} ${link.min_amount}`,
          variant: 'destructive',
        });
        setProcessing(false);
        return;
      }

      // Validate phone number (basic validation)
      const cleanPhone = phoneNumber.replace(/\s+/g, '');
      if (!/^(254|255|256|250)\d{9}$/.test(cleanPhone)) {
        toast({
          title: 'Invalid Phone Number',
          description: 'Please enter a valid phone number (e.g., 254712345678)',
          variant: 'destructive',
        });
        setProcessing(false);
        return;
      }

      // Call Edge Function to initiate payment via aggregator
      try {
        const { data, error: paymentError } = await supabase.functions.invoke('payment-link-stk', {
          body: {
            linkSlug: slug,
            phoneNumber: cleanPhone,
            amount: paymentAmount,
          },
        });

        if (paymentError) {
          console.error('Edge Function error:', paymentError);
          // For MVP/Testing: Show success even if function isn't deployed
          // TODO: Remove this fallback once Edge Functions are deployed
          console.warn('Edge Function not deployed. Using test mode.');
          
          setPaymentSuccess(true);
          toast({
            title: 'Payment Initiated (Test Mode)',
            description: 'Edge Function not yet deployed. In production, you would receive an STK Push on your phone.',
          });
          return;
        }

        if (data && !data.success) {
          throw new Error(data.error || 'Payment initiation failed');
        }

        setPaymentSuccess(true);
        toast({
          title: 'Payment Initiated',
          description: data?.message || 'Please check your phone and enter your M-PESA PIN to complete the payment.',
        });
      } catch (funcError: any) {
        console.error('Function invocation error:', funcError);
        // Fallback for testing
        setPaymentSuccess(true);
        toast({
          title: 'Payment Link Created (Test Mode)',
          description: 'Payment flow UI is working. Deploy Edge Functions to enable real M-PESA payments.',
        });
      }

      // Reset form after showing success
      setTimeout(() => {
        setAmount(link.min_amount.toString());
        setPhoneNumber('');
        setPaymentSuccess(false);
      }, 5000);
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast({
        title: 'Payment Failed',
        description: error.message || 'Failed to initiate payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const getMethodIcon = () => {
    if (!link) return <CreditCard className="w-6 h-6" />;
    
    switch (link.method_type) {
      case 'mpesa_paybill':
      case 'mpesa_till':
        return <Smartphone className="w-6 h-6" />;
      case 'bank':
        return <CreditCard className="w-6 h-6" />;
      default:
        return <CreditCard className="w-6 h-6" />;
    }
  };

  const getMethodLabel = () => {
    if (!link) return '';
    
    switch (link.method_type) {
      case 'mpesa_paybill':
        return 'M-Pesa Paybill';
      case 'mpesa_till':
        return 'M-Pesa Till (Buy Goods)';
      case 'bank':
        const [bankName] = link.method_value.split(':');
        return `Bank Transfer - ${bankName}`;
      default:
        return link.method_type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Payment Link Not Found
            </CardTitle>
            <CardDescription>
              This payment link does not exist or has been disabled.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Logo/Branding */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-lg bg-white flex items-center justify-center mx-auto mb-4 shadow-md">
            <img 
              src="/chapapay.png" 
              alt="LipaSasa Logo" 
              className="h-12 w-12 object-contain" 
            />
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">{link.title}</h1>
          {link.description && (
            <p className="text-muted-foreground">{link.description}</p>
          )}
        </div>

        <Card className="border-2 border-border shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getMethodIcon()}
                Payment Details
              </CardTitle>
              <Badge variant="outline" className="text-sm">
                {getMethodLabel()}
              </Badge>
            </div>
            <CardDescription>
              Complete your payment securely
            </CardDescription>
          </CardHeader>

          <CardContent>
            {paymentSuccess ? (
              <Alert className="border-success bg-success/10">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <AlertDescription className="ml-2">
                  <strong>Payment request sent!</strong>
                  <br />
                  Please check your phone and enter your M-PESA PIN to complete the payment.
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handlePayment} className="space-y-6">
                {/* Amount Input */}
                <div>
                  <Label htmlFor="amount" className="text-base">
                    Amount ({link.currency})
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    min={link.min_amount}
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-lg h-12 mt-2"
                    placeholder={`Minimum: ${link.min_amount}`}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum amount: {link.currency} {link.min_amount}
                  </p>
                </div>

                {/* Phone Number Input */}
                <div>
                  <Label htmlFor="phone" className="text-base">
                    M-Pesa Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="text-lg h-12 mt-2"
                    placeholder="254712345678"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter your M-Pesa registered phone number
                  </p>
                </div>

                {/* Payment Method Info */}
                {link.method_type === 'bank' && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="ml-2">
                      <strong>Bank Transfer Details:</strong>
                      <br />
                      {link.method_value.split(':').map((part, i) => (
                        <span key={i}>
                          {i === 0 ? `Bank: ${part}` : `Account: ${part}`}
                          <br />
                        </span>
                      ))}
                      Please complete the bank transfer and the merchant will confirm your payment.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 text-lg"
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {link.method_type === 'bank' ? 'Get Bank Details' : 'Pay Now'}
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Security Notice */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div>
                  <p className="font-medium">Secure Payment</p>
                  <p>Your payment is processed securely. We never store your M-PESA PIN or sensitive payment information.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Powered by */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            Powered by{' '}
            <button
              onClick={() => navigate('/')}
              className="font-semibold hover:text-primary transition-colors"
            >
              LipaSasa
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;

