# Vercel Deployment Guide

## Overview

This MCP server is now deployable to Vercel using the `mcp-handler` package. It supports both **Streamable HTTP** (stateless) and **SSE** transports.

## Quick Deploy

### Option 1: Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel deploy --prod
```

### Option 2: Deploy via GitHub Integration

1. Push code to GitHub
2. Connect repository to Vercel
3. Vercel auto-deploys on push

## Deployment Configuration

The `vercel.json` file configures:
- **Max Duration**: 60 seconds for SSE connections
- **Memory**: 1024MB for serverless functions
- **CORS**: Enabled for cross-origin requests
- **Region**: iad1 (US East)

## Endpoints

Once deployed, your MCP server will be available at:

```
https://your-app.vercel.app/api/message  (HTTP POST)
https://your-app.vercel.app/api/sse      (Server-Sent Events)
```

## Testing the Deployment

### Test with curl

```bash
# Health check
curl -X POST https://your-app.vercel.app/api/message \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "healthcheck",
      "arguments": {}
    },
    "id": 1
  }'

# Find campaigns
curl -X POST https://your-app.vercel.app/api/message \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "find_campaigns",
      "arguments": {
        "organization_id": 100048
      }
    },
    "id": 2
  }'
```

### Test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector https://your-app.vercel.app/api
```

## Connect from AI Agents

### Python (requests)

```python
import requests

response = requests.post(
    "https://your-app.vercel.app/api/message",
    json={
        "jsonrpc": "2.0",
        "method": "tools/call",
        "params": {
            "name": "find_campaigns",
            "arguments": {"advertiser_id": 5001}
        },
        "id": 1
    }
)

print(response.json())
```

### JavaScript/TypeScript

```typescript
const response = await fetch('https://your-app.vercel.app/api/message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: 'find_campaigns',
      arguments: { advertiser_id: 5001 }
    },
    id: 1
  })
});

const data = await response.json();
console.log(data);
```

## Available Tools (28 total)

1. **System**: healthcheck
2. **Users**: find_user, get_user_info, get_user_permissions
3. **Organizations**: find_organizations, get_organization_info
4. **Agencies**: find_agencies, get_agency_info
5. **Advertisers**: find_advertisers, get_advertiser_info
6. **Campaigns**: find_campaigns, get_campaign_info, campaign_create, campaign_update
7. **Strategies**: find_strategies, get_strategy_info, strategy_create, strategy_update
8. **Supply**: find_supply_sources, get_supply_source_info
9. **Site Lists**: find_site_lists, get_site_list_info
10. **Creatives**: find_concepts, get_concept_info
11. **Audience**: find_audience_segments

## Environment Variables (Optional)

For SSE transport with state management:

```bash
# In Vercel Dashboard > Settings > Environment Variables
REDIS_URL=redis://your-redis-instance
```

## Monitoring

After deployment, monitor your MCP server in Vercel Dashboard:
- **Functions**: View serverless function logs
- **Analytics**: Track API calls and errors
- **Performance**: Monitor response times

## Troubleshooting

### Import Errors
If you see module not found errors, ensure `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### CORS Errors
CORS headers are already configured in `vercel.json`. If still seeing issues, check browser console.

### Function Timeout
Default is 60s. For longer operations, increase `maxDuration` in `vercel.json`.

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Test with curl/Postman
3. ✅ Connect AI agents (CrewAI, LangGraph)
4. ✅ Build demo applications

## Resources

- [Vercel MCP Docs](https://vercel.com/docs/mcp)
- [mcp-handler GitHub](https://github.com/vercel/mcp-handler)
- [MCP Specification](https://modelcontextprotocol.io)
