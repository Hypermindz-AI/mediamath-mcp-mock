# MCP Layer Implementation

This directory contains the complete implementation of the Model Context Protocol (MCP) 0.1.0 layer for the MediaMath Mock Server.

## Overview

The MCP layer provides a JSON-RPC 2.0 compliant protocol handler that enables AI models to interact with the MediaMath mock API through a standardized interface. It includes session management, real-time notifications via Server-Sent Events (SSE), and comprehensive type definitions.

## Architecture

```
mcp/
├── types.ts       # Type definitions for MCP protocol
├── protocol.ts    # JSON-RPC 2.0 request/response handler
├── session.ts     # Session management and lifecycle
├── sse.ts         # Server-Sent Events connection manager
└── index.ts       # Public API exports
```

## Files

### 1. types.ts (338 lines)

**Purpose**: Complete TypeScript type definitions for MCP 0.1.0 specification

**Key Types**:
- **JSON-RPC 2.0**: `JSONRPCRequest`, `JSONRPCResponse`, `JSONRPCError`
- **MCP Protocol**: `MCPInitializeParams`, `MCPInitializeResult`, `ServerCapabilities`
- **Tools**: `ToolDefinition`, `ToolCallParams`, `ToolCallResult`
  - Annotations: `readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`
- **Prompts**: `PromptDefinition`, `PromptGetParams`, `PromptGetResult`
- **Sessions**: `MCPSession`, `SessionContext`
- **Notifications**: `NotificationMethod`, `MCPNotification`
- **Pagination**: `PaginationParams`, `PaginationMeta`, `Cursor`
- **Errors**: `ErrorCategory` enum

**Type Guards**:
```typescript
isJSONRPCRequest(obj: any): obj is JSONRPCRequest
isToolCallParams(obj: any): obj is ToolCallParams
isPromptGetParams(obj: any): obj is PromptGetParams
```

### 2. protocol.ts (504 lines)

**Purpose**: JSON-RPC 2.0 protocol handler with method routing

**Key Functions**:

#### Main Handler
```typescript
handleMCPRequest(
  requestBody: unknown,
  context: ProtocolHandlerContext
): Promise<JSONRPCResponse>
```
Entry point for all MCP requests. Validates JSON-RPC structure and routes to appropriate handler.

#### Supported Methods
- `initialize` - Creates session, returns capabilities
- `initialized` - Client notification (no-op)
- `ping` - Health check
- `shutdown` - Session cleanup
- `tools/list` - Returns available tools
- `tools/call` - Executes a tool
- `prompts/list` - Returns available prompts
- `prompts/get` - Gets prompt template
- `resources/list` - Returns empty (MVP)

#### Response Builders
```typescript
createSuccessResponse(id, result): JSONRPCResponse
createErrorResponse(id, code, message, data?): JSONRPCResponse
createNotification(method, params?): string
```

#### Error Handling
- Custom `MCPError` class with error codes
- Automatic error categorization
- User-friendly error messages

**Configuration**:
```typescript
PROTOCOL_VERSION = "0.1.0"
SERVER_NAME = "mediamath-mcp-mock"
SERVER_VERSION = "1.0.0"
```

### 3. session.ts (448 lines)

**Purpose**: In-memory session management with TTL and cleanup

**Key Features**:

#### Session Store
- Map-based in-memory storage
- Automatic cleanup of expired sessions
- 24-hour TTL (configurable)
- Cleanup runs every hour

#### Public API
```typescript
// Session CRUD
createSession(userId, organizationId, accessToken, capabilities): Promise<MCPSession>
getSession(sessionId): Promise<MCPSession | null>
deleteSession(sessionId): Promise<boolean>
updateSessionActivity(sessionId): Promise<void>

// Queries
getAllSessions(): Promise<MCPSession[]>
getSessionsByUserId(userId): Promise<MCPSession[]>
getSessionsByOrganizationId(orgId): Promise<MCPSession[]>
getSessionCount(): Promise<number>
getSessionStats(): Promise<SessionStats>

// Validation
validateSession(sessionId): Promise<{ valid: boolean, session?, error? }>
hasOrganizationAccess(sessionId, targetOrgId): Promise<boolean>
extendSession(sessionId, additionalHours?): Promise<boolean>

// Context
getSessionContext(sessionId): Promise<SessionContext | null>
getUserFromSession(sessionId): Promise<UserInfo | null>

// Cleanup
cleanupExpiredSessions(): Promise<number>
clearAllSessions(): Promise<void>
```

