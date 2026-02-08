# OrgMind – Project Plan

## Vision

OrgMind is an **AI Chief of Staff** system: a single interface that orchestrates multiple AI agents over a knowledge graph of people, events, and decisions.

## Goals

- Provide a **coordinator** that routes requests to specialist agents (memory, router, critic).
- Maintain a **knowledge graph** of entities and relationships, built from events and extracted data.
- Expose a **REST API** for health, graph, agents, and agent processing.
- Offer a **frontend** (dashboard, graph view, agent panel, scenario trigger) for demos and operations.

## Structure

- **backend/** – FastAPI app, agents, knowledge graph, data pipeline, utils.
- **frontend/** – React + Vite, React Flow, API client, hooks, components.
- **docs/** – Architecture, API, and demo script.

## Phases (high level)

1. **Foundation** – Project layout, backend API, graph build/export, basic frontend (done in this scaffold).
2. **Agents** – Harden router intents, memory storage, and critic logic; add more agents if needed.
3. **Graph** – Connect entity extraction and events to the graph; incremental updates.
4. **UX** – Polish dashboard, graph layout, and scenario flows; optional Framer Motion.
5. **Integration** – OpenAI (GPT-4o) for routing or critique; auth and deployment as needed.

## Success Criteria

- Backend serves `/health`, `/graph`, `/agents`, `/agent/process` and coordinates agents.
- Frontend loads dashboard, graph, agent list, and scenario trigger; graph is interactive.
- Demo script can be followed to show end-to-end flow.
