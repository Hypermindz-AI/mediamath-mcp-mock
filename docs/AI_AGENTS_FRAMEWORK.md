# MediaMath MCP Mock Server: AI Agent Framework Design

## Executive Summary

This document outlines a comprehensive AI agent framework for the MediaMath MCP Mock Server, covering 6 industry roles, 25+ user stories, 10 detailed workflows, and 5 agent architecture proposals.

**Key Metrics:**
- **28 MCP Tools** available across 8 categories
- **6 Industry Roles** identified with specific pain points
- **80% efficiency gain** potential through automation
- **3-5 AI agents** recommended for initial implementation

---

## Quick Start: Top 3 Agent Priorities

### 1. Campaign Setup Agent 🚀
**Impact**: 80% time reduction (30min → 5min)
**User Stories**: CM-1 (Bulk Setup), CM-3 (Templating), AE-4 (Onboarding)
**Tools**: campaign_create, strategy_create, find_advertisers
**Framework**: ReAct Agent

### 2. Optimization Agent 📊
**Impact**: 20% performance improvement
**User Stories**: MB-1 (Strategy Optimization), MB-3 (Bid Management)
**Tools**: find_strategies, strategy_update
**Framework**: Planning + Execution

### 3. Reporting Agent 📈
**Impact**: 96% time reduction (4hrs → 10min)
**User Stories**: DA-2 (Budget Reports), AE-1 (Portfolio Overview)
**Tools**: All get_*_info tools
**Framework**: Data Analysis Agent

---

## Available MCP Tools (28 Total)

### System (1)
- `healthcheck` - Server health and statistics

### Users (3)
- `find_user` - Search users
- `get_user_info` - User details
- `get_user_permissions` - Role permissions

### Campaigns (4)
- `find_campaigns` - Search campaigns
- `get_campaign_info` - Campaign details + strategies
- `campaign_create` - Create campaign
- `campaign_update` - Update campaign

### Strategies (4)
- `find_strategies` - Search strategies
- `get_strategy_info` - Strategy details
- `strategy_create` - Create strategy
- `strategy_update` - Update strategy

### Organizations (6)
- `find_organizations` - Search organizations
- `get_organization_info` - Org hierarchy
- `find_agencies` - Search agencies
- `get_agency_info` - Agency details
- `find_advertisers` - Search advertisers
- `get_advertiser_info` - Advertiser + campaigns

### Supply (4)
- `find_supply_sources` - Search exchanges/networks
- `get_supply_source_info` - Supply details
- `find_site_lists` - Whitelists/blacklists
- `get_site_list_info` - Site list details

### Creative (2)
- `find_concepts` - Search creative assets
- `get_concept_info` - Creative details

### Audience (1)
- `find_audience_segments` - Search targeting segments

---

## Industry Roles & Responsibilities

### 1. Campaign Manager
**Primary Focus**: Campaign lifecycle management
**Key Activities**: Setup, budgeting, scheduling, monitoring
**Pain Points**: Manual setup (30min/campaign), budget tracking, standardization
**Tools Most Used**: campaign_*, find_campaigns, get_campaign_info
**Permissions**: Manager or Admin

### 2. Media Buyer/Trader
**Primary Focus**: Daily optimization and inventory management
**Key Activities**: Bid management, strategy optimization, supply source selection
**Pain Points**: Frequent bid adjustments, complex supply management, strategy replication
**Tools Most Used**: strategy_*, find_supply_sources, site_lists
**Permissions**: Trader, Manager, or Admin

### 3. Data Analyst
**Primary Focus**: Performance analysis and insights
**Key Activities**: Reporting, benchmarking, trend identification
**Pain Points**: Manual data extraction, cross-campaign analysis, executive reporting
**Tools Most Used**: All find_* and get_*_info (read-only)
**Permissions**: Analyst (read-only)

### 4. Creative Operations Specialist
**Primary Focus**: Creative asset management
**Key Activities**: Asset organization, performance tracking, creative inventory
**Pain Points**: Tracking usage, identifying winners, creative rotation
**Tools Most Used**: find_concepts, get_concept_info, get_campaign_info
**Permissions**: Analyst or Trader

