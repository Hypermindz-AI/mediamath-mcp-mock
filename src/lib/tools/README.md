# MCP Tools Implementation

Complete implementation of all 28 MCP tools for the MediaMath Mock MCP Server.

## Overview

This directory contains the full implementation of the MediaMath campaign management API as MCP tools. All tools follow MCP protocol standards with proper annotations, validation, and dual-response format (JSON + human-readable guidance).

## Tool Categories

### 1. System Tools (1 tool)
**File**: `system.ts`

- `healthcheck` - API health status and version information

### 2. User Management Tools (3 tools)
**File**: `user.ts`

- `find_user` - Search users by name, email, role
- `get_user_info` - Get detailed user information (defaults to authenticated user)
- `get_user_permissions` - View user permission flags and entity access

### 3. Campaign Management Tools (4 tools)
**File**: `campaign.ts`

- `find_campaigns` - Search campaigns with filtering and pagination
- `get_campaign_info` - Get detailed campaign information
- `campaign_create` - Create new campaign (restricted to org 100048)
- `campaign_update` - Update existing campaign (restricted to org 100048)

### 4. Strategy Management Tools (4 tools)
**File**: `strategy.ts`

- `find_strategies` - Search strategies with filtering
- `get_strategy_info` - Get detailed strategy information
- `strategy_create` - Create new strategy (restricted to org 100048)
- `strategy_update` - Update existing strategy (restricted to org 100048)

### 5. Organization Hierarchy Tools (6 tools)
**File**: `organization.ts`

- `find_organizations` - Search organizations
- `get_organization_info` - Get organization details
- `find_agencies` - Search agencies
- `get_agency_info` - Get agency details
- `find_advertisers` - Search advertisers
- `get_advertiser_info` - Get advertiser details

### 6. Supply & Inventory Tools (4 tools)
**File**: `supply.ts`

- `find_supply_sources` - Search supply sources (exchanges, app networks, direct)
- `get_supply_source_info` - Get supply source details
- `find_site_lists` - Search site lists (whitelists/blacklists)
- `get_site_list_info` - Get site list details

### 7. Creative Tools (2 tools)
**File**: `creative.ts`

- `find_concepts` - Search creative concepts (ads)
- `get_concept_info` - Get creative concept details

### 8. Audience Tools (1 tool)
**File**: `audience.ts`

- `find_audience_segments` - Search audience segments for targeting

## Architecture

### Core Components

1. **registry.ts** - Central tool registry
   - Tool registration system
   - Tool discovery (list/get)
   - Tool execution with validation
   - Zod schema to JSON Schema conversion
   - Response formatting utilities

2. **index.ts** - Initialization and exports
   - `initializeTools()` - Register all tools
   - `getToolsList()` - Get MCP tool definitions
   - `callTool()` - Execute tool with context
   - Category summary utilities

### Tool Structure

Each tool follows this pattern:

```typescript
// 1. Define Zod schema for input validation
const toolSchema = z.object({
  param1: z.string(),
  param2: z.number().optional(),
});

// 2. Implement handler function
async function toolHandler(
  args: z.infer<typeof toolSchema>,
  context: ToolContext
): Promise<ToolResponse> {
  // Business logic
  // Return dual response: human text + structured data
  return createSuccessResponse(humanText, structuredData);
}

// 3. Register tool with annotations
toolRegistry.registerTool(
  'tool_name',
  toolHandler,
  toolSchema,
  'Description',
  {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  }
);
```

## Features

### MCP Annotations

All tools include proper MCP annotations:

- **readOnlyHint**: `true` for read operations, `false` for write operations
- **destructiveHint**: `false` (no destructive operations in mock)
- **idempotentHint**: `true` for GET operations, `false` for POST/create
- **openWorldHint**: `false` (closed mock environment)

### Dual Response Format

Every tool returns both:

1. **Human-readable text** - Formatted guidance with emojis and next actions
2. **Structured data** - JSON for programmatic access

Example:
```typescript
{
  content: [
    {
      type: 'text',
      text: '✅ Found 3 campaigns\n\n**Next Actions**\n- Use get_campaign_info...'
    }
  ],
  structuredContent: {
    data: [...],
    meta: { count: 3, total_count: 3 }
  },
  isError: false
}
```

### UI Deep Links

Campaign and strategy tools include UI deep links:
```typescript
buildUIDeepLink('campaign', 1001)
// Returns: https://mediamath.com/platform/campaigns/1001/edit
```

