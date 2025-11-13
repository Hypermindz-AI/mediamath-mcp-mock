# Optimization Flow - Quick Start Guide

## 5-Minute Setup

### 1. Install Dependencies

```bash
cd /Users/dineshbhat/sandbox/hypermindz/mediamath-mcp-mock/agents/crewai-flows

# Option A: Use uv (recommended)
uv venv
source .venv/bin/activate
uv pip install -r requirements.txt

# Option B: Use pip
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Set Environment Variable

```bash
export OPENAI_API_KEY="sk-your-key-here"
```

### 3. Run Example

```bash
python examples/run_optimization.py
```

## Basic Usage

```python
from flows.optimization_flow import run_optimization_flow

# Run with natural language query
result = run_optimization_flow(
    nl_query="Pause all underperforming strategies with CTR < 0.5%",
    organization_id=100048
)

# Print results
print(result['performance_analysis'])
print(result['optimization_decisions'])
print(result['execution_results'])
```

## Example Queries

```python
# Pause underperformers
run_optimization_flow("Pause strategies with CTR < 0.5%")

# Budget optimization
run_optimization_flow("Optimize campaign budgets based on performance")

# Cost control
run_optimization_flow("Reduce spend on strategies with CPC > $2.50")

# Complex criteria
run_optimization_flow(
    "Pause strategies with low engagement (CTR < 0.3%) "
    "that have spent more than $1000"
)
```

## File Locations

| Component | File Path |
|-----------|-----------|
| Agents | `agents/agent_definitions.py` |
| Tasks | `tasks/task_definitions.py` |
| Flow | `flows/optimization_flow.py` |
| Tools | `shared/mcp_tools.py` |
| Example | `examples/run_optimization.py` |
| Tests | `tests/test_optimization.py` |

## Testing

```bash
# Run all tests
pytest tests/test_optimization.py -v

# Run specific test
pytest tests/test_optimization.py::TestOptimizationFlow::test_agent_creation -v
```

## Architecture

```
Natural Language Query
        ↓
@start: receive_query
        ↓
@listen: analyze_performance  (Performance Analyzer + MCP read tools)
        ↓
@listen: make_decisions        (Decision Maker + business logic)
        ↓
@listen: execute_optimizations (Execution Agent + MCP write tools)
        ↓
@listen: generate_report       (Final report compilation)
```

## MCP Tools Used

**Read Operations** (Performance Analyzer):
- `find_campaigns` - Get all campaigns
- `get_campaign_info` - Campaign details & metrics
- `find_strategies` - Get strategies
- `get_strategy_info` - Strategy details & metrics

**Write Operations** (Execution Agent):
- `update_campaign` - Update campaign properties
- `update_strategy` - Update strategy properties
- `update_campaign_budget` - Update budget

## Troubleshooting

```bash
# Check if crewai is installed
python -c "import crewai; print(crewai.__version__)"

# Check if MCP server is reachable
curl https://mediamath-mcp-mock-two.vercel.app/api/message

# Verify environment variable
echo $OPENAI_API_KEY
```

## Next Steps

1. ✅ Run the example script
2. ✅ Try different natural language queries
3. ✅ Review the generated reports
4. ✅ Run the tests
5. ✅ Read OPTIMIZATION_FLOW_SUMMARY.md for details
6. ✅ Customize for your use case

## Support

- **Full Documentation**: `OPTIMIZATION_FLOW_SUMMARY.md`
- **Main README**: `README.md`
- **CrewAI Docs**: https://docs.crewai.com/concepts/flows
- **Implementation Guide**: `/docs/CREWAI_IMPLEMENTATION_GUIDE.md`
