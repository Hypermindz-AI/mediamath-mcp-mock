"""
Basic Tests for Analytics Flow
Tests the analytics workflow components
"""

import os
import sys
from pathlib import Path
import pytest
from unittest.mock import Mock, patch, MagicMock

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from shared.mcp_tools import MCPToolWrapper, create_mcp_tools
from agents.agent_definitions import create_analytics_agents
from tasks.task_definitions import create_analytics_tasks
from flows.analytics_flow import AnalyticsFlow, AnalyticsState, run_analytics_query


class TestMCPTools:
    """Test MCP tool wrapper functionality"""

    def test_mcp_wrapper_initialization(self):
        """Test that MCP wrapper can be initialized"""
        wrapper = MCPToolWrapper(
            server_url="https://example.com/api",
            api_key="test_key"
        )
        assert wrapper.server_url == "https://example.com/api"
        assert wrapper.api_key == "test_key"

    def test_create_mcp_tools(self):
        """Test that MCP tools can be created"""
        tools = create_mcp_tools(
            server_url="https://example.com/api",
            api_key="test_key"
        )

        assert isinstance(tools, dict)
        assert 'find_campaigns' in tools
        assert 'get_campaign_info' in tools
        assert 'find_strategies' in tools
        assert 'get_strategy_info' in tools

    def test_tool_has_correct_attributes(self):
        """Test that created tools have correct attributes"""
        tools = create_mcp_tools(
            server_url="https://example.com/api",
            api_key="test_key"
        )

        find_campaigns = tools['find_campaigns']
        assert hasattr(find_campaigns, 'name')
        assert hasattr(find_campaigns, 'description')
        assert hasattr(find_campaigns, 'func')
        assert find_campaigns.name == 'find_campaigns'


class TestAgentDefinitions:
    """Test agent creation"""

    @pytest.fixture
    def mock_tools(self):
        """Fixture providing mock MCP tools"""
        return {
            'find_campaigns': Mock(name='find_campaigns'),
            'get_campaign_info': Mock(name='get_campaign_info'),
            'find_strategies': Mock(name='find_strategies'),
            'get_strategy_info': Mock(name='get_strategy_info'),
            'find_organizations': Mock(name='find_organizations')
        }

    def test_create_analytics_agents(self, mock_tools):
        """Test that analytics agents can be created"""
        agents = create_analytics_agents(mock_tools)

        assert isinstance(agents, dict)
        assert 'data_collector' in agents
        assert 'data_analyst' in agents
        assert 'report_writer' in agents

    def test_agent_has_correct_attributes(self, mock_tools):
        """Test that agents have correct attributes"""
        agents = create_analytics_agents(mock_tools)

        data_collector = agents['data_collector']
        assert hasattr(data_collector, 'role')
        assert hasattr(data_collector, 'goal')
        assert hasattr(data_collector, 'backstory')
        assert data_collector.role == "Data Collection Specialist"

    def test_data_collector_has_tools(self, mock_tools):
        """Test that data collector has tools assigned"""
        agents = create_analytics_agents(mock_tools)

        data_collector = agents['data_collector']
        assert hasattr(data_collector, 'tools')
        assert len(data_collector.tools) > 0

    def test_analyst_has_no_tools(self, mock_tools):
        """Test that data analyst has no tools (analysis only)"""
        agents = create_analytics_agents(mock_tools)

        data_analyst = agents['data_analyst']
        assert len(data_analyst.tools) == 0


class TestTaskDefinitions:
    """Test task creation"""

    @pytest.fixture
    def mock_agents(self):
        """Fixture providing mock agents"""
        return {
            'data_collector': Mock(name='data_collector'),
            'data_analyst': Mock(name='data_analyst'),
            'report_writer': Mock(name='report_writer')
        }

    def test_create_analytics_tasks(self, mock_agents):
        """Test that analytics tasks can be created"""
        query = "Test query"
        tasks = create_analytics_tasks(mock_agents, query)

        assert isinstance(tasks, list)
        assert len(tasks) == 3

    def test_task_has_correct_attributes(self, mock_agents):
        """Test that tasks have correct attributes"""
        query = "Test query"
        tasks = create_analytics_tasks(mock_agents, query)

        task = tasks[0]
        assert hasattr(task, 'description')
        assert hasattr(task, 'agent')
        assert hasattr(task, 'expected_output')

    def test_tasks_have_context_dependencies(self, mock_agents):
        """Test that tasks have correct context dependencies"""
        query = "Test query"
        tasks = create_analytics_tasks(mock_agents, query)

        # First task should have no context
        assert len(tasks[0].context) == 0

        # Second task should have first task as context
        assert len(tasks[1].context) == 1

        # Third task should have two tasks as context
        assert len(tasks[2].context) == 2


class TestAnalyticsFlow:
    """Test Analytics Flow"""

    def test_analytics_state_initialization(self):
        """Test that AnalyticsState can be initialized"""
        state = AnalyticsState(
            query="Test query",
            organization_id=100048
        )

        assert state.query == "Test query"
        assert state.organization_id == 100048
        assert state.collected_data == {}
        assert state.final_report == ""
        assert state.error == ""

    def test_analytics_flow_initialization(self):
        """Test that AnalyticsFlow can be initialized"""
        flow = AnalyticsFlow()

        assert flow.mcp_tools is None
        assert flow.agents is None
        assert flow.crew is None

    @pytest.mark.skipif(
        not os.getenv("OPENAI_API_KEY"),
        reason="Requires OPENAI_API_KEY environment variable"
    )
    def test_flow_state_updates(self):
        """Test that flow state updates correctly"""
        flow = AnalyticsFlow()
        initial_state = AnalyticsState(
            query="Test query",
            organization_id=100048
        )

        # Initialize flow
        state = flow.initialize_flow()
        assert state.query == "Test query"


class TestIntegration:
    """Integration tests (require API keys)"""

    @pytest.mark.skipif(
        not os.getenv("OPENAI_API_KEY"),
        reason="Requires OPENAI_API_KEY environment variable"
    )
    @pytest.mark.integration
    def test_run_analytics_query_basic(self):
        """Test running a basic analytics query (integration test)"""
        query = "Show summary of campaigns for organization 100048"

        # This is a real call - may take time and use API credits
        report = run_analytics_query(query, organization_id=100048)

        assert isinstance(report, str)
        assert len(report) > 0
        assert "Error" not in report or "error" not in report.lower()


def test_imports():
    """Test that all modules can be imported"""
    try:
        from shared.mcp_tools import create_mcp_tools
        from agents.agent_definitions import create_analytics_agents
        from tasks.task_definitions import create_analytics_tasks
        from flows.analytics_flow import AnalyticsFlow, run_analytics_query

        assert True
    except ImportError as e:
        pytest.fail(f"Import failed: {e}")


def test_basic_flow_structure():
    """Test basic flow structure without execution"""
    flow = AnalyticsFlow()

    assert hasattr(flow, 'initialize_flow')
    assert hasattr(flow, 'execute_analytics_crew')
    assert hasattr(flow, 'finalize_report')

    # Check that methods are decorated
    assert hasattr(flow.initialize_flow, '__wrapped__')


if __name__ == "__main__":
    """Run tests with pytest"""
    pytest.main([__file__, "-v", "-s"])
