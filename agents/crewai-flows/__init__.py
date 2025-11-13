"""
CrewAI Optimization Flow Package

This package implements a CrewAI Flow for campaign optimization using
natural language queries and the MediaMath MCP server.

Example:
    >>> from crewai_flows import run_optimization_flow
    >>> result = run_optimization_flow("Pause underperforming strategies")
"""

from .flows.optimization_flow import (
    OptimizationFlow,
    OptimizationState,
    run_optimization_flow
)

from .agents.agent_definitions import create_optimization_agents
from .tasks.task_definitions import create_optimization_tasks
from .shared.mcp_tools import get_default_mcp_tools, create_mcp_tools

__version__ = "1.0.0"

__all__ = [
    'OptimizationFlow',
    'OptimizationState',
    'run_optimization_flow',
    'create_optimization_agents',
    'create_optimization_tasks',
    'get_default_mcp_tools',
    'create_mcp_tools',
]
