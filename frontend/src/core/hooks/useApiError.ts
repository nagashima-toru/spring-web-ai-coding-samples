import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { getApiErrorMessage } from '@/core/lib/errorHandling';

interface UseApiErrorReturn {
  error: string | null;
  setError: (error: unknown) => void;
  clearError: () => void;
  handleError: (error: unknown) => string;
}

/**
 * Custom hook for handling API errors with user-friendly messages.
 * Centralizes error handling logic for mutations and API calls.
 *
 * @example
 * const { error, setError, clearError, handleError } = useApiError();
 *
 * const mutation = useCreateMessage({
 *   mutation: {
 *     onError: (err) => setError(err),
 *   },
 * });
 */
export function useApiError(): UseApiErrorReturn {
  const t = useTranslations();
  const [error, setErrorState] = useState<string | null>(null);

  const setError = useCallback(
    (err: unknown) => {
      const message = getApiErrorMessage(err, t);
      setErrorState(message);
    },
    [t]
  );

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  const handleError = useCallback(
    (err: unknown): string => {
      const message = getApiErrorMessage(err, t) ?? 'An unexpected error occurred';
      setErrorState(message);
      return message;
    },
    [t]
  );

  return {
    error,
    setError,
    clearError,
    handleError,
  };
}
