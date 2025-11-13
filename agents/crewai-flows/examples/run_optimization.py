#!/usr/bin/env python3
"""
Example: Running the Optimization Flow

This script demonstrates how to use the Optimization Flow with natural language queries.
"""

import os
import sys
import json
from dotenv import load_dotenv

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flows.optimization_flow import run_optimization_flow


def main():
    """Run optimization flow examples"""

    # Load environment variables
    load_dotenv()

    # Ensure OpenAI API key is set
    if not os.getenv("OPENAI_API_KEY"):
        print("❌ ERROR: OPENAI_API_KEY environment variable not set")
        print("Please set it with: export OPENAI_API_KEY='your-key-here'")
        return

    print("="*80)
    print("OPTIMIZATION FLOW EXAMPLES")
    print("="*80)
    print("\nThis demonstrates the CrewAI Flow that processes natural language")
    print("optimization queries and executes actions using the MediaMath MCP server.")
    print("\n" + "="*80 + "\n")

    # Example queries to demonstrate
    example_queries = [
        {
            "name": "Example 1: Pause Underperforming Strategies",
            "query": "Pause all underperforming strategies with CTR < 0.5%",
            "description": "Identifies and pauses strategies with poor click-through rates"
        },
        {
            "name": "Example 2: Budget Optimization",
            "query": "Optimize campaign budgets based on performance",
            "description": "Reallocates budgets from low performers to high performers"
        },
        {
            "name": "Example 3: Cost Control",
            "query": "Reduce spend on strategies with CPC > $2.50",
            "description": "Cuts budgets for strategies with high cost-per-click"
        }
    ]

    # Let user choose an example
    print("Available Examples:")
    for idx, example in enumerate(example_queries, 1):
        print(f"\n{idx}. {example['name']}")
        print(f"   Query: \"{example['query']}\"")
        print(f"   Description: {example['description']}")

    print("\n" + "="*80)

    # Get user choice
    try:
        choice = input("\nSelect an example (1-3) or press Enter for custom query: ").strip()

        if choice == "":
            # Custom query
            nl_query = input("Enter your optimization query: ").strip()
            if not nl_query:
                print("❌ No query provided. Exiting.")
                return
        elif choice.isdigit() and 1 <= int(choice) <= len(example_queries):
            # Use example query
            selected = example_queries[int(choice) - 1]
            nl_query = selected['query']
            print(f"\n📝 Running: {selected['name']}")
        else:
            print("❌ Invalid choice. Exiting.")
            return

    except KeyboardInterrupt:
        print("\n\n👋 Cancelled by user")
        return

    # Set organization ID (default to test org)
    organization_id = int(os.getenv("MEDIAMATH_ORG_ID", "100048"))

    print(f"\n{'='*80}")
    print("EXECUTING OPTIMIZATION FLOW")
    print(f"{'='*80}")
    print(f"Query: {nl_query}")
    print(f"Organization ID: {organization_id}")
    print(f"{'='*80}\n")

    try:
        # Run the optimization flow
        result = run_optimization_flow(
            nl_query=nl_query,
            organization_id=organization_id
        )

        # Display results
        print(f"\n{'='*80}")
        print("OPTIMIZATION FLOW RESULTS")
        print(f"{'='*80}\n")

        if result.get("status") == "error":
            print(f"❌ Flow failed: {result.get('error')}")
        else:
            print("✅ Flow completed successfully!")

            # Pretty print the results
            print("\n" + "="*80)
            print("PERFORMANCE ANALYSIS:")
            print("="*80)
            print(json.dumps(result.get("performance_analysis", {}), indent=2))

            print("\n" + "="*80)
            print("OPTIMIZATION DECISIONS:")
            print("="*80)
            print(json.dumps(result.get("optimization_decisions", {}), indent=2))

            print("\n" + "="*80)
            print("EXECUTION RESULTS:")
            print("="*80)
            print(json.dumps(result.get("execution_results", {}), indent=2))

        print("\n" + "="*80)
        print("DONE")
        print("="*80)

    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
