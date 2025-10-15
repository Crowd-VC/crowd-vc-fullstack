import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STEPS } from '../constants';

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="mb-8 mt-8 flex items-center justify-center">
      <div className="flex items-center space-x-8">
        {STEPS.map(({ step, title, subtitle }) => (
          <div key={step} className="flex items-center">
            {step !== 4 && (
              <div className="flex items-center justify-center gap-2">
                <div
                  className={cn(
                    'mb-2 flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                    step === currentStep
                      ? 'bg-slate-500 text-primary-foreground'
                      : step < currentStep
                        ? 'bg-slate-500 text-primary-foreground'
                        : 'bg-slate-900 text-muted-foreground',
                  )}
                >
                  {step < currentStep ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    step
                  )}
                </div>
                <div className="text-left">
                  <div
                    className={cn(
                      'text-sm font-medium',
                      step === currentStep
                        ? 'text-primary'
                        : step < currentStep
                          ? 'text-primary'
                          : 'text-muted-foreground',
                    )}
                  >
                    {title}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {subtitle}
                  </div>
                </div>
              </div>
            )}
            {step < 3 && (
              <div
                className={cn(
                  'mx-6 mt-[-20px] h-0.5 w-20',
                  step < currentStep ? 'bg-primary' : 'bg-muted',
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
