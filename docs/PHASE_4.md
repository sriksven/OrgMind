# Phase 4 — FastAPI Backend & API Endpoints

Goal: expose the multi-agent system + knowledge graph via a clean REST API and provide demo scenarios for judges.

## Core Endpoints

Base URL (local): `http://127.0.0.1:8000`

- `GET /` — basic health response
- `GET /health` — detailed health + graph stats + request stats
- `GET /graph` — cached graph `{nodes, edges, metadata}` (fast)
- `POST /process` — validate + run Phase 3 pipeline (`critic → memory → router`)
- `POST /query` — natural language query via MemoryAgent
- `GET /agents` — list agents + capabilities
- `GET /agents/status` — agent reasoning logs + graph state + recent executions
- `GET /demo/scenarios` — list demo scenarios
- `POST /demo/run/{id}` — run a demo scenario (1–4)
- `GET /stats` — request/latency stats + graph size history

Legacy/compat:
- `POST /agent/process` — older entrypoint (still supported)

## Request Models

### `POST /process`

Body:

```json
{
  "type": "decision",
  "content": "Product launch moved from Q1 to Q2 due to supply chain delays",
  "topic": "product_launch",
  "stakeholders": ["engineering", "marketing", "sales"],
  "priority": "high",
  "metadata": {},
  "date": "2001-04-10"
}
```

### `POST /query`

Body:

```json
{ "question": "What decisions were made this week?" }
```

## Demo Scenarios

Defined in `backend/demo/scenarios.py`.

- 1: Product launch delayed (high priority decision)
- 2: Budget conflict (`$5M` vs seeded baseline `$3.5M`)
- 3: “Daily summary” query
- 4: New team member announcement

## Performance Notes

- `/graph` serves a pre-exported cache populated at startup and refreshed after successful `/process` and `/demo/run/*` updates.
- `/stats` tracks counts + total/average times for `process`, `query`, and `demo`.

