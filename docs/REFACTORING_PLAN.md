# OrgMind - Professional Project Structure Refactoring Plan

## Overview
Restructuring OrgMind into a production-ready, maintainable codebase with proper separation of concerns, comprehensive testing, and clean architecture.

---

## New Project Structure

```
OrgMind/
├── README.md                          # Main project overview
├── LICENSE                            # License file
├── .gitignore                         # Git ignore rules
├── docker-compose.yml                 # Local development setup
├── Makefile                          # Common commands
│
├── backend/                          # Python FastAPI backend
│   ├── src/                         # Source code
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI application entry
│   │   ├── config.py                # Configuration management
│   │   │
│   │   ├── api/                     # API layer
│   │   │   ├── __init__.py
│   │   │   ├── routes/              # API routes
│   │   │   │   ├── health.py
│   │   │   │   ├── graph.py
│   │   │   │   ├── agents.py
│   │   │   │   ├── query.py
│   │   │   │   └── demo.py
│   │   │   ├── dependencies.py      # FastAPI dependencies
│   │   │   └── middleware.py        # Custom middleware
│   │   │
│   │   ├── agents/                  # AI agent system
│   │   │   ├── __init__.py
│   │   │   ├── base.py              # Base agent class
│   │   │   ├── coordinator.py       # Agent coordinator
│   │   │   ├── memory.py            # Memory agent
│   │   │   ├── router.py            # Router agent
│   │   │   ├── critic.py            # Critic agent
│   │   │   └── types.py             # Agent type definitions
│   │   │
│   │   ├── pipelines/               # Data processing pipelines
│   │   │   ├── __init__.py
│   │   │   ├── ingestion/           # Data ingestion
│   │   │   │   ├── __init__.py
│   │   │   │   ├── email_parser.py
│   │   │   │   ├── csv_loader.py
│   │   │   │   └── validators.py
│   │   │   ├── extraction/          # Entity extraction
│   │   │   │   ├── __init__.py
│   │   │   │   ├── entity_extractor.py
│   │   │   │   ├── relation_extractor.py
│   │   │   │   └── decision_detector.py
│   │   │   └── enrichment/          # Data enrichment
│   │   │       ├── __init__.py
│   │   │       └── graph_enricher.py
│   │   │
│   │   ├── knowledge_graph/         # Knowledge graph management
│   │   │   ├── __init__.py
│   │   │   ├── builder.py           # Graph construction
│   │   │   ├── query.py             # Graph queries
│   │   │   ├── export.py            # Graph export utilities
│   │   │   └── storage.py           # Persistence layer
│   │   │
│   │   ├── models/                  # Pydantic models & schemas
│   │   │   ├── __init__.py
│   │   │   ├── api.py               # API request/response models
│   │   │   ├── graph.py             # Graph data models
│   │   │   └── agent.py             # Agent models
│   │   │
│   │   └── utils/                   # Utility functions
│   │       ├── __init__.py
│   │       ├── logging.py           # Logging configuration
│   │       └── helpers.py           # Helper functions
│   │
│   ├── tests/                       # Test suite
│   │   ├── __init__.py
│   │   ├── conftest.py              # Pytest configuration
│   │   ├── unit/                    # Unit tests
│   │   │   ├── test_agents.py
│   │   │   ├── test_pipelines.py
│   │   │   ├── test_graph.py
│   │   │   └── test_api.py
│   │   ├── integration/             # Integration tests
│   │   │   ├── test_agent_flow.py
│   │   │   ├── test_pipeline_flow.py
│   │   │   └── test_api_endpoints.py
│   │   └── fixtures/                # Test fixtures
│   │       ├── sample_emails.csv
│   │       └── mock_data.py
│   │
│   ├── scripts/                     # Utility scripts
│   │   ├── init_db.py
│   │   ├── seed_data.py
│   │   └── migrate.py
│   │
│   ├── data/                        # Data storage
│   │   ├── raw/                     # Raw data files
│   │   ├── processed/               # Processed data
│   │   └── graphs/                  # Saved graphs
│   │
│   ├── requirements.txt             # Production dependencies
│   ├── requirements-dev.txt         # Development dependencies
│   ├── pytest.ini                   # Pytest configuration
│   ├── .env.example                 # Environment template
│   ├── Dockerfile                   # Container definition
│   └── README.md                    # Backend documentation
│
├── frontend/                        # React frontend
│   ├── src/
│   │   ├── assets/                  # Static assets
│   │   │   ├── images/
│   │   │   └── fonts/
│   │   │
│   │   ├── components/              # React components
│   │   │   ├── common/              # Shared components
│   │   │   │   ├── Button/
│   │   │   │   ├── Input/
│   │   │   │   ├── Modal/
│   │   │   │   └── Loading/
│   │   │   ├── layout/              # Layout components
│   │   │   │   ├── Navbar/
│   │   │   │   ├── Header/
│   │   │   │   └── Footer/
│   │   │   ├── features/            # Feature components
│   │   │   │   ├── CommandBar/
│   │   │   │   ├── KnowledgeGraph/
│   │   │   │   ├── QueryResponse/
│   │   │   │   ├── NodeDetailPanel/
│   │   │   │   ├── Dashboard/
│   │   │   │   └── AgentPanel/
│   │   │   └── index.js             # Component exports
│   │   │
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useAgents.js
│   │   │   ├── useGraph.js
│   │   │   ├── useQuery.js
│   │   │   └── useKeyboard.js
│   │   │
│   │   ├── services/                # API services
│   │   │   ├── api.js               # API client
│   │   │   ├── graphService.js
│   │   │   ├── agentService.js
│   │   │   └── queryService.js
│   │   │
│   │   ├── utils/                   # Utility functions
│   │   │   ├── constants.js
│   │   │   ├── formatters.js
│   │   │   └── validators.js
│   │   │
│   │   ├── styles/                  # Global styles
│   │   │   ├── index.css            # Global base styles
│   │   │   ├── variables.css        # CSS variables
│   │   │   ├── themes/              # Theme definitions
│   │   │   │   ├── dark.css
│   │   │   │   └── light.css
│   │   │   └── components.css       # Shared component styles
│   │   │
│   │   ├── App.jsx                  # Root component
│   │   ├── main.jsx                 # Entry point
│   │   └── config.js                # Frontend configuration
│   │
│   ├── tests/                       # Frontend tests
│   │   ├── setup.js                 # Test setup
│   │   ├── components/              # Component tests
│   │   ├── hooks/                   # Hook tests
│   │   └── integration/             # Integration tests
│   │
│   ├── public/                      # Public assets
│   │   ├── favicon.ico
│   │   └── robots.txt
│   │
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── .env.example
│   ├── Dockerfile
│   └── README.md
│
├── docs/                            # Documentation
│   ├── README.md                    # Docs index
│   ├── architecture/                # Architecture docs
│   │   ├── overview.md
│   │   ├── backend.md
│   │   ├── frontend.md
│   │   └── data-flow.md
│   ├── api/                         # API documentation
│   │   ├── endpoints.md
│   │   └── schemas.md
│   ├── guides/                      # User guides
│   │   ├── getting-started.md
│   │   ├── deployment.md
│   │   └── development.md
│   └── design/                      # Design documentation
│       ├── design-system.md
│       └── ui-components.md
│
├── scripts/                         # Project scripts
│   ├── setup.sh                     # Initial setup
│   ├── dev.sh                       # Development server
│   ├── test.sh                      # Run all tests
│   ├── deploy.sh                    # Deployment script
│   └── clean.sh                     # Cleanup script
│
└── .github/                         # GitHub specific
    └── workflows/                   # CI/CD workflows
        ├── test.yml
        ├── lint.yml
        └── deploy.yml
```

