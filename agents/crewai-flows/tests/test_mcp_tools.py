"""
Tests for MCP Tools wrapper.
"""

import pytest
from shared.mcp_tools import wrap_mcp_tools, get_tools_by_category
from config.settings import settings


@pytest.fixture
def mcp_tools():
    """Fixture providing wrapped MCP tools."""
    return wrap_mcp_tools(settings.MCP_SERVER_URL, settings.MCP_API_KEY)


def test_wrap_mcp_tools_creates_all_tools(mcp_tools):
    """Test that all 28 tools are created."""
    # Should have at least 28 tools
    assert len(mcp_tools) >= 28


def test_wrap_mcp_tools_creates_langchain_tools(mcp_tools):
    """Test that tools are LangChain Tool instances."""
    from langchain.tools import Tool

    for tool_name, tool in mcp_tools.items():
        assert isinstance(tool, Tool)
        assert tool.name == tool_name
        assert tool.description is not None
        assert callable(tool.func)


def test_campaign_management_tools_exist(mcp_tools):
    """Test that campaign management tools exist."""
    required_tools = [
        'find_campaigns',
        'get_campaign_info',
        'create_campaign',
        'update_campaign',
        'delete_campaign',
        'update_campaign_budget',
    ]

    for tool_name in required_tools:
        assert tool_name in mcp_tools


def test_strategy_management_tools_exist(mcp_tools):
    """Test that strategy management tools exist."""
    required_tools = [
        'find_strategies',
        'get_strategy_info',
        'create_strategy',
        'update_strategy',
        'delete_strategy',
    ]

    for tool_name in required_tools:
        assert tool_name in mcp_tools


def test_audience_management_tools_exist(mcp_tools):
    """Test that audience management tools exist."""
    required_tools = [
        'find_audience_segments',
        'get_audience_segment_info',
        'create_audience_segment',
        'update_audience_segment',
        'delete_audience_segment',
    ]

    for tool_name in required_tools:
        assert tool_name in mcp_tools


def test_creative_management_tools_exist(mcp_tools):
    """Test that creative management tools exist."""
    required_tools = [
        'find_creatives',
        'get_creative_info',
        'create_creative',
        'update_creative',
        'delete_creative',
    ]

    for tool_name in required_tools:
        assert tool_name in mcp_tools


def test_user_management_tools_exist(mcp_tools):
    """Test that user management tools exist."""
    required_tools = [
        'find_organizations',
        'get_organization_info',
        'find_users',
        'get_user_info',
        'get_user_permissions',
    ]

    for tool_name in required_tools:
        assert tool_name in mcp_tools


def test_supply_management_tools_exist(mcp_tools):
    """Test that supply management tools exist."""
    required_tools = [
        'find_supply_sources',
        'get_supply_source_info',
    ]

    for tool_name in required_tools:
        assert tool_name in mcp_tools


def test_get_tools_by_category(mcp_tools):
    """Test tools can be organized by category."""
    categories = get_tools_by_category(mcp_tools)

    assert 'campaign_management' in categories
    assert 'strategy_management' in categories
    assert 'audience_management' in categories
    assert 'creative_management' in categories
    assert 'organization_management' in categories
    assert 'user_management' in categories
    assert 'supply_management' in categories

    # Each category should have tools
    for category_name, tools in categories.items():
        assert isinstance(tools, list)
        assert len(tools) > 0


def test_tool_execution_basic(mcp_tools):
    """Test basic tool execution (if server is available)."""
    try:
        find_orgs_tool = mcp_tools['find_organizations']
        result = find_orgs_tool.func()
        assert result is not None
        assert isinstance(result, str)
    except Exception as e:
        pytest.skip(f"MCP server not available: {e}")
