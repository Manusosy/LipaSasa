import React from 'react';
import { Button } from '@/components/ui/button';
import { ValidatedInput } from './ValidatedInput';
import { ArrowRight } from 'lucide-react';

interface Step2Props {
  firstName: string;
  lastName: string;
  email: string;
  onUpdate: (field: string, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

/**
 * Step 2: Basic Information
 * 
 * Collects the user's first name, last name, and email address.
 * All fields are required and validated in real-time.
 * 
 * @param firstName - Current first name value
 * @param lastName - Current last name value
 * @param email - Current email value
 * @param onUpdate - Callback when any field updates
 * @param onNext - Callback to proceed to next step
 * @param onBack - Callback to go back to previous step
 * 
 * @example
 * <Step2_BasicInfo
 *   firstName={formData.firstName}
 *   lastName={formData.lastName}
 *   email={formData.email}
 *   onUpdate={(field, value) => setFormData({...formData, [field]: value})}
 *   onNext={() => setCurrentStep(3)}
 *   onBack={() => setCurrentStep(1)}
 * />
 */
export const Step2_BasicInfo: React.FC<Step2Props> = ({
  firstName,
  lastName,
  email,
  onUpdate,
  onNext,
  onBack
}) => {
  // Validation functions
  const validateName = (name: string) => ({
    isValid: name.trim().length >= 2,
    errorMessage: name.trim().length === 0
      ? 'This field is required'
      : 'Name must be at least 2 characters'
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      isValid: emailRegex.test(email),
      errorMessage: email.trim().length === 0
        ? 'This field is required'
        : 'Please enter a valid email address'
    };
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      firstName.trim().length >= 2 &&
      lastName.trim().length >= 2 &&
      validateEmail(email).isValid
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Add the essentials
        </h2>
        <p className="text-gray-600">
          Just enter your name and choose your password.
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* First Name */}
        <ValidatedInput
          id="firstName"
          label="First name"
          type="text"
          placeholder="e.g., Grace"
          value={firstName}
          onChange={(value) => onUpdate('firstName', value)}
          validate={validateName}
          required
          autoComplete="given-name"
        />

        {/* Last Name */}
        <ValidatedInput
          id="lastName"
          label="Last name"
          type="text"
          placeholder="e.g., Njeri"
          value={lastName}
          onChange={(value) => onUpdate('lastName', value)}
          validate={validateName}
          required
          autoComplete="family-name"
        />

        {/* Email */}
        <ValidatedInput
          id="email"
          label="Email"
          type="email"
          placeholder="grace@example.com"
          value={email}
          onChange={(value) => onUpdate('email', value)}
          validate={validateEmail}
          required
          autoComplete="email"
          helperText="We'll use this to send you important updates about your account"
        />
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
          disabled={!isFormValid()}
          className="bg-[#F7B500] hover:bg-[#E5A600] text-gray-900 min-w-[120px]"
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

