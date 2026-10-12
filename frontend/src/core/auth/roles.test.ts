import { describe, it, expect } from 'vitest';
import { ROLES, isAdmin, isViewer, type Role } from './roles';

describe('ROLES', () => {
  it('should define ADMIN role', () => {
    expect(ROLES.ADMIN).toBe('ADMIN');
  });

  it('should define VIEWER role', () => {
    expect(ROLES.VIEWER).toBe('VIEWER');
  });
});

describe('isAdmin', () => {
  it('should return true for ADMIN role', () => {
    expect(isAdmin(ROLES.ADMIN)).toBe(true);
  });

  it('should return false for VIEWER role', () => {
    expect(isAdmin(ROLES.VIEWER)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isAdmin(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isAdmin(undefined)).toBe(false);
  });

  it('should return false for invalid role', () => {
    expect(isAdmin('INVALID' as Role)).toBe(false);
  });
});

describe('isViewer', () => {
  it('should return true for VIEWER role', () => {
    expect(isViewer(ROLES.VIEWER)).toBe(true);
  });

  it('should return false for ADMIN role', () => {
    expect(isViewer(ROLES.ADMIN)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isViewer(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isViewer(undefined)).toBe(false);
  });

  it('should return false for invalid role', () => {
    expect(isViewer('INVALID' as Role)).toBe(false);
  });
});
