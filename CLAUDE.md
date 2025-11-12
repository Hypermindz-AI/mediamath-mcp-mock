# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MediaMath MCP Mock Server - A production-ready Model Context Protocol (MCP) server implementing the MediaMath campaign management API specification. Built with Next.js 14 and TypeScript, deployable to Vercel.

**Status**: Foundation complete (45%), actively implementing core functionality
**Current Phase**: Tool implementation and API endpoint integration

## Common Development Commands

### Development
```bash
npm run dev              # Start development server (http://localhost:3000)
npm run build            # Build for production
npm start                # Start production server
```

### Testing
```bash
npm run test             # Run Vitest tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Generate coverage report
npm run test:e2e         # Run Playwright E2E tests
npm run typecheck        # TypeScript type checking
npm run lint             # Run ESLint

# Run a single test file
npm run test -- path/to/test.spec.ts

# Run specific E2E test
npm run test:e2e -- path/to/e2e.spec.ts
```

### Utilities
```bash
npm run fixtures:verify  # Verify mock data fixtures integrity
```

## Architecture Overview

### Three-Layer Architecture

1. **MCP Protocol Layer** (`src/lib/mcp/`)
   - JSON-RPC 2.0 request/response handling
   - Session management (24-hour TTL, UUID-based)
   - Server-Sent Events (SSE) for real-time notifications
   - Type-safe MCP 0.1.0 protocol implementation

2. **Mock Data Layer** (`src/lib/data/`)
   - Stateful in-memory store with 600+ pre-generated records
   - Advanced filtering, sorting, and pagination
   - 10 entity types with proper relationships
   - Uses Faker.js for realistic data generation

3. **Authentication Layer** (`src/lib/auth/`)
   - Mock OAuth 2.0 (Resource Owner Password Grant, Refresh Token)
   - JWT token management (24-hour access, 30-day refresh)
   - 10 test users across 3 organizations with RBAC
   - Role-based permissions: ADMIN, MANAGER, TRADER, ANALYST, VIEWER

### Key Patterns

#### Dual Response Format
All MCP tool responses must include:
- `content[]` - Array of text content for agent consumption
- `structuredContent` - Typed data for programmatic use
- Human-readable guidance text ("✅ Found 3 campaigns")

#### Cursor-Based Pagination
- Use base64-encoded cursors containing offset + sortBy
- Maximum 25 items per page (`pageLimit`)
- Include `meta.pagination` with `nextCursor` and `hasMore`

#### Tool Annotations
Every tool must specify:
- `readOnlyHint`: true/false - Does the tool modify data?
- `destructiveHint`: true/false - Can it delete/disable data?
- `idempotentHint`: true/false - Safe to retry?
- `openWorldHint`: false - Always false for mock server

#### Organization Write Restrictions
Write operations (create/update) are restricted to:
- User's own organization only
- Organization ID 100048 (ACME) by default
- Configurable via `ORG_RESTRICTION_ID` env var

### Data Store Usage

The stateful store is the single source of truth:

```typescript
import { getDataStore } from '@/lib/data/store';

const store = getDataStore();

// Find with filters, sorting, pagination
const result = store.campaigns.find(
  { status: true, advertiser_id: 5001 },  // filters
  { field: 'id', order: 'asc' },          // sort
  { offset: 0, limit: 25 }                // pagination
);

// Get by ID with relationship loading
const campaign = store.campaigns.getById(1001, {
  advertiser: true,
  strategies: true
});

// Create (validates relationships)
const newCampaign = store.campaigns.create({
  name: 'New Campaign',
  advertiser_id: 5001,
  // ... required fields
});

// Update (partial)
store.campaigns.update(1001, { status: false });

// Delete (soft delete)
store.campaigns.delete(1001);
```

### Test Credentials

Primary organization (ACME - 100048):
- `admin@acme.com` / `password123` - Full admin access
- `trader@acme.com` / `password123` - Campaign/strategy management
- `manager@acme.com` / `password123` - Campaign/strategy management
- `analyst@acme.com` / `password123` - Read-only access
- `viewer@acme.com` / `password123` - Limited read access

Other organizations:
- `admin@brandco.com` / `password123` (BrandCo - 100049)
- `admin@medialab.com` / `password123` (MediaLab - 100050)

OAuth client credentials:
- Client ID: `mediamath_mcp_client`
- Client Secret: `mock_client_secret`

## Testing OAuth Flow

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

# Refresh token
curl -X POST http://localhost:3000/api/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "refresh_token",
    "refresh_token": "your_refresh_token_here",
    "client_id": "mediamath_mcp_client",
    "client_secret": "mock_client_secret"
  }'