### 5. Account Executive
**Primary Focus**: Client relationships and planning
**Key Activities**: Portfolio management, client reporting, strategic planning
**Pain Points**: Consolidated views, report generation, demonstrating value
**Tools Most Used**: get_organization_info, get_advertiser_info, find_campaigns
**Permissions**: Manager or Admin

### 6. Operations Manager
**Primary Focus**: Platform administration
**Key Activities**: User management, compliance, system health
**Pain Points**: Manual user onboarding, permission audits, compliance enforcement
**Tools Most Used**: find_user, get_user_permissions, healthcheck, find_organizations
**Permissions**: Admin

---

## Top 10 User Stories

### Campaign Manager
**CM-1: Bulk Campaign Setup**
> As a Campaign Manager, I want to quickly set up multiple campaigns for a new advertiser so that I can launch faster and reduce manual errors.

**CM-2: Budget Monitoring**
> As a Campaign Manager, I want to monitor budget pacing across all my campaigns so that I can identify over/under-spending early.

### Media Buyer
**MB-1: Strategy Optimization**
> As a Media Buyer, I want to identify underperforming strategies across campaigns so that I can pause or adjust them quickly.

**MB-2: Supply Source Analysis**
> As a Media Buyer, I want to see which supply sources are performing best so that I can reallocate budget to high-performing exchanges.

### Data Analyst
**DA-1: Performance Benchmarking**
> As a Data Analyst, I want to compare campaign performance across different goal types so that I can identify which optimization strategies work best.

**DA-2: Budget Utilization Report**
> As a Data Analyst, I want to generate a report showing budget allocation and utilization across all campaigns so that I can identify optimization opportunities.

### Creative Ops
**CO-1: Creative Inventory**
> As a Creative Ops Specialist, I want to see all creative concepts for an advertiser so that I can maintain an organized creative library.

### Account Executive
**AE-1: Client Portfolio Overview**
> As an Account Executive, I want to see all campaigns and strategies for a specific advertiser so that I can prepare for client meetings efficiently.

**AE-3: Campaign Health Check**
> As an Account Executive, I want to identify campaigns with issues (inactive strategies, budget issues) so that I can proactively address problems with clients.

### Operations Manager
**OM-1: User Audit**
> As an Operations Manager, I want to see all users and their permissions across organizations so that I can ensure proper access control.

---

## Detailed Workflows

### Workflow 1: New Campaign Launch
**Role**: Campaign Manager
**User Story**: CM-1 - Bulk Campaign Setup
**Time Savings**: 30min → 5min (83% reduction)

**Steps**:
1. Verify advertiser exists: `find_advertisers`
2. Review existing campaigns: `get_advertiser_info`
3. Create campaign: `campaign_create`
4. Create display strategy: `strategy_create`
5. Create video strategy: `strategy_create`
6. Create native strategy: `strategy_create`
7. Verify setup: `get_campaign_info`

**Agent Required**: Campaign Setup Agent (ReAct)

---

### Workflow 2: Strategy Performance Optimization
**Role**: Media Buyer
**User Story**: MB-1 - Strategy Optimization
**Impact**: 20% performance improvement

**Steps**:
1. Get all active strategies: `find_strategies`
2. For each strategy, get details: `get_strategy_info`
3. Analyze performance vs goals (Agent logic)
4. Pause underperformers: `strategy_update`
5. Generate optimization report (Agent output)

**Agent Required**: Optimization Agent (Planning + Execution)

---

### Workflow 3: Budget Utilization Analysis
**Role**: Data Analyst
**User Story**: DA-2 - Budget Utilization Report
**Time Savings**: 4 hours → 10 minutes (96% reduction)

**Steps**:
1. Get organization structure: `get_organization_info`
2. For each advertiser, get campaigns: `get_advertiser_info`
3. For each campaign, get strategies: `get_campaign_info`
4. Aggregate budget data (Agent analysis)
5. Generate comprehensive report (Agent output)

**Agent Required**: Reporting & Analytics Agent

---

