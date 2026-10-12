import { z } from 'zod';

/**
 * Validation schema for message form data
 */
export const messageSchema = z.object({
  code: z.string().min(1, 'Code is required').max(50, 'Code must be 50 characters or less'),
  content: z
    .string()
    .min(1, 'Content is required')
    .max(500, 'Content must be 500 characters or less'),
});

/**
 * Inferred type from messageSchema
 */
export type MessageFormData = z.infer<typeof messageSchema>;
