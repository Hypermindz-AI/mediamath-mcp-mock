/**
 * MCP Tools - Central Registration
 *
 * This module registers all 28 MCP tools and provides utilities
 * for tool management and discovery.
 */

import { toolRegistry } from './registry';
import { registerSystemTools } from './system';
import { registerUserTools } from './user';
import { registerCampaignTools } from './campaign';
import { registerStrategyTools } from './strategy';
import { registerOrganizationTools } from './organization';
import { registerSupplyTools } from './supply';
import { registerCreativeTools } from './creative';
import { registerAudienceTools } from './audience';

/**
 * Initialize and register all MCP tools
 * Call this once at application startup
 */
export function initializeTools(): void {
  // Register all tool categories
  registerSystemTools();        // 1 tool
  registerUserTools();           // 3 tools
  registerCampaignTools();       // 4 tools
  registerStrategyTools();       // 4 tools
  registerOrganizationTools();   // 6 tools
  registerSupplyTools();         // 4 tools
  registerCreativeTools();       // 2 tools
  registerAudienceTools();       // 1 tool

  console.log(`✅ Initialized ${toolRegistry.getToolCount()} MCP tools`);
}

/**
 * Get all registered tools in MCP format
 */
export function getToolsList() {
  return toolRegistry.listTools();
}

/**
 * Call a tool with arguments and context
 */
export async function callTool(
  name: string,
  args: any,
  context: {
    userId?: number;
    organizationId?: number;
    role?: string;
    sessionId?: string;
  }
) {
  return await toolRegistry.callTool(name, args, context);
}

/**
 * Get tool count by category
 */
export function getToolCategorySummary() {
  return {
    system: 1,
    user: 3,
    campaign: 4,
    strategy: 4,
    organization: 6,
    supply: 4,
    creative: 2,
    audience: 1,
    total: 28,
  };
}

// Re-export registry for direct access if needed
export { toolRegistry } from './registry';
export type { ToolContext, ToolResponse, ToolDefinition } from './registry';
