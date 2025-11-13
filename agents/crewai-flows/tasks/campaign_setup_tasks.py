"""
Task Definitions for Campaign Setup Flow
Defines the 3 sequential tasks for natural language campaign creation
"""

from crewai import Task
from typing import List


def create_parse_and_plan_task(agent, natural_language_query: str) -> Task:
    """
    Task 1: Parse natural language query and create campaign strategy

    Args:
        agent: Campaign Strategist agent
        natural_language_query: User's NL request

    Returns:
        Task instance
    """
    return Task(
        description=f"""
        Parse this natural language campaign request and create a detailed strategy:

        REQUEST: "{natural_language_query}"

        Your job is to:
        1. Extract key parameters from the request:
           - Number of campaigns to create
           - Budget per campaign (or total budget to split)
           - Campaign naming pattern/theme
           - Any dates, targeting, or objectives mentioned

        2. Create a structured campaign plan with:
           - List of campaign names (generate if not specified)
           - Budget allocation for each campaign
           - Default organization ID: 100048
           - Any additional configuration details

        3. Handle budget calculations:
           - If "budget each" is specified, use that per campaign
           - If "total budget" is specified, divide by number of campaigns
           - Default to $5000 per campaign if not specified

        4. Generate meaningful campaign names if not provided:
           - Use theme/purpose from request
           - Add sequential numbers or identifiers
           - Example: "Holiday Sale Campaign 1", "Holiday Sale Campaign 2"

        Output a clear, structured strategy document with all parameters.
        """,
        agent=agent,
        expected_output="""
        A structured campaign strategy in JSON format:
        {
            "campaign_count": <number>,
            "campaign_names": ["name1", "name2", ...],
            "budget_per_campaign": <amount>,
            "total_budget": <amount>,
            "organization_id": 100048,
            "theme": "<campaign theme>",
            "notes": "<any special considerations>"
        }
        """
    )


def create_build_campaigns_task(agent, context_tasks: List[Task]) -> Task:
    """
    Task 2: Execute campaign creation using MCP tools

    Args:
        agent: Campaign Builder agent
        context_tasks: Previous tasks to use as context (strategy task)

    Returns:
        Task instance
    """
    return Task(
        description="""
        Execute the campaign creation based on the approved strategy from the previous task.

        Steps:
        1. Review the strategy document from the Campaign Strategist
        2. For EACH campaign in the plan:
           a. Call create_campaign tool with:
              - Input: {"name": "<campaign_name>", "organization_id": 100048, "budget": <amount>}
           b. Record the campaign_id returned
           c. Verify creation was successful

        3. Create a basic strategy for each campaign:
           a. Call create_strategy tool with:
              - Input: {"campaign_id": <id>, "name": "<campaign_name> - Default Strategy", "budget": <amount>}
           b. Record the strategy_id returned

        4. Track all results:
           - List of created campaign IDs
           - List of created strategy IDs
           - Any errors encountered
           - Success/failure status for each

        IMPORTANT:
        - Create campaigns ONE AT A TIME (sequential, not parallel)
        - Wait for each campaign creation to complete before starting next
        - If any creation fails, note the error but continue with remaining campaigns
        - Use the EXACT names from the strategy
        - Use the EXACT budget from the strategy
        - Always provide JSON format for tool inputs

        Return comprehensive implementation report with all IDs and statuses.
        """,
        agent=agent,
        expected_output="""
        Implementation Report in JSON format:
        {
            "created_campaigns": [
                {"campaign_id": <id>, "name": "<name>", "budget": <amount>, "status": "success"},
                ...
            ],
            "created_strategies": [
                {"strategy_id": <id>, "campaign_id": <id>, "name": "<name>", "status": "success"},
                ...
            ],
            "summary": {
                "total_attempted": <number>,
                "successful": <number>,
                "failed": <number>
            },
            "errors": [<any error messages>]
        }
        """,
        context=context_tasks
    )


def create_verify_campaigns_task(agent, context_tasks: List[Task]) -> Task:
    """
    Task 3: QA verification of created campaigns

    Args:
        agent: QA Specialist agent
        context_tasks: Previous tasks to use as context (building task)

    Returns:
        Task instance
    """
    return Task(
        description="""
        Perform quality assurance checks on all created campaigns.

        QA Checklist:
        1. Review the Implementation Report from the Campaign Builder
        2. For EACH created campaign:
           a. Call get_campaign_info with: {"campaign_id": <id>}
           b. Verify:
              - Campaign exists and is accessible
              - Budget matches the planned budget
              - Name matches the strategy
              - Status is appropriate (usually 'active')
              - No configuration errors

        3. Compare actual vs. planned:
           - Number of campaigns created vs. requested
           - Budget allocations match strategy
           - All campaigns have required properties

        4. Identify any issues:
           - Campaigns that failed to create
           - Budget mismatches
           - Configuration errors
           - Missing or incorrect data

        5. Determine overall status:
           - PASS: All campaigns created and configured correctly
           - PASS_WITH_WARNINGS: Minor issues but campaigns are functional
           - FAIL: Critical errors or missing campaigns

        6. Create detailed QA report with:
           - Overall PASS/FAIL status
           - Per-campaign validation results
           - List of any issues found
           - Recommendations for fixes (if needed)
           - Launch readiness assessment

        Be thorough but practical. Minor variations are acceptable.
        Critical errors (failed creations, wrong budgets) should fail QA.
        """,
        agent=agent,
        expected_output="""
        QA Report in JSON format:
        {
            "overall_status": "PASS|PASS_WITH_WARNINGS|FAIL",
            "launch_ready": true|false,
            "campaigns_validated": <number>,
            "validation_results": [
                {
                    "campaign_id": <id>,
                    "name": "<name>",
                    "status": "PASS|FAIL",
                    "checks": {
                        "exists": true|false,
                        "budget_correct": true|false,
                        "name_correct": true|false,
                        "configuration_valid": true|false
                    },
                    "issues": [<any issues found>]
                },
                ...
            ],
            "summary": {
                "total_requested": <number>,
                "successfully_created": <number>,
                "passed_qa": <number>,
                "failed_qa": <number>
            },
            "recommendations": [<any recommendations>]
        }
        """,
        context=context_tasks
    )
