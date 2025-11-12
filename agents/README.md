# AI Agent Demos

This directory contains sample AI agents that demonstrate using the MediaMath MCP Server.

## Setup

1. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Set OpenAI API key** (for CrewAI/LangChain):
   ```bash
   export OPENAI_API_KEY=your_api_key_here
   ```

3. **Start the MCP server**:
   ```bash
   # Local development
   npm run dev

   # Or use deployed Vercel URL in the scripts
   ```

## Available Agents

### 1. CrewAI Campaign Optimizer

**File**: `crewai_campaign_optimizer.py`

**What it does**:
- Analyzes all campaigns for a specific advertiser
- Identifies optimization opportunities
- Recommends budget reallocation strategies

**Agents**:
- **Campaign Performance Analyst**: Analyzes campaign metrics
- **Budget Optimization Specialist**: Recommends budget changes

**Run it**:
```bash
python crewai_campaign_optimizer.py
```

**Example Output**:
```
🚀 Starting Campaign Optimization Crew...
📊 Fetching campaigns for advertiser 5001...
✅ Found 1 campaigns with total budget $50,000
🎯 Analyzing strategies...
💡 Recommendations:
  1. Reallocate $5,000 from Display to Video (higher CTR)
  2. Increase Mobile budget by 20% (underutilized)
```

### 2. LangGraph Budget Analyzer

**File**: `langgraph_budget_analyzer.py`

**What it does**:
- State machine approach to budget analysis
- Fetches campaigns → strategies → analyzes → recommends
- Generates comprehensive budget allocation report

**Workflow States**:
1. `fetch_campaigns` - Get all campaigns for organization
2. `fetch_strategies` - Get strategies for each campaign
3. `analyze_budgets` - Calculate budget metrics
4. `generate_recommendations` - Create action items
5. `print_report` - Display results

**Run it**:
```bash
python langgraph_budget_analyzer.py
```

**Example Output**:
```
📈 BUDGET ANALYSIS REPORT
================================================
📊 OVERVIEW
   • Total Campaigns: 3
   • Total Strategies: 5
   • Campaign Budget: $180,000.00
   • Strategy Budget: $150,000.00
   • Utilization: 83.3%

💰 BUDGET BY GOAL TYPE
   • CTR: $50,000.00 (27.8%)
   • CPA: $100,000.00 (55.6%)
   • REACH: $30,000.00 (16.7%)

💡 RECOMMENDATIONS
   1. [HIGH] Budget Allocation
      Issue: Low budget utilization (83.3%)
      Action: Allocate $30,000.00 remaining budget
      Impact: 15-20% increase in reach
```

## Connecting to Your Deployed Server

After deploying to Vercel, update the `MCP_SERVER_URL` in each script:

```python
# Change from:
MCP_SERVER_URL = "http://localhost:3000/api/message"

# To:
MCP_SERVER_URL = "https://your-app.vercel.app/api/message"
```

## MCP Tools Used

Both agents use these MCP tools:

| Tool | Purpose |
|------|---------|
| `find_campaigns` | Search campaigns by filters |
| `get_campaign_info` | Get campaign details + strategies |
| `find_strategies` | Search strategies by campaign/type |
| `get_strategy_info` | Get strategy details |
| `find_advertisers` | Find advertisers |
| `get_advertiser_info` | Get advertiser details |

## Creating Your Own Agents

### Basic Pattern

```python
import requests
import json

MCP_SERVER_URL = "http://localhost:3000/api/message"

def call_mcp_tool(tool_name: str, arguments: dict) -> dict:
    """Call any MCP tool"""
    payload = {
        "jsonrpc": "2.0",
        "method": "tools/call",
        "params": {
            "name": tool_name,
            "arguments": arguments
        },
        "id": 1
    }

    response = requests.post(MCP_SERVER_URL, json=payload)
    result = response.json()

    if "result" in result and "content" in result["result"]:
        return json.loads(result["result"]["content"][0]["text"])

    return result

# Use it
campaigns = call_mcp_tool("find_campaigns", {"advertiser_id": 5001})
print(campaigns)
```

## Next Steps

1. **Customize agents** for your use case
2. **Add more tools** to agent capabilities
3. **Deploy agents** as APIs or scheduled jobs
4. **Connect to dashboards** for visualization

## Available MCP Tools (28 total)

- System: `healthcheck`
- Users: `find_user`, `get_user_info`, `get_user_permissions`
- Organizations: `find_organizations`, `get_organization_info`, `find_agencies`, `get_agency_info`, `find_advertisers`, `get_advertiser_info`
- Campaigns: `find_campaigns`, `get_campaign_info`, `campaign_create`, `campaign_update`
- Strategies: `find_strategies`, `get_strategy_info`, `strategy_create`, `strategy_update`
- Supply: `find_supply_sources`, `get_supply_source_info`, `find_site_lists`, `get_site_list_info`
- Creative: `find_concepts`, `get_concept_info`
- Audience: `find_audience_segments`
