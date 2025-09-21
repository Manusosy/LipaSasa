import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Check, Building2, Smartphone, Star, Zap, Lock } from 'lucide-react';
export interface OnboardingData {
  businessInfo: {
    businessName: string;
    ownerName: string;
    email: string;
    phone: string;
    country: string;
    industry: string;
  };
  paymentMethods: {
    mpesaPaybill: string;
    mpesaTill: string;
    airtelMoney: string;
    enableCards: boolean;
  };
  selectedPlan: 'starter' | 'pro';
  agreeToTerms: boolean;
  subscribeNewsletter: boolean;
  password: string;
}

interface ReviewStepProps {
  data: OnboardingData;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onComplete: () => void;
  onBack: () => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  data,
  onUpdate,
  onComplete,
  onBack
}) => {
  const isValid = data.agreeToTerms && data.password && data.password.length >= 6;

  const planDetails = {
    starter: { name: 'Starter', price: '$9/month', icon: Star },
    pro: { name: 'Pro', price: '$29/month', icon: Zap }
  };

  const selectedPlanInfo = planDetails[data.selectedPlan];
  const PlanIcon = selectedPlanInfo.icon;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Review your information</h2>
        <p className="text-muted-foreground mt-2">
          Please review your details before we create your account
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Business Name:</span>
                <p className="text-foreground">{data.businessInfo.businessName}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Owner:</span>
                <p className="text-foreground">{data.businessInfo.ownerName}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Email:</span>
                <p className="text-foreground">{data.businessInfo.email}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Phone:</span>
                <p className="text-foreground">{data.businessInfo.phone}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Country:</span>
                <p className="text-foreground">{data.businessInfo.country}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Industry:</span>
                <p className="text-foreground">{data.businessInfo.industry}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-success" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid gap-2 text-sm">
              {data.paymentMethods.mpesaPaybill && (
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  <span>M-Pesa Paybill: {data.paymentMethods.mpesaPaybill}</span>
                </div>
              )}
              {data.paymentMethods.mpesaTill && (
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  <span>M-Pesa Till: {data.paymentMethods.mpesaTill}</span>
                </div>
              )}
              {data.paymentMethods.airtelMoney && (
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  <span>Airtel Money: {data.paymentMethods.airtelMoney}</span>
                </div>
              )}
              {data.paymentMethods.enableCards && (
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  <span>Card Payments: Enabled</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Selected Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlanIcon className="w-5 h-5 text-warning" />
              Selected Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">{selectedPlanInfo.name} Plan</p>
                <p className="text-sm text-muted-foreground">
                  14-day free trial, then {selectedPlanInfo.price}
                </p>
              </div>
              <div className="text-2xl font-bold text-primary">
                {selectedPlanInfo.price}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agreement Section */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Account Security & Agreement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Create Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password (min. 6 characters)"
                value={data.password}
                onChange={(e) => onUpdate({ password: e.target.value })}
                minLength={6}
                required
              />
              <p className="text-xs text-muted-foreground">
                Your password must be at least 6 characters long
              </p>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox
                id="agreeToTerms"
                checked={data.agreeToTerms}
                onCheckedChange={(checked) => onUpdate({ agreeToTerms: checked as boolean })}
                className="mt-1"
              />
              <Label htmlFor="agreeToTerms" className="text-sm leading-relaxed cursor-pointer">
                I agree to LipaSasa's{' '}
                <a href="/terms" className="text-primary hover:underline font-medium">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-primary hover:underline font-medium">
                  Privacy Policy
                </a>
                . I understand that my payment methods will be verified and that transaction fees may apply.
              </Label>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox
                id="subscribeNewsletter"
                checked={data.subscribeNewsletter}
                onCheckedChange={(checked) => onUpdate({ subscribeNewsletter: checked as boolean })}
                className="mt-1"
              />
              <Label htmlFor="subscribeNewsletter" className="text-sm leading-relaxed cursor-pointer">
                <span className="text-muted-foreground">(Optional)</span> Subscribe to our newsletter for 
                product updates, payment tips, and business insights
              </Label>
            </div>
          </CardContent>
        </Card>
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
          onClick={onComplete}
          disabled={!isValid}
          className="flex items-center gap-2"
          size="lg"
          variant="premium"
        >
          Create My Account
          <Check className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};