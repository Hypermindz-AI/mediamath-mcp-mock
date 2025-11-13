#!/usr/bin/env python3
"""
Analytics Flow - Example Usage

This script demonstrates how to use the Analytics Flow with natural language queries.
"""

import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from flows.analytics_flow import run_analytics_query


def example_1_budget_report():
    """
    Example 1: Generate Weekly Budget Utilization Report

    This query asks for a comprehensive budget analysis across all campaigns.
    The flow will:
    1. Collect all campaign budget and spend data
    2. Calculate utilization percentages
    3. Generate a formatted report with recommendations
    """
    print("\n" + "="*80)
    print("EXAMPLE 1: Weekly Budget Utilization Report")
    print("="*80 + "\n")

    query = "Generate weekly budget utilization report for all campaigns"

    report = run_analytics_query(query, organization_id=100048)

    print("\nRESULT:")
    print("-"*80)
    print(report)
    print("-"*80)


def example_2_performance_analysis():
    """
    Example 2: Performance Analysis for Organization

    This query requests a broad performance analysis.
    The flow will:
    1. Collect campaign and strategy performance metrics
    2. Analyze CTR, CPC, conversions
    3. Identify top and bottom performers
    """
    print("\n" + "="*80)
    print("EXAMPLE 2: Performance Analysis")
    print("="*80 + "\n")

    query = "Show me performance analysis for organization 100048"

    report = run_analytics_query(query, organization_id=100048)

    print("\nRESULT:")
    print("-"*80)
    print(report)
    print("-"*80)


def example_3_underperforming_campaigns():
    """
    Example 3: Identify Underperforming Campaigns

    This query specifically asks for underperformers.
    The flow will:
    1. Collect all campaign data
    2. Analyze against performance benchmarks
    3. Flag campaigns below thresholds
    """
    print("\n" + "="*80)
    print("EXAMPLE 3: Underperforming Campaigns")
    print("="*80 + "\n")

    query = "Which campaigns are underperforming based on CTR and CPC?"

    report = run_analytics_query(query, organization_id=100048)

    print("\nRESULT:")
    print("-"*80)
    print(report)
    print("-"*80)


def example_4_top_performers():
    """
    Example 4: Top Performing Strategies

    This query asks for the best performers.
    The flow will:
    1. Collect strategy performance data
    2. Rank by CTR
    3. Generate report highlighting winners
    """
    print("\n" + "="*80)
    print("EXAMPLE 4: Top Performing Strategies")
    print("="*80 + "\n")

    query = "Give me top performing strategies by CTR with detailed metrics"

    report = run_analytics_query(query, organization_id=100048)

    print("\nRESULT:")
    print("-"*80)
    print(report)
    print("-"*80)


def example_5_budget_pacing():
    """
    Example 5: Budget Pacing Analysis

    This query focuses on budget pacing.
    The flow will:
    1. Collect budget and spend data
    2. Calculate pacing (ahead/behind/on-track)
    3. Identify campaigns at risk
    """
    print("\n" + "="*80)
    print("EXAMPLE 5: Budget Pacing Analysis")
    print("="*80 + "\n")

    query = "Analyze budget pacing across all campaigns and identify risks"

    report = run_analytics_query(query, organization_id=100048)

    print("\nRESULT:")
    print("-"*80)
    print(report)
    print("-"*80)


def custom_query_example():
    """
    Example: Custom Natural Language Query

    Demonstrates how to run your own custom query.
    """
    print("\n" + "="*80)
    print("CUSTOM QUERY EXAMPLE")
    print("="*80 + "\n")

    # Your custom query here
    custom_query = input("Enter your query (or press Enter to skip): ").strip()

    if not custom_query:
        print("Skipping custom query.")
        return

    report = run_analytics_query(custom_query, organization_id=100048)

    print("\nRESULT:")
    print("-"*80)
    print(report)
    print("-"*80)


def main():
    """
    Main function to run examples
    """
    # Check for OpenAI API key
    if not os.getenv("OPENAI_API_KEY"):
        print("\nERROR: OPENAI_API_KEY environment variable not set")
        print("\nPlease set it before running examples:")
        print('  export OPENAI_API_KEY="your-key-here"')
        print("\nOr add it to a .env file in the project root.")
        sys.exit(1)

    print("\n" + "="*80)
    print("Analytics Flow - Example Usage")
    print("="*80)
    print("\nThis script demonstrates various natural language queries")
    print("that the Analytics Flow can process.")
    print("\nAvailable examples:")
    print("  1. Budget Utilization Report")
    print("  2. Performance Analysis")
    print("  3. Underperforming Campaigns")
    print("  4. Top Performing Strategies")
    print("  5. Budget Pacing Analysis")
    print("  6. Custom Query")
    print("  0. Run All Examples")
    print("="*80 + "\n")

    choice = input("Select example (0-6): ").strip()

    if choice == "1":
        example_1_budget_report()
    elif choice == "2":
        example_2_performance_analysis()
    elif choice == "3":
        example_3_underperforming_campaigns()
    elif choice == "4":
        example_4_top_performers()
    elif choice == "5":
        example_5_budget_pacing()
    elif choice == "6":
        custom_query_example()
    elif choice == "0":
        print("\nRunning all examples...\n")
        example_1_budget_report()
        example_2_performance_analysis()
        example_3_underperforming_campaigns()
        example_4_top_performers()
        example_5_budget_pacing()
    else:
        print(f"\nInvalid choice: {choice}")
        sys.exit(1)

    print("\n" + "="*80)
    print("Examples Complete")
    print("="*80 + "\n")


if __name__ == "__main__":
    main()
