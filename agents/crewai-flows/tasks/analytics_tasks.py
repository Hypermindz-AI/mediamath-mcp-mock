"""
Analytics Tasks for Analytics Flow
Defines the 3 task functions used in the analytics workflow
"""

from crewai import Task, Agent
from typing import Dict, Any


def collect_data_task(agent: Agent, query: str, organization_id: int = 100048) -> Task:
    """
    Create Data Collection Task

    This task gathers all necessary data based on the natural language query.

    Args:
        agent: Data Collector agent
        query: Natural language query from user
        organization_id: Organization ID to query data for

    Returns:
        Configured CrewAI Task
    """
    return Task(
        description=f"""
        Collect campaign and performance data based on this natural language query:
        "{query}"

        Your responsibilities:
        1. Analyze the query to understand what data is needed
           - If query mentions "budget utilization", collect budget and spend data
           - If query mentions "performance", collect impressions, clicks, CTR, CPC
           - If query mentions specific campaigns/strategies, focus on those
           - If query is general, collect data for organization {organization_id}

        2. Use MCP tools to gather data:
           - find_campaigns: Get list of campaigns for organization {organization_id}
           - get_campaign_info: Get detailed metrics for each campaign
           - find_strategies: Get strategies for campaigns
           - get_strategy_info: Get detailed strategy metrics

        3. Organize collected data into structured format:
           - Campaign summary (name, ID, budget, spend, status)
           - Strategy breakdown per campaign
           - Performance metrics (impressions, clicks, CTR, CPC, conversions)
           - Budget utilization (% spent, remaining, pacing)

        4. Ensure data completeness:
           - Verify all requested metrics are collected
           - Flag any missing or incomplete data
           - Note the date range for the data

        Expected Output Format:
        - Total campaigns collected: [number]
        - Organization ID: {organization_id}
        - Data fields: [list of metrics collected]
        - Structured dataset in JSON format with all campaigns and strategies
        - Any data collection issues or notes
        """,
        agent=agent,
        expected_output="""
        Data Collection Report containing:
        - Executive summary (2-3 sentences)
        - Number of campaigns and strategies collected
        - Complete structured dataset in JSON format with:
          * Campaign details (id, name, budget, spend, status)
          * Strategy details (id, name, type, budget, bid)
          * Performance metrics (impressions, clicks, CTR, CPC)
        - Data completeness assessment
        - Date range covered
        """
    )


def analyze_data_task(agent: Agent, query: str, context: list = None) -> Task:
    """
    Create Data Analysis Task

    This task analyzes the collected data to extract insights.

    Args:
        agent: Data Analyst agent
        query: Natural language query from user
        context: List of previous tasks (data collection task)

    Returns:
        Configured CrewAI Task
    """
    return Task(
        description=f"""
        Analyze the collected data to answer this query:
        "{query}"

        Your responsibilities:
        1. Review the structured dataset from the Data Collection task

        2. Calculate key performance indicators (KPIs):
           - Total budget allocated vs. total spend
           - Overall budget utilization percentage
           - Average CTR (Click-Through Rate) across campaigns
           - Average CPC (Cost Per Click)
           - Conversion metrics if available
           - Budget pacing (ahead/behind/on-track)

        3. Identify trends and patterns:
           - Which campaigns are performing best/worst
           - Budget efficiency (spend vs. performance)
           - Strategy-level performance variations
           - Time-based trends if data available
           - Outliers or anomalies

        4. Answer the specific query intent:
           - If "budget utilization", focus on spend analysis and pacing
           - If "performance", focus on CTR, CPC, conversions
           - If "underperforming", identify campaigns below benchmarks
           - If "top performers", rank by key metrics

        5. Generate actionable insights:
           - What's working well and why
           - What needs attention and why
           - Optimization opportunities
           - Risk factors (overspend, underspend, low performance)

        Analysis Guidelines:
        - Use the actual data from collection task
        - Calculate percentages and ratios
        - Compare against industry benchmarks (CTR > 0.5%, CPC < $2.00)
        - Provide specific examples with campaign names and numbers
        - Explain the "why" behind the numbers

        Expected Output Format:
        - Key metrics summary (dashboard-style)
        - Top 3-5 insights with supporting data
        - Performance breakdown (best/worst performers)
        - Trend analysis
        - Specific recommendations
        """,
        agent=agent,
        expected_output="""
        Analytical Report containing:
        - Executive Summary (3-5 key findings)
        - KPI Dashboard (formatted table with key metrics)
        - Performance Analysis:
          * Top performing campaigns (top 3 with metrics)
          * Underperforming campaigns (bottom 3 with metrics)
          * Budget utilization analysis
        - Trend Analysis (patterns observed)
        - Risk Assessment (campaigns needing attention)
        - Top 5 Actionable Insights with supporting data
        - Recommendations based on analysis
        """,
        context=context or []
    )


