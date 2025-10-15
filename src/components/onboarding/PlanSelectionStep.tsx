import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ChevronLeft, Check, Star, Zap, Crown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePricing } from '@/hooks/use-pricing';

interface PlanSelectionStepProps {
  selectedPlan: 'free' | 'professional' | 'enterprise';
  onUpdate: (plan: 'free' | 'professional' | 'enterprise') => void;
  onNext: () => void;
  onBack: () => void;
}

export const PlanSelectionStep: React.FC<PlanSelectionStepProps> = ({
  selectedPlan,
  onUpdate,
  onNext,
  onBack
}) => {
  const { tiers, loading, formatPrice, getPlanPrice } = usePricing();

  const getPlanIcon = (tierName: string) => {
    switch (tierName) {
      case 'free':
        return Star;
      case 'professional':
        return Zap;
      case 'enterprise':
        return Crown;
      default:
        return Star;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading plans...</p>
        </div>
      </div>
    );
  }

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {tiers.map((tier) => {
          const Icon = getPlanIcon(tier.tier_name);
          const isSelected = selectedPlan === tier.tier_name;
          const isPopular = tier.tier_name === 'professional';
          const monthlyPrice = getPlanPrice(tier.tier_name, 'monthly', 'KSH');

          return (
            <Card
              key={tier.id}
              className={cn(
                "relative cursor-pointer transition-all duration-300 hover:shadow-elegant",
                isSelected
                  ? "border-2 border-primary shadow-glow ring-2 ring-primary/20"
                  : "border border-border hover:border-primary/50",
                isPopular && "ring-2 ring-warning/20 border-warning"
              )}
              onClick={() => onUpdate(tier.tier_name as any)}
            >
              {isPopular && (
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
                <CardTitle className="text-xl">{tier.display_name}</CardTitle>
                <div className="text-3xl font-bold text-primary">
                  {tier.tier_name === 'free' ? (
                    'Free'
                  ) : (
                    <>
                      {formatPrice(monthlyPrice, 'KSH').replace('KSh ', 'KSh ')}
                      <span className="text-sm font-normal text-muted-foreground">/month</span>
                    </>
                  )}
                </div>
                <CardDescription>
                  {tier.max_invoices ? `${tier.max_invoices} invoices/month` : 'Unlimited invoices'}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {tier.features.slice(0, 6).map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isSelected ? "default" : "outline"}
                  className="w-full mt-6"
                  onClick={() => onUpdate(tier.tier_name as any)}
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
          Start with the free plan, no credit card required. 
          You can upgrade anytime to unlock more features and invoice limits.
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