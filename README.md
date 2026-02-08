# OrgMind - AI Chief of Staff

OrgMind is an automated organizational intelligence system. It acts as a central brain for your company, turning scattered communications like emails and announcements into a structured knowledge graph that you can query in plain English.

Think of it as a combination of a search engine and a map for your organization's knowledge.

## What It Does

OrgMind helps teams stay aligned by solving the problem of information silos. Instead of searching through thousands of emails or Slack messages, you can ask OrgMind questions like "Why was the product launch delayed?" or "Who is working on the mobile API?"

It works by:
1. **Reading Communications:** It ingests emails and updates to understand what is happening.
2. **Building a Graph:** It connects people, decisions, and topics in a network (a knowledge graph).
3. **Analyzing Risks:** An AI agent monitors this graph to spot conflicts, delays, or blocked teams.
4. **Answering Questions:** You can ask it questions, and it provides answers based on the current facts.

## Key Features

### 1. The Knowledge Graph
The core of the system is a visual network of your organization.
- **Nodes:** Represent People, Teams, Decisions, and Topics.
- **Edges:** Represent relationships (e.g., "Dependency", "Blocked By", "Managed By").
- **Live Updates:** The graph updates automatically as new information comes in.

### 2. Situation Brief
A real-time dashboard that gives you an executive summary of the organization's health.
- **Health Score:** A calculated metric based on the number of risks and conflicts detected.
- **Risk Detection:** Automatically identifies blocked teams or delayed projects.
- **Timeline:** Shows a chronological view of recent decisions and events.

### 3. Command Interface
A simple search bar (accessible via Cmd+K) allows you to navigate the system instantly. You can jump to a specific person, find a decision, or ask a general question.

### 4. Traffic Simulation
For demonstration purposes, OrgMind includes a simulation engine that generates realistic email traffic. This allows you to see the system in action without connecting it to live company data immediately.

## System Architecture

The project is divided into two main parts:

### Backend (Python)
- **Framework:** FastAPI
- **Graph Database:** NetworkX (in-memory for speed, persisted to disk)
- **AI Agents:** 
  - **Intelligence Agent:** Analyzes the graph for risks.
  - **Coordinator:** Manages the flow of information.
- **LLM Integration:** Uses OpenAI (GPT-4) for understanding text and generating insights.

### Frontend (React)
- **Framework:** React with Vite
- **Visualization:** ReactFlow for the interactive graph.
- **Styling:** Custom CSS with a dark-themed design.
- **State Management:** React Hooks for handling real-time data.

## Getting Started

Follow these steps to set up OrgMind on your local machine.

### Prerequisites
- Python 3.12 or higher
- Node.js 20 or higher
- An OpenAI API Key

### 1. Installation

Clone the repository and install dependencies.

**Backend Setup:**
Open a terminal and navigate to the backend folder:
```bash
cd backend
pip install -r requirements.txt
```

**Frontend Setup:**
Open a new terminal and navigate to the frontend folder:
```bash
cd frontend
npm install
```

### 2. Configuration

Create a `.env` file in the `backend` directory with your API key:
```
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4o
```

### 3. Running the Application

**Start the Backend:**
In the backend terminal, run:
```bash
uvicorn main:app --reload
```
The API will start at http://127.0.0.1:8000.

**Start the Frontend:**
In the frontend terminal, run:
```bash
npm run dev
```
The UI will run at http://localhost:5173.

### 4. Running a Simulation

To populate the system with data, you can run the traffic simulator. This will send a batch of emails to the backend.

Open a terminal in the `backend` folder and run:
```bash
python scripts/simulate_traffic.py
```
Refresh the frontend to see the new data appear in the Timeline and Situation Brief.

## API Documentation

When the backend is running, you can access the interactive API documentation at:
http://127.0.0.1:8000/docs

**Key Endpoints:**
- `GET /health` - Checks if the system is running.
- `POST /query` - Asks a question to the AI.
- `GET /graph` - Retrieves the full knowledge graph.
- `GET /agents/status` - Gets the current status of AI agents.

## Project Structure

```
OrgMind/
├── backend/                  # Python FastAPI application
│   ├── agents/               # AI Agents (Intelligence, Coordinator)
│   ├── data/                 # Data storage (graphs, simulation data)
│   ├── data_pipeline/        # Ingestion and processing logic
│   ├── knowledge_graph/      # NetworkX graph builder
│   ├── scripts/              # Utility scripts (simulation)
│   ├── tests/                # Unit and integration tests
│   ├── main.py               # API entry point
│   └── requirements.txt      # Python dependencies
│
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # UI Components
│   │   │   ├── features/     # Key features (Graph, Brief, etc.)
│   │   │   └── layout/       # Layout components (Sidebar)
│   │   ├── services/         # API client services
│   │   └── App.jsx           # Main application wrapper
│   └── package.json          # Node dependencies
│
└── docs/                     # Documentation and design files
```

## License

This project is licensed under the MIT License.
