/**
 * Utility Functions Index
 *
 * Central export point for all utility modules.
 */

// Error handling
export {
  ErrorCategory,
  createError,
  authenticationError,
  accessDeniedError,
  notFoundError,
  validationError,
  relationshipError,
  operationFailedError,
  organizationRestrictionError,
  formatErrorForMCP,
  type CategorizedError,
} from './errors';

// Response builders
export {
  buildSuccessResponse,
  buildEntityResponse,
  buildListResponse,
  buildCreatedResponse,
  buildUpdatedResponse,
  buildDeletedResponse,
  buildBatchResponse,
  buildUIDeepLink,
  buildRelationshipGuidance,
  buildEmptyResultGuidance,
  type MCPToolResponse,
} from './response';

// Pagination
export {
  encodeCursor,
  decodeCursor,
  paginate,
  createPaginationMeta,
  extractPaginationParams,
  type CursorData,
  type PaginationMeta,
} from './pagination';

// Validation schemas
export * from './validation';
