/**
 * Authentication Middleware
 * Request validation and authorization helpers
 */

import { validateToken, getUserFromToken } from './tokens';
import { getUserPermissions } from './oauth';

export interface UserContext {
  userId: number;
  email: string;
  organizationId: number;
  role: string;
  permissions: {
    canReadAll: boolean;
    canWriteCampaigns: boolean;
    canWriteStrategies: boolean;
    canManageUsers: boolean;
    canManageOrganizations: boolean;
  };
}

export interface AuthResult {
  success: boolean;
  context?: UserContext;
  error?: string;
  status?: number;
}

/**
 * Extract Bearer token from Authorization header
 */
export function extractBearerToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Extract session ID from MCP-Session-Id header
 */
export function extractSessionId(request: Request): string | null {
  return request.headers.get('MCP-Session-Id');
}

/**
 * Validate request and extract user context
 */
export function validateRequest(request: Request): AuthResult {
  const token = extractBearerToken(request);

  if (!token) {
    return {
      success: false,
      error: 'Missing Authorization header',
      status: 401,
    };
  }

  const userInfo = getUserFromToken(token);
  if (!userInfo) {
    return {
      success: false,
      error: 'Invalid or expired token',
      status: 401,
    };
  }

  const permissions = getUserPermissions(userInfo.role);

  return {
    success: true,
    context: {
      ...userInfo,
      permissions,
    },
  };
}

/**
 * Validate required headers for MCP requests
 */
export function validateHeaders(request: Request): {
  valid: boolean;
  error?: string;
} {
  const contentType = request.headers.get('Content-Type');

  if (!contentType || !contentType.includes('application/json')) {
    return {
      valid: false,
      error: 'Content-Type must be application/json',
    };
  }

  return { valid: true };
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  context: UserContext,
  permission: keyof UserContext['permissions']
): boolean {
  return context.permissions[permission];
}

/**
 * Check if user has write access to an organization
 */
export function hasOrganizationWriteAccess(
  context: UserContext,
  targetOrganizationId: number
): boolean {
  // User must belong to the target organization
  if (context.organizationId !== targetOrganizationId) {
    return false;
  }

  // User must have write permissions
  return (
    context.permissions.canWriteCampaigns ||
    context.permissions.canWriteStrategies ||
    context.permissions.canManageOrganizations
  );
}

/**
 * Check if write operations are enabled (via environment variable)
 */
export function areWriteOperationsEnabled(): boolean {
  return process.env.ENABLE_WRITE_OPERATIONS !== 'false';
}

/**
 * Create unauthorized response
 */
export function createUnauthorizedResponse(message: string = 'Unauthorized'): Response {
  return new Response(
    JSON.stringify({
      error: 'unauthorized',
      error_description: message,
    }),
    {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'WWW-Authenticate': 'Bearer',
      },
    }
  );
}

/**
 * Create forbidden response
 */
export function createForbiddenResponse(message: string = 'Forbidden'): Response {
  return new Response(
    JSON.stringify({
      error: 'access_denied',
      error_description: message,
    }),
    {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Create auth context for tool execution
 */
export function createAuthContext(userContext: UserContext): {
  user: UserContext;
  hasPermission: (permission: keyof UserContext['permissions']) => boolean;
  canWriteToOrganization: (orgId: number) => boolean;
} {
  return {
    user: userContext,
    hasPermission: (permission) => hasPermission(userContext, permission),
    canWriteToOrganization: (orgId) => hasOrganizationWriteAccess(userContext, orgId),
  };
}
