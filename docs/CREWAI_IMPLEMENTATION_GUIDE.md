# CrewAI Implementation Guide for MediaMath MCP Server

**Version**: 1.0
**Last Updated**: November 2025
**Author**: HyperMindz AI Engineering Team

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Industry Roles & User Stories](#industry-roles--user-stories)
3. [CrewAI Agent Specifications](#crewai-agent-specifications)
4. [Crew Definitions](#crew-definitions)
5. [Task Specifications](#task-specifications)
6. [Workflow Implementations](#workflow-implementations)
7. [MCP Tool Integration](#mcp-tool-integration)
8. [Implementation Roadmap](#implementation-roadmap)
9. [Code Examples](#code-examples)
10. [Testing Strategy](#testing-strategy)

---

## 1. Architecture Overview

### 1.1 Multiple Specialized Crews Architecture

The MediaMath MCP implementation uses **5 specialized CrewAI crews**, each handling a specific category of use cases:

```
┌─────────────────────────────────────────────────────────┐
│                    Request Router                        │
│           (Analyzes user intent & routes)                │
└────────────┬────────────────────────────────────────────┘
             │
             ├──→ Campaign Setup Crew (CM-1, CM-3, AE-4)
             ├──→ Optimization Crew (MB-1, MB-2, DA-3)
             ├──→ Analytics Crew (DA-1, DA-2, OM-1)
             ├──→ Compliance Crew (OM-2, OM-3)
             └──→ Creative Crew (CO-1, CO-2)
```

### 1.2 Why Multiple Crews?

**Benefits:**
- ✅ Domain expertise per crew
- ✅ Easier maintenance and debugging
- ✅ Better performance and accuracy
- ✅ Clear separation of concerns
- ✅ Parallel execution for different users
- ✅ Independent scaling

**vs. Single Unified Crew:**
- ❌ Too many agents with conflicting priorities
- ❌ Complex orchestration logic
- ❌ Harder to debug and maintain
- ❌ Lower accuracy due to lack of specialization

### 1.3 Technology Stack

```yaml
Framework: CrewAI 0.95.x
Tools: MCP Server (28 tools) wrapped as LangChain tools
LLM: OpenAI GPT-4 Turbo
Memory: Short-term (per crew session)
Process: Sequential (for most crews)
Deployment: Python 3.11+, Docker containers
```

---

## 2. Industry Roles & User Stories

### 2.1 Campaign Manager (CM)

**User Stories:**
- **CM-1**: Bulk Campaign Setup
  - "As a Campaign Manager, I want to create 10 campaigns at once so that I can launch seasonal promotions quickly"
  - **Maps to**: Campaign Setup Crew

- **CM-2**: Cross-Campaign Budget Reallocation
  - "As a Campaign Manager, I want to reallocate budgets between campaigns based on performance"
  - **Maps to**: Optimization Crew

- **CM-3**: Campaign Performance Dashboard
  - "As a Campaign Manager, I want to see all my campaigns' KPIs in one view"
  - **Maps to**: Analytics Crew

### 2.2 Media Buyer (MB)

**User Stories:**
- **MB-1**: Strategy Optimization
  - "As a Media Buyer, I want to automatically pause underperforming strategies"
  - **Maps to**: Optimization Crew

- **MB-2**: Supply Source Performance Analysis
  - "As a Media Buyer, I want to compare supply sources and identify top performers"
  - **Maps to**: Analytics Crew

- **MB-3**: Bulk Strategy Bid Adjustment
  - "As a Media Buyer, I want to adjust bids across multiple strategies based on time-of-day performance"
  - **Maps to**: Optimization Crew

### 2.3 Data Analyst (DA)

**User Stories:**
- **DA-1**: Budget Utilization Report
  - "As a Data Analyst, I want to generate weekly budget utilization reports"
  - **Maps to**: Analytics Crew

- **DA-2**: Audience Segment Performance
  - "As a Data Analyst, I want to analyze which audience segments drive highest ROI"
  - **Maps to**: Analytics Crew

- **DA-3**: Predictive Performance Modeling
  - "As a Data Analyst, I want to predict which campaigns will hit their goals"
  - **Maps to**: Analytics Crew

### 2.4 Creative Operations (CO)

**User Stories:**
- **CO-1**: Creative Asset Audit
  - "As a Creative Ops Manager, I want to find all creatives used across campaigns"
  - **Maps to**: Creative Crew

- **CO-2**: Creative Refresh Planning
  - "As a Creative Ops Manager, I want to identify creatives that need refresh based on performance"
  - **Maps to**: Creative Crew

### 2.5 Account Executive (AE)

**User Stories:**
- **AE-1**: Client Campaign Oversight
  - "As an Account Executive, I want to monitor all campaigns for a specific client"
  - **Maps to**: Analytics Crew

- **AE-2**: Campaign Health Check
  - "As an Account Executive, I want to identify campaigns at risk of underdelivery"
  - **Maps to**: Analytics Crew

- **AE-3**: Multi-Campaign Budget Summary
  - "As an Account Executive, I want to show clients their total spend and ROI"
  - **Maps to**: Analytics Crew

- **AE-4**: Rapid Campaign Launch
  - "As an Account Executive, I want to set up a new client campaign in 5 minutes"
  - **Maps to**: Campaign Setup Crew

### 2.6 Operations Manager (OM)

**User Stories:**
- **OM-1**: Organization-Wide Budget Report
  - "As an Operations Manager, I want to see budget health across all teams"
  - **Maps to**: Analytics Crew

- **OM-2**: User Access Audit
  - "As an Operations Manager, I want to audit who has access to what"
  - **Maps to**: Compliance Crew

- **OM-3**: Compliance Monitoring
  - "As an Operations Manager, I want to ensure all campaigns follow brand safety rules"
  - **Maps to**: Compliance Crew

---

## 3. CrewAI Agent Specifications

### 3.1 Campaign Setup Crew Agents

#### Agent 1: Campaign Strategist

```python
from crewai import Agent
from langchain_openai import ChatOpenAI

campaign_strategist = Agent(
    role="Campaign Strategist",
    goal="Analyze campaign requirements and create optimal campaign strategies",
    backstory="""You are an expert digital advertising strategist with 10+ years
    of experience in programmatic media buying. You excel at understanding business
    objectives and translating them into effective campaign structures. You consider
    budget constraints, audience targeting, and performance goals when designing
    campaign strategies.""",

    verbose=True,
    allow_delegation=False,
    llm=ChatOpenAI(model="gpt-4-turbo", temperature=0.3),
    tools=[
        # Will use: find_organizations, find_campaigns (for research)
    ]
)
```

#### Agent 2: Campaign Builder

```python
campaign_builder = Agent(
    role="Campaign Builder",
    goal="Execute campaign creation based on approved strategies",
    backstory="""You are a meticulous campaign implementation specialist. You take
    strategic plans and flawlessly execute them in the MediaMath platform. You ensure
    all configurations are correct, budgets are set properly, and targeting is accurate.
    You always validate your work before confirming completion.""",

    verbose=True,
    allow_delegation=False,
    llm=ChatOpenAI(model="gpt-4-turbo", temperature=0.1),
    tools=[
        # Will use: create_campaign, create_strategy, create_audience_segment
    ]
)
```

#### Agent 3: QA Specialist

```python
qa_specialist = Agent(
    role="Quality Assurance Specialist",
    goal="Verify campaign configurations and catch errors before launch",
    backstory="""You are a detail-oriented QA expert who has saved countless campaigns
    from costly mistakes. You systematically check every configuration, validate budgets,
    verify targeting, and ensure campaigns are ready for launch. You create comprehensive
    QA reports that give stakeholders confidence.""",

    verbose=True,
    allow_delegation=False,
    llm=ChatOpenAI(model="gpt-4-turbo", temperature=0.1),
    tools=[
        # Will use: get_campaign_info, get_strategy_info, find_campaigns
    ]
)
```

### 3.2 Optimization Crew Agents

#### Agent 1: Performance Analyzer

```python
performance_analyzer = Agent(
    role="Performance Analyzer",
    goal="Analyze campaign and strategy performance to identify optimization opportunities",
    backstory="""You are a data-driven performance analyst who can quickly spot
    trends and anomalies in campaign data. You understand the nuances of digital
    advertising metrics and can identify when strategies are underperforming or
    over-performing. Your insights drive millions in optimization decisions.""",

    verbose=True,
    allow_delegation=False,
    llm=ChatOpenAI(model="gpt-4-turbo", temperature=0.2),
    tools=[
        # Will use: get_campaign_info, get_strategy_info, find_strategies
    ]
)
```

#### Agent 2: Decision Maker

```python
decision_maker = Agent(
    role="Optimization Decision Maker",
    goal="Make informed optimization decisions based on performance analysis",
    backstory="""You are a strategic optimization expert who makes high-stakes
    decisions about budget reallocation, bid adjustments, and campaign pausing.
    You balance short-term performance with long-term goals, and always explain
    your reasoning clearly. You're trusted to make decisions on campaigns worth
    millions of dollars.""",

    verbose=True,
    allow_delegation=False,
    llm=ChatOpenAI(model="gpt-4-turbo", temperature=0.3),
    tools=[]  # Decision-making, no direct tool calls
)
```

#### Agent 3: Execution Agent

```python
execution_agent = Agent(
    role="Optimization Execution Agent",
    goal="Execute approved optimization actions swiftly and accurately",
    backstory="""You are the executor who implements optimization decisions.
    You update campaigns, adjust budgets, modify strategies, and track all changes.
    You ensure every optimization is applied correctly and provide confirmation
    of what was changed.""",

    verbose=True,
    allow_delegation=False,
    llm=ChatOpenAI(model="gpt-4-turbo", temperature=0.1),
    tools=[
        # Will use: update_campaign, update_strategy, update_campaign_budget
    ]
)
```

### 3.3 Analytics Crew Agents

#### Agent 1: Data Collector

```python
data_collector = Agent(
    role="Data Collection Specialist",
    goal="Gather comprehensive campaign and performance data from MediaMath",
    backstory="""You are a systematic data gatherer who knows exactly what data
    to pull for different types of analyses. You ensure data completeness, handle
    large datasets efficiently, and organize information for analysis.""",

    verbose=True,
    allow_delegation=False,
    llm=ChatOpenAI(model="gpt-4-turbo", temperature=0.1),
    tools=[
        # Will use: find_campaigns, find_strategies, get_campaign_info, get_strategy_info
    ]
)
```

#### Agent 2: Data Analyst

```python
data_analyst = Agent(
    role="Data Analyst",
    goal="Analyze collected data to extract meaningful insights and trends",
    backstory="""You are a brilliant data analyst who can see patterns others miss.
    You calculate KPIs, identify trends, compare performance across segments, and
    uncover actionable insights. Your analyses drive strategic decisions.""",

    verbose=True,
    allow_delegation=False,
    llm=ChatOpenAI(model="gpt-4-turbo", temperature=0.2),
    tools=[]  # Analysis-only, no tool calls
)
```

#### Agent 3: Report Writer

```python
report_writer = Agent(
    role="Report Writer",
    goal="Create clear, actionable reports that communicate insights to stakeholders",
    backstory="""You are a communications expert who translates complex data into
    clear, compelling reports. You know how to present insights to different audiences -
    from technical teams to executives. Your reports drive action and decision-making.""",

    verbose=True,
    allow_delegation=False,
    llm=ChatOpenAI(model="gpt-4-turbo", temperature=0.4),
    tools=[]  # Report writing, no tool calls
)
```

### 3.4 Compliance Crew Agents

#### Agent 1: User Auditor

```python
user_auditor = Agent(
    role="User Access Auditor",
    goal="Audit user permissions and access across the organization",
    backstory="""You are a security-focused auditor who ensures proper access controls.
    You systematically review user permissions, identify anomalies, and flag potential
    security risks. You understand compliance requirements and enforce least-privilege
    principles.""",

    verbose=True,
    allow_delegation=False,
    llm=ChatOpenAI(model="gpt-4-turbo", temperature=0.1),
    tools=[
        # Will use: find_users, get_user_permissions
    ]
)
```

#### Agent 2: Permission Analyzer

```python
permission_analyzer = Agent(
    role="Permission Analyzer",
    goal="Analyze permission patterns and identify compliance issues",
    backstory="""You are a compliance expert who can quickly identify permission
    violations, over-privileged accounts, and access anomalies. You understand
    organizational hierarchies and can recommend proper access structures.""",

    verbose=True,
    allow_delegation=False,
    llm=ChatOpenAI(model="gpt-4-turbo", temperature=0.2),
    tools=[]  # Analysis-only
)
```

#### Agent 3: Audit Reporter

```python
audit_reporter = Agent(
    role="Audit Report Specialist",
    goal="Create comprehensive compliance and audit reports",
    backstory="""You are an audit reporting specialist who creates reports that
    meet regulatory standards. Your reports are clear, thorough, and actionable.
    You highlight risks and provide recommendations for remediation.""",

    verbose=True,
    allow_delegation=False,
    llm=ChatOpenAI(model="gpt-4-turbo", temperature=0.3),
    tools=[]  # Report writing
)
```

### 3.5 Creative Crew Agents

#### Agent 1: Creative Collector

```python
creative_collector = Agent(
    role="Creative Asset Collector",
    goal="Gather all creative assets and their usage across campaigns",
    backstory="""You are a creative operations specialist who tracks every creative
    asset across the platform. You know where creatives are used, how they perform,
    and when they were last updated. You maintain a comprehensive view of the
    creative ecosystem.""",

    verbose=True,
    allow_delegation=False,
    llm=ChatOpenAI(model="gpt-4-turbo", temperature=0.1),
    tools=[
        # Will use: find_creatives, get_creative_info
    ]
)
```

#### Agent 2: Creative Analyst

```python
creative_analyst = Agent(
    role="Creative Performance Analyst",
    goal="Analyze creative performance and identify refresh opportunities",
    backstory="""You are a creative strategist who understands what makes ads
    perform. You analyze creative fatigue, A/B test results, and engagement metrics
    to identify which creatives need refresh. Your insights improve campaign
    performance significantly.""",

    verbose=True,
    allow_delegation=False,
    llm=ChatOpenAI(model="gpt-4-turbo", temperature=0.2),
    tools=[]  # Analysis-only
)
```

#### Agent 3: Refresh Planner

```python
refresh_planner = Agent(
    role="Creative Refresh Planner",
    goal="Create actionable creative refresh plans based on performance data",
    backstory="""You are a creative planning expert who develops systematic
    creative refresh strategies. You prioritize which creatives need updating,
    suggest new creative directions, and create timelines for creative production.""",

    verbose=True,
    allow_delegation=False,
    llm=ChatOpenAI(model="gpt-4-turbo", temperature=0.4),
    tools=[]  # Planning-only
)
```

---

## 4. Crew Definitions

### 4.1 Campaign Setup Crew

```python
from crewai import Crew, Process

campaign_setup_crew = Crew(
    agents=[
        campaign_strategist,
        campaign_builder,
        qa_specialist
    ],

    tasks=[
        # Tasks defined in section 5
        strategy_planning_task,
        campaign_building_task,
        qa_verification_task
    ],

    process=Process.sequential,
    verbose=2,
    memory=True,

    # Crew-level configuration
    max_rpm=10,  # Rate limiting
    share_crew=False
)
```

**Use Cases**: CM-1, CM-3, AE-4

### 4.2 Optimization Crew

```python
optimization_crew = Crew(
    agents=[
        performance_analyzer,
        decision_maker,
        execution_agent
    ],

    tasks=[
        performance_analysis_task,
        optimization_decision_task,
        optimization_execution_task
    ],

    process=Process.sequential,
    verbose=2,
    memory=True,
    max_rpm=10
)
```

**Use Cases**: MB-1, MB-2, CM-2, MB-3

### 4.3 Analytics Crew

```python
analytics_crew = Crew(
    agents=[
        data_collector,
        data_analyst,
        report_writer
    ],

    tasks=[
        data_collection_task,
        data_analysis_task,
        report_writing_task
    ],

    process=Process.sequential,
    verbose=2,
    memory=True,
    max_rpm=10
)
```

**Use Cases**: DA-1, DA-2, DA-3, AE-1, AE-2, AE-3, OM-1

### 4.4 Compliance Crew

```python
compliance_crew = Crew(
    agents=[
        user_auditor,
        permission_analyzer,
        audit_reporter
    ],

    tasks=[
        user_audit_task,
        permission_analysis_task,
        audit_reporting_task
    ],

    process=Process.sequential,
    verbose=2,
    memory=True,
    max_rpm=10
)
```

**Use Cases**: OM-2, OM-3

### 4.5 Creative Crew

```python
creative_crew = Crew(
    agents=[
        creative_collector,
        creative_analyst,
        refresh_planner
    ],

    tasks=[
        creative_collection_task,
        creative_analysis_task,
        refresh_planning_task
    ],

    process=Process.sequential,
    verbose=2,
    memory=True,
    max_rpm=10
)
```

**Use Cases**: CO-1, CO-2

---

## 5. Task Specifications

### 5.1 Campaign Setup Crew Tasks

#### Task 1: Strategy Planning

```python
from crewai import Task

strategy_planning_task = Task(
    description="""
    Analyze the campaign requirements and create a detailed campaign strategy.

    Input Parameters:
    - campaign_count: Number of campaigns to create
    - campaign_names: List of campaign names
    - budgets: Budget allocation per campaign
    - targeting: Audience targeting requirements
    - business_objectives: Client's business goals

    Required Analysis:
    1. Validate budget allocations
    2. Recommend optimal campaign structures
    3. Suggest audience targeting strategies
    4. Identify potential risks or issues

    Expected Output:
    A detailed campaign strategy document including:
    - Campaign structure recommendations
    - Budget allocation breakdown
    - Targeting strategy per campaign
    - Risk assessment
    - Implementation checklist
    """,

    agent=campaign_strategist,
    expected_output="""
    Campaign Strategy Document with:
    - Executive Summary (2-3 sentences)
    - Campaign Structure (table format)
    - Budget Breakdown (per campaign)
    - Targeting Strategy (detailed)
    - Risk Assessment (if any)
    - Next Steps
    """
)
```

#### Task 2: Campaign Building

```python
campaign_building_task = Task(
    description="""
    Execute the campaign creation based on the approved strategy.

    Steps:
    1. Create each campaign using create_campaign tool
    2. Set up strategies for each campaign using create_strategy tool
    3. Configure audience segments using create_audience_segment tool
    4. Record all created IDs (campaign_id, strategy_id, segment_id)

    Validation:
    - Verify all campaigns were created successfully
    - Confirm budgets are set correctly
    - Ensure targeting is applied properly

    Expected Output:
    Implementation report with all created entity IDs and confirmation of success.
    """,

    agent=campaign_builder,
    expected_output="""
    Implementation Report with:
    - Campaign IDs (list)
    - Strategy IDs (list)
    - Segment IDs (list)
    - Success Confirmation (yes/no per entity)
    - Any errors encountered
    """,

    context=[strategy_planning_task]  # Depends on strategy task
)
```

#### Task 3: QA Verification

```python
qa_verification_task = Task(
    description="""
    Verify all campaign configurations are correct and ready for launch.

    QA Checklist:
    1. Retrieve campaign details using get_campaign_info
    2. Verify budgets match specifications
    3. Check strategy configurations using get_strategy_info
    4. Confirm audience targeting is correct
    5. Identify any configuration errors

    Quality Gates:
    - All campaigns must have correct budgets
    - All strategies must be active and properly configured
    - All targeting must match requirements

    Expected Output:
    QA Report with pass/fail status and any issues found.
    """,

    agent=qa_specialist,
    expected_output="""
    QA Report with:
    - Overall Status (PASS/FAIL)
    - Per-Campaign Validation (table)
    - Issues Found (list)
    - Recommendations (if any)
    - Launch Readiness (yes/no)
    """,

    context=[campaign_building_task]  # Depends on building task
)
```

### 5.2 Optimization Crew Tasks

#### Task 1: Performance Analysis

```python
performance_analysis_task = Task(
    description="""
    Analyze campaign and strategy performance to identify optimization opportunities.

    Analysis Steps:
    1. Gather all campaigns using find_campaigns
    2. Retrieve detailed metrics using get_campaign_info and get_strategy_info
    3. Calculate key performance indicators:
       - CTR (Click-Through Rate)
       - CPC (Cost Per Click)
       - Budget pacing (actual vs. planned)
       - Conversion rates
    4. Identify underperforming and overperforming strategies
    5. Calculate budget utilization

    Criteria for Underperformance:
    - CTR < 0.5%
    - CPC > $2.00
    - Budget pacing < 80% or > 120%
    - Conversion rate < 1%

    Expected Output:
    Performance analysis report with actionable insights.
    """,

    agent=performance_analyzer,
    expected_output="""
    Performance Analysis Report with:
    - Executive Summary
    - Top Performers (top 3 campaigns/strategies)
    - Underperformers (campaigns/strategies to optimize)
    - Key Metrics Table
    - Optimization Opportunities (list)
    """
)
```

#### Task 2: Optimization Decision

```python
optimization_decision_task = Task(
    description="""
    Make informed optimization decisions based on performance analysis.

    Decision Framework:
    1. Review performance analysis findings
    2. Prioritize optimization actions by impact
    3. Determine specific actions:
       - Pause strategies (if CTR < 0.3%)
       - Increase budgets (if CTR > 1.5% and pacing on track)
       - Decrease budgets (if CTR < 0.5%)
       - Reallocate budgets between campaigns
    4. Provide clear rationale for each decision

    Constraints:
    - Don't exceed overall budget limits
    - Maintain minimum budget per campaign ($100)
    - Consider seasonal factors

    Expected Output:
    Optimization decision document with specific actions and rationale.
    """,

    agent=decision_maker,
    expected_output="""
    Optimization Decision Document with:
    - Recommended Actions (prioritized list)
    - Rationale per Action
    - Expected Impact (estimated)
    - Risk Assessment
    - Implementation Priority (high/medium/low)
    """,

    context=[performance_analysis_task]
)
```

#### Task 3: Optimization Execution

```python
optimization_execution_task = Task(
    description="""
    Execute approved optimization actions on campaigns and strategies.

    Execution Steps:
    1. For each approved action:
       - Update campaigns using update_campaign
       - Update strategies using update_strategy
       - Update budgets using update_campaign_budget
    2. Record all changes made
    3. Verify changes were applied successfully
    4. Document execution results

    Validation:
    - Confirm each update was successful
    - Verify new configurations match decisions
    - Log any errors or issues

    Expected Output:
    Execution report confirming all changes were applied.
    """,

    agent=execution_agent,
    expected_output="""
    Execution Report with:
    - Actions Completed (list)
    - Changes Applied (detailed table)
    - Success/Failure Status per Action
    - Before/After Values
    - Any Errors Encountered
    """,

    context=[optimization_decision_task]
)
```

### 5.3 Analytics Crew Tasks

#### Task 1: Data Collection

```python
data_collection_task = Task(
    description="""
    Gather comprehensive campaign data from MediaMath for analysis.

    Data Collection Requirements:
    - All campaigns for specified organization
    - Campaign metrics (budget, spend, impressions, clicks)
    - Strategy details and performance
    - Audience segment performance
    - Supply source performance
    - Time period: {time_period} (parameter)

    Tools to Use:
    - find_campaigns (get all campaigns)
    - get_campaign_info (detailed metrics)
    - find_strategies (all strategies)
    - get_strategy_info (strategy metrics)

    Expected Output:
    Structured dataset ready for analysis.
    """,

    agent=data_collector,
    expected_output="""
    Data Collection Report with:
    - Number of Campaigns Collected
    - Number of Strategies Collected
    - Date Range Covered
    - Data Completeness (%)
    - Structured Dataset (JSON or table format)
    """
)
```

#### Task 2: Data Analysis

```python
data_analysis_task = Task(
    description="""
    Analyze collected data to extract meaningful insights.

    Analysis Requirements:
    1. Calculate aggregate KPIs:
       - Total spend vs. budget
       - Overall CTR
       - Average CPC
       - Conversion rate
       - Budget utilization %
    2. Identify trends:
       - Performance over time
       - Top performing campaigns
       - Underperforming segments
    3. Segment analysis:
       - Performance by audience segment
       - Performance by supply source
       - Performance by creative type
    4. Anomaly detection:
       - Unusual spend patterns
       - Performance outliers

    Expected Output:
    Analytical insights with visualizable data.
    """,

    agent=data_analyst,
    expected_output="""
    Analysis Report with:
    - Key Metrics Summary
    - Trend Analysis (text + data points)
    - Segment Performance (table)
    - Top Insights (top 5)
    - Recommendations
    """,

    context=[data_collection_task]
)
```

#### Task 3: Report Writing

```python
report_writing_task = Task(
    description="""
    Create a clear, actionable report for stakeholders.

    Report Structure:
    1. Executive Summary (3-5 bullet points)
    2. Key Metrics Dashboard (table format)
    3. Performance Highlights (top performers)
    4. Areas of Concern (underperformers)
    5. Trends and Insights
    6. Recommendations (actionable)
    7. Appendix (detailed data)

    Audience Considerations:
    - Use clear language (avoid jargon)
    - Highlight actionable insights
    - Provide context for metrics
    - Include visual data representations

    Expected Output:
    Professional report ready to share with stakeholders.
    """,

    agent=report_writer,
    expected_output="""
    Professional Report with:
    - Executive Summary
    - Metrics Dashboard (formatted table)
    - Insights Section
    - Recommendations Section
    - Formatted for presentation
    """,

    context=[data_analysis_task]
)
```

### 5.4 Compliance Crew Tasks

#### Task 1: User Audit

```python
user_audit_task = Task(
    description="""
    Audit all users and their permissions across the organization.

    Audit Steps:
    1. Retrieve all users using find_users tool
    2. For each user, get permissions using get_user_permissions
    3. Document user roles and access levels
    4. Identify:
       - Inactive users with active access
       - Over-privileged accounts
       - Users with unusual permission combinations
       - Accounts without MFA (if available)

    Compliance Checks:
    - Least privilege principle adherence
    - Segregation of duties
    - Regular access reviews

    Expected Output:
    User audit report with compliance findings.
    """,

    agent=user_auditor,
    expected_output="""
    User Audit Report with:
    - Total Users Audited
    - Permission Summary (by role)
    - Compliance Issues Found (list)
    - Risk Assessment (high/medium/low per issue)
    - User List (table with permissions)
    """
)
```

#### Task 2: Permission Analysis

```python
permission_analysis_task = Task(
    description="""
    Analyze permission patterns and identify compliance issues.

    Analysis Framework:
    1. Review all user permissions from audit
    2. Identify permission patterns:
       - Common role assignments
       - Outlier permissions
       - Overly permissive access
    3. Check for compliance violations:
       - Users with admin rights who shouldn't have them
       - Conflicting permissions (e.g., creator + approver)
       - Stale accounts with active permissions
    4. Recommend remediation actions

    Expected Output:
    Permission analysis with prioritized findings.
    """,

    agent=permission_analyzer,
    expected_output="""
    Permission Analysis Report with:
    - Permission Patterns (summary)
    - Compliance Violations (prioritized list)
    - Risk Level per Violation
    - Remediation Recommendations
    - Timeline for Fixes (suggested)
    """,

    context=[user_audit_task]
)
```

#### Task 3: Audit Reporting

```python
audit_reporting_task = Task(
    description="""
    Create comprehensive compliance audit report for leadership.

    Report Requirements:
    1. Executive Summary (compliance status)
    2. Audit Methodology
    3. Findings (detailed)
    4. Risk Assessment
    5. Recommendations (prioritized)
    6. Remediation Plan
    7. Follow-up Schedule

    Audience: Leadership, Compliance Team, Security Team

    Expected Output:
    Professional audit report meeting compliance standards.
    """,

    agent=audit_reporter,
    expected_output="""
    Compliance Audit Report with:
    - Executive Summary
    - Audit Scope and Methodology
    - Findings (categorized by severity)
    - Recommendations
    - Remediation Plan
    - Professional formatting
    """,

    context=[permission_analysis_task]
)
```

### 5.5 Creative Crew Tasks

#### Task 1: Creative Collection

```python
creative_collection_task = Task(
    description="""
    Gather all creative assets and their usage across campaigns.

    Collection Steps:
    1. Find all creatives using find_creatives tool
    2. For each creative, get detailed info using get_creative_info
    3. Document:
       - Creative ID, name, type
       - Where it's being used (campaigns, strategies)
       - Performance metrics (CTR, conversions)
       - Last updated date
       - Current status (active/inactive)

    Expected Output:
    Comprehensive creative inventory with usage data.
    """,

    agent=creative_collector,
    expected_output="""
    Creative Inventory Report with:
    - Total Creatives Count
    - Creatives by Type (breakdown)
    - Usage Summary (campaigns using each creative)
    - Performance Summary
    - Creative List (detailed table)
    """
)
```

#### Task 2: Creative Analysis

```python
creative_analysis_task = Task(
    description="""
    Analyze creative performance and identify refresh opportunities.

    Analysis Criteria:
    1. Creative fatigue indicators:
       - Declining CTR over time
       - High frequency/low engagement
       - Age > 90 days
    2. Performance benchmarks:
       - CTR vs. category average
       - Conversion rate vs. campaign average
    3. A/B test results (if available)
    4. Usage patterns:
       - Overused creatives
       - Underutilized creatives

    Expected Output:
    Creative performance analysis with refresh priorities.
    """,

    agent=creative_analyst,
    expected_output="""
    Creative Analysis Report with:
    - Performance Summary
    - Top Performing Creatives (top 5)
    - Creatives Needing Refresh (prioritized list)
    - Performance Trends
    - Refresh Criteria Met
    """,

    context=[creative_collection_task]
)
```

#### Task 3: Refresh Planning

```python
refresh_planning_task = Task(
    description="""
    Create actionable creative refresh plan based on analysis.

    Planning Requirements:
    1. Prioritize creatives for refresh:
       - High priority: Performance drop + high spend
       - Medium priority: Age > 90 days + declining performance
       - Low priority: Low spend + stable performance
    2. Recommend refresh strategies:
       - Message refresh (new copy)
       - Visual refresh (new imagery)
       - Complete redesign
    3. Create production timeline
    4. Estimate resource requirements

    Expected Output:
    Creative refresh plan with timelines and priorities.
    """,

    agent=refresh_planner,
    expected_output="""
    Creative Refresh Plan with:
    - Prioritized Refresh List (table)
    - Refresh Strategy per Creative
    - Production Timeline (gantt-style)
    - Resource Requirements
    - Expected Impact
    """,

    context=[creative_analysis_task]
)
```

---

## 6. Workflow Implementations

### 6.1 Campaign Setup Workflow (User Story: CM-1)

**User Story**: "As a Campaign Manager, I want to create 10 campaigns at once so that I can launch seasonal promotions quickly"

**Complete Implementation**:

```python
import os
from crewai import Agent, Task, Crew, Process
from langchain_openai import ChatOpenAI
from mcp_tools import wrap_mcp_tools  # Custom wrapper for MCP tools

# === CONFIGURATION ===
MCP_SERVER_URL = "https://mediamath-mcp-mock-two.vercel.app/api/message"
API_KEY = os.getenv("MCP_API_KEY", "mcp_mock_2025_hypermindz_44b87c1d20ed")

# Wrap MCP tools for CrewAI
mcp_tools = wrap_mcp_tools(MCP_SERVER_URL, API_KEY)

# === AGENTS ===
campaign_strategist = Agent(
    role="Campaign Strategist",
    goal="Analyze campaign requirements and create optimal strategies",
    backstory="Expert strategist with 10+ years in programmatic advertising",
    verbose=True,
    allow_delegation=False,
    llm=ChatOpenAI(model="gpt-4-turbo", temperature=0.3),
    tools=[mcp_tools['find_organizations'], mcp_tools['find_campaigns']]
)

campaign_builder = Agent(
    role="Campaign Builder",
    goal="Execute campaign creation flawlessly",
    backstory="Meticulous implementation specialist",
    verbose=True,
    allow_delegation=False,
    llm=ChatOpenAI(model="gpt-4-turbo", temperature=0.1),
    tools=[
        mcp_tools['create_campaign'],
        mcp_tools['create_strategy'],
        mcp_tools['create_audience_segment']
    ]
)

qa_specialist = Agent(
    role="QA Specialist",
    goal="Verify campaign configurations before launch",
    backstory="Detail-oriented QA expert",
    verbose=True,
    allow_delegation=False,
    llm=ChatOpenAI(model="gpt-4-turbo", temperature=0.1),
    tools=[
        mcp_tools['get_campaign_info'],
        mcp_tools['get_strategy_info'],
        mcp_tools['find_campaigns']
    ]
)

# === TASKS ===
strategy_task = Task(
    description="""
    Create a campaign strategy for bulk campaign setup.

    Requirements:
    - Campaign count: {campaign_count}
    - Campaign names: {campaign_names}
    - Budget per campaign: {budget_per_campaign}
    - Total budget: {total_budget}
    - Target audience: {target_audience}
    - Campaign objective: {objective}

    Provide a detailed strategy including structure, targeting, and budget allocation.
    """,
    agent=campaign_strategist,
    expected_output="""
    Campaign Strategy Document with:
    - Campaign structure breakdown
    - Budget allocation per campaign
    - Targeting recommendations
    - Risk assessment
    """
)

building_task = Task(
    description="""
    Execute campaign creation based on approved strategy.

    Steps:
    1. Create each campaign with specified name and budget
    2. Create strategies for each campaign
    3. Set up audience segments
    4. Record all created IDs

    Return all campaign IDs and confirmation of success.
    """,
    agent=campaign_builder,
    expected_output="""
    Implementation Report with:
    - List of created campaign IDs
    - List of created strategy IDs
    - Success status per entity
    """,
    context=[strategy_task]
)

qa_task = Task(
    description="""
    Verify all campaigns are correctly configured.

    QA Checklist:
    - Verify budgets match requirements
    - Check strategy configurations
    - Confirm targeting is correct
    - Identify any errors

    Provide pass/fail status and any issues found.
    """,
    agent=qa_specialist,
    expected_output="""
    QA Report with:
    - Overall status (PASS/FAIL)
    - Per-campaign validation
    - Issues found (if any)
    - Launch readiness
    """,
    context=[building_task]
)

# === CREW ===
campaign_setup_crew = Crew(
    agents=[campaign_strategist, campaign_builder, qa_specialist],
    tasks=[strategy_task, building_task, qa_task],
    process=Process.sequential,
    verbose=2,
    memory=True
)

# === EXECUTION ===
def execute_campaign_setup(
    campaign_count: int,
    campaign_names: list,
    budget_per_campaign: float,
    total_budget: float,
    target_audience: str,
    objective: str
):
    """
    Execute bulk campaign setup workflow.

    Args:
        campaign_count: Number of campaigns to create
        campaign_names: List of campaign names
        budget_per_campaign: Budget per campaign
        total_budget: Total budget across all campaigns
        target_audience: Target audience description
        objective: Campaign objective

    Returns:
        CrewAI execution result with campaign IDs and status
    """
    result = campaign_setup_crew.kickoff(inputs={
        'campaign_count': campaign_count,
        'campaign_names': campaign_names,
        'budget_per_campaign': budget_per_campaign,
        'total_budget': total_budget,
        'target_audience': target_audience,
        'objective': objective
    })

    return result

# === EXAMPLE USAGE ===
if __name__ == "__main__":
    result = execute_campaign_setup(
        campaign_count=10,
        campaign_names=[
            "Holiday Sale - Week 1",
            "Holiday Sale - Week 2",
            "Holiday Sale - Week 3",
            "Holiday Sale - Week 4",
            "Black Friday Promo",
            "Cyber Monday Promo",
            "End of Year Clearance",
            "New Year Launch",
            "Winter Collection",
            "Valentine's Day Teaser"
        ],
        budget_per_campaign=5000.00,
        total_budget=50000.00,
        target_audience="Adults 25-45, interested in e-commerce, high income",
        objective="Drive holiday sales and clear Q4 inventory"
    )

    print("=" * 80)
    print("CAMPAIGN SETUP COMPLETE")
    print("=" * 80)
    print(result)
```

### 6.2 Optimization Workflow (User Story: MB-1)

**User Story**: "As a Media Buyer, I want to automatically pause underperforming strategies"

**Complete Implementation**:

```python
# === AGENTS ===
performance_analyzer = Agent(
    role="Performance Analyzer",
    goal="Identify underperforming strategies",
    backstory="Data-driven analyst expert in spotting optimization opportunities",
    verbose=True,
    allow_delegation=False,
    llm=ChatOpenAI(model="gpt-4-turbo", temperature=0.2),
    tools=[
        mcp_tools['find_strategies'],
        mcp_tools['get_strategy_info'],
        mcp_tools['get_campaign_info']
    ]
)

decision_maker = Agent(
    role="Decision Maker",
    goal="Make optimization decisions",
    backstory="Strategic expert making high-stakes optimization decisions",
    verbose=True,
    allow_delegation=False,
    llm=ChatOpenAI(model="gpt-4-turbo", temperature=0.3),
    tools=[]
)

execution_agent = Agent(
    role="Execution Agent",
    goal="Execute optimization actions",
    backstory="Reliable executor implementing optimization decisions",
    verbose=True,
    allow_delegation=False,
    llm=ChatOpenAI(model="gpt-4-turbo", temperature=0.1),
    tools=[
        mcp_tools['update_strategy'],
        mcp_tools['update_campaign']
    ]
)

# === TASKS ===
analysis_task = Task(
    description="""
    Analyze strategy performance to identify underperformers.

    Criteria for underperformance:
    - CTR < 0.5%
    - CPC > $2.00
    - Conversion rate < 1%
    - Budget pacing < 80%

    Organization ID: {organization_id}

    Provide detailed analysis with specific strategy IDs to pause.
    """,
    agent=performance_analyzer,
    expected_output="""
    Performance Analysis with:
    - List of underperforming strategy IDs
    - Performance metrics per strategy
    - Reason for underperformance
    """
)

decision_task = Task(
    description="""
    Review analysis and decide which strategies to pause.

    Decision criteria:
    - Pause if underperforming for > 3 days
    - Don't pause if in learning phase (< 7 days old)
    - Consider seasonal factors

    Provide clear reasoning for each decision.
    """,
    agent=decision_maker,
    expected_output="""
    Optimization Decisions with:
    - Strategies to pause (list with IDs)
    - Rationale per decision
    - Expected impact
    """,
    context=[analysis_task]
)

execution_task = Task(
    description="""
    Execute approved optimization actions.

    Actions:
    - Update strategy status to 'paused' for approved strategies
    - Record changes made
    - Verify success

    Provide confirmation of all changes.
    """,
    agent=execution_agent,
    expected_output="""
    Execution Report with:
    - Strategies paused (list with IDs)
    - Success/failure status
    - Before/after status
    """,
    context=[decision_task]
)

# === CREW ===
optimization_crew = Crew(
    agents=[performance_analyzer, decision_maker, execution_agent],
    tasks=[analysis_task, decision_task, execution_task],
    process=Process.sequential,
    verbose=2,
    memory=True
)

# === EXECUTION ===
def execute_strategy_optimization(organization_id: int):
    """Execute strategy optimization workflow."""
    result = optimization_crew.kickoff(inputs={
        'organization_id': organization_id
    })
    return result

# Example usage
if __name__ == "__main__":
    result = execute_strategy_optimization(organization_id=100048)
    print(result)
```

### 6.3 Analytics Workflow (User Story: DA-1)

**User Story**: "As a Data Analyst, I want to generate weekly budget utilization reports"

**Complete Implementation**:

```python
# === AGENTS ===
data_collector = Agent(
    role="Data Collector",
    goal="Gather comprehensive budget and spend data",
    backstory="Systematic data gatherer ensuring completeness",
    verbose=True,
    allow_delegation=False,
    llm=ChatOpenAI(model="gpt-4-turbo", temperature=0.1),
    tools=[
        mcp_tools['find_campaigns'],
        mcp_tools['get_campaign_info'],
        mcp_tools['find_strategies'],
        mcp_tools['get_strategy_info']
    ]
)

data_analyst = Agent(
    role="Data Analyst",
    goal="Analyze budget utilization patterns",
    backstory="Brilliant analyst uncovering actionable insights",
    verbose=True,
    allow_delegation=False,
    llm=ChatOpenAI(model="gpt-4-turbo", temperature=0.2),
    tools=[]
)

report_writer = Agent(
    role="Report Writer",
    goal="Create clear, actionable reports",
    backstory="Communications expert translating data into insights",
    verbose=True,
    allow_delegation=False,
    llm=ChatOpenAI(model="gpt-4-turbo", temperature=0.4),
    tools=[]
)

# === TASKS ===
collection_task = Task(
    description="""
    Collect budget and spend data for weekly report.

    Requirements:
    - Organization ID: {organization_id}
    - Time period: Last 7 days
    - Data needed:
      * Campaign budgets
      * Actual spend
      * Strategy-level spend
      * Remaining budget

    Provide structured dataset for analysis.
    """,
    agent=data_collector,
    expected_output="""
    Data Collection Report with:
    - Number of campaigns analyzed
    - Total budget allocated
    - Total spend
    - Structured dataset (JSON)
    """
)

analysis_task = Task(
    description="""
    Analyze budget utilization data.

    Calculate:
    - Overall budget utilization %
    - Spend vs. budget per campaign
    - Pacing (ahead/behind/on-track)
    - Projected end-of-month spend
    - Campaigns at risk of over/under-delivery

    Provide insights and trends.
    """,
    agent=data_analyst,
    expected_output="""
    Analysis Report with:
    - Key metrics (utilization %, pacing)
    - Trends and insights
    - Campaigns at risk
    - Recommendations
    """,
    context=[collection_task]
)

reporting_task = Task(
    description="""
    Create professional weekly budget utilization report.

    Report structure:
    1. Executive Summary
    2. Key Metrics Dashboard
    3. Budget Utilization by Campaign
    4. Pacing Analysis
    5. Recommendations
    6. Appendix (detailed data)

    Format for stakeholder presentation.
    """,
    agent=report_writer,
    expected_output="""
    Professional Report with:
    - Executive summary
    - Metrics dashboard (table)
    - Visual data representations
    - Actionable recommendations
    """,
    context=[analysis_task]
)

# === CREW ===
analytics_crew = Crew(
    agents=[data_collector, data_analyst, report_writer],
    tasks=[collection_task, analysis_task, reporting_task],
    process=Process.sequential,
    verbose=2,
    memory=True
)

# === EXECUTION ===
def generate_budget_report(organization_id: int):
    """Generate weekly budget utilization report."""
    result = analytics_crew.kickoff(inputs={
        'organization_id': organization_id
    })
    return result

# Example usage
if __name__ == "__main__":
    result = generate_budget_report(organization_id=100048)
    print(result)
```

---

## 7. MCP Tool Integration

### 7.1 Wrapping MCP Tools for CrewAI

MCP tools need to be wrapped as LangChain tools for CrewAI compatibility:

```python
# mcp_tools.py
import requests
from langchain.tools import Tool
from typing import Dict, Any

class MCPToolWrapper:
    """Wrapper for MediaMath MCP tools to work with CrewAI/LangChain"""

    def __init__(self, server_url: str, api_key: str):
        self.server_url = server_url
        self.api_key = api_key

    def _call_mcp(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Make JSON-RPC call to MCP server"""
        headers = {
            "Content-Type": "application/json",
            "X-API-Key": self.api_key
        }

        payload = {
            "jsonrpc": "2.0",
            "method": "tools/call",
            "params": {
                "name": tool_name,
                "arguments": arguments
            },
            "id": 1
        }

        response = requests.post(self.server_url, json=payload, headers=headers)
        data = response.json()

        if "error" in data:
            raise Exception(f"MCP Error: {data['error']['message']}")

        # Extract text from content array
        if "result" in data and "content" in data["result"]:
            content = data["result"]["content"]
            if len(content) > 0 and content[0]["type"] == "text":
                return content[0]["text"]

        return data.get("result", {})

    def create_tool(self, tool_name: str, description: str, param_schema: Dict[str, Any]) -> Tool:
        """Create a LangChain Tool from MCP tool definition"""

        def tool_func(**kwargs) -> str:
            """Tool execution function"""
            try:
                result = self._call_mcp(tool_name, kwargs)
                return str(result)
            except Exception as e:
                return f"Error executing {tool_name}: {str(e)}"

        return Tool(
            name=tool_name,
            description=description,
            func=tool_func
        )

def wrap_mcp_tools(server_url: str, api_key: str) -> Dict[str, Tool]:
    """Create LangChain tools for all MCP tools"""
    wrapper = MCPToolWrapper(server_url, api_key)

    tools = {
        # Campaign tools
        'find_campaigns': wrapper.create_tool(
            tool_name='find_campaigns',
            description='Find campaigns by organization ID. Returns list of campaigns.',
            param_schema={'organization_id': 'integer'}
        ),
        'get_campaign_info': wrapper.create_tool(
            tool_name='get_campaign_info',
            description='Get detailed campaign information including metrics.',
            param_schema={'campaign_id': 'integer'}
        ),
        'create_campaign': wrapper.create_tool(
            tool_name='create_campaign',
            description='Create a new campaign.',
            param_schema={'name': 'string', 'organization_id': 'integer', 'budget': 'number'}
        ),
        'update_campaign': wrapper.create_tool(
            tool_name='update_campaign',
            description='Update campaign properties.',
            param_schema={'campaign_id': 'integer', 'updates': 'object'}
        ),

        # Strategy tools
        'find_strategies': wrapper.create_tool(
            tool_name='find_strategies',
            description='Find strategies by campaign ID.',
            param_schema={'campaign_id': 'integer'}
        ),
        'get_strategy_info': wrapper.create_tool(
            tool_name='get_strategy_info',
            description='Get detailed strategy information.',
            param_schema={'strategy_id': 'integer'}
        ),
        'create_strategy': wrapper.create_tool(
            tool_name='create_strategy',
            description='Create a new strategy.',
            param_schema={'campaign_id': 'integer', 'name': 'string'}
        ),
        'update_strategy': wrapper.create_tool(
            tool_name='update_strategy',
            description='Update strategy properties.',
            param_schema={'strategy_id': 'integer', 'updates': 'object'}
        ),

        # Audience tools
        'create_audience_segment': wrapper.create_tool(
            tool_name='create_audience_segment',
            description='Create audience segment.',
            param_schema={'name': 'string', 'organization_id': 'integer'}
        ),

        # Creative tools
        'find_creatives': wrapper.create_tool(
            tool_name='find_creatives',
            description='Find creatives by organization.',
            param_schema={'organization_id': 'integer'}
        ),
        'get_creative_info': wrapper.create_tool(
            tool_name='get_creative_info',
            description='Get creative details.',
            param_schema={'creative_id': 'integer'}
        ),

        # User/Organization tools
        'find_organizations': wrapper.create_tool(
            tool_name='find_organizations',
            description='Find all organizations.',
            param_schema={}
        ),
        'find_users': wrapper.create_tool(
            tool_name='find_users',
            description='Find users by organization.',
            param_schema={'organization_id': 'integer'}
        ),
        'get_user_permissions': wrapper.create_tool(
            tool_name='get_user_permissions',
            description='Get user permissions.',
            param_schema={'user_id': 'integer'}
        ),

        # Budget tools
        'update_campaign_budget': wrapper.create_tool(
            tool_name='update_campaign_budget',
            description='Update campaign budget.',
            param_schema={'campaign_id': 'integer', 'budget': 'number'}
        ),
    }

    return tools
```

### 7.2 Tool Usage in Agents

```python
from mcp_tools import wrap_mcp_tools

# Initialize tools
mcp_tools = wrap_mcp_tools(
    server_url="https://mediamath-mcp-mock-two.vercel.app/api/message",
    api_key="mcp_mock_2025_hypermindz_44b87c1d20ed"
)

# Assign tools to agents
agent = Agent(
    role="Campaign Manager",
    goal="Manage campaigns efficiently",
    backstory="Expert campaign manager",
    tools=[
        mcp_tools['find_campaigns'],
        mcp_tools['create_campaign'],
        mcp_tools['update_campaign']
    ]
)
```

---

## 8. Implementation Roadmap

### 8.1 Phase 1: Foundation (Weeks 1-2)

**Goal**: Set up infrastructure and basic crew

**Tasks**:
- [ ] Set up Python environment (Python 3.11+, CrewAI 0.95+)
- [ ] Implement MCP tool wrapper (`mcp_tools.py`)
- [ ] Test all 28 MCP tools
- [ ] Create Campaign Setup Crew (basic version)
- [ ] Implement 3 agents: Strategist, Builder, QA
- [ ] Test Campaign Setup workflow end-to-end
- [ ] Document setup process

**Deliverables**:
- Working Campaign Setup Crew
- Tool wrapper library
- Test suite for MCP integration

### 8.2 Phase 2: Optimization Crew (Weeks 3-4)

**Goal**: Build optimization capabilities

**Tasks**:
- [ ] Implement Performance Analyzer agent
- [ ] Implement Decision Maker agent
- [ ] Implement Execution Agent
- [ ] Create Optimization Crew
- [ ] Implement performance analysis logic
- [ ] Implement optimization decision framework
- [ ] Test optimization workflows
- [ ] Add error handling and retries

**Deliverables**:
- Working Optimization Crew
- Performance benchmarks
- Decision-making framework documentation

### 8.3 Phase 3: Analytics Crew (Weeks 5-6)

**Goal**: Enable reporting and analytics

**Tasks**:
- [ ] Implement Data Collector agent
- [ ] Implement Data Analyst agent
- [ ] Implement Report Writer agent
- [ ] Create Analytics Crew
- [ ] Build report templates
- [ ] Implement data aggregation logic
- [ ] Create visualizations (tables, charts)
- [ ] Test reporting workflows

**Deliverables**:
- Working Analytics Crew
- Report templates
- Sample reports

### 8.4 Phase 4: Compliance & Creative Crews (Weeks 7-8)

**Goal**: Complete all 5 specialized crews

**Tasks**:
- [ ] Implement Compliance Crew (3 agents)
- [ ] Implement Creative Crew (3 agents)
- [ ] Test audit workflows
- [ ] Test creative analysis workflows
- [ ] Integration testing across all crews
- [ ] Performance optimization

**Deliverables**:
- Complete set of 5 crews
- Integration test suite
- Performance benchmarks

### 8.5 Phase 5: Router & Orchestration (Week 9)

**Goal**: Build intelligent routing system

**Tasks**:
- [ ] Implement request router
- [ ] Create intent classification logic
- [ ] Build crew selection algorithm
- [ ] Implement fallback handling
- [ ] Test routing accuracy
- [ ] Add monitoring and logging

**Deliverables**:
- Intelligent router
- Routing accuracy metrics
- Monitoring dashboard

### 8.6 Phase 6: Production Readiness (Week 10)

**Goal**: Prepare for production deployment

**Tasks**:
- [ ] Comprehensive testing (unit, integration, E2E)
- [ ] Performance optimization
- [ ] Error handling improvements
- [ ] Security audit
- [ ] Documentation completion
- [ ] Deployment scripts
- [ ] User training materials
- [ ] Production deployment

**Deliverables**:
- Production-ready system
- Complete documentation
- Deployment guide
- Training materials

---

## 9. Code Examples

### 9.1 Project Structure

```
crewai-mediamath/
├── README.md
├── requirements.txt
├── .env
├── .env.example
├── config/
│   ├── __init__.py
│   └── settings.py
├── crews/
│   ├── __init__.py
│   ├── campaign_setup.py
│   ├── optimization.py
│   ├── analytics.py
│   ├── compliance.py
│   └── creative.py
├── agents/
│   ├── __init__.py
│   ├── campaign_agents.py
│   ├── optimization_agents.py
│   ├── analytics_agents.py
│   ├── compliance_agents.py
│   └── creative_agents.py
├── tasks/
│   ├── __init__.py
│   ├── campaign_tasks.py
│   ├── optimization_tasks.py
│   ├── analytics_tasks.py
│   ├── compliance_tasks.py
│   └── creative_tasks.py
├── tools/
│   ├── __init__.py
│   └── mcp_tools.py
├── router/
│   ├── __init__.py
│   └── crew_router.py
├── tests/
│   ├── __init__.py
│   ├── test_mcp_tools.py
│   ├── test_crews.py
│   └── test_router.py
└── main.py
```

### 9.2 Configuration (`config/settings.py`)

```python
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # MCP Server
    MCP_SERVER_URL = os.getenv(
        "MCP_SERVER_URL",
        "https://mediamath-mcp-mock-two.vercel.app/api/message"
    )
    MCP_API_KEY = os.getenv(
        "MCP_API_KEY",
        "mcp_mock_2025_hypermindz_44b87c1d20ed"
    )

    # OpenAI
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4-turbo")

    # CrewAI
    CREW_VERBOSE = int(os.getenv("CREW_VERBOSE", "2"))
    CREW_MEMORY = os.getenv("CREW_MEMORY", "true").lower() == "true"
    CREW_MAX_RPM = int(os.getenv("CREW_MAX_RPM", "10"))

    # Organization
    DEFAULT_ORGANIZATION_ID = int(os.getenv("DEFAULT_ORGANIZATION_ID", "100048"))

settings = Settings()
```

### 9.3 Main Application (`main.py`)

```python
#!/usr/bin/env python3
"""
CrewAI MediaMath Agent System - Main Entry Point
"""

import sys
from router.crew_router import CrewRouter
from config.settings import settings

def main():
    """Main entry point for the application"""

    print("=" * 80)
    print("CrewAI MediaMath Agent System")
    print("=" * 80)

    # Initialize router
    router = CrewRouter()

    # Example requests
    requests = [
        "Create 10 holiday campaigns with $5000 budget each",
        "Pause all underperforming strategies",
        "Generate weekly budget utilization report",
        "Audit user permissions across the organization",
        "Identify creatives that need refresh"
    ]

    # Process each request
    for idx, request in enumerate(requests, 1):
        print(f"\n{idx}. Processing: '{request}'")
        print("-" * 80)

        try:
            result = router.route_and_execute(request)
            print(f"✅ Success!\n{result}")
        except Exception as e:
            print(f"❌ Error: {str(e)}")

    print("\n" + "=" * 80)
    print("All requests processed")
    print("=" * 80)

if __name__ == "__main__":
    main()
```

### 9.4 Crew Router (`router/crew_router.py`)

```python
from typing import Dict, Any
from langchain_openai import ChatOpenAI
from crews.campaign_setup import campaign_setup_crew
from crews.optimization import optimization_crew
from crews.analytics import analytics_crew
from crews.compliance import compliance_crew
from crews.creative import creative_crew
from config.settings import settings

class CrewRouter:
    """Routes user requests to appropriate CrewAI crews"""

    def __init__(self):
        self.crews = {
            'campaign_setup': campaign_setup_crew,
            'optimization': optimization_crew,
            'analytics': analytics_crew,
            'compliance': compliance_crew,
            'creative': creative_crew
        }

        self.llm = ChatOpenAI(
            model=settings.OPENAI_MODEL,
            temperature=0.1
        )

    def classify_intent(self, user_request: str) -> str:
        """Classify user intent to determine which crew to use"""

        classification_prompt = f"""
        Classify this user request into ONE of these categories:

        1. campaign_setup - Creating new campaigns, bulk setup, campaign launch
        2. optimization - Pausing strategies, budget adjustments, bid changes
        3. analytics - Reports, performance analysis, budget utilization
        4. compliance - User audits, permission checks, access reviews
        5. creative - Creative analysis, refresh planning, asset audits

        User request: "{user_request}"

        Respond with ONLY the category name (e.g., "campaign_setup").
        """

        response = self.llm.invoke(classification_prompt)
        intent = response.content.strip().lower()

        # Validate intent
        if intent not in self.crews:
            # Default to analytics if unclear
            intent = 'analytics'

        return intent

    def extract_parameters(self, user_request: str, intent: str) -> Dict[str, Any]:
        """Extract parameters from user request based on intent"""

        param_extraction_prompts = {
            'campaign_setup': """
            Extract these parameters from the request:
            - campaign_count: number of campaigns
            - budget_per_campaign: budget per campaign (if mentioned)
            - total_budget: total budget (if mentioned)
            - target_audience: audience description
            - objective: campaign objective

            Return as JSON. Use null for missing values.
            """,
            'optimization': """
            Extract these parameters:
            - organization_id: organization ID (default: 100048)
            - action: what optimization action (pause, adjust, etc.)

            Return as JSON.
            """,
            'analytics': """
            Extract these parameters:
            - organization_id: organization ID (default: 100048)
            - report_type: type of report (budget, performance, etc.)
            - time_period: time period (default: last 7 days)

            Return as JSON.
            """,
            'compliance': """
            Extract these parameters:
            - organization_id: organization ID (default: 100048)
            - audit_type: type of audit (user, permission, etc.)

            Return as JSON.
            """,
            'creative': """
            Extract these parameters:
            - organization_id: organization ID (default: 100048)
            - analysis_type: type of analysis (refresh, performance, etc.)

            Return as JSON.
            """
        }

        prompt = f"""
        User request: "{user_request}"

        {param_extraction_prompts.get(intent, "")}
        """

        response = self.llm.invoke(prompt)

        # Parse JSON response (simplified - add proper parsing)
        try:
            import json
            params = json.loads(response.content)
        except:
            params = {'organization_id': settings.DEFAULT_ORGANIZATION_ID}

        return params

    def route_and_execute(self, user_request: str) -> Any:
        """
        Route user request to appropriate crew and execute.

        Args:
            user_request: Natural language request from user

        Returns:
            Crew execution result
        """
        # 1. Classify intent
        intent = self.classify_intent(user_request)
        print(f"🎯 Intent: {intent}")

        # 2. Extract parameters
        params = self.extract_parameters(user_request, intent)
        print(f"📋 Parameters: {params}")

        # 3. Get appropriate crew
        crew = self.crews[intent]
        print(f"👥 Crew: {intent.replace('_', ' ').title()}")

        # 4. Execute crew
        print(f"🚀 Executing crew...")
        result = crew.kickoff(inputs=params)

        return result
```

---

## 10. Testing Strategy

### 10.1 Unit Tests

```python
# tests/test_mcp_tools.py
import pytest
from tools.mcp_tools import wrap_mcp_tools
from config.settings import settings

@pytest.fixture
def mcp_tools():
    """Fixture providing MCP tools"""
    return wrap_mcp_tools(
        settings.MCP_SERVER_URL,
        settings.MCP_API_KEY
    )

def test_find_campaigns(mcp_tools):
    """Test find_campaigns tool"""
    tool = mcp_tools['find_campaigns']
    result = tool.func(organization_id=100048)

    assert result is not None
    assert "campaigns" in result.lower()

def test_create_campaign(mcp_tools):
    """Test create_campaign tool"""
    tool = mcp_tools['create_campaign']
    result = tool.func(
        name="Test Campaign",
        organization_id=100048,
        budget=10000.00
    )

    assert result is not None
    assert "campaign_id" in result.lower()
```

### 10.2 Integration Tests

```python
# tests/test_crews.py
import pytest
from crews.campaign_setup import campaign_setup_crew

def test_campaign_setup_crew():
    """Test campaign setup crew end-to-end"""
    result = campaign_setup_crew.kickoff(inputs={
        'campaign_count': 2,
        'campaign_names': ['Test 1', 'Test 2'],
        'budget_per_campaign': 5000,
        'total_budget': 10000,
        'target_audience': 'Test audience',
        'objective': 'Test objective'
    })

    assert result is not None
    # Add more assertions based on expected output
```

### 10.3 End-to-End Tests

```python
# tests/test_router.py
import pytest
from router.crew_router import CrewRouter

@pytest.fixture
def router():
    """Fixture providing router"""
    return CrewRouter()

def test_router_campaign_setup(router):
    """Test router with campaign setup request"""
    result = router.route_and_execute(
        "Create 5 campaigns with $1000 budget each"
    )

    assert result is not None

def test_router_optimization(router):
    """Test router with optimization request"""
    result = router.route_and_execute(
        "Pause all underperforming strategies"
    )

    assert result is not None
```

---

## Next Steps

1. **Review this guide** with your team
2. **Set up development environment** (Python 3.11+, CrewAI, OpenAI API key)
3. **Start with Phase 1** (Foundation) - implement Campaign Setup Crew first
4. **Test thoroughly** at each phase before moving forward
5. **Iterate based on feedback** from actual usage

---

**Questions or need clarification?** Contact the HyperMindz AI Engineering Team.

**Last Updated**: November 2025
**Version**: 1.0
**Status**: Ready for Implementation
