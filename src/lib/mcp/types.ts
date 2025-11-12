/**
 * MCP (Model Context Protocol) Type Definitions
 * Based on MCP 0.1.0 Specification
 */

// ============================================================================
// JSON-RPC 2.0 Types
// ============================================================================

export interface JSONRPCRequest {
  jsonrpc: "2.0";
  id: number | string | null;
  method: string;
  params?: Record<string, any>;
}

export interface JSONRPCResponse {
  jsonrpc: "2.0";
  id: number | string | null;
  result?: any;
  error?: JSONRPCError;
}

export interface JSONRPCError {
  code: number;
  message: string;
  data?: any;
}

// Standard JSON-RPC error codes
export enum JSONRPCErrorCode {
  PARSE_ERROR = -32700,
  INVALID_REQUEST = -32600,
  METHOD_NOT_FOUND = -32601,
  INVALID_PARAMS = -32602,
  INTERNAL_ERROR = -32603,
}

// ============================================================================
// MCP Protocol Types
// ============================================================================

export interface MCPInitializeParams {
  protocolVersion: string;
  capabilities: ClientCapabilities;
  clientInfo: {
    name: string;
    version: string;
  };
}

export interface ClientCapabilities {
  roots?: {
    listChanged?: boolean;
  };
  sampling?: Record<string, any>;
  experimental?: Record<string, any>;
}

export interface MCPInitializeResult {
  protocolVersion: string;
  capabilities: ServerCapabilities;
  serverInfo: {
    name: string;
    version: string;
  };
  sessionId: string;
}

export interface ServerCapabilities {
  tools?: {
    listChanged?: boolean;
  };
  prompts?: {
    listChanged?: boolean;
  };
  resources?: {
    subscribe?: boolean;
    listChanged?: boolean;
  };
  logging?: Record<string, any>;
  experimental?: Record<string, any>;
}

// ============================================================================
// Tool Types
// ============================================================================

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties?: Record<string, any>;
    required?: string[];
    additionalProperties?: boolean;
  };
  // Tool annotations for AI optimization
  readOnlyHint?: boolean;      // True if tool doesn't modify state
  destructiveHint?: boolean;   // True if tool makes irreversible changes
  idempotentHint?: boolean;    // True if repeated calls have same effect
  openWorldHint?: boolean;     // True if tool interacts with external systems
}

export interface ToolCallParams {
  name: string;
  arguments?: Record<string, any>;
}

export interface ToolCallResult {
  content: Content[];
  isError: boolean;
}

export interface Content {
  type: "text" | "image" | "resource";
  text?: string;
  data?: string;
  mimeType?: string;
}

// ============================================================================
// Prompt Types
// ============================================================================

export interface PromptDefinition {
  name: string;
  description: string;
  arguments?: PromptArgument[];
}

export interface PromptArgument {
  name: string;
  description: string;
  required: boolean;
  schema?: Record<string, any>;
}

export interface PromptGetParams {
  name: string;
  arguments?: Record<string, any>;
}

export interface PromptGetResult {
  description?: string;
  messages: PromptMessage[];
}

export interface PromptMessage {
  role: "user" | "assistant";
  content: Content;
}

// ============================================================================
// Resource Types (for future use)
// ============================================================================

export interface ResourceDefinition {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface ResourceContents {
  uri: string;
  mimeType?: string;
  text?: string;
  blob?: string;
}

// ============================================================================
// Session Types
// ============================================================================

export interface MCPSession {
  sessionId: string;
  userId: number;
  organizationId: number;
  accessToken: string;
  capabilities: ClientCapabilities;
  createdAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
}

export interface SessionContext {
  sessionId: string;
  userId: number;
  organizationId: number;
  userEmail: string;
  role: string;
}

// ============================================================================
// MCP Method Types
// ============================================================================

export type MCPMethod =
  | "initialize"
  | "initialized"
  | "ping"
  | "shutdown"
  | "tools/list"
  | "tools/call"
  | "prompts/list"
  | "prompts/get"
  | "resources/list"
  | "resources/read"
  | "resources/subscribe"
  | "resources/unsubscribe"
  | "logging/setLevel";

// ============================================================================
// Notification Types (Server to Client)
// ============================================================================

export interface MCPNotification {
  jsonrpc: "2.0";
  method: string;
  params?: Record<string, any>;
}

export type NotificationMethod =
  | "notifications/tools/list_changed"
  | "notifications/prompts/list_changed"
  | "notifications/resources/list_changed"
  | "notifications/resources/updated"
  | "notifications/message"
  | "notifications/progress";

// ============================================================================
// Response Wrapper Types
// ============================================================================

export interface MCPToolResponse {
  content: Content[];
  structuredContent?: any;  // For JSON data
  isError: boolean;
  errorCategory?: ErrorCategory;
  retryable?: boolean;
  userAction?: string;
}

export enum ErrorCategory {
  AUTHENTICATION_FAILED = "authentication_failed",
  ACCESS_DENIED = "access_denied",
  NOT_FOUND = "not_found",
  INVALID_REQUEST = "invalid_request",
  RATE_LIMITED = "rate_limited",
  API_ERROR = "api_error",
}

// ============================================================================
// Pagination Types
// ============================================================================

export interface PaginationParams {
  cursor?: string;
  pageLimit?: number;  // Max 25
  sortBy?: string;     // field or -field for descending
}

export interface PaginationMeta {
  status: "success" | "error";
  count: number;
  total_count: number;
  page_limit: number;
  sort_by: string;
  next_cursor?: string;
}

export interface Cursor {
  offset: number;
  sortBy: string;
  filters?: Record<string, any>;
}

// ============================================================================
// MediaMath Specific Types (for tool responses)
// ============================================================================

export interface MediaMathResponse<T = any> {
  data: T | T[];
  meta: PaginationMeta;
}

export interface MediaMathLinks {
  edit_campaign_url?: string;
  edit_strategy_url?: string;
  view_details_url?: string;
}

// ============================================================================
// Type Guards
// ============================================================================

export function isJSONRPCRequest(obj: any): obj is JSONRPCRequest {
  return (
    obj &&
    typeof obj === "object" &&
    obj.jsonrpc === "2.0" &&
    typeof obj.method === "string" &&
    (obj.id === null || typeof obj.id === "string" || typeof obj.id === "number")
  );
}

export function isToolCallParams(obj: any): obj is ToolCallParams {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.name === "string"
  );
}

export function isPromptGetParams(obj: any): obj is PromptGetParams {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.name === "string"
  );
}

// ============================================================================
// Utility Types
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];
