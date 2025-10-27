import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PasswordStrength } from './PasswordStrength';
import { ArrowRight } from 'lucide-react';

interface Step3Props {
  password: string;
  onUpdate: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

/**
 * Step 3: Create Password
 * 
 * Allows users to create a secure password with real-time strength validation.
 * Shows requirements checklist and strength indicator.
 * 
 * @param password - Current password value
 * @param onUpdate - Callback when password changes
 * @param onNext - Callback to proceed to next step
 * @param onBack - Callback to go back to previous step
 * 
 * @example
 * <Step3_Password
 *   password={formData.password}
 *   onUpdate={(value) => setFormData({...formData, password: value})}
 *   onNext={() => setCurrentStep(4)}
 *   onBack={() => setCurrentStep(2)}
 * />
 */
export const Step3_Password: React.FC<Step3Props> = ({
  password,
  onUpdate,
  onNext,
  onBack
}) => {
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Create your password
        </h2>
        <p className="text-gray-600">
          Choose a strong password to secure your account
        </p>
      </div>

      {/* Password Input with Strength Indicator */}
      <div className="pt-2">
        <PasswordStrength
          id="password"
          value={password}
          onChange={onUpdate}
          onValidationChange={setIsPasswordValid}
          placeholder="Create a strong password"
        />
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Keep your account secure
            </h4>
            <p className="text-xs text-blue-700 leading-relaxed">
              We recommend using a unique password that you don't use for other accounts. 
              Consider using a password manager to generate and store strong passwords.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900"
        >
          Go back
        </Button>

        <Button
          type="button"
          size="lg"
          onClick={onNext}
          disabled={!isPasswordValid}
          className="bg-[#F7B500] hover:bg-[#E5A600] text-gray-900 min-w-[120px]"
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

