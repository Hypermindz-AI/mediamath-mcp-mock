"""
Agent Definitions for Campaign Setup Flow
Defines the 3 specialized agents for natural language campaign creation
"""

import os
from crewai import Agent
from langchain_openai import ChatOpenAI
from typing import List
from langchain.tools import Tool


def create_campaign_strategist(tools: List[Tool], llm_model: str = "gpt-4-turbo") -> Agent:
    """
    Campaign Strategist Agent
    Parses natural language queries and creates campaign strategies

    Args:
        tools: List of MCP tools for research
        llm_model: OpenAI model to use

    Returns:
        Configured Agent instance
    """
    return Agent(
        role="Campaign Strategist",
        goal="Parse natural language campaign requests and create detailed campaign strategies",
        backstory="""You are an expert digital advertising strategist with 10+ years
        of experience in programmatic media buying. You excel at understanding business
        requirements expressed in natural language and translating them into actionable
        campaign plans.

        You are skilled at parsing requests like:
        - "Create 10 holiday campaigns with $5000 budget each"
        - "Set up 5 campaigns for Black Friday with total budget of $25000"
        - "Launch 3 campaigns for new product with $2000 each"

        From these natural language queries, you extract:
        - Number of campaigns to create
        - Budget allocation (per campaign or total to split)
        - Campaign naming patterns and themes
        - Any dates, objectives, or targeting mentioned

        You create structured, actionable campaign strategies with clear parameters
        for the implementation team.""",
        verbose=True,
        allow_delegation=False,
        llm=ChatOpenAI(model=llm_model, temperature=0.3),
        tools=tools
    )


def create_campaign_builder(tools: List[Tool], llm_model: str = "gpt-4-turbo") -> Agent:
    """
    Campaign Builder Agent
    Executes campaign creation based on strategy

    Args:
        tools: List of MCP tools for campaign creation
        llm_model: OpenAI model to use

    Returns:
        Configured Agent instance
    """
    return Agent(
        role="Campaign Builder",
        goal="Execute campaign creation flawlessly based on approved strategies",
        backstory="""You are a meticulous campaign implementation specialist. You take
        strategic plans and execute them perfectly in the MediaMath platform. You ensure
        all configurations are correct, budgets are set properly, and campaigns are
        created successfully.

        You work systematically:
        - Create campaigns ONE AT A TIME (sequential, not parallel)
        - Use exact names and budgets from the strategy
        - Track all created campaign IDs and strategy IDs
        - Verify each creation was successful before proceeding
        - Report clear status updates

        You are detail-oriented and never skip validation steps. You understand MCP
        tool inputs and always provide proper JSON formatting.""",
        verbose=True,
        allow_delegation=False,
        llm=ChatOpenAI(model=llm_model, temperature=0.1),
        tools=tools
    )


def create_qa_specialist(tools: List[Tool], llm_model: str = "gpt-4-turbo") -> Agent:
    """
    QA Specialist Agent
    Verifies campaign configurations before launch

    Args:
        tools: List of MCP tools for verification
        llm_model: OpenAI model to use

    Returns:
        Configured Agent instance
    """
    return Agent(
        role="Quality Assurance Specialist",
        goal="Verify campaign configurations and catch errors before launch",
        backstory="""You are a detail-oriented QA expert who has saved countless campaigns
        from costly mistakes. You systematically check every configuration, validate budgets,
        verify campaign names and settings, and ensure everything is ready for launch.

        Your QA checklist includes:
        - All campaigns were created successfully
        - Budgets match requirements exactly
        - Campaign names are correct
        - Strategies were created properly
        - No errors occurred during creation
        - Configuration is launch-ready

        You provide clear PASS/FAIL status with detailed explanations. You create
        comprehensive QA reports that give stakeholders confidence. You understand
        that minor variations are acceptable, but critical errors (failed creations,
        wrong budgets) must fail QA.""",
        verbose=True,
        allow_delegation=False,
        llm=ChatOpenAI(model=llm_model, temperature=0.1),
        tools=tools
    )


def create_campaign_setup_agents(mcp_tools: dict, llm_model: str = "gpt-4-turbo") -> dict:
    """
    Create all campaign setup agents with appropriate tool assignments

    Args:
        mcp_tools: Dictionary of MCP tools from mcp_tools module
        llm_model: OpenAI model to use

    Returns:
        Dictionary of agents
    """
    # Tools for Campaign Strategist (research/planning)
    strategist_tools = [
        mcp_tools['find_organizations'],
        mcp_tools['find_campaigns'],
    ]

    # Tools for Campaign Builder (creation)
    builder_tools = [
        mcp_tools['create_campaign'],
        mcp_tools['create_strategy'],
        mcp_tools['get_campaign_info'],
    ]

    # Tools for QA Specialist (verification)
    qa_tools = [
        mcp_tools['get_campaign_info'],
        mcp_tools['find_campaigns'],
        mcp_tools['get_strategy_info'],
    ]

    return {
        'campaign_strategist': create_campaign_strategist(strategist_tools, llm_model),
        'campaign_builder': create_campaign_builder(builder_tools, llm_model),
        'qa_specialist': create_qa_specialist(qa_tools, llm_model)
    }
