# MCP Server Testing Guide

## ✅ Success! You now have a true MCP server!

This MediaMath MCP Mock Server is now a **standard MCP server** using STDIO transport, compatible with:
- ✅ MCP Inspector (official testing tool)
- ✅ Claude Desktop
- ✅ Any MCP-compatible client

---

## Quick Test with MCP Inspector

### Start the MCP Inspector

```bash
npm run test:mcp
```

This will:
1. Start the MCP Inspector UI on http://localhost:6274
2. Start the MCP Proxy server on localhost:6277
3. Launch your MediaMath MCP server via STDIO
4. Open your browser automatically

### What You'll See

The Inspector provides a web UI to:
- 📋 **List tools** - See all 4 available tools
- 🔧 **Call tools** - Test each tool with arguments
- 📊 **View responses** - See structured JSON responses
- 🐛 **Debug** - Monitor STDIO communication

### Available Tools

1. **healthcheck** - Check server health
2. **find_user** - Search users by filters
3. **get_user_info** - Get detailed user information
4. **get_user_permissions** - Get user role permissions

---

## Test Examples in MCP Inspector

### Example 1: Check System Health

**Tool**: `healthcheck`
**Arguments**: `{}`

**Expected Response**:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "services": {
    "auth": "up",
    "data": "up",
    "mcp": "up",
    "sse": "up"
  },
  "stats": {
    "activeSessions": 0,
    "totalRecords": 2,
    "users": 2
  }
}
```

### Example 2: Find Admin Users

**Tool**: `find_user`
**Arguments**:
```json
{
  "role": "ADMIN"
}
```

### Example 3: Get User Details

**Tool**: `get_user_info`
**Arguments**:
```json
{
  "user_id": 1,
  "with_permissions": true
}
```

### Example 4: Get User Permissions

**Tool**: `get_user_permissions`
**Arguments**:
```json
{
  "user_id": 2
}
```

---

## Using with Claude Desktop

### Step 1: Build the Server

```bash
# Install dependencies
npm install

# Build for production (creates dist/stdio-server.js)
npm run build
```

### Step 2: Configure Claude Desktop

#### On macOS
Edit: `~/Library/Application Support/Claude/claude_desktop_config.json`

#### On Windows
Edit: `%APPDATA%\Claude\claude_desktop_config.json`

#### Configuration:
```json
{
  "mcpServers": {
    "mediamath-mcp-mock": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/TO/mediamath-mcp-mock/dist/stdio-server.js"
      ]
    }
  }
}
```

**Important**: Replace `/ABSOLUTE/PATH/TO/` with your actual project path!

### Step 3: Restart Claude Desktop

Quit and restart Claude Desktop completely.

### Step 4: Verify in Claude Desktop

In Claude Desktop, you should see a 🔌 icon indicating MCP servers are connected.

Try asking:
- "Check the system health"
- "Find all admin users"
- "What are the permissions for user ID 1?"

---

## Development Mode

### Run STDIO Server Directly

```bash
# Run once
npm run stdio

# Run with auto-reload on file changes
npm run dev:stdio
```

### Test with Inspector (Recommended)

```bash
npm run test:mcp
```

This is the best way to develop and test your MCP tools interactively.

---

## Natural Language Queries (via Claude Desktop)

Once connected to Claude Desktop, you can use natural language:

### Health Check
- "Is the MediaMath system healthy?"
- "Check the server status"
- "Show me system health"

### User Queries
- "Find all admin users"
- "Show me users in organization 100048"
- "What permissions does user 2 have?"
- "Get details for user ID 1"

### Complex Queries
- "Find active users with TRADER role"
- "List all admin users and show their permissions"
- "Search for users with 'admin' in their email"

---

## Architecture

### STDIO Transport (Standard MCP)

```
┌─────────────────┐         STDIO          ┌──────────────────┐
│                 │◄──────────────────────►│                  │
│  MCP Client     │    (stdin/stdout)      │   MCP Server     │
│  (Inspector/    │                        │   (stdio-server) │
│   Claude)       │                        │                  │
└─────────────────┘                        └──────────────────┘
```

### How It Works

1. **Client** (MCP Inspector or Claude Desktop) spawns the server as a subprocess
2. **Communication** happens via STDIO (standard input/output streams)
3. **JSON-RPC 2.0** messages are exchanged
4. **Tools** are registered and callable by name
5. **Responses** include structured data + human-readable text

---

## Comparison: Old HTTP vs New STDIO

| Feature | Old HTTP Approach | New STDIO Approach |
|---------|-------------------|-------------------|
| **Transport** | Custom HTTP POST | Standard STDIO |
| **Auth** | OAuth 2.0 tokens | None (client handles) |
| **Testing** | curl commands | MCP Inspector |
| **Compatible with** | Custom clients | Claude Desktop, all MCP clients |
| **Session** | Custom management | Transport-managed |
| **Endpoints** | Multiple (/api/mcp, /api/sse) | Single stdio stream |

---

## Troubleshooting

### MCP Inspector won't start

**Check**: Is port 6274 or 6277 already in use?
```bash
lsof -i :6274
lsof -i :6277
```

**Solution**: Kill existing process or change ports.

### Tools not appearing in Inspector

**Check**: Are tools registered?
```bash
# In src/stdio-server.ts, check console.error output
npm run stdio
# Look for: "[MCP Server] Initialized 4 tools"
```

### Claude Desktop can't find server

**Check**: Is the path in `claude_desktop_config.json` absolute and correct?

**Verify**:
```bash
ls -la /your/path/to/dist/stdio-server.js
```

### Import errors (.js extensions)

**Issue**: TypeScript/Node ESM requires `.js` extensions in imports.

**Solution**: Make sure all imports in `stdio-server.ts` end with `.js`:
```typescript
import { toolRegistry } from './lib/tools/registry.js'; // ✅ .js extension
import { registerSystemTools } from './lib/tools/system.js'; // ✅ .js extension
```

---

## Next Steps

### 1. Add More Tools
- Implement campaign tools
- Implement strategy tools
- Implement organization tools

### 2. Enhance Data
- Expand mock data generator with more realistic data
- Add more users, campaigns, strategies

### 3. Advanced Features
- Add prompts (guided workflows)
- Add resources (data access patterns)
- Add sampling (LLM completion requests)

### 4. Distribution
- Publish to npm
- Add to MCP server registry
- Create documentation site

---

## Resources

- **MCP Specification**: https://modelcontextprotocol.io/specification/latest
- **MCP Inspector Docs**: https://modelcontextprotocol.io/docs/tools/inspector
- **TypeScript SDK**: https://github.com/modelcontextprotocol/typescript-sdk
- **Example Servers**: https://github.com/modelcontextprotocol/servers

---

## Success Indicators

✅ MCP Inspector launches successfully
✅ All 4 tools visible in tools list
✅ Tools execute without errors
✅ Structured responses returned
✅ Can connect from Claude Desktop
✅ Natural language queries work

**You now have a production-ready MCP server!** 🎉
