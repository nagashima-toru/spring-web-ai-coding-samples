'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/core/components/PageHeader';
import { MessageTable } from '@/features/messages/components/MessageTable';
import { MessageModal } from '@/features/messages/components/MessageModal';
import { DeleteConfirmDialog } from '@/features/messages/components/DeleteConfirmDialog';
import { LanguageSwitcher } from '@/core/i18n/LanguageSwitcher';
import { RoleBasedComponent } from '@/core/auth/RoleBasedComponent';
import { Button } from '@/core/components/ui/button';
import { Plus, LogOut } from 'lucide-react';
import { useMessageMutations } from '@/features/messages/hooks/useMessageMutations';
import { MessageFormData } from '@/features/messages/validations';
import { MessageResponse } from '@/core/api/generated/models';
import { useAuth } from '@/core/auth/useAuth';
import { usePermission } from '@/core/auth/usePermission';
import { useRouter } from 'next/navigation';
import { ROLES } from '@/core/auth/roles';

/**
 * Home page component for message management.
 * Provides CRUD operations (Create, Read, Update, Delete) for messages.
 * Manages modal states for creating, editing, and deleting messages.
 */
export default function Home() {
  const t = useTranslations('messages');
  const tNav = useTranslations('navigation');
  const router = useRouter();
  const { logout } = useAuth();
  const { canCreate, isReadOnly } = usePermission();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<MessageResponse | null>(null);

  const {
    createMessage: createMutation,
    updateMessage: updateMutation,
    deleteMessage: deleteMutation,
  } = useMessageMutations({
    onCreateSuccess: () => {
      setIsCreateModalOpen(false);
    },
    onUpdateSuccess: () => {
      setIsEditModalOpen(false);
      setSelectedMessage(null);
    },
    onDeleteSuccess: () => {
      setIsDeleteDialogOpen(false);
      setSelectedMessage(null);
    },
    onCreateError: (error: unknown) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 409) {
          console.error('Duplicate code error');
        }
      }
    },
    onUpdateError: (error: unknown) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          console.error('Message not found');
        }
      }
    },
    onDeleteError: (error: unknown) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          console.error('Message not found');
        }
      }
    },
  });

  const handleCreateMessage = useCallback(
    (data: MessageFormData) => {
      createMutation.mutate({ data });
    },
    [createMutation]
  );

  const handleEditMessage = useCallback(
    (data: MessageFormData) => {
      if (selectedMessage?.id) {
        updateMutation.mutate({ id: selectedMessage.id, data });
      }
    },
    [selectedMessage, updateMutation]
  );

  const handleEditClick = useCallback(
    (message: MessageResponse) => {
      updateMutation.reset(); // Clear previous errors
      setSelectedMessage(message);
      setIsEditModalOpen(true);
    },
    [updateMutation]
  );

  const handleDeleteClick = useCallback(
    (message: MessageResponse) => {
      deleteMutation.reset(); // Clear previous errors
      setSelectedMessage(message);
      setIsDeleteDialogOpen(true);
    },
    [deleteMutation]
  );

  const handleDeleteConfirm = useCallback(() => {
    if (selectedMessage?.id) {
      deleteMutation.mutate({ id: selectedMessage.id });
    }
  }, [selectedMessage, deleteMutation]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout, router]);

  const handleCreateClick = useCallback(() => {
    // Guard: VIEWER ロールでは何もしない
    if (!canCreate) {
      return;
    }
    createMutation.reset(); // Clear previous errors
    setIsCreateModalOpen(true);
  }, [canCreate, createMutation]);

  return (
    <main data-testid="messages-page" className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          title={t('pageTitle')}
          description={t('pageDescription')}
          action={
            <RoleBasedComponent allowedRoles={[ROLES.ADMIN]}>
              <Button onClick={handleCreateClick} data-testid="create-message-button">
                <Plus className="h-4 w-4 mr-2" />
                {t('newMessage')}
              </Button>
            </RoleBasedComponent>
          }
          rightContent={
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                {tNav('logout')}
              </Button>
            </div>
          }
        />
        <MessageTable onEdit={handleEditClick} onDelete={handleDeleteClick} />

        <MessageModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSubmit={handleCreateMessage}
          isSubmitting={createMutation.isPending}
          mode="create"
          error={createMutation.error}
        />

        <MessageModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          onSubmit={handleEditMessage}
          initialData={selectedMessage || undefined}
          isSubmitting={updateMutation.isPending}
          mode="edit"
          error={updateMutation.error}
          isReadOnly={isReadOnly}
        />

        <DeleteConfirmDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          message={selectedMessage}
          isDeleting={deleteMutation.isPending}
          error={deleteMutation.error}
        />
      </div>
    </main>
  );
}
