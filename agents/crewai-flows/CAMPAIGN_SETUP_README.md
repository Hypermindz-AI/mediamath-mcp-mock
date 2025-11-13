# Campaign Setup Flow - Natural Language Interface

## Overview

The Campaign Setup Flow is a CrewAI Flow implementation that accepts **natural language queries** for campaign creation and orchestrates 3 specialized agents to parse, build, and verify campaigns using the MediaMath MCP server.

## Key Features

- **Natural Language Input**: Accepts plain English campaign requests
- **3-Agent Pipeline**: Strategist → Builder → QA Specialist
- **MCP Tool Integration**: Uses MediaMath MCP tools for campaign operations
- **State Management**: Pydantic-based state tracking across flow phases
- **Comprehensive QA**: Built-in verification before campaign launch

## Natural Language Query Examples

```python
# Example 1: Budget per campaign
"Create 10 holiday campaigns with $5000 budget each"

# Example 2: Total budget to split
"Set up 5 campaigns for Black Friday with total budget of $25000"

# Example 3: Minimal query (uses defaults)
"Create 3 campaigns for new product launch"

# Example 4: With theme/purpose
"Launch 7 campaigns for Valentine's Day promotion with $3000 each"
```

## Architecture

### Flow Phases

```
┌─────────────────────────────────────────────────────────┐
│  INPUT: Natural Language Query                          │
│  "Create 10 holiday campaigns with $5000 budget each"   │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  PHASE 1: Parse & Plan                                  │
│  Agent: Campaign Strategist                             │
│  - Extract parameters (count, budget, theme)            │
│  - Generate campaign names                              │
│  - Create structured strategy                           │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  PHASE 2: Build Campaigns                               │
│  Agent: Campaign Builder                                │
│  - Create campaigns one-by-one via MCP                  │
│  - Create default strategies                            │
│  - Track all IDs and status                             │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  PHASE 3: QA Verification                               │
│  Agent: QA Specialist                                   │
│  - Verify each campaign exists                          │
│  - Validate budgets and configs                         │
│  - Generate PASS/FAIL report                            │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  OUTPUT: Complete Flow Result                           │
│  - Strategy document                                    │
│  - Implementation report with IDs                       │
│  - QA report with launch readiness                      │
└─────────────────────────────────────────────────────────┘
```

### Agents

#### 1. Campaign Strategist
- **Role**: Parse NL queries and create campaign strategies
- **Tools**: `find_organizations`, `find_campaigns`
- **Responsibilities**:
  - Extract campaign count, budget, theme from NL query
  - Handle different budget formats (per campaign vs total)
  - Generate meaningful campaign names if not specified
  - Create structured strategy document

#### 2. Campaign Builder
- **Role**: Execute campaign creation
- **Tools**: `create_campaign`, `create_strategy`, `get_campaign_info`
- **Responsibilities**:
  - Create campaigns sequentially (one at a time)
  - Use exact names and budgets from strategy
  - Create default strategy for each campaign
  - Track all created IDs and errors

#### 3. QA Specialist
- **Role**: Verify campaign configurations
- **Tools**: `get_campaign_info`, `find_campaigns`, `get_strategy_info`
- **Responsibilities**:
  - Verify each campaign was created successfully
  - Validate budgets match strategy
  - Check campaign names and settings
  - Generate PASS/FAIL QA report

## File Structure

```
agents/crewai-flows/
├── agents/
│   └── campaign_setup_agents.py       # Agent definitions
├── tasks/
│   └── campaign_setup_tasks.py        # Task definitions
├── flows/
│   └── campaign_setup_flow.py         # Main Flow implementation
├── examples/
│   └── run_campaign_setup.py          # Example usage
├── tests/
│   └── test_campaign_setup.py         # Tests
├── shared/
│   └── mcp_tools.py                   # MCP tool wrappers
└── CAMPAIGN_SETUP_README.md           # This file
```

## Usage

### Basic Usage

```python
from flows.campaign_setup_flow import execute_campaign_setup_flow

# Single NL query
query = "Create 10 holiday campaigns with $5000 budget each"
result = execute_campaign_setup_flow(query)

print(result)
```

### Running Examples

