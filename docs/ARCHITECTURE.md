# OrgMind Architecture

## Overview

OrgMind is an AI Chief of Staff system that orchestrates multiple agents over a knowledge graph of people, events, and decisions.

## Components

### Backend

- **Agents**
  - **BaseAgent**: Abstract base for all agents.
  - **MemoryAgent**: Stores and retrieves context.
  - **RouterAgent**: Routes requests by intent to the right agent.
  - **CriticAgent**: Evaluates and refines outputs.
  - **Coordinator**: Runs the pipeline: route → execute → critique.

- **Knowledge Graph**
  - **GraphBuilder**: Builds a directed graph (NetworkX) of entities and relations.
  - **GraphExporter**: Exports nodes/edges for the frontend (e.g. React Flow).

- **Data Pipeline**
  - **MockDataGenerator**: Generates synthetic events and entities for demos.
  - **EntityExtractor**: Extracts entities and relations from text or event data.

- **API** (FastAPI)
  - `GET /health` – Health check.
  - `GET /graph` – Knowledge graph (nodes + edges).
  - `GET /agents` – List agents and capabilities.
  - `POST /agent/process` – Process a request through the coordinator.

### Frontend

- **React + Vite**
- **React Flow** for the knowledge graph visualization.
- **Framer Motion** for animations (optional).
- **Axios** for API calls.

- **Views**
  - Dashboard: Status and graph summary.
  - Knowledge Graph: Interactive graph (React Flow).
  - Agent Panel: List agents, send process requests, show results.
  - Scenario Trigger: Run predefined scenarios.

## Data Flow

1. User or scenario sends a payload to `POST /agent/process`.
2. Coordinator passes it to the RouterAgent; router returns target agent and payload.
3. Target agent (e.g. MemoryAgent) processes and returns a result.
4. Optionally, CriticAgent reviews the result.
5. Response is returned to the client.
6. Knowledge graph is built from events/entities and served at `GET /graph`.

## Conventions

- Backend runs with `uvicorn main:app --reload` from the `backend/` directory.
- Frontend runs with `npm run dev` from the `frontend/` directory.
- Environment variables: see `backend/.env.example` and `frontend/.env.example`.
