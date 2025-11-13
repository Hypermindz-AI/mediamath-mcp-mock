"""
Task Definitions for Compliance and Creative Flows
Defines 6 task functions (3 per flow) for MediaMath MCP operations
"""

from crewai import Task
from typing import Dict, Any


# ============================================================================
# COMPLIANCE FLOW TASKS
# ============================================================================

def create_user_audit_task(agent, query: str) -> Task:
    """
    Task 1: User Audit - Audit all users and their permissions
    
    Args:
        agent: User Auditor Agent
        query: Natural language query describing the audit request
    """
    return Task(
        description=f"""
        Conduct a comprehensive user access audit based on the following request:
        
        User Request: "{query}"
        
        Steps to complete:
        1. Use find_organizations to identify the organization(s) to audit
        2. Use find_users to retrieve all users for the organization
        3. For each user, use get_user_permissions to gather their access levels
        4. Use get_user_info to get additional context about each user
        5. Document all findings systematically
        
        Audit Focus Areas:
        - Identify users with administrative or elevated privileges
        - Find inactive users who still have active access
        - Identify users with unusual permission combinations
        - Check for proper role-based access control (RBAC) implementation
        - Note any users without proper organizational assignment
        
        Compliance Checks:
        - Least privilege principle adherence
        - Segregation of duties
        - Regular access review requirements
        - Proper role assignments
        
        Expected Output:
        Provide a structured audit report including:
        - Total number of users audited
        - List of users with their roles and permissions
        - Categorization by access level (admin, manager, user, etc.)
        - List of users with elevated privileges
        - Any anomalies or concerns identified
        - Summary statistics (users by role, active vs inactive, etc.)
        """,
        
        agent=agent,
        expected_output="""
        User Audit Report containing:
        - Executive Summary (3-5 sentences)
        - Total Users Audited: [number]
        - User Breakdown by Role/Permission Level (table format)
        - Users with Administrative Access (list with details)
        - Inactive Users with Active Access (if any)
        - Compliance Issues Found (categorized list)
        - Risk Assessment per finding (high/medium/low)
        - Detailed User Permission Table
        """
    )


def create_permission_analysis_task(agent, query: str) -> Task:
    """
    Task 2: Permission Analysis - Analyze permission patterns for compliance
    
    Args:
        agent: Permission Analyzer Agent  
        query: Natural language query (used for context from previous task)
    """
    return Task(
        description=f"""
        Analyze the user permission data gathered in the audit to identify compliance issues.
        
        Original Request Context: "{query}"
        
        Analysis Framework:
        1. Review all user permissions from the audit data
        2. Identify permission patterns:
           - Common role assignments
           - Outlier permissions (users with unusual access)
           - Overly permissive access (users with more permissions than role requires)
           - Under-privileged users (users who may need more access)
        
        3. Check for compliance violations:
           - Users with admin rights who shouldn't have them
           - Conflicting permissions (e.g., creator + approver on same entity)
           - Stale accounts with active permissions
           - Missing segregation of duties
           - Users with access to resources outside their organization
        
        4. Risk Assessment:
           - Categorize each finding by risk level (CRITICAL, HIGH, MEDIUM, LOW)
           - Consider business impact and likelihood of exploitation
           - Identify most urgent issues requiring immediate action
        
        5. Recommend remediation actions:
           - Specific permissions to revoke
           - Role changes needed
           - Users to disable or review
           - Policy changes to implement
        
        Expected Output:
        A comprehensive permission analysis with prioritized findings and recommendations.
        """,
        
        agent=agent,
        expected_output="""
        Permission Analysis Report containing:
        - Analysis Summary (key findings in 3-5 bullet points)
        - Permission Pattern Analysis:
          * Common role patterns identified
          * Outlier permissions detected
          * Over/under-privileged accounts
        - Compliance Violations Found (prioritized by risk):
          * CRITICAL issues (require immediate action)
          * HIGH priority issues (address within 1 week)
          * MEDIUM priority issues (address within 1 month)
          * LOW priority issues (address in next quarterly review)
        - Risk Assessment Summary (overall risk level and justification)
        - Remediation Recommendations:
          * Immediate actions (today)
          * Short-term actions (this week)
          * Long-term improvements (this quarter)
        - Recommended Timeline for Fixes
        """
    )