### Workflow 4: Campaign Health Check
**Role**: Account Executive
**User Story**: AE-3 - Campaign Health Check
**Value**: Proactive issue detection before client impact

**Steps**:
1. Get all advertisers in portfolio: `find_advertisers`
2. For each advertiser, get campaigns: `find_campaigns`
3. For each campaign, get details: `get_campaign_info`
4. Run health checks (Agent analysis):
   - No active strategies
   - Expiring soon (<7 days)
   - Budget fully spent
   - Low strategy diversity
   - Bid configuration errors
5. Generate prioritized issue report (Agent output)

**Agent Required**: Monitoring Agent (Event-driven)

---

### Workflow 5: User Permission Audit
**Role**: Operations Manager
**User Story**: OM-1 - User Audit
**Compliance**: 100% coverage

**Steps**:
1. Get all organizations: `find_organizations`
2. For each org, get users: `find_user`
3. For each user, get permissions: `get_user_permissions`
4. Analyze compliance (Agent analysis):
   - Excessive permissions
   - Insufficient permissions
   - Orphaned users
   - Role distribution
5. Generate audit report (Agent output)

**Agent Required**: Compliance & Governance Agent

---

## AI Agent Architectures

### Architecture 1: Role-Based Specialist Agents ⭐ RECOMMENDED

```
┌─────────────────────────────────────────┐
│      Coordinator (LangGraph)            │
│  - Intent classification                │
│  - Agent selection                      │
│  - State management                     │
└─────────────┬───────────────────────────┘
              │
    ┌─────────┼─────────┬─────────┬───────┐
    │         │         │         │       │
┌───▼───┐ ┌──▼───┐ ┌───▼────┐ ┌──▼───┐ ┌─▼──┐
│Setup  │ │Optim │ │Report  │ │Comply│ │Crea│
│Agent  │ │Agent │ │Agent   │ │Agent │ │tive│
└───────┘ └──────┘ └────────┘ └──────┘ └────┘
```

**Why This Works**:
- Clear separation of concerns
- Each agent is expert in its domain
- Coordinator handles complex routing
- Scalable and maintainable
- Easy to add new agents

**Implementation**:
- **Coordinator**: LangGraph (state machine + routing)
- **Agents**: CrewAI (task orchestration + tool integration)
- **Memory**: Redis/PostgreSQL
- **Monitoring**: LangSmith

---

### Agent 1: Campaign Setup Agent

**Type**: ReAct (Reasoning + Acting)
**Framework**: CrewAI or LangGraph
**Primary Users**: Campaign Managers, Account Executives

**Capabilities**:
- Campaign creation with optimal defaults
- Multi-strategy setup (display, video, mobile, native)
- Advertiser validation
- Campaign templating and cloning

**Tools Used**:
```python
tools = [
    "find_advertisers",
    "get_advertiser_info",
    "campaign_create",
    "campaign_update",
    "strategy_create",
    "get_campaign_info"  # verification
]
```

**Prompt Template**:
```
You are a Campaign Setup Specialist AI. Your role is to create
and configure campaigns efficiently based on user requirements.

Process:
1. Validate advertiser exists (find_advertisers)
2. Review existing campaigns (get_advertiser_info)
3. Calculate optimal budget allocation
4. Create campaign with proper configuration
5. Create strategies (display, video, mobile, native)
6. Verify setup completion (get_campaign_info)

Always provide:
- Summary of what was created
- Budget allocation breakdown
- Next steps for activation
```

**Success Metrics**:
- Setup time: 30min → 5min (83% reduction)
- Configuration errors: 0%
- User satisfaction: >90%

**Example Interaction**:
```
User: "Set up a campaign for Nike with $500K budget for summer"

Agent: "I'll create a comprehensive campaign for Nike's summer launch.

Step 1: Verifying Nike advertiser... ✓ Found (ID: 5001)
Step 2: Reviewing existing campaigns... ✓ No conflicts
Step 3: Creating campaign 'Nike Summer 2024'... ✓ Campaign ID: 10025
Step 4: Setting up strategies:
  - Display Desktop: $200K budget, $5 max bid ✓
  - Video Mobile: $150K budget, $10 max bid ✓
  - Native All Devices: $150K budget, $3.50 max bid ✓

✅ Campaign setup complete!

Summary:
- Campaign ID: 10025
- Total Budget: $500,000
- Flight Dates: 2024-06-01 to 2024-08-31
- 3 strategies created and ready for activation

Next Steps:
1. Assign creative concepts to each strategy
2. Configure audience targeting
3. Apply brand safety site lists
4. Activate strategies"
```

