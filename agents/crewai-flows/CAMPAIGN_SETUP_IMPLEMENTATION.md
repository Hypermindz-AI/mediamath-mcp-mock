# Campaign Setup Flow - Implementation Summary

## Overview

Successfully implemented a complete Campaign Setup Flow at `/Users/dineshbhat/sandbox/hypermindz/mediamath-mcp-mock/agents/crewai-flows/` that accepts **natural language queries** for campaign creation.

## CRITICAL FEATURE: Natural Language Interface

The flow accepts a **SINGLE NATURAL LANGUAGE QUERY** as input, such as:
- "Create 10 holiday campaigns with $5000 budget each"
- "Set up 5 campaigns for Black Friday with total budget of $25000"

No complex JSON required - just plain English!

## Implementation Complete ✓

### 1. Agent Definitions (`agents/campaign_setup_agents.py`)

Three specialized agents created:

#### Campaign Strategist
- **Purpose**: Parses NL queries and creates campaign strategies
- **Tools**: `find_organizations`, `find_campaigns`
- **Key Capability**: Extracts parameters from natural language
  - Campaign count: "Create **10** campaigns"
  - Budget allocation: "$5000 **budget each**" or "**total budget** of $25000"
  - Theme extraction: "**holiday** campaigns", "**Black Friday**"
  - Name generation: Creates meaningful names from theme

#### Campaign Builder
- **Purpose**: Executes campaign creation via MCP
- **Tools**: `create_campaign`, `create_strategy`, `get_campaign_info`
- **Key Capability**: Sequential campaign creation
  - Creates campaigns ONE AT A TIME
  - Uses exact names/budgets from strategy
  - Tracks all IDs and errors
  - Creates default strategy for each campaign

#### QA Specialist
- **Purpose**: Verifies configurations before launch
- **Tools**: `get_campaign_info`, `find_campaigns`, `get_strategy_info`
- **Key Capability**: Comprehensive validation
  - Verifies each campaign exists
  - Validates budgets match strategy
  - Checks names and configurations
  - Generates PASS/FAIL report

### 2. Task Definitions (`tasks/campaign_setup_tasks.py`)

Three sequential task functions:

#### `create_parse_and_plan_task()`
- Accepts: Natural language query string
- Extracts: Campaign count, budget, theme, naming patterns
- Handles: "budget each" vs "total budget" scenarios
- Generates: Campaign names if not specified
- Returns: Structured strategy document (JSON)

#### `create_build_campaigns_task()`
- Uses: Strategy from previous task (context)
- Creates: Campaigns one-by-one via `create_campaign`
- Creates: Default strategies via `create_strategy`
- Tracks: All campaign IDs, strategy IDs, errors
- Returns: Implementation report with IDs and status

#### `create_verify_campaigns_task()`
- Uses: Implementation report (context)
- Verifies: Each campaign via `get_campaign_info`
- Validates: Budgets, names, configurations
- Determines: PASS/FAIL/PASS_WITH_WARNINGS
- Returns: QA report with launch readiness

### 3. Flow Implementation (`flows/campaign_setup_flow.py`)

CrewAI Flow with Pydantic state management:

```python
class CampaignSetupState(BaseModel):
    natural_language_query: str = ""
    campaign_strategy: Dict[str, Any] = {}
    implementation_report: Dict[str, Any] = {}
    qa_report: Dict[str, Any] = {}
    final_result: Dict[str, Any] = {}
```

**Flow Decorators:**

- `@start()` - `receive_campaign_request(natural_language_query: str)`
  - Entry point accepting NL query
  - Executes strategy planning phase

- `@listen(receive_campaign_request)` - `build_campaigns()`
  - Listens to strategy completion
  - Executes campaign building phase

- `@listen(build_campaigns)` - `verify_campaigns()`
  - Listens to building completion
  - Executes QA verification phase

**Sequential Execution:**
```
NL Query → Strategy → Build → QA → Final Result
```

### 4. Example Usage (`examples/run_campaign_setup.py`)

Four example scenarios:

1. **Budget Per Campaign**: "Create 10 holiday campaigns with $5000 budget each"
2. **Total Budget Split**: "Set up 5 campaigns for Black Friday with total budget of $25000"
3. **Minimal Query**: "Create 3 campaigns for new product launch" (uses defaults)
4. **With Theme**: "Launch 7 campaigns for Valentine's Day promotion with $3000 each"

**Command line interface:**
```bash
python examples/run_campaign_setup.py 1    # Run example 1
python examples/run_campaign_setup.py all  # Run all examples
```

### 5. Tests (`tests/test_campaign_setup.py`)

Three test classes:

#### `TestCampaignSetupFlow`
- Flow initialization
- State initialization
- MCP tools availability
- Agent creation
- NL query parsing

#### `TestAgents`
- Strategist tool assignment
- Builder tool assignment
- QA specialist tool assignment

#### `TestIntegration`
- End-to-end flow execution (skipped by default)
- Requires OPENAI_API_KEY

**Run tests:**
```bash
pytest tests/test_campaign_setup.py -v
```

## Key Code Snippets

### Using the Flow

```python
from flows.campaign_setup_flow import execute_campaign_setup_flow

# Single natural language query - that's it!
result = execute_campaign_setup_flow(
    "Create 10 holiday campaigns with $5000 budget each"
)

# Result contains:
# - query: Original NL query
# - strategy: Parsed campaign plan
# - implementation: Created campaign IDs
# - qa_report: Verification results
```

### Flow Execution

