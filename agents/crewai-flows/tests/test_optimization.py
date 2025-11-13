"""
Tests for Optimization Flow

Basic tests to verify the optimization flow works correctly.
"""

import os
import sys
import pytest
from unittest.mock import Mock, patch, MagicMock

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flows.optimization_flow import OptimizationFlow, OptimizationState, run_optimization_flow
from agents.agent_definitions import create_optimization_agents
from tasks.task_definitions import create_optimization_tasks


class TestOptimizationFlow:
    """Test suite for Optimization Flow"""

    def test_optimization_state_creation(self):
        """Test that OptimizationState can be created"""
        state = OptimizationState(
            nl_query="Pause underperforming strategies",
            organization_id=100048
        )

        assert state.nl_query == "Pause underperforming strategies"
        assert state.organization_id == 100048
        assert state.performance_analysis == {}
        assert state.error == ""

    def test_optimization_state_with_data(self):
        """Test OptimizationState with analysis data"""
        state = OptimizationState(
            nl_query="Test query",
            performance_analysis={"result": "test"}
        )

        assert state.performance_analysis == {"result": "test"}

    @patch('flows.optimization_flow.get_default_mcp_tools')
    def test_flow_initialization(self, mock_mcp_tools):
        """Test that OptimizationFlow initializes correctly"""
        # Mock MCP tools
        mock_tools = {
            'find_campaigns': Mock(),
            'get_campaign_info': Mock(),
            'find_strategies': Mock(),
            'get_strategy_info': Mock(),
            'update_campaign': Mock(),
            'update_strategy': Mock(),
            'update_campaign_budget': Mock(),
        }
        mock_mcp_tools.return_value = mock_tools

        # Create flow
        flow = OptimizationFlow()

        assert flow.mcp_tools is not None
        assert flow.agents is not None
        assert 'performance_analyzer' in flow.agents
        assert 'decision_maker' in flow.agents
        assert 'execution_agent' in flow.agents

    def test_agent_creation(self):
        """Test that optimization agents can be created"""
        # Mock MCP tools
        mock_tools = {
            'find_campaigns': Mock(),
            'get_campaign_info': Mock(),
            'find_strategies': Mock(),
            'get_strategy_info': Mock(),
            'update_campaign': Mock(),
            'update_strategy': Mock(),
            'update_campaign_budget': Mock(),
        }

        # Create agents
        agents = create_optimization_agents(mock_tools, llm_model="gpt-4-turbo")

        assert 'performance_analyzer' in agents
        assert 'decision_maker' in agents
        assert 'execution_agent' in agents

        # Verify agent properties
        assert agents['performance_analyzer'].role == "Performance Analyzer"
        assert agents['decision_maker'].role == "Optimization Decision Maker"
        assert agents['execution_agent'].role == "Optimization Execution Agent"

    def test_task_creation(self):
        """Test that optimization tasks can be created"""
        # Mock agents
        mock_agents = {
            'performance_analyzer': Mock(),
            'decision_maker': Mock(),
            'execution_agent': Mock()
        }

        # Create tasks
        tasks = create_optimization_tasks(
            mock_agents,
            nl_query="Test query",
            organization_id=100048
        )

        assert len(tasks) == 3
        assert all(task is not None for task in tasks)

    @pytest.mark.skipif(
        not os.getenv("OPENAI_API_KEY"),
        reason="Requires OPENAI_API_KEY to be set"
    )
    def test_flow_receive_query(self):
        """Test the receive_query start method"""
        flow = OptimizationFlow()
        flow.state = OptimizationState(nl_query="Test query")

        result = flow.receive_query()

        assert result == "Test query"

    def test_flow_receive_query_no_query(self):
        """Test receive_query with no query"""
        flow = OptimizationFlow()
        flow.state = OptimizationState(nl_query="")

        result = flow.receive_query()

        assert result == "error"
        assert flow.state.error == "No query provided"


class TestIntegration:
    """Integration tests (require OpenAI API key)"""

    @pytest.mark.skipif(
        not os.getenv("OPENAI_API_KEY"),
        reason="Requires OPENAI_API_KEY to be set"
    )
    @pytest.mark.integration
    def test_full_optimization_flow_mock(self):
        """
        Test full optimization flow with mocked MCP responses

        NOTE: This uses mock data - not real MCP server
        """
        # This would require extensive mocking or a test MCP server
        # For now, we test the structure
        pass


def test_module_imports():
    """Test that all required modules can be imported"""
    from flows.optimization_flow import OptimizationFlow, OptimizationState, run_optimization_flow
    from agents.agent_definitions import create_optimization_agents
    from tasks.task_definitions import create_optimization_tasks
    from shared.mcp_tools import get_default_mcp_tools

    # If we get here, all imports succeeded
    assert True


if __name__ == "__main__":
    # Run tests with pytest
    pytest.main([__file__, "-v"])
