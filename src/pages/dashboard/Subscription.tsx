import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Check,
  TrendingUp,
  Zap,
  Rocket,
  ArrowRight,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Plan {
  id: string;
  name: string;
  price: number;
  invoiceLimit: number;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    invoiceLimit: 10,
    features: [
      '10 invoices per month',
      'M-PESA STK Push',
      'Basic analytics',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 1500,
    invoiceLimit: 100,
    popular: true,
    features: [
      '100 invoices per month',
      'M-PESA STK Push',
      'Advanced analytics',
      'API access',
      'Priority support',
      'Custom branding',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 5000,
    invoiceLimit: -1,
    features: [
      'Unlimited invoices',
      'M-PESA STK Push',
      'Advanced analytics',
      'API access',
      'Priority support',
      'Custom branding',
      'Dedicated account manager',
      'Custom integrations',
    ],
  },
];

const Subscription = () => {
  const [currentPlan, setCurrentPlan] = useState('starter');
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate('/auth');
      } else {
        fetchSubscriptionData();
      }
    });
  }, [navigate]);

  const fetchSubscriptionData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user profile for current plan
      const { data: profile } = await supabase
        .from('profiles')
        .select('selected_plan')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setCurrentPlan(profile.selected_plan || 'starter');
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

  const handleUpgrade = async (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    if (plan.price === 0) {
      toast({
        title: 'Already on Starter',
        description: 'You are already on the Starter plan',
      });
      return;
    }

    setUpgrading(true);
    try {
      // TODO: Implement STK Push for plan upgrade
      // This would trigger M-PESA payment to LipaSasa's paybill
      toast({
        title: 'Upgrade Initiated',
        description: `Check your phone for STK Push prompt (KSh ${plan.price})`,
      });

      // After successful payment, update user's plan
      // This would be done via callback from M-PESA
    } catch (error: any) {
      console.error('Error upgrading plan:', error);
      toast({
        title: 'Upgrade Failed',
        description: error.message || 'Failed to initiate upgrade',
        variant: 'destructive',
      });
    } finally {
      setUpgrading(false);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'starter':
        return <Zap className="w-6 h-6" />;
      case 'pro':
        return <TrendingUp className="w-6 h-6" />;
      case 'enterprise':
        return <Rocket className="w-6 h-6" />;
      default:
        return <Crown className="w-6 h-6" />;
    }
  };

  const getCurrentPlanLimit = () => {
    const plan = plans.find(p => p.id === currentPlan);
    return plan?.invoiceLimit || 10;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
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
                    You are currently on the {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} plan
                  </CardDescription>
                </div>
                <Badge className="bg-primary text-primary-foreground text-base px-4 py-2">
                  {currentPlan.toUpperCase()}
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
                      {invoiceCount} / {planLimit === -1 ? '∞' : planLimit}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className={cn(
                        'h-3 rounded-full transition-all',
                        usagePercentage >= 90 ? 'bg-destructive' : 'bg-primary'
                      )}
                      style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    />
                  </div>
                  {usagePercentage >= 90 && planLimit > 0 && (
                    <p className="text-xs text-destructive mt-2">
                      ⚠️ You're approaching your invoice limit. Consider upgrading.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Plans */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Available Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={cn(
                    'border transition-all relative',
                    plan.id === currentPlan && 'border-primary shadow-lg',
                    plan.popular && 'border-primary'
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-3">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3 text-primary">
                      {getPlanIcon(plan.id)}
                    </div>
                    <CardTitle>{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-foreground">
                        KSh {plan.price.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <CardDescription className="mt-2">
                      {plan.invoiceLimit === -1
                        ? 'Unlimited invoices'
                        : `${plan.invoiceLimit} invoices per month`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span className="text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {plan.id === currentPlan ? (
                      <Button variant="outline" disabled className="w-full">
                        Current Plan
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        variant={plan.popular ? 'default' : 'outline'}
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={upgrading}
                      >
                        {plan.price === 0 ? 'Downgrade' : 'Upgrade'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
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
                  <li>All plans are billed monthly via M-PESA STK Push</li>
                  <li>Invoice limits reset on the 1st of each month</li>
                  <li>You can upgrade or downgrade at any time</li>
                  <li>Pro-rated charges apply for mid-month upgrades</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Payment process:</p>
                <p>
                  When you upgrade, you'll receive an M-PESA STK Push notification on your
                  phone. Enter your PIN to complete the payment, and your plan will be upgraded
                  immediately.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Subscription;
