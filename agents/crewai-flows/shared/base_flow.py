"""
Base Flow class for CrewAI Flows.
Provides common functionality for all flows with natural language input processing.
"""

from typing import Any, Dict, Optional
from crewai.flow.flow import Flow, listen, start
from pydantic import BaseModel
import json


class FlowState(BaseModel):
    """Base state for all flows."""
    query: str  # Natural language query from user
    organization_id: int = 100048  # Default organization
    result: Optional[Any] = None
    error: Optional[str] = None
    metadata: Dict[str, Any] = {}


class BaseFlow(Flow[FlowState]):
    """
    Base class for all CrewAI Flows with common functionality.

    IMPORTANT: All flows accept a SINGLE NATURAL LANGUAGE QUERY as input.
    The flow is responsible for parsing and understanding the user's intent.
    """

    def __init__(self):
        """Initialize base flow."""
        super().__init__()
        self.state = FlowState(query="")

    @start()
    def initialize(self):
        """
        Initialize the flow with user query.
        This is the entry point for all flows.
        """
        print(f"\n{'='*80}")
        print(f"Flow: {self.__class__.__name__}")
        print(f"Query: {self.state.query}")
        print(f"Organization ID: {self.state.organization_id}")
        print(f"{'='*80}\n")

        # Validate query
        if not self.state.query or not self.state.query.strip():
            self.state.error = "Empty query provided"
            return self.state

        return self.state

    def set_result(self, result: Any, metadata: Optional[Dict[str, Any]] = None):
        """
        Set the flow result.

        Args:
            result: The result to store
            metadata: Optional metadata about the execution
        """
        self.state.result = result
        if metadata:
            self.state.metadata.update(metadata)

    def set_error(self, error: str):
        """
        Set an error on the flow state.

        Args:
            error: Error message
        """
        self.state.error = error

    def get_result(self) -> Dict[str, Any]:
        """
        Get the final flow result.

        Returns:
            Dictionary containing result, error, and metadata
        """
        return {
            "success": self.state.error is None,
            "result": self.state.result,
            "error": self.state.error,
            "metadata": self.state.metadata,
            "query": self.state.query,
            "organization_id": self.state.organization_id
        }

    def parse_json_result(self, result_str: str) -> Any:
        """
        Parse JSON result from crew output.

        Args:
            result_str: String containing JSON

        Returns:
            Parsed JSON object or original string if parsing fails
        """
        try:
            return json.loads(result_str)
        except json.JSONDecodeError:
            # Return as-is if not JSON
            return result_str

    def log_step(self, step_name: str, message: str):
        """
        Log a step in the flow execution.

        Args:
            step_name: Name of the step
            message: Log message
        """
        print(f"[{self.__class__.__name__}] {step_name}: {message}")

    def log_error(self, step_name: str, error: Exception):
        """
        Log an error in the flow execution.

        Args:
            step_name: Name of the step where error occurred
            error: The exception
        """
        error_msg = f"{step_name} failed: {str(error)}"
        print(f"[ERROR] {error_msg}")
        self.set_error(error_msg)


class NaturalLanguageFlowInput(BaseModel):
    """
    Input model for flows that accept natural language queries.

    IMPORTANT: Flows accept a SINGLE query string, not structured parameters.
    The LLM will parse the query to extract necessary information.
    """
    query: str
    organization_id: int = 100048


def create_flow_input(query: str, organization_id: int = 100048) -> Dict[str, Any]:
    """
    Create standardized input for flows.

    Args:
        query: Natural language query from user
        organization_id: Organization ID (default: 100048)

    Returns:
        Dictionary with query and organization_id
    """
    return {
        "query": query,
        "organization_id": organization_id
    }
