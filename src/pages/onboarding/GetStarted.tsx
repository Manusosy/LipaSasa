import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
  const [showOAuthOption, setShowOAuthOption] = useState(true);
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

  const totalSteps = 3; // Removed payment setup step - will be done in dashboard

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

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Google OAuth error:', error.message);
        setLoading(false);
      }
      // Don't set loading to false as page will redirect
    } catch (err) {
      console.error('Unexpected error:', err);
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
          <PlanSelectionStep
            selectedPlan={onboardingData.selectedPlan}
            onUpdate={(selectedPlan) => updateOnboardingData({ selectedPlan })}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 3:
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-primary/5" />
      
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <img 
                src="/chapapay-logo.png" 
                alt="LipaSasa Logo"
                className="h-12 w-auto mb-6" 
              />
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Get Started with LipaSasa
              </h1>
              <p className="text-muted-foreground">
                Create your account and start accepting payments in minutes
              </p>
            </div>

        {showOAuthOption && currentStep === 1 && (
          <Card className="mb-6 shadow-elegant border-0">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold mb-2">Quick Sign Up</h2>
                <p className="text-sm text-muted-foreground">
                  Sign up instantly with your Google account
                </p>
              </div>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignUp}
                disabled={loading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {loading ? 'Connecting...' : 'Continue with Google'}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or sign up with email</span>
                </div>
              </div>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setShowOAuthOption(false)}
              >
                Continue with Email →
              </Button>
            </CardContent>
          </Card>
        )}

        {(!showOAuthOption || currentStep > 1) && (
          <>
            <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />

            <Card className="mt-8 shadow-elegant border-0">
              <CardContent className="p-8">
                {renderStep()}
              </CardContent>
            </Card>
          </>
        )}

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

        {/* Right Side - Image */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary to-secondary">
          <div className="absolute inset-0 bg-black/10" />
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2070')`,
              opacity: 0.3
            }}
          />
          <div className="relative z-10 flex flex-col items-center justify-center p-12 text-white">
            <div className="max-w-md text-center">
              <h2 className="text-4xl font-bold mb-6">
                Start Accepting Payments Today
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Join thousands of businesses using LipaSasa to accept M-Pesa, bank transfers, and card payments seamlessly.
              </p>
              <div className="grid grid-cols-2 gap-4 text-left">
                {[
                  '✓ M-Pesa Integration',
                  '✓ Instant Notifications',
                  '✓ Professional Invoices',
                  '✓ Secure Payments',
                  '✓ Payment Links',
                  '✓ 24/7 Support'
                ].map((feature, idx) => (
                  <div key={idx} className="text-sm font-medium">
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;