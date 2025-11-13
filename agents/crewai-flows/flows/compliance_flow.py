"""
Compliance Flow for User Access Auditing
Uses CrewAI Flow pattern for orchestrating compliance audit tasks
"""

import os
import sys
from typing import Dict, Any

# Add parent directories to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))

from crewai import Crew, Process
from crewai.flow.flow import Flow, listen, start
from agents.agent_definitions import get_compliance_agents
from tasks.task_definitions import get_compliance_tasks


class ComplianceFlow(Flow):
    """
    Compliance Flow for user access auditing and permission analysis.
    
    Accepts a natural language query like:
    - "Audit all user permissions for security review"
    - "Check for users with admin access who shouldn't have it"
    - "Identify compliance violations in user permissions"
    
    The flow orchestrates three agents:
    1. User Auditor - Gathers user and permission data
    2. Permission Analyzer - Analyzes patterns and identifies violations
    3. Audit Reporter - Creates comprehensive compliance report
    """
    
    def __init__(self):
        super().__init__()
        self.query = ""
        self.audit_result = None
        self.analysis_result = None
        self.report_result = None
    
    @start()
    def kickoff_flow(self, query: str):
        """
        Start the compliance flow with a natural language query.
        
        Args:
            query: Natural language description of the audit request
        """
        print("\n" + "=" * 80)
        print("COMPLIANCE FLOW STARTED")
        print("=" * 80)
        print(f"Query: {query}")
        print("=" * 80 + "\n")
        
        self.query = query
        return {"query": query}
    
    @listen(kickoff_flow)
    def execute_compliance_crew(self, inputs: Dict[str, Any]):
        """
        Execute the compliance crew with all three agents and tasks.
        """
        query = inputs.get("query", self.query)
        
        print("\n" + "-" * 80)
        print("EXECUTING COMPLIANCE CREW")
        print("-" * 80)
        print(f"Query: {query}")
        print("-" * 80 + "\n")
        
        # Get agents
        agents = get_compliance_agents()
        user_auditor = agents[0]
        permission_analyzer = agents[1]
        audit_reporter = agents[2]
        
        # Get tasks
        tasks = get_compliance_tasks(agents, query)
        user_audit_task = tasks[0]
        permission_analysis_task = tasks[1]
        audit_reporting_task = tasks[2]
        
        # Set task context dependencies
        permission_analysis_task.context = [user_audit_task]
        audit_reporting_task.context = [user_audit_task, permission_analysis_task]
        
        # Create and execute crew
        compliance_crew = Crew(
            agents=[user_auditor, permission_analyzer, audit_reporter],
            tasks=[user_audit_task, permission_analysis_task, audit_reporting_task],
            process=Process.sequential,
            verbose=True,
            memory=True,
            max_rpm=10
        )
        
        print("\n" + "=" * 80)
        print("STARTING COMPLIANCE AUDIT")
        print("=" * 80 + "\n")
        
        # Execute the crew
        result = compliance_crew.kickoff()
        
        print("\n" + "=" * 80)
        print("COMPLIANCE AUDIT COMPLETE")
        print("=" * 80 + "\n")
        
        return {
            "query": query,
            "result": result,
            "status": "completed"
        }
    
    @listen(execute_compliance_crew)
    def finalize_results(self, inputs: Dict[str, Any]):
        """
        Finalize and return the compliance audit results.
        """
        result = inputs.get("result")
        
        print("\n" + "=" * 80)
        print("COMPLIANCE FLOW RESULTS")
        print("=" * 80)
        print(f"\n{result}\n")
        print("=" * 80 + "\n")
        
        self.report_result = result
        
        return {
            "query": self.query,
            "result": result,
            "status": "finalized"
        }


def run_compliance_flow(query: str) -> Any:
    """
    Execute the compliance flow with a natural language query.
    
    Args:
        query: Natural language description of the compliance audit request
        
    Returns:
        Compliance audit report
    
    Example:
        result = run_compliance_flow("Audit all user permissions for security review")
    """
    flow = ComplianceFlow()
    result = flow.kickoff(query=query)
    return result


if __name__ == "__main__":
    # Example usage
    import sys
    
    if len(sys.argv) > 1:
        query = " ".join(sys.argv[1:])
    else:
        query = "Audit all user permissions for security review"
    
    print(f"\nRunning Compliance Flow with query: {query}\n")
    result = run_compliance_flow(query)
    
    print("\n" + "=" * 80)
    print("FINAL RESULT")
    print("=" * 80)
    print(result)
