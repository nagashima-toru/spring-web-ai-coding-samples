import { z } from 'zod';

export const CODE_MAX_LENGTH = 50;
export const CONTENT_MAX_LENGTH = 500;

/**
 * Translation function for validation messages (keys under `messages.validation`)
 */
export type ValidationTranslator = (key: string, values?: Record<string, number>) => string;

/**
 * Creates the validation schema for message form data with translated error messages
 */
export function createMessageSchema(t: ValidationTranslator) {
  return z.object({
    code: z
      .string()
      .min(1, t('codeRequired'))
      .max(CODE_MAX_LENGTH, t('codeMaxLength', { max: CODE_MAX_LENGTH })),
    content: z
      .string()
      .min(1, t('contentRequired'))
      .max(CONTENT_MAX_LENGTH, t('contentMaxLength', { max: CONTENT_MAX_LENGTH })),
  });
}

/**
 * Inferred type from the message schema
 */
export type MessageFormData = z.infer<ReturnType<typeof createMessageSchema>>;
