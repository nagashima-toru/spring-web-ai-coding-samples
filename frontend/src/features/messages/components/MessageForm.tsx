'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { messageSchema, MessageFormData } from '@/features/messages/validations';
import { Button } from '@/core/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/core/components/ui/form';
import { Input } from '@/core/components/ui/input';
import { MessageResponse } from '@/core/api/generated/models';
import { getApiErrorMessage } from '@/core/lib/errorHandling';

interface MessageFormProps {
  onSubmit: (data: MessageFormData) => void;
  initialData?: MessageResponse;
  isSubmitting?: boolean;
  onCancel: () => void;
  error?: unknown;
  disabled?: boolean;
}

/**
 * MessageForm component handles creating and editing messages.
 * Uses React Hook Form with Zod validation for form management.
 *
 * @param onSubmit - Callback function called when form is successfully validated and submitted
 * @param initialData - Initial data for editing mode. If provided, form fields will be pre-populated
 * @param isSubmitting - Loading state during form submission
 * @param onCancel - Callback function called when cancel button is clicked
 * @param error - API error object to display error messages from server
 * @param disabled - If true, all form fields will be disabled (read-only mode)
 */
export function MessageForm({
  onSubmit,
  initialData,
  isSubmitting = false,
  onCancel,
  error,
  disabled = false,
}: MessageFormProps) {
  const t = useTranslations('messages.form');
  const tRoot = useTranslations();
  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      code: initialData?.code || '',
      content: initialData?.content || '',
    },
  });

  const handleSubmit = (data: MessageFormData) => {
    onSubmit(data);
  };

  const errorMessage = getApiErrorMessage(error, tRoot);

  return (
    <Form {...form}>
      <form
        data-testid="message-form"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
      >
        {errorMessage && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
            {errorMessage}
          </div>
        )}
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('codeLabel')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('codePlaceholder')}
                  {...field}
                  disabled={isSubmitting || disabled}
                  aria-disabled={isSubmitting || disabled}
                  aria-readonly={disabled}
                  data-testid="message-code-input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('contentLabel')}</FormLabel>
              <FormControl>
                <textarea
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder={t('contentPlaceholder')}
                  {...field}
                  disabled={isSubmitting || disabled}
                  aria-disabled={isSubmitting || disabled}
                  aria-readonly={disabled}
                  data-testid="message-content-input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            data-testid="message-form-cancel"
          >
            {disabled ? t('close') : t('cancel')}
          </Button>
          {!disabled && (
            <Button
              type="submit"
              disabled={isSubmitting}
              aria-disabled={isSubmitting}
              data-testid="message-form-submit"
            >
              {isSubmitting ? t('saving') : t('save')}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
