"""
Analytics Agents for Analytics Flow
Defines the 3 specialized agents for the analytics workflow
"""

import os
from crewai import Agent
from langchain_openai import ChatOpenAI
from typing import List
from langchain.tools import Tool


def create_data_collector_agent(tools: List[Tool]) -> Agent:
    """
    Create Data Collector Agent

    This agent gathers data based on natural language queries by:
    - Understanding the query intent
    - Identifying which data sources to query
    - Collecting campaign, strategy, and performance data
    - Organizing data for analysis

    Args:
        tools: List of MCP tools for data collection

    Returns:
        Configured CrewAI Agent
    """
    return Agent(
        role="Data Collection Specialist",
        goal="Gather comprehensive campaign and performance data from MediaMath based on natural language queries",
        backstory="""You are a systematic data gatherer with expertise in digital advertising platforms.
        You excel at understanding what data is needed based on natural language requests and know exactly
        which MediaMath APIs to query. You ensure data completeness and organize information efficiently
        for downstream analysis. You have 8 years of experience working with ad tech platforms and
        understand the relationships between campaigns, strategies, and performance metrics.""",
        verbose=True,
        allow_delegation=False,
        llm=ChatOpenAI(
            model=os.getenv("OPENAI_MODEL", "gpt-4-turbo"),
            temperature=0.1
        ),
        tools=tools  # Will use: find_campaigns, get_campaign_info, find_strategies, get_strategy_info
    )


def create_data_analyst_agent() -> Agent:
    """
    Create Data Analyst Agent

    This agent analyzes collected data by:
    - Calculating KPIs and performance metrics
    - Identifying trends and patterns
    - Comparing performance across segments
    - Extracting actionable insights
    - Detecting anomalies and outliers

    Args:
        None (analysis agent doesn't need tools)

    Returns:
        Configured CrewAI Agent
    """
    return Agent(
        role="Data Analyst",
        goal="Analyze collected data to extract meaningful insights, trends, and actionable recommendations",
        backstory="""You are a brilliant data analyst who can see patterns others miss. With 10 years
        of experience in digital advertising analytics, you excel at calculating KPIs, identifying trends,
        and uncovering actionable insights. You understand the nuances of CTR, CPC, conversion rates,
        budget pacing, and ROI metrics. You can quickly spot underperforming campaigns, budget inefficiencies,
        and optimization opportunities. Your analyses have driven millions in performance improvements.""",
        verbose=True,
        allow_delegation=False,
        llm=ChatOpenAI(
            model=os.getenv("OPENAI_MODEL", "gpt-4-turbo"),
            temperature=0.2
        ),
        tools=[]  # Analysis-only, no tool calls needed
    )


def create_report_writer_agent() -> Agent:
    """
    Create Report Writer Agent

    This agent creates formatted reports by:
    - Translating complex data into clear narratives
    - Structuring reports for different audiences
    - Highlighting key insights and recommendations
    - Creating executive summaries
    - Formatting data in tables and visualizations

    Args:
        None (report writing agent doesn't need tools)

    Returns:
        Configured CrewAI Agent
    """
    return Agent(
        role="Report Writer",
        goal="Create clear, actionable reports that communicate insights to stakeholders effectively",
        backstory="""You are a communications expert who translates complex data analysis into clear,
        compelling reports. With a background in both data analytics and business communications, you know
        how to present insights to different audiences - from technical teams to executives to clients.
        Your reports drive action and decision-making because you focus on the 'so what' and 'what next'.
        You've created reports for Fortune 500 companies and your work is known for its clarity and
        actionability. You structure reports with executive summaries, key metrics dashboards, insights,
        and specific recommendations.""",
        verbose=True,
        allow_delegation=False,
        llm=ChatOpenAI(
            model=os.getenv("OPENAI_MODEL", "gpt-4-turbo"),
            temperature=0.4
        ),
        tools=[]  # Report writing, no tool calls needed
    )


def create_analytics_agents(mcp_tools: dict) -> dict:
    """
    Create all analytics agents with appropriate tools

    Args:
        mcp_tools: Dictionary of MCP tools from shared/mcp_tools.py

    Returns:
        Dictionary of agent name to Agent instance
    """
    # Select tools for data collector
    collector_tools = [
        mcp_tools['find_campaigns'],
        mcp_tools['get_campaign_info'],
        mcp_tools['find_strategies'],
        mcp_tools['get_strategy_info'],
        mcp_tools['find_organizations']
    ]

    return {
        'data_collector': create_data_collector_agent(collector_tools),
        'data_analyst': create_data_analyst_agent(),
        'report_writer': create_report_writer_agent()
    }
