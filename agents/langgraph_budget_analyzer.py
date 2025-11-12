"""
LangGraph Budget Analyzer Agent
Uses state machine approach to analyze MediaMath campaigns via MCP Server
"""

import requests
import json
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, AIMessage

# MCP Server URL
# MCP_SERVER_URL = "http://localhost:3001/api/message"  # Local
MCP_SERVER_URL = "https://mediamath-mcp-mock-two.vercel.app/api/message"  # Production

def call_mcp_tool(tool_name: str, arguments: dict) -> dict:
    """Call an MCP tool via HTTP"""
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

    if "result" in result and "content" in result["result"]:
        return json.loads(result["result"]["content"][0]["text"])

    return result

# Define the state
class AnalysisState(TypedDict):
    organization_id: int
    campaigns: list
    strategies: list
    analysis: dict
    recommendations: list
    messages: list

# Node functions
def fetch_campaigns(state: AnalysisState) -> AnalysisState:
    """Fetch all campaigns for the organization"""
    print(f"\n📊 Fetching campaigns for organization {state['organization_id']}...")

    result = call_mcp_tool("find_campaigns", {
        "organization_id": state['organization_id']
    })

    campaigns = result.get("items", [])
    state["campaigns"] = campaigns
    state["messages"].append(
        AIMessage(content=f"Found {len(campaigns)} campaigns")
    )

    print(f"   ✓ Found {len(campaigns)} campaigns")
    return state

def fetch_strategies(state: AnalysisState) -> AnalysisState:
    """Fetch all strategies for each campaign"""
    print(f"\n🎯 Fetching strategies for {len(state['campaigns'])} campaigns...")

    all_strategies = []
    for campaign in state["campaigns"]:
        result = call_mcp_tool("find_strategies", {
            "campaign_id": campaign["id"]
        })
        strategies = result.get("items", [])
        all_strategies.extend(strategies)

    state["strategies"] = all_strategies
    state["messages"].append(
        AIMessage(content=f"Found {len(all_strategies)} strategies across all campaigns")
    )

    print(f"   ✓ Found {len(all_strategies)} total strategies")
    return state

def analyze_budgets(state: AnalysisState) -> AnalysisState:
    """Analyze budget allocation and performance"""
    print(f"\n💰 Analyzing budget allocation...")

    campaigns = state["campaigns"]
    strategies = state["strategies"]

    # Calculate totals
    total_campaign_budget = sum(c.get("total_budget", 0) for c in campaigns)
    total_strategy_budget = sum(s.get("budget", 0) for s in strategies)

    # Budget by goal type
    budget_by_goal = {}
    for campaign in campaigns:
        goal = campaign.get("goal_type", "unknown")
        budget = campaign.get("total_budget", 0)
        budget_by_goal[goal] = budget_by_goal.get(goal, 0) + budget

    # Budget by strategy type
    budget_by_type = {}
    for strategy in strategies:
        stype = strategy.get("type", "unknown")
        budget = strategy.get("budget", 0)
        budget_by_type[stype] = budget_by_type.get(stype, 0) + budget

    analysis = {
        "total_campaigns": len(campaigns),
        "total_strategies": len(strategies),
        "total_campaign_budget": total_campaign_budget,
        "total_strategy_budget": total_strategy_budget,
        "budget_utilization": (total_strategy_budget / total_campaign_budget * 100) if total_campaign_budget > 0 else 0,
        "budget_by_goal_type": budget_by_goal,
        "budget_by_strategy_type": budget_by_type,
    }

    state["analysis"] = analysis
    state["messages"].append(
        AIMessage(content=f"Analysis complete. Budget utilization: {analysis['budget_utilization']:.1f}%")
    )

    print(f"   ✓ Budget Utilization: {analysis['budget_utilization']:.1f}%")
    return state

