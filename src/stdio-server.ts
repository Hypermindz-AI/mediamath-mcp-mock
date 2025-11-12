#!/usr/bin/env node
/**
 * MediaMath MCP Mock Server - STDIO Transport
 *
 * Standard MCP server using STDIO transport for compatibility with:
 * - MCP Inspector
 * - Claude Desktop
 * - Other MCP clients
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Initialize tools
import { toolRegistry } from './lib/tools/registry.js';
import { registerSystemTools } from './lib/tools/system.js';
import { registerUserTools } from './lib/tools/user.js';
import { registerCampaignTools } from './lib/tools/campaign.js';
import { registerStrategyTools } from './lib/tools/strategy.js';
import { registerOrganizationTools } from './lib/tools/organization.js';
import { registerSupplyTools } from './lib/tools/supply.js';
import { registerCreativeTools } from './lib/tools/creative.js';
import { registerAudienceTools } from './lib/tools/audience.js';

// Register all tools
registerSystemTools();
registerUserTools();
registerCampaignTools();
registerStrategyTools();
registerOrganizationTools();
registerSupplyTools();
registerCreativeTools();
registerAudienceTools();

console.error(`[MCP Server] Initialized ${toolRegistry.getToolCount()} tools`);

/**
 * Create MCP server instance
 */
const server = new Server(
  {
    name: "mediamath-mcp-mock",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Handler for tools/list request
 * Returns all available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools = toolRegistry.listTools();

  console.error(`[MCP Server] Listing ${tools.length} tools`);

  return {
    tools,
  };
});

/**
 * Handler for tools/call request
 * Executes the requested tool
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  console.error(`[MCP Server] Calling tool: ${name}`);

  // Create tool context
  // Note: In STDIO mode, we don't have user auth from OAuth
  // The MCP client (like Claude Desktop) provides the context
  const context = {
    userId: 1, // Default to admin user for now
    organizationId: 100048, // Default to ACME org
    role: 'ADMIN',
  };

  try {
    const result = await toolRegistry.callTool(name, args || {}, context);

    console.error(`[MCP Server] Tool ${name} completed successfully`);

    return result;
  } catch (error) {
    console.error(`[MCP Server] Tool ${name} failed:`, error);
    throw error;
  }
});

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();

  console.error("[MCP Server] Starting MediaMath MCP Mock Server on STDIO");
  console.error("[MCP Server] Server: mediamath-mcp-mock v1.0.0");
  console.error(`[MCP Server] Tools available: ${toolRegistry.getToolCount()}`);

  await server.connect(transport);

  console.error("[MCP Server] Server connected and ready");
}

main().catch((error) => {
  console.error("[MCP Server] Fatal error:", error);
  process.exit(1);
});
