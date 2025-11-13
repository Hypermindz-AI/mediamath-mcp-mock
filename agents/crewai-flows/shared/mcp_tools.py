"""
MCP Tools Wrapper for CrewAI/LangChain.
Converts all 28 MediaMath MCP tools into LangChain tools for use with CrewAI.
"""

from typing import Dict, Any, Callable
from langchain.tools import Tool
from .mcp_client import MCPClient


class MCPToolWrapper:
    """Wrapper that converts MCP tools to LangChain tools."""

    def __init__(self, mcp_client: MCPClient):
        """
        Initialize tool wrapper.

        Args:
            mcp_client: Configured MCP client instance
        """
        self.mcp_client = mcp_client

    def create_tool_func(self, tool_name: str) -> Callable:
        """
        Create a function that calls an MCP tool.

        Args:
            tool_name: Name of the MCP tool

        Returns:
            Function that executes the tool
        """
        def tool_func(**kwargs) -> str:
            """Execute MCP tool with given arguments."""
            try:
                result = self.mcp_client.call_tool(tool_name, kwargs)
                # Return string representation for LangChain
                if isinstance(result, dict) or isinstance(result, list):
                    import json
                    return json.dumps(result, indent=2)
                return str(result)
            except Exception as e:
                return f"Error executing {tool_name}: {str(e)}"

        return tool_func

    def create_tool(self, tool_name: str, description: str) -> Tool:
        """
        Create a LangChain Tool from MCP tool definition.

        Args:
            tool_name: Name of the tool
            description: Tool description for LLM

        Returns:
            LangChain Tool instance
        """
        return Tool(
            name=tool_name,
            description=description,
            func=self.create_tool_func(tool_name)
        )


def wrap_mcp_tools(server_url: str, api_key: str) -> Dict[str, Tool]:
    """
    Create LangChain tools for all 28 MediaMath MCP tools.

    Args:
        server_url: MCP server URL
        api_key: MCP API key

    Returns:
        Dictionary mapping tool names to LangChain Tool instances
    """
    mcp_client = MCPClient(server_url, api_key)
    wrapper = MCPToolWrapper(mcp_client)

    tools = {
        # Campaign Management Tools (6 tools)
        'find_campaigns': wrapper.create_tool(
            tool_name='find_campaigns',
            description=(
                'Find campaigns by organization ID. '
                'Args: organization_id (int). '
                'Returns: List of campaigns with IDs, names, statuses, and budgets.'
            )
        ),
        'get_campaign_info': wrapper.create_tool(
            tool_name='get_campaign_info',
            description=(
                'Get detailed campaign information including metrics. '
                'Args: campaign_id (int). '
                'Returns: Campaign details with spend, impressions, clicks, CTR, etc.'
            )
        ),
        'create_campaign': wrapper.create_tool(
            tool_name='create_campaign',
            description=(
                'Create a new campaign. '
                'Args: name (str), organization_id (int), budget (float). '
                'Returns: Created campaign ID and details.'
            )
        ),
        'update_campaign': wrapper.create_tool(
            tool_name='update_campaign',
            description=(
                'Update campaign properties. '
                'Args: campaign_id (int), updates (dict with fields like name, status, budget). '
                'Returns: Updated campaign details.'
            )
        ),
        'delete_campaign': wrapper.create_tool(
            tool_name='delete_campaign',
            description=(
                'Delete a campaign. '
                'Args: campaign_id (int). '
                'Returns: Deletion confirmation.'
            )
        ),
        'update_campaign_budget': wrapper.create_tool(
            tool_name='update_campaign_budget',
            description=(
                'Update campaign budget. '
                'Args: campaign_id (int), budget (float). '
                'Returns: Updated budget confirmation.'
            )
        ),

        # Strategy Management Tools (5 tools)
        'find_strategies': wrapper.create_tool(
            tool_name='find_strategies',
            description=(
                'Find strategies by campaign ID. '
                'Args: campaign_id (int). '
                'Returns: List of strategies with IDs, names, and statuses.'
            )
        ),
        'get_strategy_info': wrapper.create_tool(
            tool_name='get_strategy_info',
            description=(
                'Get detailed strategy information. '
                'Args: strategy_id (int). '
                'Returns: Strategy details with performance metrics.'
            )
        ),
        'create_strategy': wrapper.create_tool(
            tool_name='create_strategy',
            description=(
                'Create a new strategy. '
                'Args: campaign_id (int), name (str), budget (float, optional). '
                'Returns: Created strategy ID and details.'
            )
        ),
        'update_strategy': wrapper.create_tool(
            tool_name='update_strategy',
            description=(
                'Update strategy properties. '
                'Args: strategy_id (int), updates (dict with fields like name, status, bid). '
                'Returns: Updated strategy details.'
            )
        ),
        'delete_strategy': wrapper.create_tool(
            tool_name='delete_strategy',
            description=(
                'Delete a strategy. '
                'Args: strategy_id (int). '
                'Returns: Deletion confirmation.'
            )
        ),

        # Audience Management Tools (5 tools)
        'find_audience_segments': wrapper.create_tool(
            tool_name='find_audience_segments',
            description=(
                'Find audience segments by organization. '
                'Args: organization_id (int). '
                'Returns: List of audience segments.'
            )
        ),
        'get_audience_segment_info': wrapper.create_tool(
            tool_name='get_audience_segment_info',
            description=(
                'Get audience segment details. '
                'Args: segment_id (int). '
                'Returns: Segment details with targeting criteria.'
            )
        ),
        'create_audience_segment': wrapper.create_tool(
            tool_name='create_audience_segment',
            description=(
                'Create a new audience segment. '
                'Args: name (str), organization_id (int), criteria (dict, optional). '
                'Returns: Created segment ID and details.'
            )
        ),
        'update_audience_segment': wrapper.create_tool(
            tool_name='update_audience_segment',
            description=(
                'Update audience segment. '
                'Args: segment_id (int), updates (dict). '
                'Returns: Updated segment details.'
            )
        ),
        'delete_audience_segment': wrapper.create_tool(
            tool_name='delete_audience_segment',
            description=(
                'Delete an audience segment. '
                'Args: segment_id (int). '
                'Returns: Deletion confirmation.'
            )
        ),

        # Creative Management Tools (5 tools)
        'find_creatives': wrapper.create_tool(
            tool_name='find_creatives',
            description=(
                'Find creatives by organization. '
                'Args: organization_id (int). '
                'Returns: List of creatives with IDs, names, types, and statuses.'
            )
        ),
        'get_creative_info': wrapper.create_tool(
            tool_name='get_creative_info',
            description=(
                'Get creative details and performance. '
                'Args: creative_id (int). '
                'Returns: Creative details with CTR and engagement metrics.'
            )
        ),
        'create_creative': wrapper.create_tool(
            tool_name='create_creative',
            description=(
                'Create a new creative. '
                'Args: name (str), organization_id (int), creative_type (str), content (dict). '
                'Returns: Created creative ID and details.'
            )
        ),
        'update_creative': wrapper.create_tool(
            tool_name='update_creative',
            description=(
                'Update creative properties. '
                'Args: creative_id (int), updates (dict). '
                'Returns: Updated creative details.'
            )
        ),
        'delete_creative': wrapper.create_tool(
            tool_name='delete_creative',
            description=(
                'Delete a creative. '
                'Args: creative_id (int). '
                'Returns: Deletion confirmation.'
            )
        ),

        # Organization & User Management Tools (5 tools)
        'find_organizations': wrapper.create_tool(
            tool_name='find_organizations',
            description=(
                'Find all organizations accessible to the user. '
                'Args: None. '
                'Returns: List of organizations with IDs and names.'
            )
        ),
        'get_organization_info': wrapper.create_tool(
            tool_name='get_organization_info',
            description=(
                'Get organization details. '
                'Args: organization_id (int). '
                'Returns: Organization details including settings and limits.'
            )
        ),
        'find_users': wrapper.create_tool(
            tool_name='find_users',
            description=(
                'Find users by organization. '
                'Args: organization_id (int). '
                'Returns: List of users with IDs, names, and roles.'
            )
        ),
        'get_user_info': wrapper.create_tool(
            tool_name='get_user_info',
            description=(
                'Get user details. '
                'Args: user_id (int). '
                'Returns: User details including email and role.'
            )
        ),
        'get_user_permissions': wrapper.create_tool(
            tool_name='get_user_permissions',
            description=(
                'Get user permissions and access rights. '
                'Args: user_id (int). '
                'Returns: List of permissions and access levels.'
            )
        ),

        # Supply Source Tools (2 tools)
        'find_supply_sources': wrapper.create_tool(
            tool_name='find_supply_sources',
            description=(
                'Find supply sources (ad exchanges). '
                'Args: organization_id (int, optional). '
                'Returns: List of supply sources with IDs and names.'
            )
        ),
        'get_supply_source_info': wrapper.create_tool(
            tool_name='get_supply_source_info',
            description=(
                'Get supply source details and performance. '
                'Args: supply_source_id (int). '
                'Returns: Supply source performance metrics.'
            )
        ),
    }

    return tools


