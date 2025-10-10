import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, CreditCard, FileText, Zap, Shield, BarChart3, Users, Webhook, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    name: 'Starter',
    price: '0',
    priceKES: '0',
    description: 'Perfect for small businesses testing the waters.',
    features: [
      '10 invoices/month',
      'M-Pesa STK Push',
      'Basic dashboard',
      'Email support (48h response)',
      'Payment links',
      'Standard receipts',
    ],
    limits: {
      invoices: '10/month',
      transactions: 'Unlimited',
      apiAccess: false,
      support: 'Email (48h)',
      teamMembers: '1',
    },
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Professional',
    price: '29',
    priceKES: '1,500',
    description: 'For growing businesses that need more power and features.',
    features: [
      '100 invoices/month',
      'M-Pesa STK Push',
      'Advanced analytics & reports',
      'Priority support (4h response)',
      'API access with webhooks',
      'Custom branding',
      'Bulk invoicing',
      'Export data (CSV/PDF)',
      'Multiple payment methods',
      'Up to 5 team members',
    ],
    limits: {
      invoices: '100/month',
      transactions: 'Unlimited',
      apiAccess: true,
      support: 'Priority Email (4h)',
      teamMembers: '5',
    },
    cta: 'Start Pro Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '99',
    priceKES: '5,000',
    description: 'For established businesses with advanced needs.',
    features: [
      'Unlimited invoices',
      'All payment methods',
      'Dedicated account manager',
      '24/7 priority support',
      'Advanced API access',
      'Custom integrations',
      'White-label solution',
      'SLA guarantee (99.9% uptime)',
      'Advanced security features',
      'Unlimited team members',
      'Custom reporting',
      'Priority onboarding',
    ],
    limits: {
      invoices: 'Unlimited',
      transactions: 'Unlimited',
      apiAccess: true,
      support: '24/7 Phone & Email',
      teamMembers: 'Unlimited',
    },
    cta: 'Contact Sales',
    popular: false,
  },
];

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
  const navigate = useNavigate();

  const renderFeatureValue = (value: any) => {
    if (value === true) return <Check className="h-5 w-5 text-primary mx-auto" />;
    if (value === false || value === '-') return <X className="h-5 w-5 text-muted-foreground mx-auto" />;
    return <span className="text-sm text-foreground">{value}</span>;
  };

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
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative shadow-lg hover:shadow-xl transition-all ${
                plan.popular ? 'ring-2 ring-primary scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                    ⭐ Most Popular
                  </span>
                </div>
              )}

              <CardHeader className="text-center pt-8">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <div className="mb-4">
                  {plan.price === '0' ? (
                    <div>
                      <span className="text-5xl font-bold">Free</span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-center mb-1">
                        <span className="text-2xl font-medium">KSh</span>
                        <span className="text-5xl font-bold mx-2">{plan.priceKES}</span>
                        <span className="text-muted-foreground">/mo</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        or ${plan.price}/month
                      </div>
                    </div>
                  )}
                </div>
                <CardDescription className="text-base">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? 'default' : 'outline'}
                  size="lg"
                  className="w-full"
                  onClick={() => navigate('/get-started')}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
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
