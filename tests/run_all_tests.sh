#!/bin/bash
# Master Test Runner
# Runs all smoke tests before pushing to GitHub

GREEN='\033[92m'
RED='\033[91m'
BLUE='\033[94m'
BOLD='\033[1m'
END='\033[0m'

echo -e "\n${BOLD}${BLUE}╔════════════════════════════════════════════════╗${END}"
echo -e "${BOLD}${BLUE}║   OrgMind Pre-Push Smoke Test Suite           ║${END}"
echo -e "${BOLD}${BLUE}╚════════════════════════════════════════════════╝${END}\n"

# Check if servers are running
echo -e "${BOLD}Checking Prerequisites...${END}\n"

if ! curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${RED}❌ Backend not running on port 8000${END}"
    echo -e "   Run: make dev (or cd backend && uvicorn main:app --reload)"
    exit 1
else
    echo -e "${GREEN}✅ Backend running${END}"
fi

if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${RED}❌ Frontend not running on port 5173${END}"
    echo -e "   Run: make dev (or cd frontend && npm run dev)"
    exit 1
else
    echo -e "${GREEN}✅ Frontend running${END}"
fi

echo ""

# Run backend tests
echo -e "${BOLD}${BLUE}═══════════════════════════════════════════════${END}"
echo -e "${BOLD}Backend Tests${END}"
echo -e "${BOLD}${BLUE}═══════════════════════════════════════════════${END}\n"

python3 tests/smoke_test_backend.py
backend_result=$?

echo ""

# Run frontend tests
echo -e "${BOLD}${BLUE}═══════════════════════════════════════════════${END}"
echo -e "${BOLD}Frontend Tests${END}"
echo -e "${BOLD}${BLUE}═══════════════════════════════════════════════${END}\n"

./tests/smoke_test_frontend.sh
frontend_result=$?

echo ""

# Final summary
echo -e "${BOLD}${BLUE}╔════════════════════════════════════════════════╗${END}"
echo -e "${BOLD}${BLUE}║   Final Test Summary                           ║${END}"
echo -e "${BOLD}${BLUE}╚════════════════════════════════════════════════╝${END}\n"

if [ $backend_result -eq 0 ] && [ $frontend_result -eq 0 ]; then
    echo -e "${GREEN}${BOLD}✅ ALL TESTS PASSED${END}"
    echo -e "${GREEN}System is ready for production deployment!${END}\n"
    
    echo -e "${BOLD}Next steps:${END}"
    echo -e "  1. Review changes: git status"
    echo -e "  2. Push to GitHub: git push origin main"
    echo -e "  3. Deploy to production"
    echo ""
    exit 0
else
    echo -e "${RED}${BOLD}❌ SOME TESTS FAILED${END}"
    echo -e "${RED}Please fix failing tests before pushing${END}\n"
    
    if [ $backend_result -ne 0 ]; then
        echo -e "  Backend: ${RED}FAILED${END}"
    else
        echo -e "  Backend: ${GREEN}PASSED${END}"
    fi
    
    if [ $frontend_result -ne 0 ]; then
        echo -e "  Frontend: ${RED}FAILED${END}"
    else
        echo -e "  Frontend: ${GREEN}PASSED${END}"
    fi
    echo ""
    exit 1
fi
