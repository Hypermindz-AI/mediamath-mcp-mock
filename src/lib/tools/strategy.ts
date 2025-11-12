/**
 * Strategy Tools
 * Strategy management operations
 */

import { z } from 'zod';
import { toolRegistry, createSuccessResponse, createErrorResponse, type ToolContext, type ToolResponse } from './registry';
import { getDataStore } from '../data/store';
import { notFoundError, organizationRestrictionError, buildListResponse, buildEntityResponse, buildCreatedResponse, buildUpdatedResponse } from '../utils/index';

// ============================================================================
// find_strategies
// ============================================================================

const findStrategiesSchema = z.object({
  campaign_id: z.number().optional(),
  status: z.boolean().optional(),
  type: z.enum(['display', 'video', 'mobile', 'native']).optional(),
  name: z.string().optional(),
  pageLimit: z.number().min(1).max(25).optional().default(25),
  cursor: z.string().optional(),
});

async function findStrategiesHandler(
  args: z.infer<typeof findStrategiesSchema>,
  context: ToolContext
): Promise<ToolResponse> {
  const store = getDataStore();

  // Build filters
  const filters: any = {};
  if (args.campaign_id) filters.campaign_id = args.campaign_id;
  if (args.status !== undefined) filters.status = args.status;
  if (args.type) filters.type = args.type;
  if (args.name) filters.name = { $contains: args.name };

  // Query data
  const result = store.strategies.find(
    filters,
    { field: 'id', order: 'asc' },
    { offset: 0, limit: args.pageLimit }
  );

  const response = buildListResponse(result.data, 'strategy', {
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
// get_strategy_info
// ============================================================================

const getStrategyInfoSchema = z.object({
  strategy_id: z.number(),
  with_campaign: z.boolean().optional().default(false),
});

async function getStrategyInfoHandler(
  args: z.infer<typeof getStrategyInfoSchema>,
  context: ToolContext
): Promise<ToolResponse> {
  const store = getDataStore();

  const strategy = store.strategies.findById(args.strategy_id);

  if (!strategy) {
    return createErrorResponse(
      notFoundError('Strategy', args.strategy_id)
    );
  }

  let result: any = strategy;

  // Optionally include campaign
  if (args.with_campaign && strategy.campaign_id) {
    const campaign = store.campaigns.findById(strategy.campaign_id);
    if (campaign) {
      result = {
        ...strategy,
        campaign,
      };
    }
  }

  const response = buildEntityResponse(result, 'strategy');

  return {
    content: response.content,
    isError: false,
  };
}

// ============================================================================
// strategy_create
// ============================================================================

const strategyCreateSchema = z.object({
  name: z.string().min(1),
  campaign_id: z.number(),
  type: z.enum(['display', 'video', 'mobile', 'native']),
  budget: z.number().positive(),
  max_bid: z.number().positive(),
  goal_type: z.enum(['spend', 'reach', 'ctr', 'cpa', 'cpc']),
  status: z.boolean().optional().default(true),
});

async function strategyCreateHandler(
  args: z.infer<typeof strategyCreateSchema>,
  context: ToolContext
): Promise<ToolResponse> {
  const store = getDataStore();

  // Verify campaign exists
  const campaign = store.campaigns.findById(args.campaign_id);
  if (!campaign) {
    return createErrorResponse(
      notFoundError('Campaign', args.campaign_id, 'Please create the campaign first.')
    );
  }

  // Check organization restriction
  const ORG_RESTRICTION_ID = parseInt(process.env.ORG_RESTRICTION_ID || '100048');

  if (campaign.organization_id !== ORG_RESTRICTION_ID) {
    return createErrorResponse(
      organizationRestrictionError('Strategy creation', ORG_RESTRICTION_ID)
    );
  }

  // Create strategy
  const newStrategy = store.strategies.create({
    name: args.name,
    campaign_id: args.campaign_id,
    status: args.status,
    type: args.type,
    budget: args.budget,
    pacing_amount: args.budget / 30, // Daily pacing
    max_bid: args.max_bid,
    goal_type: args.goal_type,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const response = buildCreatedResponse(newStrategy, 'Strategy', newStrategy.id);

  return {
    content: response.content,
    isError: false,
  };
}

// ============================================================================
// strategy_update
// ============================================================================

const strategyUpdateSchema = z.object({
  strategy_id: z.number(),
  name: z.string().min(1).optional(),
  status: z.boolean().optional(),
  budget: z.number().positive().optional(),
  max_bid: z.number().positive().optional(),
  goal_type: z.enum(['spend', 'reach', 'ctr', 'cpa', 'cpc']).optional(),
  type: z.enum(['display', 'video', 'mobile', 'native']).optional(),
});

async function strategyUpdateHandler(
  args: z.infer<typeof strategyUpdateSchema>,
  context: ToolContext
): Promise<ToolResponse> {
  const store = getDataStore();

  // Check strategy exists
  const strategy = store.strategies.findById(args.strategy_id);
  if (!strategy) {
    return createErrorResponse(
      notFoundError('Strategy', args.strategy_id)
    );
  }

  // Check campaign exists and organization restriction
  const campaign = store.campaigns.findById(strategy.campaign_id);
  if (!campaign) {
    return createErrorResponse(
      notFoundError('Campaign', strategy.campaign_id)
    );
  }

  const ORG_RESTRICTION_ID = parseInt(process.env.ORG_RESTRICTION_ID || '100048');

  if (campaign.organization_id !== ORG_RESTRICTION_ID) {
    return createErrorResponse(
      organizationRestrictionError('Strategy update', ORG_RESTRICTION_ID)
    );
  }

  // Build update object
  const updates: any = {
    updated_at: new Date().toISOString(),
  };
  if (args.name) updates.name = args.name;
  if (args.status !== undefined) updates.status = args.status;
  if (args.budget) {
    updates.budget = args.budget;
    updates.pacing_amount = args.budget / 30;
  }
  if (args.max_bid) updates.max_bid = args.max_bid;
  if (args.goal_type) updates.goal_type = args.goal_type;
  if (args.type) updates.type = args.type;

  // Update strategy
  const updated = store.strategies.update(args.strategy_id, updates);

  const changedFields = Object.keys(updates).filter(k => k !== 'updated_at');
  const response = buildUpdatedResponse(updated, 'Strategy', args.strategy_id, changedFields);

  return {
    content: response.content,
    isError: false,
  };
}

// ============================================================================
// Registration
// ============================================================================

export function registerStrategyTools(): void {
  toolRegistry.register(
    'find_strategies',
    {
      name: 'find_strategies',
      description: 'Search for strategies with optional filters (campaign, status, type, name)',
      inputSchema: {
        type: 'object',
        properties: {
          campaign_id: { type: 'number', description: 'Filter by campaign ID' },
          status: { type: 'boolean', description: 'Filter by status (true=active, false=paused)' },
          type: { type: 'string', enum: ['display', 'video', 'mobile', 'native'], description: 'Filter by strategy type' },
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
    findStrategiesHandler,
    findStrategiesSchema
  );

  toolRegistry.register(
    'get_strategy_info',
    {
      name: 'get_strategy_info',
      description: 'Get detailed information about a specific strategy by ID',
      inputSchema: {
        type: 'object',
        properties: {
          strategy_id: { type: 'number', description: 'Strategy ID' },
          with_campaign: { type: 'boolean', default: false, description: 'Include associated campaign' },
        },
        required: ['strategy_id'],
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    getStrategyInfoHandler,
    getStrategyInfoSchema
  );

  toolRegistry.register(
    'strategy_create',
    {
      name: 'strategy_create',
      description: 'Create a new strategy for a campaign (restricted to organization 100048)',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Strategy name' },
          campaign_id: { type: 'number', description: 'Parent campaign ID' },
          type: { type: 'string', enum: ['display', 'video', 'mobile', 'native'], description: 'Strategy type' },
          budget: { type: 'number', description: 'Strategy budget' },
          max_bid: { type: 'number', description: 'Maximum bid amount' },
          goal_type: { type: 'string', enum: ['spend', 'reach', 'ctr', 'cpa', 'cpc'], description: 'Goal type' },
          status: { type: 'boolean', default: true, description: 'Initial status' },
        },
        required: ['name', 'campaign_id', 'type', 'budget', 'max_bid', 'goal_type'],
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    strategyCreateHandler,
    strategyCreateSchema
  );

  toolRegistry.register(
    'strategy_update',
    {
      name: 'strategy_update',
      description: 'Update an existing strategy (restricted to organization 100048)',
      inputSchema: {
        type: 'object',
        properties: {
          strategy_id: { type: 'number', description: 'Strategy ID to update' },
          name: { type: 'string', description: 'New strategy name' },
          status: { type: 'boolean', description: 'New status' },
          budget: { type: 'number', description: 'New budget' },
          max_bid: { type: 'number', description: 'New maximum bid' },
          goal_type: { type: 'string', enum: ['spend', 'reach', 'ctr', 'cpa', 'cpc'], description: 'New goal type' },
          type: { type: 'string', enum: ['display', 'video', 'mobile', 'native'], description: 'New type' },
        },
        required: ['strategy_id'],
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    strategyUpdateHandler,
    strategyUpdateSchema
  );
}
