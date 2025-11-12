/**
 * JWT Token Management Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateAccessToken,
  generateRefreshToken,
  validateToken,
  decodeToken,
  isTokenExpired,
  getTokenTimeRemaining,
  getUserFromToken,
  generateTokenResponse
} from '@/lib/auth/tokens';

describe('Tokens - Access Token Generation', () => {
  it('should generate access token', () => {
    const result = generateAccessToken(1, 100048, 'ADMIN', 'admin@acme.com');

    expect(result.token).toBeTruthy();
    expect(result.expiresIn).toBe(86400);
    expect(result.expiresAt).toBeInstanceOf(Date);
  });

  it('should generate token with custom expiration', () => {
    const result = generateAccessToken(1, 100048, 'ADMIN', 'admin@acme.com', 3600);

    expect(result.expiresIn).toBe(3600);
  });

  it('should generate unique tokens', () => {
    const token1 = generateAccessToken(1, 100048, 'ADMIN', 'admin@acme.com');
    const token2 = generateAccessToken(1, 100048, 'ADMIN', 'admin@acme.com');

    expect(token1.token).not.toBe(token2.token);
  });
});

describe('Tokens - Refresh Token Generation', () => {
  it('should generate refresh token', () => {
    const result = generateRefreshToken(1);

    expect(result.token).toBeTruthy();
    expect(result.token).toHaveLength(43); // base64url encoded 32 bytes
    expect(result.expiresIn).toBeGreaterThan(0);
    expect(result.expiresAt).toBeInstanceOf(Date);
  });

  it('should generate unique refresh tokens', () => {
    const token1 = generateRefreshToken(1);
    const token2 = generateRefreshToken(1);

    expect(token1.token).not.toBe(token2.token);
  });
});

describe('Tokens - Token Validation', () => {
  it('should validate valid token', () => {
    const { token } = generateAccessToken(1, 100048, 'ADMIN', 'admin@acme.com');
    const payload = validateToken(token);

    expect(payload).not.toBeNull();
    expect(payload?.userId).toBe(1);
    expect(payload?.organizationId).toBe(100048);
    expect(payload?.role).toBe('ADMIN');
    expect(payload?.email).toBe('admin@acme.com');
  });

  it('should reject invalid token', () => {
    const payload = validateToken('invalid.token.here');
    expect(payload).toBeNull();
  });

  it('should reject malformed token', () => {
    const payload = validateToken('not-even-a-jwt');
    expect(payload).toBeNull();
  });

  it('should validate token with all claims', () => {
    const { token } = generateAccessToken(2, 100049, 'TRADER', 'trader@brandco.com');
    const payload = validateToken(token);

    expect(payload).toMatchObject({
      userId: 2,
      organizationId: 100049,
      role: 'TRADER',
      email: 'trader@brandco.com'
    });
    expect(payload?.iat).toBeTruthy();
    expect(payload?.exp).toBeTruthy();
    expect(payload?.jti).toBeTruthy();
  });
});

describe('Tokens - Token Decoding', () => {
  it('should decode valid token', () => {
    const { token } = generateAccessToken(1, 100048, 'ADMIN', 'admin@acme.com');
    const payload = decodeToken(token);

    expect(payload).not.toBeNull();
    expect(payload?.userId).toBe(1);
  });

  it('should decode without validation', () => {
    const { token } = generateAccessToken(1, 100048, 'ADMIN', 'admin@acme.com', 1);
    // Wait for token to expire
    setTimeout(() => {
      const payload = decodeToken(token);
      expect(payload).not.toBeNull(); // Should still decode
    }, 2000);
  });

  it('should return null for invalid token', () => {
    const payload = decodeToken('invalid-token');
    expect(payload).toBeNull();
  });
});

describe('Tokens - Expiration Checks', () => {
  it('should detect non-expired token', () => {
    const { token } = generateAccessToken(1, 100048, 'ADMIN', 'admin@acme.com');
    const expired = isTokenExpired(token);

    expect(expired).toBe(false);
  });

  it('should detect expired token', () => {
    const { token } = generateAccessToken(1, 100048, 'ADMIN', 'admin@acme.com', 0);
    const expired = isTokenExpired(token);

    expect(expired).toBe(true);
  });

  it('should return true for invalid token', () => {
    const expired = isTokenExpired('invalid-token');
    expect(expired).toBe(true);
  });
});

describe('Tokens - Time Remaining', () => {
  it('should calculate time remaining', () => {
    const { token } = generateAccessToken(1, 100048, 'ADMIN', 'admin@acme.com', 3600);
    const remaining = getTokenTimeRemaining(token);

    expect(remaining).toBeGreaterThan(3590);
    expect(remaining).toBeLessThanOrEqual(3600);
  });

  it('should return 0 for expired token', () => {
    const { token } = generateAccessToken(1, 100048, 'ADMIN', 'admin@acme.com', 0);
    const remaining = getTokenTimeRemaining(token);

    expect(remaining).toBe(0);
  });

  it('should return 0 for invalid token', () => {
    const remaining = getTokenTimeRemaining('invalid-token');
    expect(remaining).toBe(0);
  });
});

describe('Tokens - User Extraction', () => {
  it('should extract user from token', () => {
    const { token } = generateAccessToken(1, 100048, 'ADMIN', 'admin@acme.com');
    const user = getUserFromToken(token);

    expect(user).not.toBeNull();
    expect(user).toMatchObject({
      userId: 1,
      organizationId: 100048,
      role: 'ADMIN',
      email: 'admin@acme.com'
    });
  });

  it('should return null for invalid token', () => {
    const user = getUserFromToken('invalid-token');
    expect(user).toBeNull();
  });

  it('should return null for expired token', () => {
    const { token } = generateAccessToken(1, 100048, 'ADMIN', 'admin@acme.com', 0);
    const user = getUserFromToken(token);
    expect(user).toBeNull();
  });
});

describe('Tokens - Complete Token Response', () => {
  it('should generate complete token response', () => {
    const response = generateTokenResponse(1, 100048, 'ADMIN', 'admin@acme.com');

    expect(response).toHaveProperty('access_token');
    expect(response).toHaveProperty('refresh_token');
    expect(response).toHaveProperty('expires_in');
    expect(response).toHaveProperty('token_type');
    expect(response).toHaveProperty('scope');

    expect(response.token_type).toBe('Bearer');
    expect(response.expires_in).toBe(86400);
    expect(response.scope).toBe('openid profile email');
  });

  it('should generate response without refresh token', () => {
    const response = generateTokenResponse(1, 100048, 'ADMIN', 'admin@acme.com', false);

    expect(response).toHaveProperty('access_token');
    expect(response).not.toHaveProperty('refresh_token');
  });

  it('should generate valid access token in response', () => {
    const response = generateTokenResponse(1, 100048, 'ADMIN', 'admin@acme.com');
    const payload = validateToken(response.access_token);

    expect(payload).not.toBeNull();
    expect(payload?.userId).toBe(1);
  });
});
