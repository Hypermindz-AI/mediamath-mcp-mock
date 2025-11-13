#!/usr/bin/env python3
"""
Example: Running the Compliance Flow
Demonstrates how to use the Compliance Flow for user access auditing
"""

import os
import sys

# Add parent directories to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))

from flows.compliance_flow import run_compliance_flow


def main():
    """
    Run compliance flow examples with different natural language queries
    """
    
    print("\n" + "=" * 80)
    print("COMPLIANCE FLOW EXAMPLES")
    print("=" * 80)
    print("\nThese examples demonstrate how to use the Compliance Flow")
    print("with natural language queries for user access auditing.\n")
    print("=" * 80 + "\n")
    
    # Example queries
    examples = [
        {
            "name": "Basic Security Audit",
            "query": "Audit all user permissions for security review",
            "description": "Comprehensive audit of all users and their permissions"
        },
        {
            "name": "Admin Access Review",
            "query": "Check for users with admin access who shouldn't have it",
            "description": "Identify users with elevated privileges"
        },
        {
            "name": "Compliance Violations",
            "query": "Identify compliance violations in user permissions",
            "description": "Find permission issues that violate compliance policies"
        },
        {
            "name": "Inactive User Audit",
            "query": "Find all inactive users who still have active access",
            "description": "Identify security risk from stale accounts"
        },
        {
            "name": "Permission Anomalies",
            "query": "Detect unusual permission patterns and access anomalies",
            "description": "Find outliers and suspicious permission combinations"
        }
    ]
    
    # Let user choose an example or provide their own query
    print("Available Examples:")
    print("-" * 80)
    for idx, example in enumerate(examples, 1):
        print(f"\n{idx}. {example['name']}")
        print(f"   Query: \"{example['query']}\"")
        print(f"   Description: {example['description']}")
    
    print("\n" + "-" * 80)
    print(f"\n{len(examples) + 1}. Custom Query (enter your own)")
    print("\n" + "=" * 80)
    
    # Get user choice
    try:
        choice = input(f"\nSelect an example (1-{len(examples) + 1}) [default: 1]: ").strip()
        
        if not choice:
            choice = "1"
        
        choice_num = int(choice)
        
        if choice_num < 1 or choice_num > len(examples) + 1:
            print(f"\nInvalid choice. Using default (1).")
            choice_num = 1
        
        # Get the query
        if choice_num <= len(examples):
            example = examples[choice_num - 1]
            query = example['query']
            print(f"\n\nRunning Example: {example['name']}")
            print(f"Query: \"{query}\"")
            print(f"Description: {example['description']}")
        else:
            query = input("\nEnter your custom query: ").strip()
            if not query:
                print("\nNo query provided. Using default.")
                query = examples[0]['query']
            print(f"\nRunning Custom Query: \"{query}\"")
        
    except (ValueError, KeyboardInterrupt):
        print("\n\nUsing default example (1).")
        query = examples[0]['query']
    
    print("\n" + "=" * 80)
    print("STARTING COMPLIANCE FLOW")
    print("=" * 80 + "\n")
    
    # Run the flow
    try:
        result = run_compliance_flow(query)
        
        print("\n\n" + "=" * 80)
        print("COMPLIANCE FLOW COMPLETED SUCCESSFULLY")
        print("=" * 80)
        print("\nFinal Report:")
        print("-" * 80)
        print(result)
        print("\n" + "=" * 80)
        
    except Exception as e:
        print("\n\n" + "=" * 80)
        print("ERROR RUNNING COMPLIANCE FLOW")
        print("=" * 80)
        print(f"\nError: {str(e)}")
        print("\nMake sure:")
        print("1. OpenAI API key is set: export OPENAI_API_KEY=your_key")
        print("2. MCP server is accessible")
        print("3. All dependencies are installed: pip install -r requirements.txt")
        print("\n" + "=" * 80)
        sys.exit(1)


if __name__ == "__main__":
    # Check for environment variables
    if not os.getenv("OPENAI_API_KEY"):
        print("\n" + "=" * 80)
        print("WARNING: OPENAI_API_KEY not found in environment")
        print("=" * 80)
        print("\nPlease set your OpenAI API key:")
        print("  export OPENAI_API_KEY=your_api_key_here")
        print("\nOr create a .env file with:")
        print("  OPENAI_API_KEY=your_api_key_here")
        print("\n" + "=" * 80 + "\n")
        
        # Ask if user wants to continue anyway (for testing)
        try:
            continue_anyway = input("Continue anyway? (y/N): ").strip().lower()
            if continue_anyway != 'y':
                print("\nExiting. Please set OPENAI_API_KEY and try again.")
                sys.exit(1)
        except KeyboardInterrupt:
            print("\n\nExiting.")
            sys.exit(1)
    
    main()
