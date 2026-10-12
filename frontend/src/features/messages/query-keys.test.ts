/**
 * Tests for query key factory.
 *
 * Ensures query keys are properly typed and generated correctly
 * for cache invalidation and query management.
 */

import { describe, it, expect } from 'vitest';
import { queryKeys } from './query-keys';

describe('queryKeys', () => {
  describe('messages', () => {
    it('should have correct base query key', () => {
      expect(queryKeys.messages.all).toEqual(['/api/messages']);
    });

    it('should generate list query key without params', () => {
      const key = queryKeys.messages.lists();
      expect(key).toEqual(['/api/messages']);
    });

    it('should generate list query key with params', () => {
      const params = { page: 0, size: 10, sort: 'id,asc' };
      const key = queryKeys.messages.lists(params);
      expect(key).toEqual(['/api/messages', params]);
    });

    it('should generate detail query key', () => {
      const id = 123;
      const key = queryKeys.messages.detail(id);
      // Orval generates the ID as part of the URL path
      expect(key).toEqual([`/api/messages/${id}`]);
    });

    it('should maintain type safety with as const', () => {
      // This test ensures the types are correct at compile time
      // The 'as const' assertion makes arrays readonly tuples
      const baseKey: readonly [string] = queryKeys.messages.all;
      expect(baseKey).toBeDefined();
    });
  });

  describe('query key hierarchy', () => {
    it('should allow invalidating all message queries', () => {
      // Test that the base key can be used for broad invalidation
      const allMessagesKey = queryKeys.messages.all;
      const listKey = queryKeys.messages.lists();
      const detailKey = queryKeys.messages.detail(1);

      // All message queries should start with the base key
      expect(listKey[0]).toBe(allMessagesKey[0]);
      // Detail key includes ID in URL path, but starts with base path
      expect(detailKey[0]).toContain('/api/messages');
    });

    it('should generate unique keys for different detail queries', () => {
      const key1 = queryKeys.messages.detail(1);
      const key2 = queryKeys.messages.detail(2);

      expect(key1).not.toEqual(key2);
      expect(key1[0]).toBe('/api/messages/1');
      expect(key2[0]).toBe('/api/messages/2');
    });

    it('should generate unique keys for different list params', () => {
      const key1 = queryKeys.messages.lists({ page: 0 });
      const key2 = queryKeys.messages.lists({ page: 1 });

      expect(key1).not.toEqual(key2);
    });
  });
});
