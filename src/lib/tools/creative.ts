/**
 * Creative Tools
 * Creative asset (concept) management operations
 */

import { z } from 'zod';
import { toolRegistry, createSuccessResponse, createErrorResponse, type ToolContext, type ToolResponse } from './registry';
import { getDataStore } from '../data/store';
import { notFoundError, buildListResponse, buildEntityResponse } from '../utils/index';

// ============================================================================
// find_concepts
// ============================================================================

const findConceptsSchema = z.object({
  advertiser_id: z.number().optional(),
  status: z.boolean().optional(),
  name: z.string().optional(),
  pageLimit: z.number().min(1).max(25).optional().default(25),
  cursor: z.string().optional(),
});

async function findConceptsHandler(
  args: z.infer<typeof findConceptsSchema>,
  context: ToolContext
): Promise<ToolResponse> {
  const store = getDataStore();

  // Build filters
  const filters: any = {};
  if (args.advertiser_id) filters.advertiser_id = args.advertiser_id;
  if (args.status !== undefined) filters.status = args.status;
  if (args.name) filters.name = { $contains: args.name };

  // Query data
  const result = store.concepts.find(
    filters,
    { field: 'id', order: 'asc' },
    { offset: 0, limit: args.pageLimit }
  );

  const response = buildListResponse(result.data, 'concept', {
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
// get_concept_info
// ============================================================================

const getConceptInfoSchema = z.object({
  concept_id: z.number(),
});

async function getConceptInfoHandler(
  args: z.infer<typeof getConceptInfoSchema>,
  context: ToolContext
): Promise<ToolResponse> {
  const store = getDataStore();

  const concept = store.concepts.findById(args.concept_id);

  if (!concept) {
    return createErrorResponse(
      notFoundError('Concept', args.concept_id)
    );
  }

  const response = buildEntityResponse(concept, 'concept');

  return {
    content: response.content,
    isError: false,
  };
}

// ============================================================================
// Registration
// ============================================================================

export function registerCreativeTools(): void {
  toolRegistry.register(
    'find_concepts',
    {
      name: 'find_concepts',
      description: 'Search for creative concepts (ads) with optional filters (advertiser, status, name)',
      inputSchema: {
        type: 'object',
        properties: {
          advertiser_id: { type: 'number', description: 'Filter by advertiser ID' },
          status: { type: 'boolean', description: 'Filter by status (true=active, false=inactive)' },
          name: { type: 'string', description: 'Filter by name (partial match)' },
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
    findConceptsHandler,
    findConceptsSchema
  );

  toolRegistry.register(
    'get_concept_info',
    {
      name: 'get_concept_info',
      description: 'Get detailed information about a specific creative concept by ID',
      inputSchema: {
        type: 'object',
        properties: {
          concept_id: { type: 'number', description: 'Concept ID' },
        },
        required: ['concept_id'],
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    getConceptInfoHandler,
    getConceptInfoSchema
  );
}
