"""
Campaign Setup Flow
CrewAI Flow for natural language campaign creation
"""

import os
from crewai import Crew, Process
from crewai.flow.flow import Flow, listen, start
from pydantic import BaseModel
from typing import List, Dict, Any
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.campaign_setup_agents import create_campaign_setup_agents
from tasks.campaign_setup_tasks import (
    create_parse_and_plan_task,
    create_build_campaigns_task,
    create_verify_campaigns_task
)
from shared.mcp_tools import get_default_mcp_tools


class CampaignSetupState(BaseModel):
    """State model for Campaign Setup Flow"""
    natural_language_query: str = ""
    campaign_strategy: Dict[str, Any] = {}
    implementation_report: Dict[str, Any] = {}
    qa_report: Dict[str, Any] = {}
    final_result: Dict[str, Any] = {}


class CampaignSetupFlow(Flow[CampaignSetupState]):
    """
    CrewAI Flow for Campaign Setup with Natural Language Input

    Accepts a single natural language query like:
    - "Create 10 holiday campaigns with $5000 budget each"
    - "Set up 5 campaigns for Black Friday with total budget of $25000"

    Flow Steps:
    1. Parse NL query and create strategy
    2. Build campaigns using MCP tools
    3. Verify configurations with QA checks
    """

    def __init__(self):
        """Initialize the Campaign Setup Flow"""
        super().__init__()

        # Get MCP tools
        self.mcp_tools = get_default_mcp_tools()

        # Create agents
        agents = create_campaign_setup_agents(
            self.mcp_tools,
            llm_model=os.getenv("OPENAI_MODEL", "gpt-4-turbo")
        )

        self.campaign_strategist = agents['campaign_strategist']
        self.campaign_builder = agents['campaign_builder']
        self.qa_specialist = agents['qa_specialist']

    @start()
    def receive_campaign_request(self, natural_language_query: str):
        """
        Start method - receives natural language campaign request

        Args:
            natural_language_query: Natural language campaign creation request

        Example:
            "Create 10 holiday campaigns with $5000 budget each"
        """
        print(f"\n{'='*80}")
        print("CAMPAIGN SETUP FLOW STARTED")
        print(f"{'='*80}")
        print(f"Query: {natural_language_query}")
        print(f"{'='*80}\n")

        # Store query in state
        self.state.natural_language_query = natural_language_query

        # Create and execute strategy planning task
        strategy_task = create_parse_and_plan_task(
            self.campaign_strategist,
            natural_language_query
        )

        # Create crew for strategy phase
        strategy_crew = Crew(
            agents=[self.campaign_strategist],
            tasks=[strategy_task],
            process=Process.sequential,
            verbose=True
        )

        print("\n[PHASE 1/3] Parsing request and creating strategy...")
        result = strategy_crew.kickoff()

        # Store strategy in state
        self.state.campaign_strategy = {"raw_output": str(result)}

        print(f"\nStrategy Created: {result}\n")

        return result

    @listen(receive_campaign_request)
    def build_campaigns(self):
        """
        Build campaigns based on strategy
        """
        print("\n[PHASE 2/3] Building campaigns...")

        # Create build task with context from strategy
        strategy_task = create_parse_and_plan_task(
            self.campaign_strategist,
            self.state.natural_language_query
        )

        build_task = create_build_campaigns_task(
            self.campaign_builder,
            context_tasks=[strategy_task]
        )

        # Create crew for building phase
        build_crew = Crew(
            agents=[self.campaign_builder],
            tasks=[build_task],
            process=Process.sequential,
            verbose=True
        )

        result = build_crew.kickoff()

        # Store implementation report in state
        self.state.implementation_report = {"raw_output": str(result)}

        print(f"\nCampaigns Built: {result}\n")

        return result

    @listen(build_campaigns)
    def verify_campaigns(self):
        """
        Verify campaign configurations with QA checks
        """
        print("\n[PHASE 3/3] Verifying campaigns...")

        # Create QA task with context from build
        strategy_task = create_parse_and_plan_task(
            self.campaign_strategist,
            self.state.natural_language_query
        )

        build_task = create_build_campaigns_task(
            self.campaign_builder,
            context_tasks=[strategy_task]
        )

        qa_task = create_verify_campaigns_task(
            self.qa_specialist,
            context_tasks=[build_task]
        )

        # Create crew for QA phase
        qa_crew = Crew(
            agents=[self.qa_specialist],
            tasks=[qa_task],
            process=Process.sequential,
            verbose=True
        )

        result = qa_crew.kickoff()

        # Store QA report in state
        self.state.qa_report = {"raw_output": str(result)}

        print(f"\nQA Report: {result}\n")

        # Compile final result
        self.state.final_result = {
            "query": self.state.natural_language_query,
            "strategy": self.state.campaign_strategy,
            "implementation": self.state.implementation_report,
            "qa_report": self.state.qa_report
        }

        print(f"\n{'='*80}")
        print("CAMPAIGN SETUP FLOW COMPLETED")
        print(f"{'='*80}\n")

        return self.state.final_result


def execute_campaign_setup_flow(natural_language_query: str) -> Dict[str, Any]:
    """
    Execute the campaign setup flow with a natural language query

    Args:
        natural_language_query: Natural language campaign request
            Examples:
            - "Create 10 holiday campaigns with $5000 budget each"
            - "Set up 5 campaigns for Black Friday with total budget of $25000"

    Returns:
        Flow execution result with all phase outputs
    """
    flow = CampaignSetupFlow()
    result = flow.kickoff(natural_language_query=natural_language_query)
    return result


if __name__ == "__main__":
    # Example usage
    query = "Create 10 holiday campaigns with $5000 budget each"
    result = execute_campaign_setup_flow(query)
    print("\n\nFINAL RESULT:")
    print(result)
