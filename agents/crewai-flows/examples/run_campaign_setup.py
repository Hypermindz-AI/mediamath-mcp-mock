"""
Example: Running Campaign Setup Flow with Natural Language Queries

This demonstrates the Campaign Setup Flow with various NL queries.
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flows.campaign_setup_flow import execute_campaign_setup_flow


def example_1_budget_per_campaign():
    """
    Example 1: Create campaigns with budget per campaign specified
    """
    print("\n" + "="*80)
    print("EXAMPLE 1: Budget Per Campaign")
    print("="*80)

    query = "Create 10 holiday campaigns with $5000 budget each"

    print(f"\nQuery: {query}\n")

    result = execute_campaign_setup_flow(query)

    print("\n\nResult Summary:")
    print("-" * 80)
    print(f"Query: {result.get('query', 'N/A')}")
    print("\nFlow completed successfully!")
    print("="*80)

    return result


def example_2_total_budget():
    """
    Example 2: Create campaigns with total budget to split
    """
    print("\n" + "="*80)
    print("EXAMPLE 2: Total Budget Split")
    print("="*80)

    query = "Set up 5 campaigns for Black Friday with total budget of $25000"

    print(f"\nQuery: {query}\n")

    result = execute_campaign_setup_flow(query)

    print("\n\nResult Summary:")
    print("-" * 80)
    print(f"Query: {result.get('query', 'N/A')}")
    print("\nFlow completed successfully!")
    print("="*80)

    return result


def example_3_minimal_query():
    """
    Example 3: Minimal query with defaults
    """
    print("\n" + "="*80)
    print("EXAMPLE 3: Minimal Query")
    print("="*80)

    query = "Create 3 campaigns for new product launch"

    print(f"\nQuery: {query}\n")

    result = execute_campaign_setup_flow(query)

    print("\n\nResult Summary:")
    print("-" * 80)
    print(f"Query: {result.get('query', 'N/A')}")
    print("\nFlow completed successfully!")
    print("="*80)

    return result


def example_4_with_theme():
    """
    Example 4: Query with specific theme
    """
    print("\n" + "="*80)
    print("EXAMPLE 4: Query with Theme")
    print("="*80)

    query = "Launch 7 campaigns for Valentine's Day promotion with $3000 each"

    print(f"\nQuery: {query}\n")

    result = execute_campaign_setup_flow(query)

    print("\n\nResult Summary:")
    print("-" * 80)
    print(f"Query: {result.get('query', 'N/A')}")
    print("\nFlow completed successfully!")
    print("="*80)

    return result


def run_all_examples():
    """
    Run all example queries
    """
    examples = [
        ("Example 1: Budget Per Campaign", example_1_budget_per_campaign),
        ("Example 2: Total Budget Split", example_2_total_budget),
        ("Example 3: Minimal Query", example_3_minimal_query),
        ("Example 4: With Theme", example_4_with_theme),
    ]

    print("\n\n" + "="*80)
    print("RUNNING ALL CAMPAIGN SETUP EXAMPLES")
    print("="*80)

    results = []

    for name, example_func in examples:
        try:
            print(f"\n\nRunning: {name}")
            result = example_func()
            results.append((name, "SUCCESS", result))
        except Exception as e:
            print(f"\n\nERROR in {name}: {str(e)}")
            results.append((name, "FAILED", str(e)))

    print("\n\n" + "="*80)
    print("ALL EXAMPLES SUMMARY")
    print("="*80)

    for name, status, _ in results:
        status_symbol = "✓" if status == "SUCCESS" else "✗"
        print(f"{status_symbol} {name}: {status}")

    print("="*80 + "\n")

    return results


if __name__ == "__main__":
    # Check for command line argument to run specific example
    if len(sys.argv) > 1:
        example_num = sys.argv[1]

        examples = {
            "1": example_1_budget_per_campaign,
            "2": example_2_total_budget,
            "3": example_3_minimal_query,
            "4": example_4_with_theme,
            "all": run_all_examples
        }

        if example_num in examples:
            examples[example_num]()
        else:
            print(f"Unknown example: {example_num}")
            print("Usage: python run_campaign_setup.py [1|2|3|4|all]")
            print("\nExamples:")
            print("  1 - Budget per campaign")
            print("  2 - Total budget split")
            print("  3 - Minimal query")
            print("  4 - With theme")
            print("  all - Run all examples")
    else:
        # Default: run example 1
        print("Running default example (Example 1)")
        print("Usage: python run_campaign_setup.py [1|2|3|4|all]")
        example_1_budget_per_campaign()
