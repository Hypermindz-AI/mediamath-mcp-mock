"""
Basic usage examples for CrewAI Flows.

This file demonstrates how to use the CrewAI Flows with natural language queries.
"""

from shared.mcp_client import MCPClient
from shared.mcp_tools import wrap_mcp_tools
from config.settings import settings


def test_mcp_connection():
    """Test basic MCP server connection."""
    print("Testing MCP Connection...")
    print(f"MCP Server URL: {settings.MCP_SERVER_URL}")

    client = MCPClient(settings.MCP_SERVER_URL, settings.MCP_API_KEY)

    # Test ping
    if client.ping():
        print("✓ MCP server is reachable")
    else:
        print("✗ MCP server is not reachable")
        return False

    # Test tool listing
    try:
        tools = client.list_tools()
        print(f"✓ Found {len(tools)} tools available")
        return True
    except Exception as e:
        print(f"✗ Error listing tools: {e}")
        return False


def test_find_organizations():
    """Test finding organizations."""
    print("\nTesting find_organizations tool...")

    client = MCPClient(settings.MCP_SERVER_URL, settings.MCP_API_KEY)

    try:
        result = client.call_tool("find_organizations", {})
        print(f"✓ Result: {result}")
        return True
    except Exception as e:
        print(f"✗ Error: {e}")
        return False


def test_find_campaigns():
    """Test finding campaigns."""
    print("\nTesting find_campaigns tool...")

    client = MCPClient(settings.MCP_SERVER_URL, settings.MCP_API_KEY)

    try:
        result = client.call_tool("find_campaigns", {
            "organization_id": settings.DEFAULT_ORGANIZATION_ID
        })
        print(f"✓ Result: {result}")
        return True
    except Exception as e:
        print(f"✗ Error: {e}")
        return False


def test_langchain_tools():
    """Test LangChain tool wrappers."""
    print("\nTesting LangChain tool wrappers...")

    try:
        # Create tools
        tools = wrap_mcp_tools(settings.MCP_SERVER_URL, settings.MCP_API_KEY)
        print(f"✓ Created {len(tools)} LangChain tools")

        # Test a tool
        find_campaigns_tool = tools['find_campaigns']
        print(f"✓ Tool name: {find_campaigns_tool.name}")
        print(f"✓ Tool description: {find_campaigns_tool.description}")

        return True
    except Exception as e:
        print(f"✗ Error: {e}")
        return False


def example_natural_language_queries():
    """
    Examples of natural language queries that flows can handle.

    NOTE: These are example queries. Actual flow implementations are needed to execute them.
    """
    print("\n" + "="*80)
    print("EXAMPLE NATURAL LANGUAGE QUERIES")
    print("="*80)

    queries = {
        "Campaign Setup": [
            "Create 5 holiday campaigns with $10,000 budget each",
            "Set up a new campaign for Product X targeting adults 25-45",
            "Launch 10 campaigns for Black Friday with different budgets",
        ],
        "Optimization": [
            "Pause all strategies with CTR below 0.5%",
            "Increase budgets for top 3 performing campaigns by 20%",
            "Optimize bid prices for underperforming strategies",
        ],
        "Analytics": [
            "Generate a weekly budget utilization report",
            "Show me campaign performance for the last 30 days",
            "Analyze which audience segments have the highest ROI",
        ],
        "Compliance": [
            "Audit all user permissions in the organization",
            "Find users with admin access",
            "Generate a compliance report for security review",
        ],
        "Creative": [
            "Find all creatives used in active campaigns",
            "Identify creatives that need refresh based on performance",
            "Show me top performing creatives by CTR",
        ]
    }

    for category, query_list in queries.items():
        print(f"\n{category} Queries:")
        for i, query in enumerate(query_list, 1):
            print(f"  {i}. \"{query}\"")

    print("\n" + "="*80)
    print("To execute these queries, implement the corresponding flows in flows/ directory")
    print("="*80)


def main():
    """Run all examples."""
    print("="*80)
    print("CrewAI Flows - Basic Usage Examples")
    print("="*80)

    # Test MCP connection
    if not test_mcp_connection():
        print("\n⚠️  MCP connection failed. Check your configuration.")
        return

    # Test individual tools
    test_find_organizations()
    test_find_campaigns()

    # Test LangChain wrappers
    test_langchain_tools()

    # Show example queries
    example_natural_language_queries()

    print("\n✓ All basic tests completed!")


if __name__ == "__main__":
    main()
