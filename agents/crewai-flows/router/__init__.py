"""
Router package for intelligent flow routing
Automatically routes natural language queries to appropriate flows
"""

from .flow_router import FlowRouter, create_router

__all__ = ['FlowRouter', 'create_router']
