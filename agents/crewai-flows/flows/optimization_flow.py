"""
Optimization Flow - CrewAI Flow Implementation
Handles natural language optimization queries end-to-end
"""

import os
from typing import Dict, Any
from crewai import Crew, Process
from crewai.flow.flow import Flow, listen, start
from pydantic import BaseModel

# Import our modules
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared.mcp_tools import get_default_mcp_tools
from agents.agent_definitions import create_optimization_agents
from tasks.task_definitions import create_optimization_tasks


class OptimizationState(BaseModel):
    """State management for optimization flow"""
    nl_query: str = ""
    organization_id: int = 100048
    performance_analysis: Dict[str, Any] = {}
    optimization_decisions: Dict[str, Any] = {}
    execution_results: Dict[str, Any] = {}
    error: str = ""


class OptimizationFlow(Flow[OptimizationState]):
    """
    CrewAI Flow for Campaign Optimization

    This flow accepts a natural language query and:
    1. Analyzes performance based on query criteria
    2. Makes optimization decisions
    3. Executes optimizations using MCP tools

    Example queries:
    - "Pause all underperforming strategies with CTR < 0.5%"
    - "Optimize campaign budgets based on performance"
    - "Reduce spend on strategies with CPC > $2.50"
    """

    def __init__(self):
        """Initialize the optimization flow"""
        super().__init__()

        # Initialize MCP tools
        self.mcp_tools = get_default_mcp_tools()

        # Initialize agents
        self.agents = create_optimization_agents(
            self.mcp_tools,
            llm_model=os.getenv("OPENAI_MODEL", "gpt-4-turbo")
        )

    @start()
    def receive_query(self) -> str:
        """
        Start method - receives natural language query

        Returns:
            Natural language query string
        """
        # Get query from state
        nl_query = self.state.nl_query

        if not nl_query:
            self.state.error = "No query provided"
            return "error"

        print(f"\n{'='*80}")
        print(f"OPTIMIZATION FLOW STARTED")
        print(f"{'='*80}")
        print(f"Query: {nl_query}")
        print(f"Organization ID: {self.state.organization_id}")
        print(f"{'='*80}\n")

        return nl_query

    @listen(receive_query)
    def analyze_performance(self, nl_query: str) -> Dict[str, Any]:
        """
        Analyze performance based on natural language query

        Args:
            nl_query: Natural language optimization query

        Returns:
            Performance analysis results
        """
        print(f"\n{'='*80}")
        print(f"STEP 1: PERFORMANCE ANALYSIS")
        print(f"{'='*80}\n")

        try:
            # Create tasks for this specific query
            tasks = create_optimization_tasks(
                self.agents,
                nl_query,
                self.state.organization_id
            )

            # Create crew with just the first task (performance analysis)
            analysis_crew = Crew(
                agents=[self.agents['performance_analyzer']],
                tasks=[tasks[0]],  # Only analysis task
                process=Process.sequential,
                verbose=True
            )

            # Execute crew
            result = analysis_crew.kickoff()

            # Store results in state
            analysis_output = {
                "query": nl_query,
                "organization_id": self.state.organization_id,
                "analysis": str(result)
            }

            self.state.performance_analysis = analysis_output

            print(f"\n{'='*80}")
            print(f"PERFORMANCE ANALYSIS COMPLETE")
            print(f"{'='*80}\n")

            return analysis_output

        except Exception as e:
            error_msg = f"Performance analysis failed: {str(e)}"
            print(f"\n❌ ERROR: {error_msg}\n")
            self.state.error = error_msg
            return {"error": error_msg}

    @listen(analyze_performance)
    def make_decisions(self, analysis_output: Dict[str, Any]) -> Dict[str, Any]:
        """
        Make optimization decisions based on performance analysis

        Args:
            analysis_output: Performance analysis results

        Returns:
            Optimization decisions
        """
        if "error" in analysis_output:
            return analysis_output

        print(f"\n{'='*80}")
        print(f"STEP 2: DECISION MAKING")
        print(f"{'='*80}\n")

        try:
            # Create tasks
            tasks = create_optimization_tasks(
                self.agents,
                self.state.nl_query,
                self.state.organization_id
            )

            # Create crew with decision maker
            # Pass context from analysis
            decision_crew = Crew(
                agents=[self.agents['decision_maker']],
                tasks=[tasks[1]],  # Only decision task
                process=Process.sequential,
                verbose=True
            )

            # Execute crew
            result = decision_crew.kickoff()

            # Store results in state
            decisions_output = {
                "query": self.state.nl_query,
                "decisions": str(result)
            }

            self.state.optimization_decisions = decisions_output

            print(f"\n{'='*80}")
            print(f"DECISION MAKING COMPLETE")
            print(f"{'='*80}\n")

            return decisions_output

        except Exception as e:
            error_msg = f"Decision making failed: {str(e)}"
            print(f"\n❌ ERROR: {error_msg}\n")
            self.state.error = error_msg
            return {"error": error_msg}

    @listen(make_decisions)
    def execute_optimizations(self, decisions_output: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute optimization actions using MCP tools

        Args:
            decisions_output: Optimization decisions

        Returns:
            Execution results
        """
        if "error" in decisions_output:
            return decisions_output

        print(f"\n{'='*80}")
        print(f"STEP 3: EXECUTION")
        print(f"{'='*80}\n")

        try:
            # Create tasks
            tasks = create_optimization_tasks(
                self.agents,
                self.state.nl_query,
                self.state.organization_id
            )

            # Create crew with execution agent
            execution_crew = Crew(
                agents=[self.agents['execution_agent']],
                tasks=[tasks[2]],  # Only execution task
                process=Process.sequential,
                verbose=True
            )

            # Execute crew
            result = execution_crew.kickoff()

            # Store results in state
            execution_output = {
                "query": self.state.nl_query,
                "execution": str(result)
            }

            self.state.execution_results = execution_output

            print(f"\n{'='*80}")
            print(f"EXECUTION COMPLETE")
            print(f"{'='*80}\n")

            return execution_output

        except Exception as e:
            error_msg = f"Execution failed: {str(e)}"
            print(f"\n❌ ERROR: {error_msg}\n")
            self.state.error = error_msg
            return {"error": error_msg}

    @listen(execute_optimizations)
    def generate_report(self, execution_output: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate final optimization report

        Args:
            execution_output: Execution results

        Returns:
            Complete optimization report
        """
        print(f"\n{'='*80}")
        print(f"OPTIMIZATION FLOW COMPLETE")
        print(f"{'='*80}\n")

        # Compile complete report
        report = {
            "query": self.state.nl_query,
            "organization_id": self.state.organization_id,
            "performance_analysis": self.state.performance_analysis,
            "optimization_decisions": self.state.optimization_decisions,
            "execution_results": self.state.execution_results,
            "status": "error" if self.state.error else "success",
            "error": self.state.error if self.state.error else None
        }

        return report


def run_optimization_flow(nl_query: str, organization_id: int = 100048) -> Dict[str, Any]:
    """
    Execute optimization flow with a natural language query

    Args:
        nl_query: Natural language optimization query (e.g., "Pause underperforming strategies")
        organization_id: MediaMath organization ID

    Returns:
        Complete optimization report

    Example:
        >>> result = run_optimization_flow("Pause all strategies with CTR < 0.5%")
    """
    # Create flow instance
    flow = OptimizationFlow()

    # Set initial state
    initial_state = OptimizationState(
        nl_query=nl_query,
        organization_id=organization_id
    )

    # Execute flow
    result = flow.kickoff(inputs=initial_state.dict())

    return result
