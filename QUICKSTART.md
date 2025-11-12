# Quick Start Guide - MediaMath MCP Mock Server

**Date**: November 10, 2025
**Current Status**: Foundation Complete, Ready for Tool Implementation

---

## 🎯 What's Been Completed

✅ **MCP Protocol Layer** (2,000 lines)
- JSON-RPC 2.0 handler
- Session management (24-hour TTL)
- SSE support for real-time notifications
- Complete type definitions

✅ **Mock Data Layer** (2,500 lines)
- 600 realistic records (users, campaigns, strategies, etc.)
- Stateful in-memory store
- Advanced filtering and pagination
- Relationship validation

✅ **OAuth Authentication** (1,500 lines)
- Mock OAuth 2.0 flows
- JWT token management
- 10 test users across 3 organizations
- Role-based access control

✅ **Next.js Project**
- Initialized with TypeScript
- API routes structure ready
- Configuration in place

---

## 🚀 Immediate Next Steps

### Step 1: Navigate to Project (30 seconds)

```bash
cd /Users/dineshbhat/sandbox/hypermindz/mediamath-mcp-mock
```

### Step 2: Start Development Server (1 minute)

```bash
# Server is already running on localhost:3000
# Open in browser
open http://localhost:3000
```

### Step 3: Test OAuth (2 minutes)

```bash
# Get access token
curl -X POST http://localhost:3000/api/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "password",
    "username": "admin@acme.com",
    "password": "password123",
    "client_id": "mediamath_mcp_client",
    "client_secret": "mock_client_secret",
    "audience": "https://api.mediamath.com"
  }'
```

Expected response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "GEbRxBN...edjnXbL",
  "expires_in": 86400,
  "token_type": "Bearer"
}
```

---

## 📋 What Needs to Be Done

### Priority 1: Utility Functions (2-3 hours)

Create these files in `src/lib/utils/`:

1. **response.ts** - MCP response builders
   ```typescript
   export function buildSuccessResponse(data: any, guidance: string) {
     return {
       content: [
         { type: "text", text: JSON.stringify(data) },
         { type: "text", text: guidance }
       ],
       structuredContent: data,
       isError: false
     };
   }
   ```

2. **errors.ts** - Error categorization
   ```typescript
   export enum ErrorCategory {
     AUTHENTICATION_FAILED = "authentication_failed",
     ACCESS_DENIED = "access_denied",
     NOT_FOUND = "not_found",
     // ... 3 more categories
   }
   ```

3. **pagination.ts** - Cursor-based pagination
   ```typescript
   export function encodeCursor(offset: number, sortBy: string): string
   export function decodeCursor(cursor: string): {offset: number, sortBy: string}
   export function paginate(items: any[], limit: number, cursor?: string)
   ```

4. **validation.ts** - Zod schemas
   ```typescript
   export const paginationSchema = z.object({
     pageLimit: z.number().max(25).optional(),
     cursor: z.string().optional(),
     sortBy: z.string().optional()
   });
   ```

### Priority 2: Main MCP Endpoint (1-2 hours)

Create `src/app/api/mcp/route.ts`:

```typescript
import { handleMCPRequest } from '@/lib/mcp/protocol';
import { validateRequest } from '@/lib/auth/middleware';

export async function POST(request: Request) {
  // 1. Extract Bearer token
  // 2. Validate JWT
  // 3. Parse JSON-RPC request
  // 4. Handle MCP method
  // 5. Return response
}

export async function DELETE(request: Request) {
  // Delete session
}
```

### Priority 3: SSE Endpoint (1 hour)

Create `src/app/api/sse/route.ts`:

```typescript
import { createSSEConnection } from '@/lib/mcp/sse';

export async function GET(request: Request) {
  const sessionId = request.nextUrl.searchParams.get('sessionId');
  return createSSEConnection(sessionId);
}
```

### Priority 4: Implement 28 Tools (8-12 hours)

**Week 1 Goal**: Implement 10 read-only tools

1. **system.ts** (30 min)
   - `healthcheck` - Return API status

2. **user.ts** (2 hours)
   - `find_user` - Search users with filters
   - `get_user_info` - Get user profile
   - `get_user_permissions` - Get permissions

3. **organization.ts** (3 hours)
   - `find_organizations`, `get_organization_info`
   - `find_agencies`, `get_agency_info`
   - `find_advertisers`, `get_advertiser_info`

4. **campaign.ts** (2 hours - read-only for now)
   - `find_campaigns` - Search with filters
   - `get_campaign_info` - Get details with UI links

5. **strategy.ts** (2 hours - read-only)
   - `find_strategies`
   - `get_strategy_info`

**Week 2 Goal**: Remaining 18 tools + write operations

---

## 🧪 Testing Your Work

### Test Utilities

```typescript
// test-utils.ts
import { buildSuccessResponse } from '@/lib/utils/response';

const result = buildSuccessResponse(
  { campaigns: [...], meta: {...} },
  "✅ Found 3 campaigns"
);
console.log(result);
```

### Test MCP Endpoint

```bash
# Get access token first (see Step 3 above)
export TOKEN="eyJhbGciOiJI..."

