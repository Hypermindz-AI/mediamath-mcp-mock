/**
 * Campaign Tools
 * Campaign management operations
 */

import { z } from 'zod';
import { toolRegistry, createSuccessResponse, createErrorResponse, type ToolContext, type ToolResponse } from './registry';
import { getDataStore } from '../data/store';
import { notFoundError, organizationRestrictionError, buildListResponse, buildEntityResponse, buildCreatedResponse, buildUpdatedResponse } from '../utils/index';

// ============================================================================
// find_campaigns
// ============================================================================

const findCampaignsSchema = z.object({
  advertiser_id: z.number().optional(),
  organization_id: z.number().optional(),
  status: z.boolean().optional(),
  name: z.string().optional(),
  pageLimit: z.number().min(1).max(25).optional().default(25),
  cursor: z.string().optional(),
});

async function findCampaignsHandler(
  args: z.infer<typeof findCampaignsSchema>,
  context: ToolContext
): Promise<ToolResponse> {
  const store = getDataStore();

  // Build filters
  const filters: any = {};
  if (args.advertiser_id) filters.advertiser_id = args.advertiser_id;
  if (args.organization_id) filters.organization_id = args.organization_id;
  if (args.status !== undefined) filters.status = args.status;
  if (args.name) filters.name = { $contains: args.name };

  // Query data
  const result = store.campaigns.find(
    filters,
    { field: 'id', order: 'asc' },
    { offset: 0, limit: args.pageLimit }
  );

  const response = buildListResponse(result.data, 'campaign', {
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
// get_campaign_info
// ============================================================================

const getCampaignInfoSchema = z.object({
  campaign_id: z.number(),
  with_strategies: z.boolean().optional().default(false),
});

async function getCampaignInfoHandler(
  args: z.infer<typeof getCampaignInfoSchema>,
  context: ToolContext
): Promise<ToolResponse> {
  const store = getDataStore();

  const campaign = store.campaigns.findById(args.campaign_id);

  if (!campaign) {
    return createErrorResponse(
      notFoundError('Campaign', args.campaign_id)
    );
  }

  let result: any = campaign;

  // Optionally include strategies
  if (args.with_strategies) {
    const strategies = store.strategies.find(
      { campaign_id: args.campaign_id },
      { field: 'id', order: 'asc' },
      { offset: 0, limit: 25 }
    );
    result = {
      ...campaign,
      strategies: strategies.data,
      strategy_count: strategies.total,
    };
  }

  const response = buildEntityResponse(result, 'campaign');

  return {
    content: response.content,
    isError: false,
  };
}

// ============================================================================
// campaign_create
// ============================================================================

const campaignCreateSchema = z.object({
  name: z.string().min(1),
  advertiser_id: z.number(),
  start_date: z.string(),
  end_date: z.string(),
  total_budget: z.number().positive(),
  goal_type: z.enum(['spend', 'reach', 'ctr', 'cpa', 'cpc']),
  status: z.boolean().optional().default(true),
});

async function campaignCreateHandler(
  args: z.infer<typeof campaignCreateSchema>,
  context: ToolContext
): Promise<ToolResponse> {
  const store = getDataStore();

  // Check organization restriction
  const ORG_RESTRICTION_ID = parseInt(process.env.ORG_RESTRICTION_ID || '100048');

  if (context.organizationId !== ORG_RESTRICTION_ID) {
    return createErrorResponse(
      organizationRestrictionError('Campaign creation', ORG_RESTRICTION_ID)
    );
  }

  // Verify advertiser exists
  const advertiser = store.advertisers.findById(args.advertiser_id);
  if (!advertiser) {
    return createErrorResponse(
      notFoundError('Advertiser', args.advertiser_id, 'Please create the advertiser first.')
    );
  }

  // Create campaign
  const newCampaign = store.campaigns.create({
    name: args.name,
    advertiser_id: args.advertiser_id,
    organization_id: context.organizationId || ORG_RESTRICTION_ID,
    agency_id: advertiser.agency_id,
    status: args.status,
    start_date: args.start_date,
    end_date: args.end_date,
    total_budget: args.total_budget,
    spend_cap_amount: args.total_budget * 1.1, // 10% buffer
    goal_type: args.goal_type,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const response = buildCreatedResponse(newCampaign, 'Campaign', newCampaign.id);

  return {
    content: response.content,
    isError: false,
  };
}

// ============================================================================
// campaign_update
// ============================================================================

const campaignUpdateSchema = z.object({
  campaign_id: z.number(),
  name: z.string().min(1).optional(),
  status: z.boolean().optional(),
  total_budget: z.number().positive().optional(),
  goal_type: z.enum(['spend', 'reach', 'ctr', 'cpa', 'cpc']).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

async function campaignUpdateHandler(
  args: z.infer<typeof campaignUpdateSchema>,
  context: ToolContext
): Promise<ToolResponse> {
  const store = getDataStore();

  // Check campaign exists
  const campaign = store.campaigns.findById(args.campaign_id);
  if (!campaign) {
    return createErrorResponse(
      notFoundError('Campaign', args.campaign_id)
    );
  }

  // Check organization restriction
  const ORG_RESTRICTION_ID = parseInt(process.env.ORG_RESTRICTION_ID || '100048');

  if (campaign.organization_id !== ORG_RESTRICTION_ID) {
    return createErrorResponse(
      organizationRestrictionError('Campaign update', ORG_RESTRICTION_ID)
    );
  }

  // Build update object
  const updates: any = {
    updated_at: new Date().toISOString(),
  };
  if (args.name) updates.name = args.name;
  if (args.status !== undefined) updates.status = args.status;
  if (args.total_budget) {
    updates.total_budget = args.total_budget;
    updates.spend_cap_amount = args.total_budget * 1.1;
  }
  if (args.goal_type) updates.goal_type = args.goal_type;
  if (args.start_date) updates.start_date = args.start_date;
  if (args.end_date) updates.end_date = args.end_date;

  // Update campaign
  const updated = store.campaigns.update(args.campaign_id, updates);

  const changedFields = Object.keys(updates).filter(k => k !== 'updated_at');
  const response = buildUpdatedResponse(updated, 'Campaign', args.campaign_id, changedFields);

  return {
    content: response.content,
    isError: false,
  };
}

// ============================================================================
// Registration
// ============================================================================

export function registerCampaignTools(): void {
  toolRegistry.register(
    'find_campaigns',
    {
      name: 'find_campaigns',
      description: 'Search for campaigns with optional filters (advertiser, organization, status, name)',
      inputSchema: {
        type: 'object',
        properties: {
          advertiser_id: { type: 'number', description: 'Filter by advertiser ID' },
          organization_id: { type: 'number', description: 'Filter by organization ID' },
          status: { type: 'boolean', description: 'Filter by status (true=active, false=paused)' },
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
    findCampaignsHandler,
    findCampaignsSchema
  );

  toolRegistry.register(
    'get_campaign_info',
    {
      name: 'get_campaign_info',
      description: 'Get detailed information about a specific campaign by ID',
      inputSchema: {
        type: 'object',
        properties: {
          campaign_id: { type: 'number', description: 'Campaign ID' },
          with_strategies: { type: 'boolean', default: false, description: 'Include associated strategies' },
        },
        required: ['campaign_id'],
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    getCampaignInfoHandler,
    getCampaignInfoSchema
  );

  toolRegistry.register(
    'campaign_create',
    {
      name: 'campaign_create',
      description: 'Create a new campaign (restricted to organization 100048)',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Campaign name' },
          advertiser_id: { type: 'number', description: 'Advertiser ID' },
          start_date: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
          end_date: { type: 'string', description: 'End date (YYYY-MM-DD)' },
          total_budget: { type: 'number', description: 'Total budget amount' },
          goal_type: { type: 'string', enum: ['spend', 'reach', 'ctr', 'cpa', 'cpc'], description: 'Campaign goal type' },
          status: { type: 'boolean', default: true, description: 'Initial status' },
        },
        required: ['name', 'advertiser_id', 'start_date', 'end_date', 'total_budget', 'goal_type'],
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    campaignCreateHandler,
    campaignCreateSchema
  );

  toolRegistry.register(
    'campaign_update',
    {
      name: 'campaign_update',
      description: 'Update an existing campaign (restricted to organization 100048)',
      inputSchema: {
        type: 'object',
        properties: {
          campaign_id: { type: 'number', description: 'Campaign ID to update' },
          name: { type: 'string', description: 'New campaign name' },
          status: { type: 'boolean', description: 'New status' },
          total_budget: { type: 'number', description: 'New total budget' },
          goal_type: { type: 'string', enum: ['spend', 'reach', 'ctr', 'cpa', 'cpc'], description: 'New goal type' },
          start_date: { type: 'string', description: 'New start date' },
          end_date: { type: 'string', description: 'New end date' },
        },
        required: ['campaign_id'],
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    campaignUpdateHandler,
    campaignUpdateSchema
  );
}
