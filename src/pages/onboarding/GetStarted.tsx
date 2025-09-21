import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, ChevronLeft, Check, Mail, Lock, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { BusinessInfoStep } from '@/components/onboarding/BusinessInfoStep';
import { PaymentSetupStep } from '@/components/onboarding/PaymentSetupStep';
import { PlanSelectionStep } from '@/components/onboarding/PlanSelectionStep';
import { ReviewStep } from '@/components/onboarding/ReviewStep';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';

export interface OnboardingData {
  auth: {
    email: string;
    password: string;
  };
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
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    auth: {
      email: '',
      password: ''
    },
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

  const totalSteps = 5;

  useEffect(() => {
    // Check if user is already authenticated and redirect to dashboard
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && currentStep === 0) {
          // If user is already authenticated, skip to step 1
          setCurrentStep(1);
          // Pre-fill email in business info
          setOnboardingData(prev => ({
            ...prev,
            businessInfo: {
              ...prev.businessInfo,
              email: session.user.email || ''
            }
          }));
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user && currentStep === 0) {
        setCurrentStep(1);
        setOnboardingData(prev => ({
          ...prev,
          businessInfo: {
            ...prev.businessInfo,
            email: session.user.email || ''
          }
        }));
      }
    });

    return () => subscription.unsubscribe();
  }, [currentStep]);

  const updateOnboardingData = (stepData: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...stepData }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase.auth.signUp({
        email: onboardingData.auth.email,
        password: onboardingData.auth.password,
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else {
          setError(error.message);
        }
      } else {
        setSuccess('Account created successfully! Continue with your business setup.');
        // Pre-fill business email with auth email
        setOnboardingData(prev => ({
          ...prev,
          businessInfo: {
            ...prev.businessInfo,
            email: prev.auth.email
          }
        }));
        setTimeout(() => nextStep(), 1500);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    console.log('Onboarding completed:', onboardingData);
    // Navigate to dashboard
    navigate('/dashboard');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 mb-2">
                <Lock className="h-5 w-5" />
                Create Your Account
              </CardTitle>
              <CardDescription>
                Start your journey with LipaSasa
              </CardDescription>
            </div>
            
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your@email.com"
                  value={onboardingData.auth.email}
                  onChange={(e) => updateOnboardingData({ 
                    auth: { ...onboardingData.auth, email: e.target.value }
                  })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Create a strong password"
                  value={onboardingData.auth.password}
                  onChange={(e) => updateOnboardingData({ 
                    auth: { ...onboardingData.auth, password: e.target.value }
                  })}
                  required
                  minLength={6}
                />
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
                variant="hero"
              >
                {loading ? 'Creating Account...' : 'Create Account & Continue'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>
        );
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
          <img 
            src="/chapapay-logo.png" 
            alt="LipaSasa Logo"
            className="h-16 w-auto mx-auto mb-4" 
          />
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {currentStep === 0 ? 'Join LipaSasa' : 'Welcome to LipaSasa'}
          </h1>
          <p className="text-muted-foreground">
            {currentStep === 0 
              ? 'Create your account and start accepting payments' 
              : 'Let\'s complete your account setup in just a few steps'
            }
          </p>
        </div>

        {currentStep > 0 && (
          <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />
        )}

        <Card className="mt-8 shadow-elegant border-0">
          <CardContent className="p-8">
            {renderStep()}
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Already have an account?{' '}
            <Button 
              variant="link" 
              onClick={() => navigate('/auth')}
              className="p-0 text-primary hover:underline"
            >
              Sign in here
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;