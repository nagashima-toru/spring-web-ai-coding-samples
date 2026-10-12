/**
 * Type guard to check if an object has a specific property
 */
function hasProperty<K extends PropertyKey>(obj: unknown, key: K): obj is Record<K, unknown> {
  return typeof obj === 'object' && obj !== null && key in obj;
}

/**
 * Extract user-friendly error message from API error.
 * Returns translation keys via the provided t function.
 *
 * @param error - The error object from API call
 * @param t - Translation function (e.g. from useTranslations())
 */
export function getApiErrorMessage(error: unknown, t: (key: string) => string): string | null {
  if (!error) return null;

  // Type guard for axios-like error structure
  const response = hasProperty(error, 'response')
    ? (error.response as { status?: number; data?: { message?: string } })
    : undefined;
  const status = response?.status;

  const errorMessage = hasProperty(error, 'message')
    ? (error.message as string | undefined)
    : undefined;
  const message = response?.data?.message || errorMessage;

  if (status === 409) {
    return t('messages.errors.conflict');
  }
  if (status === 404) {
    return t('messages.errors.notFound');
  }
  if (status === 400) {
    return message || t('messages.errors.badRequest');
  }
  if (status === 500) {
    return t('messages.errors.serverError');
  }
  const code = hasProperty(error, 'code') ? (error.code as string | undefined) : undefined;
  if (code === 'ECONNABORTED' || code === 'ERR_NETWORK') {
    return t('messages.errors.networkError');
  }

  return message || t('messages.errors.unexpected');
}
