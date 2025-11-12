# MediaMath MCP Server - Test Examples

**Server URL**: http://localhost:3001
**Status**: ✅ Running

---

## Quick Start Testing Guide

### Step 1: Get Access Token (OAuth)

```bash
curl -X POST http://localhost:3001/api/oauth/token \
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

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJI...",
  "refresh_token": "GEbRxBN...",
  "expires_in": 86400,
  "token_type": "Bearer",
  "scope": "openid profile email"
}
```

**Save your token:**
```bash
export TOKEN="<your_access_token_here>"
```

---

### Step 2: Initialize MCP Session

```bash
curl -X POST http://localhost:3001/api/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "0.1.0",
      "capabilities": {},
      "clientInfo": {
        "name": "test-client",
        "version": "1.0.0"
      }
    }
  }'
```

**Expected Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "0.1.0",
    "capabilities": {
      "tools": { "listChanged": true },
      "prompts": { "listChanged": true }
    },
    "serverInfo": {
      "name": "mediamath-mcp-mock",
      "version": "1.0.0"
    },
    "sessionId": "mcp_..."
  }
}
```

**Save your session ID** from the `MCP-Session-Id` header:
```bash
export SESSION_ID="<session_id_from_response>"
```

---

### Step 3: List Available Tools

```bash
curl -X POST http://localhost:3001/api/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H "MCP-Session-Id: $SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list"
  }'
```

**Expected Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "tools": [
      {
        "name": "healthcheck",
        "description": "Check the health status of the MCP server and all services"
      },
      {
        "name": "find_user",
        "description": "Search for users with optional filters"
      },
      {
        "name": "get_user_info",
        "description": "Get detailed information about a specific user by ID"
      },
      {
        "name": "get_user_permissions",
        "description": "Get the permissions for a specific user based on their role"
      }
    ]
  }
}
```

---

## Natural Language Query Examples

Below are real-world scenarios translated into MCP tool calls:

---

### 🔍 Example 1: "Is the system healthy?"

**Natural Language**: "Check if the MediaMath MCP server is running properly"

**MCP Tool Call:**
```bash
curl -X POST http://localhost:3001/api/mcp \
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

**Expected Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\n  \"status\": \"healthy\",\n  \"version\": \"1.0.0\",\n  \"timestamp\": \"2025-11-10T20:50:00.000Z\",\n  \"services\": {\n    \"auth\": \"up\",\n    \"data\": \"up\",\n    \"mcp\": \"up\",\n    \"sse\": \"up\"\n  },\n  \"stats\": {\n    \"activeSessions\": 1,\n    \"totalRecords\": 600,\n    \"campaigns\": 100,\n    \"strategies\": 100,\n    \"users\": 50\n  }\n}"
      },
      {
        "type": "text",
        "text": "✅ System is healthy and all services are operational."
      }
    ],
    "isError": false
  }
}
```

---

### 👤 Example 2: "Find all admin users"

**Natural Language**: "Show me all users with the ADMIN role"

**MCP Tool Call:**
```bash
curl -X POST http://localhost:3001/api/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H "MCP-Session-Id: $SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/call",
    "params": {
      "name": "find_user",
      "arguments": {
        "role": "ADMIN"
      }
    }
  }'
```

---

### 👤 Example 3: "Get details for user ID 1"

**Natural Language**: "What information do we have about the user with ID 1?"

**MCP Tool Call:**
```bash
curl -X POST http://localhost:3001/api/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H "MCP-Session-Id: $SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 5,
    "method": "tools/call",
    "params": {
      "name": "get_user_info",
      "arguments": {
        "user_id": 1,
        "with_permissions": true
      }
    }
  }'
```

---

### 👤 Example 4: "What can user 2 do?"

**Natural Language**: "What permissions does the user with ID 2 have?"

**MCP Tool Call:**
```bash
curl -X POST http://localhost:3001/api/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H "MCP-Session-Id: $SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 6,
    "method": "tools/call",
    "params": {
      "name": "get_user_permissions",
      "arguments": {
        "user_id": 2
      }
    }
  }'
```

