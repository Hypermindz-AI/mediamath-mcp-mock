# CrewAI Flows for MediaMath MCP Mock

Complete campaign management system with intelligent routing using CrewAI Flows and MediaMath MCP Server.

## Overview

This implementation provides **5 specialized CrewAI Flows** with an **intelligent router** that automatically selects the right flow based on your natural language query:

1. **Campaign Setup Flow** - Create and launch new campaigns
2. **Optimization Flow** - Optimize campaign performance and adjust budgets
3. **Analytics Flow** - Generate reports and analyze campaign metrics
4. **Compliance Flow** - User access auditing and permission analysis
5. **Creative Flow** - Creative asset analysis and refresh planning

Each flow accepts **natural language queries** and orchestrates multiple specialized agents to accomplish complex tasks.

## Quick Start

### Single Command Usage

```bash
# Interactive mode (recommended for beginners)
python main.py

# Single query mode
python main.py -q "Create 10 campaigns for Black Friday"

# Show example queries
python main.py --examples

# List available flows
python main.py --flows
```

The router automatically detects your intent and routes to the correct flow!

## Architecture

### Flow Router (NEW!)

The **FlowRouter** is an intelligent routing system that automatically classifies your natural language query and routes it to the appropriate flow.

**How it works:**
1. **LLM-based Classification** - Uses GPT-4 to understand query intent
2. **Keyword Fallback** - Falls back to keyword matching if LLM fails
3. **Confidence Scoring** - Provides confidence score for routing decision
4. **Automatic Execution** - Executes the selected flow automatically

**Classification Patterns:**
- **Campaign Setup**: "create", "launch", "set up", "new campaigns", "bulk create"
- **Optimization**: "pause", "optimize", "adjust", "improve", "reduce spend", "underperforming"
- **Analytics**: "report", "analyze", "show", "performance", "budget utilization", "metrics"
- **Compliance**: "audit", "permissions", "access", "security", "compliance", "users"
- **Creative**: "creative", "refresh", "fatigue", "assets", "ads"

**Usage:**
```python
from router.flow_router import FlowRouter

router = FlowRouter()

# Classify intent only
result = router.route("Create 10 campaigns for Black Friday")
print(f"Flow: {result['flow_name']}, Confidence: {result['confidence']}")

# Route and execute
result = router.execute_flow("Create 10 campaigns for Black Friday")
print(result)
```

### Campaign Setup Flow

**Accepts queries like:**
- "Create 10 holiday campaigns with $5000 budget each"
- "Set up 5 campaigns for Black Friday with total budget of $25000"
- "Launch new campaigns targeting millennials"

**Orchestrates 3 agents:**
1. **Campaign Strategist** - Parses natural language and creates strategy
2. **Campaign Builder** - Builds campaigns using MCP tools
3. **QA Specialist** - Verifies configurations and validates results

### Optimization Flow

**Accepts queries like:**
- "Pause all underperforming campaigns"
- "Optimize campaigns with CPA above $50"
- "Adjust bids for better performance"

**Orchestrates 3 agents:**
1. **Campaign Auditor** - Identifies campaigns needing optimization
2. **Optimization Strategist** - Creates optimization plan
3. **Implementation Specialist** - Executes optimization actions

### Analytics Flow

**Accepts queries like:**
- "Generate performance report for all campaigns"
- "Show budget utilization analysis for last 30 days"
- "Analyze campaign metrics and trends"

**Orchestrates 3 agents:**
1. **Data Collector** - Gathers campaign performance data
2. **Performance Analyst** - Analyzes trends and patterns
3. **Report Generator** - Creates comprehensive reports

### Compliance Flow

**Accepts queries like:**
- "Audit all user permissions for security review"
- "Find users with admin access who shouldn't have it"
- "Identify compliance violations in user permissions"

**Orchestrates 3 agents:**
1. **User Auditor** - Gathers user and permission data using MCP tools
2. **Permission Analyzer** - Analyzes patterns and identifies violations
3. **Audit Reporter** - Creates comprehensive compliance reports

