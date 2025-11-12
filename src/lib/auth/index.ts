/**
 * Authentication Module Entry Point
 *
 * Exports all authentication-related functions and types
 */

// OAuth functions
export {
  validateCredentials,
  findUserById,
  findUserByEmail,
  validateClientCredentials,
  validateAudience,
  validateScope,
  storeRefreshToken,
  validateRefreshToken,
  revokeRefreshToken,
  cleanupExpiredTokens,
  getUserPermissions,
  mockUsers
} from './oauth';

export type { MockUser } from './oauth';

// Token functions
export {
  generateAccessToken,
  generateRefreshToken,
  validateToken,
  decodeToken,
  isTokenExpired,
  getTokenTimeRemaining,
  refreshAccessToken,
  getUserFromToken,
  generateTokenResponse
} from './tokens';

export type {
  TokenPayload,
  AccessTokenResponse,
  RefreshTokenResponse
} from './tokens';

// Middleware functions
export {
  extractBearerToken,
  validateRequest,
  validateHeaders,
  hasPermission,
  hasOrganizationWriteAccess,
  areWriteOperationsEnabled,
  createUnauthorizedResponse,
  createForbiddenResponse,
  extractSessionId,
  createAuthContext
} from './middleware';

export type { UserContext, AuthResult } from './middleware';
