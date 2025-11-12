/**
 * Audience Tools
 * Audience segment management operations
 */

import { z } from 'zod';
import { toolRegistry, createSuccessResponse, createErrorResponse, type ToolContext, type ToolResponse } from './registry';
import { getDataStore } from '../data/store';
import { buildListResponse } from '../utils/index';

// ============================================================================
// find_audience_segments
// ============================================================================

const findAudienceSegmentsSchema = z.object({
  name: z.string().optional(),
  status: z.boolean().optional(),
  pageLimit: z.number().min(1).max(25).optional().default(25),
  cursor: z.string().optional(),
});

async function findAudienceSegmentsHandler(
  args: z.infer<typeof findAudienceSegmentsSchema>,
  context: ToolContext
): Promise<ToolResponse> {
  const store = getDataStore();

  // Build filters
  const filters: any = {};
  if (args.status !== undefined) filters.status = args.status;
  if (args.name) filters.name = { $contains: args.name };

  // Query data
  const result = store.audienceSegments.find(
    filters,
    { field: 'id', order: 'asc' },
    { offset: 0, limit: args.pageLimit }
  );

  const response = buildListResponse(result.data, 'audience segment', {
    total: result.total,
    count: result.data.length,
    pageLimit: args.pageLimit,
    hasMore: result.hasMore,
  });

  return {
    content: response.content,
    isError: false,
  };
}

// ============================================================================
// Registration
// ============================================================================

export function registerAudienceTools(): void {
  toolRegistry.register(
    'find_audience_segments',
    {
      name: 'find_audience_segments',
      description: 'Search for audience segments with optional filters (name, status)',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Filter by name (partial match)' },
          status: { type: 'boolean', description: 'Filter by status (true=active, false=inactive)' },
          pageLimit: { type: 'number', minimum: 1, maximum: 25, default: 25 },
          cursor: { type: 'string', description: 'Pagination cursor' },
        },
        required: [],
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    findAudienceSegmentsHandler,
    findAudienceSegmentsSchema
  );
}
