import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { redirectToDashboard } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';

// Import step components
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { Step1_SignupMethod } from '@/components/onboarding/Step1_SignupMethod';
import { Step2_BasicInfo } from '@/components/onboarding/Step2_BasicInfo';
import { Step3_Password } from '@/components/onboarding/Step3_Password';
import { Step4_BusinessInfo } from '@/components/onboarding/Step4_BusinessInfo';
import { Step5_PhoneAndTerms } from '@/components/onboarding/Step5_PhoneAndTerms';

/**
 * Onboarding form data interface
 */
interface OnboardingFormData {
  // Step 1: Signup method (email or google)
  signupMethod: 'email' | 'google' | null;
  
  // Step 2: Basic info
  firstName: string;
  lastName: string;
  email: string;
  
  // Step 3: Password
  password: string;
  
  // Step 4: Business info
  businessName: string;
  industry: string;
  country: string;
  
  // Step 5: Phone and terms
  phone: string;
  agreeToTerms: boolean;
  subscribeNewsletter: boolean;
}

/**
 * GetStarted Page - Merchant Onboarding Flow
 * 
 * A multi-step onboarding process for merchant signup.
 * Implements a clean, progressive disclosure pattern with 5 steps:
 * 1. Choose signup method (Email or Google)
 * 2. Enter basic information (name, email)
 * 3. Create password with strength validation
 * 4. Provide business details
 * 5. Add phone number and agree to terms
 * 
 * Features:
 * - Real-time validation
 * - Progress indicator
 * - Form state persistence
 * - Google OAuth support
 * - Responsive design
 * 
 * @returns Onboarding flow component
 */
const GetStarted = () => {
  // Navigation and auth state
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [oAuthLoading, setOAuthLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState<OnboardingFormData>({
    signupMethod: null,
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    businessName: '',
    industry: '',
    country: 'Kenya', // Default to Kenya
    phone: '',
    agreeToTerms: false,
    subscribeNewsletter: false
  });

  /**
   * Check for existing session and redirect authenticated users
   */
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await redirectToDashboard(navigate);
        }
      }
    );

    // Check for existing session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await redirectToDashboard(navigate);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  /**
   * Update form data for a specific field
   */
  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Navigate to next step
   */
  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  /**
   * Navigate to previous step
   */
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  /**
   * Handle Google OAuth signup
   */
  const handleGoogleSignup = async () => {
    setOAuthLoading(true);
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
        toast({
          title: 'Authentication Error',
          description: error.message || 'Failed to sign in with Google. Please try again.',
          variant: 'destructive'
        });
        setOAuthLoading(false);
      }
      // Don't set loading to false if successful - page will redirect
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
      setOAuthLoading(false);
    }
  };

  /**
   * Handle email signup method selection
   */
  const handleEmailSignup = () => {
    setFormData(prev => ({ ...prev, signupMethod: 'email' }));
    setCurrentStep(2);
  };

  /**
   * Complete signup and create account
   */
  const handleCompleteSignup = async () => {
    setLoading(true);
    
    try {
      // Validate all required fields
      if (!formData.email || !formData.password) {
        toast({
          title: 'Validation Error',
          description: 'Email and password are required.',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }

      if (!formData.agreeToTerms) {
        toast({
          title: 'Agreement Required',
          description: 'You must agree to the terms and conditions to continue.',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }

      // Create account with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            business_name: formData.businessName,
            owner_name: `${formData.firstName} ${formData.lastName}`,
            phone: formData.phone,
            country: formData.country,
            industry: formData.industry,
            selected_plan: 'free', // Always start with free plan
            subscribe_newsletter: formData.subscribeNewsletter
          }
        }
      });

      if (error) {
        console.error('Signup error:', error.message);
        
        // Handle specific errors
        if (error.message.includes('already registered')) {
          toast({
            title: 'Account Exists',
            description: 'An account with this email already exists. Please sign in instead.',
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Signup Failed',
            description: error.message || 'Failed to create account. Please try again.',
            variant: 'destructive'
          });
        }
      } else {
        // Success!
        toast({
          title: 'Account Created! 🎉',
          description: 'Welcome to LipaSasa! Redirecting to your dashboard...',
          variant: 'default'
        });
        
        // User will be redirected via auth state change listener
        // But we can also manually redirect after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err) {
      console.error('Unexpected error during signup:', err);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Render current step component
   */
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1_SignupMethod
            onEmailSignup={handleEmailSignup}
            onGoogleSignup={handleGoogleSignup}
            loading={oAuthLoading}
          />
        );
      
      case 2:
        return (
          <Step2_BasicInfo
            firstName={formData.firstName}
            lastName={formData.lastName}
            email={formData.email}
            onUpdate={updateFormData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      
      case 3:
        return (
          <Step3_Password
            password={formData.password}
            onUpdate={(value) => updateFormData('password', value)}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      
      case 4:
        return (
          <Step4_BusinessInfo
            businessName={formData.businessName}
            industry={formData.industry}
            country={formData.country}
            onUpdate={updateFormData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      
      case 5:
        return (
          <Step5_PhoneAndTerms
            phone={formData.phone}
            agreeToTerms={formData.agreeToTerms}
            subscribeNewsletter={formData.subscribeNewsletter}
            onUpdate={updateFormData}
            onComplete={handleCompleteSignup}
            onBack={goToPreviousStep}
            loading={loading}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="/lipasasa-logo.png" 
            alt="LipaSasa Logo"
            className="h-12 w-auto mx-auto mb-6" 
            onError={(e) => {
              // Fallback to chapapay logo if lipasasa logo fails
              e.currentTarget.src = '/chapapay-logo.png';
            }}
          />
        </div>

        {/* Progress Bar (show from step 2 onwards) */}
        {currentStep > 1 && (
          <div className="mb-8">
            <ProgressBar currentStep={currentStep - 1} totalSteps={totalSteps - 1} />
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {renderStep()}
        </div>

        {/* Footer - Back to Home Link */}
        {currentStep === 1 && (
          <div className="text-center mt-6">
            <a
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Home
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default GetStarted;
