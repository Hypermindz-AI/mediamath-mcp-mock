/**
 * MCP Response Builders
 * Creates standardized MCP tool responses with dual content format
 */

import type { PaginationMeta } from './pagination';

export interface MCPToolResponse {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
    uri?: string;
  }>;
  structuredContent?: any;
  isError: boolean;
  meta?: {
    pagination?: PaginationMeta;
    [key: string]: any;
  };
}

/**
 * Build a successful MCP tool response
 */
export function buildSuccessResponse(
  data: any,
  guidance: string,
  meta?: { pagination?: PaginationMeta; [key: string]: any }
): MCPToolResponse {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data, null, 2),
      },
      {
        type: 'text',
        text: guidance,
      },
    ],
    structuredContent: data,
    isError: false,
    meta,
  };
}

/**
 * Build a response for a single entity
 */
export function buildEntityResponse(
  entity: any,
  entityType: string,
  uiLink?: string
): MCPToolResponse {
  const guidance = uiLink
    ? `✅ Found ${entityType}. View in UI: ${uiLink}`
    : `✅ Found ${entityType}.`;

  return buildSuccessResponse(entity, guidance);
}

/**
 * Build a response for a list of entities with pagination
 */
export function buildListResponse(
  items: any[],
  entityType: string,
  pagination?: PaginationMeta,
  additionalGuidance?: string
): MCPToolResponse {
  const baseGuidance = `✅ Found ${items.length} ${entityType}${items.length !== 1 ? 's' : ''}.`;

  let guidance = baseGuidance;

  if (pagination?.hasMore) {
    guidance += ` There are more results available. Use 'nextCursor' to fetch the next page.`;
  }

  if (additionalGuidance) {
    guidance += ` ${additionalGuidance}`;
  }

  return buildSuccessResponse(
    { items, pagination },
    guidance,
    pagination ? { pagination } : undefined
  );
}

/**
 * Build a response for creation operations
 */
export function buildCreatedResponse(
  entity: any,
  entityType: string,
  entityId: number | string,
  uiLink?: string
): MCPToolResponse {
  const guidance = uiLink
    ? `✅ ${entityType} created successfully (ID: ${entityId}). View in UI: ${uiLink}`
    : `✅ ${entityType} created successfully (ID: ${entityId}).`;

  return buildSuccessResponse(entity, guidance);
}

/**
 * Build a response for update operations
 */
export function buildUpdatedResponse(
  entity: any,
  entityType: string,
  entityId: number | string,
  changedFields?: string[]
): MCPToolResponse {
  let guidance = `✅ ${entityType} ${entityId} updated successfully.`;

  if (changedFields && changedFields.length > 0) {
    guidance += ` Changed fields: ${changedFields.join(', ')}.`;
  }

  return buildSuccessResponse(entity, guidance);
}

/**
 * Build a response for delete operations
 */
export function buildDeletedResponse(
  entityType: string,
  entityId: number | string
): MCPToolResponse {
  return buildSuccessResponse(
    { success: true, id: entityId },
    `✅ ${entityType} ${entityId} deleted successfully.`
  );
}

/**
 * Build a response for batch operations
 */
export function buildBatchResponse(
  results: { success: number; failed: number; errors?: any[] },
  operation: string,
  entityType: string
): MCPToolResponse {
  const { success, failed, errors } = results;

  let guidance = `${operation} completed: ${success} ${entityType}${success !== 1 ? 's' : ''} succeeded`;

  if (failed > 0) {
    guidance += `, ${failed} failed`;
  }

  guidance += '.';

  return buildSuccessResponse({ success, failed, errors }, guidance);
}

/**
 * Build UI deep link for MediaMath entities
 */
export function buildUIDeepLink(
  entityType: 'campaign' | 'strategy' | 'organization' | 'advertiser' | 'user',
  entityId: number | string,
  organizationId?: number
): string {
  const baseUrl = 'https://t1.mediamath.com';

  switch (entityType) {
    case 'campaign':
      return `${baseUrl}/campaigns/${entityId}`;
    case 'strategy':
      return `${baseUrl}/strategies/${entityId}`;
    case 'organization':
      return `${baseUrl}/organizations/${organizationId || entityId}`;
    case 'advertiser':
      return `${baseUrl}/advertisers/${entityId}`;
    case 'user':
      return `${baseUrl}/users/${entityId}`;
    default:
      return baseUrl;
  }
}

/**
 * Build guidance text for relationship-based queries
 */
export function buildRelationshipGuidance(
  parentType: string,
  parentId: number,
  childType: string,
  count: number
): string {
  return `Found ${count} ${childType}${count !== 1 ? 's' : ''} for ${parentType} ${parentId}.`;
}

/**
 * Build guidance for empty results
 */
export function buildEmptyResultGuidance(
  entityType: string,
  filters?: Record<string, any>
): string {
  if (filters && Object.keys(filters).length > 0) {
    const filterDesc = Object.entries(filters)
      .map(([key, value]) => `${key}=${value}`)
      .join(', ');
    return `No ${entityType}s found matching filters: ${filterDesc}. Try adjusting your search criteria.`;
  }

  return `No ${entityType}s found. The collection may be empty.`;
}
