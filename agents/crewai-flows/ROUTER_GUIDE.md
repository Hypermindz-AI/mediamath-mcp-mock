# Flow Router Guide

Comprehensive documentation for the intelligent FlowRouter system in CrewAI Flows.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Classification Algorithm](#classification-algorithm)
- [Usage Examples](#usage-examples)
- [Adding New Flows](#adding-new-flows)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Overview

The **FlowRouter** is an intelligent routing system that automatically classifies natural language queries and routes them to the appropriate CrewAI flow. It eliminates the need for users to manually select flows, providing a seamless natural language interface for campaign management.

### Key Features

1. **LLM-based Classification** - Uses GPT-4 for accurate intent understanding
2. **Keyword Fallback** - Robust fallback using keyword matching
3. **Confidence Scoring** - Provides transparency in routing decisions
4. **Automatic Execution** - Seamlessly executes the selected flow
5. **Extensible Design** - Easy to add new flows and classification patterns

### Supported Flows

| Flow Name | Purpose | Example Query |
|-----------|---------|---------------|
| `campaign_setup_flow` | Creating new campaigns | "Create 10 campaigns for Black Friday" |
| `optimization_flow` | Optimizing campaign performance | "Pause underperforming campaigns" |
| `analytics_flow` | Generating reports and insights | "Generate performance report" |
| `compliance_flow` | Auditing users and permissions | "Audit user permissions" |
| `creative_flow` | Managing creative assets | "Find creatives needing refresh" |

## Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         User Query                          │
│            "Create 10 campaigns for Black Friday"           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                      FlowRouter                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  1. classify_intent(query)                             │ │
│  │     - LLM Classification (GPT-4)                       │ │
│  │     - Fallback: Keyword Matching                       │ │
│  │     - Returns: (flow_name, confidence)                 │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  2. route(query)                                       │ │
│  │     - Get flow classification                          │ │
│  │     - Lookup flow information                          │ │
│  │     - Returns: routing_result                          │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  3. execute_flow(query)                                │ │
│  │     - Route query                                      │ │
│  │     - Import selected flow                             │ │
│  │     - Execute flow with query                          │ │
│  │     - Returns: {routing, result, success}              │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│               Selected Flow Execution                       │
│  ┌──────────────┬──────────────┬──────────────────────┐    │
│  │ Campaign     │ Optimization │ Analytics  │ ...     │    │
│  │ Setup Flow   │ Flow         │ Flow       │         │    │
│  └──────────────┴──────────────┴────────────┴─────────┘    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Flow Result                              │
└─────────────────────────────────────────────────────────────┘
```

### Class Structure

```python
class FlowRouter:
    """
    Main router class

    Attributes:
        client: OpenAI client for LLM calls
        FLOW_PATTERNS: Dict of flow classification patterns

    Methods:
        classify_intent(query) -> Tuple[str, float]
        route(query) -> Dict[str, Any]
        execute_flow(query) -> Dict[str, Any]
        list_flows() -> Dict[str, Dict[str, Any]]
    """
```

## Classification Algorithm

### Two-Stage Classification

The router uses a two-stage classification approach:

#### Stage 1: LLM-based Classification (Primary)

```python
def classify_intent(self, query: str) -> Tuple[str, float]:
    """
    1. Build classification prompt with flow descriptions
    2. Send to GPT-4 with temperature=0.1 (deterministic)
    3. Parse JSON response with flow name and confidence
    4. Validate flow name against FLOW_PATTERNS
    5. Return (flow_name, confidence)

    On error: Fall back to Stage 2
    """
```

**Advantages:**
- High accuracy for complex queries
- Understands intent beyond keywords
- Handles variations and synonyms
- Context-aware classification

**Example:**
```python
Query: "I need to set up a bunch of new campaigns for the holiday season"
LLM Result: ("campaign_setup_flow", 0.95)
Reasoning: "Query expresses intent to create new campaigns"
```

#### Stage 2: Keyword-based Classification (Fallback)

```python
def _fallback_classification(self, query: str) -> Tuple[str, float]:
    """
    1. Convert query to lowercase
    2. Count keyword matches for each flow
    3. Select flow with highest match count
    4. Calculate confidence = min(matches / 3.0, 1.0)
    5. Return (flow_name, confidence)
    """
```

**Advantages:**
- Deterministic and fast
- No API calls required
- Reliable for keyword-heavy queries
- No dependency on external services

**Example:**
```python
Query: "create new campaigns"
Keyword matches:
  - campaign_setup_flow: 2 matches ("create", "campaigns")
  - optimization_flow: 0 matches
  - analytics_flow: 0 matches
Result: ("campaign_setup_flow", 0.67)
```

### Classification Patterns

Each flow has a classification pattern with:

```python
{
    "flow_name": {
        "keywords": [list of keywords],
        "description": "Brief description",
        "examples": [list of example queries]
    }
}
```

#### Campaign Setup Flow

**Keywords:**
- Primary: `create`, `launch`, `set up`, `new campaigns`, `bulk create`
- Secondary: `build`, `setup`, `establish`

**Example Queries:**
- "Create 10 holiday campaigns with $5000 budget each"
- "Launch new campaigns for Q4"
- "Set up 5 campaigns targeting millennials"

#### Optimization Flow

**Keywords:**
- Primary: `pause`, `optimize`, `adjust`, `improve`, `reduce spend`
- Secondary: `underperforming`, `increase performance`, `scale`, `bid adjustment`

**Example Queries:**
- "Pause all underperforming campaigns"
- "Optimize campaigns with high CPA"
- "Adjust bids for better performance"

#### Analytics Flow

**Keywords:**
- Primary: `report`, `analyze`, `show`, `performance`, `metrics`
- Secondary: `budget utilization`, `dashboard`, `statistics`, `insights`, `data`

**Example Queries:**
- "Generate performance report for all campaigns"
- "Analyze campaign metrics for last 30 days"
- "Show budget utilization dashboard"

#### Compliance Flow

**Keywords:**
- Primary: `audit`, `permissions`, `access`, `security`, `compliance`
- Secondary: `users`, `roles`, `governance`, `violation`

**Example Queries:**
- "Audit all user permissions for security review"
- "Check for compliance violations"
- "Review user access patterns"

#### Creative Flow

**Keywords:**
- Primary: `creative`, `refresh`, `fatigue`, `assets`, `ads`
- Secondary: `banner`, `image`, `video`, `copy`

**Example Queries:**
- "Find all creatives that need refresh"
- "Analyze creative fatigue across campaigns"
- "Identify underperforming ad creatives"

## Usage Examples

### Basic Usage

```python
from router.flow_router import FlowRouter

# Initialize router
router = FlowRouter()

# Route a query
result = router.route("Create 10 campaigns for Black Friday")

print(f"Flow: {result['flow_name']}")
print(f"Confidence: {result['confidence']}")
print(f"Description: {result['flow_info']['description']}")
```

Output:
```
Flow: campaign_setup_flow
Confidence: 0.95
Description: Creating new campaigns, bulk campaign creation
```

### Execute Flow Automatically

```python
# Route and execute in one call
result = router.execute_flow("Pause underperforming campaigns")

if result["success"]:
    print("Execution successful!")
    print(f"Routed to: {result['routing']['flow_name']}")
    print(f"Result: {result['result']}")
else:
    print(f"Error: {result['error']}")
```

### List Available Flows

```python
flows = router.list_flows()

for flow_name, info in flows.items():
    print(f"\n{flow_name}")
    print(f"  Description: {info['description']}")
    print(f"  Keywords: {', '.join(info['keywords'][:5])}")
    print(f"  Example: {info['examples'][0]}")
```

### Classify Without Execution

```python
# Just get the classification
flow_name, confidence = router.classify_intent("Generate performance report")

print(f"Classified as: {flow_name}")
print(f"Confidence: {confidence:.2f}")

if confidence < 0.7:
    print("Warning: Low confidence classification")
```

## Adding New Flows

To add a new flow to the router:

### Step 1: Create the Flow Implementation

Create your flow in `flows/your_flow.py`:

```python
from crewai.flow.flow import Flow, listen, start

class YourFlow(Flow):
    @start()
    def kickoff(self, query: str):
        # Your flow implementation
        pass

def run_your_flow(query: str):
    flow = YourFlow()
    return flow.kickoff(query)
```

### Step 2: Add Flow Pattern to Router

Edit `router/flow_router.py` and add to `FLOW_PATTERNS`:

```python
FLOW_PATTERNS = {
    # ... existing flows ...

    "your_flow": {
        "keywords": [
            "keyword1", "keyword2", "keyword3",
            "phrase keyword", "another phrase"
        ],
        "description": "Brief description of what this flow does",
        "examples": [
            "Example query 1",
            "Example query 2",
            "Example query 3"
        ]
    }
}
```

### Step 3: Add Flow Import in execute_flow

Edit the `execute_flow` method in `router/flow_router.py`:

```python
def execute_flow(self, query: str) -> Dict[str, Any]:
    routing_result = self.route(query)
    flow_name = routing_result["flow_name"]

    try:
        # ... existing flow imports ...

        elif flow_name == "your_flow":
            from flows.your_flow import run_your_flow
            flow_result = run_your_flow(query)

        # ... rest of implementation ...
```

### Step 4: Add Tests

Create tests in `tests/test_your_flow.py`:

```python
def test_classification_your_flow(router):
    queries = [
        "query that should match your flow",
        "another matching query"
    ]

    for query in queries:
        flow, confidence = router._fallback_classification(query)
        assert flow == "your_flow"
        assert confidence > 0.0
```

### Step 5: Update Documentation

Update `README.md` and this guide with:
- Flow description in Overview section
- Example queries in Usage section
- Any special considerations

## Configuration

### Environment Variables

The router requires:

```bash
# Required
OPENAI_API_KEY=your_openai_api_key

# Optional (for flow execution)
MCP_SERVER_URL=https://mediamath-mcp-mock-two.vercel.app/api/message
MCP_API_KEY=your_mcp_api_key
```

### LLM Configuration

The router uses GPT-4 with these settings:

```python
response = self.client.chat.completions.create(
    model="gpt-4",              # Can be changed to gpt-4-turbo, etc.
    temperature=0.1,            # Low for deterministic classification
    max_tokens=200              # Sufficient for classification response
)
```

To use a different model:

```python
router = FlowRouter()
router.model = "gpt-4-turbo"  # or "gpt-3.5-turbo"
```

### Adjusting Confidence Thresholds

The fallback classification uses this formula:

```python
confidence = min(keyword_matches / 3.0, 1.0)
```

To adjust the threshold:

```python
# In _fallback_classification method
confidence = min(keyword_matches / 5.0, 1.0)  # Stricter threshold
```

## Troubleshooting

### Issue: Low Classification Accuracy

**Symptoms:**
- Queries being routed to wrong flow
- Confidence scores below 0.5

**Solutions:**

1. **Add more keywords** to the flow pattern:
```python
"keywords": [
    "existing keywords...",
    "new keyword 1",
    "new keyword 2"
]
```

2. **Add example queries** to help LLM understand intent:
```python
"examples": [
    "Specific example matching this flow",
    "Another clear example"
]
```

3. **Check query phrasing** - ensure queries match expected patterns

### Issue: LLM Classification Failing

**Symptoms:**
- Error messages about API calls
- Fallback classification being used frequently

**Solutions:**

1. **Check API key** is valid:
```bash
echo $OPENAI_API_KEY
```

2. **Verify API quota** and rate limits

3. **Check network connectivity**:
```bash
curl https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY"
```

4. **Review error logs** in router output

### Issue: Wrong Flow Being Selected

**Symptoms:**
- Router selects unexpected flow
- Query could match multiple flows

**Solutions:**

1. **Make keywords more specific** to reduce overlap

2. **Add negative keywords** to exclude certain patterns

3. **Adjust query phrasing** to be more explicit:
   - Bad: "show campaigns"
   - Good: "generate performance report for campaigns"

4. **Use direct flow execution** if router is unreliable:
```python
from flows.specific_flow import run_specific_flow
result = run_specific_flow(query)
```

### Issue: Slow Response Times

**Symptoms:**
- Router takes >5 seconds to classify
- Noticeable delay before flow execution

**Solutions:**

1. **Use keyword-only mode** by catching LLM errors:
```python
def classify_intent(self, query: str):
    # Skip LLM, use fallback directly
    return self._fallback_classification(query)
```

2. **Switch to faster model**:
```python
model="gpt-3.5-turbo"  # Faster than gpt-4
```

3. **Cache classifications** for repeated queries

4. **Use async execution** for non-blocking calls

## Best Practices

### Query Writing

**DO:**
- Be specific about intent: "Create 10 campaigns" not "campaigns"
- Use action verbs: "pause", "create", "analyze", "audit"
- Include key objects: "campaigns", "creatives", "users", "reports"

**DON'T:**
- Be too vague: "show me stuff"
- Mix multiple intents: "create and optimize campaigns"
- Use ambiguous terms: "fix things"

### Classification Confidence

| Confidence Range | Interpretation | Action |
|-----------------|----------------|--------|
| 0.9 - 1.0 | Very high confidence | Proceed automatically |
| 0.7 - 0.9 | High confidence | Proceed with logging |
| 0.5 - 0.7 | Moderate confidence | Warn user, ask confirmation |
| 0.3 - 0.5 | Low confidence | Show alternatives, ask user |
| 0.0 - 0.3 | Very low confidence | Request clarification |

### Error Handling

Always handle router errors gracefully:

```python
try:
    result = router.execute_flow(query)
    if result["success"]:
        # Handle success
        pass
    else:
        # Handle flow execution error
        print(f"Flow error: {result['error']}")
except Exception as e:
    # Handle router error
    print(f"Router error: {e}")
    # Fallback to manual flow selection
```

### Performance Optimization

1. **Reuse router instance** instead of creating new ones
2. **Batch similar queries** for efficiency
3. **Cache flow patterns** if modified dynamically
4. **Use async/await** for concurrent operations
5. **Monitor API usage** to avoid rate limits

### Testing

Always test new flows and patterns:

```python
# Test classification
test_queries = [
    ("create campaigns", "campaign_setup_flow"),
    ("pause campaigns", "optimization_flow"),
    # ... more test cases
]

for query, expected_flow in test_queries:
    flow, confidence = router.classify_intent(query)
    assert flow == expected_flow, f"Expected {expected_flow}, got {flow}"
    print(f"✓ '{query}' -> {flow} (confidence: {confidence:.2f})")
```

### Monitoring

Log routing decisions for analysis:

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("flow_router")

# In router.route()
logger.info(f"Query: {query}")
logger.info(f"Classification: {flow_name} (confidence: {confidence})")
logger.info(f"Method: {'LLM' if used_llm else 'Keyword'}")
```

## Advanced Topics

### Custom Classification Logic

Override classification for specific patterns:

```python
class CustomFlowRouter(FlowRouter):
    def classify_intent(self, query: str):
        # Custom pre-processing
        if "urgent" in query.lower():
            return ("optimization_flow", 1.0)

        # Use default classification
        return super().classify_intent(query)
```

### Multi-Flow Execution

Execute multiple flows in sequence:

```python
def execute_workflow(queries: List[str]):
    router = FlowRouter()
    results = []

    for query in queries:
        result = router.execute_flow(query)
        results.append(result)

        if not result["success"]:
            print(f"Workflow stopped at: {query}")
            break

    return results
```

### A/B Testing Classifications

Compare LLM vs keyword classification:

```python
def compare_classifications(query: str):
    # LLM classification
    llm_flow, llm_conf = router.classify_intent(query)

    # Keyword classification
    kw_flow, kw_conf = router._fallback_classification(query)

    print(f"LLM: {llm_flow} ({llm_conf:.2f})")
    print(f"Keyword: {kw_flow} ({kw_conf:.2f})")
    print(f"Agreement: {llm_flow == kw_flow}")
```

## References

- [CrewAI Flows Documentation](https://docs.crewai.com/concepts/flows)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [Main README](./README.md)
- [Implementation Checklist](./IMPLEMENTATION_CHECKLIST.md)

## Support

For issues or questions:

1. Check this guide first
2. Review test cases in `tests/test_router.py`
3. Check logs for error messages
4. Contact HyperMindz AI Engineering Team

## License

MIT License - See main README for details.
