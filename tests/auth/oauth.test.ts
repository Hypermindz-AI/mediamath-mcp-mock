/**
 * OAuth Authentication Tests
 */

import { describe, it, expect } from 'vitest';
import {
  validateCredentials,
  findUserById,
  findUserByEmail,
  validateClientCredentials,
  validateAudience,
  validateScope,
  storeRefreshToken,
  validateRefreshToken,
  getUserPermissions,
  mockUsers
} from '@/lib/auth/oauth';

describe('OAuth - User Validation', () => {
  it('should validate correct credentials', () => {
    const user = validateCredentials('admin@acme.com', 'password123');
    expect(user).not.toBeNull();
    expect(user?.email).toBe('admin@acme.com');
    expect(user?.userId).toBe(1);
    expect(user?.organizationId).toBe(100048);
    expect(user?.role).toBe('ADMIN');
  });

  it('should reject invalid password', () => {
    const user = validateCredentials('admin@acme.com', 'wrongpassword');
    expect(user).toBeNull();
  });

  it('should reject invalid email', () => {
    const user = validateCredentials('nonexistent@acme.com', 'password123');
    expect(user).toBeNull();
  });

  it('should reject inactive users', () => {
    const user = validateCredentials('inactive@acme.com', 'password123');
    expect(user).toBeNull();
  });

  it('should be case-insensitive for email', () => {
    const user = validateCredentials('ADMIN@ACME.COM', 'password123');
    expect(user).not.toBeNull();
    expect(user?.email).toBe('admin@acme.com');
  });
});

describe('OAuth - User Lookup', () => {
  it('should find user by ID', () => {
    const user = findUserById(1);
    expect(user).not.toBeNull();
    expect(user?.email).toBe('admin@acme.com');
  });

  it('should return null for non-existent user ID', () => {
    const user = findUserById(999);
    expect(user).toBeNull();
  });

  it('should find user by email', () => {
    const user = findUserByEmail('trader@acme.com');
    expect(user).not.toBeNull();
    expect(user?.userId).toBe(2);
  });

  it('should return null for non-existent email', () => {
    const user = findUserByEmail('nonexistent@example.com');
    expect(user).toBeNull();
  });
});

describe('OAuth - Client Validation', () => {
  it('should validate correct client credentials', () => {
    const isValid = validateClientCredentials(
      'mediamath_mcp_client',
      'mock_client_secret'
    );
    expect(isValid).toBe(true);
  });

  it('should validate test client credentials', () => {
    const isValid = validateClientCredentials('test_client', 'test_secret');
    expect(isValid).toBe(true);
  });

  it('should reject invalid client ID', () => {
    const isValid = validateClientCredentials('invalid_client', 'mock_client_secret');
    expect(isValid).toBe(false);
  });

  it('should reject invalid client secret', () => {
    const isValid = validateClientCredentials(
      'mediamath_mcp_client',
      'wrong_secret'
    );
    expect(isValid).toBe(false);
  });
});

describe('OAuth - Audience Validation', () => {
  it('should validate correct audience', () => {
    const isValid = validateAudience('https://api.mediamath.com');
    expect(isValid).toBe(true);
  });

  it('should validate alternative audience', () => {
    const isValid = validateAudience('https://t1.mediamath.com/api/v2.0');
    expect(isValid).toBe(true);
  });

  it('should reject invalid audience', () => {
    const isValid = validateAudience('https://evil.com');
    expect(isValid).toBe(false);
  });
});

describe('OAuth - Scope Validation', () => {
  it('should validate single scope', () => {
    const isValid = validateScope('openid');
    expect(isValid).toBe(true);
  });

  it('should validate multiple scopes', () => {
    const isValid = validateScope('openid profile email');
    expect(isValid).toBe(true);
  });

  it('should reject invalid scope', () => {
    const isValid = validateScope('invalid_scope');
    expect(isValid).toBe(false);
  });

  it('should reject partially invalid scopes', () => {
    const isValid = validateScope('openid invalid_scope email');
    expect(isValid).toBe(false);
  });
});

describe('OAuth - Refresh Token Management', () => {
  it('should store and validate refresh token', () => {
    const token = 'test_refresh_token_123';
    storeRefreshToken(token, 1);

    const userId = validateRefreshToken(token);
    expect(userId).toBe(1);
  });

  it('should return null for invalid refresh token', () => {
    const userId = validateRefreshToken('invalid_token');
    expect(userId).toBeNull();
  });

  it('should handle multiple refresh tokens', () => {
    storeRefreshToken('token1', 1);
    storeRefreshToken('token2', 2);

    expect(validateRefreshToken('token1')).toBe(1);
    expect(validateRefreshToken('token2')).toBe(2);
  });
});

describe('OAuth - Permissions', () => {
  it('should return admin permissions', () => {
    const permissions = getUserPermissions('ADMIN');
    expect(permissions).toContain('read:all');
    expect(permissions).toContain('write:all');
    expect(permissions).toContain('manage:users');
  });

  it('should return trader permissions', () => {
    const permissions = getUserPermissions('TRADER');
    expect(permissions).toContain('read:all');
    expect(permissions).toContain('write:campaigns');
    expect(permissions).not.toContain('manage:users');
  });

  it('should return viewer permissions', () => {
    const permissions = getUserPermissions('VIEWER');
    expect(permissions).toContain('read:campaigns');
    expect(permissions).not.toContain('write:campaigns');
  });

  it('should return empty array for unknown role', () => {
    const permissions = getUserPermissions('UNKNOWN_ROLE');
    expect(permissions).toEqual([]);
  });
});

describe('OAuth - Mock Users Database', () => {
  it('should have 10 users', () => {
    expect(mockUsers).toHaveLength(10);
  });

  it('should have users in org 100048', () => {
    const orgUsers = mockUsers.filter((u) => u.organizationId === 100048);
    expect(orgUsers.length).toBeGreaterThan(0);
  });

  it('should have all required user fields', () => {
    mockUsers.forEach((user) => {
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('password');
      expect(user).toHaveProperty('userId');
      expect(user).toHaveProperty('organizationId');
      expect(user).toHaveProperty('role');
      expect(user).toHaveProperty('firstName');
      expect(user).toHaveProperty('lastName');
      expect(user).toHaveProperty('status');
      expect(user).toHaveProperty('createdAt');
    });
  });

  it('should have unique user IDs', () => {
    const userIds = mockUsers.map((u) => u.userId);
    const uniqueIds = new Set(userIds);
    expect(uniqueIds.size).toBe(mockUsers.length);
  });

  it('should have unique emails', () => {
    const emails = mockUsers.map((u) => u.email);
    const uniqueEmails = new Set(emails);
    expect(uniqueEmails.size).toBe(mockUsers.length);
  });
});
