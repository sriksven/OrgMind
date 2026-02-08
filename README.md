# 🧠 OrgMind - AI Chief of Staff

**An AI-powered organizational intelligence system that turns communication into structured, versioned, visual knowledge.**

[![Status](https://img.shields.io/badge/status-operational-success)]()
[![Backend](https://img.shields.io/badge/backend-FastAPI-009688)]()
[![Frontend](https://img.shields.io/badge/frontend-React-61DAFB)]()
[![Dark Mode](https://img.shields.io/badge/theme-dark-black)]()

---

## ✨ What is OrgMind?

OrgMind is your company's organizational brain - an AI system that:

- 📊 **Builds a living knowledge graph** from emails, decisions, and communications
- 🤖 **Uses multi-agent AI** to understand, extract, and organize information
- 🔍 **Answers natural language questions** about your organization
- 📈 **Tracks decisions and stakeholders** over time
- 🎨 **Visualizes relationships** between people, topics, and decisions

**Think of it as: Google Maps + Git + Slack — for organizational knowledge**

---

## 🎯 Key Features

### 1. Command Bar Interface (Cmd+K)
Superhuman-style command palette for instant access to organizational intelligence.

### 2. Interactive Knowledge Graph
Beautiful dark-themed visualization with:
- 👥 **298 People** - Team members and stakeholders
- 📝 **27 Decisions** - Key organizational choices
- 🏷️ **150 Topics** - Projects, initiatives, and themes
- **501 total nodes** with 26 relationships mapped

### 3. Multi-Agent AI System
Three specialized AI agents working together:
- **Memory Agent** - Stores and retrieves information
- **Router Agent** - Understands and routes queries
- **Critic Agent** - Validates and checks facts

### 4. Real-time Updates
- Live agent activity monitoring
- Instant graph updates
- Hot module replacement in development

### 5. Rich Node Details
Click any node to see:
- Connections and relationships
- Decision history
- Knowledge timelines
- Stakeholder involvement

### 6. Professional Dark Theme
Eye-friendly dark mode with:
- Glassmorphism effects
- Smooth animations
- Clear visual hierarchy
- Modern design system

---

## 🚀 Quick Start

### Prerequisites

- Python 3.12+
- Node.js 20+
- npm 11+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd OrgMind

# Install all dependencies
make install

# Start development servers
make dev
```

**That's it!** Open:
- **Frontend:** http://localhost:5174/
- **Backend API:** http://127.0.0.1:8000/
- **API Docs:** http://127.0.0.1:8000/docs

---

## 📊 Current Data

The system comes pre-loaded with realistic business data:

- **150 business emails** (8 months of company operations)
- **501 nodes** in the knowledge graph
  - 298 people across departments
  - 27 key decisions
  - 150 topics and projects
- **26 relationships** mapped between entities

---

## 🎮 Try It Out

### 1. Press `Cmd+K` (or `Ctrl+K`)
Opens the command bar with example queries.

### 2. Try These Queries:
- "Show engineering team"
- "What decisions affect mobile?"
- "Who knows about the API migration?"
- "Show me infrastructure changes"

### 3. Explore the Graph
- Click filter buttons to focus on People, Decisions, or Topics
- Click any node to see detailed information
- Pan and zoom to explore relationships

### 4. Watch AI Agents Work
Click "AI Activity" in the navbar to see agents in action.

---

## 🏗️ Project Structure

```
OrgMind/
├── backend/                 # Python FastAPI backend
│   ├── agents/             # AI agent system
│   ├── data_pipeline/      # Data processing
│   ├── knowledge_graph/    # Graph management
│   ├── tests/              # Comprehensive test suite
│   ├── main.py             # FastAPI application
│   └── requirements.txt    # Dependencies
│
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── features/  # CommandBar, KnowledgeGraph, etc.
│   │   │   └── layout/    # Navbar
│   │   ├── styles/        # CSS (dark theme)
│   │   ├── hooks/         # Custom React hooks
│   │   └── services/      # API services
│   └── tests/              # Test structure
│
├── docs/                    # Comprehensive documentation
└── Makefile                 # Development commands
```

---

## 🛠️ Development

### Common Commands

```bash
# Start everything
make dev

# Run tests
make test

# Check status
make status

# Clean up
make clean

# See all commands
make help
```

### Backend Development

```bash
cd backend

# Start server
uvicorn main:app --reload

# Run tests
pytest

# With coverage
pytest --cov
```

### Frontend Development

```bash
cd frontend

# Start dev server
npm run dev

# Build for production
npm run build
```

---

## 🧪 Testing

### Backend Tests
Complete test suite with:
- ✅ Unit tests for graph operations
- ✅ Agent functionality tests
- ✅ Data pipeline tests
- ✅ Integration workflow tests

```bash
cd backend
pytest -v
```

### Test Coverage
- GraphBuilder operations
- Agent coordination
- Entity extraction
- Data ingestion
- Integration flows

---

## 🎨 UI Components

### Implemented Features

**Navigation**
- Sticky navbar with live stats
- AI activity dropdown
- Simple/Advanced mode toggle

**Command Interface**
- Cmd+K command bar
- Example queries
- Natural language processing

**Visualization**
- Interactive knowledge graph (ReactFlow)
- 500+ node support
- Type-based filtering
- Smooth animations

**Detail Views**
- Node detail panel with tabs
- Connection exploration
- Knowledge timelines

**Query Response**
- Structured results display
- Stakeholder cards
- Action buttons

---

## 🤖 AI Agent System

### Architecture

```
User Query
    ↓
Router Agent → Understands intent
    ↓
Memory Agent → Accesses knowledge graph
    ↓
Critic Agent → Validates response
    ↓
Coordinator → Orchestrates and responds
```

### Capabilities

- Natural language understanding
- Entity extraction from text
- Relationship detection
- Decision tracking
- Knowledge graph updates
- Conflict detection

---

## 📚 Data Pipeline

### Process Flow

```
Raw Emails (CSV)
    ↓
Entity Extraction → People, Topics, Decisions
    ↓
Relationship Detection → Connections
    ↓
Knowledge Graph → NetworkX
    ↓
Persistence → Pickle storage
    ↓
API Responses → JSON
```

### Data Processing

1. **Ingestion** - CSV parsing, email loading
2. **Extraction** - NLP entity recognition
3. **Enrichment** - Metadata and relationships
4. **Storage** - Graph serialization

---

## 🌐 API Endpoints

### Available Endpoints

- `GET /health` - System health check
- `GET /graph` - Get knowledge graph data
- `GET /agents/status` - Agent activity status
- `POST /query` - Natural language queries
- `POST /process` - Process new information
- `GET /demo/scenarios` - Demo scenarios
- `POST /demo/run/{scenario_id}` - Run demo
- `GET /stats` - System statistics

### API Documentation

Visit http://127.0.0.1:8000/docs when running the backend.

---

## 📈 Performance

### Metrics

- **Graph Load:** <1 second (501 nodes)
- **Query Response:** <500ms average
- **Hot Reload:** ~100ms
- **Graph Render:** Smooth 60fps

### Optimizations

- Lazy loading for large components
- Efficient NetworkX algorithms
- Frontend component memoization
- Optimized bundle size

---

## 🔒 Security

- Environment-based configuration
- API key management
- CORS configuration
- Input validation
- Comprehensive error handling

---

## 🚢 Deployment

### Development

```bash
make dev
```

Both servers start automatically:
- Backend: http://127.0.0.1:8000
- Frontend: http://localhost:5174

### Production Build

```bash
# Backend
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000

# Frontend
cd frontend
npm run build
# Serve the dist/ folder with any static file server
```

---

## 📖 Documentation

Comprehensive documentation in `/docs`:

- **Getting Started** - Setup and usage guides
- **Architecture** - System design documents
- **API** - Endpoint documentation
- **Design System** - UI/UX guidelines
- **Status Reports** - Implementation tracking

---

## 🤝 Built With

### Backend
- **FastAPI** - Modern Python web framework
- **NetworkX** - Graph algorithms and data structures
- **Pydantic** - Data validation
- **Pandas** - Data processing

### Frontend
- **React** - UI library
- **ReactFlow** - Graph visualization
- **Framer Motion** - Smooth animations
- **Vite** - Fast build tool
- **Axios** - HTTP client

### AI/ML
- **OpenAI/Gemini** - Language models for entity extraction

---

## 📄 License

MIT License - See LICENSE file

---

## 🏆 Project Stats

**Built For:** AI Hackathon - Organizational Intelligence Track

### Current Implementation

- ✅ Multi-agent AI system
- ✅ Interactive knowledge graph
- ✅ Natural language queries
- ✅ Decision tracking
- ✅ Dark theme UI
- ✅ Real-time updates
- ✅ Comprehensive tests
- ✅ Professional structure

### Data Scale

- 150 emails processed
- 501 nodes in graph
- 298 people tracked
- 27 decisions recorded
- 150 topics mapped
- 8 months of data

---

## 📞 Quick Reference

### Access Points

- **Frontend UI:** http://localhost:5174/
- **Backend API:** http://127.0.0.1:8000/
- **API Docs:** http://127.0.0.1:8000/docs
- **Health Check:** http://127.0.0.1:8000/health

### Key Commands

```bash
make dev      # Start both servers
make test     # Run all tests
make status   # Check system status
make help     # Show all commands
```

---

**OrgMind** - Your organization's AI-powered brain 🧠✨

**Version:** 1.0.0  
**Status:** Fully Operational  
**Last Updated:** Feb 7, 2026
