import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PhoneInput } from './PhoneInput';
import { Loader2 } from 'lucide-react';

interface Step5Props {
  phone: string;
  agreeToTerms: boolean;
  subscribeNewsletter: boolean;
  onUpdate: (field: string, value: string | boolean) => void;
  onComplete: () => void;
  onBack: () => void;
  loading: boolean;
}

/**
 * Step 5: Phone Number and Terms Agreement
 * 
 * Final step where users provide their phone number for 2FA and agree to terms.
 * Includes phone validation and required terms checkbox.
 * 
 * @param phone - Current phone number value
 * @param agreeToTerms - Whether user agreed to terms
 * @param subscribeNewsletter - Whether user wants newsletter
 * @param onUpdate - Callback when any field updates
 * @param onComplete - Callback to complete signup
 * @param onBack - Callback to go back to previous step
 * @param loading - Whether signup is in progress
 * 
 * @example
 * <Step5_PhoneAndTerms
 *   phone={formData.phone}
 *   agreeToTerms={formData.agreeToTerms}
 *   subscribeNewsletter={formData.subscribeNewsletter}
 *   onUpdate={(field, value) => setFormData({...formData, [field]: value})}
 *   onComplete={handleSignup}
 *   onBack={() => setCurrentStep(4)}
 *   loading={isSubmitting}
 * />
 */
export const Step5_PhoneAndTerms: React.FC<Step5Props> = ({
  phone,
  agreeToTerms,
  subscribeNewsletter,
  onUpdate,
  onComplete,
  onBack,
  loading
}) => {
  const [isPhoneValid, setIsPhoneValid] = useState(false);

  // Form is valid if phone is valid and terms are agreed
  const isFormValid = () => {
    return isPhoneValid && agreeToTerms;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          One last detail
        </h2>
        <p className="text-gray-600">
          We'll use this number for two-step verification if you ever forget your password.
        </p>
      </div>

      {/* Phone Input */}
      <div className="pt-2">
        <PhoneInput
          id="phone"
          value={phone}
          onChange={(value) => onUpdate('phone', value)}
          onValidationChange={setIsPhoneValid}
        />
      </div>

      {/* Terms and Conditions */}
      <div className="space-y-4 pt-4">
        {/* Required Agreement */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="agreeToTerms"
              checked={agreeToTerms}
              onCheckedChange={(checked) => onUpdate('agreeToTerms', checked as boolean)}
              className="mt-1"
              aria-required="true"
            />
            <Label
              htmlFor="agreeToTerms"
              className="text-sm leading-relaxed cursor-pointer flex-1"
            >
              <span className="text-red-500 mr-1">*</span>
              I agree to the{' '}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                Business Associate Agreement
              </a>
              , the{' '}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                Terms of Service
              </a>
              , the{' '}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                Privacy Policy
              </a>
              , and the processing of my sensitive personal information which is included in{' '}
              <a
                href="/privacy#section-2"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                Section 2
              </a>{' '}
              of the Privacy Policy.
            </Label>
          </div>
        </div>

        {/* Optional Newsletter */}
        <div className="flex items-start gap-3">
          <Checkbox
            id="subscribeNewsletter"
            checked={subscribeNewsletter}
            onCheckedChange={(checked) => onUpdate('subscribeNewsletter', checked as boolean)}
            className="mt-1"
          />
          <Label
            htmlFor="subscribeNewsletter"
            className="text-sm leading-relaxed cursor-pointer text-gray-700"
          >
            <span className="text-gray-500">(Optional)</span> Subscribe to our newsletter for
            product updates, payment tips, and business insights
          </Label>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={loading}
          className="text-gray-600 hover:text-gray-900"
        >
          Go back
        </Button>

        <Button
          type="button"
          size="lg"
          onClick={onComplete}
          disabled={!isFormValid() || loading}
          className="bg-[#F7B500] hover:bg-[#E5A600] text-gray-900 min-w-[180px]"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Start my free trial now'
          )}
        </Button>
      </div>

      {/* Trust Badges */}
      <div className="pt-6 border-t border-gray-100">
        <div className="flex items-center justify-center gap-8">
          {/* HIPAA-style Badge (Kenya equivalent) */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium">GDPR Compliant</span>
            </div>
          </div>

          {/* Security Badge */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium">Secure & Encrypted</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4 text-xs text-gray-500">
          © 2025 LipaSasa |{' '}
          <a href="/terms" target="_blank" className="hover:text-gray-700">
            Terms
          </a>
          {' | '}
          <a href="/privacy" target="_blank" className="hover:text-gray-700">
            Privacy
          </a>
        </div>
      </div>
    </div>
  );
};

