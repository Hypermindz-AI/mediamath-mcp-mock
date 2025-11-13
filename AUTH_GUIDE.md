# Authentication Guide

## Overview

The MediaMath MCP Mock Server supports **optional API key authentication**. Authentication is disabled by default, but can be enabled by setting an environment variable.

## API Key

**Production API Key**: `mcp_mock_2025_hypermindz_44b87c1d20ed`

## How It Works

### Without Authentication (Default)
- Server is publicly accessible
- No API key required
- All requests are allowed

### With Authentication (Enabled)
- Set `MCP_API_KEY` environment variable on Vercel
- All requests must include `X-API-Key` header
- Invalid or missing keys return 401 Unauthorized

## Enabling Authentication

### On Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `MCP_API_KEY`
   - **Value**: `mcp_mock_2025_hypermindz_44b87c1d20ed`
   - **Environment**: Production (or all environments)
4. Redeploy the application

### Locally

Add to your `.env.local` file:

```env
MCP_API_KEY=mcp_mock_2025_hypermindz_44b87c1d20ed
```

Then restart your development server:

```bash
npm run dev
```

## Using the API with Authentication

### Health Check (GET)

```bash
curl https://mediamath-mcp-mock-two.vercel.app/api/message \
  -H "X-API-Key: mcp_mock_2025_hypermindz_44b87c1d20ed"
```

### List Tools (POST)

```bash
curl -X POST https://mediamath-mcp-mock-two.vercel.app/api/message \
  -H "Content-Type: application/json" \
  -H "X-API-Key: mcp_mock_2025_hypermindz_44b87c1d20ed" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "params": {},
    "id": 1
  }'
```

### Execute Tool (POST)

```bash
curl -X POST https://mediamath-mcp-mock-two.vercel.app/api/message \
  -H "Content-Type: application/json" \
  -H "X-API-Key: mcp_mock_2025_hypermindz_44b87c1d20ed" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "find_campaigns",
      "arguments": {
        "organization_id": 100048
      }
    },
    "id": 1
  }'
```

## Using the Testing UI

The interactive testing UI at `/test` has built-in support for API keys:

1. Open https://mediamath-mcp-mock-two.vercel.app/test
2. Enter the API key in the "API Key (Optional)" field at the top
3. Click "Reconnect" to reload tools with authentication
4. The key is automatically saved in browser localStorage

### Testing UI Features

- **Password Field**: API key input is masked for security
- **Auto-Save**: Key is stored in browser localStorage
- **Auto-Include**: All API requests automatically include the `X-API-Key` header
- **Auth Indicator**: Shows "Authentication required" when 401 is detected
- **Reconnect Button**: Refreshes tools list with current API key

## Error Responses

### 401 Unauthorized (GET)

```json
{
  "status": "unauthorized",
  "message": "Invalid or missing API key",
  "hint": "Provide X-API-Key header with valid API key"
}
```

### 401 Unauthorized (POST - JSON-RPC)

```json
{
  "jsonrpc": "2.0",
  "id": null,
  "error": {
    "code": -32001,
    "message": "Unauthorized - Invalid or missing API key",
    "data": "Provide X-API-Key header with valid API key"
  }
}
```

## Using with AI Agents

### Python (requests)

```python
import requests

MCP_SERVER_URL = "https://mediamath-mcp-mock-two.vercel.app/api/message"
API_KEY = "mcp_mock_2025_hypermindz_44b87c1d20ed"

def call_mcp_tool(tool_name: str, arguments: dict):
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY  # Include API key
    }

    payload = {
        "jsonrpc": "2.0",
        "method": "tools/call",
        "params": {
            "name": tool_name,
            "arguments": arguments
        },
        "id": 1
    }

    response = requests.post(MCP_SERVER_URL, json=payload, headers=headers)
    return response.json()

# Use it
campaigns = call_mcp_tool("find_campaigns", {"organization_id": 100048})
print(campaigns)
```

### JavaScript/TypeScript (fetch)

```typescript
const MCP_SERVER_URL = "https://mediamath-mcp-mock-two.vercel.app/api/message";
const API_KEY = "mcp_mock_2025_hypermindz_44b87c1d20ed";

async function callMcpTool(toolName: string, args: Record<string, any>) {
  const response = await fetch(MCP_SERVER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,  // Include API key
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args,
      },
      id: 1,
    }),
  });

  return await response.json();
}

// Use it
const campaigns = await callMcpTool('find_campaigns', { organization_id: 100048 });
console.log(campaigns);
```

## Updating Existing Agents

If you've already deployed CrewAI or LangGraph agents, update them:

### Update `agents/crewai_campaign_optimizer.py`

```python
# Add at the top
API_KEY = "mcp_mock_2025_hypermindz_44b87c1d20ed"

# Update call_mcp_tool function
def call_mcp_tool(tool_name: str, arguments: dict) -> dict:
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY  # Add this line
    }

    response = requests.post(MCP_SERVER_URL, json=payload, headers=headers)
    # ... rest of function
```

### Update `agents/langgraph_budget_analyzer.py`

Same changes as above - add API_KEY constant and include in headers.

## Security Considerations

⚠️ **Important Security Notes**:

1. **This is a MOCK server** - Not production-grade security
2. **Simple string comparison** - No encryption or hashing
3. **API key in plain text** - Shared in documentation for demo purposes
4. **No rate limiting** - Could be abused if made public with auth
5. **No audit logging** - No tracking of who uses the API

### For Production Use:

- Use OAuth 2.0 or JWT tokens
- Hash API keys in database
- Implement rate limiting
- Add request logging and monitoring
- Use HTTPS only
- Rotate keys regularly
- Implement key scopes/permissions

## Disabling Authentication

To disable authentication and make the server public again:

1. **On Vercel**: Delete the `MCP_API_KEY` environment variable
2. **Locally**: Remove `MCP_API_KEY` from `.env.local`
3. Redeploy/restart server

The server will automatically detect no API key is configured and allow public access.

## Troubleshooting

### "Unauthorized" errors in testing UI
- Check that API key is entered correctly (no extra spaces)
- Click "Reconnect" after entering the key
- Clear localStorage and re-enter: `localStorage.removeItem('mcp_api_key')`

### Tools not loading
- Check browser console for errors
- Verify API key matches exactly (case-sensitive)
- Check Vercel deployment logs for server errors

### 401 when auth should be disabled
- Verify `MCP_API_KEY` environment variable is not set on Vercel
- Redeploy after removing the variable
- Clear browser cache

## API Key Format

The API key follows this pattern:
```
mcp_mock_[year]_[organization]_[random_hex]
```

Example: `mcp_mock_2025_hypermindz_44b87c1d20ed`

- **Prefix**: `mcp_mock` - Identifies it as MCP mock server key
- **Year**: `2025` - When key was created
- **Organization**: `hypermindz` - Organization name
- **Random**: `44b87c1d20ed` - 12-char random hex for uniqueness

## Support

For issues with authentication:
1. Check this guide first
2. Verify environment variables are set correctly
3. Test with curl before using in applications
4. Check Vercel deployment logs for server-side errors

---

**Last Updated**: November 2025
**Current Status**: Authentication is OPTIONAL (disabled by default)
**To Enable**: Set `MCP_API_KEY` environment variable on Vercel
