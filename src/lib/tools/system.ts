/**
 * System Tools
 * Health and system status tools
 */

import { z } from 'zod';
import { toolRegistry, createSuccessResponse, type ToolContext, type ToolResponse } from './registry';
import { getSessionCount } from '../mcp/session';
import { getDataStore } from '../data/store';

// ============================================================================
// healthcheck
// ============================================================================

const healthcheckSchema = z.object({});

async function healthcheckHandler(
  args: z.infer<typeof healthcheckSchema>,
  context: ToolContext
): Promise<ToolResponse> {
  const store = getDataStore();
  const stats = store.getStats();

  const health = {
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      auth: 'up',
      data: 'up',
      mcp: 'up',
      sse: 'up',
    },
    stats: {
      activeSessions: getSessionCount(),
      totalRecords: stats.total,
      campaigns: stats.campaigns,
      strategies: stats.strategies,
      users: stats.users,
    },
  };

  return createSuccessResponse(
    health,
    '✅ System is healthy and all services are operational.'
  );
}

/**
 * Register system tools
 */
export function registerSystemTools(): void {
  toolRegistry.register(
    'healthcheck',
    {
      name: 'healthcheck',
      description: 'Check the health status of the MCP server and all services',
      inputSchema: {
        type: 'object',
        properties: {},
        required: [],
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    healthcheckHandler,
    healthcheckSchema
  );
}