---

### Agent 2: Optimization Agent

**Type**: Planning + Execution
**Framework**: LangGraph with feedback loops
**Primary Users**: Media Buyers, Traders

**Capabilities**:
- Underperforming strategy detection
- Bid optimization recommendations
- Budget reallocation
- Supply source optimization

**Tools Used**:
```python
tools = [
    "find_strategies",
    "get_strategy_info",
    "get_campaign_info",  # context
    "strategy_update",    # execution
    "find_supply_sources"
]
```

**Prompt Template**:
```
You are a Media Buying Optimization AI. Your role is to maximize
campaign performance through data-driven optimization.

Analysis Process:
1. Gather all active strategies (find_strategies)
2. For each strategy, get performance context (get_strategy_info)
3. Calculate efficiency metrics based on goal_type:
   - CPA campaigns: Cost per acquisition
   - CTR campaigns: Click-through rate
   - CPC campaigns: Cost per click
   - Reach campaigns: Impression delivery
4. Identify optimization opportunities
5. Execute approved changes (strategy_update)
6. Monitor impact

Decision Criteria:
- Pause if: Spend >80% budget AND performance <50% of goal
- Reduce bid if: CPA/CPC >150% of target
- Increase bid if: Delivery <70% of goal AND budget available
- Reallocate if: 30%+ performance gap between strategies

Always explain rationale with supporting data.
```

**Success Metrics**:
- Performance improvement: +20%
- Manual optimization time: -90%
- Issue detection: <24 hours

**Example Interaction**:
```
User: "Optimize all my active strategies"

Agent: "Running comprehensive optimization analysis...

📊 Analysis Complete: 12 strategies reviewed

🔴 Critical Issues (3 strategies):
1. Strategy ID: 7001 (Display Desktop - Nike)
   - Spend: 85% ($42,500 / $50,000)
   - CPA: $45 (Target: $25) ⚠️ 80% over target
   - Recommendation: PAUSE - reallocate budget

2. Strategy ID: 7002 (Video Mobile - Nike)
   - Spend: 90% ($45,000 / $50,000)
   - CTR: 0.8% (Target: 2.0%) ⚠️ 60% below target
   - Recommendation: PAUSE - creative refresh needed

3. Strategy ID: 7003 (Native - Nike)
   - Spend: 40% ($20,000 / $50,000)
   - Delivery: 35% of goal ⚠️ Under-delivering
   - Recommendation: INCREASE BID from $3.50 to $5.00

🟢 High Performers (2 strategies):
- Strategy ID: 7004 (Display Mobile - Adidas): CPA $18 (28% under target)
- Strategy ID: 7005 (Video Desktop - Adidas): CTR 2.8% (40% over target)

💰 Budget Reallocation Plan:
- Pause strategies 7001, 7002 → Free $87,500
- Reallocate $50,000 to high performers (7004, 7005)
- Increase bids on strategy 7003
- Reserve $37,500 for new strategies

Execute these optimizations? [Yes/Review Details/Cancel]"
```

---

### Agent 3: Reporting & Analytics Agent

**Type**: Data Analysis Agent
**Framework**: CrewAI with specialized analysis crew
**Primary Users**: Data Analysts, Account Executives

**Capabilities**:
- Multi-dimensional performance analysis
- Budget utilization tracking
- Cross-campaign benchmarking
- Executive report generation

**Tools Used**:
```python
tools = [
    # Hierarchy gathering
    "get_organization_info",
    "get_agency_info",
    "get_advertiser_info",

    # Campaign data
    "find_campaigns",
    "get_campaign_info",
    "find_strategies",
    "get_strategy_info",

    # Supporting data
    "find_audience_segments",
    "find_concepts",
    "find_supply_sources",

    # System stats
    "healthcheck"
]
```

