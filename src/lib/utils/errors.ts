/**
 * Error Categories and Handling
 * Provides rich error context for MCP responses
 */

export enum ErrorCategory {
  AUTHENTICATION_FAILED = 'authentication_failed',
  ACCESS_DENIED = 'access_denied',
  NOT_FOUND = 'not_found',
  VALIDATION_ERROR = 'validation_error',
  RELATIONSHIP_ERROR = 'relationship_error',
  OPERATION_FAILED = 'operation_failed',
}

export interface CategorizedError {
  category: ErrorCategory;
  message: string;
  guidance: string;
  details?: Record<string, any>;
}

/**
 * Create a categorized error with guidance
 */
export function createError(
  category: ErrorCategory,
  message: string,
  guidance: string,
  details?: Record<string, any>
): CategorizedError {
  return {
    category,
    message,
    guidance,
    details,
  };
}

/**
 * Authentication errors
 */
export function authenticationError(message: string, details?: Record<string, any>): CategorizedError {
  return createError(
    ErrorCategory.AUTHENTICATION_FAILED,
    message,
    '🔒 Please check your credentials and try again. Use POST /api/oauth/token to get a valid access token.',
    details
  );
}

/**
 * Access denied errors (authorization)
 */
export function accessDeniedError(message: string, requiredRole?: string): CategorizedError {
  const guidance = requiredRole
    ? `⛔ Your role does not have sufficient permissions. Required role: ${requiredRole}.`
    : '⛔ You do not have permission to perform this action.';

  return createError(
    ErrorCategory.ACCESS_DENIED,
    message,
    guidance,
    requiredRole ? { requiredRole } : undefined
  );
}

/**
 * Not found errors
 */
export function notFoundError(
  resourceType: string,
  identifier: string | number,
  suggestion?: string
): CategorizedError {
  const guidance = suggestion
    ? `❓ ${resourceType} with ID ${identifier} not found. ${suggestion}`
    : `❓ ${resourceType} with ID ${identifier} not found. Please verify the ID and try again.`;

  return createError(
    ErrorCategory.NOT_FOUND,
    `${resourceType} not found`,
    guidance,
    { resourceType, identifier }
  );
}

/**
 * Validation errors
 */
export function validationError(field: string, message: string, allowedValues?: any[]): CategorizedError {
  let guidance = `⚠️ Invalid value for '${field}': ${message}`;

  if (allowedValues && allowedValues.length > 0) {
    guidance += `\nAllowed values: ${allowedValues.join(', ')}`;
  }

  return createError(
    ErrorCategory.VALIDATION_ERROR,
    `Validation failed for field: ${field}`,
    guidance,
    { field, allowedValues }
  );
}

/**
 * Relationship validation errors
 */
export function relationshipError(
  parentType: string,
  parentId: number,
  childType: string,
  reason: string
): CategorizedError {
  return createError(
    ErrorCategory.RELATIONSHIP_ERROR,
    `Cannot link ${childType} to ${parentType} ${parentId}`,
    `🔗 Relationship validation failed: ${reason}`,
    { parentType, parentId, childType }
  );
}

/**
 * Operation failed errors
 */
export function operationFailedError(
  operation: string,
  reason: string,
  suggestion?: string
): CategorizedError {
  const guidance = suggestion
    ? `❌ ${operation} failed: ${reason}. ${suggestion}`
    : `❌ ${operation} failed: ${reason}`;

  return createError(
    ErrorCategory.OPERATION_FAILED,
    `${operation} failed`,
    guidance,
    { operation }
  );
}

/**
 * Organization restriction error (for write operations)
 */
export function organizationRestrictionError(
  operation: string,
  allowedOrgId: number
): CategorizedError {
  return createError(
    ErrorCategory.ACCESS_DENIED,
    'Write operation restricted',
    `⛔ ${operation} is only allowed for organization ${allowedOrgId}. This restriction is in place for the mock server to maintain data integrity.`,
    { allowedOrganizationId: allowedOrgId }
  );
}

/**
 * Format error for MCP response
 */
export function formatErrorForMCP(error: CategorizedError): {
  content: Array<{ type: string; text: string }>;
  isError: true;
  errorCategory: ErrorCategory;
  errorDetails?: Record<string, any>;
} {
  return {
    content: [
      {
        type: 'text',
        text: error.message,
      },
      {
        type: 'text',
        text: error.guidance,
      },
    ],
    isError: true,
    errorCategory: error.category,
    errorDetails: error.details,
  };
}
