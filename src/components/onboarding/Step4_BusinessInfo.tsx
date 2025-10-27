import React from 'react';
import { Button } from '@/components/ui/button';
import { ValidatedInput } from './ValidatedInput';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Check, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step4Props {
  businessName: string;
  industry: string;
  country: string;
  onUpdate: (field: string, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

// Industry options
const INDUSTRIES = [
  'Retail & E-commerce',
  'Food & Beverage',
  'Professional Services',
  'Health & Wellness',
  'Education & Training',
  'Technology & Software',
  'Transportation & Logistics',
  'Real Estate',
  'Entertainment & Events',
  'Agriculture',
  'Manufacturing',
  'Financial Services',
  'Consulting',
  'Other'
];

// Country options with flags
const COUNTRIES = [
  { code: 'Kenya', flag: '🇰🇪', name: 'Kenya' },
  { code: 'Uganda', flag: '🇺🇬', name: 'Uganda' },
  { code: 'Tanzania', flag: '🇹🇿', name: 'Tanzania' },
  { code: 'Rwanda', flag: '🇷🇼', name: 'Rwanda' }
];

/**
 * Step 4: Business Information
 * 
 * Collects business-specific details including business name, industry, and country.
 * Uses dropdown selects for industry and country to ensure data quality.
 * 
 * @param businessName - Current business name value
 * @param industry - Selected industry
 * @param country - Selected country
 * @param onUpdate - Callback when any field updates
 * @param onNext - Callback to proceed to next step
 * @param onBack - Callback to go back to previous step
 * 
 * @example
 * <Step4_BusinessInfo
 *   businessName={formData.businessName}
 *   industry={formData.industry}
 *   country={formData.country}
 *   onUpdate={(field, value) => setFormData({...formData, [field]: value})}
 *   onNext={() => setCurrentStep(5)}
 *   onBack={() => setCurrentStep(3)}
 * />
 */
export const Step4_BusinessInfo: React.FC<Step4Props> = ({
  businessName,
  industry,
  country,
  onUpdate,
  onNext,
  onBack
}) => {
  // Validation for business name
  const validateBusinessName = (name: string) => ({
    isValid: name.trim().length >= 2,
    errorMessage: name.trim().length === 0
      ? 'This field is required'
      : 'Business name must be at least 2 characters'
  });

  // Check if form is valid
  const isFormValid = () => {
    return (
      businessName.trim().length >= 2 &&
      industry.length > 0 &&
      country.length > 0
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Tell us about your business
        </h2>
        <p className="text-gray-600">
          Help us personalize your experience with LipaSasa
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-5">
        {/* Business Name */}
        <ValidatedInput
          id="businessName"
          label="Business name"
          type="text"
          placeholder="e.g., Mama Njeri's Shop"
          value={businessName}
          onChange={(value) => onUpdate('businessName', value)}
          validate={validateBusinessName}
          required
          autoComplete="organization"
          helperText="This will be displayed on your invoices and payment links"
        />

        {/* Industry Selector */}
        <div className="space-y-2">
          <Label htmlFor="industry" className="text-sm font-medium text-gray-900">
            What type of business do you run? <span className="text-red-500">*</span>
          </Label>
          <Select value={industry} onValueChange={(value) => onUpdate('industry', value)}>
            <SelectTrigger 
              id="industry"
              className={cn(
                "transition-all duration-200",
                industry && "border-green-500"
              )}
            >
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {INDUSTRIES.map((ind) => (
                <SelectItem key={ind} value={ind}>
                  {ind}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!industry && (
            <p className="text-sm text-red-600">
              This field is required.
            </p>
          )}
          {industry && (
            <div className="flex items-center gap-1 text-sm text-green-600">
              <Check className="h-3.5 w-3.5" />
              <span>Industry selected</span>
            </div>
          )}
        </div>

        {/* Country Selector */}
        <div className="space-y-2">
          <Label htmlFor="country" className="text-sm font-medium text-gray-900">
            Country <span className="text-red-500">*</span>
          </Label>
          <Select value={country} onValueChange={(value) => onUpdate('country', value)}>
            <SelectTrigger 
              id="country"
              className={cn(
                "transition-all duration-200",
                country && "border-green-500"
              )}
            >
              <SelectValue placeholder="Select your country">
                {country && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {COUNTRIES.find(c => c.code === country)?.flag}
                    </span>
                    <span>{country}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{c.flag}</span>
                    <span>{c.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!country && (
            <p className="text-sm text-red-600">
              This field is required.
            </p>
          )}
          {country && (
            <div className="flex items-center gap-1 text-sm text-green-600">
              <Check className="h-3.5 w-3.5" />
              <span>Country selected</span>
            </div>
          )}
          <p className="text-xs text-gray-500">
            We'll customize payment methods based on your location
          </p>
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

