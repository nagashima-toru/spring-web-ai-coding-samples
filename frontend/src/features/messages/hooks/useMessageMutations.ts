/**
 * Custom hook for message mutations with centralized cache invalidation.
 *
 * This hook consolidates all message mutations (create, update, delete) with
 * consistent error handling and cache invalidation logic.
 *
 * Benefits:
 * - Centralized cache invalidation using query key factory
 * - Consistent error handling across all mutations
 * - Simplified component code
 * - Type-safe mutation operations
 *
 * @example
 * ```typescript
 * const {
 *   createMessage,
 *   updateMessage,
 *   deleteMessage,
 *   isCreating,
 *   isUpdating,
 *   isDeleting,
 * } = useMessageMutations();
 *
 * // Create a message
 * createMessage.mutate({ data: { code: 'CODE', content: 'Content' } });
 * ```
 */

import { useQueryClient } from '@tanstack/react-query';
import {
  useCreateMessage,
  useUpdateMessage,
  useDeleteMessage,
} from '@/core/api/generated/message/message';
import { queryKeys } from '@/features/messages/query-keys';

interface UseMessageMutationsOptions {
  /**
   * Callback fired on successful creation
   */
  onCreateSuccess?: () => void;
  /**
   * Callback fired on successful update
   */
  onUpdateSuccess?: () => void;
  /**
   * Callback fired on successful deletion
   */
  onDeleteSuccess?: () => void;
  /**
   * Callback fired on create error
   */
  onCreateError?: (error: unknown) => void;
  /**
   * Callback fired on update error
   */
  onUpdateError?: (error: unknown) => void;
  /**
   * Callback fired on delete error
   */
  onDeleteError?: (error: unknown) => void;
}

/**
 * Hook for managing message mutations with centralized cache invalidation.
 *
 * Automatically invalidates message queries on success to keep UI in sync.
 */
export function useMessageMutations(options: UseMessageMutationsOptions = {}) {
  const queryClient = useQueryClient();

  const createMutation = useCreateMessage({
    mutation: {
      onSuccess: () => {
        // Invalidate all message queries to refetch latest data
        queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
        options.onCreateSuccess?.();
      },
      onError: (error: unknown) => {
        console.error('Failed to create message:', error);
        options.onCreateError?.(error);
      },
    },
  });

  const updateMutation = useUpdateMessage({
    mutation: {
      onSuccess: () => {
        // Invalidate all message queries to refetch latest data
        queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
        options.onUpdateSuccess?.();
      },
      onError: (error: unknown) => {
        console.error('Failed to update message:', error);
        options.onUpdateError?.(error);
      },
    },
  });

  const deleteMutation = useDeleteMessage({
    mutation: {
      onSuccess: () => {
        // Invalidate all message queries to refetch latest data
        queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
        options.onDeleteSuccess?.();
      },
      onError: (error: unknown) => {
        console.error('Failed to delete message:', error);
        options.onDeleteError?.(error);
      },
    },
  });

  return {
    createMessage: createMutation,
    updateMessage: updateMutation,
    deleteMessage: deleteMutation,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