```python
class CampaignSetupFlow(Flow[CampaignSetupState]):

    @start()
    def receive_campaign_request(self, natural_language_query: str):
        # Parse NL query and create strategy
        ...

    @listen(receive_campaign_request)
    def build_campaigns(self):
        # Build campaigns from strategy
        ...

    @listen(build_campaigns)
    def verify_campaigns(self):
        # Verify and QA check
        ...
```

### Agent Creation

```python
def create_campaign_strategist(tools: List[Tool], llm_model: str) -> Agent:
    return Agent(
        role="Campaign Strategist",
        goal="Parse natural language campaign requests...",
        backstory="""Expert at parsing NL queries like:
        - "Create 10 holiday campaigns with $5000 budget each"
        - Extracts count, budget, theme, naming patterns
        """,
        tools=tools,
        llm=ChatOpenAI(model=llm_model, temperature=0.3)
    )
```

## Natural Language Parsing Examples

| NL Query | Extracted Parameters |
|----------|---------------------|
| "Create 10 holiday campaigns with $5000 budget each" | count=10, budget_per=5000, theme="holiday" |
| "Set up 5 campaigns for Black Friday with total budget of $25000" | count=5, total_budget=25000, theme="Black Friday" |
| "Create 3 campaigns for new product launch" | count=3, budget_per=5000 (default), theme="new product launch" |
| "Launch 7 campaigns for Valentine's Day promotion with $3000 each" | count=7, budget_per=3000, theme="Valentine's Day promotion" |

## File Structure

```
agents/crewai-flows/
├── agents/
│   └── campaign_setup_agents.py          # 3 agent definitions
├── tasks/
│   └── campaign_setup_tasks.py           # 3 task functions
├── flows/
│   └── campaign_setup_flow.py            # Flow with @start/@listen decorators
├── examples/
│   └── run_campaign_setup.py             # 4 example NL queries
├── tests/
│   └── test_campaign_setup.py            # Test suite
├── shared/
│   └── mcp_tools.py                      # MCP tool wrappers (existing)
├── CAMPAIGN_SETUP_README.md              # Detailed documentation
├── QUICK_START.md                        # Quick start guide
└── CAMPAIGN_SETUP_IMPLEMENTATION.md      # This file
```

## MCP Tools Used

From `shared/mcp_tools.py`:

**Campaign Strategist:**
- `find_organizations` - Research org IDs
- `find_campaigns` - Check existing campaigns

**Campaign Builder:**
- `create_campaign` - Create campaigns
- `create_strategy` - Create strategies
- `get_campaign_info` - Verify creation

**QA Specialist:**
- `get_campaign_info` - Validate campaigns
- `find_campaigns` - List all campaigns
- `get_strategy_info` - Verify strategies

## Dependencies

Defined in `requirements.txt` (in parent directory):
- `crewai` - CrewAI framework
- `langchain` - LangChain tools
- `langchain-openai` - OpenAI integration
- `pydantic` - State management
- `requests` - HTTP client for MCP

## Configuration

**Environment Variables:**
```bash
OPENAI_API_KEY=sk-...         # Required
OPENAI_MODEL=gpt-4-turbo      # Optional (default provided)
MCP_SERVER_URL=https://...    # Optional (default provided)
```

**Defaults in Code:**
- Organization ID: 100048
- Default budget: $5000 per campaign
- MCP Server: `https://mediamath-mcp-mock-two.vercel.app/api/message`
- LLM: gpt-4-turbo

## Output Format

```json
{
  "query": "Create 10 holiday campaigns with $5000 budget each",
  "strategy": {
    "raw_output": "Campaign Strategy Document..."
  },
  "implementation": {
    "raw_output": "Implementation Report with campaign IDs..."
  },
  "qa_report": {
    "raw_output": "QA Report: PASS/FAIL with validation results..."
  }
}
```

## Testing

```bash
# Run all tests
pytest tests/test_campaign_setup.py -v

# Run specific test
pytest tests/test_campaign_setup.py::TestCampaignSetupFlow::test_flow_initialization

# Run with coverage
pytest tests/test_campaign_setup.py --cov=flows --cov-report=html
```

## Documentation

1. **CAMPAIGN_SETUP_README.md** - Full documentation with architecture diagrams
2. **QUICK_START.md** - 1-minute setup guide
3. **CAMPAIGN_SETUP_IMPLEMENTATION.md** - This implementation summary
4. **Reference**: `/docs/CREWAI_IMPLEMENTATION_GUIDE.md` - Overall CrewAI guide

## Next Steps (Optional Enhancements)

1. Add more NL patterns (dates, targeting, creative specs)
2. Implement retry logic for failed campaigns
3. Add budget validation before creation
4. Support A/B test campaign creation
5. Add campaign scheduling from NL dates
6. Implement campaign cloning via NL

## Usage Example

```python
# Install dependencies
pip install -r requirements.txt

# Set API key
export OPENAI_API_KEY=sk-your-key

# Run example
cd agents/crewai-flows
python examples/run_campaign_setup.py 1

# Or use in code
from flows.campaign_setup_flow import execute_campaign_setup_flow

result = execute_campaign_setup_flow(
    "Create 10 holiday campaigns with $5000 budget each"
)
```

## Summary

Successfully implemented a complete Campaign Setup Flow that:

✅ Accepts natural language queries (no JSON required)  
✅ Uses 3 specialized agents (Strategist, Builder, QA)  
✅ Implements 3 sequential tasks (Parse, Build, Verify)  
✅ Uses CrewAI Flow with @start/@listen decorators  
✅ Manages state with Pydantic models  
✅ Integrates with MCP tools from shared/mcp_tools.py  
✅ Includes 4 example scenarios  
✅ Has comprehensive test suite  
✅ Fully documented with README and Quick Start  

**Ready to use!** Just set OPENAI_API_KEY and run.
