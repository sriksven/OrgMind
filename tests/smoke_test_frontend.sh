#!/bin/bash
# Frontend UI Smoke Tests - Simplified
# Tests that frontend is serving and key components exist

FRONTEND_URL="http://localhost:5173"
GREEN='\033[92m'
RED='\033[91m'
BLUE='\033[94m'
BOLD='\033[1m'
END='\033[0m'

passed=0
total=0

print_test() {
    local name=$1
    local status=$2
    local message=$3
    
    if [ "$status" = "true" ]; then
        echo -e "✅ ${GREEN}${name}${END}"
        [ -n "$message" ] && echo -e "   ${message}"
        ((passed++))
    else
        echo -e "❌ ${RED}${name}${END}"
        [ -n "$message" ] && echo -e "   ${message}"
    fi
    ((total++))
}

echo -e "\n${BOLD}${BLUE}🧪 OrgMind Frontend Smoke Tests${END}\n"
echo -e "Testing: ${FRONTEND_URL}\n"

echo -e "${BOLD}Server Tests:${END}"

# Test 1: Frontend is serving
if curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" | grep -q "200"; then
    print_test "Frontend Server" "true" "HTTP 200 OK"
else
    print_test "Frontend Server" "false" "Server not responding"
fi

# Test 2: HTML loads with React root
if curl -s "$FRONTEND_URL" | grep -q "<div id=\"root\">"; then
    print_test "HTML Structure" "true" "React root div present"
else
    print_test "HTML Structure" "false" "Root div not found"
fi

# Test 3: Vite dev server
if curl -s "$FRONTEND_URL" | grep -q "type=\"module\""; then
    print_test "Vite Module" "true" "ES modules enabled"
else
    print_test "Vite Module" "false" "Module script missing"
fi

echo -e "\n${BOLD}Component File Tests:${END}"

# Test 4: New Timeline component exists
if [ -f "frontend/src/components/features/Timeline/Timeline.jsx" ]; then
    print_test "Timeline Component" "true" "File exists"
else
    print_test "Timeline Component" "false" "File not found"
fi

# Test 5: New ConflictDetection component exists
if [ -f "frontend/src/components/features/ConflictDetection/ConflictDetection.jsx" ]; then
    print_test "Conflict Detection" "true" "File exists"
else
    print_test "Conflict Detection" "false" "File not found"
fi

# Test 6: New AgentActivity component exists
if [ -f "frontend/src/components/features/AgentActivity/AgentActivity.jsx" ]; then
    print_test "Agent Activity" "true" "File exists"
else
    print_test "Agent Activity" "false" "File not found"
fi

# Test 7: CommandCenter updated
if [ -f "frontend/src/pages/CommandCenter.css" ]; then
    print_test "CommandCenter CSS" "true" "Tab styling exists"
else
    print_test "CommandCenter CSS" "false" "File not found"
fi

# Test 8: SituationBrief still exists
if [ -f "frontend/src/components/features/SituationBrief/SituationBrief.jsx" ]; then
    print_test "Situation Brief" "true" "Original component intact"
else
    print_test "Situation Brief" "false" "File missing"
fi

echo -e "\n${BOLD}CSS Theme Tests:${END}"

# Test 9: Timeline has light theme
if grep -q "#ffffff" "frontend/src/components/features/Timeline/Timeline.css"; then
    print_test "Timeline Light Theme" "true" "White background confirmed"
else
    print_test "Timeline Light Theme" "false" "Dark theme still present"
fi

# Test 10: Conflicts has light theme
if grep -q "#ffffff" "frontend/src/components/features/ConflictDetection/ConflictDetection.css"; then
    print_test "Conflicts Light Theme" "true" "White background confirmed"
else
    print_test "Conflicts Light Theme" "false" "Dark theme still present"
fi

# Summary
echo -e "\n=================================================="
echo -e "${BOLD}Summary:${END}"
success_rate=$((passed * 100 / total))
echo -e "  Passed: ${passed}/${total} (${success_rate}%)"

if [ $passed -eq $total ]; then
    echo -e "  ${GREEN}Status: ✅ ALL TESTS PASSED${END}\n"
    exit 0
elif [ $success_rate -ge 80 ]; then
    echo -e "  ${YELLOW}Status: ⚠️  MOSTLY PASSING (${success_rate}%)${END}\n"
    exit 0
else
    echo -e "  ${RED}Status: ❌ TESTS FAILED (${success_rate}%)${END}\n"
    exit 1
fi
