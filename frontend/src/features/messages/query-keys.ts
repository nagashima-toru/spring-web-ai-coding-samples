/**
 * Query key factory for type-safe and centralized query key management.
 *
 * This module provides a centralized way to manage TanStack Query keys,
 * ensuring consistency and type safety across the application.
 *
 * Key benefits:
 * - Type-safe query keys using 'as const'
 * - Centralized management prevents hardcoded strings
 * - Easier refactoring when API endpoints change
 * - Better integration with Orval-generated query keys
 *
 * Usage:
 * ```typescript
 * import { queryKeys } from '@/features/messages/query-keys';
 *
 * // Invalidate all message queries
 * queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
 *
 * // Invalidate specific message
 * queryClient.invalidateQueries({ queryKey: queryKeys.messages.detail(id) });
 * ```
 *
 * @see https://tkdodo.eu/blog/effective-react-query-keys
 * @see https://tkdodo.eu/blog/leveraging-the-query-function-context
 */

import {
  getGetAllMessagesQueryKey,
  getGetMessageByIdQueryKey,
} from '@/core/api/generated/message/message';
import type { GetAllMessagesParams } from '@/core/api/generated/models';

/**
 * Query keys factory for messages.
 * Wraps Orval-generated query key functions for better organization.
 */
export const queryKeys = {
  messages: {
    /**
     * Base key for all message-related queries.
     * Use this to invalidate ALL message queries at once.
     */
    all: ['/api/messages'] as const,

    /**
     * Query key for message list queries.
     * @param params - Optional pagination/filter parameters
     */
    lists: (params?: GetAllMessagesParams) => getGetAllMessagesQueryKey(params),

    /**
     * Query key for individual message detail queries.
     * @param id - Message ID
     */
    detail: (id: number) => getGetMessageByIdQueryKey(id),
  },
} as const;