def generate_recommendations(state: AnalysisState) -> AnalysisState:
    """Generate actionable recommendations based on analysis"""
    print(f"\n💡 Generating recommendations...")

    analysis = state["analysis"]
    recommendations = []

    # Check budget utilization
    if analysis["budget_utilization"] < 80:
        underutilized = analysis["total_campaign_budget"] - analysis["total_strategy_budget"]
        recommendations.append({
            "priority": "HIGH",
            "category": "Budget Allocation",
            "issue": f"Low budget utilization ({analysis['budget_utilization']:.1f}%)",
            "recommendation": f"Allocate ${underutilized:,.2f} remaining budget across top-performing strategies",
            "expected_impact": "15-20% increase in reach"
        })

    # Check strategy diversity
    strategy_types = list(analysis["budget_by_strategy_type"].keys())
    if len(strategy_types) < 3:
        recommendations.append({
            "priority": "MEDIUM",
            "category": "Strategy Diversity",
            "issue": f"Limited strategy types ({len(strategy_types)} types)",
            "recommendation": "Test additional strategy types (display, video, mobile, native)",
            "expected_impact": "10-15% broader audience reach"
        })

    # Check goal distribution
    goal_types = list(analysis["budget_by_goal_type"].keys())
    if len(goal_types) == 1:
        recommendations.append({
            "priority": "MEDIUM",
            "category": "Goal Optimization",
            "issue": "Single goal type across all campaigns",
            "recommendation": "Diversify campaign goals to balance brand awareness and performance",
            "expected_impact": "Better funnel coverage"
        })

    state["recommendations"] = recommendations
    state["messages"].append(
        AIMessage(content=f"Generated {len(recommendations)} recommendations")
    )

    print(f"   ✓ Generated {len(recommendations)} recommendations")
    return state

def print_report(state: AnalysisState) -> AnalysisState:
    """Print the final analysis report"""
    print("\n" + "=" * 80)
    print("📈 BUDGET ANALYSIS REPORT")
    print("=" * 80)

    analysis = state["analysis"]

    print(f"\n📊 OVERVIEW")
    print(f"   • Total Campaigns: {analysis['total_campaigns']}")
    print(f"   • Total Strategies: {analysis['total_strategies']}")
    print(f"   • Campaign Budget: ${analysis['total_campaign_budget']:,.2f}")
    print(f"   • Strategy Budget: ${analysis['total_strategy_budget']:,.2f}")
    print(f"   • Utilization: {analysis['budget_utilization']:.1f}%")

    print(f"\n💰 BUDGET BY GOAL TYPE")
    for goal, budget in analysis["budget_by_goal_type"].items():
        percentage = (budget / analysis["total_campaign_budget"] * 100) if analysis["total_campaign_budget"] > 0 else 0
        print(f"   • {goal.upper()}: ${budget:,.2f} ({percentage:.1f}%)")

    print(f"\n🎯 BUDGET BY STRATEGY TYPE")
    for stype, budget in analysis["budget_by_strategy_type"].items():
        percentage = (budget / analysis["total_strategy_budget"] * 100) if analysis["total_strategy_budget"] > 0 else 0
        print(f"   • {stype.upper()}: ${budget:,.2f} ({percentage:.1f}%)")

    print(f"\n💡 RECOMMENDATIONS")
    for i, rec in enumerate(state["recommendations"], 1):
        print(f"\n   {i}. [{rec['priority']}] {rec['category']}")
        print(f"      Issue: {rec['issue']}")
        print(f"      Action: {rec['recommendation']}")
        print(f"      Impact: {rec['expected_impact']}")

    print("\n" + "=" * 80)

    return state

# Create the graph
def create_workflow():
    """Create the LangGraph workflow"""
    workflow = StateGraph(AnalysisState)

    # Add nodes
    workflow.add_node("fetch_campaigns", fetch_campaigns)
    workflow.add_node("fetch_strategies", fetch_strategies)
    workflow.add_node("analyze_budgets", analyze_budgets)
    workflow.add_node("generate_recommendations", generate_recommendations)
    workflow.add_node("print_report", print_report)

    # Add edges
    workflow.set_entry_point("fetch_campaigns")
    workflow.add_edge("fetch_campaigns", "fetch_strategies")
    workflow.add_edge("fetch_strategies", "analyze_budgets")
    workflow.add_edge("analyze_budgets", "generate_recommendations")
    workflow.add_edge("generate_recommendations", "print_report")
    workflow.add_edge("print_report", END)

    return workflow.compile()

def main():
    """Run the LangGraph budget analyzer"""
    print("🚀 Starting LangGraph Budget Analyzer")
    print(f"📡 Connected to MCP Server: {MCP_SERVER_URL}")
    print("-" * 80)

    try:
        # Create workflow
        app = create_workflow()

        # Run analysis for ACME Corporation (org 100048)
        initial_state = {
            "organization_id": 100048,
            "campaigns": [],
            "strategies": [],
            "analysis": {},
            "recommendations": [],
            "messages": [HumanMessage(content="Analyze budget allocation for ACME Corporation")]
        }

        result = app.invoke(initial_state)

        print("\n✅ Analysis Complete!")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nMake sure:")
        print("1. Next.js dev server is running: npm run dev")
        print("2. Or deploy to Vercel and update MCP_SERVER_URL")

if __name__ == "__main__":
    main()
