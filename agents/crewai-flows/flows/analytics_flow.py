"""
Analytics Flow using CrewAI Flows
Orchestrates the analytics workflow with natural language query input
"""

import os
import sys
from typing import Dict, Any
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from crewai import Crew, Process
from crewai.flow.flow import Flow, start, listen
from pydantic import BaseModel

from shared.mcp_tools import get_default_mcp_tools
from agents.analytics_agents import create_analytics_agents
from tasks.analytics_tasks import create_analytics_tasks


class AnalyticsState(BaseModel):
    """
    State management for Analytics Flow

    Tracks data and results throughout the flow execution
    """
    query: str = ""
    organization_id: int = 100048
    collected_data: Dict[str, Any] = {}
    analysis_results: Dict[str, Any] = {}
    final_report: str = ""
    error: str = ""


class AnalyticsFlow(Flow[AnalyticsState]):
    """
    Analytics Flow for processing natural language queries

    This flow accepts a single natural language query and:
    1. Collects relevant data from MediaMath
    2. Analyzes the data
    3. Generates a formatted report

    Example queries:
    - "Generate weekly budget utilization report for all campaigns"
    - "Show me performance analysis for organization 100048"
    - "Which campaigns are underperforming?"
    - "Give me top performing strategies by CTR"
    """

    def __init__(self):
        """Initialize the Analytics Flow"""
        super().__init__()
        self.mcp_tools = None
        self.agents = None
        self.crew = None

    @start()
    def initialize_flow(self) -> AnalyticsState:
        """
        Entry point: Initialize flow with natural language query

        This is the @start decorator method that receives the query
        and sets up the flow state.

        Returns:
            Initial state with query
        """
        print(f"\n{'='*80}")
        print(f"Analytics Flow Started")
        print(f"{'='*80}")
        print(f"Query: {self.state.query}")
        print(f"Organization ID: {self.state.organization_id}")
        print(f"{'='*80}\n")

        # Initialize MCP tools
        print("Initializing MCP tools...")
        self.mcp_tools = get_default_mcp_tools()

        # Create agents
        print("Creating analytics agents...")
        self.agents = create_analytics_agents(self.mcp_tools)

        return self.state

    @listen(initialize_flow)
    def execute_analytics_crew(self, state: AnalyticsState) -> AnalyticsState:
        """
        Execute the analytics crew with all three tasks

        This method runs the CrewAI crew sequentially:
        1. Data Collection
        2. Data Analysis
        3. Report Writing

        Args:
            state: Current flow state

        Returns:
            Updated state with results
        """
        try:
            print(f"\n{'='*80}")
            print(f"Executing Analytics Crew")
            print(f"{'='*80}\n")

            # Create tasks
            tasks = create_analytics_tasks(
                agents=self.agents,
                query=state.query,
                organization_id=state.organization_id
            )

            # Create crew
            self.crew = Crew(
                agents=list(self.agents.values()),
                tasks=tasks,
                process=Process.sequential,
                verbose=True,
                memory=True
            )

            # Execute crew
            print(f"\nRunning crew with {len(tasks)} tasks...")
            result = self.crew.kickoff()

            # Extract results
            state.final_report = str(result)

            print(f"\n{'='*80}")
            print(f"Crew Execution Complete")
            print(f"{'='*80}\n")

        except Exception as e:
            error_msg = f"Error executing analytics crew: {str(e)}"
            print(f"\nERROR: {error_msg}\n")
            state.error = error_msg

        return state

    @listen(execute_analytics_crew)
    def finalize_report(self, state: AnalyticsState) -> AnalyticsState:
        """
        Finalize and format the report

        This method performs final formatting and validation

        Args:
            state: Current flow state with results

        Returns:
            Final state with formatted report
        """
        print(f"\n{'='*80}")
        print(f"Finalizing Report")
        print(f"{'='*80}\n")

        if state.error:
            print(f"Flow completed with errors: {state.error}")
        else:
            print("Flow completed successfully!")
            print(f"Report length: {len(state.final_report)} characters")

        return state


def run_analytics_query(
    query: str,
    organization_id: int = 100048
) -> str:
    """
    Convenience function to run analytics query

    Args:
        query: Natural language query
        organization_id: Organization ID to query

    Returns:
        Generated report as string

    Examples:
        >>> report = run_analytics_query("Generate weekly budget utilization report")
        >>> print(report)

        >>> report = run_analytics_query(
        ...     "Show top performing campaigns",
        ...     organization_id=100048
        ... )
    """
    # Create flow instance
    flow = AnalyticsFlow()

    # Set initial state
    initial_state = AnalyticsState(
        query=query,
        organization_id=organization_id
    )

    # Execute flow
    final_state = flow.kickoff(initial_state)

    # Return report
    if final_state.error:
        return f"Error: {final_state.error}"

    return final_state.final_report


def main():
    """
    Example usage of the Analytics Flow
    """
    print("\n" + "="*80)
    print("Analytics Flow - Example Execution")
    print("="*80 + "\n")

    # Example query
    query = "Generate weekly budget utilization report for all campaigns"

    print(f"Query: {query}\n")

    # Run flow
    report = run_analytics_query(query)

    # Display results
    print("\n" + "="*80)
    print("FINAL REPORT")
    print("="*80 + "\n")
    print(report)
    print("\n" + "="*80 + "\n")


if __name__ == "__main__":
    # Verify environment
    if not os.getenv("OPENAI_API_KEY"):
        print("ERROR: OPENAI_API_KEY environment variable not set")
        print("Please set it before running the flow:")
        print('  export OPENAI_API_KEY="your-key-here"')
        sys.exit(1)

    main()