def get_tools_by_category(tools: Dict[str, Tool]) -> Dict[str, list]:
    """
    Organize tools by category for easier agent assignment.

    Args:
        tools: Dictionary of all tools

    Returns:
        Dictionary with tools grouped by category
    """
    return {
        'campaign_management': [
            tools['find_campaigns'],
            tools['get_campaign_info'],
            tools['create_campaign'],
            tools['update_campaign'],
            tools['delete_campaign'],
            tools['update_campaign_budget'],
        ],
        'strategy_management': [
            tools['find_strategies'],
            tools['get_strategy_info'],
            tools['create_strategy'],
            tools['update_strategy'],
            tools['delete_strategy'],
        ],
        'audience_management': [
            tools['find_audience_segments'],
            tools['get_audience_segment_info'],
            tools['create_audience_segment'],
            tools['update_audience_segment'],
            tools['delete_audience_segment'],
        ],
        'creative_management': [
            tools['find_creatives'],
            tools['get_creative_info'],
            tools['create_creative'],
            tools['update_creative'],
            tools['delete_creative'],
        ],
        'organization_management': [
            tools['find_organizations'],
            tools['get_organization_info'],
        ],
        'user_management': [
            tools['find_users'],
            tools['get_user_info'],
            tools['get_user_permissions'],
        ],
        'supply_management': [
            tools['find_supply_sources'],
            tools['get_supply_source_info'],
        ],
    }


def get_default_mcp_tools() -> Dict[str, Tool]:
    """
    Get MCP tools with default production configuration.
    
    Returns:
        Dictionary mapping tool names to LangChain Tool instances
        
    Example:
        >>> tools = get_default_mcp_tools()
        >>> campaign_tool = tools['find_campaigns']
    """
    DEFAULT_MCP_URL = "https://mediamath-mcp-mock-two.vercel.app/api/message"
    DEFAULT_API_KEY = "mcp_mock_2025_hypermindz_44b87c1d20ed"
    
    return wrap_mcp_tools(DEFAULT_MCP_URL, DEFAULT_API_KEY)