```bash
# Run default example
cd agents/crewai-flows
python examples/run_campaign_setup.py

# Run specific example
python examples/run_campaign_setup.py 1  # Budget per campaign
python examples/run_campaign_setup.py 2  # Total budget
python examples/run_campaign_setup.py 3  # Minimal query
python examples/run_campaign_setup.py 4  # With theme

# Run all examples
python examples/run_campaign_setup.py all
```

### Running Tests

```bash
cd agents/crewai-flows
pytest tests/test_campaign_setup.py -v

# Run specific test
pytest tests/test_campaign_setup.py::TestCampaignSetupFlow::test_flow_initialization -v

# Run with coverage
pytest tests/test_campaign_setup.py --cov=flows --cov-report=html
```

## Flow State

The flow maintains state using a Pydantic model:

```python
class CampaignSetupState(BaseModel):
    natural_language_query: str = ""
    campaign_strategy: Dict[str, Any] = {}
    implementation_report: Dict[str, Any] = {}
    qa_report: Dict[str, Any] = {}
    final_result: Dict[str, Any] = {}
```

## Output Format

The flow returns a comprehensive result:

```json
{
  "query": "Create 10 holiday campaigns with $5000 budget each",
  "strategy": {
    "campaign_count": 10,
    "campaign_names": ["Holiday Campaign 1", "Holiday Campaign 2", ...],
    "budget_per_campaign": 5000.00,
    "total_budget": 50000.00,
    "organization_id": 100048
  },
  "implementation": {
    "created_campaigns": [
      {"campaign_id": 1001, "name": "Holiday Campaign 1", "budget": 5000, "status": "success"},
      ...
    ],
    "summary": {
      "total_attempted": 10,
      "successful": 10,
      "failed": 0
    }
  },
  "qa_report": {
    "overall_status": "PASS",
    "launch_ready": true,
    "campaigns_validated": 10,
    "validation_results": [...]
  }
}
```

## Configuration

### Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-...

# Optional (defaults provided)
OPENAI_MODEL=gpt-4-turbo
MCP_SERVER_URL=https://mediamath-mcp-mock-two.vercel.app/api/message
```

### MCP Server

The flow uses the MediaMath MCP Mock Server. Default URL:
```
https://mediamath-mcp-mock-two.vercel.app/api/message
```

## Error Handling

The flow handles errors gracefully:

1. **Strategy Phase Errors**: If NL parsing fails, returns error in strategy
2. **Build Phase Errors**: Continues creating remaining campaigns if one fails
3. **QA Phase Errors**: Reports failed validations but doesn't crash

## Natural Language Parsing

The Campaign Strategist agent can extract:

| Parameter | NL Patterns | Example |
|-----------|-------------|---------|
| Count | "10 campaigns", "5 campaigns" | "Create **10** holiday campaigns" |
| Budget (each) | "$5000 budget each", "$2000 per campaign" | "with **$5000 budget each**" |
| Budget (total) | "total budget of $25000", "$25000 total" | "**total budget of $25000**" |
| Theme | "holiday", "Black Friday", "Valentine's Day" | "Create 10 **holiday** campaigns" |

## Best Practices

1. **Be Specific**: Include count and budget in query
2. **Use Clear Themes**: Help the agent generate meaningful names
3. **Check QA Report**: Always verify the qa_report before launching
4. **Handle Errors**: Check implementation.summary.failed > 0

## Troubleshooting

### Issue: "OpenAI API key not set"
**Solution**: Set `OPENAI_API_KEY` environment variable

### Issue: "MCP Error: Connection refused"
**Solution**: Check MCP_SERVER_URL is accessible

### Issue: "Campaigns created but QA fails"
**Solution**: Review qa_report.validation_results for specific issues

## Implementation References

- **CrewAI Documentation**: https://docs.crewai.com/
- **CrewAI Flows**: https://docs.crewai.com/concepts/flows
- **MCP Implementation Guide**: `/docs/CREWAI_IMPLEMENTATION_GUIDE.md`

## Next Steps

1. Add support for more NL query patterns
2. Implement retry logic for failed campaigns
3. Add budget validation before creation
4. Support targeting parameters in NL
5. Add campaign scheduling from NL dates

## Contributing

When adding features:
1. Update agent backstories for new capabilities
2. Extend task descriptions for new parameters
3. Add examples for new NL patterns
4. Write tests for new functionality
5. Update this README

## License

Internal HyperMindz tool - Not for external distribution