**CrewAI Configuration**:
```python
from crewai import Agent, Task, Crew, Process

data_collector = Agent(
    role='Data Collection Specialist',
    goal='Gather all relevant campaign data',
    tools=[find_campaigns, get_campaign_info, ...]
)

analyst = Agent(
    role='Performance Analyst',
    goal='Calculate KPIs and identify insights',
    tools=[]  # Uses data from collector
)

report_generator = Agent(
    role='Report Writer',
    goal='Create executive-ready reports',
    tools=[]  # Uses analysis from analyst
)

reporting_crew = Crew(
    agents=[data_collector, analyst, report_generator],
    tasks=[collect_task, analyze_task, report_task],
    process=Process.sequential
)
```

**Success Metrics**:
- Report generation: 4hrs → 10min (96% reduction)
- Data accuracy: 100%
- Actionable insights per report: >5

**Example Report Output**:
```markdown
# Campaign Performance Report
**Organization**: ACME Corporation (ID: 100048)
**Period**: 2024-06-01 to 2024-08-31
**Generated**: 2024-08-15 10:30 AM

## Executive Summary
- **Total Budget**: $2,450,000 across 45 campaigns
- **Budget Utilized**: $1,960,000 (80% utilization)
- **Active Campaigns**: 38 / 45 (84%)
- **Total Strategies**: 142 (avg 3.2 per campaign)
- **Top Performance**: CPA campaigns with video strategies

## Key Findings
1. ✅ **Video strategies outperform display by 25%** in CPA campaigns
2. ⚠️ **Budget under-utilization**: $490K available for reallocation
3. 📈 **Native ads show 40% CTR improvement** vs industry benchmark
4. 🔴 **5 campaigns expiring within 7 days** requiring renewal decisions

## Budget by Goal Type
| Goal Type | Budget | Utilized | % | Campaigns |
|-----------|--------|----------|---|-----------|
| CPA | $980K | $850K | 87% | 18 |
| CTR | $720K | $540K | 75% | 15 |
| Reach | $450K | $320K | 71% | 8 |
| Spend | $300K | $250K | 83% | 4 |

## Top Performers
1. Campaign: "Nike Summer 2024" - CPA: $18 (target $25) - $500K budget
2. Campaign: "Adidas Back to School" - CTR: 2.8% (target 2.0%) - $350K budget
3. Campaign: "Puma Q3 Launch" - Reach: 12M impressions - $250K budget

## Recommendations
1. **Reallocate $200K** from under-utilized reach campaigns to CPA campaigns
2. **Extend 3 high-performing campaigns** expiring this month
3. **Increase video budget** by 20% based on performance data
4. **Test native ads** for remaining display-only campaigns
5. **Review and pause 8 strategies** spending >80% with poor metrics

## Action Items
- [ ] Review budget reallocation plan with finance
- [ ] Approve campaign extensions before Sept 1
- [ ] Schedule creative refresh for Q4 campaigns
- [ ] Implement brand safety site lists on 12 strategies
```

---

### Agent 4: Compliance & Governance Agent

**Type**: Rule-Based + Monitoring
**Framework**: LangGraph with scheduled triggers
**Primary Users**: Operations Managers

**Capabilities**:
- User permission auditing
- Naming convention enforcement
- Brand safety monitoring
- Data integrity validation

**Tools Used**:
```python
tools = [
    # User management
    "find_user",
    "get_user_info",
    "get_user_permissions",

    # Organization structure
    "find_organizations",
    "get_organization_info",

    # Compliance checks
    "find_site_lists",
    "get_site_list_info",
    "find_campaigns",  # naming validation
    "find_strategies",

    # System validation
    "healthcheck"
]
```

