import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Mail, ArrowRight } from 'lucide-react';

interface Step1Props {
  onEmailSignup: () => void;
  onGoogleSignup: () => void;
  loading: boolean;
}

/**
 * Step 1: Signup Method Selection
 * 
 * Allows users to choose between email/password signup or Google OAuth.
 * This is the entry point of the onboarding flow.
 * 
 * @param onEmailSignup - Callback when user chooses email signup
 * @param onGoogleSignup - Callback when user chooses Google signup
 * @param loading - Whether an OAuth request is in progress
 * 
 * @example
 * <Step1_SignupMethod
 *   onEmailSignup={() => setCurrentStep(2)}
 *   onGoogleSignup={handleGoogleOAuth}
 *   loading={isLoading}
 * />
 */
export const Step1_SignupMethod: React.FC<Step1Props> = ({
  onEmailSignup,
  onGoogleSignup,
  loading
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold text-gray-900">
          Get started with LipaSasa
        </h2>
        <p className="text-gray-600">
          Join thousands of businesses accepting payments seamlessly
        </p>
      </div>

      {/* Google OAuth Option */}
      <div className="space-y-4">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full h-12 text-base font-medium hover:bg-gray-50 transition-colors"
          onClick={onGoogleSignup}
          disabled={loading}
        >
          <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
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

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-gray-500 font-medium">
              Or sign up with email
            </span>
          </div>
        </div>

        {/* Email Signup Option */}
        <Button
          type="button"
          size="lg"
          className="w-full h-12 text-base font-medium bg-[#F7B500] hover:bg-[#E5A600] text-gray-900"
          onClick={onEmailSignup}
          disabled={loading}
        >
          <Mail className="mr-2 h-5 w-5" />
          Continue with Email
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>

      {/* Sign In Link */}
      <div className="text-center pt-4">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <a
            href="/auth"
            className="text-primary hover:underline font-medium transition-colors"
          >
            Sign in here
          </a>
        </p>
      </div>

      {/* Trust Indicators */}
      <div className="pt-6 border-t border-gray-100">
        <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Secure & Encrypted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>GDPR Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
};

