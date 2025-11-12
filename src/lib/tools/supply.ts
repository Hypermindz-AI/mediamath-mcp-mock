/**
 * Supply Tools
 * Supply source and site list management operations
 */

import { z } from 'zod';
import { toolRegistry, createSuccessResponse, createErrorResponse, type ToolContext, type ToolResponse } from './registry';
import { getDataStore } from '../data/store';
import { notFoundError, buildListResponse, buildEntityResponse } from '../utils/index';

// ============================================================================
// find_supply_sources
// ============================================================================

const findSupplySourcesSchema = z.object({
  name: z.string().optional(),
  type: z.enum(['exchange', 'app_network', 'direct']).optional(),
  status: z.boolean().optional(),
  pageLimit: z.number().min(1).max(25).optional().default(25),
  cursor: z.string().optional(),
});

async function findSupplySourcesHandler(
  args: z.infer<typeof findSupplySourcesSchema>,
  context: ToolContext
): Promise<ToolResponse> {
  const store = getDataStore();

  // Build filters
  const filters: any = {};
  if (args.status !== undefined) filters.status = args.status;
  if (args.type) filters.type = args.type;
  if (args.name) filters.name = { $contains: args.name };

  // Query data
  const result = store.supplySources.find(
    filters,
    { field: 'id', order: 'asc' },
    { offset: 0, limit: args.pageLimit }
  );

  const response = buildListResponse(result.data, 'supply source', {
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
// get_supply_source_info
// ============================================================================

const getSupplySourceInfoSchema = z.object({
  supply_source_id: z.number(),
});

async function getSupplySourceInfoHandler(
  args: z.infer<typeof getSupplySourceInfoSchema>,
  context: ToolContext
): Promise<ToolResponse> {
  const store = getDataStore();

  const supplySource = store.supplySources.findById(args.supply_source_id);

  if (!supplySource) {
    return createErrorResponse(
      notFoundError('Supply Source', args.supply_source_id)
    );
  }

  const response = buildEntityResponse(supplySource, 'supply source');

  return {
    content: response.content,
    isError: false,
  };
}

// ============================================================================
// find_site_lists
// ============================================================================

const findSiteListsSchema = z.object({
  name: z.string().optional(),
  type: z.enum(['whitelist', 'blacklist']).optional(),
  status: z.boolean().optional(),
  pageLimit: z.number().min(1).max(25).optional().default(25),
  cursor: z.string().optional(),
});

async function findSiteListsHandler(
  args: z.infer<typeof findSiteListsSchema>,
  context: ToolContext
): Promise<ToolResponse> {
  const store = getDataStore();

  // Build filters
  const filters: any = {};
  if (args.status !== undefined) filters.status = args.status;
  if (args.type) filters.type = args.type;
  if (args.name) filters.name = { $contains: args.name };

  // Query data
  const result = store.siteLists.find(
    filters,
    { field: 'id', order: 'asc' },
    { offset: 0, limit: args.pageLimit }
  );

  const response = buildListResponse(result.data, 'site list', {
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
// get_site_list_info
// ============================================================================

const getSiteListInfoSchema = z.object({
  site_list_id: z.number(),
});

async function getSiteListInfoHandler(
  args: z.infer<typeof getSiteListInfoSchema>,
  context: ToolContext
): Promise<ToolResponse> {
  const store = getDataStore();

  const siteList = store.siteLists.findById(args.site_list_id);

  if (!siteList) {
    return createErrorResponse(
      notFoundError('Site List', args.site_list_id)
    );
  }

  const response = buildEntityResponse(siteList, 'site list');

  return {
    content: response.content,
    isError: false,
  };
}

// ============================================================================
// Registration
// ============================================================================

export function registerSupplyTools(): void {
  toolRegistry.register(
    'find_supply_sources',
    {
      name: 'find_supply_sources',
      description: 'Search for supply sources (exchanges, app networks, direct) with optional filters',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Filter by name (partial match)' },
          type: { type: 'string', enum: ['exchange', 'app_network', 'direct'], description: 'Filter by type' },
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
    findSupplySourcesHandler,
    findSupplySourcesSchema
  );

  toolRegistry.register(
    'get_supply_source_info',
    {
      name: 'get_supply_source_info',
      description: 'Get detailed information about a specific supply source by ID',
      inputSchema: {
        type: 'object',
        properties: {
          supply_source_id: { type: 'number', description: 'Supply Source ID' },
        },
        required: ['supply_source_id'],
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    getSupplySourceInfoHandler,
    getSupplySourceInfoSchema
  );

  toolRegistry.register(
    'find_site_lists',
    {
      name: 'find_site_lists',
      description: 'Search for site lists (whitelists/blacklists) with optional filters',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Filter by name (partial match)' },
          type: { type: 'string', enum: ['whitelist', 'blacklist'], description: 'Filter by list type' },
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
    findSiteListsHandler,
    findSiteListsSchema
  );

  toolRegistry.register(
    'get_site_list_info',
    {
      name: 'get_site_list_info',
      description: 'Get detailed information about a specific site list by ID',
      inputSchema: {
        type: 'object',
        properties: {
          site_list_id: { type: 'number', description: 'Site List ID' },
        },
        required: ['site_list_id'],
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    getSiteListInfoHandler,
    getSiteListInfoSchema
  );
}