**Expected Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 6,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\n  \"userId\": 2,\n  \"role\": \"TRADER\",\n  \"permissions\": {\n    \"canReadAll\": true,\n    \"canWriteCampaigns\": true,\n    \"canWriteStrategies\": true,\n    \"canManageUsers\": false,\n    \"canManageOrganizations\": false\n  }\n}"
      },
      {
        "type": "text",
        "text": "✅ Retrieved permissions for user 2 (TRADER role)."
      }
    ],
    "isError": false
  }
}
```

---

### 🔍 Example 5: "Find users in organization 100048"

**Natural Language**: "List all users belonging to organization 100048"

**MCP Tool Call:**
```bash
curl -X POST http://localhost:3001/api/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H "MCP-Session-Id: $SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 7,
    "method": "tools/call",
    "params": {
      "name": "find_user",
      "arguments": {
        "organization_id": 100048
      }
    }
  }'
```

---

### 🔍 Example 6: "Find active users with 'admin' in their email"

**Natural Language**: "Search for active users whose email contains 'admin'"

**MCP Tool Call:**
```bash
curl -X POST http://localhost:3001/api/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H "MCP-Session-Id: $SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 8,
    "method": "tools/call",
    "params": {
      "name": "find_user",
      "arguments": {
        "email": "admin",
        "status": "active"
      }
    }
  }'
```

---

## Test Credentials Reference

### Primary Organization (ACME - 100048)

| Email | Password | User ID | Role | Permissions |
|-------|----------|---------|------|-------------|
| admin@acme.com | password123 | 1 | ADMIN | Full access |
| trader@acme.com | password123 | 2 | TRADER | Read all, write campaigns/strategies |
| manager@acme.com | password123 | 3 | MANAGER | Manage campaigns/strategies |
| analyst@acme.com | password123 | 4 | ANALYST | Read-only |
| viewer@acme.com | password123 | 5 | VIEWER | Limited read |

### Other Organizations

- **BrandCo (100049)**: admin@brandco.com, trader@brandco.com
- **MediaLab (100050)**: admin@medialab.com, trader@medialab.com

All passwords: `password123`

---

## Error Handling Examples

### Invalid Tool Name
```bash
curl -X POST http://localhost:3001/api/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H "MCP-Session-Id: $SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 99,
    "method": "tools/call",
    "params": {
      "name": "nonexistent_tool",
      "arguments": {}
    }
  }'
```

### Invalid Arguments
```bash
curl -X POST http://localhost:3001/api/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H "MCP-Session-Id: $SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 100,
    "method": "tools/call",
    "params": {
      "name": "get_user_info",
      "arguments": {
        "user_id": "not_a_number"
      }
    }
  }'
```

### Resource Not Found
```bash
curl -X POST http://localhost:3001/api/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H "MCP-Session-Id: $SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 101,
    "method": "tools/call",
    "params": {
      "name": "get_user_info",
      "arguments": {
        "user_id": 999999
      }
    }
  }'
```

---

## SSE (Server-Sent Events) Testing

Connect to real-time notifications:

```bash
curl -N http://localhost:3001/api/sse?sessionId=$SESSION_ID \
  -H "Authorization: Bearer $TOKEN"
```

You should see:
```
event: connected
data: {"sessionId":"mcp_...","timestamp":"2025-11-10T20:50:00.000Z"}
retry: 10000

event: ping
data: {"timestamp":"2025-11-10T20:50:30.000Z"}
```

---

## Next Steps

1. ✅ **Basic tools working** (healthcheck, find_user, get_user_info, get_user_permissions)
2. ⏳ **TODO**: Implement campaign tools
3. ⏳ **TODO**: Implement strategy tools
4. ⏳ **TODO**: Implement organization tools

---

## Troubleshooting

### "Invalid or expired token"
- Tokens expire after 24 hours
- Get a new token using Step 1

### "Missing MCP-Session-Id header"
- Make sure you completed Step 2 and saved the session ID
- Sessions expire after 24 hours of inactivity

### "Session does not belong to authenticated user"
- You may have switched users
- Create a new session with the current token

### Port 3000 vs 3001
- The server is running on port 3001 (port 3000 was in use)
- Use http://localhost:3001 in all requests

---

**Server Status**: ✅ Running on http://localhost:3001
**Available Tools**: 4 (healthcheck, find_user, get_user_info, get_user_permissions)
**Fully Implemented**: Yes - ready for end-to-end testing!