### Creative Flow

**Accepts queries like:**
- "Find all creatives that need refresh based on performance"
- "Analyze creative fatigue across all campaigns"
- "Identify underperforming creatives and plan refreshes"

**Orchestrates 3 agents:**
1. **Creative Collector** - Gathers creative assets and usage data
2. **Creative Analyst** - Analyzes performance and identifies refresh needs
3. **Refresh Planner** - Creates actionable refresh plans with timelines

## Directory Structure

```
crewai-flows/
├── agents/                        # Agent definitions
│   ├── __init__.py
│   ├── campaign_setup_agents.py   # Campaign Setup agents
│   ├── optimization_agents.py     # Optimization agents
│   ├── analytics_agents.py        # Analytics agents
│   ├── compliance_agents.py       # Compliance agents
│   └── creative_agents.py         # Creative agents
├── tasks/                         # Task definitions
│   ├── __init__.py
│   ├── campaign_setup_tasks.py    # Campaign Setup tasks
│   ├── optimization_tasks.py      # Optimization tasks
│   ├── analytics_tasks.py         # Analytics tasks
│   ├── compliance_tasks.py        # Compliance tasks
│   └── creative_tasks.py          # Creative tasks
├── flows/                         # Flow implementations
│   ├── __init__.py
│   ├── campaign_setup_flow.py     # Campaign Setup Flow
│   ├── optimization_flow.py       # Optimization Flow
│   ├── analytics_flow.py          # Analytics Flow
│   ├── compliance_flow.py         # Compliance Flow
│   └── creative_flow.py           # Creative Flow
├── router/                        # Intelligent routing (NEW!)
│   ├── __init__.py
│   └── flow_router.py             # FlowRouter implementation
├── examples/                      # Example usage scripts
│   ├── __init__.py
│   ├── run_campaign_setup.py
│   ├── run_optimization.py
│   ├── run_analytics.py
│   ├── run_compliance.py
│   └── run_creative.py
├── tests/                         # Test suites
│   ├── __init__.py
│   ├── test_campaign_setup.py
│   ├── test_optimization.py
│   ├── test_analytics.py
│   ├── test_compliance.py
│   ├── test_creative.py
│   └── test_router.py             # Router tests (NEW!)
├── shared/                        # Shared utilities
│   └── mcp_tools.py               # MCP tools wrapper
├── config/                        # Configuration files
│   └── settings.py
├── main.py                        # Main CLI application (NEW!)
├── README.md                      # This file
├── ROUTER_GUIDE.md               # Router documentation (NEW!)
└── requirements.txt               # Python dependencies
```

## Installation

### Prerequisites

1. Python 3.11+
2. OpenAI API key
3. Access to MediaMath MCP Server (deployed or local)

### Setup

1. **Install dependencies:**
```bash
cd /Users/dineshbhat/sandbox/hypermindz/mediamath-mcp-mock/agents
pip install -r requirements.txt
```

2. **Set environment variables:**
```bash
export OPENAI_API_KEY="your_openai_api_key"
export MCP_SERVER_URL="https://mediamath-mcp-mock-two.vercel.app/api/message"
export MCP_API_KEY="mcp_mock_2025_hypermindz_44b87c1d20ed"
```

Or create a `.env` file:
```env
OPENAI_API_KEY=your_openai_api_key
MCP_SERVER_URL=https://mediamath-mcp-mock-two.vercel.app/api/message
MCP_API_KEY=mcp_mock_2025_hypermindz_44b87c1d20ed
```

## Usage

### Main CLI Application (Recommended)

The easiest way to use any flow is through the main CLI application with intelligent routing:

**Interactive mode (recommended):**
```bash
cd /Users/dineshbhat/sandbox/hypermindz/mediamath-mcp-mock/agents/crewai-flows
python main.py
```

This will start an interactive session where you can:
- Type natural language queries
- Use commands: `help`, `examples`, `flows`, `exit`
- Get automatic routing to the correct flow

