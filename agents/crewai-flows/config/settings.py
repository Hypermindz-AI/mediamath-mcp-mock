"""
Configuration management for CrewAI Flows project.
Handles environment variables and application settings.
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings:
    """Application settings loaded from environment variables."""

    # MCP Server Configuration
    MCP_SERVER_URL = os.getenv(
        "MCP_SERVER_URL",
        "https://mediamath-mcp-mock-two.vercel.app/api/message"
    )
    MCP_API_KEY = os.getenv(
        "MCP_API_KEY",
        "mcp_mock_2025_hypermindz_44b87c1d20ed"
    )

    # OpenAI Configuration
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    if not OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY environment variable is required")

    OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4-turbo")

    # CrewAI Configuration
    CREW_VERBOSE = int(os.getenv("CREW_VERBOSE", "2"))
    CREW_MEMORY = os.getenv("CREW_MEMORY", "true").lower() == "true"
    CREW_MAX_RPM = int(os.getenv("CREW_MAX_RPM", "10"))

    # Default Organization
    DEFAULT_ORGANIZATION_ID = int(os.getenv("DEFAULT_ORGANIZATION_ID", "100048"))

    # Flow Configuration
    FLOW_TIMEOUT = int(os.getenv("FLOW_TIMEOUT", "300"))  # 5 minutes default
    FLOW_RETRY_COUNT = int(os.getenv("FLOW_RETRY_COUNT", "3"))

    @classmethod
    def validate(cls):
        """Validate that all required settings are configured."""
        if not cls.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is required")
        if not cls.MCP_SERVER_URL:
            raise ValueError("MCP_SERVER_URL is required")
        if not cls.MCP_API_KEY:
            raise ValueError("MCP_API_KEY is required")

        print("✓ Configuration validated successfully")
        return True


# Create a singleton instance
settings = Settings()

# Validate on import
try:
    settings.validate()
except ValueError as e:
    print(f"⚠️  Configuration warning: {e}")