---

## Migration Steps

### Phase 1: Backend Restructure
1. ✅ Create new directory structure
2. ✅ Move files to appropriate locations
3. ✅ Update all imports
4. ✅ Create proper test structure
5. ✅ Add pytest configuration

### Phase 2: Frontend Cleanup
1. ✅ Consolidate CSS files
2. ✅ Organize components by feature
3. ✅ Create proper service layer
4. ✅ Set up component tests
5. ✅ Clean up unused files

### Phase 3: Testing Infrastructure
1. ✅ Backend unit tests
2. ✅ Backend integration tests
3. ✅ Frontend component tests
4. ✅ E2E test setup
5. ✅ CI/CD pipeline

### Phase 4: Documentation
1. ✅ Update all documentation
2. ✅ Create API documentation
3. ✅ Write development guide
4. ✅ Create deployment guide

### Phase 5: DevOps
1. ✅ Docker setup
2. ✅ Docker Compose for local dev
3. ✅ Makefile for common tasks
4. ✅ CI/CD workflows

---

## Key Improvements

### 1. Separation of Concerns
- API layer separated from business logic
- Clear pipeline structure for data processing
- Modular agent system

### 2. Testability
- Unit tests for all components
- Integration tests for flows
- Fixtures and mocks for testing

### 3. Maintainability
- Clear folder structure
- Consistent naming conventions
- Proper documentation

### 4. Scalability
- Modular architecture
- Service-based design
- Easy to add new features

### 5. Developer Experience
- Simple setup scripts
- Hot reload for development
- Clear error messages
- Comprehensive documentation

---

## Next Steps

1. Execute migration scripts
2. Run full test suite
3. Update documentation
4. Deploy to staging
5. Production rollout

---

**Status: Ready to execute** ✅
