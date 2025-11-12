# MediaMath Mock MCP Server - Implementation Plan

## Executive Summary

A production-ready mock MCP (Model Context Protocol) server implementing the MediaMath campaign management API specification. Built with TypeScript/Next.js, deployable to Vercel, with a configuration UI for managing mock data.

**Repository**: `/Users/dineshbhat/sandbox/hypermindz/mediamath-mcp-mock/`
**Technology Stack**: Next.js 14, TypeScript, Vercel
**Timeline**: 8 weeks
**Status**: In Development

---

## Project Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Deployment**: Vercel
- **Testing**: Vitest (unit), Playwright (e2e)
- **UI**: React 18, Tailwind CSS, shadcn/ui
- **Auth**: Mock OAuth 2.0 (JWT tokens)
- **State**: In-memory stateful store

### Key Features
- ✅ 28 MCP tools (read + write operations)
- ✅ OAuth 2.0 mock authentication
- ✅ Session management with SSE
- ✅ Stateful in-memory data store (50-100 records per entity)
- ✅ Cursor-based pagination
- ✅ Rich error handling (6 categories)
- ✅ Configuration UI for mock data management
- ✅ MCP protocol compliance (JSON-RPC 2.0)
- ✅ Test coverage >80%

---

## Directory Structure

```
mediamath-mcp-mock/
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── api/
│   │   │   ├── mcp/route.ts          # POST /api/mcp (main MCP endpoint)
│   │   │   ├── oauth/
│   │   │   │   └── token/route.ts    # POST /api/oauth/token
│   │   │   └── sse/route.ts          # GET /api/sse?sessionId={id}
│   │   ├── config/
│   │   │   ├── page.tsx              # Configuration UI
│   │   │   ├── users/page.tsx
│   │   │   ├── campaigns/page.tsx
│   │   │   ├── strategies/page.tsx
│   │   │   └── sessions/page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx                  # Home/documentation page
│   ├── lib/
│   │   ├── mcp/
│   │   │   ├── protocol.ts           # JSON-RPC 2.0 handler
│   │   │   ├── session.ts            # Session management
│   │   │   ├── types.ts              # MCP type definitions
│   │   │   └── sse.ts                # SSE connection manager
│   │   ├── auth/
│   │   │   ├── oauth.ts              # OAuth 2.0 flows
│   │   │   ├── tokens.ts             # JWT generation/validation
│   │   │   └── middleware.ts         # Auth middleware
│   │   ├── tools/
│   │   │   ├── registry.ts           # Tool registration & dispatch
│   │   │   ├── system.ts             # healthcheck
│   │   │   ├── user.ts               # 3 user tools
│   │   │   ├── campaign.ts           # 4 campaign tools
│   │   │   ├── strategy.ts           # 4 strategy tools
│   │   │   ├── organization.ts       # 6 org hierarchy tools
│   │   │   ├── supply.ts             # 4 supply/inventory tools
│   │   │   ├── creative.ts           # 2 creative tools
│   │   │   └── audience.ts           # 1 audience tool
│   │   ├── prompts/
│   │   │   ├── registry.ts           # Prompt registration
│   │   │   └── check-my-profile.ts   # check_my_profile prompt
│   │   ├── data/
│   │   │   ├── generator.ts          # Mock data generation
│   │   │   ├── store.ts              # In-memory stateful store
│   │   │   └── fixtures/
│   │   │       ├── users.ts
│   │   │       ├── campaigns.ts
│   │   │       ├── strategies.ts
│   │   │       ├── organizations.ts
│   │   │       ├── agencies.ts
│   │   │       ├── advertisers.ts
│   │   │       ├── supply-sources.ts
│   │   │       ├── site-lists.ts
│   │   │       ├── concepts.ts
│   │   │       └── audience-segments.ts
│   │   └── utils/
│   │       ├── response.ts           # MCP response builders
│   │       ├── errors.ts             # Error categories & handling
│   │       ├── pagination.ts         # Cursor-based pagination
│   │       └── validation.ts         # Zod schemas
├── tests/
│   ├── unit/
│   │   ├── tools/
│   │   ├── auth/
│   │   └── mcp/
│   ├── integration/
│   │   ├── workflows/
│   │   └── protocol/
│   └── e2e/
│       ├── config-ui.spec.ts
│       └── mcp-client.spec.ts
├── public/
│   └── docs/                         # Static documentation
├── docs/
│   ├── IMPLEMENTATION_PLAN.md        # This file
│   ├── API_REFERENCE.md
│   └── DEPLOYMENT.md
├── package.json
├── tsconfig.json
├── .env.example
├── .env.local
├── vercel.json
├── vitest.config.ts
├── playwright.config.ts
└── README.md
```

