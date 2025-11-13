"""
MCP Tools Wrapper for CrewAI
Wraps MediaMath MCP Server tools as LangChain tools for use with CrewAI agents
"""

import os
import requests
import json
from typing import Dict, Any, Optional
from langchain.tools import Tool


class MCPToolWrapper:
    """Wrapper for MediaMath MCP tools to work with CrewAI/LangChain"""

    def __init__(self, server_url: str, api_key: Optional[str] = None):
        self.server_url = server_url
        self.api_key = api_key

    def _call_mcp(self, tool_name: str, arguments: Dict[str, Any]) -> str:
        """Make JSON-RPC call to MCP server"""
        headers = {
            "Content-Type": "application/json",
        }

        if self.api_key:
            headers["X-API-Key"] = self.api_key

        payload = {
            "jsonrpc": "2.0",
            "method": "tools/call",
            "params": {
                "name": tool_name,
                "arguments": arguments
            },
            "id": 1
        }

        try:
            response = requests.post(self.server_url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            data = response.json()

            if "error" in data:
                raise Exception(f"MCP Error: {data['error'].get('message', 'Unknown error')}")

            # Extract text from content array
            if "result" in data and "content" in data["result"]:
                content = data["result"]["content"]
                if len(content) > 0 and content[0]["type"] == "text":
                    return content[0]["text"]

            return json.dumps(data.get("result", {}))

        except requests.exceptions.RequestException as e:
            return f"Error calling MCP tool {tool_name}: {str(e)}"
        except Exception as e:
            return f"Error processing MCP response: {str(e)}"

    def create_tool(self, tool_name: str, description: str) -> Tool:
        """Create a LangChain Tool from MCP tool definition"""

        def tool_func(input_str: str = "") -> str:
            """Tool execution function"""
            try:
                # Parse input if it's JSON string
                if input_str and input_str.strip():
                    try:
                        kwargs = json.loads(input_str)
                    except json.JSONDecodeError:
                        # If not JSON, treat as simple string argument
                        kwargs = {"query": input_str}
                else:
                    kwargs = {}

                result = self._call_mcp(tool_name, kwargs)
                return str(result)
            except Exception as e:
                return f"Error executing {tool_name}: {str(e)}"

        return Tool(
            name=tool_name,
            description=description,
            func=tool_func
        )


def wrap_mcp_tools(server_url: str, api_key: Optional[str] = None) -> Dict[str, Tool]:
    """Create LangChain tools for all MCP tools"""
    wrapper = MCPToolWrapper(server_url, api_key)

    tools = {
        # Campaign tools
        'find_campaigns': wrapper.create_tool(
            tool_name='find_campaigns',
            description='Find campaigns by organization ID, advertiser ID, or status. Returns list of campaigns with budget and performance data. Input: {"organization_id": 100048} or {"advertiser_id": 5001}'
        ),
        'get_campaign_info': wrapper.create_tool(
            tool_name='get_campaign_info',
            description='Get detailed campaign information including metrics, strategies, and status. Requires campaign_id. Input: {"campaign_id": 12345}'
        ),
        'create_campaign': wrapper.create_tool(
            tool_name='create_campaign',
            description='Create a new campaign. Requires name, organization_id, and budget. Input: {"name": "Campaign Name", "organization_id": 100048, "budget": 10000.00}'
        ),
        'update_campaign': wrapper.create_tool(
            tool_name='update_campaign',
            description='Update campaign properties like status, budget, or name. Input: {"campaign_id": 12345, "updates": {"status": "paused"}}'
        ),

        # Strategy tools
        'find_strategies': wrapper.create_tool(
            tool_name='find_strategies',
            description='Find strategies by campaign ID, organization ID, or status. Returns list of strategies with bid and budget info. Input: {"campaign_id": 12345} or {"organization_id": 100048}'
        ),
        'get_strategy_info': wrapper.create_tool(
            tool_name='get_strategy_info',
            description='Get detailed strategy information including performance metrics. Input: {"strategy_id": 67890}'
        ),
        'create_strategy': wrapper.create_tool(
            tool_name='create_strategy',
            description='Create a new strategy for a campaign. Input: {"campaign_id": 12345, "name": "Strategy Name", "type": "display"}'
        ),
        'update_strategy': wrapper.create_tool(
            tool_name='update_strategy',
            description='Update strategy properties like status, bid, or budget. Input: {"strategy_id": 67890, "updates": {"status": "paused", "bid": 2.50}}'
        ),

        # Audience tools
        'create_audience_segment': wrapper.create_tool(
            tool_name='create_audience_segment',
            description='Create an audience segment for targeting. Input: {"name": "Segment Name", "organization_id": 100048, "description": "Segment description"}'
        ),
        'find_audience_segments': wrapper.create_tool(
            tool_name='find_audience_segments',
            description='Find audience segments by organization. Input: {"organization_id": 100048}'
        ),

        # Creative tools
        'find_creatives': wrapper.create_tool(
            tool_name='find_creatives',
            description='Find creatives by organization, advertiser, or status. Returns list of creative assets. Input: {"organization_id": 100048} or {"advertiser_id": 5001}'
        ),
        'get_creative_info': wrapper.create_tool(
            tool_name='get_creative_info',
            description='Get detailed creative information including performance metrics and usage. Input: {"creative_id": 98765}'
        ),
        'create_creative': wrapper.create_tool(
            tool_name='create_creative',
            description='Create a new creative asset. Input: {"name": "Creative Name", "advertiser_id": 5001, "creative_type": "banner"}'
        ),

        # User/Organization tools
        'find_organizations': wrapper.create_tool(
            tool_name='find_organizations',
            description='Find all organizations. Returns list of organizations with details. Input: {} (no parameters needed)'
        ),
        'find_users': wrapper.create_tool(
            tool_name='find_users',
            description='Find users by organization or role. Returns list of users. Input: {"organization_id": 100048} or {"role": "campaign_manager"}'
        ),
        'get_user_permissions': wrapper.create_tool(
            tool_name='get_user_permissions',
            description='Get detailed user permissions and access levels. Input: {"user_id": 111}'
        ),
        'get_user_info': wrapper.create_tool(
            tool_name='get_user_info',
            description='Get detailed user information. Input: {"user_id": 111}'
        ),

        # Budget tools
        'update_campaign_budget': wrapper.create_tool(
            tool_name='update_campaign_budget',
            description='Update campaign budget. Input: {"campaign_id": 12345, "budget": 15000.00}'
        ),
        'get_budget_allocation': wrapper.create_tool(
            tool_name='get_budget_allocation',
            description='Get budget allocation across campaigns. Input: {"organization_id": 100048}'
        ),

        # Supply source tools
        'find_supply_sources': wrapper.create_tool(
            tool_name='find_supply_sources',
            description='Find available supply sources for ad serving. Input: {} or {"type": "display"}'
        ),
        'get_supply_source_performance': wrapper.create_tool(
            tool_name='get_supply_source_performance',
            description='Get supply source performance metrics. Input: {"supply_source_id": 88888}'
        ),
    }

    return tools


def get_default_mcp_tools() -> Dict[str, Tool]:
    """
    Get MCP tools with default configuration from environment variables
    """
    server_url = os.getenv(
        "MCP_SERVER_URL",
        "https://mediamath-mcp-mock-two.vercel.app/api/message"
    )
    api_key = os.getenv("MCP_API_KEY", "mcp_mock_2025_hypermindz_44b87c1d20ed")

    return wrap_mcp_tools(server_url, api_key)
