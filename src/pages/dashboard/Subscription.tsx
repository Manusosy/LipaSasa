import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Crown, 
  Check,
  TrendingUp,
  Zap,
  Rocket,
  ArrowRight,
  Loader2,
  AlertCircle,
  CreditCard,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { usePricing } from '@/hooks/use-pricing';
import { requireMerchant } from '@/lib/auth-utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const Subscription = () => {
  const [currentPlan, setCurrentPlan] = useState('free');
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'paypal'>('mpesa');
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { tiers, loading: pricingLoading, getPlanPrice, formatPrice, getPlanById } = usePricing();

  useEffect(() => {
    const checkAccess = async () => {
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/auth');
        return;
      }

      // Check if user is a merchant (not admin)
      const hasAccess = await requireMerchant(navigate);
      if (!hasAccess) {
        return; // User will be redirected to admin dashboard
      }

      fetchSubscriptionData();

      // Check if redirected from pricing page with selected plan
      const state = location.state as { selectedPlan?: string; billingCycle?: 'monthly' | 'annual' } | null;
      if (state?.selectedPlan) {
        setSelectedTier(state.selectedPlan);
        setBillingCycle(state.billingCycle || 'monthly');
        setShowCheckoutDialog(true);
      }
    };

    checkAccess();
  }, [navigate, location]);

  const fetchSubscriptionData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user profile for current plan
      const { data: profile } = await supabase
        .from('profiles')
        .select('selected_plan, phone')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setCurrentPlan(profile.selected_plan || 'free');
        setPhoneNumber(profile.phone || '');
      }

      // Count user's invoices for current month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const { count } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', firstDayOfMonth.toISOString());

      setInvoiceCount(count || 0);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscription data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeClick = (tierName: string) => {
    const tier = getPlanById(tierName);
    if (!tier) return;

    if (tier.tier_name === 'free') {
      toast({
        title: 'Already on Free Plan',
        description: 'You are already on the Free plan',
      });
      return;
    }

    if (tierName === currentPlan) {
      toast({
        title: 'Current Plan',
        description: `You are already on the ${tier.display_name} plan`,
      });
      return;
    }

    setSelectedTier(tierName);
    setShowCheckoutDialog(true);
  };

  const handleCheckout = async () => {
    if (!selectedTier) return;

    const tier = getPlanById(selectedTier);
    if (!tier) return;

    setUpgrading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const amount = getPlanPrice(selectedTier, billingCycle, 'KSH');

      if (paymentMethod === 'mpesa') {
        if (!phoneNumber || phoneNumber.length < 10) {
          toast({
            title: 'Phone Number Required',
            description: 'Please enter a valid M-Pesa phone number',
            variant: 'destructive',
          });
          setUpgrading(false);
          return;
        }

        // Call M-Pesa STK Push edge function
        const { data, error } = await supabase.functions.invoke('subscription-mpesa', {
          body: {
            user_id: user.id,
            plan_name: selectedTier,
            amount: amount,
            phone_number: phoneNumber,
            currency: 'KES',
          },
        });

        if (error) throw error;

        toast({
          title: 'Payment Initiated',
          description: 'Check your phone for M-Pesa STK Push prompt',
        });

        setShowCheckoutDialog(false);
        
        // Poll for payment status
        pollPaymentStatus(data.checkout_request_id);
        
      } else if (paymentMethod === 'paypal') {
        // Call PayPal subscription edge function
        const { data, error } = await supabase.functions.invoke('subscription-paypal', {
          body: {
            user_id: user.id,
            plan_name: selectedTier,
            amount: amount,
            currency: 'USD', // PayPal uses USD
          },
        });

        if (error) throw error;

        // Redirect to PayPal
        if (data.approval_url) {
          window.location.href = data.approval_url;
        }
      }

    } catch (error: any) {
      console.error('Error processing subscription:', error);
      toast({
        title: 'Checkout Failed',
        description: error.message || 'Failed to process subscription',
        variant: 'destructive',
      });
    } finally {
      setUpgrading(false);
    }
  };

  const pollPaymentStatus = async (checkoutRequestId: string) => {
    let attempts = 0;
    const maxAttempts = 30; // Poll for 1 minute (2 second intervals)

    const interval = setInterval(async () => {
      attempts++;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          clearInterval(interval);
          return;
        }

        // Check subscription status
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('status, plan')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (subscription && subscription.status === 'active') {
          clearInterval(interval);
          toast({
            title: 'Subscription Activated!',
            description: `You are now on the ${subscription.plan} plan`,
          });
          fetchSubscriptionData();
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          toast({
            title: 'Payment Pending',
            description: 'Your payment is being processed. Please check back in a few minutes.',
          });
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
      }
    }, 2000);
  };

  const getPlanIcon = (tierName: string) => {
    switch (tierName) {
      case 'free':
        return <Zap className="w-6 h-6" />;
      case 'professional':
        return <TrendingUp className="w-6 h-6" />;
      case 'enterprise':
        return <Rocket className="w-6 h-6" />;
      default:
        return <Crown className="w-6 h-6" />;
    }
  };

  const getCurrentPlanLimit = () => {
    const plan = getPlanById(currentPlan);
    return plan?.max_invoices || 10;
  };

  if (loading || pricingLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const planLimit = getCurrentPlanLimit();
  const usagePercentage = planLimit > 0 ? (invoiceCount / planLimit) * 100 : 0;

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileMenuOpen={mobileMenuOpen}
        onMobileMenuClose={() => setMobileMenuOpen(false)}
      />

      <main
        className={cn(
          'flex-1 transition-all duration-300 w-full',
          'ml-0 lg:ml-20',
          !sidebarCollapsed && 'lg:ml-64'
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
              <div>
                <h1 className="text-lg lg:text-xl font-bold text-foreground">Subscription & Billing</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Manage your plan and billing
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-6 max-w-6xl mx-auto">
          {/* Current Plan Status */}
          <Card className="border border-border mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-primary" />
                    Current Plan
                  </CardTitle>
                  <CardDescription>
                    You are currently on the {getPlanById(currentPlan)?.display_name || 'Free'} plan
                  </CardDescription>
                </div>
                <Badge className="bg-primary text-primary-foreground text-base px-4 py-2 capitalize">
                  {currentPlan}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Usage Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                      Invoice Usage This Month
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {invoiceCount} / {planLimit === null ? '∞' : planLimit}
                    </span>
                  </div>
                  {planLimit !== null && (
                    <>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div
                          className={cn(
                            'h-3 rounded-full transition-all',
                            usagePercentage >= 90 ? 'bg-destructive' : 'bg-primary'
                          )}
                          style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                        />
                      </div>
                      {usagePercentage >= 90 && (
                        <Alert className="mt-4" variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            ⚠️ You're approaching your invoice limit. Consider upgrading to continue creating invoices.
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing Cycle Toggle */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
              <Button
                variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setBillingCycle('monthly')}
              >
                Monthly
              </Button>
              <Button
                variant={billingCycle === 'annual' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setBillingCycle('annual')}
              >
                Annual
                <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                  Save 17%
                </span>
              </Button>
            </div>
          </div>

          {/* Available Plans */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Available Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tiers.map((tier) => {
                const monthlyPrice = getPlanPrice(tier.tier_name, 'monthly', 'KSH');
                const annualPrice = getPlanPrice(tier.tier_name, 'annual', 'KSH');
                const price = billingCycle === 'monthly' ? monthlyPrice : annualPrice;
                const isCurrentPlan = tier.tier_name === currentPlan;
                const isPopular = tier.tier_name === 'professional';

                return (
                  <Card
                    key={tier.id}
                    className={cn(
                      'border transition-all relative',
                      isCurrentPlan && 'border-primary shadow-lg',
                      isPopular && !isCurrentPlan && 'border-primary/50'
                    )}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground px-3">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3 text-primary">
                        {getPlanIcon(tier.tier_name)}
                      </div>
                      <CardTitle>{tier.display_name}</CardTitle>
                      <div className="mt-4">
                        <span className="text-4xl font-bold text-foreground">
                          {formatPrice(price, 'KSH').replace('KSh ', 'KSh ')}
                        </span>
                        <span className="text-muted-foreground">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                        {billingCycle === 'annual' && price > 0 && (
                          <div className="text-sm text-green-600 mt-1">
                            Save 17% with annual billing
                          </div>
                        )}
                      </div>
                      <CardDescription className="mt-2">
                        {tier.max_invoices
                          ? `${tier.max_invoices} invoices per month`
                          : 'Unlimited invoices'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-6">
                        {tier.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <span className="text-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      {isCurrentPlan ? (
                        <Button variant="outline" disabled className="w-full">
                          Current Plan
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          variant={isPopular ? 'default' : 'outline'}
                          onClick={() => handleUpgradeClick(tier.tier_name)}
                          disabled={upgrading}
                        >
                          {tier.tier_name === 'free' ? 'Downgrade' : tier.tier_name === 'enterprise' ? 'Contact Sales' : 'Upgrade'}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* FAQ/Info */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-base">Billing Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground mb-1">How billing works:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Plans are billed in KSh via M-PESA or internationally via PayPal</li>
                  <li>Invoice limits reset on the 1st of each month</li>
                  <li>You can upgrade or downgrade at any time</li>
                  <li>Pro-rated charges apply for mid-month upgrades</li>
                  <li>Annual billing provides 17% discount</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Payment process:</p>
                <p>
                  When you upgrade, you can choose M-PESA (for Kenya) or PayPal (international). 
                  For M-PESA, you'll receive an STK Push notification on your phone. 
                  Enter your PIN to complete the payment, and your plan will be upgraded immediately.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Checkout Dialog */}
      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Subscription</DialogTitle>
            <DialogDescription>
              {selectedTier && getPlanById(selectedTier) && (
                <>
                  Upgrading to <strong>{getPlanById(selectedTier)?.display_name}</strong> plan
                  <div className="mt-2 text-lg font-bold text-foreground">
                    {formatPrice(getPlanPrice(selectedTier, billingCycle, 'KSH'), 'KSH')}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Payment Method Selection */}
            <div className="space-y-3">
              <Label>Select Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'mpesa' | 'paypal')}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="mpesa" id="mpesa" />
                  <Label htmlFor="mpesa" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      <span>M-PESA (Kenya)</span>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      <span>PayPal (International)</span>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* M-PESA Phone Number */}
            {paymentMethod === 'mpesa' && (
              <div className="space-y-2">
                <Label htmlFor="phone">M-PESA Phone Number</Label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="254712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <p className="text-xs text-muted-foreground">
                  Enter your Safaricom number in format: 254XXXXXXXXX
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCheckoutDialog(false)}
              disabled={upgrading}
            >
              Cancel
            </Button>
            <Button onClick={handleCheckout} disabled={upgrading}>
              {upgrading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Pay {formatPrice(selectedTier ? getPlanPrice(selectedTier, billingCycle, 'KSH') : 0, 'KSH')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Subscription;