def create_audit_reporting_task(agent, query: str) -> Task:
    """
    Task 3: Audit Reporting - Create comprehensive compliance audit report
    
    Args:
        agent: Audit Reporter Agent
        query: Natural language query (for report title/context)
    """
    return Task(
        description=f"""
        Create a professional, comprehensive compliance audit report for leadership and stakeholders.
        
        Report Context: "{query}"
        
        Report Requirements:
        1. Executive Summary
           - Overall compliance status (Compliant / Non-Compliant / Partial)
           - Number of issues found by severity
           - Top 3 most critical findings
           - Overall risk level assessment
           - Recommended actions summary
        
        2. Audit Scope and Methodology
           - What was audited (users, permissions, access levels)
           - Time period covered
           - Tools and methods used
           - Compliance frameworks referenced (SOX, GDPR, SOC2, etc.)
        
        3. Detailed Findings
           - Organize by severity (Critical, High, Medium, Low)
           - For each finding provide:
             * Description of the issue
             * Evidence/examples
             * Risk assessment
             * Business impact
             * Affected users/resources
        
        4. Risk Assessment Matrix
           - Overall organizational risk level
           - Risk by category (access control, segregation of duties, etc.)
           - Trend analysis (improving/declining)
        
        5. Recommendations
           - Prioritized list of remediation actions
           - Quick wins (can be fixed immediately)
           - Long-term improvements
           - Policy/process changes needed
        
        6. Remediation Plan
           - Specific action items with owners
           - Timeline for each action
           - Success criteria
           - Follow-up audit schedule
        
        7. Appendices
           - Detailed data tables
           - Full user permission listings
           - Compliance checklist results
        
        Audience: C-Level Executives, Compliance Team, Security Team, Board of Directors
        
        Formatting: Professional, clear, actionable, evidence-based
        """,
        
        agent=agent,
        expected_output="""
        Professional Compliance Audit Report containing:
        
        EXECUTIVE SUMMARY
        - Compliance Status: [Compliant/Non-Compliant/Partial]
        - Critical Findings: [number]
        - Overall Risk Level: [Critical/High/Medium/Low]
        - Top 3 Issues (bullet points)
        - Recommended Priority Actions (bullet points)
        
        AUDIT SCOPE & METHODOLOGY
        - Scope statement
        - Audit period
        - Methodology description
        - Compliance frameworks applied
        
        FINDINGS (organized by severity)
        - CRITICAL Issues (detailed descriptions)
        - HIGH Priority Issues (detailed descriptions)
        - MEDIUM Priority Issues (detailed descriptions)
        - LOW Priority Issues (detailed descriptions)
        
        RISK ASSESSMENT
        - Overall risk rating and justification
        - Risk breakdown by category
        - Comparison to previous audits (if available)
        
        RECOMMENDATIONS
        - Immediate Actions (do now)
        - Short-term Actions (this week/month)
        - Long-term Improvements (this quarter)
        - Policy Changes Needed
        
        REMEDIATION PLAN
        - Action item table (Action | Owner | Timeline | Success Criteria)
        - Follow-up audit schedule
        - Monitoring recommendations
        
        APPENDICES
        - Detailed data tables
        - Full compliance checklist
        - Reference documentation
        
        Format: Professional business report suitable for executive presentation
        """
    )


# ============================================================================
# CREATIVE FLOW TASKS
# ============================================================================