---

## Phase 1: Foundation (Week 1)

### 1.1 Project Initialization
**Owner**: Agent 1 - Project Setup Agent

**Tasks**:
- [x] Create Next.js 14 project with TypeScript
- [ ] Configure TypeScript (strict mode, paths)
- [ ] Set up ESLint + Prettier
- [ ] Configure Tailwind CSS
- [ ] Install core dependencies
- [ ] Create `.env.example` with all required variables
- [ ] Initialize Git repository
- [ ] Create README.md with quick start guide

**Dependencies**:
```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "jsonwebtoken": "^9.0.2",
    "uuid": "^10.0.0",
    "zod": "^3.23.0",
    "@faker-js/faker": "^8.4.0",
    "tailwindcss": "^3.4.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/jsonwebtoken": "^9.0.6",
    "typescript": "^5",
    "vitest": "^1.6.0",
    "@vitest/ui": "^1.6.0",
    "playwright": "^1.44.0"
  }
}
```

**Deliverables**:
- ✅ Runnable Next.js project
- ✅ TypeScript configuration
- ✅ Development environment ready
- ✅ Documentation structure

---

## Phase 2: MCP Protocol Layer (Week 1-2)

### 2.1 Core Protocol Implementation
**Owner**: Agent 2 - MCP Protocol Agent

**Tasks**:
- [ ] Implement JSON-RPC 2.0 parser (`src/lib/mcp/protocol.ts`)
- [ ] Create MCP type definitions (`src/lib/mcp/types.ts`)
- [ ] Implement session manager (`src/lib/mcp/session.ts`)
  - Map-based in-memory storage
  - Session ID generation (UUID)
  - TTL management (24 hours)
  - Session cleanup
- [ ] Create SSE connection manager (`src/lib/mcp/sse.ts`)
- [ ] Implement POST `/api/mcp/route.ts` endpoint
- [ ] Implement GET `/api/sse/route.ts` endpoint
- [ ] Implement DELETE `/api/mcp` (session termination)

**MCP Methods**:
1. `initialize` - Create session, return capabilities
2. `tools/list` - Return all 28 tool definitions
3. `tools/call` - Dispatch to tool handlers
4. `prompts/list` - Return available prompts
5. `prompts/get` - Get prompt template

**Response Format**:
```typescript
interface MCPResponse {
  jsonrpc: "2.0";
  id: number | string;
  result?: {
    content: Array<{ type: "text"; text: string }>;
    structuredContent?: any;
    isError: boolean;
  };
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}
```

**Deliverables**:
- ✅ Working MCP endpoint
- ✅ Session management
- ✅ SSE support
- ✅ Protocol compliance tests

---

## Phase 3: Authentication Layer (Week 2)

### 3.1 Mock OAuth 2.0
**Owner**: Agent 3 - Auth Agent

**Tasks**:
- [ ] Implement POST `/api/oauth/token/route.ts`
- [ ] Create OAuth flow handler (`src/lib/auth/oauth.ts`)
  - Resource Owner Password Grant
  - Refresh token flow
- [ ] Create JWT token manager (`src/lib/auth/tokens.ts`)
  - Token generation (24-hour expiry)
  - Token validation
  - Refresh token generation
- [ ] Create auth middleware (`src/lib/auth/middleware.ts`)
  - Extract Bearer token
  - Validate JWT
  - Extract user context
- [ ] Mock legacy session endpoint (`/api/v2.0/session`)

**Mock Users**:
```typescript
const mockUsers = [
  {
    email: "admin@acme.com",
    password: "password123",
    userId: 1,
    organizationId: 100048,
    role: "ADMIN"
  },
  {
    email: "trader@acme.com",
    password: "password123",
    userId: 2,
    organizationId: 100048,
    role: "TRADER"
  }
];
```

