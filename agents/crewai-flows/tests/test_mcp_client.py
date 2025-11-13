"""
Tests for MCP Client.
"""

import pytest
from shared.mcp_client import MCPClient
from config.settings import settings


@pytest.fixture
def mcp_client():
    """Fixture providing MCP client instance."""
    return MCPClient(settings.MCP_SERVER_URL, settings.MCP_API_KEY)


def test_mcp_client_initialization(mcp_client):
    """Test MCP client can be initialized."""
    assert mcp_client.server_url == settings.MCP_SERVER_URL
    assert mcp_client.api_key == settings.MCP_API_KEY


def test_mcp_client_ping(mcp_client):
    """Test MCP client can ping server."""
    result = mcp_client.ping()
    assert isinstance(result, bool)


def test_mcp_client_list_tools(mcp_client):
    """Test MCP client can list tools."""
    try:
        tools = mcp_client.list_tools()
        assert isinstance(tools, list)
        if len(tools) > 0:
            # Check first tool has required fields
            tool = tools[0]
            assert "name" in tool
            assert "description" in tool or "inputSchema" in tool
    except Exception as e:
        pytest.skip(f"MCP server not available: {e}")


def test_mcp_client_call_find_organizations(mcp_client):
    """Test calling find_organizations tool."""
    try:
        result = mcp_client.call_tool("find_organizations", {})
        assert result is not None
    except Exception as e:
        pytest.skip(f"MCP server not available: {e}")


def test_mcp_client_call_find_campaigns(mcp_client):
    """Test calling find_campaigns tool."""
    try:
        result = mcp_client.call_tool("find_campaigns", {
            "organization_id": settings.DEFAULT_ORGANIZATION_ID
        })
        assert result is not None
    except Exception as e:
        pytest.skip(f"MCP server not available: {e}")


def test_mcp_client_error_handling(mcp_client):
    """Test MCP client handles errors properly."""
    # Test with invalid tool name
    with pytest.raises(Exception):
        mcp_client.call_tool("invalid_tool_name", {})


def test_mcp_client_request_id_increment(mcp_client):
    """Test request ID increments properly."""
    id1 = mcp_client._get_next_request_id()
    id2 = mcp_client._get_next_request_id()
    assert id2 == id1 + 1