**Single query mode:**
```bash
# Create campaigns
python main.py -q "Create 10 campaigns for Black Friday"

# Optimize campaigns
python main.py -q "Pause underperforming campaigns"

# Generate reports
python main.py -q "Generate performance report for all campaigns"

# Audit permissions
python main.py -q "Audit user permissions for security review"

# Refresh creatives
python main.py -q "Find creatives that need refresh"
```

**Show examples:**
```bash
python main.py --examples
```

**List available flows:**
```bash
python main.py --flows
```

### Running Individual Flows Directly

You can also run flows directly without the router:

**Campaign Setup Flow:**
```bash
python flows/campaign_setup_flow.py "Create 10 campaigns with $5000 each"
```

**Optimization Flow:**
```bash
python flows/optimization_flow.py "Pause campaigns with CPA above $50"
```

**Analytics Flow:**
```bash
python flows/analytics_flow.py "Generate performance report"
```

**Compliance Flow:**
```bash
python flows/compliance_flow.py "Audit user permissions"
```

**Creative Flow:**
```bash
python flows/creative_flow.py "Find creatives needing refresh"
```

### Programmatic Usage

**Using the Router (Recommended):**
```python
from router.flow_router import FlowRouter

router = FlowRouter()

# Route and execute automatically
result = router.execute_flow("Create 10 campaigns for Black Friday")

if result["success"]:
    print(f"Flow: {result['routing']['flow_name']}")
    print(f"Result: {result['result']}")
else:
    print(f"Error: {result['error']}")
```

**Using Individual Flows:**
```python
from flows.campaign_setup_flow import run_campaign_setup_flow
from flows.optimization_flow import run_optimization_flow
from flows.analytics_flow import run_analytics_flow
from flows.compliance_flow import run_compliance_flow
from flows.creative_flow import run_creative_flow

# Campaign Setup
result = run_campaign_setup_flow("Create 10 campaigns with $5000 each")

# Optimization
result = run_optimization_flow("Pause underperforming campaigns")

# Analytics
result = run_analytics_flow("Generate performance report")

# Compliance
result = run_compliance_flow("Audit user permissions")

# Creative
result = run_creative_flow("Find creatives needing refresh")
```

## Example Queries

### Compliance Flow Examples

1. **Basic Security Audit**
   ```
   "Audit all user permissions for security review"
   ```

2. **Admin Access Review**
   ```
   "Check for users with admin access who shouldn't have it"
   ```

3. **Compliance Violations**
   ```
   "Identify compliance violations in user permissions"
   ```

4. **Inactive User Audit**
   ```
   "Find all inactive users who still have active access"
   ```

5. **Permission Anomalies**
   ```
   "Detect unusual permission patterns and access anomalies"
   ```

### Creative Flow Examples

1. **Basic Creative Refresh**
   ```
   "Find all creatives that need refresh based on performance"
   ```

2. **Creative Fatigue Analysis**
   ```
   "Analyze creative fatigue across all campaigns"
   ```

3. **High-Budget Focus**
   ```
   "Identify underperforming creatives in high-budget campaigns"
   ```

4. **Age-Based Audit**
   ```
   "Find all creatives older than 90 days that need refresh"
   ```

5. **Complete Assessment**
   ```
   "Analyze all creatives and create prioritized refresh plan"
   ```

## Testing

Run the test suites:

```bash
# Test Compliance Flow
pytest tests/test_compliance.py -v

# Test Creative Flow
pytest tests/test_creative.py -v

# Run all tests
pytest tests/ -v
```

**Note:** Integration tests that actually call the OpenAI API and MCP server will only run if `OPENAI_API_KEY` is set in the environment.

## MCP Tools Integration

The flows use the shared MCP tools wrapper located at `/Users/dineshbhat/sandbox/hypermindz/mediamath-mcp-mock/shared/mcp_tools.py`.

### Available MCP Tools

**User/Organization Tools:**
- `find_users` - Find users by organization or role
- `get_user_permissions` - Get detailed user permissions
- `get_user_info` - Get user information
- `find_organizations` - Find all organizations

