"""
Flow Router - Intelligent routing for CrewAI Flows
Routes natural language queries to the appropriate flow based on intent classification
"""

import os
from typing import Dict, Any, Optional, Tuple
from openai import OpenAI
import json


class FlowRouter:
    """
    Intelligent router that classifies natural language queries
    and routes them to the appropriate CrewAI flow.

    Supports 5 flows:
    - campaign_setup_flow: Creating new campaigns
    - optimization_flow: Optimizing campaign performance
    - analytics_flow: Analyzing campaign data and reports
    - compliance_flow: Auditing users, permissions, and compliance
    - creative_flow: Managing creative assets and refresh
    """

    # Flow classification patterns
    FLOW_PATTERNS = {
        "campaign_setup_flow": {
            "keywords": ["create", "launch", "set up", "new campaigns", "bulk create", "build", "setup", "establish"],
            "description": "Creating new campaigns, bulk campaign creation",
            "examples": [
                "Create 10 holiday campaigns with $5000 budget each",
                "Set up 5 campaigns for Black Friday",
                "Launch new campaigns for Q4",
                "Build 20 campaigns targeting millennials"
            ]
        },
        "optimization_flow": {
            "keywords": ["pause", "optimize", "adjust", "improve", "reduce spend", "underperforming", "increase performance", "scale", "bid adjustment"],
            "description": "Optimizing campaign performance, pausing underperformers, adjusting budgets",
            "examples": [
                "Pause all underperforming campaigns",
                "Optimize campaigns with high CPA",
                "Adjust bids for better performance",
                "Reduce spend on low-performing strategies"
            ]
        },
        "analytics_flow": {
            "keywords": ["report", "analyze", "show", "performance", "budget utilization", "metrics", "dashboard", "statistics", "insights", "data"],
            "description": "Analyzing campaign performance, generating reports, showing metrics",
            "examples": [
                "Generate performance report for all campaigns",
                "Show budget utilization analysis",
                "Analyze campaign metrics for last 30 days",
                "Create dashboard of key performance indicators"
            ]
        },
        "compliance_flow": {
            "keywords": ["audit", "permissions", "access", "security", "compliance", "users", "roles", "governance", "violation"],
            "description": "Auditing user access, checking permissions, compliance reviews",
            "examples": [
                "Audit all user permissions for security review",
                "Check for users with admin access",
                "Find compliance violations in permissions",
                "Review user access patterns"
            ]
        },
        "creative_flow": {
            "keywords": ["creative", "refresh", "fatigue", "assets", "ads", "banner", "image", "video", "copy"],
            "description": "Managing creative assets, identifying refresh needs, creative fatigue analysis",
            "examples": [
                "Find all creatives that need refresh",
                "Analyze creative fatigue across campaigns",
                "Identify underperforming creatives",
                "Plan creative refresh strategy"
            ]
        }
    }

    def __init__(self, openai_api_key: Optional[str] = None):
        """
        Initialize the FlowRouter

        Args:
            openai_api_key: OpenAI API key (defaults to OPENAI_API_KEY env var)
        """
        self.api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key is required. Set OPENAI_API_KEY environment variable or pass it to the constructor.")

        self.client = OpenAI(api_key=self.api_key)

    def classify_intent(self, query: str) -> Tuple[str, float]:
        """
        Classify the intent of a natural language query using LLM

        Args:
            query: Natural language query from user

        Returns:
            Tuple of (flow_name, confidence_score)
        """
        # Build classification prompt
        flow_descriptions = "\n".join([
            f"- {flow}: {info['description']}\n  Keywords: {', '.join(info['keywords'][:5])}\n  Example: {info['examples'][0]}"
            for flow, info in self.FLOW_PATTERNS.items()
        ])

        prompt = f"""You are a query classifier for a campaign management system.
Classify the following user query into one of these flows:

{flow_descriptions}

User Query: "{query}"

Respond with a JSON object containing:
- "flow": The flow name (one of: campaign_setup_flow, optimization_flow, analytics_flow, compliance_flow, creative_flow)
- "confidence": A confidence score between 0.0 and 1.0
- "reasoning": Brief explanation of why this flow was chosen

Example response:
{{"flow": "campaign_setup_flow", "confidence": 0.95, "reasoning": "Query asks to create new campaigns"}}
"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a precise query classifier. Always respond with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=200
            )

            result_text = response.choices[0].message.content.strip()

            # Parse JSON response
            result = json.loads(result_text)
            flow_name = result.get("flow")
            confidence = result.get("confidence", 0.5)
            reasoning = result.get("reasoning", "")

            # Validate flow name
            if flow_name not in self.FLOW_PATTERNS:
                return self._fallback_classification(query)

            print(f"\n[Router] Classification: {flow_name}")
            print(f"[Router] Confidence: {confidence:.2f}")
            print(f"[Router] Reasoning: {reasoning}\n")

            return flow_name, confidence

        except Exception as e:
            print(f"[Router] Error during LLM classification: {e}")
            print("[Router] Falling back to keyword-based classification...")
            return self._fallback_classification(query)

    def _fallback_classification(self, query: str) -> Tuple[str, float]:
        """
        Fallback classification using simple keyword matching

        Args:
            query: Natural language query

        Returns:
            Tuple of (flow_name, confidence_score)
        """
        query_lower = query.lower()

        # Count keyword matches for each flow
        scores = {}
        for flow, info in self.FLOW_PATTERNS.items():
            score = sum(1 for keyword in info["keywords"] if keyword in query_lower)
            scores[flow] = score

        # Get flow with highest score
        best_flow = max(scores, key=scores.get)
        best_score = scores[best_flow]

        # Calculate confidence (normalize to 0.0-1.0)
        confidence = min(best_score / 3.0, 1.0) if best_score > 0 else 0.3

        return best_flow, confidence

    def route(self, query: str) -> Dict[str, Any]:
        """
        Route a natural language query to the appropriate flow

        Args:
            query: Natural language query from user

        Returns:
            Dict containing:
            - flow_name: The selected flow
            - confidence: Confidence score
            - query: Original query
            - flow_info: Information about the selected flow
        """
        print(f"\n{'='*80}")
        print("FLOW ROUTER")
        print(f"{'='*80}")
        print(f"Query: {query}")
        print(f"{'='*80}")

        # Classify intent
        flow_name, confidence = self.classify_intent(query)

        # Get flow info
        flow_info = self.FLOW_PATTERNS.get(flow_name, {})

        result = {
            "flow_name": flow_name,
            "confidence": confidence,
            "query": query,
            "flow_info": {
                "description": flow_info.get("description", ""),
                "keywords": flow_info.get("keywords", []),
                "examples": flow_info.get("examples", [])
            }
        }

        print(f"\n[Router] Routing to: {flow_name}")
        print(f"[Router] Confidence: {confidence:.2f}")
        print(f"{'='*80}\n")

        return result

    def execute_flow(self, query: str) -> Dict[str, Any]:
        """
        Route query and execute the appropriate flow

        Args:
            query: Natural language query from user

        Returns:
            Dict containing routing info and flow execution result
        """
        # Route the query
        routing_result = self.route(query)
        flow_name = routing_result["flow_name"]

        # Import and execute the appropriate flow
        try:
            if flow_name == "campaign_setup_flow":
                from flows.campaign_setup_flow import run_campaign_setup_flow
                flow_result = run_campaign_setup_flow(query)
            elif flow_name == "optimization_flow":
                from flows.optimization_flow import run_optimization_flow
                flow_result = run_optimization_flow(query)
            elif flow_name == "analytics_flow":
                from flows.analytics_flow import run_analytics_flow
                flow_result = run_analytics_flow(query)
            elif flow_name == "compliance_flow":
                from flows.compliance_flow import run_compliance_flow
                flow_result = run_compliance_flow(query)
            elif flow_name == "creative_flow":
                from flows.creative_flow import run_creative_flow
                flow_result = run_creative_flow(query)
            else:
                raise ValueError(f"Unknown flow: {flow_name}")

            return {
                "routing": routing_result,
                "result": flow_result,
                "success": True
            }

        except Exception as e:
            return {
                "routing": routing_result,
                "error": str(e),
                "success": False
            }

    def list_flows(self) -> Dict[str, Dict[str, Any]]:
        """
        Get information about all available flows

        Returns:
            Dict mapping flow names to their information
        """
        return self.FLOW_PATTERNS


def create_router(openai_api_key: Optional[str] = None) -> FlowRouter:
    """
    Factory function to create a FlowRouter instance

    Args:
        openai_api_key: Optional OpenAI API key

    Returns:
        FlowRouter instance
    """
    return FlowRouter(openai_api_key)


if __name__ == "__main__":
    import sys

    # Test the router
    if len(sys.argv) < 2:
        print("Usage: python flow_router.py <query>")
        print("\nExample queries:")
        print('  python flow_router.py "Create 10 campaigns for Black Friday"')
        print('  python flow_router.py "Pause underperforming campaigns"')
        print('  python flow_router.py "Generate performance report"')
        sys.exit(1)

    query = " ".join(sys.argv[1:])
    router = create_router()
    result = router.route(query)

    print("\nRouting Result:")
    print(json.dumps(result, indent=2))
