'use client';

import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/core/components/ui/dialog';
import { MessageForm } from './MessageForm';
import { MessageFormData } from '@/features/messages/validations';
import { MessageResponse } from '@/core/api/generated/models';
import { usePermission } from '@/core/auth/usePermission';

interface MessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: MessageFormData) => void;
  initialData?: MessageResponse;
  isSubmitting?: boolean;
  mode: 'create' | 'edit';
  error?: unknown;
  isReadOnly?: boolean;
}

export function MessageModal({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isSubmitting = false,
  mode,
  error,
  isReadOnly = false,
}: MessageModalProps) {
  const t = useTranslations('messages');
  const { canCreate } = usePermission();

  const handleCancel = () => {
    onOpenChange(false);
  };

  // VIEWER ロールの場合、作成モードでモーダルを表示しない
  if (mode === 'create' && !canCreate) {
    return null;
  }

  const title =
    mode === 'create'
      ? t('modal.createTitle')
      : isReadOnly
        ? t('form.viewTitle')
        : t('modal.editTitle');
  const description =
    mode === 'create'
      ? t('form.createDescription')
      : isReadOnly
        ? t('form.viewDescription')
        : t('form.editDescription');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="message-modal">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <MessageForm
          onSubmit={onSubmit}
          initialData={initialData}
          isSubmitting={isSubmitting}
          onCancel={handleCancel}
          error={error}
          disabled={isReadOnly}
        />
      </DialogContent>
    </Dialog>
  );
}
