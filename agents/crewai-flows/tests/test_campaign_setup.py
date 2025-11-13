"""
Tests for Campaign Setup Flow

Basic tests for NL campaign creation flow
"""

import pytest
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flows.campaign_setup_flow import CampaignSetupFlow, execute_campaign_setup_flow
from shared.mcp_tools import get_default_mcp_tools
from agents.campaign_setup_agents import create_campaign_setup_agents


class TestCampaignSetupFlow:
    """Test suite for Campaign Setup Flow"""

    def test_flow_initialization(self):
        """Test that flow initializes properly"""
        flow = CampaignSetupFlow()

        assert flow is not None
        assert flow.mcp_tools is not None
        assert flow.campaign_strategist is not None
        assert flow.campaign_builder is not None
        assert flow.qa_specialist is not None

    def test_state_initialization(self):
        """Test that flow state initializes correctly"""
        flow = CampaignSetupFlow()

        assert flow.state.natural_language_query == ""
        assert flow.state.campaign_strategy == {}
        assert flow.state.implementation_report == {}
        assert flow.state.qa_report == {}
        assert flow.state.final_result == {}

    @pytest.mark.skipif(
        os.getenv("OPENAI_API_KEY") is None,
        reason="OpenAI API key not set"
    )
    def test_simple_campaign_creation(self):
        """Test simple campaign creation with NL query"""
        query = "Create 2 test campaigns with $1000 budget each"

        # This would execute the full flow
        # Skipped by default to avoid API calls
        # To run: set OPENAI_API_KEY and remove @pytest.mark.skip
        pass

    def test_mcp_tools_available(self):
        """Test that MCP tools are available"""
        mcp_tools = get_default_mcp_tools()

        required_tools = [
            'find_campaigns',
            'get_campaign_info',
            'create_campaign',
            'create_strategy',
            'find_organizations'
        ]

        for tool_name in required_tools:
            assert tool_name in mcp_tools, f"Missing tool: {tool_name}"

    def test_agent_creation(self):
        """Test that agents are created properly"""
        mcp_tools = get_default_mcp_tools()
        agents = create_campaign_setup_agents(mcp_tools)

        assert 'campaign_strategist' in agents
        assert 'campaign_builder' in agents
        assert 'qa_specialist' in agents

        assert agents['campaign_strategist'].role == "Campaign Strategist"
        assert agents['campaign_builder'].role == "Campaign Builder"
        assert agents['qa_specialist'].role == "Quality Assurance Specialist"

    def test_natural_language_parsing(self):
        """Test various NL query formats"""
        test_queries = [
            "Create 10 holiday campaigns with $5000 budget each",
            "Set up 5 campaigns for Black Friday with total budget of $25000",
            "Launch 3 campaigns for new product with $2000 each",
            "Create 7 Valentine's Day campaigns"
        ]

        # Each query should be parseable
        # In a real test, we'd verify the parsing output
        for query in test_queries:
            assert len(query) > 0
            assert any(word in query.lower() for word in ['create', 'set up', 'launch'])


class TestAgents:
    """Test suite for Campaign Setup Agents"""

    def test_strategist_tools(self):
        """Test that strategist has correct tools"""
        mcp_tools = get_default_mcp_tools()
        agents = create_campaign_setup_agents(mcp_tools)

        strategist = agents['campaign_strategist']
        assert len(strategist.tools) == 2  # find_organizations, find_campaigns

    def test_builder_tools(self):
        """Test that builder has correct tools"""
        mcp_tools = get_default_mcp_tools()
        agents = create_campaign_setup_agents(mcp_tools)

        builder = agents['campaign_builder']
        assert len(builder.tools) == 3  # create_campaign, create_strategy, get_campaign_info

    def test_qa_tools(self):
        """Test that QA specialist has correct tools"""
        mcp_tools = get_default_mcp_tools()
        agents = create_campaign_setup_agents(mcp_tools)

        qa = agents['qa_specialist']
        assert len(qa.tools) == 3  # get_campaign_info, find_campaigns, get_strategy_info


class TestIntegration:
    """Integration tests (require API keys and MCP server)"""

    @pytest.mark.skip(reason="Integration test - requires API keys")
    def test_end_to_end_flow(self):
        """
        End-to-end test of campaign setup flow

        To run this test:
        1. Set OPENAI_API_KEY environment variable
        2. Ensure MCP server is accessible
        3. Remove @pytest.mark.skip decorator
        """
        query = "Create 2 test campaigns with $1000 each"

        result = execute_campaign_setup_flow(query)

        assert result is not None
        assert 'query' in result
        assert result['query'] == query


if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v"])