**Compliance Rules**:
```python
RULES = {
    "user_permissions": {
        "max_admin_ratio": 0.10,  # Max 10% admins per org
        "inactive_threshold_days": 90,
        "required_2fa": True
    },
    "naming_conventions": {
        "campaign_pattern": r"^[A-Z][a-zA-Z0-9\s\-]+\d{4}$",
        "strategy_pattern": r"^(Display|Video|Mobile|Native)\s.+$"
    },
    "brand_safety": {
        "required_site_lists": ["brand_safety_blacklist"],
        "strategies_requiring_lists": ["display", "video", "native"]
    },
    "data_integrity": {
        "max_budget_without_strategies": 0,
        "min_strategy_budget": 1000,
        "max_inactive_campaigns_ratio": 0.20
    }
}
```

**Success Metrics**:
- Audit coverage: 100%
- Compliance violations detected: 100%
- False positive rate: <5%

---

### Agent 5: Creative Operations Agent

**Type**: Asset Management Agent
**Framework**: CrewAI
**Primary Users**: Creative Ops Specialists

**Capabilities**:
- Creative inventory management
- Campaign-creative mapping
- Usage tracking
- Performance-based recommendations

**Tools Used**:
```python
tools = [
    "find_concepts",
    "get_concept_info",
    "get_advertiser_info",
    "get_campaign_info",
    "find_campaigns"
]
```

**Success Metrics**:
- Creative coverage: 100% (no campaigns without creative)
- Refresh cycle: 120 days → 60 days
- Performance improvement: +15% from optimization

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Set up MCP server authentication
- [ ] Configure LangGraph coordinator
- [ ] Implement basic tool calling infrastructure
- [ ] Create agent evaluation framework

### Phase 2: Campaign Setup Agent (Weeks 3-4)
- [ ] Build ReAct agent with campaign_create tools
- [ ] Implement verification loops
- [ ] Add templating capability
- [ ] Test with 10 campaign scenarios
- [ ] Deploy to beta users

### Phase 3: Optimization Agent (Weeks 5-6)
- [ ] Build planning + execution agent
- [ ] Implement performance analysis logic
- [ ] Add decision criteria for each goal_type
- [ ] Test with live campaign data
- [ ] Enable auto-optimization with approvals

### Phase 4: Reporting Agent (Weeks 7-8)
- [ ] Build CrewAI reporting crew
- [ ] Implement data collection + analysis
- [ ] Create report templates
- [ ] Add visualization generation
- [ ] Deploy executive dashboard

### Phase 5: Governance & Creative Agents (Weeks 9-10)
- [ ] Build compliance monitoring agent
- [ ] Implement creative ops agent
- [ ] Add scheduled audit tasks
- [ ] Test with full user base
- [ ] Production rollout

---

## Technical Stack

### Core Framework
- **Agent Orchestration**: LangGraph (state management, routing)
- **Agent Implementation**: CrewAI (pre-built patterns, task coordination)
- **LLM**: GPT-4 or Claude Sonnet (tool calling, reasoning)
- **Vector Store**: Pinecone or Weaviate (memory, context)
- **Monitoring**: LangSmith (observability, debugging)

### Infrastructure
- **API Gateway**: Next.js API routes
- **Authentication**: MCP API key (already implemented)
- **Database**: PostgreSQL (agent state, conversation history)
- **Cache**: Redis (tool results, org structure)
- **Queue**: BullMQ (async agent tasks)

### Development
- **Language**: Python (agents), TypeScript (API)
- **Testing**: Pytest (agent logic), Jest (API)
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel (API), Modal/AWS Lambda (agents)

---

## Agent Performance Metrics

### Campaign Setup Agent
| Metric | Baseline | Target | Achieved |
|--------|----------|--------|----------|
| Setup Time | 30 min | 5 min | TBD |
| Error Rate | 15% | <1% | TBD |
| User Satisfaction | 6.5/10 | >9/10 | TBD |

### Optimization Agent
| Metric | Baseline | Target | Achieved |
|--------|----------|--------|----------|
| Performance Gain | 0% | +20% | TBD |
| Time Savings | 0 | 90% | TBD |
| Proactive Detection | 0% | >80% | TBD |

### Reporting Agent
| Metric | Baseline | Target | Achieved |
|--------|----------|--------|----------|
| Report Time | 4 hrs | 10 min | TBD |
| Insights per Report | 2-3 | >5 | TBD |
| Data Accuracy | 95% | 100% | TBD |

