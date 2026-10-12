import { AlertCircle } from 'lucide-react';
import { cn } from '@/core/lib/utils';

interface ErrorMessageProps {
  message: string;
  className?: string;
  variant?: 'inline' | 'card';
}

export function ErrorMessage({ message, className, variant = 'inline' }: ErrorMessageProps) {
  if (variant === 'card') {
    return (
      <div
        data-testid="error-message"
        className={cn('rounded-lg border border-destructive/50 bg-destructive/10 p-4', className)}
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-destructive">Error</h3>
            <p className="text-sm text-destructive/90 mt-1">{message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="error-message"
      className={cn('flex items-center gap-2 text-sm text-destructive', className)}
    >
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}
