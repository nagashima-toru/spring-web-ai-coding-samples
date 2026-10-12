import '@testing-library/jest-dom';
import { afterEach, vi, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Setup global timer methods for fake timers
beforeEach(() => {
  if (!globalThis.setTimeout) {
    globalThis.setTimeout = vi.fn() as any;
  }
  if (!globalThis.clearTimeout) {
    globalThis.clearTimeout = vi.fn() as any;
  }
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables
vi.mock('process', () => ({
  env: {
    NEXT_PUBLIC_API_URL: 'http://localhost:8080/api',
  },
}));
