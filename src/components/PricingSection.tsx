import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, CreditCard, FileText, Zap, Shield, BarChart3, Users, Webhook, Clock, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePricing } from '@/hooks/use-pricing';
import { supabase } from '@/integrations/supabase/client';

const features = [
  {
    category: 'Core Features',
    icon: CreditCard,
    items: [
      { name: 'M-Pesa STK Push Integration', starter: true, pro: true, enterprise: true },
      { name: 'Invoice Generation', starter: '10/mo', pro: '100/mo', enterprise: 'Unlimited' },
      { name: 'Payment Links', starter: true, pro: true, enterprise: true },
      { name: 'Automated Receipts', starter: true, pro: true, enterprise: true },
      { name: 'Multiple Payment Methods', starter: false, pro: true, enterprise: true },
      { name: 'Airtel Money Integration', starter: false, pro: true, enterprise: true },
      { name: 'Bank Transfer Support', starter: false, pro: false, enterprise: true },
    ],
  },
  {
    category: 'Dashboard & Reporting',
    icon: BarChart3,
    items: [
      { name: 'Basic Dashboard', starter: true, pro: true, enterprise: true },
      { name: 'Advanced Analytics', starter: false, pro: true, enterprise: true },
      { name: 'Custom Reports', starter: false, pro: true, enterprise: true },
      { name: 'Export Data (CSV/PDF)', starter: false, pro: true, enterprise: true },
      { name: 'Real-time Notifications', starter: false, pro: true, enterprise: true },
      { name: 'Custom Branding', starter: false, pro: true, enterprise: true },
    ],
  },
  {
    category: 'Developer Tools',
    icon: Webhook,
    items: [
      { name: 'API Access', starter: false, pro: true, enterprise: true },
      { name: 'Webhooks', starter: false, pro: true, enterprise: true },
      { name: 'API Rate Limit', starter: '-', pro: '300/min', enterprise: '1000/min' },
      { name: 'Sandbox Environment', starter: false, pro: true, enterprise: true },
      { name: 'Custom Integrations', starter: false, pro: false, enterprise: true },
      { name: 'Dedicated IP', starter: false, pro: false, enterprise: true },
    ],
  },
  {
    category: 'Support & Security',
    icon: Shield,
    items: [
      { name: 'Email Support', starter: '48h', pro: '4h', enterprise: '1h' },
      { name: 'Priority Support', starter: false, pro: true, enterprise: true },
      { name: '24/7 Phone Support', starter: false, pro: false, enterprise: true },
      { name: 'Dedicated Account Manager', starter: false, pro: false, enterprise: true },
      { name: 'SSL Encryption', starter: true, pro: true, enterprise: true },
      { name: 'Two-Factor Authentication', starter: true, pro: true, enterprise: true },
      { name: 'Advanced Security Features', starter: false, pro: true, enterprise: true },
      { name: 'SLA Guarantee', starter: false, pro: false, enterprise: '99.9%' },
    ],
  },
  {
    category: 'Team & Collaboration',
    icon: Users,
    items: [
      { name: 'Team Members', starter: '1', pro: '5', enterprise: 'Unlimited' },
      { name: 'Role-Based Access', starter: false, pro: true, enterprise: true },
      { name: 'Activity Logs', starter: false, pro: true, enterprise: true },
      { name: 'Approval Workflows', starter: false, pro: false, enterprise: true },
    ],
  },
];

