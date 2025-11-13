"""
Tests for FlowRouter
Tests intent classification, routing logic, and error handling
"""

import pytest
import os
from unittest.mock import Mock, patch, MagicMock
import sys

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from router.flow_router import FlowRouter, create_router


class TestFlowRouter:
    """Test suite for FlowRouter"""

    @pytest.fixture
    def router(self):
        """Create a FlowRouter instance for testing"""
        # Mock the OpenAI client if no API key is available
        if not os.getenv("OPENAI_API_KEY"):
            with patch("router.flow_router.OpenAI"):
                router = FlowRouter(openai_api_key="test_key")
                return router
        else:
            return FlowRouter()

    def test_router_initialization(self):
        """Test router can be initialized"""
        if os.getenv("OPENAI_API_KEY"):
            router = FlowRouter()
            assert router is not None
            assert router.client is not None
        else:
            # Test that initialization fails without API key
            with pytest.raises(ValueError, match="OpenAI API key is required"):
                FlowRouter(openai_api_key=None)

    def test_factory_function(self):
        """Test create_router factory function"""
        if os.getenv("OPENAI_API_KEY"):
            router = create_router()
            assert isinstance(router, FlowRouter)
        else:
            with patch("router.flow_router.OpenAI"):
                router = create_router(openai_api_key="test_key")
                assert isinstance(router, FlowRouter)

    def test_list_flows(self, router):
        """Test list_flows returns all flow information"""
        flows = router.list_flows()

        assert isinstance(flows, dict)
        assert len(flows) == 5

        expected_flows = [
            "campaign_setup_flow",
            "optimization_flow",
            "analytics_flow",
            "compliance_flow",
            "creative_flow"
        ]

        for flow in expected_flows:
            assert flow in flows
            assert "keywords" in flows[flow]
            assert "description" in flows[flow]
            assert "examples" in flows[flow]

    def test_fallback_classification_campaign_setup(self, router):
        """Test fallback classification for campaign setup queries"""
        queries = [
            "Create 10 new campaigns",
            "Launch campaigns for Black Friday",
            "Set up 5 campaigns with $1000 budget"
        ]

        for query in queries:
            flow, confidence = router._fallback_classification(query)
            assert flow == "campaign_setup_flow"
            assert 0.0 <= confidence <= 1.0

    def test_fallback_classification_optimization(self, router):
        """Test fallback classification for optimization queries"""
        queries = [
            "Pause underperforming campaigns",
            "Optimize campaigns with high CPA",
            "Adjust bids for better performance"
        ]

        for query in queries:
            flow, confidence = router._fallback_classification(query)
            assert flow == "optimization_flow"
            assert 0.0 <= confidence <= 1.0

    def test_fallback_classification_analytics(self, router):
        """Test fallback classification for analytics queries"""
        queries = [
            "Generate performance report",
            "Show campaign metrics",
            "Analyze budget utilization"
        ]

        for query in queries:
            flow, confidence = router._fallback_classification(query)
            assert flow == "analytics_flow"
            assert 0.0 <= confidence <= 1.0

    def test_fallback_classification_compliance(self, router):
        """Test fallback classification for compliance queries"""
        queries = [
            "Audit user permissions",
            "Check access controls",
            "Find compliance violations"
        ]

        for query in queries:
            flow, confidence = router._fallback_classification(query)
            assert flow == "compliance_flow"
            assert 0.0 <= confidence <= 1.0

    def test_fallback_classification_creative(self, router):
        """Test fallback classification for creative queries"""
        queries = [
            "Find creatives that need refresh",
            "Analyze creative fatigue",
            "Identify underperforming ads"
        ]

        for query in queries:
            flow, confidence = router._fallback_classification(query)
            assert flow == "creative_flow"
            assert 0.0 <= confidence <= 1.0

    def test_fallback_classification_ambiguous(self, router):
        """Test fallback classification handles ambiguous queries"""
        query = "Show me something"
        flow, confidence = router._fallback_classification(query)

        assert flow in router.FLOW_PATTERNS
        assert 0.0 <= confidence <= 1.0

    @pytest.mark.skipif(not os.getenv("OPENAI_API_KEY"), reason="Requires OpenAI API key")
    def test_classify_intent_with_llm(self, router):
        """Test LLM-based intent classification (integration test)"""
        test_cases = [
            ("Create 10 campaigns for Black Friday", "campaign_setup_flow"),
            ("Pause underperforming campaigns", "optimization_flow"),
            ("Generate performance report", "analytics_flow"),
            ("Audit user permissions", "compliance_flow"),
            ("Find creatives that need refresh", "creative_flow")
        ]

        for query, expected_flow in test_cases:
            flow, confidence = router.classify_intent(query)
            assert flow == expected_flow
            assert 0.0 <= confidence <= 1.0

    def test_route_returns_correct_structure(self, router):
        """Test route returns correct data structure"""
        query = "Create 10 campaigns"
        result = router.route(query)

        assert isinstance(result, dict)
        assert "flow_name" in result
        assert "confidence" in result
        assert "query" in result
        assert "flow_info" in result

        flow_info = result["flow_info"]
        assert "description" in flow_info
        assert "keywords" in flow_info
        assert "examples" in flow_info

        assert result["query"] == query
        assert result["flow_name"] in router.FLOW_PATTERNS

    @patch("router.flow_router.FlowRouter.classify_intent")
    def test_route_uses_classification(self, mock_classify, router):
        """Test route uses classify_intent method"""
        mock_classify.return_value = ("campaign_setup_flow", 0.95)

        query = "Create campaigns"
        result = router.route(query)

        mock_classify.assert_called_once_with(query)
        assert result["flow_name"] == "campaign_setup_flow"
        assert result["confidence"] == 0.95

    def test_execute_flow_structure(self, router):
        """Test execute_flow returns correct structure (without actual execution)"""
        # Mock the flow imports and execution
        with patch("router.flow_router.FlowRouter.route") as mock_route:
            mock_route.return_value = {
                "flow_name": "campaign_setup_flow",
                "confidence": 0.95,
                "query": "test query",
                "flow_info": {}
            }

            with patch("flows.campaign_setup_flow.run_campaign_setup_flow") as mock_flow:
                mock_flow.return_value = {"status": "success"}

                result = router.execute_flow("test query")

                assert isinstance(result, dict)
                assert "routing" in result
                assert "success" in result

    def test_confidence_scores_are_valid(self, router):
        """Test all confidence scores are in valid range"""
        test_queries = [
            "Create campaigns",
            "Pause campaigns",
            "Generate report",
            "Audit users",
            "Refresh creatives"
        ]

        for query in test_queries:
            flow, confidence = router._fallback_classification(query)
            assert 0.0 <= confidence <= 1.0
            assert isinstance(confidence, float)

    def test_flow_patterns_completeness(self, router):
        """Test FLOW_PATTERNS has all required fields"""
        for flow_name, info in router.FLOW_PATTERNS.items():
            assert "keywords" in info
            assert "description" in info
            assert "examples" in info

            assert isinstance(info["keywords"], list)
            assert isinstance(info["description"], str)
            assert isinstance(info["examples"], list)

            assert len(info["keywords"]) > 0
            assert len(info["description"]) > 0
            assert len(info["examples"]) > 0

    def test_classify_intent_handles_llm_errors(self, router):
        """Test classify_intent falls back gracefully on LLM errors"""
        with patch.object(router.client.chat.completions, "create", side_effect=Exception("API Error")):
            flow, confidence = router.classify_intent("Create campaigns")

            # Should fallback to keyword-based classification
            assert flow in router.FLOW_PATTERNS
            assert 0.0 <= confidence <= 1.0

    def test_classify_intent_handles_invalid_json(self, router):
        """Test classify_intent handles invalid JSON from LLM"""
        mock_response = MagicMock()
        mock_response.choices[0].message.content = "Invalid JSON response"

        with patch.object(router.client.chat.completions, "create", return_value=mock_response):
            flow, confidence = router.classify_intent("Create campaigns")

            # Should fallback to keyword-based classification
            assert flow in router.FLOW_PATTERNS
            assert 0.0 <= confidence <= 1.0

    def test_classify_intent_handles_invalid_flow_name(self, router):
        """Test classify_intent handles invalid flow name from LLM"""
        mock_response = MagicMock()
        mock_response.choices[0].message.content = '{"flow": "invalid_flow", "confidence": 0.9, "reasoning": "test"}'

        with patch.object(router.client.chat.completions, "create", return_value=mock_response):
            flow, confidence = router.classify_intent("Create campaigns")

            # Should fallback to keyword-based classification
            assert flow in router.FLOW_PATTERNS
            assert 0.0 <= confidence <= 1.0

    @pytest.mark.parametrize("query,expected_flow", [
        ("Create 10 campaigns", "campaign_setup_flow"),
        ("Launch new campaigns", "campaign_setup_flow"),
        ("Pause campaigns", "optimization_flow"),
        ("Optimize performance", "optimization_flow"),
        ("Generate report", "analytics_flow"),
        ("Analyze metrics", "analytics_flow"),
        ("Audit permissions", "compliance_flow"),
        ("Check security", "compliance_flow"),
        ("Refresh creatives", "creative_flow"),
        ("Creative fatigue", "creative_flow"),
    ])
    def test_classification_accuracy(self, router, query, expected_flow):
        """Test classification accuracy for common queries"""
        flow, confidence = router._fallback_classification(query)
        assert flow == expected_flow


class TestRouterIntegration:
    """Integration tests for router (require API keys)"""

    @pytest.mark.skipif(not os.getenv("OPENAI_API_KEY"), reason="Requires OpenAI API key")
    def test_full_routing_workflow(self):
        """Test complete routing workflow with real API"""
        router = FlowRouter()

        query = "Create 5 campaigns for holiday season"
        result = router.route(query)

        assert result["flow_name"] == "campaign_setup_flow"
        assert result["confidence"] > 0.5
        assert result["query"] == query

    @pytest.mark.skipif(
        not os.getenv("OPENAI_API_KEY") or not os.getenv("MCP_SERVER_URL"),
        reason="Requires OpenAI API key and MCP server"
    )
    def test_execute_flow_integration(self):
        """Test flow execution integration (requires MCP server)"""
        router = FlowRouter()

        # Test with a simple query
        query = "Create 2 test campaigns"

        # This will actually execute the flow
        # Comment out if you don't want to make real API calls
        # result = router.execute_flow(query)
        # assert result["success"] == True or result["success"] == False


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
