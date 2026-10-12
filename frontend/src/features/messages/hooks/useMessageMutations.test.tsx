/**
 * Tests for useMessageMutations hook.
 *
 * Verifies that message mutations properly invalidate queries
 * and handle success/error callbacks.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMessageMutations } from './useMessageMutations';
import * as messageApi from '@/core/api/generated/message/message';
import { queryKeys } from '@/features/messages/query-keys';
import type { ReactNode } from 'react';

// Mock the API module
vi.mock('@/core/api/generated/message/message', () => ({
  useCreateMessage: vi.fn(),
  useUpdateMessage: vi.fn(),
  useDeleteMessage: vi.fn(),
}));

describe('useMessageMutations', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('initialization', () => {
    it('should initialize all mutations', () => {
      const mockCreateMutation = { mutate: vi.fn(), isPending: false, error: null, reset: vi.fn() };
      const mockUpdateMutation = { mutate: vi.fn(), isPending: false, error: null, reset: vi.fn() };
      const mockDeleteMutation = { mutate: vi.fn(), isPending: false, error: null, reset: vi.fn() };

      vi.mocked(messageApi.useCreateMessage).mockReturnValue(mockCreateMutation as never);
      vi.mocked(messageApi.useUpdateMessage).mockReturnValue(mockUpdateMutation as never);
      vi.mocked(messageApi.useDeleteMessage).mockReturnValue(mockDeleteMutation as never);

      const { result } = renderHook(() => useMessageMutations(), { wrapper });

      expect(result.current.createMessage).toBeDefined();
      expect(result.current.updateMessage).toBeDefined();
      expect(result.current.deleteMessage).toBeDefined();
      expect(result.current.isCreating).toBe(false);
      expect(result.current.isUpdating).toBe(false);
      expect(result.current.isDeleting).toBe(false);
    });
  });

  describe('loading states', () => {
    it('should expose loading states for each mutation', () => {
      const mockCreateMutation = { mutate: vi.fn(), isPending: true, error: null, reset: vi.fn() };
      const mockUpdateMutation = { mutate: vi.fn(), isPending: false, error: null, reset: vi.fn() };
      const mockDeleteMutation = { mutate: vi.fn(), isPending: false, error: null, reset: vi.fn() };

      vi.mocked(messageApi.useCreateMessage).mockReturnValue(mockCreateMutation as never);
      vi.mocked(messageApi.useUpdateMessage).mockReturnValue(mockUpdateMutation as never);
      vi.mocked(messageApi.useDeleteMessage).mockReturnValue(mockDeleteMutation as never);

      const { result } = renderHook(() => useMessageMutations(), { wrapper });

      expect(result.current.isCreating).toBe(true);
      expect(result.current.isUpdating).toBe(false);
      expect(result.current.isDeleting).toBe(false);
    });
  });

  describe('callbacks', () => {
    it('should call onCreateSuccess when create succeeds', async () => {
      const onCreateSuccess = vi.fn();
      let capturedOnSuccess: (() => void) | undefined;

      vi.mocked(messageApi.useCreateMessage).mockImplementation((options) => {
        capturedOnSuccess = options?.mutation?.onSuccess as (() => void) | undefined;
        return { mutate: vi.fn(), isPending: false, error: null, reset: vi.fn() } as never;
      });

      vi.mocked(messageApi.useUpdateMessage).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        error: null,
        reset: vi.fn(),
      } as never);
      vi.mocked(messageApi.useDeleteMessage).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        error: null,
        reset: vi.fn(),
      } as never);

      renderHook(() => useMessageMutations({ onCreateSuccess }), { wrapper });

      // Simulate success
      capturedOnSuccess?.();

      await waitFor(() => {
        expect(onCreateSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it('should call onUpdateSuccess when update succeeds', async () => {
      const onUpdateSuccess = vi.fn();
      let capturedOnSuccess: (() => void) | undefined;

      vi.mocked(messageApi.useCreateMessage).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        error: null,
        reset: vi.fn(),
      } as never);

      vi.mocked(messageApi.useUpdateMessage).mockImplementation((options) => {
        capturedOnSuccess = options?.mutation?.onSuccess as (() => void) | undefined;
        return { mutate: vi.fn(), isPending: false, error: null, reset: vi.fn() } as never;
      });

      vi.mocked(messageApi.useDeleteMessage).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        error: null,
        reset: vi.fn(),
      } as never);

      renderHook(() => useMessageMutations({ onUpdateSuccess }), { wrapper });

      // Simulate success
      capturedOnSuccess?.();

      await waitFor(() => {
        expect(onUpdateSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it('should call onDeleteSuccess when delete succeeds', async () => {
      const onDeleteSuccess = vi.fn();
      let capturedOnSuccess: (() => void) | undefined;

      vi.mocked(messageApi.useCreateMessage).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        error: null,
        reset: vi.fn(),
      } as never);
      vi.mocked(messageApi.useUpdateMessage).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        error: null,
        reset: vi.fn(),
      } as never);

      vi.mocked(messageApi.useDeleteMessage).mockImplementation((options) => {
        capturedOnSuccess = options?.mutation?.onSuccess as (() => void) | undefined;
        return { mutate: vi.fn(), isPending: false, error: null, reset: vi.fn() } as never;
      });

      renderHook(() => useMessageMutations({ onDeleteSuccess }), { wrapper });

      // Simulate success
      capturedOnSuccess?.();

      await waitFor(() => {
        expect(onDeleteSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it('should call onCreateError when create fails', async () => {
      const onCreateError = vi.fn();
      const testError = new Error('Create failed');
      let capturedOnError: ((error: unknown) => void) | undefined;

      vi.mocked(messageApi.useCreateMessage).mockImplementation((options) => {
        capturedOnError = options?.mutation?.onError as ((error: unknown) => void) | undefined;
        return { mutate: vi.fn(), isPending: false, error: null, reset: vi.fn() } as never;
      });

      vi.mocked(messageApi.useUpdateMessage).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        error: null,
        reset: vi.fn(),
      } as never);
      vi.mocked(messageApi.useDeleteMessage).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        error: null,
        reset: vi.fn(),
      } as never);

      renderHook(() => useMessageMutations({ onCreateError }), { wrapper });

      // Simulate error
      capturedOnError?.(testError);

      await waitFor(() => {
        expect(onCreateError).toHaveBeenCalledWith(testError);
      });
    });

    it('should call onUpdateError when update fails', async () => {
      const onUpdateError = vi.fn();
      const testError = new Error('Update failed');
      let capturedOnError: ((error: unknown) => void) | undefined;

      vi.mocked(messageApi.useCreateMessage).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        error: null,
        reset: vi.fn(),
      } as never);

      vi.mocked(messageApi.useUpdateMessage).mockImplementation((options) => {
        capturedOnError = options?.mutation?.onError as ((error: unknown) => void) | undefined;
        return { mutate: vi.fn(), isPending: false, error: null, reset: vi.fn() } as never;
      });

      vi.mocked(messageApi.useDeleteMessage).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        error: null,
        reset: vi.fn(),
      } as never);

      renderHook(() => useMessageMutations({ onUpdateError }), { wrapper });

      // Simulate error
      capturedOnError?.(testError);

      await waitFor(() => {
        expect(onUpdateError).toHaveBeenCalledWith(testError);
      });
    });

    it('should call onDeleteError when delete fails', async () => {
      const onDeleteError = vi.fn();
      const testError = new Error('Delete failed');
      let capturedOnError: ((error: unknown) => void) | undefined;

      vi.mocked(messageApi.useCreateMessage).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        error: null,
        reset: vi.fn(),
      } as never);
      vi.mocked(messageApi.useUpdateMessage).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        error: null,
        reset: vi.fn(),
      } as never);

      vi.mocked(messageApi.useDeleteMessage).mockImplementation((options) => {
        capturedOnError = options?.mutation?.onError as ((error: unknown) => void) | undefined;
        return { mutate: vi.fn(), isPending: false, error: null, reset: vi.fn() } as never;
      });

      renderHook(() => useMessageMutations({ onDeleteError }), { wrapper });

      // Simulate error
      capturedOnError?.(testError);

      await waitFor(() => {
        expect(onDeleteError).toHaveBeenCalledWith(testError);
      });
    });
  });

  describe('query invalidation', () => {
    it('should invalidate queries on successful create', async () => {
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
      let capturedOnSuccess: (() => void) | undefined;

      vi.mocked(messageApi.useCreateMessage).mockImplementation((options) => {
        capturedOnSuccess = options?.mutation?.onSuccess as (() => void) | undefined;
        return { mutate: vi.fn(), isPending: false, error: null, reset: vi.fn() } as never;
      });

      vi.mocked(messageApi.useUpdateMessage).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        error: null,
        reset: vi.fn(),
      } as never);
      vi.mocked(messageApi.useDeleteMessage).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        error: null,
        reset: vi.fn(),
      } as never);

      renderHook(() => useMessageMutations(), { wrapper });

      // Simulate success
      capturedOnSuccess?.();

      await waitFor(() => {
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
          queryKey: queryKeys.messages.all,
        });
      });
    });

    it('should invalidate queries on successful update', async () => {
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
      let capturedOnSuccess: (() => void) | undefined;

      vi.mocked(messageApi.useCreateMessage).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        error: null,
        reset: vi.fn(),
      } as never);

      vi.mocked(messageApi.useUpdateMessage).mockImplementation((options) => {
        capturedOnSuccess = options?.mutation?.onSuccess as (() => void) | undefined;
        return { mutate: vi.fn(), isPending: false, error: null, reset: vi.fn() } as never;
      });

      vi.mocked(messageApi.useDeleteMessage).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        error: null,
        reset: vi.fn(),
      } as never);

      renderHook(() => useMessageMutations(), { wrapper });

      // Simulate success
      capturedOnSuccess?.();

      await waitFor(() => {
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
          queryKey: queryKeys.messages.all,
        });
      });
    });

    it('should invalidate queries on successful delete', async () => {
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
      let capturedOnSuccess: (() => void) | undefined;

      vi.mocked(messageApi.useCreateMessage).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        error: null,
        reset: vi.fn(),
      } as never);
      vi.mocked(messageApi.useUpdateMessage).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        error: null,
        reset: vi.fn(),
      } as never);

      vi.mocked(messageApi.useDeleteMessage).mockImplementation((options) => {
        capturedOnSuccess = options?.mutation?.onSuccess as (() => void) | undefined;
        return { mutate: vi.fn(), isPending: false, error: null, reset: vi.fn() } as never;
      });

      renderHook(() => useMessageMutations(), { wrapper });

      // Simulate success
      capturedOnSuccess?.();

      await waitFor(() => {
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
          queryKey: queryKeys.messages.all,
        });
      });
    });
  });
});
