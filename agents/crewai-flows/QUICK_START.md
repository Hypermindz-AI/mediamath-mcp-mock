# Campaign Setup Flow - Quick Start Guide

## 1-Minute Setup

### Install Dependencies
```bash
cd agents/crewai-flows
pip install -r requirements.txt
```

### Set API Key
```bash
export OPENAI_API_KEY=sk-your-key-here
```

### Run Example
```python
from flows.campaign_setup_flow import execute_campaign_setup_flow

result = execute_campaign_setup_flow(
    "Create 10 holiday campaigns with $5000 budget each"
)
```

## Quick Examples

### Example 1: Budget Per Campaign
```python
execute_campaign_setup_flow(
    "Create 10 holiday campaigns with $5000 budget each"
)
```

### Example 2: Total Budget Split
```python
execute_campaign_setup_flow(
    "Set up 5 campaigns for Black Friday with total budget of $25000"
)
```

### Example 3: Minimal (Uses Defaults)
```python
execute_campaign_setup_flow(
    "Create 3 campaigns for new product launch"
)
```

## Command Line Usage

```bash
# Run example script
python examples/run_campaign_setup.py

# Run specific example
python examples/run_campaign_setup.py 1

# Run all examples
python examples/run_campaign_setup.py all
```

## Test It

```bash
pytest tests/test_campaign_setup.py -v
```

## What Happens?

1. **Campaign Strategist** parses your NL query
2. **Campaign Builder** creates campaigns via MCP
3. **QA Specialist** verifies everything works

## Output

```json
{
  "query": "Your NL query",
  "strategy": {...},           // Parsed strategy
  "implementation": {...},     // Created campaign IDs
  "qa_report": {...}          // Verification results
}
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| No OPENAI_API_KEY | `export OPENAI_API_KEY=sk-...` |
| MCP connection error | Check MCP server URL |
| Import errors | `pip install -r requirements.txt` |

## Next Steps

- Read [CAMPAIGN_SETUP_README.md](./CAMPAIGN_SETUP_README.md) for details
- Review [/docs/CREWAI_IMPLEMENTATION_GUIDE.md](../../docs/CREWAI_IMPLEMENTATION_GUIDE.md)
- Customize agents in `agents/campaign_setup_agents.py`
- Add more examples to `examples/run_campaign_setup.py`
