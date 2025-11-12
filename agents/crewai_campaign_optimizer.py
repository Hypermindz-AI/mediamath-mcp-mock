"""
CrewAI Campaign Optimizer Agent
Demonstrates using the MediaMath MCP Server from a CrewAI agent
"""

import requests
import json
from crewai import Agent, Task, Crew, Process
from langchain.tools import Tool

# MCP Server URL (update after deploying to Vercel)
# MCP_SERVER_URL = "http://localhost:3001/api/message"  # Local
MCP_SERVER_URL = "https://mediamath-mcp-mock-two.vercel.app/api/message"  # Production

def call_mcp_tool(tool_name: str, arguments: dict) -> dict:
    """
    Call an MCP tool via HTTP
    """
    payload = {
        "jsonrpc": "2.0",
        "method": "tools/call",
        "params": {
            "name": tool_name,
            "arguments": arguments
        },
        "id": 1
    }

    response = requests.post(MCP_SERVER_URL, json=payload)
    result = response.json()

    if "error" in result:
        raise Exception(f"MCP Error: {result['error']}")

    # Extract text content from MCP response
    if "result" in result and "content" in result["result"]:
        return json.loads(result["result"]["content"][0]["text"])

    return result

# Create LangChain tools that wrap MCP tools
find_campaigns_tool = Tool(
    name="find_campaigns",
    description="Search for campaigns by advertiser, organization, or status. Returns campaign list with budgets and goals.",
    func=lambda args: call_mcp_tool("find_campaigns", json.loads(args) if isinstance(args, str) else args)
)

get_campaign_info_tool = Tool(
    name="get_campaign_info",
    description="Get detailed information about a specific campaign including strategies. Requires campaign_id.",
    func=lambda args: call_mcp_tool("get_campaign_info", json.loads(args) if isinstance(args, str) else args)
)

find_strategies_tool = Tool(
    name="find_strategies",
    description="Search for strategies by campaign, status, or type. Returns strategy list with budgets and bids.",
    func=lambda args: call_mcp_tool("find_strategies", json.loads(args) if isinstance(args, str) else args)
)

# Define the Campaign Analyst Agent
campaign_analyst = Agent(
    role='Campaign Performance Analyst',
    goal='Analyze campaign performance and identify optimization opportunities',
    backstory="""You are an expert digital advertising analyst with 10 years of experience
    optimizing campaigns across multiple platforms. You excel at identifying underperforming
    campaigns and providing actionable recommendations.""",
    tools=[find_campaigns_tool, get_campaign_info_tool, find_strategies_tool],
    verbose=True
)

# Define the Budget Optimizer Agent
budget_optimizer = Agent(
    role='Budget Optimization Specialist',
    goal='Recommend budget reallocation to maximize ROI',
    backstory="""You specialize in budget optimization and have a proven track record of
    increasing campaign efficiency by 30-50% through strategic budget reallocation.""",
    tools=[find_campaigns_tool, find_strategies_tool],
    verbose=True
)

# Define tasks
task1 = Task(
    description="""
    Analyze all active campaigns for advertiser_id 5001 (ACME Retail Division).

    Steps:
    1. Find all campaigns for advertiser 5001
    2. Get detailed info for each campaign including strategies
    3. Identify campaigns with:
       - Total budget > $30,000
       - Multiple strategies (display + video)

    Provide a summary of findings.
    """,
    agent=campaign_analyst,
    expected_output="JSON report of campaign analysis with budget breakdown and strategy count"
)

task2 = Task(
    description="""
    Based on the campaign analysis, recommend budget optimization strategies.

    Focus on:
    1. Campaigns with low spend efficiency
    2. Underperforming strategy types
    3. Budget reallocation opportunities

    Provide specific recommendations with expected impact.
    """,
    agent=budget_optimizer,
    expected_output="Markdown report with 3-5 actionable budget optimization recommendations"
)

# Create the crew
crew = Crew(
    agents=[campaign_analyst, budget_optimizer],
    tasks=[task1, task2],
    process=Process.sequential,
    verbose=True
)

def main():
    """
    Run the CrewAI campaign optimization workflow
    """
    print("🚀 Starting Campaign Optimization Crew...")
    print(f"📡 Connected to MCP Server: {MCP_SERVER_URL}")
    print("-" * 80)

    try:
        # Execute the crew
        result = crew.kickoff()

        print("\n" + "=" * 80)
        print("✅ Campaign Optimization Complete!")
        print("=" * 80)
        print(result)

    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nMake sure:")
        print("1. Next.js dev server is running: npm run dev")
        print("2. Or deploy to Vercel and update MCP_SERVER_URL")

if __name__ == "__main__":
    main()