def create_creative_collection_task(agent, query: str) -> Task:
    """
    Task 1: Creative Collection - Gather all creative assets and usage data
    
    Args:
        agent: Creative Collector Agent
        query: Natural language query describing the creative analysis request
    """
    return Task(
        description=f"""
        Gather comprehensive data on all creative assets and their usage across campaigns.
        
        User Request: "{query}"
        
        Collection Steps:
        1. Use find_creatives to get all creative assets
        2. For each creative, use get_creative_info to gather detailed information:
           - Creative ID, name, type (banner, video, native, etc.)
           - File specifications (size, format, dimensions)
           - Status (active, inactive, paused)
           - Creation date and last modified date
           - Performance metrics (impressions, clicks, CTR)
        
        3. Use find_campaigns to identify which campaigns use each creative
        4. Use get_campaign_info to gather campaign context:
           - Campaign names and IDs
           - Campaign budgets and spend
           - Campaign performance
           - Start and end dates
        
        5. Map creative usage:
           - Which creatives are used in which campaigns
           - How many campaigns each creative appears in
           - Budget allocated to campaigns using each creative
           - Performance by creative across campaigns
        
        6. Categorize creatives:
           - By type (display banners, video ads, native ads, etc.)
           - By performance level (high, medium, low)
           - By age (new: <30 days, current: 30-90 days, old: >90 days)
           - By usage (heavily used, moderately used, underutilized)
        
        Data Quality Checks:
        - Ensure all active creatives are captured
        - Verify performance data is available
        - Check for orphaned creatives (not used in any campaign)
        - Identify missing metadata
        
        Expected Output:
        A comprehensive creative inventory with performance and usage data.
        """,
        
        agent=agent,
        expected_output="""
        Creative Inventory Report containing:
        - Total Creatives Count: [number]
        - Creatives by Type Breakdown:
          * Display Banners: [number]
          * Video Ads: [number]
          * Native Ads: [number]
          * Other: [number]
        - Creatives by Status:
          * Active: [number]
          * Inactive: [number]
          * Paused: [number]
        - Creatives by Age:
          * New (<30 days): [number]
          * Current (30-90 days): [number]
          * Old (>90 days): [number]
        - Usage Summary:
          * Total campaigns using creatives: [number]
          * Average campaigns per creative: [number]
          * Most used creative: [name] ([number] campaigns)
          * Unused creatives: [number]
        - Performance Summary:
          * Average CTR across all creatives: [percentage]
          * Top performing creative: [name] (CTR: [percentage])
          * Bottom performing creative: [name] (CTR: [percentage])
        - Detailed Creative List (table):
          Creative_ID | Name | Type | Status | Age_Days | Campaigns_Used | Impressions | Clicks | CTR | Last_Modified
        """
    )


def create_creative_analysis_task(agent, query: str) -> Task:
    """
    Task 2: Creative Analysis - Analyze performance and identify refresh needs
    
    Args:
        agent: Creative Analyst Agent
        query: Natural language query (used for context)
    """
    return Task(
        description=f"""
        Analyze creative performance data to identify which creatives need refresh.
        
        Original Request Context: "{query}"
        
        Analysis Framework:
        
        1. Performance Analysis:
           - Calculate key metrics for each creative:
             * Click-Through Rate (CTR)
             * Conversion Rate (if available)
             * Cost per Click (CPC)
             * Engagement rate
           - Benchmark against category averages
           - Identify top performers (top 20%)
           - Identify poor performers (bottom 20%)
        
        2. Creative Fatigue Indicators:
           - Declining CTR over time (compare recent vs. historical)
           - High frequency with low engagement
           - Age of creative (>90 days is high risk for fatigue)
           - Impression count vs. engagement (high impressions, low clicks)
           - Comparison to newer creative variants
        
        3. Usage Pattern Analysis:
           - Overused creatives (appearing in too many campaigns)
           - Underutilized high-performers (good performance, low usage)
           - Campaign-creative fit (is creative appropriate for campaign)
           - Audience segment performance (how creative performs by audience)
        
        4. Refresh Priority Scoring:
           Score each creative based on:
           - Performance decline (weight: 40%)
           - Age/staleness (weight: 30%)
           - Campaign budget impact (weight: 20%)
           - Strategic importance (weight: 10%)
           
           Priority Levels:
           - URGENT: Score >80 - Immediate refresh needed
           - HIGH: Score 60-80 - Refresh within 2 weeks
           - MEDIUM: Score 40-60 - Refresh within 1 month
           - LOW: Score <40 - Monitor, refresh within quarter
        
        5. Opportunity Identification:
           - High-budget campaigns with underperforming creatives
           - Seasonal refresh opportunities
           - A/B testing opportunities
           - New creative format opportunities
        
        Expected Output:
        Creative performance analysis with prioritized refresh recommendations.
        """,
        
        agent=agent,
        expected_output="""
        Creative Performance Analysis Report containing:
        
        PERFORMANCE SUMMARY
        - Overall Creative Performance: [Good/Fair/Poor]
        - Average CTR: [percentage]
        - Average CPC: [amount]
        - Performance Distribution:
          * High Performers (top 20%): [number] creatives
          * Average Performers (middle 60%): [number] creatives
          * Low Performers (bottom 20%): [number] creatives
        
        TOP PERFORMING CREATIVES (Top 5)
        - Creative ID | Name | Type | CTR | Impressions | Campaigns | Why It Works
        
        CREATIVES NEEDING REFRESH (Prioritized)
        
        URGENT PRIORITY (Refresh Immediately):
        - Creative ID | Name | Current CTR | Age | Budget Impact | Refresh Reason
        
        HIGH PRIORITY (Refresh Within 2 Weeks):
        - Creative ID | Name | Current CTR | Age | Budget Impact | Refresh Reason
        
        MEDIUM PRIORITY (Refresh Within 1 Month):
        - Creative ID | Name | Current CTR | Age | Budget Impact | Refresh Reason
        
        CREATIVE FATIGUE ANALYSIS
        - Number of creatives showing fatigue: [number]
        - Average performance decline: [percentage]
        - Creatives with declining CTR trend: [list]
        
        PERFORMANCE TRENDS
        - Creative performance vs. 30 days ago
        - Creative performance vs. 90 days ago
        - Seasonal patterns identified
        
        OPPORTUNITIES
        - High-budget campaigns needing better creatives
        - Underutilized high performers (can be expanded)
        - A/B testing recommendations
        - New format opportunities
        
        KEY INSIGHTS
        - Top 3 insights from the analysis
        - Recommended creative strategy adjustments
        """
    )


