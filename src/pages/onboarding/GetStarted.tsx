import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ChevronLeft, Check } from 'lucide-react';
import { BusinessInfoStep } from '@/components/onboarding/BusinessInfoStep';
import { PaymentSetupStep } from '@/components/onboarding/PaymentSetupStep';
import { PlanSelectionStep } from '@/components/onboarding/PlanSelectionStep';
import { ReviewStep } from '@/components/onboarding/ReviewStep';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';

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

const GetStarted = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  
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
    subscribeNewsletter: false,
    password: ''
  });

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Redirect authenticated users to dashboard
          navigate('/dashboard');
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        navigate('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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
    if (!onboardingData.businessInfo.email || !onboardingData.password) {
      console.error('Email and password are required');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: onboardingData.businessInfo.email,
        password: onboardingData.password,
        options: {
          data: {
            business_name: onboardingData.businessInfo.businessName,
            owner_name: onboardingData.businessInfo.ownerName,
            phone: onboardingData.businessInfo.phone,
            country: onboardingData.businessInfo.country,
            industry: onboardingData.businessInfo.industry,
            selected_plan: onboardingData.selectedPlan,
            subscribe_newsletter: onboardingData.subscribeNewsletter
          }
        }
      });

      if (error) {
        console.error('Signup error:', error.message);
        // Handle error (you might want to show an error message to user)
      } else {
        console.log('Account created successfully!');
        // User will be redirected to dashboard via auth state change
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
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
            Welcome to LipaSasa
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
            <a href="/auth" className="text-primary hover:underline font-medium">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;