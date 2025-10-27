import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

/**
 * ProgressBar Component
 * 
 * Displays a visual progress indicator showing the user's current position
 * in a multi-step onboarding flow.
 * 
 * @param currentStep - The current step number (1-indexed)
 * @param totalSteps - Total number of steps in the flow
 * @param className - Optional additional CSS classes
 * 
 * @example
 * <ProgressBar currentStep={2} totalSteps={5} />
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  className
}) => {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        const isPending = stepNumber > currentStep;

        return (
          <div
            key={stepNumber}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300 ease-in-out",
              // Width: current step is wider for emphasis
              isCurrent ? "w-12" : "w-8",
              // Colors based on state
              isCompleted && "bg-primary",
              isCurrent && "bg-primary",
              isPending && "bg-gray-200"
            )}
            aria-label={`Step ${stepNumber} of ${totalSteps}`}
            aria-current={isCurrent ? 'step' : undefined}
          />
        );
      })}
    </div>
  );
};

