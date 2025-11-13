#!/usr/bin/env python3
"""
Main CLI Application for CrewAI Flows
Interactive and single-query modes for natural language campaign management
"""

import os
import sys
from typing import Optional
import argparse
from dotenv import load_dotenv

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from router.flow_router import FlowRouter


# ANSI color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


def print_colored(text: str, color: str = Colors.ENDC):
    """Print colored text to terminal"""
    print(f"{color}{text}{Colors.ENDC}")


def print_banner():
    """Print application banner"""
    banner = f"""
{Colors.BOLD}{Colors.OKBLUE}{'='*80}
{'':>25}CrewAI Flows - Campaign Management CLI
{'='*80}{Colors.ENDC}

{Colors.OKCYAN}Natural Language Interface for:{Colors.ENDC}
  • Campaign Setup    - Create and launch new campaigns
  • Optimization      - Improve campaign performance
  • Analytics         - Generate reports and insights
  • Compliance        - Audit users and permissions
  • Creative          - Manage creative assets

{Colors.WARNING}Type 'help' for commands, 'examples' for sample queries, 'exit' to quit{Colors.ENDC}
"""
    print(banner)


def print_help():
    """Print help information"""
    help_text = f"""
{Colors.BOLD}Available Commands:{Colors.ENDC}

  {Colors.OKGREEN}help{Colors.ENDC}      - Show this help message
  {Colors.OKGREEN}examples{Colors.ENDC}  - Show example queries for each flow
  {Colors.OKGREEN}flows{Colors.ENDC}     - List all available flows
  {Colors.OKGREEN}exit{Colors.ENDC}      - Exit the application
  {Colors.OKGREEN}quit{Colors.ENDC}      - Exit the application

{Colors.BOLD}Usage:{Colors.ENDC}
  Simply type your request in natural language, and the router will
  automatically select and execute the appropriate flow.

{Colors.BOLD}Example:{Colors.ENDC}
  > Create 10 campaigns for Black Friday with $5000 each
  > Pause all underperforming campaigns
  > Generate performance report for last 30 days
"""
    print(help_text)


def print_examples():
    """Print example queries for each flow"""
    examples = f"""
{Colors.BOLD}{Colors.HEADER}Example Queries by Flow Type:{Colors.ENDC}

{Colors.BOLD}{Colors.OKGREEN}1. Campaign Setup Flow{Colors.ENDC}
   • "Create 10 holiday campaigns with $5000 budget each"
   • "Set up 5 campaigns for Black Friday with total budget of $25000"
   • "Launch new campaigns targeting millennials in California"
   • "Build 20 campaigns for Q4 with different targeting"

{Colors.BOLD}{Colors.OKGREEN}2. Optimization Flow{Colors.ENDC}
   • "Pause all underperforming campaigns"
   • "Optimize campaigns with CPA above $50"
   • "Adjust bids for better performance"
   • "Reduce spend on low-performing strategies"
   • "Scale up high-performing campaigns"

{Colors.BOLD}{Colors.OKGREEN}3. Analytics Flow{Colors.ENDC}
   • "Generate performance report for all campaigns"
   • "Show budget utilization analysis for last 30 days"
   • "Analyze campaign metrics and trends"
   • "Create dashboard of key performance indicators"
   • "Report on campaign spend and ROI"

{Colors.BOLD}{Colors.OKGREEN}4. Compliance Flow{Colors.ENDC}
   • "Audit all user permissions for security review"
   • "Check for users with admin access who shouldn't have it"
   • "Find compliance violations in user permissions"
   • "Review user access patterns for anomalies"
   • "Identify inactive users with active access"

{Colors.BOLD}{Colors.OKGREEN}5. Creative Flow{Colors.ENDC}
   • "Find all creatives that need refresh based on performance"
   • "Analyze creative fatigue across all campaigns"
   • "Identify underperforming creatives in high-budget campaigns"
   • "Plan creative refresh strategy for Q4"
   • "Find creatives older than 90 days that need updating"
"""
    print(examples)


def print_flows(router: FlowRouter):
    """Print information about all available flows"""
    flows_info = router.list_flows()

    print(f"\n{Colors.BOLD}{Colors.HEADER}Available Flows:{Colors.ENDC}\n")

    for flow_name, info in flows_info.items():
        print(f"{Colors.BOLD}{Colors.OKGREEN}{flow_name}{Colors.ENDC}")
        print(f"  Description: {info['description']}")
        print(f"  Keywords: {', '.join(info['keywords'][:5])}")
        print(f"  Example: {info['examples'][0]}")
        print()


def validate_environment():
    """Validate required environment variables"""
    required_vars = {
        "OPENAI_API_KEY": "OpenAI API key for LLM calls",
        "MCP_SERVER_URL": "MediaMath MCP server URL",
        "MCP_API_KEY": "MediaMath MCP API key"
    }

    missing_vars = []
    for var, description in required_vars.items():
        if not os.getenv(var):
            missing_vars.append(f"  • {var}: {description}")

    if missing_vars:
        print_colored(f"\n{Colors.FAIL}Error: Missing required environment variables:{Colors.ENDC}", Colors.FAIL)
        for var in missing_vars:
            print(var)
        print(f"\n{Colors.WARNING}Please set these in your .env file or as environment variables{Colors.ENDC}")
        return False

    return True


