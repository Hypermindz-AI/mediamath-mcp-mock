"""
Agent Definitions for Optimization Flow
Defines the three specialized agents needed for campaign optimization
"""

from crewai import Agent
from langchain_openai import ChatOpenAI
from typing import List
from langchain.tools import Tool


def create_performance_analyzer(tools: List[Tool], llm_model: str = "gpt-4-turbo") -> Agent:
    """
    Create Performance Analyzer Agent

    This agent analyzes campaign and strategy performance based on natural language
    query requirements (e.g., "CTR < 0.5%", "underperforming strategies").

    Args:
        tools: List of MCP tools for data retrieval
        llm_model: OpenAI model to use

    Returns:
        Configured Agent instance
    """
    return Agent(
        role="Performance Analyzer",
        goal="Analyze campaign and strategy performance based on user-defined criteria from natural language queries",
        backstory="""You are a data-driven performance analyst with deep expertise in
        digital advertising metrics. You excel at interpreting natural language performance
        requirements (like "CTR < 0.5%" or "underperforming with low engagement") and
        translating them into concrete performance assessments.

        You understand nuances in campaign data and can identify when strategies are
        underperforming based on various metrics: CTR (Click-Through Rate), CPC (Cost Per Click),
        conversion rates, budget pacing, and more.

        Your insights are always backed by data and you provide clear explanations of
        why certain campaigns or strategies meet the performance criteria specified in the query.""",
        verbose=True,
        allow_delegation=False,
        llm=ChatOpenAI(model=llm_model, temperature=0.2),
        tools=tools
    )


def create_decision_maker(llm_model: str = "gpt-4-turbo") -> Agent:
    """
    Create Decision Maker Agent

    This agent makes strategic optimization decisions based on performance analysis
    and the natural language query intent.

    Args:
        llm_model: OpenAI model to use

    Returns:
        Configured Agent instance
    """
    return Agent(
        role="Optimization Decision Maker",
        goal="Make informed optimization decisions based on performance analysis and user query intent",
        backstory="""You are a strategic optimization expert who makes high-stakes decisions
        about campaign management. You understand the intent behind natural language optimization
        queries and translate them into specific, actionable decisions.

        When a user says "pause underperforming strategies," you know this means:
        - Identify strategies meeting the underperformance criteria
        - Evaluate if pausing is the right action (consider learning phase, seasonality, etc.)
        - Decide exactly which strategies to pause and why
        - Explain the expected impact of each decision

        You balance short-term performance with long-term goals. You're trusted to make
        decisions on campaigns worth millions of dollars, always providing clear reasoning
        and considering potential risks.""",
        verbose=True,
        allow_delegation=False,
        llm=ChatOpenAI(model=llm_model, temperature=0.3),
        tools=[]  # Decision-making agent, no direct tool calls needed
    )


def create_execution_agent(tools: List[Tool], llm_model: str = "gpt-4-turbo") -> Agent:
    """
    Create Execution Agent

    This agent executes optimization actions using MCP tools based on decisions made.

    Args:
        tools: List of MCP tools for updates
        llm_model: OpenAI model to use

    Returns:
        Configured Agent instance
    """
    return Agent(
        role="Optimization Execution Agent",
        goal="Execute approved optimization actions swiftly and accurately using MCP tools",
        backstory="""You are the reliable executor who implements optimization decisions.
        You take strategic decisions (like "pause strategy 2001" or "reduce budget for
        campaign 1001 by 20%") and execute them precisely using the MediaMath MCP tools.

        You are meticulous about:
        - Using the correct tool for each action
        - Verifying that updates are applied successfully
        - Recording exactly what changed (before/after values)
        - Catching and reporting any errors immediately

        You understand the MCP tool inputs and always provide proper JSON formatting.
        You never skip verification steps and always confirm that the optimization
        was actually applied to the platform.""",
        verbose=True,
        allow_delegation=False,
        llm=ChatOpenAI(model=llm_model, temperature=0.1),
        tools=tools
    )


def create_optimization_agents(mcp_tools: dict, llm_model: str = "gpt-4-turbo") -> dict:
    """
    Create all optimization agents with appropriate tool assignments

    Args:
        mcp_tools: Dictionary of MCP tools from mcp_tools module
        llm_model: OpenAI model to use

    Returns:
        Dictionary of agents
    """
    # Tools for Performance Analyzer (read-only operations)
    analyzer_tools = [
        mcp_tools['find_campaigns'],
        mcp_tools['get_campaign_info'],
        mcp_tools['find_strategies'],
        mcp_tools['get_strategy_info'],
    ]

    # Tools for Execution Agent (write operations)
    executor_tools = [
        mcp_tools['update_campaign'],
        mcp_tools['update_strategy'],
        mcp_tools['update_campaign_budget'],
    ]

    return {
        'performance_analyzer': create_performance_analyzer(analyzer_tools, llm_model),
        'decision_maker': create_decision_maker(llm_model),
        'execution_agent': create_execution_agent(executor_tools, llm_model)
    }