**Token Response**:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "GEbRxBN...edjnXbL",
  "expires_in": 86400,
  "token_type": "Bearer"
}
```

**Deliverables**:
- ✅ OAuth token endpoint
- ✅ JWT generation/validation
- ✅ Auth middleware
- ✅ Mock user database

---

## Phase 4: Data Layer (Week 2-3)

### 4.1 Mock Data Generation
**Owner**: Agent 4 - Data Generation Agent

**Tasks**:
- [ ] Create data generator (`src/lib/data/generator.ts`)
- [ ] Generate realistic fixtures for all entities:
  - **Users** (50 records)
  - **Organizations** (10 records)
  - **Agencies** (25 records)
  - **Advertisers** (50 records)
  - **Campaigns** (100 records)
  - **Strategies** (100 records)
  - **Supply Sources** (75 records)
  - **Site Lists** (50 records)
  - **Concepts** (80 records)
  - **Audience Segments** (60 records)
- [ ] Create stateful store (`src/lib/data/store.ts`)
  - CRUD operations
  - Filtering
  - Sorting
  - Pagination
  - Relationship validation
- [ ] Implement data relationships
  - Org → Agency → Advertiser → Campaign → Strategy
  - Campaign → Concepts (creatives)
  - Strategy → Audience Segments
  - Strategy → Supply Sources

**Data Schema Example**:
```typescript
interface Campaign {
  id: number;
  name: string;
  advertiser_id: number;
  organization_id: number;
  agency_id: number;
  status: boolean;
  start_date: string;
  end_date?: string;
  budget: number;
  spend_cap_amount?: number;
  goal_type: "spend" | "reach" | "cpa" | "cpc";
  created_at: string;
  updated_at: string;
  t1_mediamath_links?: {
    edit_campaign_url: string;
  };
}
```

**Deliverables**:
- ✅ 500+ realistic mock records
- ✅ Stateful in-memory store
- ✅ Relationship integrity
- ✅ Reset/seed functionality

---

## Phase 5: Tool Implementation - Part 1 (Week 3-4)

### 5.1 System & User Tools (4 tools)
**Owner**: Agent 5 - Core Tools Agent

**Tasks**:
- [ ] Create tool registry (`src/lib/tools/registry.ts`)
- [ ] Implement system tools (`src/lib/tools/system.ts`)
  - `healthcheck`
- [ ] Implement user tools (`src/lib/tools/user.ts`)
  - `find_user`
  - `get_user_info`
  - `get_user_permissions`

### 5.2 Organization Hierarchy Tools (6 tools)
**Owner**: Agent 6 - Org Tools Agent

**Tasks**:
- [ ] Implement organization tools (`src/lib/tools/organization.ts`)
  - `find_organizations`
  - `get_organization_info`
  - `find_agencies`
  - `get_agency_info`
  - `find_advertisers`
  - `get_advertiser_info`

**Tool Annotations**:
```typescript
{
  name: "find_campaigns",
  description: "Search campaigns with rich filtering",
  inputSchema: { /* Zod schema */ },
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false
}
```

**Deliverables**:
- ✅ 10 read-only tools implemented
- ✅ Tool registry working
- ✅ Unit tests for each tool

---

## Phase 6: Tool Implementation - Part 2 (Week 4-5)

### 6.1 Campaign Tools (4 tools)
**Owner**: Agent 7 - Campaign Tools Agent

**Tasks**:
- [ ] Implement campaign tools (`src/lib/tools/campaign.ts`)
  - `find_campaigns` (read)
  - `get_campaign_info` (read)
  - `campaign_create` (write, restricted to org 100048)
  - `campaign_update` (write, restricted to org 100048)
- [ ] Implement org restriction validation
- [ ] Generate UI deep links

### 6.2 Strategy Tools (4 tools)
**Owner**: Agent 8 - Strategy Tools Agent

**Tasks**:
- [ ] Implement strategy tools (`src/lib/tools/strategy.ts`)
  - `find_strategies` (read)
  - `get_strategy_info` (read)
  - `strategy_create` (write, restricted)
  - `strategy_update` (write, restricted)

### 6.3 Supply, Creative, Audience Tools (7 tools)
**Owner**: Agent 9 - Inventory Tools Agent

**Tasks**:
- [ ] Implement supply tools (`src/lib/tools/supply.ts`)
  - `find_supply_sources`
  - `get_supply_source_info`
  - `find_site_lists`
  - `get_site_list_info`
- [ ] Implement creative tools (`src/lib/tools/creative.ts`)
  - `find_concepts`
  - `get_concept_info`
- [ ] Implement audience tools (`src/lib/tools/audience.ts`)
  - `find_audience_segments`

**Deliverables**:
- ✅ All 28 tools implemented
- ✅ Write operation restrictions
- ✅ UI deep links generated
- ✅ Tool documentation

---

## Phase 7: Response & Error Handling (Week 5)

### 7.1 Response Builders
**Owner**: Agent 10 - Response Handler Agent

**Tasks**:
- [ ] Create response utilities (`src/lib/utils/response.ts`)
  - Success response builder
  - Error response builder
  - Dual content (JSON + human-readable)
  - Structured content wrapper
- [ ] Create error handler (`src/lib/utils/errors.ts`)
  - 6 error categories
  - Retry recommendations
  - User action guidance
  - HTTP status mapping

**Error Categories**:
```typescript
enum ErrorCategory {
  AUTHENTICATION_FAILED = "authentication_failed", // 401
  ACCESS_DENIED = "access_denied",                // 403
  NOT_FOUND = "not_found",                        // 404
  INVALID_REQUEST = "invalid_request",            // 400
  RATE_LIMITED = "rate_limited",                  // 429
  API_ERROR = "api_error"                         // 500-504
}
```

**Human-Readable Guidance**:
```typescript
"✅ Success: 3 campaigns found\n\n**Next Actions**\n- Use get_campaign_info for details\n- Adjust filters to refine results"
```

**Deliverables**:
- ✅ Response builder utilities
- ✅ Error categorization
- ✅ Human-readable guidance

---

## Phase 8: Pagination (Week 5)

### 8.1 Cursor-Based Pagination
**Owner**: Agent 11 - Pagination Agent

**Tasks**:
- [ ] Create pagination utility (`src/lib/utils/pagination.ts`)
- [ ] Implement cursor encoding/decoding (base64 JSON)
- [ ] Support `pageLimit` (max 25)
- [ ] Support `sortBy` (field or `-field` for desc)
- [ ] Generate `next_cursor` when more results available
- [ ] Handle edge cases (empty results, invalid cursors)

**Cursor Format**:
```typescript
interface Cursor {
  offset: number;
  sortBy: string;
  filters?: Record<string, any>;
}