def write_report_task(agent: Agent, query: str, context: list = None) -> Task:
    """
    Create Report Writing Task

    This task creates a formatted, stakeholder-ready report.

    Args:
        agent: Report Writer agent
        query: Natural language query from user
        context: List of previous tasks (collection and analysis tasks)

    Returns:
        Configured CrewAI Task
    """
    return Task(
        description=f"""
        Create a professional, stakeholder-ready report that answers:
        "{query}"

        Your responsibilities:
        1. Review all previous outputs:
           - Data collection results
           - Analysis findings and insights

        2. Structure the report professionally:
           - Executive Summary (3-5 bullet points, key takeaways)
           - Key Metrics Dashboard (formatted table)
           - Detailed Findings (organized by theme)
           - Insights & Recommendations (actionable)
           - Appendix (supporting data)

        3. Write for your audience:
           - Use clear, jargon-free language
           - Explain technical metrics in business terms
           - Focus on "so what" and "what next"
           - Highlight actionable insights
           - Use visual formatting (tables, bullets, headers)

        4. Include specific elements:
           - Clear headings and sections
           - Formatted tables for metrics
           - Bullet points for insights
           - Numbered recommendations
           - Data-backed statements with examples

        5. Ensure report quality:
           - Professional tone
           - Grammatically correct
           - Consistent formatting
           - Complete sentences
           - Logical flow

        Report Structure Template:

        # [Report Title Based on Query]

        ## Executive Summary
        - Key finding 1
        - Key finding 2
        - Key finding 3

        ## Key Metrics Dashboard
        | Metric | Value | Status |
        |--------|-------|--------|
        | [metric] | [value] | [status] |

        ## Performance Analysis
        ### Top Performers
        [Details with supporting data]

        ### Areas for Improvement
        [Details with supporting data]

        ## Budget Analysis
        [Budget utilization, pacing, allocation]

        ## Insights & Trends
        1. [Insight with supporting data]
        2. [Insight with supporting data]

        ## Recommendations
        1. [Actionable recommendation]
        2. [Actionable recommendation]

        ## Appendix
        [Detailed data tables]

        ---
        Report generated based on query: "{query}"
        """,
        agent=agent,
        expected_output="""
        Professional Report in Markdown format containing:
        - Report Title
        - Executive Summary (3-5 key points)
        - Key Metrics Dashboard (formatted table)
        - Performance Analysis section with specific campaigns
        - Budget Analysis section with utilization metrics
        - Insights & Trends section (5+ insights)
        - Recommendations section (3-5 actionable items)
        - Appendix with supporting data
        - Clear formatting with headers, tables, and bullets
        - Professional tone suitable for stakeholder presentation
        """,
        context=context or []
    )


def create_analytics_tasks(agents: Dict[str, Agent], query: str, organization_id: int = 100048) -> list:
    """
    Create all analytics tasks for the flow

    Args:
        agents: Dictionary of agents from analytics_agents
        query: Natural language query from user
        organization_id: Organization ID to analyze

    Returns:
        List of configured tasks in execution order
    """
    # Task 1: Data Collection
    collection_task = collect_data_task(
        agent=agents['data_collector'],
        query=query,
        organization_id=organization_id
    )

    # Task 2: Data Analysis (depends on collection)
    analysis_task = analyze_data_task(
        agent=agents['data_analyst'],
        query=query,
        context=[collection_task]
    )

    # Task 3: Report Writing (depends on analysis)
    report_task = write_report_task(
        agent=agents['report_writer'],
        query=query,
        context=[collection_task, analysis_task]
    )

    return [collection_task, analysis_task, report_task]
