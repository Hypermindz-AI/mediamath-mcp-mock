"""
Creative Flow for Creative Asset Analysis and Refresh Planning
Uses CrewAI Flow pattern for orchestrating creative analysis tasks
"""

import os
import sys
from typing import Dict, Any

# Add parent directories to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))

from crewai import Crew, Process
from crewai.flow.flow import Flow, listen, start
from agents.agent_definitions import get_creative_agents
from tasks.task_definitions import get_creative_tasks


class CreativeFlow(Flow):
    """
    Creative Flow for analyzing creative assets and planning refreshes.
    
    Accepts a natural language query like:
    - "Find all creatives that need refresh based on performance"
    - "Analyze creative fatigue across all campaigns"
    - "Identify underperforming creatives and plan refreshes"
    
    The flow orchestrates three agents:
    1. Creative Collector - Gathers creative assets and usage data
    2. Creative Analyst - Analyzes performance and identifies refresh needs
    3. Refresh Planner - Creates actionable refresh plan with timelines
    """
    
    def __init__(self):
        super().__init__()
        self.query = ""
        self.collection_result = None
        self.analysis_result = None
        self.plan_result = None
    
    @start()
    def kickoff_flow(self, query: str):
        """
        Start the creative flow with a natural language query.
        
        Args:
            query: Natural language description of the creative analysis request
        """
        print("\n" + "=" * 80)
        print("CREATIVE FLOW STARTED")
        print("=" * 80)
        print(f"Query: {query}")
        print("=" * 80 + "\n")
        
        self.query = query
        return {"query": query}
    
    @listen(kickoff_flow)
    def execute_creative_crew(self, inputs: Dict[str, Any]):
        """
        Execute the creative crew with all three agents and tasks.
        """
        query = inputs.get("query", self.query)
        
        print("\n" + "-" * 80)
        print("EXECUTING CREATIVE CREW")
        print("-" * 80)
        print(f"Query: {query}")
        print("-" * 80 + "\n")
        
        # Get agents
        agents = get_creative_agents()
        creative_collector = agents[0]
        creative_analyst = agents[1]
        refresh_planner = agents[2]
        
        # Get tasks
        tasks = get_creative_tasks(agents, query)
        creative_collection_task = tasks[0]
        creative_analysis_task = tasks[1]
        refresh_planning_task = tasks[2]
        
        # Set task context dependencies
        creative_analysis_task.context = [creative_collection_task]
        refresh_planning_task.context = [creative_collection_task, creative_analysis_task]
        
        # Create and execute crew
        creative_crew = Crew(
            agents=[creative_collector, creative_analyst, refresh_planner],
            tasks=[creative_collection_task, creative_analysis_task, refresh_planning_task],
            process=Process.sequential,
            verbose=True,
            memory=True,
            max_rpm=10
        )
        
        print("\n" + "=" * 80)
        print("STARTING CREATIVE ANALYSIS")
        print("=" * 80 + "\n")
        
        # Execute the crew
        result = creative_crew.kickoff()
        
        print("\n" + "=" * 80)
        print("CREATIVE ANALYSIS COMPLETE")
        print("=" * 80 + "\n")
        
        return {
            "query": query,
            "result": result,
            "status": "completed"
        }
    
    @listen(execute_creative_crew)
    def finalize_results(self, inputs: Dict[str, Any]):
        """
        Finalize and return the creative analysis results.
        """
        result = inputs.get("result")
        
        print("\n" + "=" * 80)
        print("CREATIVE FLOW RESULTS")
        print("=" * 80)
        print(f"\n{result}\n")
        print("=" * 80 + "\n")
        
        self.plan_result = result
        
        return {
            "query": self.query,
            "result": result,
            "status": "finalized"
        }


def run_creative_flow(query: str) -> Any:
    """
    Execute the creative flow with a natural language query.
    
    Args:
        query: Natural language description of the creative analysis request
        
    Returns:
        Creative refresh plan report
    
    Example:
        result = run_creative_flow("Find all creatives that need refresh based on performance")
    """
    flow = CreativeFlow()
    result = flow.kickoff(query=query)
    return result


if __name__ == "__main__":
    # Example usage
    import sys
    
    if len(sys.argv) > 1:
        query = " ".join(sys.argv[1:])
    else:
        query = "Find all creatives that need refresh based on performance"
    
    print(f"\nRunning Creative Flow with query: {query}\n")
    result = run_creative_flow(query)
    
    print("\n" + "=" * 80)
    print("FINAL RESULT")
    print("=" * 80)
    print(result)
