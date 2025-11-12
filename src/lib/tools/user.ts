/**
 * User Tools
 * User management and lookup
 */

import { z } from 'zod';
import { toolRegistry, createSuccessResponse, createErrorResponse, type ToolContext, type ToolResponse } from './registry';
import { getDataStore } from '../data/store';
import { notFoundError, buildListResponse, buildEntityResponse } from '../utils';
import { getUserPermissions, mockUsers } from '../auth/oauth';

// ============================================================================
// find_user
// ============================================================================

const findUserSchema = z.object({
  email: z.string().optional(),
  organization_id: z.number().optional(),
  role: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  pageLimit: z.number().min(1).max(25).optional().default(25),
  cursor: z.string().optional(),
});

async function findUserHandler(
  args: z.infer<typeof findUserSchema>,
  context: ToolContext
): Promise<ToolResponse> {
  const store = getDataStore();

  // Build filters
  const filters: any = {};
  if (args.email) filters.email = { $contains: args.email };
  if (args.organization_id) filters.organization_id = args.organization_id;
  if (args.role) filters.role = args.role;
  if (args.status) filters.status = args.status;

  // Query data
  const result = store.users.find(
    filters,
    { field: 'id', order: 'asc' },
    { offset: 0, limit: args.pageLimit }
  );

  const response = buildListResponse(result.data, 'user', {
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
// get_user_info
// ============================================================================

const getUserInfoSchema = z.object({
  user_id: z.number(),
  with_permissions: z.boolean().optional().default(false),
});

async function getUserInfoHandler(
  args: z.infer<typeof getUserInfoSchema>,
  context: ToolContext
): Promise<ToolResponse> {
  const store = getDataStore();

  const user = store.users.findById(args.user_id);

  if (!user) {
    return createErrorResponse(
      notFoundError('User', args.user_id)
    );
  }

  // Optionally include permissions
  let result: any = user;
  if (args.with_permissions) {
    const permissions = getUserPermissions(user.role);
    result = {
      ...user,
      permissions,
    };
  }

  const response = buildEntityResponse(result, 'user');

  return {
    content: response.content,
    isError: false,
  };
}

// ============================================================================
// get_user_permissions
// ============================================================================

const getUserPermissionsSchema = z.object({
  user_id: z.number(),
});

async function getUserPermissionsHandler(
  args: z.infer<typeof getUserPermissionsSchema>,
  context: ToolContext
): Promise<ToolResponse> {
  const store = getDataStore();

  const user = store.users.findById(args.user_id);

  if (!user) {
    return createErrorResponse(
      notFoundError('User', args.user_id)
    );
  }

  const permissions = getUserPermissions(user.role);

  const result = {
    userId: user.id,
    role: user.role,
    permissions,
  };

  return createSuccessResponse(
    result,
    `✅ Retrieved permissions for user ${user.id} (${user.role} role).`
  );
}

/**
 * Register user tools
 */
export function registerUserTools(): void {
  toolRegistry.register(
    'find_user',
    {
      name: 'find_user',
      description: 'Search for users with optional filters (email, organization, role, status)',
      inputSchema: {
        type: 'object',
        properties: {
          email: { type: 'string', description: 'Filter by email (partial match)' },
          organization_id: { type: 'number', description: 'Filter by organization ID' },
          role: { type: 'string', description: 'Filter by role (ADMIN, MANAGER, TRADER, ANALYST, VIEWER)' },
          status: { type: 'string', enum: ['active', 'inactive'], description: 'Filter by status' },
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
    findUserHandler,
    findUserSchema
  );

  toolRegistry.register(
    'get_user_info',
    {
      name: 'get_user_info',
      description: 'Get detailed information about a specific user by ID',
      inputSchema: {
        type: 'object',
        properties: {
          user_id: { type: 'number', description: 'User ID' },
          with_permissions: { type: 'boolean', default: false, description: 'Include permissions in response' },
        },
        required: ['user_id'],
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    getUserInfoHandler,
    getUserInfoSchema
  );

  toolRegistry.register(
    'get_user_permissions',
    {
      name: 'get_user_permissions',
      description: 'Get the permissions for a specific user based on their role',
      inputSchema: {
        type: 'object',
        properties: {
          user_id: { type: 'number', description: 'User ID' },
        },
        required: ['user_id'],
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    getUserPermissionsHandler,
    getUserPermissionsSchema
  );
}
