'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/core/components/ui/dialog';
import { Button } from '@/core/components/ui/button';
import { MessageResponse } from '@/core/api/generated/models';
import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getApiErrorMessage } from '@/core/lib/errorHandling';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  message: MessageResponse | null;
  isDeleting?: boolean;
  error?: unknown;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  message,
  isDeleting = false,
  error,
}: DeleteConfirmDialogProps) {
  const t = useTranslations('messages.deleteDialog');
  const tRoot = useTranslations();

  const handleCancel = () => {
    onOpenChange(false);
  };

  const errorMessage = getApiErrorMessage(error, tRoot);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="delete-confirm-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            {t('title')}
          </DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
            {errorMessage}
          </div>
        )}

        {message && (
          <div className="rounded-lg border border-muted bg-muted/50 p-4 space-y-2">
            <div>
              <span className="text-sm font-medium text-muted-foreground">{t('codeLabel')}</span>
              <div className="mt-1">
                <code className="bg-background px-2 py-1 rounded text-sm">{message.code}</code>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">{t('contentLabel')}</span>
              <p className="mt-1 text-sm">{message.content}</p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isDeleting}
            data-testid="delete-cancel-button"
          >
            {t('cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            data-testid="delete-confirm-button"
          >
            {isDeleting ? t('deleting') : t('delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