#### Session Structure
```typescript
interface MCPSession {
  sessionId: string;          // "mcp_" + UUID
  userId: number;
  organizationId: number;
  accessToken: string;
  capabilities: ClientCapabilities;
  createdAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
}
```

**Configuration**:
```typescript
SESSION_TTL_HOURS = 24
SESSION_TTL_MS = 86400000
CLEANUP_INTERVAL_MS = 3600000  // 1 hour
```

### 4. sse.ts (519 lines)

**Purpose**: Server-Sent Events connection manager for real-time notifications

**Key Features**:

#### Connection Management
```typescript
createSSEConnection(sessionId): ReadableStream
closeSSEConnection(sessionId): void
closeAllSSEConnections(): void
```

#### Notification API
```typescript
// Direct send
sendNotification(sessionId, method, params?): boolean

// Broadcast
broadcastNotification(method, params?): number

// Helper functions
notifyToolsListChanged(sessionId?): void
notifyPromptsListChanged(sessionId?): void
notifyResourcesListChanged(sessionId?): void
notifyResourceUpdated(uri, sessionId?): void
notifyMessage(message, level, sessionId?): void
notifyProgress(operationId, progress, total, message?, sessionId?): void
```

#### Connection Queries
```typescript
getActiveSSEConnections(): string[]
getSSEConnectionCount(): number
getSSEStats(): SSEStats
hasSSEConnection(sessionId): boolean
```

#### SSE Message Format
```
event: notification
data: {"jsonrpc":"2.0","method":"notifications/tools/list_changed","params":{}}

event: ping
data: {"timestamp":"2025-11-10T14:30:00.000Z"}

event: connected
data: {"sessionId":"mcp_123","timestamp":"2025-11-10T14:30:00.000Z"}
retry: 10000

```

**Configuration**:
```typescript
PING_INTERVAL_MS = 30000           // 30 seconds
CONNECTION_TIMEOUT_MS = 120000     // 2 minutes
MAX_RECONNECT_DELAY_MS = 10000     // 10 seconds
```

### 5. index.ts (191 lines)

**Purpose**: Public API exports for easy consumption

**Exports**:
- All types from `types.ts`
- All enums and type guards
- Protocol handlers and builders from `protocol.ts`
- Session management functions from `session.ts`
- SSE functions from `sse.ts`
- Version constants and feature flags

## Usage Examples

### 1. Initialize MCP Session

```typescript
import { handleMCPRequest } from '@/lib/mcp';

const request = {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "0.1.0",
    capabilities: {
      roots: { listChanged: true }
    },
    clientInfo: {
      name: "my-client",
      version: "1.0.0"
    }
  }
};

const response = await handleMCPRequest(request);
console.log(response.result.sessionId); // "mcp_abc-123-..."
```

### 2. Register and Call Tools

```typescript
import { handleMCPRequest, ToolHandler, ToolCallResult } from '@/lib/mcp';

// Define tool handler
const healthcheckHandler: ToolHandler = async (params, context) => {
  return {
    content: [
      {
        type: "text",
        text: "System is healthy"
      }
    ],
    isError: false
  };
};

// Create tool registry
const toolRegistry = new Map<string, ToolHandler>();
toolRegistry.set("healthcheck", healthcheckHandler);

// Handle tool call
const request = {
  jsonrpc: "2.0",
  id: 2,
  method: "tools/call",
  params: {
    name: "healthcheck",
    arguments: {}
  }
};

const response = await handleMCPRequest(request, {
  toolRegistry,
  sessionId: "mcp_abc-123-..."
});
```

### 3. Set Up SSE Connection

```typescript
import { createSSEConnection, notifyToolsListChanged } from '@/lib/mcp';

// Create SSE stream
const stream = createSSEConnection("mcp_abc-123-...");

// In Next.js API route
return new Response(stream, {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  }
});

// Send notification
notifyToolsListChanged("mcp_abc-123-...");
```

### 4. Session Management

```typescript
import {
  createSession,
  getSession,
  validateSession,
  cleanupExpiredSessions,
  getSessionStats
} from '@/lib/mcp';

// Create session
const session = await createSession(
  1,                    // userId
  100048,              // organizationId
  "access_token",      // accessToken
  {}                   // capabilities
);

// Validate session
const { valid, session: validSession, error } = await validateSession(sessionId);
if (!valid) {
  console.error(error);
}

// Get statistics
const stats = await getSessionStats();
console.log(`Active sessions: ${stats.active}`);
console.log(`Expired sessions: ${stats.expired}`);

// Cleanup
const cleanedCount = await cleanupExpiredSessions();
console.log(`Cleaned ${cleanedCount} expired sessions`);
```

