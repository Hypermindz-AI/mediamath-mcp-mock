/**
 * MCP (Model Context Protocol) Layer
 * Main entry point for all MCP functionality
 */

// ============================================================================
// Type Exports
// ============================================================================

export type {
  // JSON-RPC Types
  JSONRPCRequest,
  JSONRPCResponse,
  JSONRPCError,

  // MCP Protocol Types
  MCPInitializeParams,
  MCPInitializeResult,
  MCPMethod,

  // Tool Types
  ToolDefinition,
  ToolCallParams,
  ToolCallResult,
  Content,

  // Prompt Types
  PromptDefinition,
  PromptArgument,
  PromptGetParams,
  PromptGetResult,
  PromptMessage,

  // Resource Types
  ResourceDefinition,
  ResourceContents,

  // Session Types
  MCPSession,
  SessionContext,

  // Notification Types
  MCPNotification,
  NotificationMethod,

  // Response Types
  MCPToolResponse,

  // Pagination Types
  PaginationParams,
  PaginationMeta,
  Cursor,

  // MediaMath Types
  MediaMathResponse,
  MediaMathLinks,

  // Capability Types
  ClientCapabilities,
  ServerCapabilities,
} from "./types";

export {
  // Enums
  JSONRPCErrorCode,
  ErrorCategory,

  // Type Guards
  isJSONRPCRequest,
  isToolCallParams,
  isPromptGetParams,
} from "./types";

// ============================================================================
// Protocol Exports
// ============================================================================

export {
  // Main Handler
  handleMCPRequest,

  // Response Builders
  createSuccessResponse,
  createErrorResponse,
  createNotification,

  // Validators
  validateJSONRPCRequest,

  // Constants
  PROTOCOL_VERSION,
  SERVER_NAME,
  SERVER_VERSION,

  // Error Class
  MCPError,

  // Types
  type ProtocolHandlerContext,
  type ToolHandler,
  type PromptHandler,
} from "./protocol";

// ============================================================================
// Session Exports
// ============================================================================

export {
  // Session Management
  generateSessionId,
  createSession,
  getSession,
  updateSessionActivity,
  deleteSession,

  // Session Queries
  getAllSessions,
  getSessionsByUserId,
  getSessionsByOrganizationId,
  getSessionCount,
  getSessionStats,

  // Session Validation
  validateSession,
  extendSession,

  // Session Context
  getSessionContext,
  hasOrganizationAccess,
  getUserFromSession,

  // Cleanup
  cleanupExpiredSessions,
  clearAllSessions,

  // Store Instance (for testing)
  sessionStore,
} from "./session";

// ============================================================================
// SSE Exports
// ============================================================================

export {
  // Connection Management
  createSSEConnection,
  closeSSEConnection,
  closeAllSSEConnections,

  // Notifications
  sendNotification,
  broadcastNotification,

  // Connection Queries
  getActiveSSEConnections,
  getSSEConnectionCount,
  getSSEStats,
  hasSSEConnection,

  // Notification Helpers
  notifyToolsListChanged,
  notifyPromptsListChanged,
  notifyResourcesListChanged,
  notifyResourceUpdated,
  notifyMessage,
  notifyProgress,

  // Manager Instance (for testing)
  sseManager,
} from "./sse";

// ============================================================================
// Version Information
// ============================================================================

export const MCP_VERSION = "0.1.0";
export const IMPLEMENTATION_VERSION = "1.0.0";
export const IMPLEMENTATION_NAME = "mediamath-mcp-mock";

// ============================================================================
// Feature Flags
// ============================================================================

export const FEATURES = {
  TOOLS: true,
  PROMPTS: true,
  RESOURCES: false, // Not implemented in MVP
  SAMPLING: false,
  LOGGING: false,
  EXPERIMENTAL: false,
} as const;