### Access Control

Write operations (create/update) enforce:
- **Organization restriction**: Only org 100048
- **Role-based access**: ADMIN or TRADER roles required
- **Ownership validation**: Users can only modify their org's entities

### Error Handling

Consistent error responses with categories:
- `authentication_failed` - Auth issues
- `access_denied` - Permission denied
- `not_found` - Entity not found
- `invalid_request` - Validation errors
- `api_error` - General errors

### Pagination Support

List tools support pagination:
- `pageLimit` - Max 25 items per page
- `cursor` - Opaque pagination token (future)
- `sortBy` - Field name or `-field` for descending

### Rich Filtering

Search tools support multiple filters:
- Text search (name, email, etc.)
- Status filtering
- ID-based filtering (parent entities)
- Range filtering (min_size, max_cpm)

## Mock Data

Each tool includes realistic mock data:

- **Users**: 3 users (Admin, Trader, Analyst)
- **Organizations**: 2 organizations
- **Agencies**: 3 agencies
- **Advertisers**: 3 advertisers
- **Campaigns**: 3 campaigns
- **Strategies**: 4 strategies
- **Supply Sources**: 4 supply sources
- **Site Lists**: 4 site lists
- **Concepts**: 5 creative concepts
- **Audience Segments**: 8 audience segments

## Usage

### Initialize Tools

```typescript
import { initializeTools } from './lib/tools';

initializeTools();
// ✅ Initialized 28 MCP tools
```

### List Tools

```typescript
import { getToolsList } from './lib/tools';

const tools = getToolsList();
console.log(tools.length); // 28
```

### Call a Tool

```typescript
import { callTool } from './lib/tools';

const result = await callTool(
  'find_campaigns',
  { advertiser_id: 5001, status: true },
  { userId: 1, organizationId: 100048, role: 'ADMIN' }
);

console.log(result.content[0].text); // Human-readable output
console.log(result.structuredContent); // JSON data
```

### Check Tool Count

```typescript
import { getToolCategorySummary } from './lib/tools';

const summary = getToolCategorySummary();
console.log(summary);
// {
//   system: 1,
//   user: 3,
//   campaign: 4,
//   strategy: 4,
//   organization: 6,
//   supply: 4,
//   creative: 2,
//   audience: 1,
//   total: 28
// }
```

## Testing

Each tool should be tested for:

1. **Input validation** - Zod schema enforcement
2. **Filtering logic** - All filter combinations
3. **Access control** - Org and role restrictions
4. **Error handling** - Not found, access denied, etc.
5. **Response format** - Dual response structure
6. **Pagination** - Page limits and sorting

Example test:
```typescript
describe('find_campaigns', () => {
  it('should filter by advertiser_id', async () => {
    const result = await callTool(
      'find_campaigns',
      { advertiser_id: 5001 },
      { userId: 1, organizationId: 100048, role: 'ADMIN' }
    );

    expect(result.isError).toBe(false);
    expect(result.structuredContent.data).toHaveLength(2);
  });
});
```

## Integration with MCP Server

Tools integrate with MCP protocol via:

```typescript
// In MCP endpoint handler
if (method === 'tools/list') {
  return {
    tools: getToolsList()
  };
}

if (method === 'tools/call') {
  const { name, arguments: args } = params;
  const context = extractContextFromSession(sessionId);
  return await callTool(name, args, context);
}
```

## Future Enhancements

1. **Persistent Storage** - Replace in-memory mock data with database
2. **Real Pagination** - Implement cursor-based pagination
3. **Batch Operations** - Support bulk create/update
4. **Webhooks** - Notify on entity changes
5. **Audit Logging** - Track all tool calls
6. **Rate Limiting** - Throttle requests per user/org
7. **Caching** - Cache frequently accessed entities

## Tool Inventory Summary

| Category      | Tools | Read | Write |
|---------------|-------|------|-------|
| System        | 1     | 1    | 0     |
| User          | 3     | 3    | 0     |
| Campaign      | 4     | 2    | 2     |
| Strategy      | 4     | 2    | 2     |
| Organization  | 6     | 6    | 0     |
| Supply        | 4     | 4    | 0     |
| Creative      | 2     | 2    | 0     |
| Audience      | 1     | 1    | 0     |
| **Total**     | **28**| **23**| **4** |

## License

Part of the MediaMath Mock MCP Server project.
