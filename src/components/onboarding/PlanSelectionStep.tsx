import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ChevronLeft, Check, Star, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlanSelectionStepProps {
  selectedPlan: 'starter' | 'pro';
  onUpdate: (plan: 'starter' | 'pro') => void;
  onNext: () => void;
  onBack: () => void;
}

const plans = [
  {
    id: 'starter' as const,
    name: 'Starter',
    price: '$9',
    period: '/month',
    description: 'Perfect for small businesses just getting started',
    icon: Star,
    features: [
      'Up to 100 invoices/month',
      'M-Pesa Paybill/Till integration',
      'Basic reporting',
      'Email support',
      'WhatsApp notifications',
      'PDF invoice generation'
    ],
    popular: false
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'Advanced features for growing businesses',
    icon: Zap,
    features: [
      'Unlimited invoices',
      'All payment methods',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
      'API access',
      'Bulk operations',
      'Export to accounting software'
    ],
    popular: true
  }
];

export const PlanSelectionStep: React.FC<PlanSelectionStepProps> = ({
  selectedPlan,
  onUpdate,
  onNext,
  onBack
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="w-8 h-8 text-warning" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Choose your plan</h2>
        <p className="text-muted-foreground mt-2">
          Select the plan that best fits your business needs. You can change anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isSelected = selectedPlan === plan.id;

          return (
            <Card
              key={plan.id}
              className={cn(
                "relative cursor-pointer transition-all duration-300 hover:shadow-elegant",
                isSelected
                  ? "border-2 border-primary shadow-glow ring-2 ring-primary/20"
                  : "border border-border hover:border-primary/50",
                plan.popular && "ring-2 ring-warning/20 border-warning"
              )}
              onClick={() => onUpdate(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-2">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-primary">
                  {plan.price}
                  <span className="text-sm font-normal text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isSelected ? "default" : "outline"}
                  className="w-full mt-6"
                  onClick={() => onUpdate(plan.id)}
                >
                  {isSelected ? "Selected" : "Select Plan"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center text-sm text-muted-foreground max-w-2xl mx-auto">
        <p>
          All plans include a 14-day free trial. No credit card required to start.
          You can upgrade, downgrade, or cancel anytime.
        </p>
      </div>

      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
          size="lg"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          onClick={onNext}
          className="flex items-center gap-2"
          size="lg"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};