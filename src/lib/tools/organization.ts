/**
 * Organization Tools
 * Organizational hierarchy operations (organizations, agencies, advertisers)
 */

import { z } from 'zod';
import { toolRegistry, createSuccessResponse, createErrorResponse, type ToolContext, type ToolResponse } from './registry';
import { getDataStore } from '../data/store';
import { notFoundError, buildListResponse, buildEntityResponse } from '../utils/index';

// ============================================================================
// find_organizations
// ============================================================================

const findOrganizationsSchema = z.object({
  name: z.string().optional(),
  status: z.boolean().optional(),
  pageLimit: z.number().min(1).max(25).optional().default(25),
  cursor: z.string().optional(),
});

async function findOrganizationsHandler(
  args: z.infer<typeof findOrganizationsSchema>,
  context: ToolContext
): Promise<ToolResponse> {
  const store = getDataStore();

  // Build filters
  const filters: any = {};
  if (args.status !== undefined) filters.status = args.status;
  if (args.name) filters.name = { $contains: args.name };

  // Query data
  const result = store.organizations.find(
    filters,
    { field: 'id', order: 'asc' },
    { offset: 0, limit: args.pageLimit }
  );

  const response = buildListResponse(result.data, 'organization', {
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
// get_organization_info
// ============================================================================

const getOrganizationInfoSchema = z.object({
  organization_id: z.number(),
  with_agencies: z.boolean().optional().default(false),
  with_advertisers: z.boolean().optional().default(false),
});

async function getOrganizationInfoHandler(
  args: z.infer<typeof getOrganizationInfoSchema>,
  context: ToolContext
): Promise<ToolResponse> {
  const store = getDataStore();

  const organization = store.organizations.findById(args.organization_id);

  if (!organization) {
    return createErrorResponse(
      notFoundError('Organization', args.organization_id)
    );
  }

  let result: any = organization;

  // Optionally include agencies
  if (args.with_agencies) {
    const agencies = store.agencies.find(
      { organization_id: args.organization_id },
      { field: 'id', order: 'asc' },
      { offset: 0, limit: 25 }
    );
    result = {
      ...result,
      agencies: agencies.data,
      agency_count: agencies.total,
    };
  }

  // Optionally include advertisers
  if (args.with_advertisers) {
    const advertisers = store.advertisers.find(
      { organization_id: args.organization_id },
      { field: 'id', order: 'asc' },
      { offset: 0, limit: 25 }
    );
    result = {
      ...result,
      advertisers: advertisers.data,
      advertiser_count: advertisers.total,
    };
  }

  const response = buildEntityResponse(result, 'organization');

  return {
    content: response.content,
    isError: false,
  };
}

// ============================================================================
// find_agencies
// ============================================================================

const findAgenciesSchema = z.object({
  organization_id: z.number().optional(),
  name: z.string().optional(),
  status: z.boolean().optional(),
  pageLimit: z.number().min(1).max(25).optional().default(25),
  cursor: z.string().optional(),
});

async function findAgenciesHandler(
  args: z.infer<typeof findAgenciesSchema>,
  context: ToolContext
): Promise<ToolResponse> {
  const store = getDataStore();

  // Build filters
  const filters: any = {};
  if (args.organization_id) filters.organization_id = args.organization_id;
  if (args.status !== undefined) filters.status = args.status;
  if (args.name) filters.name = { $contains: args.name };

  // Query data
  const result = store.agencies.find(
    filters,
    { field: 'id', order: 'asc' },
    { offset: 0, limit: args.pageLimit }
  );

  const response = buildListResponse(result.data, 'agency', {
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
// get_agency_info
// ============================================================================

const getAgencyInfoSchema = z.object({
  agency_id: z.number(),
  with_advertisers: z.boolean().optional().default(false),
});

async function getAgencyInfoHandler(
  args: z.infer<typeof getAgencyInfoSchema>,
  context: ToolContext
): Promise<ToolResponse> {
  const store = getDataStore();

  const agency = store.agencies.findById(args.agency_id);

  if (!agency) {
    return createErrorResponse(
      notFoundError('Agency', args.agency_id)
    );
  }

  let result: any = agency;

  // Optionally include advertisers
  if (args.with_advertisers) {
    const advertisers = store.advertisers.find(
      { agency_id: args.agency_id },
      { field: 'id', order: 'asc' },
      { offset: 0, limit: 25 }
    );
    result = {
      ...result,
      advertisers: advertisers.data,
      advertiser_count: advertisers.total,
    };
  }

  const response = buildEntityResponse(result, 'agency');

  return {
    content: response.content,
    isError: false,
  };
}

// ============================================================================
// find_advertisers
// ============================================================================

const findAdvertisersSchema = z.object({
  organization_id: z.number().optional(),
  agency_id: z.number().optional(),
  name: z.string().optional(),
  status: z.boolean().optional(),
  pageLimit: z.number().min(1).max(25).optional().default(25),
  cursor: z.string().optional(),
});

async function findAdvertisersHandler(
  args: z.infer<typeof findAdvertisersSchema>,
  context: ToolContext
): Promise<ToolResponse> {
  const store = getDataStore();

  // Build filters
  const filters: any = {};
  if (args.organization_id) filters.organization_id = args.organization_id;
  if (args.agency_id) filters.agency_id = args.agency_id;
  if (args.status !== undefined) filters.status = args.status;
  if (args.name) filters.name = { $contains: args.name };

  // Query data
  const result = store.advertisers.find(
    filters,
    { field: 'id', order: 'asc' },
    { offset: 0, limit: args.pageLimit }
  );

  const response = buildListResponse(result.data, 'advertiser', {
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
// get_advertiser_info
// ============================================================================

const getAdvertiserInfoSchema = z.object({
  advertiser_id: z.number(),
  with_campaigns: z.boolean().optional().default(false),
});

async function getAdvertiserInfoHandler(
  args: z.infer<typeof getAdvertiserInfoSchema>,
  context: ToolContext
): Promise<ToolResponse> {
  const store = getDataStore();

  const advertiser = store.advertisers.findById(args.advertiser_id);

  if (!advertiser) {
    return createErrorResponse(
      notFoundError('Advertiser', args.advertiser_id)
    );
  }

  let result: any = advertiser;

  // Optionally include campaigns
  if (args.with_campaigns) {
    const campaigns = store.campaigns.find(
      { advertiser_id: args.advertiser_id },
      { field: 'id', order: 'asc' },
      { offset: 0, limit: 25 }
    );
    result = {
      ...result,
      campaigns: campaigns.data,
      campaign_count: campaigns.total,
    };
  }

  const response = buildEntityResponse(result, 'advertiser');

  return {
    content: response.content,
    isError: false,
  };
}

// ============================================================================
// Registration
// ============================================================================

export function registerOrganizationTools(): void {
  toolRegistry.register(
    'find_organizations',
    {
      name: 'find_organizations',
      description: 'Search for organizations with optional filters (name, status)',
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
    findOrganizationsHandler,
    findOrganizationsSchema
  );

  toolRegistry.register(
    'get_organization_info',
    {
      name: 'get_organization_info',
      description: 'Get detailed information about a specific organization by ID',
      inputSchema: {
        type: 'object',
        properties: {
          organization_id: { type: 'number', description: 'Organization ID' },
          with_agencies: { type: 'boolean', default: false, description: 'Include associated agencies' },
          with_advertisers: { type: 'boolean', default: false, description: 'Include associated advertisers' },
        },
        required: ['organization_id'],
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    getOrganizationInfoHandler,
    getOrganizationInfoSchema
  );

  toolRegistry.register(
    'find_agencies',
    {
      name: 'find_agencies',
      description: 'Search for agencies with optional filters (organization, name, status)',
      inputSchema: {
        type: 'object',
        properties: {
          organization_id: { type: 'number', description: 'Filter by organization ID' },
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
    findAgenciesHandler,
    findAgenciesSchema
  );

  toolRegistry.register(
    'get_agency_info',
    {
      name: 'get_agency_info',
      description: 'Get detailed information about a specific agency by ID',
      inputSchema: {
        type: 'object',
        properties: {
          agency_id: { type: 'number', description: 'Agency ID' },
          with_advertisers: { type: 'boolean', default: false, description: 'Include associated advertisers' },
        },
        required: ['agency_id'],
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    getAgencyInfoHandler,
    getAgencyInfoSchema
  );

  toolRegistry.register(
    'find_advertisers',
    {
      name: 'find_advertisers',
      description: 'Search for advertisers with optional filters (organization, agency, name, status)',
      inputSchema: {
        type: 'object',
        properties: {
          organization_id: { type: 'number', description: 'Filter by organization ID' },
          agency_id: { type: 'number', description: 'Filter by agency ID' },
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
    findAdvertisersHandler,
    findAdvertisersSchema
  );

  toolRegistry.register(
    'get_advertiser_info',
    {
      name: 'get_advertiser_info',
      description: 'Get detailed information about a specific advertiser by ID',
      inputSchema: {
        type: 'object',
        properties: {
          advertiser_id: { type: 'number', description: 'Advertiser ID' },
          with_campaigns: { type: 'boolean', default: false, description: 'Include associated campaigns' },
        },
        required: ['advertiser_id'],
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    getAdvertiserInfoHandler,
    getAdvertiserInfoSchema
  );
}