**Creative Tools:**
- `find_creatives` - Find creative assets
- `get_creative_info` - Get creative details and performance
- `create_creative` - Create new creative assets

**Campaign Tools:**
- `find_campaigns` - Find campaigns
- `get_campaign_info` - Get campaign details
- `create_campaign` - Create new campaigns
- `update_campaign` - Update campaign properties

**Strategy Tools:**
- `find_strategies` - Find strategies
- `get_strategy_info` - Get strategy details
- `create_strategy` - Create new strategies
- `update_strategy` - Update strategy properties

## How It Works

### Flow Execution Pattern

Both flows follow the same execution pattern:

1. **User provides natural language query**
   - Query describes what they want to accomplish
   - No need to specify technical details

2. **Flow kickoff**
   - Flow initializes with the query
   - Sets up state management

3. **Crew execution**
   - Creates specialized agents
   - Defines tasks with query context
   - Sets up task dependencies
   - Executes crew sequentially

4. **Results finalization**
   - Collects results from all tasks
   - Formats final report
   - Returns to user

### Agent Specialization

Each agent has:
- **Specific role and expertise**
- **Clear goal statement**
- **Detailed backstory** (provides context for better LLM behavior)
- **Appropriate tools** (only what they need)
- **Temperature setting** (0.1 for data collection, 0.4 for creative planning)

### Task Design

Each task includes:
- **Detailed description** with step-by-step instructions
- **Context from previous tasks** (for sequential execution)
- **Expected output format** (ensures consistent results)
- **Natural language query** (passed through for context)

## Performance Considerations

- **Rate limiting:** Crews are configured with `max_rpm=10`
- **Verbose mode:** Enabled for debugging (can be disabled in production)
- **Memory:** Enabled for cross-task context sharing
- **Sequential processing:** Ensures tasks build on previous results

## Troubleshooting

### "OpenAI API key not found"
Set the environment variable:
```bash
export OPENAI_API_KEY="your_key_here"
```

### "Connection refused" or "MCP server errors"
Check that the MCP server URL is correct and accessible:
```bash
export MCP_SERVER_URL="https://mediamath-mcp-mock-two.vercel.app/api/message"
```

### "ModuleNotFoundError"
Make sure you're running from the correct directory and have installed dependencies:
```bash
cd /Users/dineshbhat/sandbox/hypermindz/mediamath-mcp-mock/agents
pip install -r requirements.txt
```

### "No such file or directory"
Verify you're in the correct directory:
```bash
cd /Users/dineshbhat/sandbox/hypermindz/mediamath-mcp-mock/agents/crewai-flows
```

## Implementation Notes

### Design Decisions

1. **Natural Language Queries**
   - Flows accept simple English queries
   - No need for structured parameters
   - Agents interpret intent from query

2. **Sequential Processing**
   - Tasks execute in order
   - Each task builds on previous results
   - Ensures logical flow of information

3. **Specialized Agents**
   - Each agent has one clear responsibility
   - Tools are assigned based on needs
   - Temperature varies by agent type

4. **Task Context Dependencies**
   - Tasks explicitly depend on previous tasks
   - CrewAI manages context sharing
   - Results flow naturally through pipeline

### Future Enhancements

- Add more flows (Campaign Setup, Optimization, Analytics)
- Implement flow router for automatic flow selection
- Add result caching for repeated queries
- Implement batch processing for multiple queries
- Add webhooks for async execution
- Create web UI for flow management

## References

- [CrewAI Documentation](https://docs.crewai.com/)
- [CrewAI Flows Guide](https://docs.crewai.com/concepts/flows)
- [MediaMath MCP Implementation Guide](/Users/dineshbhat/sandbox/hypermindz/mediamath-mcp-mock/docs/CREWAI_IMPLEMENTATION_GUIDE.md)
- [LangChain Tools Documentation](https://python.langchain.com/docs/modules/agents/tools/)

## Authors

HyperMindz AI Engineering Team

## License

MIT License
