import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ChevronLeft, Check } from 'lucide-react';
import { BusinessInfoStep } from '@/components/onboarding/BusinessInfoStep';
import { PaymentSetupStep } from '@/components/onboarding/PaymentSetupStep';
import { PlanSelectionStep } from '@/components/onboarding/PlanSelectionStep';
import { ReviewStep } from '@/components/onboarding/ReviewStep';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';

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
}

const GetStarted = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    businessInfo: {
      businessName: '',
      ownerName: '',
      email: '',
      phone: '',
      country: 'Kenya',
      industry: ''
    },
    paymentMethods: {
      mpesaPaybill: '',
      mpesaTill: '',
      airtelMoney: '',
      enableCards: false
    },
    selectedPlan: 'starter',
    agreeToTerms: false,
    subscribeNewsletter: false
  });

  const totalSteps = 4;

  const updateOnboardingData = (stepData: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...stepData }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    // TODO: Handle final submission
    console.log('Onboarding completed:', onboardingData);
    // Navigate to dashboard or subscription checkout
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BusinessInfoStep
            data={onboardingData.businessInfo}
            onUpdate={(businessInfo) => updateOnboardingData({ businessInfo })}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <PaymentSetupStep
            data={onboardingData.paymentMethods}
            onUpdate={(paymentMethods) => updateOnboardingData({ paymentMethods })}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 3:
        return (
          <PlanSelectionStep
            selectedPlan={onboardingData.selectedPlan}
            onUpdate={(selectedPlan) => updateOnboardingData({ selectedPlan })}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 4:
        return (
          <ReviewStep
            data={onboardingData}
            onUpdate={updateOnboardingData}
            onComplete={handleComplete}
            onBack={prevStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to ChapaPay
          </h1>
          <p className="text-muted-foreground">
            Let's set up your account in just a few steps
          </p>
        </div>

        <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />

        <Card className="mt-8 shadow-elegant border-0">
          <CardContent className="p-8">
            {renderStep()}
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Already have an account?{' '}
            <a href="/signin" className="text-primary hover:underline font-medium">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;