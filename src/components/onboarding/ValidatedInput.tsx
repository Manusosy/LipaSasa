import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ValidatedInputProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  validate?: (value: string) => { isValid: boolean; errorMessage?: string };
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  className?: string;
  helperText?: string;
  showValidationIcon?: boolean;
}

/**
 * ValidatedInput Component
 * 
 * An enhanced input component that provides real-time validation feedback with
 * visual states (default, focused, valid, invalid) and error messages.
 * 
 * @param id - Unique identifier for the input
 * @param label - Label text displayed above the input
 * @param type - Input type (text, email, tel, etc.)
 * @param placeholder - Placeholder text
 * @param value - Current input value
 * @param onChange - Callback when value changes
 * @param onBlur - Callback when input loses focus
 * @param validate - Optional validation function
 * @param required - Whether the field is required
 * @param disabled - Whether the input is disabled
 * @param autoComplete - Autocomplete attribute
 * @param className - Additional CSS classes
 * @param helperText - Helper text shown below the input
 * @param showValidationIcon - Whether to show checkmark when valid
 * 
 * @example
 * <ValidatedInput
 *   id="email"
 *   label="Email"
 *   type="email"
 *   value={email}
 *   onChange={setEmail}
 *   validate={(val) => ({
 *     isValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
 *     errorMessage: 'Please enter a valid email'
 *   })}
 *   required
 * />
 */
export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  validate,
  required = false,
  disabled = false,
  autoComplete,
  className,
  helperText,
  showValidationIcon = true
}) => {
  const [touched, setTouched] = useState(false);
  const [focused, setFocused] = useState(false);

  // Run validation if provided
  const validationResult = validate ? validate(value) : { isValid: true };
  const { isValid, errorMessage } = validationResult;

  // Show error only if touched and invalid
  const showError = touched && !focused && !isValid && value.length > 0;
  
  // Show success checkmark if valid and has content
  const showSuccess = isValid && value.length > 0 && showValidationIcon;

  const handleBlur = () => {
    setTouched(true);
    setFocused(false);
    onBlur?.();
  };

  const handleFocus = () => {
    setFocused(true);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label */}
      <Label htmlFor={id} className="text-sm font-medium text-gray-900">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {/* Input Container */}
      <div className="relative">
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          onFocus={handleFocus}
          disabled={disabled}
          autoComplete={autoComplete}
          required={required}
          className={cn(
            "pr-10 transition-all duration-200",
            // Border colors based on state
            showError && "border-red-500 focus-visible:ring-red-500",
            showSuccess && "border-green-500",
            // Background color when disabled
            disabled && "bg-gray-50 cursor-not-allowed"
          )}
          aria-invalid={showError}
          aria-describedby={
            showError ? `${id}-error` : helperText ? `${id}-helper` : undefined
          }
        />

        {/* Validation Icons */}
        {showSuccess && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Check className="h-5 w-5 text-green-500" aria-label="Valid input" />
          </div>
        )}

        {showError && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <AlertCircle 
              className="h-5 w-5 text-red-500" 
              aria-label="Invalid input" 
            />
          </div>
        )}
      </div>

      {/* Helper Text or Error Message */}
      {showError && errorMessage ? (
        <p id={`${id}-error`} className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5" />
          {errorMessage}
        </p>
      ) : required && !touched && !value ? (
        <p id={`${id}-helper`} className="text-sm text-red-600">
          This field is required.
        </p>
      ) : helperText ? (
        <p id={`${id}-helper`} className="text-sm text-gray-500">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

