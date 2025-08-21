import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  { id: 1, title: 'Business Info', description: 'Tell us about your business' },
  { id: 2, title: 'Payment Setup', description: 'Configure payment methods' },
  { id: 3, title: 'Select Plan', description: 'Choose your subscription' },
  { id: 4, title: 'Review', description: 'Review and confirm' }
];

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  totalSteps
}) => {
  return (
    <div className="flex justify-between items-center">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300",
                step.id < currentStep
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : step.id === currentStep
                  ? "bg-primary text-primary-foreground shadow-glow ring-2 ring-primary/20"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {step.id < currentStep ? (
                <Check className="w-5 h-5" />
              ) : (
                step.id
              )}
            </div>
            <div className="mt-2 text-center">
              <p
                className={cn(
                  "text-sm font-medium",
                  step.id <= currentStep
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {step.title}
              </p>
              <p className="text-xs text-muted-foreground hidden sm:block">
                {step.description}
              </p>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "flex-1 h-0.5 mx-4 transition-colors duration-300",
                step.id < currentStep
                  ? "bg-primary"
                  : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
};