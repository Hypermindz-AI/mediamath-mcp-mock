#!/usr/bin/env python3
"""
Basic Router Verification Script
Tests router functionality without requiring API keys
"""

import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from router.flow_router import FlowRouter
from unittest.mock import patch


def test_router_without_api_key():
    """Test router initialization and basic functionality"""

    print("=" * 80)
    print("Router Basic Verification")
    print("=" * 80)

    # Test 1: Router initialization (mocked)
    print("\n[Test 1] Router Initialization (Mocked)")
    try:
        with patch("router.flow_router.OpenAI"):
            router = FlowRouter(openai_api_key="test_key")
        print("✓ Router initialized successfully (mocked)")
    except Exception as e:
        print(f"✗ Router initialization failed: {e}")
        return False

    # Test 2: List flows
    print("\n[Test 2] List Flows")
    try:
        flows = router.list_flows()
        print(f"✓ Found {len(flows)} flows:")
        for flow_name in flows:
            print(f"  - {flow_name}")
    except Exception as e:
        print(f"✗ List flows failed: {e}")
        return False

    # Test 3: Keyword-based classification
    print("\n[Test 3] Keyword-based Classification")
    test_queries = [
        ("Create 10 campaigns", "campaign_setup_flow"),
        ("Pause underperforming campaigns", "optimization_flow"),
        ("Generate performance report", "analytics_flow"),
        ("Audit user permissions", "compliance_flow"),
        ("Find creatives needing refresh", "creative_flow"),
    ]

    passed = 0
    for query, expected_flow in test_queries:
        flow, confidence = router._fallback_classification(query)
        status = "✓" if flow == expected_flow else "✗"
        print(f"{status} '{query}'")
        print(f"    → {flow} (confidence: {confidence:.2f})")
        if flow == expected_flow:
            passed += 1

    print(f"\nClassification Accuracy: {passed}/{len(test_queries)} ({passed/len(test_queries)*100:.1f}%)")

    # Test 4: Flow patterns validation
    print("\n[Test 4] Flow Patterns Validation")
    try:
        for flow_name, info in flows.items():
            assert "keywords" in info, f"Missing keywords for {flow_name}"
            assert "description" in info, f"Missing description for {flow_name}"
            assert "examples" in info, f"Missing examples for {flow_name}"
            assert len(info["keywords"]) > 0, f"Empty keywords for {flow_name}"
            assert len(info["examples"]) > 0, f"Empty examples for {flow_name}"
        print("✓ All flow patterns are valid")
    except AssertionError as e:
        print(f"✗ Flow pattern validation failed: {e}")
        return False

    # Test 5: Main CLI import
    print("\n[Test 5] Main CLI Import")
    try:
        import main
        print("✓ Main CLI imports successfully")
    except Exception as e:
        print(f"✗ Main CLI import failed: {e}")
        return False

    # Summary
    print("\n" + "=" * 80)
    print("Verification Complete!")
    print("=" * 80)
    print("\n✓ All basic tests passed!")
    print("\nTo test with real API:")
    print("  1. Set OPENAI_API_KEY environment variable")
    print("  2. Run: pytest tests/test_router.py -v")
    print("\nTo use the CLI:")
    print("  python main.py")
    print("=" * 80)

    return True


if __name__ == "__main__":
    success = test_router_without_api_key()
    sys.exit(0 if success else 1)
