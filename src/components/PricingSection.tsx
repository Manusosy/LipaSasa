import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '9',
    description: 'Perfect for small businesses and freelancers just getting started.',
    features: [
      'Up to 100 transactions/month',
      'M-Pesa integration',
      'Basic dashboard access',
      'Email support',
      'Basic reporting',
      'Payment links',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Pro',
    price: '29',
    description: 'Everything you need to grow your business with confidence.',
    features: [
      'Unlimited transactions',
      'All payment methods',
      'Advanced dashboard',
      'Priority support',
      'Advanced analytics',
      'Custom branding',
      'API access',
      'Multiple team members',
    ],
    cta: 'Get Started',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Custom solutions for large businesses with specific needs.',
    features: [
      'Custom transaction limits',
      'Dedicated account manager',
      'Custom integrations',
      '24/7 phone support',
      'Custom reporting',
      'SLA guarantee',
      'Priority API support',
      'On-premise deployment',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export const PricingSection = () => {
  return (
    <section className="py-24 bg-slate-50" id="pricing">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that best fits your business needs. All plans include a 14-day free trial.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow ${
                plan.popular ? 'ring-2 ring-primary' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  {plan.price === 'Custom' ? (
                    <span className="text-4xl font-bold">Custom</span>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span className="text-lg font-medium">$</span>
                      <span className="text-4xl font-bold mx-1">{plan.price}</span>
                      <span className="text-muted-foreground">/mo</span>
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? 'default' : 'outline'}
                size="lg"
                className="w-full"
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
