'use client';

import { TableCell, TableRow } from '@/core/components/ui/table';
import { Button } from '@/core/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { MessageResponse } from '@/core/api/generated/models';
import { RoleBasedComponent } from '@/core/auth/RoleBasedComponent';
import { ROLES } from '@/core/auth/roles';
import { usePermission } from '@/core/auth/usePermission';

interface MessageTableRowProps {
  message: MessageResponse;
  onEdit?: (message: MessageResponse) => void;
  onDelete?: (message: MessageResponse) => void;
}

export function MessageTableRow({ message, onEdit, onDelete }: MessageTableRowProps) {
  const { canEdit } = usePermission();

  const handleRowClick = (e: React.MouseEvent) => {
    // VIEWER ロールの場合のみ、行クリックで読み取り専用モーダルを開く
    // ボタンのクリックイベントは除外（event.target がボタンまたはその子要素の場合）
    if (!canEdit && onEdit) {
      const target = e.target as HTMLElement;
      if (!target.closest('button')) {
        onEdit(message);
      }
    }
  };

  return (
    <TableRow
      data-testid={`message-row-${message.id}`}
      className={!canEdit ? 'cursor-pointer hover:bg-muted/50' : ''}
      onClick={handleRowClick}
    >
      <TableCell className="font-medium">{message.id}</TableCell>
      <TableCell>
        <code className="bg-muted px-2 py-1 rounded text-sm">{message.code}</code>
      </TableCell>
      <TableCell className="max-w-md truncate">{message.content}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <RoleBasedComponent allowedRoles={[ROLES.ADMIN]}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit?.(message)}
              aria-label={`Edit message ${message.code}`}
              data-testid={`edit-message-button-${message.id}`}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </RoleBasedComponent>
          <RoleBasedComponent allowedRoles={[ROLES.ADMIN]}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete?.(message)}
              aria-label={`Delete message ${message.code}`}
              data-testid={`delete-message-button-${message.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </RoleBasedComponent>
        </div>
      </TableCell>
    </TableRow>
  );
}

interface MessageCardProps {
  message: MessageResponse;
  onEdit?: (message: MessageResponse) => void;
  onDelete?: (message: MessageResponse) => void;
}

export function MessageCard({ message, onEdit, onDelete }: MessageCardProps) {
  const { canEdit } = usePermission();
  const t = useTranslations('messages.table');

  const handleCardClick = (e: React.MouseEvent) => {
    // VIEWER ロールの場合のみ、カードクリックで読み取り専用モーダルを開く
    // ボタンのクリックイベントは除外
    if (!canEdit && onEdit) {
      const target = e.target as HTMLElement;
      if (!target.closest('button')) {
        onEdit(message);
      }
    }
  };

  return (
    <div
      data-testid={`message-row-${message.id}`}
      className={`p-4 space-y-3 ${!canEdit ? 'cursor-pointer hover:bg-muted/50' : ''}`}
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{t('id')}:</span>
            <span className="font-medium">{message.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{t('code')}:</span>
            <code className="bg-muted px-2 py-1 rounded text-sm">{message.code}</code>
          </div>
        </div>
        <div className="flex gap-2">
          <RoleBasedComponent allowedRoles={[ROLES.ADMIN]}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit?.(message)}
              aria-label={`Edit message ${message.code}`}
              data-testid={`edit-message-button-${message.id}`}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </RoleBasedComponent>
          <RoleBasedComponent allowedRoles={[ROLES.ADMIN]}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete?.(message)}
              aria-label={`Delete message ${message.code}`}
              data-testid={`delete-message-button-${message.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </RoleBasedComponent>
        </div>
      </div>
      <div>
        <span className="text-xs text-muted-foreground">{t('content')}:</span>
        <p className="mt-1 text-sm">{message.content}</p>
      </div>
    </div>
  );
}
