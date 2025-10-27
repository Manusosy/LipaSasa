import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Country configuration for phone input
 */
interface CountryOption {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  placeholder: string;
  format: RegExp;
}

const COUNTRIES: CountryOption[] = [
  {
    code: 'KE',
    name: 'Kenya',
    dialCode: '+254',
    flag: '🇰🇪',
    placeholder: '712 345 678',
    format: /^(\+?254|0)?[17]\d{8}$/
  },
  {
    code: 'UG',
    name: 'Uganda',
    dialCode: '+256',
    flag: '🇺🇬',
    placeholder: '712 345 678',
    format: /^(\+?256|0)?[37]\d{8}$/
  },
  {
    code: 'TZ',
    name: 'Tanzania',
    dialCode: '+255',
    flag: '🇹🇿',
    placeholder: '712 345 678',
    format: /^(\+?255|0)?[67]\d{8}$/
  },
  {
    code: 'RW',
    name: 'Rwanda',
    dialCode: '+250',
    flag: '🇷🇼',
    placeholder: '712 345 678',
    format: /^(\+?250|0)?[7]\d{8}$/
  }
];

interface PhoneInputProps {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  defaultCountry?: string;
  className?: string;
  helperText?: string;
}

/**
 * PhoneInput Component
 * 
 * A specialized phone number input with country code selector and automatic formatting.
 * Validates phone numbers based on the selected country's format.
 * 
 * @param id - Unique identifier for the input
 * @param label - Label text (defaults to "Mobile phone")
 * @param value - Current phone number value
 * @param onChange - Callback when value changes
 * @param onValidationChange - Callback when validation state changes
 * @param defaultCountry - Default country code (defaults to 'KE')
 * @param className - Additional CSS classes
 * @param helperText - Helper text shown below the input
 * 
 * @example
 * <PhoneInput
 *   id="phone"
 *   value={phone}
 *   onChange={setPhone}
 *   onValidationChange={setIsPhoneValid}
 * />
 */
export const PhoneInput: React.FC<PhoneInputProps> = ({
  id,
  label = 'Mobile phone',
  value,
  onChange,
  onValidationChange,
  defaultCountry = 'KE',
  className,
  helperText = "We'll use this for two-step verification if you forget your password."
}) => {
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [touched, setTouched] = useState(false);

  // Get current country config
  const country = COUNTRIES.find(c => c.code === selectedCountry) || COUNTRIES[0];

  // Format phone number for display
  const formatPhoneNumber = (input: string): string => {
    // Remove all non-numeric characters
    const cleaned = input.replace(/\D/g, '');
    
    // Apply basic formatting: XXX XXX XXX
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)}`;
  };

  // Validate phone number
  const validatePhone = (phone: string): boolean => {
    if (!phone) return false;
    
    // Clean the phone number
    const cleaned = phone.replace(/\D/g, '');
    
    // Add country dial code if not present
    const fullNumber = cleaned.startsWith(country.dialCode.replace('+', '')) 
      ? `+${cleaned}` 
      : `${country.dialCode}${cleaned}`;
    
    return country.format.test(fullNumber);
  };

  const isValid = validatePhone(value);

  // Notify parent of validation state
  useEffect(() => {
    onValidationChange?.(isValid && value.length > 0);
  }, [isValid, value, onValidationChange]);

  // Show validation states
  const showError = touched && !isValid && value.length > 0;
  const showSuccess = isValid && value.length > 0;

  const handlePhoneChange = (input: string) => {
    // Remove all non-numeric characters except +
    const cleaned = input.replace(/[^\d+]/g, '');
    onChange(cleaned);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label */}
      <Label htmlFor={id} className="text-sm font-medium text-gray-900">
        {label} <span className="text-red-500">*</span>
      </Label>

      {/* Country Selector + Phone Input */}
      <div className="flex gap-2">
        {/* Country Code Selector */}
        <Select
          value={selectedCountry}
          onValueChange={setSelectedCountry}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue>
              <div className="flex items-center gap-2">
                <span className="text-lg">{country.flag}</span>
                <span className="text-sm">{country.dialCode}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{c.flag}</span>
                  <span className="text-sm">{c.name}</span>
                  <span className="text-xs text-gray-500">{c.dialCode}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Phone Number Input */}
        <div className="relative flex-1">
          <Input
            id={id}
            type="tel"
            placeholder={country.placeholder}
            value={value}
            onChange={(e) => handlePhoneChange(e.target.value)}
            onBlur={handleBlur}
            className={cn(
              "pr-10",
              showError && "border-red-500 focus-visible:ring-red-500",
              showSuccess && "border-green-500"
            )}
            autoComplete="tel"
            required
            aria-invalid={showError}
            aria-describedby={`${id}-helper`}
          />

          {/* Validation Icons */}
          {showSuccess && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Check className="h-5 w-5 text-green-500" aria-label="Valid phone number" />
            </div>
          )}

          {showError && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <AlertCircle className="h-5 w-5 text-red-500" aria-label="Invalid phone number" />
            </div>
          )}
        </div>
      </div>

      {/* Helper Text or Error Message */}
      {showError ? (
        <p id={`${id}-helper`} className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5" />
          Please enter a valid {country.name} phone number
        </p>
      ) : helperText ? (
        <p id={`${id}-helper`} className="text-sm text-gray-500">
          {helperText}
        </p>
      ) : null}

      {/* Format Hint */}
      <p className="text-xs text-gray-400">
        Format: {country.dialCode} {country.placeholder}
      </p>
    </div>
  );
};

