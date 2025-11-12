/**
 * MCP Protocol Handler
 * Implements JSON-RPC 2.0 request/response handling for MCP 0.1.0
 */

import {
  JSONRPCRequest,
  JSONRPCResponse,
  JSONRPCError,
  JSONRPCErrorCode,
  MCPMethod,
  MCPInitializeParams,
  MCPInitializeResult,
  ToolCallParams,
  ToolCallResult,
  PromptGetParams,
  PromptGetResult,
  ToolDefinition,
  PromptDefinition,
  isJSONRPCRequest,
  isToolCallParams,
  isPromptGetParams,
} from "./types";
import { createSession, getSession } from "./session";
import { ServerCapabilities } from "./types";

// ============================================================================
// Protocol Configuration
// ============================================================================

const PROTOCOL_VERSION = "0.1.0";
const SERVER_NAME = "mediamath-mcp-mock";
const SERVER_VERSION = "1.0.0";

// ============================================================================
// Main Protocol Handler
// ============================================================================

export interface ProtocolHandlerContext {
  toolRegistry?: Map<string, ToolHandler>;
  promptRegistry?: Map<string, PromptHandler>;
  sessionId?: string;
}

export type ToolHandler = (
  params: Record<string, any>,
  context: SessionContext
) => Promise<ToolCallResult>;

export type PromptHandler = (
  params: Record<string, any>
) => Promise<PromptGetResult>;

interface SessionContext {
  sessionId: string;
  userId: number;
  organizationId: number;
}

/**
 * Main entry point for processing MCP requests
 */
export async function handleMCPRequest(
  requestBody: unknown,
  context: ProtocolHandlerContext = {}
): Promise<JSONRPCResponse> {
  // Validate JSON-RPC structure
  if (!isJSONRPCRequest(requestBody)) {
    return createErrorResponse(
      null,
      JSONRPCErrorCode.INVALID_REQUEST,
      "Invalid JSON-RPC 2.0 request"
    );
  }

  const request = requestBody as JSONRPCRequest;

  try {
    // Route to appropriate method handler
    const result = await routeMethod(request, context);
    return createSuccessResponse(request.id, result);
  } catch (error) {
    return handleProtocolError(request.id, error);
  }
}

// ============================================================================
// Method Router
// ============================================================================

async function routeMethod(
  request: JSONRPCRequest,
  context: ProtocolHandlerContext
): Promise<any> {
  const method = request.method as MCPMethod;
  const params = request.params || {};

  switch (method) {
    case "initialize":
      return handleInitialize(params as MCPInitializeParams);

    case "initialized":
      // Client notification that initialization is complete
      return null;

    case "ping":
      return handlePing();

    case "shutdown":
      return handleShutdown(context.sessionId);

    case "tools/list":
      return handleToolsList(context);

    case "tools/call":
      return handleToolsCall(params, context);

    case "prompts/list":
      return handlePromptsList(context);

    case "prompts/get":
      return handlePromptsGet(params, context);

    case "resources/list":
      // Not implemented in MVP
      return { resources: [] };

    case "resources/read":
      throw createMethodError("resources/read not implemented");

    default:
      throw createMethodError(`Unknown method: ${method}`);
  }
}

// ============================================================================
// Method Handlers
// ============================================================================

/**
 * Handle initialize request
 * Creates a new session and returns server capabilities
 */
async function handleInitialize(
  params: MCPInitializeParams
): Promise<MCPInitializeResult> {
  // Validate protocol version
  if (!params.protocolVersion || !params.protocolVersion.startsWith("0.")) {
    throw createInvalidParamsError(
      `Unsupported protocol version: ${params.protocolVersion}`
    );
  }

  // For mock server, we'll use a default user context
  // In production, this would come from authentication
  const userId = 1; // Default mock user
  const organizationId = 100048; // Default org from spec

  // Create session
  const session = await createSession(
    userId,
    organizationId,
    "mock_access_token",
    params.capabilities
  );

  // Return server capabilities
  const capabilities: ServerCapabilities = {
    tools: {
      listChanged: true, // We support tool list change notifications
    },
    prompts: {
      listChanged: true, // We support prompt list change notifications
    },
    resources: {
      subscribe: false,
      listChanged: false,
    },
    logging: {},
    experimental: {},
  };

  return {
    protocolVersion: PROTOCOL_VERSION,
    capabilities,
    serverInfo: {
      name: SERVER_NAME,
      version: SERVER_VERSION,
    },
    sessionId: session.sessionId,
  };
}

/**
 * Handle ping request
 */
async function handlePing(): Promise<Record<string, never>> {
  return {};
}

/**
 * Handle shutdown request
 */
async function handleShutdown(sessionId?: string): Promise<Record<string, never>> {
  // Session cleanup handled by session manager
  return {};
}

/**
 * Handle tools/list request
 * Returns all available tools from the registry
 */
async function handleToolsList(
  context: ProtocolHandlerContext
): Promise<{ tools: ToolDefinition[] }> {
  // Import toolRegistry dynamically to avoid circular dependencies
  const { toolRegistry } = await import('../tools/registry');

  const tools = toolRegistry.listTools();
  return { tools };
}

/**
 * Handle tools/call request
 * Dispatches to the appropriate tool handler
 */