def create_refresh_planning_task(agent, query: str) -> Task:
    """
    Task 3: Refresh Planning - Create actionable creative refresh plan
    
    Args:
        agent: Refresh Planner Agent
        query: Natural language query (for context)
    """
    return Task(
        description=f"""
        Develop an actionable creative refresh plan based on performance analysis.
        
        Original Request Context: "{query}"
        
        Planning Requirements:
        
        1. Prioritization Framework:
           Create a prioritized list of creatives to refresh based on:
           - Performance impact (high spend campaigns first)
           - Resource requirements (quick wins vs. major redesigns)
           - Timeline constraints (urgent vs. planned refreshes)
           - Strategic alignment (brand campaigns vs. performance campaigns)
        
        2. Refresh Strategy per Creative:
           For each creative needing refresh, specify:
           
           - Refresh Type:
             * Message Refresh: New copy/messaging, keep visual style
             * Visual Refresh: New imagery/design, keep core message
             * Complete Redesign: New concept, message, and design
             * Format Update: New size/format of existing creative
             * Seasonal Update: Adapt for current season/event
           
           - Specific Recommendations:
             * What's not working in current creative
             * What to keep (if partial refresh)
             * What to change
             * New direction suggestions
             * Reference to high-performing creatives for inspiration
        
        3. Production Timeline:
           For each creative:
           - Estimated production time (hours/days)
           - Dependencies (creative brief, assets, approvals)
           - Recommended launch date
           - Testing period before full rollout
        
        4. Resource Requirements:
           - Creative team hours needed
           - Design resources required
           - Video production needs (if applicable)
           - Copywriting needs
           - Stock assets or photography needs
           - Budget estimate for production
        
        5. Success Metrics:
           - Target performance improvements (CTR lift, etc.)
           - Testing methodology (A/B test structure)
           - Monitoring period and KPIs
           - Rollback plan if new creative underperforms
        
        6. Implementation Roadmap:
           - Week-by-week plan
           - Dependencies and critical path
           - Resource allocation
           - Milestone checkpoints
        
        Expected Output:
        A comprehensive, actionable creative refresh plan with timelines and priorities.
        """,
        
        agent=agent,
        expected_output="""
        Creative Refresh Plan containing:
        
        EXECUTIVE SUMMARY
        - Total creatives to refresh: [number]
        - Estimated timeline: [weeks]
        - Estimated budget: [amount]
        - Expected performance improvement: [percentage]
        - Quick wins identified: [number]
        
        PRIORITIZED REFRESH LIST
        
        URGENT (Start Immediately):
        Creative_ID | Name | Refresh_Type | Est_Hours | Launch_Date | Expected_Impact | Assigned_To
        
        HIGH PRIORITY (Start Within 2 Weeks):
        Creative_ID | Name | Refresh_Type | Est_Hours | Launch_Date | Expected_Impact | Assigned_To
        
        MEDIUM PRIORITY (Start Within 1 Month):
        Creative_ID | Name | Refresh_Type | Est_Hours | Launch_Date | Expected_Impact | Assigned_To
        
        DETAILED REFRESH STRATEGIES
        
        For each priority creative:
        - Current Performance: [metrics]
        - Why Refresh Needed: [reason]
        - Refresh Type: [Message/Visual/Complete/Format/Seasonal]
        - What to Keep: [elements]
        - What to Change: [elements]
        - New Direction: [description]
        - Inspiration Reference: [high-performing creative IDs]
        - Success Metrics: [target CTR, etc.]
        
        PRODUCTION TIMELINE (Gantt-style)
        Week 1: [activities]
        Week 2: [activities]
        Week 3: [activities]
        Week 4: [activities]
        ...
        
        RESOURCE REQUIREMENTS
        - Creative Designer: [hours]
        - Copywriter: [hours]
        - Video Production: [hours if applicable]
        - Project Manager: [hours]
        - Total Team Hours: [hours]
        - Estimated Budget: [amount]
        
        TESTING & ROLLOUT PLAN
        - A/B Testing Strategy (for each creative)
        - Test Duration: [days]
        - Success Criteria: [metric thresholds]
        - Rollout Plan (gradual vs. full launch)
        - Monitoring Schedule
        
        EXPECTED IMPACT
        - Projected CTR improvement: [percentage]
        - Estimated additional clicks: [number]
        - Potential cost savings: [amount]
        - ROI of creative refresh: [ratio]
        
        RISK MITIGATION
        - Potential risks identified
        - Rollback plan for underperforming creatives
        - Contingency timeline
        
        Format: Actionable project plan suitable for creative team execution
        """
    )


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_compliance_tasks(agents: list, query: str) -> list:
    """
    Get all compliance flow tasks
    
    Args:
        agents: List of [user_auditor, permission_analyzer, audit_reporter]
        query: Natural language query from user
    """
    return [
        create_user_audit_task(agents[0], query),
        create_permission_analysis_task(agents[1], query),
        create_audit_reporting_task(agents[2], query)
    ]


