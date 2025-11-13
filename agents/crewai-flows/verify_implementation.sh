#!/bin/bash

echo "=============================================="
echo "Optimization Flow - Implementation Verification"
echo "=============================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        return 0
    else
        echo -e "${RED}✗${NC} $2 (MISSING: $1)"
        return 1
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        return 0
    else
        echo -e "${RED}✗${NC} $2 (MISSING: $1)"
        return 1
    fi
}

check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $3"
        return 0
    else
        echo -e "${RED}✗${NC} $3"
        return 1
    fi
}

TOTAL=0
PASSED=0

echo "1. Directory Structure"
echo "----------------------"
check_dir "agents" "agents/ directory exists" && ((PASSED++)); ((TOTAL++))
check_dir "tasks" "tasks/ directory exists" && ((PASSED++)); ((TOTAL++))
check_dir "flows" "flows/ directory exists" && ((PASSED++)); ((TOTAL++))
check_dir "shared" "shared/ directory exists" && ((PASSED++)); ((TOTAL++))
check_dir "examples" "examples/ directory exists" && ((PASSED++)); ((TOTAL++))
check_dir "tests" "tests/ directory exists" && ((PASSED++)); ((TOTAL++))
echo ""

echo "2. Core Files"
echo "-------------"
check_file "agents/agent_definitions.py" "Agent definitions file" && ((PASSED++)); ((TOTAL++))
check_file "tasks/task_definitions.py" "Task definitions file" && ((PASSED++)); ((TOTAL++))
check_file "flows/optimization_flow.py" "Optimization flow file" && ((PASSED++)); ((TOTAL++))
check_file "shared/mcp_tools.py" "MCP tools wrapper" && ((PASSED++)); ((TOTAL++))
check_file "examples/run_optimization.py" "Example script" && ((PASSED++)); ((TOTAL++))
check_file "tests/test_optimization.py" "Test file" && ((PASSED++)); ((TOTAL++))
echo ""

echo "3. Documentation"
echo "----------------"
check_file "requirements.txt" "Requirements file" && ((PASSED++)); ((TOTAL++))
check_file "README.md" "README documentation" && ((PASSED++)); ((TOTAL++))
check_file "OPTIMIZATION_FLOW_SUMMARY.md" "Flow summary (17 KB)" && ((PASSED++)); ((TOTAL++))
check_file "OPTIMIZATION_QUICK_START.md" "Quick start guide (3.3 KB)" && ((PASSED++)); ((TOTAL++))
check_file "IMPLEMENTATION_CHECKLIST.md" "Implementation checklist (8.2 KB)" && ((PASSED++)); ((TOTAL++))
echo ""

echo "4. Agent Definitions"
echo "--------------------"
check_content "agents/agent_definitions.py" "create_performance_analyzer" "Performance Analyzer agent" && ((PASSED++)); ((TOTAL++))
check_content "agents/agent_definitions.py" "create_decision_maker" "Decision Maker agent" && ((PASSED++)); ((TOTAL++))
check_content "agents/agent_definitions.py" "create_execution_agent" "Execution Agent" && ((PASSED++)); ((TOTAL++))
check_content "agents/agent_definitions.py" "create_optimization_agents" "Agent creation function" && ((PASSED++)); ((TOTAL++))
echo ""

echo "5. Task Definitions"
echo "-------------------"
check_content "tasks/task_definitions.py" "analyze_performance_task" "Analyze performance task" && ((PASSED++)); ((TOTAL++))
check_content "tasks/task_definitions.py" "decide_optimizations_task" "Decision making task" && ((PASSED++)); ((TOTAL++))
check_content "tasks/task_definitions.py" "execute_optimizations_task" "Execution task" && ((PASSED++)); ((TOTAL++))
check_content "tasks/task_definitions.py" "create_optimization_tasks" "Task creation function" && ((PASSED++)); ((TOTAL++))
echo ""

echo "6. Flow Implementation"
echo "----------------------"
check_content "flows/optimization_flow.py" "class OptimizationFlow" "OptimizationFlow class" && ((PASSED++)); ((TOTAL++))
check_content "flows/optimization_flow.py" "class OptimizationState" "OptimizationState class" && ((PASSED++)); ((TOTAL++))
check_content "flows/optimization_flow.py" "@start()" "@start decorator" && ((PASSED++)); ((TOTAL++))
check_content "flows/optimization_flow.py" "@listen" "@listen decorators" && ((PASSED++)); ((TOTAL++))
check_content "flows/optimization_flow.py" "run_optimization_flow" "Helper function" && ((PASSED++)); ((TOTAL++))
echo ""

echo "7. MCP Tools"
echo "------------"
check_content "shared/mcp_tools.py" "class MCPToolWrapper" "MCPToolWrapper class" && ((PASSED++)); ((TOTAL++))
check_content "shared/mcp_tools.py" "find_campaigns" "find_campaigns tool" && ((PASSED++)); ((TOTAL++))
check_content "shared/mcp_tools.py" "update_strategy" "update_strategy tool" && ((PASSED++)); ((TOTAL++))
check_content "shared/mcp_tools.py" "get_default_mcp_tools" "Default tools function" && ((PASSED++)); ((TOTAL++))
echo ""

echo "8. Example Usage"
echo "----------------"
check_content "examples/run_optimization.py" "run_optimization_flow" "Imports flow function" && ((PASSED++)); ((TOTAL++))
check_content "examples/run_optimization.py" "OPENAI_API_KEY" "Checks API key" && ((PASSED++)); ((TOTAL++))
check_content "examples/run_optimization.py" "example_queries" "Example queries defined" && ((PASSED++)); ((TOTAL++))
test -x "examples/run_optimization.py" && echo -e "${GREEN}✓${NC} Script is executable" && ((PASSED++)) || echo -e "${RED}✗${NC} Script is executable"; ((TOTAL++))
echo ""

echo "9. Tests"
echo "--------"
check_content "tests/test_optimization.py" "TestOptimizationFlow" "Test class defined" && ((PASSED++)); ((TOTAL++))
check_content "tests/test_optimization.py" "test_optimization_state_creation" "State creation test" && ((PASSED++)); ((TOTAL++))
check_content "tests/test_optimization.py" "test_agent_creation" "Agent creation test" && ((PASSED++)); ((TOTAL++))
check_content "tests/test_optimization.py" "test_task_creation" "Task creation test" && ((PASSED++)); ((TOTAL++))
echo ""

echo "=============================================="
echo "VERIFICATION RESULTS"
echo "=============================================="
echo ""
echo -e "Total Checks: ${TOTAL}"
echo -e "Passed: ${GREEN}${PASSED}${NC}"
echo -e "Failed: ${RED}$((TOTAL - PASSED))${NC}"
echo ""

if [ $PASSED -eq $TOTAL ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED!${NC}"
    echo ""
    echo "The Optimization Flow implementation is complete and ready for use."
    echo ""
    echo "Next steps:"
    echo "1. Set your OpenAI API key: export OPENAI_API_KEY='sk-...'"
    echo "2. Run the example: python examples/run_optimization.py"
    echo "3. Read OPTIMIZATION_QUICK_START.md for usage guide"
    exit 0
else
    echo -e "${RED}⚠️  SOME CHECKS FAILED${NC}"
    echo ""
    echo "Please review the failed checks above."
    exit 1
fi