const encodeCursor = (cursor: Cursor) =>
  Buffer.from(JSON.stringify(cursor)).toString('base64');

const decodeCursor = (encoded: string): Cursor =>
  JSON.parse(Buffer.from(encoded, 'base64').toString());
```

**Meta Response**:
```json
{
  "meta": {
    "status": "success",
    "count": 25,
    "total_count": 87,
    "page_limit": 25,
    "sort_by": "id",
    "next_cursor": "eyJvZmZzZXQiOjI1LCJzb3J0QnkiOiJpZCJ9"
  }
}
```

**Deliverables**:
- ✅ Pagination utility
- ✅ Cursor encoding/decoding
- ✅ Integration with all list tools

---

## Phase 9: Prompts (Week 6)

### 9.1 Prompt Implementation
**Owner**: Agent 12 - Prompts Agent

**Tasks**:
- [ ] Create prompt registry (`src/lib/prompts/registry.ts`)
- [ ] Implement `check_my_profile` prompt (`src/lib/prompts/check-my-profile.ts`)
  - Support focus_area parameter
  - Generate structured instructions
  - Include tool call sequences
  - Provide analysis templates
- [ ] Implement `prompts/list` handler
- [ ] Implement `prompts/get` handler

**Prompt Response Example**:
```typescript
{
  name: "check_my_profile",
  description: "Guided workflow for user profile analysis",
  arguments: [
    {
      name: "focus_area",
      description: "Area to focus on",
      required: false,
      schema: {
        type: "string",
        enum: ["permissions", "organizations", "activity", "authentication", "overview"]
      }
    }
  ]
}
```

**Deliverables**:
- ✅ Prompt registry
- ✅ check_my_profile implementation
- ✅ Prompt templates

---

## Phase 10: Configuration UI (Week 6-7)

### 10.1 UI Pages
**Owner**: Agent 13 - Frontend Agent

**Tasks**:
- [ ] Create home page (`src/app/page.tsx`)
  - Documentation
  - Quick start guide
  - API examples
- [ ] Create config layout (`src/app/config/layout.tsx`)
- [ ] Create config pages:
  - [ ] `/config` - Overview & stats
  - [ ] `/config/users` - User management
  - [ ] `/config/campaigns` - Campaign browser
  - [ ] `/config/strategies` - Strategy browser
  - [ ] `/config/sessions` - Active sessions viewer
  - [ ] `/config/data` - Data import/export/reset
  - [ ] `/config/testing` - Interactive tool tester
- [ ] Implement shadcn/ui components
  - Tables with sorting/filtering
  - Forms for editing
  - Modals for confirmations
  - Toast notifications
- [ ] Add real-time updates (polling every 5s for sessions)

**UI Features**:
- View all mock data in tables
- Edit records inline
- Create new records
- Delete records
- Reset data to defaults
- View active sessions
- Export data as JSON
- Import data from JSON
- Test tool calls interactively
- View SSE events

**Deliverables**:
- ✅ Full configuration UI
- ✅ Data management interface
- ✅ Session monitoring
- ✅ Tool testing interface

---

## Phase 11: Testing (Week 7)

### 11.1 Unit Tests
**Owner**: Agent 14 - Testing Agent

**Tasks**:
- [ ] Set up Vitest configuration
- [ ] Write unit tests:
  - [ ] MCP protocol handler
  - [ ] Session management
  - [ ] OAuth flows
  - [ ] Token generation/validation
  - [ ] All 28 tools
  - [ ] Pagination logic
  - [ ] Error categorization
  - [ ] Response builders
- [ ] Achieve >80% code coverage

### 11.2 Integration Tests
**Owner**: Agent 15 - Integration Testing Agent

**Tasks**:
- [ ] Test complete workflows:
  - [ ] OAuth → Session → Tool calls
  - [ ] Find campaigns → Get details → Update
  - [ ] Pagination across multiple pages
  - [ ] Error scenarios
  - [ ] SSE connection lifecycle
- [ ] Test MCP protocol compliance

### 11.3 E2E Tests
**Owner**: Agent 16 - E2E Testing Agent

**Tasks**:
- [ ] Set up Playwright
- [ ] Write E2E tests:
  - [ ] Configuration UI workflows
  - [ ] Data editing
  - [ ] Session management
  - [ ] Tool testing interface

**Deliverables**:
- ✅ >80% test coverage
- ✅ All workflows tested
- ✅ CI/CD ready test suite

---

## Phase 12: Deployment & Documentation (Week 8)

### 12.1 Vercel Deployment
**Owner**: Agent 17 - DevOps Agent

**Tasks**:
- [ ] Create `vercel.json` configuration
- [ ] Set up environment variables
- [ ] Configure rewrites for `/mcp` endpoint
- [ ] Configure CORS headers
- [ ] Deploy to Vercel
- [ ] Test production deployment
- [ ] Set up custom domain (optional)

**vercel.json**:
```json
{
  "rewrites": [
    { "source": "/mcp", "destination": "/api/mcp" }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,DELETE,OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Authorization,Content-Type,MCP-Session-Id" }
      ]
    }
  ]
}
```

### 12.2 Documentation
**Owner**: Agent 18 - Documentation Agent

**Tasks**:
- [ ] Create comprehensive README.md
- [ ] Write API_REFERENCE.md
- [ ] Create DEPLOYMENT.md guide
- [ ] Generate Postman collection
- [ ] Create MCP client examples
- [ ] Record demo video (optional)

**Deliverables**:
- ✅ Production deployment
- ✅ Complete documentation
- ✅ Integration examples
- ✅ Public URL

---

## Parallel Implementation Strategy

### Week 1-2: Foundation (Agents 1-4 in parallel)
- Agent 1: Project setup
- Agent 2: MCP protocol layer
- Agent 3: Authentication
- Agent 4: Data generation

### Week 3-4: Tool Implementation (Agents 5-9 in parallel)
- Agent 5: System & user tools
- Agent 6: Organization tools
- Agent 7: Campaign tools
- Agent 8: Strategy tools
- Agent 9: Supply/creative/audience tools

### Week 5-6: Core Features (Agents 10-13 in parallel)
- Agent 10: Response handling
- Agent 11: Pagination
- Agent 12: Prompts
- Agent 13: Configuration UI

### Week 7-8: Quality & Deployment (Agents 14-18 in parallel)
- Agent 14: Unit tests
- Agent 15: Integration tests
- Agent 16: E2E tests
- Agent 17: Deployment
- Agent 18: Documentation

---

## Success Metrics

### Functional Requirements
- ✅ All 28 tools implemented and tested
- ✅ MCP protocol fully compliant
- ✅ OAuth 2.0 mock functional
- ✅ Session management with SSE
- ✅ 500+ mock records with relationships
- ✅ Pagination working correctly
- ✅ Rich error responses
- ✅ Configuration UI deployed

### Quality Requirements
- ✅ >80% test coverage
- ✅ TypeScript strict mode
- ✅ No ESLint errors
- ✅ Responsive UI
- ✅ < 2s API response time
- ✅ Vercel deployment successful

### Documentation Requirements
- ✅ README with quick start
- ✅ API reference complete
- ✅ Deployment guide
- ✅ Integration examples
- ✅ Postman collection

---

## Risk Management

### Technical Risks
1. **SSE on Vercel**: Vercel has limits on streaming responses
   - **Mitigation**: Use Next.js streaming APIs, test thoroughly

2. **In-memory state on serverless**: State may be lost between invocations
   - **Mitigation**: Document as limitation, provide reset mechanism

3. **Cold start latency**: First request may be slow
   - **Mitigation**: Keep warm with health check pings

### Timeline Risks
1. **Scope creep**: 28 tools is substantial work
   - **Mitigation**: Prioritize read-only tools, defer write tools if needed

2. **Testing overhead**: High test coverage takes time
   - **Mitigation**: Write tests in parallel with implementation

---

## Post-MVP Enhancements

### Phase 13: Persistence (Future)
- Redis/Upstash for persistent sessions
- PostgreSQL for persistent data
- Migration scripts

### Phase 14: Advanced Features (Future)
- Rate limiting simulation
- Webhook simulation
- GraphQL endpoint
- Metrics dashboard
- Admin authentication

### Phase 15: Production Features (Future)
- Multi-tenancy support
- Custom data scenarios
- Performance benchmarks
- Load testing

---

## Appendix

### Environment Variables
```bash
# OAuth/Auth
AUTH0_DOMAIN=mediamath.auth0.com
AUTH0_CLIENT_ID=mock_client_id
AUTH0_CLIENT_SECRET=mock_client_secret
JWT_SECRET=your-secret-key-here

# Server
NODE_ENV=production
BASE_URL=https://mediamath-mcp-mock.vercel.app

# Feature Flags
ENABLE_WRITE_OPERATIONS=true
ORG_RESTRICTION_ID=100048
```

### Tool Inventory

**System (1)**
- healthcheck

**User Management (3)**
- find_user, get_user_info, get_user_permissions

**Campaign Management (4)**
- find_campaigns, get_campaign_info, campaign_create, campaign_update

**Strategy Management (4)**
- find_strategies, get_strategy_info, strategy_create, strategy_update

**Organization Hierarchy (6)**
- find_organizations, get_organization_info
- find_agencies, get_agency_info
- find_advertisers, get_advertiser_info

**Inventory & Supply (4)**
- find_supply_sources, get_supply_source_info
- find_site_lists, get_site_list_info

**Creative (2)**
- find_concepts, get_concept_info

**Audience (1)**
- find_audience_segments

**Total: 28 tools**

---

**Document Version**: 1.0
**Last Updated**: November 10, 2025
**Status**: Active Development