export const PricingSection = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [currency, setCurrency] = useState<'KSH' | 'USD'>('KSH');
  const navigate = useNavigate();
  const { tiers, loading, formatPrice, getPlanPrice, getAnnualDiscount, convertToUSD } = usePricing();

  const handleSelectPlan = async (tierName: string) => {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // Store selected plan in sessionStorage for after login
      sessionStorage.setItem('selectedPlan', tierName);
      sessionStorage.setItem('selectedBillingCycle', billingCycle);
      navigate('/get-started');
    } else {
      // User is authenticated, go to subscription page
      navigate('/dashboard/subscription', { 
        state: { selectedPlan: tierName, billingCycle } 
      });
    }
  };

  const renderFeatureValue = (value: any) => {
    if (value === true) return <Check className="h-5 w-5 text-primary mx-auto" />;
    if (value === false || value === '-') return <X className="h-5 w-5 text-muted-foreground mx-auto" />;
    return <span className="text-sm text-foreground">{value}</span>;
  };

  if (loading) {
    return (
      <section className="py-24 bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading pricing...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 via-white to-slate-50" id="pricing">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
            Pricing & Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Transparent pricing with no hidden fees. Start free, upgrade as you grow. All paid plans include a 14-day free trial.
          </p>
          
          {/* Currency and Billing Toggles */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
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
            
            <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
              <Button
                variant={currency === 'KSH' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrency('KSH')}
              >
                KSh
              </Button>
              <Button
                variant={currency === 'USD' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrency('USD')}
              >
                USD
              </Button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
          {tiers.map((tier, index) => {
            const monthlyPrice = getPlanPrice(tier.tier_name, 'monthly', currency);
            const annualPrice = getPlanPrice(tier.tier_name, 'annual', currency);
            const price = billingCycle === 'monthly' ? monthlyPrice : annualPrice;
            const isPopular = tier.tier_name === 'professional';
            const discount = getAnnualDiscount(monthlyPrice, annualPrice);

            return (
              <Card
                key={tier.id}
                className={`relative shadow-lg hover:shadow-xl transition-all ${
                  isPopular ? 'ring-2 ring-primary scale-105' : ''
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                      ⭐ Most Popular
                    </span>
                  </div>
                )}

                <CardHeader className="text-center pt-8">
                  <CardTitle className="text-2xl mb-2">{tier.display_name}</CardTitle>
                  <div className="mb-4">
                    {tier.tier_name === 'free' ? (
                      <div>
                        <span className="text-5xl font-bold">Free</span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-center mb-1">
                          <span className="text-2xl font-medium">{currency === 'KSH' ? 'KSh' : '$'}</span>
                          <span className="text-5xl font-bold mx-2">
                            {currency === 'KSH' 
                              ? price.toLocaleString() 
                              : price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            }
                          </span>
                          <span className="text-muted-foreground">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                        </div>
                        {billingCycle === 'annual' && (
                          <div className="text-sm text-green-600 font-medium">
                            Save {discount}% with annual billing
                          </div>
                        )}
                        {currency === 'KSH' && (
                          <div className="text-sm text-muted-foreground mt-1">
                            ~${convertToUSD(price).toFixed(2)} {billingCycle === 'monthly' ? '/month' : '/year'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <CardDescription className="text-base">
                    {tier.max_invoices ? `${tier.max_invoices} invoices/month` : 'Unlimited invoices'}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={isPopular ? 'default' : 'outline'}
                    size="lg"
                    className="w-full"
                    onClick={() => handleSelectPlan(tier.tier_name)}
                  >
                    {tier.tier_name === 'free' ? 'Start Free' : tier.tier_name === 'enterprise' ? 'Contact Sales' : 'Start Trial'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Detailed Feature Comparison */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Detailed Feature Comparison
            </h3>
            <p className="text-lg text-muted-foreground">
              See exactly what's included in each plan
            </p>
          </div>

          <div className="space-y-12">
            {features.map((featureGroup) => (
              <div key={featureGroup.category} className="bg-white rounded-xl shadow-soft overflow-hidden">
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 border-b">
                  <div className="flex items-center gap-3">
                    <featureGroup.icon className="h-6 w-6 text-primary" />
                    <h4 className="text-xl font-semibold text-foreground">{featureGroup.category}</h4>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-slate-50">
                        <th className="text-left p-4 font-semibold text-foreground w-1/2">Feature</th>
                        <th className="text-center p-4 font-semibold text-foreground w-1/6">Starter</th>
                        <th className="text-center p-4 font-semibold text-primary w-1/6">Professional</th>
                        <th className="text-center p-4 font-semibold text-foreground w-1/6">Enterprise</th>
                      </tr>
                    </thead>
                    <tbody>
                      {featureGroup.items.map((item, idx) => (
                        <tr key={idx} className="border-b last:border-b-0 hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 text-muted-foreground">{item.name}</td>
                          <td className="p-4 text-center">{renderFeatureValue(item.starter)}</td>
                          <td className="p-4 text-center bg-primary/5">{renderFeatureValue(item.pro)}</td>
                          <td className="p-4 text-center">{renderFeatureValue(item.enterprise)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ / Additional Info */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Still Have Questions?</h3>
            <p className="text-muted-foreground mb-6">
              Our team is here to help you choose the right plan for your business
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button variant="outline" size="lg" onClick={() => navigate('/contact')}>
                Contact Sales
              </Button>
              <Button variant="default" size="lg" onClick={() => navigate('/docs')}>
                View API Docs
              </Button>
            </div>
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Secure & Compliant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Enterprise-grade security with SSL encryption and PCI DSS compliance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">14-Day Free Trial</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Try any paid plan risk-free. No credit card required to start.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Cancel Anytime</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No long-term contracts. Upgrade, downgrade, or cancel anytime.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