## Integration with Next.js

### API Route: POST /api/mcp

```typescript
// app/api/mcp/route.ts
import { handleMCPRequest } from '@/lib/mcp';
import { toolRegistry } from '@/lib/tools/registry';
import { promptRegistry } from '@/lib/prompts/registry';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sessionId = request.headers.get('MCP-Session-Id') || undefined;

    const response = await handleMCPRequest(body, {
      toolRegistry,
      promptRegistry,
      sessionId,
    });

    return Response.json(response);
  } catch (error) {
    return Response.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
```

### API Route: GET /api/sse

```typescript
// app/api/sse/route.ts
import { createSSEConnection, validateSession } from '@/lib/mcp';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('sessionId');

  if (!sessionId) {
    return Response.json({ error: 'sessionId required' }, { status: 400 });
  }

  // Validate session
  const { valid } = await validateSession(sessionId);
  if (!valid) {
    return Response.json({ error: 'Invalid session' }, { status: 401 });
  }

  // Create SSE stream
  const stream = createSSEConnection(sessionId);

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

## Error Handling

### Error Categories

```typescript
enum ErrorCategory {
  AUTHENTICATION_FAILED = "authentication_failed",  // 401
  ACCESS_DENIED = "access_denied",                 // 403
  NOT_FOUND = "not_found",                         // 404
  INVALID_REQUEST = "invalid_request",             // 400
  RATE_LIMITED = "rate_limited",                   // 429
  API_ERROR = "api_error"                          // 500-504
}
```

### JSON-RPC Error Codes

```typescript
enum JSONRPCErrorCode {
  PARSE_ERROR = -32700,
  INVALID_REQUEST = -32600,
  METHOD_NOT_FOUND = -32601,
  INVALID_PARAMS = -32602,
  INTERNAL_ERROR = -32603,
}
```

## Tool Annotations

Tool definitions support four hint annotations to help AI models optimize their behavior:

```typescript
interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: object;

  // Hints for AI optimization
  readOnlyHint?: boolean;      // true = doesn't modify state
  destructiveHint?: boolean;   // true = irreversible changes
  idempotentHint?: boolean;    // true = same result if called multiple times
  openWorldHint?: boolean;     // true = interacts with external systems
}
```

### Example

```typescript
{
  name: "find_campaigns",
  description: "Search campaigns",
  inputSchema: { /* ... */ },
  readOnlyHint: true,        // Safe to call multiple times
  destructiveHint: false,    // Doesn't delete or modify
  idempotentHint: true,      // Same results every time
  openWorldHint: false       // No external dependencies
}
```

## Testing

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest';
import { handleMCPRequest, createSession } from '@/lib/mcp';

describe('MCP Protocol', () => {
  it('should handle initialize request', async () => {
    const request = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "0.1.0",
        capabilities: {},
        clientInfo: { name: "test", version: "1.0.0" }
      }
    };

    const response = await handleMCPRequest(request);
    expect(response.result.sessionId).toMatch(/^mcp_/);
  });
});
```

## Performance Considerations

- **In-Memory Storage**: Sessions and SSE connections stored in memory
- **Automatic Cleanup**: Expired sessions cleaned every hour
- **Connection Limits**: SSE connections auto-close after 2 minutes inactivity
- **Ping Intervals**: Keep-alive pings every 30 seconds

## Limitations

1. **Stateless Serverless**: In-memory state lost between serverless invocations
2. **SSE on Vercel**: Limited streaming response duration
3. **No Persistence**: Sessions cleared on server restart
4. **Single Instance**: No distributed session management

## Future Enhancements

- [ ] Redis/Upstash for persistent sessions
- [ ] PostgreSQL for session storage
- [ ] Distributed session management
- [ ] Rate limiting per session
- [ ] Session analytics and monitoring
- [ ] Custom session expiration policies
- [ ] Session migration/transfer

## References

- [MCP Specification 0.1.0](https://spec.modelcontextprotocol.io/)
- [JSON-RPC 2.0 Specification](https://www.jsonrpc.org/specification)
- [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)

## License

MIT

---

**Version**: 1.0.0
**Last Updated**: November 10, 2025
**Lines of Code**: 2,000 (excluding comments/blanks)
