# OrgMind Test Suite

Comprehensive smoke tests for validating OrgMind before deployment.

## 📋 Overview

This test suite ensures both backend and frontend are functioning correctly before pushing to GitHub or deploying to production.

## 🧪 Test Files

### `smoke_test_backend.py`
Python-based tests for backend API:
- **Health endpoint**: Server status, graph loaded, agents initialized
- **Agent status**: All 4 agents (Intelligence, Critic, Memory, Router) registered
- **Graph export**: Node and edge data integrity
- **Intelligence queries**: Response quality for blockers, changes, and risks
- **Visual reasoning**: Graph visualization data generation

**Requirements**: 
- Backend running on `http://localhost:8000`
- Python 3.7+
- `requests` library

### `smoke_test_frontend.sh`
Bash-based tests for frontend:
- **Server health**: Frontend serving on port 5173
- **HTML structure**: React root div and Vite modules
- **Component files**: Timeline, ConflictDetection, AgentActivity components
- **Theme validation**: Light theme CSS in new components
- **Original components**: Ensures existing features still work

**Requirements**:
- Frontend running on `http://localhost:5173`
- `curl` command available

### `run_all_tests.sh`
Master test runner that:
1. Checks prerequisites (backend and frontend servers)
2. Runs backend tests
3. Runs frontend tests
4. Provides comprehensive summary
5. Exit code 0 if all pass, 1 if any fail

## 🚀 Usage

### Run All Tests (Recommended)
```bash
./tests/run_all_tests.sh
```

### Run Individual Test Suites
```bash
# Backend only
python3 tests/smoke_test_backend.py

# Frontend only
./tests/smoke_test_frontend.sh
```

## ✅ Pre-Push Workflow

Before pushing to GitHub:

```bash
# 1. Ensure both servers are running
make dev  # or start backend and frontend manually

# 2. Run all tests
./tests/run_all_tests.sh

# 3. If all pass, proceed with git
git push origin main
```

## 📊 Test Results

**Current Status**: ✅ 15/15 tests passing (100%)

### Backend Tests (5 tests)
- Health Check ✅
- Agents Status ✅
- Graph Export ✅
- Intelligence Queries ✅ (3 subtests)
- Visual Reasoning ✅

### Frontend Tests (10 tests)
- Server Tests ✅ (3 tests)
- Component Files ✅ (5 tests)
- Theme Validation ✅ (2 tests)

## 🛠️ Troubleshooting

### Backend not running
```bash
cd backend
uvicorn main:app --reload
```

### Frontend not running
```bash
cd frontend
npm run dev
```

### Python dependencies missing
```bash
pip install requests
```

### Permission denied
```bash
chmod +x tests/*.sh tests/*.py
```

## 🎯 Coverage

These smoke tests cover:
- ✅ Core API endpoints
- ✅ Multi-agent system functionality
- ✅ Intelligence query processing
- ✅ Graph visualization data
- ✅ New UI components (Timeline, Conflicts, Agent Activity)
- ✅ Theme consistency (light mode)
- ✅ Server health and availability

## 📈 Future Enhancements

Potential additions:
- [ ] Integration tests for multi-step workflows
- [ ] Performance benchmarks (response time thresholds)
- [ ] Browser-based UI tests (Puppeteer/Playwright)
- [ ] API authentication tests
- [ ] Load testing for concurrent users
- [ ] Visual regression tests for UI

## 🤝 Contributing

When adding new features:
1. Add corresponding test cases to the appropriate test file
2. Update this README with new test coverage
3. Ensure all tests pass before committing
4. Update test count in documentation

## 📝 Notes

- Tests are designed to be fast (< 2 seconds total)
- Non-destructive (read-only operations)
- Can run repeatedly without side effects
- Exit codes follow Unix conventions (0 = success, 1 = failure)
- Color-coded output for easy visual scanning

---

**Last Updated**: Feb 8, 2026  
**Test Suite Version**: 1.0  
**Maintained by**: OrgMind Development Team