# Initialize MCP session
curl -X POST http://localhost:3000/api/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "0.1.0",
      "capabilities": {},
      "clientInfo": {"name": "test", "version": "1.0.0"}
    }
  }'

# Expected: MCP-Session-Id header in response

# List tools
export SESSION_ID="mcp_..."
curl -X POST http://localhost:3000/api/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H "MCP-Session-Id: $SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list"
  }'

# Call healthcheck tool
curl -X POST http://localhost:3000/api/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H "MCP-Session-Id: $SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "healthcheck",
      "arguments": {}
    }
  }'
```

### Test SSE

```bash
# Open SSE connection
curl -N http://localhost:3000/api/sse?sessionId=$SESSION_ID
```

---

## 📁 Key Files to Reference

### Documentation
- `SESSION_CONTEXT.md` - Complete development context
- `docs/IMPLEMENTATION_PLAN.md` - 8-week roadmap
- `docs/AUTH_TESTING_GUIDE.md` - OAuth testing guide

### Implementation Examples
- `src/lib/mcp/protocol.ts` - MCP request handling
- `src/lib/mcp/session.ts` - Session management
- `src/lib/auth/oauth.ts` - OAuth flows
- `src/lib/data/store.ts` - Data store operations

### Tests
- `tests/unit/data/store.test.ts` - Data layer tests (80+ test cases)

---

## 💡 Implementation Tips

### Tip 1: Start with Healthcheck Tool

```typescript
// src/lib/tools/system.ts
export async function healthcheck() {
  return {
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      auth: 'up',
      data: 'up',
      mcp: 'up'
    }
  };
}
```

### Tip 2: Use Existing Data Store

```typescript
// src/lib/tools/campaign.ts
import { getDataStore } from '@/lib/data/store';

export async function find_campaigns(args: any) {
  const store = getDataStore();
  const result = store.campaigns.find(
    { status: args.status, advertiser_id: args.advertiser_id },
    { field: 'id', order: 'asc' },
    { offset: 0, limit: args.pageLimit || 25 }
  );

  return buildSuccessResponse(result, `✅ Found ${result.items.length} campaigns`);
}
```

### Tip 3: Follow Tool Pattern

Every tool should:
1. Accept arguments
2. Validate with Zod
3. Query data store
4. Format response with dual content
5. Include pagination meta
6. Add human-readable guidance

### Tip 4: Use Tool Registry

```typescript
// src/lib/tools/registry.ts
import { healthcheck } from './system';
import { find_user, get_user_info } from './user';

export const toolRegistry = new Map([
  ['healthcheck', {
    handler: healthcheck,
    schema: z.object({}),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  }],
  // ... 27 more tools
]);
```

---

## 🎯 Week 1 Goals

By end of Week 1, you should have:

- [x] ✅ MCP protocol layer (DONE)
- [x] ✅ Mock data layer (DONE)
- [x] ✅ OAuth authentication (DONE)
- [ ] ⏳ Utility functions (response, errors, pagination, validation)
- [ ] ⏳ Main MCP endpoint (/api/mcp)
- [ ] ⏳ SSE endpoint (/api/sse)
- [ ] ⏳ 5-10 read-only tools implemented
- [ ] ⏳ Tool registry working
- [ ] ⏳ End-to-end test passing (OAuth → Session → Tool call)

---

## 🚦 Decision Points

### Should I implement all 28 tools at once?

**No.** Start with 5-10 core tools:
1. healthcheck
2. get_user_info
3. find_campaigns
4. get_campaign_info
5. find_organizations

This gives you a working demo while you build the rest.

### Should I build the Configuration UI now?

**Not yet.** Focus on:
1. Core API functionality
2. All 28 tools
3. Testing

UI can come in Week 5-6.

### Can I test without implementing all tools?

**Yes!** The MCP protocol works with partial tool sets. Just ensure `tools/list` returns only the tools you've implemented.

---

## 📞 Need Help?

### Check these first:
1. `SESSION_CONTEXT.md` - Development context
2. `src/lib/mcp/README.md` - MCP layer docs
3. `src/lib/data/README.md` - Data layer docs
4. `docs/AUTH_TESTING_GUIDE.md` - OAuth guide

### Reference implementations:
- MCP protocol: `src/lib/mcp/protocol.ts`
- Data queries: `src/lib/data/store.ts`
- OAuth flows: `src/lib/auth/oauth.ts`

### Test data:
- Mock users: `src/lib/auth/oauth.ts` (mockUsers array)
- Campaigns: `src/lib/data/fixtures/index.ts` (600 records)

---

## 🎉 Success Metrics

You'll know you're making progress when:

✅ OAuth endpoint returns valid tokens
✅ MCP initialize creates a session
✅ tools/list returns your implemented tools
✅ tools/call executes healthcheck successfully
✅ SSE connection stays open and sends pings
✅ Mock data queries return correct results
✅ Pagination works with cursors
✅ Error responses include category and guidance

---

**Ready to start? Begin with Step 1 above!**

**Current Status**: Foundation complete, ready for utility functions and MCP endpoint.

**Estimated Time to First Working Tool**: 4-6 hours