def execute_query(router: FlowRouter, query: str) -> bool:
    """
    Execute a single query

    Args:
        router: FlowRouter instance
        query: Natural language query

    Returns:
        True if successful, False otherwise
    """
    try:
        print_colored(f"\n{Colors.OKCYAN}Processing query...{Colors.ENDC}", Colors.OKCYAN)

        # Execute flow
        result = router.execute_flow(query)

        if result.get("success"):
            print_colored(f"\n{Colors.OKGREEN}✓ Query executed successfully!{Colors.ENDC}", Colors.OKGREEN)

            # Print routing info
            routing = result.get("routing", {})
            print(f"\n{Colors.BOLD}Flow Selected:{Colors.ENDC} {routing.get('flow_name')}")
            print(f"{Colors.BOLD}Confidence:{Colors.ENDC} {routing.get('confidence', 0):.2f}")

            # Print result summary
            flow_result = result.get("result", {})
            if flow_result:
                print(f"\n{Colors.BOLD}Result Summary:{Colors.ENDC}")
                print(f"{flow_result}")

            return True
        else:
            error = result.get("error", "Unknown error")
            print_colored(f"\n{Colors.FAIL}✗ Error executing query: {error}{Colors.ENDC}", Colors.FAIL)
            return False

    except KeyboardInterrupt:
        print_colored(f"\n\n{Colors.WARNING}Query interrupted by user{Colors.ENDC}", Colors.WARNING)
        return False
    except Exception as e:
        print_colored(f"\n{Colors.FAIL}✗ Error: {str(e)}{Colors.ENDC}", Colors.FAIL)
        return False


def interactive_mode():
    """Run in interactive mode - continuous query loop"""
    load_dotenv()

    # Validate environment
    if not validate_environment():
        sys.exit(1)

    # Print banner
    print_banner()

    # Initialize router
    try:
        router = FlowRouter()
        print_colored(f"{Colors.OKGREEN}✓ Router initialized successfully{Colors.ENDC}\n", Colors.OKGREEN)
    except Exception as e:
        print_colored(f"{Colors.FAIL}Error initializing router: {e}{Colors.ENDC}", Colors.FAIL)
        sys.exit(1)

    # Main interaction loop
    while True:
        try:
            # Get user input
            query = input(f"{Colors.BOLD}{Colors.OKBLUE}> {Colors.ENDC}").strip()

            # Handle empty input
            if not query:
                continue

            # Handle commands
            if query.lower() in ["exit", "quit"]:
                print_colored(f"\n{Colors.OKCYAN}Goodbye!{Colors.ENDC}", Colors.OKCYAN)
                break
            elif query.lower() == "help":
                print_help()
                continue
            elif query.lower() == "examples":
                print_examples()
                continue
            elif query.lower() == "flows":
                print_flows(router)
                continue

            # Execute query
            execute_query(router, query)

            print()  # Blank line for readability

        except KeyboardInterrupt:
            print_colored(f"\n\n{Colors.OKCYAN}Goodbye!{Colors.ENDC}", Colors.OKCYAN)
            break
        except Exception as e:
            print_colored(f"\n{Colors.FAIL}Error: {str(e)}{Colors.ENDC}", Colors.FAIL)
            continue


def single_query_mode(query: str):
    """
    Run in single query mode - execute one query and exit

    Args:
        query: Natural language query to execute
    """
    load_dotenv()

    # Validate environment
    if not validate_environment():
        sys.exit(1)

    # Initialize router
    try:
        router = FlowRouter()
    except Exception as e:
        print_colored(f"{Colors.FAIL}Error initializing router: {e}{Colors.ENDC}", Colors.FAIL)
        sys.exit(1)

    # Execute query
    success = execute_query(router, query)

    sys.exit(0 if success else 1)


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="CrewAI Flows - Natural Language Campaign Management CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Interactive mode
  python main.py

  # Single query mode
  python main.py -q "Create 10 campaigns for Black Friday"
  python main.py --query "Pause underperforming campaigns"

  # Show help
  python main.py --help
        """
    )

    parser.add_argument(
        "-q", "--query",
        type=str,
        help="Execute a single query and exit",
        metavar="QUERY"
    )

    parser.add_argument(
        "--examples",
        action="store_true",
        help="Show example queries and exit"
    )

    parser.add_argument(
        "--flows",
        action="store_true",
        help="List available flows and exit"
    )

    args = parser.parse_args()

    # Handle --examples flag
    if args.examples:
        print_examples()
        sys.exit(0)

    # Handle --flows flag
    if args.flows:
        load_dotenv()
        if validate_environment():
            try:
                router = FlowRouter()
                print_flows(router)
            except Exception as e:
                print_colored(f"{Colors.FAIL}Error: {e}{Colors.ENDC}", Colors.FAIL)
                sys.exit(1)
        sys.exit(0)

    # Handle single query mode
    if args.query:
        single_query_mode(args.query)
    else:
        # Interactive mode
        interactive_mode()


if __name__ == "__main__":
    main()
