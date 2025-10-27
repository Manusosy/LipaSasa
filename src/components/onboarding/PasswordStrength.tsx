import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Check, X, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthProps {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Password validation requirements
 */
interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    id: 'lowercase',
    label: 'One lowercase letter',
    test: (pwd) => /[a-z]/.test(pwd)
  },
  {
    id: 'uppercase',
    label: 'One uppercase letter',
    test: (pwd) => /[A-Z]/.test(pwd)
  },
  {
    id: 'number',
    label: 'One number',
    test: (pwd) => /[0-9]/.test(pwd)
  },
  {
    id: 'length',
    label: '8 characters min',
    test: (pwd) => pwd.length >= 8
  }
];

/**
 * PasswordStrength Component
 * 
 * An enhanced password input with real-time strength validation.
 * Shows a checklist of requirements and allows toggling password visibility.
 * 
 * @param id - Unique identifier for the input
 * @param label - Label text (defaults to "Password")
 * @param value - Current password value
 * @param onChange - Callback when password changes
 * @param onValidationChange - Callback when validation state changes
 * @param placeholder - Placeholder text
 * @param className - Additional CSS classes
 * 
 * @example
 * <PasswordStrength
 *   id="password"
 *   value={password}
 *   onChange={setPassword}
 *   onValidationChange={setIsPasswordValid}
 * />
 */
export const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  id,
  label = 'Password',
  value,
  onChange,
  onValidationChange,
  placeholder = 'Enter your password',
  className
}) => {
  const [showPassword, setShowPassword] = useState(false);

  // Check which requirements are met
  const requirementStates = PASSWORD_REQUIREMENTS.map(req => ({
    ...req,
    isMet: req.test(value)
  }));

  // Password is valid if all requirements are met
  const isPasswordValid = requirementStates.every(req => req.isMet);

  // Notify parent of validation state changes
  React.useEffect(() => {
    onValidationChange?.(isPasswordValid);
  }, [isPasswordValid, onValidationChange]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Password Input */}
      <div className="space-y-2">
        <Label htmlFor={id} className="text-sm font-medium text-gray-900">
          {label} <span className="text-red-500">*</span>
        </Label>
        
        <div className="relative">
          <Input
            id={id}
            type={showPassword ? 'text' : 'password'}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              "pr-10 transition-all duration-200",
              // Border color based on validation (only if user has typed)
              value.length > 0 && (isPasswordValid ? "border-green-500" : "border-gray-300")
            )}
            autoComplete="new-password"
            required
          />

          {/* Toggle Password Visibility */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-500" />
            ) : (
              <Eye className="h-4 w-4 text-gray-500" />
            )}
          </Button>
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">
          Password must contain:
        </p>
        
        <div className="space-y-1.5">
          {requirementStates.map((requirement) => (
            <div
              key={requirement.id}
              className={cn(
                "flex items-center gap-2 text-sm transition-colors duration-200",
                requirement.isMet ? "text-green-600" : "text-gray-500"
              )}
            >
              {requirement.isMet ? (
                <Check className="h-4 w-4 flex-shrink-0" aria-label="Requirement met" />
              ) : (
                <X className="h-4 w-4 flex-shrink-0" aria-label="Requirement not met" />
              )}
              <span className={cn(requirement.isMet && "font-medium")}>
                {requirement.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Overall Strength Indicator (Optional Visual Enhancement) */}
      {value.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Password strength:</span>
            <span className={cn(
              "font-medium",
              isPasswordValid ? "text-green-600" : "text-orange-600"
            )}>
              {isPasswordValid ? "Strong" : "Weak"}
            </span>
          </div>
          
          {/* Strength Progress Bar */}
          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-300 rounded-full",
                isPasswordValid ? "bg-green-500" : "bg-orange-400"
              )}
              style={{
                width: `${(requirementStates.filter(r => r.isMet).length / PASSWORD_REQUIREMENTS.length) * 100}%`
              }}
              role="progressbar"
              aria-valuenow={requirementStates.filter(r => r.isMet).length}
              aria-valuemin={0}
              aria-valuemax={PASSWORD_REQUIREMENTS.length}
              aria-label="Password strength indicator"
            />
          </div>
        </div>
      )}
    </div>
  );
};

