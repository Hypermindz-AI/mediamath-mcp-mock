/**
 * Custom MCP Server - Vercel Deployment (Stateless HTTP)
 * JSON-RPC 2.0 handler without external dependencies
 */

import { NextRequest, NextResponse } from "next/server";
import { initializeTools, getToolsList, callTool } from "@/lib/tools/index";

// Initialize tools on module load
let toolsInitialized = false;
function ensureToolsInitialized() {
  if (!toolsInitialized) {
    initializeTools();
    toolsInitialized = true;
  }
}

/**
 * JSON-RPC 2.0 Error Codes
 */
const JSON_RPC_ERRORS = {
  PARSE_ERROR: { code: -32700, message: "Parse error" },
  INVALID_REQUEST: { code: -32600, message: "Invalid Request" },
  METHOD_NOT_FOUND: { code: -32601, message: "Method not found" },
  INVALID_PARAMS: { code: -32602, message: "Invalid params" },
  INTERNAL_ERROR: { code: -32603, message: "Internal error" },
  UNAUTHORIZED: { code: -32001, message: "Unauthorized" },
};

/**
 * Simple API Key Authentication
 * Set MCP_API_KEY environment variable to enable auth
 * If not set, API is public (no auth required)
 */
function checkAuth(req: NextRequest): boolean {
  const apiKey = process.env.MCP_API_KEY;

  // If no API key configured, allow public access
  if (!apiKey) {
    return true;
  }

  // Check X-API-Key header
  const requestKey = req.headers.get("X-API-Key");
  return requestKey === apiKey;
}

/**
 * Create JSON-RPC 2.0 success response
 */
function jsonRpcSuccess(id: any, result: any) {
  return NextResponse.json({
    jsonrpc: "2.0",
    id,
    result,
  });
}

/**
 * Create JSON-RPC 2.0 error response
 */
function jsonRpcError(id: any, error: { code: number; message: string; data?: any }) {
  return NextResponse.json({
    jsonrpc: "2.0",
    id,
    error,
  });
}

/**
 * Handle MCP initialize method
 */
function handleInitialize(id: any) {
  return jsonRpcSuccess(id, {
    protocolVersion: "2024-11-05",
    capabilities: {
      tools: {},
      logging: {},
    },
    serverInfo: {
      name: "mediamath-mcp-mock",
      version: "1.0.0",
    },
  });
}

/**
 * Handle MCP tools/list method
 */
function handleToolsList(id: any) {
  ensureToolsInitialized();
  const tools = getToolsList();

  return jsonRpcSuccess(id, {
    tools,
  });
}

/**
 * Handle MCP tools/call method
 */
async function handleToolsCall(id: any, params: any) {
  ensureToolsInitialized();

  const { name, arguments: args = {} } = params;

  if (!name) {
    return jsonRpcError(id, {
      ...JSON_RPC_ERRORS.INVALID_PARAMS,
      data: "Tool name is required",
    });
  }

  try {
    // Call the tool with context (can be enhanced with auth later)
    const result = await callTool(name, args, {
      userId: 1, // Mock user for demo
      organizationId: 100048, // ACME Corporation
      role: "admin",
    });

    return jsonRpcSuccess(id, result);
  } catch (error: any) {
    console.error(`Tool execution error for "${name}":`, error);

    return jsonRpcError(id, {
      ...JSON_RPC_ERRORS.INTERNAL_ERROR,
      data: error.message || "Tool execution failed",
    });
  }
}

/**
 * Handle MCP ping method (for health checks)
 */
function handlePing(id: any) {
  return jsonRpcSuccess(id, {});
}

/**
 * Main POST handler for JSON-RPC 2.0 requests
 */
export async function POST(req: NextRequest) {
  // Check authentication
  if (!checkAuth(req)) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32001,
          message: "Unauthorized - Invalid or missing API key",
          data: "Provide X-API-Key header with valid API key"
        }
      },
      { status: 401 }
    );
  }

  try {
    // Parse JSON-RPC request
    const body = await req.json();

    // Validate JSON-RPC 2.0 format
    if (body.jsonrpc !== "2.0") {
      return jsonRpcError(body.id || null, JSON_RPC_ERRORS.INVALID_REQUEST);
    }

    const { method, params, id } = body;

    // Route to appropriate handler
    switch (method) {
      case "initialize":
        return handleInitialize(id);

      case "tools/list":
        return handleToolsList(id);

      case "tools/call":
        return await handleToolsCall(id, params);

      case "ping":
        return handlePing(id);

      case "notifications/initialized":
        // Client acknowledges initialization - no response needed
        return jsonRpcSuccess(id, {});

      default:
        return jsonRpcError(id, {
          ...JSON_RPC_ERRORS.METHOD_NOT_FOUND,
          data: `Method "${method}" not supported`,
        });
    }
  } catch (error: any) {
    console.error("JSON-RPC handler error:", error);

    return jsonRpcError(null, {
      ...JSON_RPC_ERRORS.PARSE_ERROR,
      data: error.message,
    });
  }
}

/**
 * GET handler (some MCP clients use GET for health checks)
 */
export async function GET(req: NextRequest) {
  // Check authentication
  if (!checkAuth(req)) {
    return NextResponse.json(
      {
        status: "unauthorized",
        message: "Invalid or missing API key",
        hint: "Provide X-API-Key header with valid API key"
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    status: "healthy",
    server: "mediamath-mcp-mock",
    version: "1.0.0",
    transport: "http",
    protocol: "mcp/2024-11-05",
    tools_count: 28,
    auth_enabled: !!process.env.MCP_API_KEY,
  });
}

/**
 * Handle OPTIONS for CORS preflight
 */
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
    },
  });
}