def get_creative_tasks(agents: list, query: str) -> list:
    """
    Get all creative flow tasks
    
    Args:
        agents: List of [creative_collector, creative_analyst, refresh_planner]
        query: Natural language query from user
    """
    return [
        create_creative_collection_task(agents[0], query),
        create_creative_analysis_task(agents[1], query),
        create_refresh_planning_task(agents[2], query)
    ]


# ============================================================================
# OPTIMIZATION FLOW TASKS
# ============================================================================

def analyze_performance_task(agent, nl_query: str, organization_id: int = 100048) -> Task:
    """
    Task 1: Performance Analysis - Analyze campaigns/strategies based on NL query
    
    Args:
        agent: Performance Analyzer Agent
        nl_query: Natural language optimization query
        organization_id: MediaMath organization ID
    """
    return Task(
        description=f"""
        Analyze campaign and strategy performance based on this user request:
        "{nl_query}"

        Your goal is to interpret the query and identify campaigns/strategies that match
        the criteria specified in the query.

        Steps:
        1. Parse the natural language query to understand the performance criteria
           Examples:
           - "CTR < 0.5%" means find strategies with Click-Through Rate below 0.5%
           - "underperforming" typically means CTR < 0.5% OR CPC > $2.00
           - "low engagement" means CTR < 0.3%
           - "high cost" means CPC > $3.00

        2. Use find_campaigns tool to get all campaigns for organization {organization_id}

        3. For each campaign, use get_campaign_info to get detailed metrics

        4. Use find_strategies to get strategies for campaigns

        5. Use get_strategy_info to get detailed strategy metrics

        6. Identify campaigns/strategies that match the query criteria

        7. Calculate and report key metrics:
           - CTR (Click-Through Rate) = (clicks / impressions) * 100
           - CPC (Cost Per Click) = spend / clicks
           - Budget utilization = (spend / budget) * 100

        Expected Output:
        Provide a detailed performance analysis report in JSON format with matching campaigns and strategies.
        """,
        agent=agent,
        expected_output="""
        JSON report with:
        - Query interpretation
        - List of campaigns matching criteria
        - List of strategies matching criteria
        - Performance metrics (CTR, CPC, spend, budget)
        - Reasons why each entity matches the criteria
        """
    )