---

## Best Practices

### 1. Tool Calling Patterns

**Pattern: Search → Get Details → Act**
```python
# Step 1: Broad search
campaigns = call_tool("find_campaigns", {"advertiser_id": 5001})

# Step 2: Get detailed context
for campaign in campaigns:
    details = call_tool("get_campaign_info", {
        "campaign_id": campaign.id,
        "with_strategies": True
    })

# Step 3: Take action
call_tool("campaign_update", {"campaign_id": id, ...})
```

**Pattern: Hierarchical Gathering**
```python
# Top-down data collection
org = call_tool("get_organization_info", {
    "organization_id": 100048,
    "with_agencies": True,
    "with_advertisers": True
})

for advertiser in org.advertisers:
    campaigns = call_tool("get_advertiser_info", {
        "advertiser_id": advertiser.id,
        "with_campaigns": True
    })
```

### 2. Error Handling

```python
def safe_tool_call(tool_name, args, retries=3):
    for attempt in range(retries):
        try:
            result = call_tool(tool_name, args)
            return result
        except EntityNotFoundError:
            # Don't retry, entity doesn't exist
            return None
        except ValidationError as e:
            # Fix validation and retry once
            if attempt == 0:
                args = fix_validation(args, e)
                continue
            raise
        except TransientError:
            # Retry with backoff
            time.sleep(2 ** attempt)
            continue
```

### 3. Caching Strategy

```python
CACHE_TTL = {
    "organizations": 3600,  # 1 hour
    "supply_sources": 7200,  # 2 hours
    "audience_segments": 7200,  # 2 hours
    "campaigns": 300,  # 5 minutes
    "strategies": 60  # 1 minute
}
```

### 4. Batch Operations

```python
# Good: Single find_* call
campaigns = call_tool("find_campaigns", {
    "organization_id": 100048,
    "pageLimit": 25
})

# Bad: Multiple get_* calls
for campaign_id in campaign_ids:  # Avoid if possible
    campaign = call_tool("get_campaign_info", {"campaign_id": campaign_id})
```

---

## Security Considerations

### 1. API Key Management
- Rotate API keys quarterly
- Use environment-specific keys (dev, staging, prod)
- Implement rate limiting per key

### 2. Permission Enforcement
- Agents inherit user permissions
- Validate permissions before tool execution
- Log all write operations

### 3. Data Privacy
- Mask sensitive data in logs
- Encrypt agent state in database
- Comply with data retention policies

### 4. Audit Trail
- Log all agent decisions and actions
- Track tool calls with user context
- Enable compliance reporting

---

## Cost Optimization

### LLM Usage
- Use GPT-4 for complex reasoning
- Use GPT-3.5 for simple tasks
- Cache tool results aggressively
- Implement streaming for long reports

### Infrastructure
- Use serverless for sporadic workloads
- Cache organization structure data
- Batch tool calls when possible
- Implement smart pagination

**Estimated Monthly Costs** (1000 campaigns):
- LLM API: $500-800
- Infrastructure: $200-300
- Monitoring: $100
- **Total**: $800-1200/month

**ROI**:
- Time saved: 200+ hours/month
- Cost of manual work: $10,000+/month
- **Net savings**: $8,800+/month

---

## Next Steps

1. **Review & Prioritize**: Validate agent priorities with stakeholders
2. **Prototype**: Build Campaign Setup Agent MVP
3. **Test**: Run with sample data and beta users
4. **Iterate**: Gather feedback and improve
5. **Scale**: Roll out additional agents progressively

---

## Support & Resources

**Documentation**:
- MCP Server API: `/docs/API_GUIDE.md`
- Authentication: `/AUTH_GUIDE.md`
- Testing UI: https://mediamath-mcp-mock-two.vercel.app/test

**Code Examples**:
- CrewAI agents: `/agents/crewai_campaign_optimizer.py`
- LangGraph: `/agents/langgraph_budget_analyzer.py`

**Questions?** Create an issue in the repository or contact the team.

---

**Document Version**: 1.0
**Last Updated**: November 2024
**Status**: Ready for Implementation ✅
