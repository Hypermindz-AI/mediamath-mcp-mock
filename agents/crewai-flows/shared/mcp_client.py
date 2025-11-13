"""
MCP JSON-RPC Client for MediaMath MCP Server.
Handles all communication with the MCP server using JSON-RPC 2.0 protocol.
"""

import requests
from typing import Dict, Any, Optional, List
import json


class MCPClient:
    """Client for making JSON-RPC calls to MediaMath MCP server."""

    def __init__(self, server_url: str, api_key: str):
        """
        Initialize MCP client.

        Args:
            server_url: URL of the MCP server
            api_key: API key for authentication
        """
        self.server_url = server_url
        self.api_key = api_key
        self.request_id = 0

    def _get_next_request_id(self) -> int:
        """Generate next request ID for JSON-RPC."""
        self.request_id += 1
        return self.request_id

    def call_tool(
        self,
        tool_name: str,
        arguments: Dict[str, Any],
        timeout: int = 30
    ) -> Any:
        """
        Call an MCP tool using JSON-RPC.

        Args:
            tool_name: Name of the tool to call
            arguments: Tool arguments as dictionary
            timeout: Request timeout in seconds

        Returns:
            Tool response data

        Raises:
            Exception: If the MCP server returns an error
        """
        headers = {
            "Content-Type": "application/json",
            "X-API-Key": self.api_key
        }

        payload = {
            "jsonrpc": "2.0",
            "method": "tools/call",
            "params": {
                "name": tool_name,
                "arguments": arguments
            },
            "id": self._get_next_request_id()
        }

        try:
            response = requests.post(
                self.server_url,
                json=payload,
                headers=headers,
                timeout=timeout
            )
            response.raise_for_status()
            data = response.json()

            # Check for JSON-RPC error
            if "error" in data:
                error_msg = data["error"].get("message", "Unknown error")
                error_code = data["error"].get("code", -1)
                raise Exception(f"MCP Error ({error_code}): {error_msg}")

            # Extract result from response
            if "result" in data:
                result = data["result"]

                # Handle content array format
                if isinstance(result, dict) and "content" in result:
                    content = result["content"]
                    if isinstance(content, list) and len(content) > 0:
                        if content[0].get("type") == "text":
                            text_content = content[0].get("text", "")
                            # Try to parse as JSON
                            try:
                                return json.loads(text_content)
                            except json.JSONDecodeError:
                                return text_content
                return result

            return None

        except requests.exceptions.RequestException as e:
            raise Exception(f"HTTP Error calling MCP tool '{tool_name}': {str(e)}")
        except json.JSONDecodeError as e:
            raise Exception(f"Invalid JSON response from MCP server: {str(e)}")

    def list_tools(self) -> List[Dict[str, Any]]:
        """
        List all available tools from the MCP server.

        Returns:
            List of tool definitions
        """
        headers = {
            "Content-Type": "application/json",
            "X-API-Key": self.api_key
        }

        payload = {
            "jsonrpc": "2.0",
            "method": "tools/list",
            "params": {},
            "id": self._get_next_request_id()
        }

        try:
            response = requests.post(
                self.server_url,
                json=payload,
                headers=headers
            )
            response.raise_for_status()
            data = response.json()

            if "error" in data:
                raise Exception(f"MCP Error: {data['error']['message']}")

            if "result" in data and "tools" in data["result"]:
                return data["result"]["tools"]

            return []

        except requests.exceptions.RequestException as e:
            raise Exception(f"HTTP Error listing tools: {str(e)}")

    def ping(self) -> bool:
        """
        Check if the MCP server is reachable.

        Returns:
            True if server is reachable, False otherwise
        """
        try:
            # Try to list tools as a ping
            self.list_tools()
            return True
        except Exception:
            return False
