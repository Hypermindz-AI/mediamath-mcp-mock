/**
 * JWT Token Management
 * Generates and validates JWT tokens for access and refresh
 */

import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import type { MockUser } from './oauth';

const JWT_SECRET = process.env.JWT_SECRET || 'mock-jwt-secret-change-in-production-12345678';

export interface TokenPayload {
  userId: number;
  email: string;
  organizationId: number;
  role: string;
  iat: number;
  exp: number;
}

export interface AccessTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: 'Bearer';
  scope?: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: 'Bearer';
}

/**
 * Generate an access token (JWT)
 */
export function generateAccessToken(
  user: MockUser,
  expiresIn: number = 86400 // 24 hours in seconds
): string {
  const payload = {
    userId: user.userId,
    email: user.email,
    organizationId: user.organizationId,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn,
    issuer: 'mediamath-mcp-mock',
    audience: 'https://api.mediamath.com',
  });
}

/**
 * Generate a refresh token (opaque random string)
 */
export function generateRefreshToken(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * Validate and decode a JWT token
 */
export function validateToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'mediamath-mcp-mock',
    }) as TokenPayload;

    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Decode token without verification (for inspection)
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Check if a token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  return decoded.exp * 1000 < Date.now();
}

/**
 * Get time remaining for token in seconds
 */
export function getTokenTimeRemaining(token: string): number {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return 0;
  }

  const remaining = Math.floor((decoded.exp * 1000 - Date.now()) / 1000);
  return Math.max(0, remaining);
}

/**
 * Refresh an access token (generate new access + refresh tokens)
 */
export function refreshAccessToken(user: MockUser): AccessTokenResponse {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: 86400, // 24 hours
    token_type: 'Bearer',
  };
}

/**
 * Get user context from a valid token
 */
export function getUserFromToken(token: string): {
  userId: number;
  email: string;
  organizationId: number;
  role: string;
} | null {
  const payload = validateToken(token);
  if (!payload) {
    return null;
  }

  return {
    userId: payload.userId,
    email: payload.email,
    organizationId: payload.organizationId,
    role: payload.role,
  };
}

/**
 * Generate complete token response for OAuth endpoint
 */
export function generateTokenResponse(
  user: MockUser,
  scope?: string
): AccessTokenResponse {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: 86400,
    token_type: 'Bearer',
    scope: scope || 'openid profile email',
  };
}