async function handleToolsCall(
  params: unknown,
  context: ProtocolHandlerContext
): Promise<ToolCallResult> {
  // Validate params
  if (!isToolCallParams(params)) {
    throw createInvalidParamsError("Invalid tool call parameters");
  }

  const toolParams = params as ToolCallParams;

  // Validate session
  if (!context.sessionId) {
    throw createAuthError("No session ID provided");
  }

  const session = await getSession(context.sessionId);
  if (!session) {
    throw createAuthError("Invalid session");
  }

  // Import toolRegistry dynamically
  const { toolRegistry } = await import('../tools/registry');

  // Create tool context
  const toolContext = {
    sessionId: session.sessionId,
    userId: session.userId,
    organizationId: session.organizationId,
    role: 'admin', // Default role for demo
  };

  // Execute tool via registry
  try {
    const result = await toolRegistry.callTool(toolParams.name, toolParams.arguments || {}, toolContext);
    return result;
  } catch (error) {
    // Convert tool errors to MCP error format
    if (error instanceof Error) {
      return {
        content: [
          {
            type: "text",
            text: `Tool execution error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
    throw error;
  }
}

/**
 * Handle prompts/list request
 * Returns all available prompts from the registry
 */
async function handlePromptsList(
  context: ProtocolHandlerContext
): Promise<{ prompts: PromptDefinition[] }> {
  if (!context.promptRegistry) {
    return { prompts: [] };
  }

  // Get all prompt definitions from registry
  const prompts: PromptDefinition[] = [];

  // This will be populated by the prompt registry
  // For now, return empty array - prompts will be registered by prompt modules

  return { prompts };
}

/**
 * Handle prompts/get request
 * Returns the prompt template with given arguments
 */
async function handlePromptsGet(
  params: unknown,
  context: ProtocolHandlerContext
): Promise<PromptGetResult> {
  // Validate params
  if (!isPromptGetParams(params)) {
    throw createInvalidParamsError("Invalid prompt get parameters");
  }

  const promptParams = params as PromptGetParams;

  // Get prompt handler
  if (!context.promptRegistry) {
    throw createInternalError("Prompt registry not initialized");
  }

  const handler = context.promptRegistry.get(promptParams.name);
  if (!handler) {
    throw createMethodError(`Prompt not found: ${promptParams.name}`);
  }

  // Execute prompt handler
  try {
    const result = await handler(promptParams.arguments || {});
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw createInternalError(`Prompt generation error: ${error.message}`);
    }
    throw error;
  }
}

// ============================================================================
// Response Builders
// ============================================================================

export function createSuccessResponse(
  id: number | string | null,
  result: any
): JSONRPCResponse {
  return {
    jsonrpc: "2.0",
    id,
    result,
  };
}

export function createErrorResponse(
  id: number | string | null,
  code: number,
  message: string,
  data?: any
): JSONRPCResponse {
  return {
    jsonrpc: "2.0",
    id,
    error: {
      code,
      message,
      data,
    },
  };
}

// ============================================================================
// Error Creators
// ============================================================================

class MCPError extends Error {
  constructor(
    public code: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = "MCPError";
  }
}

function createMethodError(message: string): MCPError {
  return new MCPError(JSONRPCErrorCode.METHOD_NOT_FOUND, message);
}

function createInvalidParamsError(message: string): MCPError {
  return new MCPError(JSONRPCErrorCode.INVALID_PARAMS, message);
}

function createInternalError(message: string): MCPError {
  return new MCPError(JSONRPCErrorCode.INTERNAL_ERROR, message);
}

function createAuthError(message: string): MCPError {
  return new MCPError(-32000, message, { category: "authentication_failed" });
}

// ============================================================================
// Error Handler
// ============================================================================

function handleProtocolError(
  id: number | string | null,
  error: unknown
): JSONRPCResponse {
  // Handle MCP errors
  if (error instanceof MCPError) {
    return createErrorResponse(id, error.code, error.message, error.data);
  }

  // Handle standard errors
  if (error instanceof Error) {
    return createErrorResponse(
      id,
      JSONRPCErrorCode.INTERNAL_ERROR,
      error.message
    );
  }

  // Handle unknown errors
  return createErrorResponse(
    id,
    JSONRPCErrorCode.INTERNAL_ERROR,
    "An unknown error occurred"
  );
}

// ============================================================================
// Notification Builder (for SSE)
// ============================================================================

export function createNotification(
  method: string,
  params?: Record<string, any>
): string {
  const notification = {
    jsonrpc: "2.0",
    method,
    params: params || {},
  };
  return JSON.stringify(notification);
}

// ============================================================================
// Request Validator
// ============================================================================

export function validateJSONRPCRequest(body: unknown): {
  valid: boolean;
  error?: string;
} {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be an object" };
  }

  const obj = body as any;

  if (obj.jsonrpc !== "2.0") {
    return { valid: false, error: 'jsonrpc field must be "2.0"' };
  }

  if (typeof obj.method !== "string") {
    return { valid: false, error: "method field must be a string" };
  }

  if (
    obj.id !== null &&
    typeof obj.id !== "string" &&
    typeof obj.id !== "number"
  ) {
    return { valid: false, error: "id must be string, number, or null" };
  }

  if (obj.params !== undefined && typeof obj.params !== "object") {
    return { valid: false, error: "params must be an object if provided" };
  }

  return { valid: true };
}

// ============================================================================
// Exports
// ============================================================================

export {
  PROTOCOL_VERSION,
  SERVER_NAME,
  SERVER_VERSION,
  MCPError,
};