def decide_optimizations_task(agent, nl_query: str) -> Task:
    """
    Task 2: Decision Making - Make optimization decisions based on analysis
    
    Args:
        agent: Decision Maker Agent
        nl_query: Natural language optimization query
    """
    return Task(
        description=f"""
        Based on the performance analysis, make optimization decisions that align with
        this user request: "{nl_query}"

        Your goal is to translate the query intent into specific, actionable optimization decisions.

        Query Intent Examples:
        - "Pause underperforming strategies" → Decide which strategies to pause and why
        - "Optimize budgets" → Decide budget reallocations between campaigns
        - "Reduce spend on low CTR campaigns" → Decide budget reductions

        Decision Framework:
        1. Review the performance analysis from the previous task
        2. Understand the action intent in the query
        3. For each matching campaign/strategy, decide the specific action
        4. Apply business rules (e.g., minimum budget $100, don't pause learning phase)
        5. Provide clear rationale for each decision

        Expected Output:
        Provide optimization decisions in JSON format with actions, rationale, and expected impact.
        """,
        agent=agent,
        expected_output="""
        JSON decisions document with:
        - Decision summary
        - List of specific actions to take
        - Rationale for each action
        - Expected impact and risk assessment
        - Priority levels
        """
    )


def execute_optimizations_task(agent) -> Task:
    """
    Task 3: Execution - Execute optimization actions using MCP tools
    
    Args:
        agent: Execution Agent
    """
    return Task(
        description="""
        Execute the approved optimization actions using the MediaMath MCP tools.

        Your goal is to implement each optimization decision accurately and verify success.

        Execution Steps:
        1. Review the optimization decisions from the previous task
        2. For each action, determine which MCP tool to use
        3. Execute each action in priority order
        4. Verify success and record changes
        5. Handle errors gracefully

        MCP Tool Examples:
        - update_strategy: {"strategy_id": 2001, "updates": {"status": "paused"}}
        - update_campaign_budget: {"campaign_id": 1001, "budget": 7000.00}

        Expected Output:
        Provide execution report in JSON format with all executed actions and results.
        """,
        agent=agent,
        expected_output="""
        JSON execution report with:
        - Execution summary
        - List of executed actions with before/after values
        - List of any failed actions with error details
        - Success metrics
        """
    )


def create_optimization_tasks(agents: Dict[str, Any], nl_query: str, organization_id: int = 100048) -> list:
    """
    Create all optimization tasks with proper dependencies
    
    Args:
        agents: Dictionary of agents (from agent_definitions)
        nl_query: Natural language optimization query
        organization_id: MediaMath organization ID
        
    Returns:
        List of tasks in execution order
    """
    # Task 1: Analyze performance
    task1 = analyze_performance_task(
        agent=agents['performance_analyzer'],
        nl_query=nl_query,
        organization_id=organization_id
    )

    # Task 2: Make decisions (depends on task1)
    task2 = decide_optimizations_task(
        agent=agents['decision_maker'],
        nl_query=nl_query
    )
    task2.context = [task1]  # Set dependency

    # Task 3: Execute optimizations (depends on task2)
    task3 = execute_optimizations_task(
        agent=agents['execution_agent']
    )
    task3.context = [task2]  # Set dependency

    return [task1, task2, task3]