```

## Important File References

**Current Status**: Always check `PROJECT_STATUS.md` for completion percentages and current priorities

**Implementation Plan**: `docs/IMPLEMENTATION_PLAN.md` - 8-week roadmap with detailed specifications

**Quick Start**: `QUICKSTART.md` - Immediate next steps and testing procedures

**Session Context**: `SESSION_CONTEXT.md` - Complete development history and decisions

**Component Documentation**:
- `src/lib/mcp/README.md` - MCP protocol layer details
- `src/lib/data/README.md` - Data store API and examples
- `src/lib/tools/README.md` - Tool implementation guidelines
- `docs/AUTH_TESTING_GUIDE.md` - Authentication testing scenarios

## Code Reference Format

When referencing code locations, use the pattern `file_path:line_number`:

```
Campaigns are filtered in the find method at src/lib/data/store.ts:142
```

## Environment Variables

Required in `.env.local`:
```
JWT_SECRET=your-strong-secret-key-here
ENABLE_WRITE_OPERATIONS=true
ORG_RESTRICTION_ID=100048
NODE_ENV=development
```

## TypeScript Configuration

- Strict mode enabled (`strict: true`)
- Path aliases: `@/*` maps to `./src/*`
- Target: ES2020
- Module resolution: bundler (Next.js)

## Key Constraints

1. **MCP Protocol Compliance**: Follow MCP 0.1.0 specification exactly
2. **Write Operation Safety**: All create/update/delete must validate organization ownership
3. **Pagination Limits**: Maximum 25 items per page, no exceptions
4. **Session TTL**: Sessions expire after 24 hours of inactivity
5. **Token Expiry**: Access tokens valid for 24 hours, refresh tokens for 30 days
6. **Mock Data Only**: This is a mock server - no real API calls, use in-memory store only

## Security Considerations

⚠️ **This is a MOCK server for development/testing only**
- No password hashing (plaintext comparison)
- In-memory token storage (lost on restart)
- Simplified client credential validation
- Not suitable for production use

## Common Patterns

### Tool Implementation Template

```typescript
import { z } from 'zod';
import { getDataStore } from '@/lib/data/store';

// Define schema
const FindCampaignsSchema = z.object({
  advertiser_id: z.number().optional(),
  status: z.boolean().optional(),
  pageLimit: z.number().max(25).optional(),
  cursor: z.string().optional(),
});

// Implement handler
export async function find_campaigns(
  args: z.infer<typeof FindCampaignsSchema>,
  context: ToolContext
): Promise<ToolResponse> {
  // Validate args
  const validated = FindCampaignsSchema.parse(args);

  // Query store
  const store = getDataStore();
  const result = store.campaigns.find(
    { status: validated.status },
    { field: 'id', order: 'asc' },
    { offset: 0, limit: validated.pageLimit || 25 }
  );

  // Build response
  return createSuccessResponse(
    result,
    `✅ Found ${result.data.length} campaigns`
  );
}

// Register tool
toolRegistry.set('find_campaigns', {
  handler: find_campaigns,
  schema: FindCampaignsSchema,
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
});
```

### MCP Endpoint Structure

```typescript
// src/app/api/mcp/route.ts
export async function POST(request: Request) {
  // 1. Extract and validate Bearer token
  // 2. Validate JWT
  // 3. Parse JSON-RPC request
  // 4. Get or create MCP session
  // 5. Dispatch to protocol handler
  // 6. Return JSON-RPC response with MCP-Session-Id header
}
```

## Troubleshooting

### "Invalid client credentials"
Check that `client_id` and `client_secret` match exactly (case-sensitive)

### "Invalid username or password"
Verify email format and password. User status must be "active"

### "Invalid or expired token"
Access tokens expire after 24 hours. Use refresh token to get new access token

### "Module not found" or path resolution errors
Run `npm install` and verify `tsconfig.json` paths configuration

### Mock data seems inconsistent
Run `npm run fixtures:verify` to validate data integrity

## Next Implementation Steps

Current priorities (check `PROJECT_STATUS.md` for updates):

1. Complete utility functions (`src/lib/utils/`)
   - response.ts - MCP response builders
   - errors.ts - Error categorization
   - pagination.ts - Cursor encoding/decoding

2. Implement main MCP endpoint (`src/app/api/mcp/route.ts`)

3. Implement SSE endpoint (`src/app/api/sse/route.ts`)

4. Complete all 28 tools (currently at 30%)
   - Priority: system, user, organization, campaign, strategy

5. Add comprehensive test coverage (target >80%)
