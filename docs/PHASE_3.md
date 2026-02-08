# Phase 3 — Multi-Agent System Development

Goal: build three specialized agents (Memory, Router, Critic) coordinated by a central orchestrator, with transparent reasoning logs.

## What’s Implemented

- **BaseAgent**: shared OpenAI client + reasoning log utilities
- **MemoryAgent**: updates + queries the knowledge graph
- **RouterAgent**: scores stakeholders and produces a routing plan
- **CriticAgent**: checks for conflicts vs existing graph facts
- **Coordinator**: orchestrates `critic → memory → router` and aggregates outputs

## Key Files

- Agents:
  - `backend/agents/base_agent.py`
  - `backend/agents/memory_agent.py`
  - `backend/agents/router_agent.py`
  - `backend/agents/critic_agent.py`
  - `backend/agents/coordinator.py`
- Smoke test:
  - `backend/scripts/test_agents.py`

## Configuration

Backend env vars (see `backend/.env.example`):
- `OPENAI_API_KEY` — required for OpenAI calls
- `OPENAI_MODEL` — defaults to `gpt-4o`

Runtime flags (passed as `config` when instantiating agents/coordinator):
- `llm_enabled` (default: `true`) — set `false` to force offline fallbacks
- `critique_enabled` (default: `true`) — whether to run critique on legacy pipeline

## Run the Phase 3 Smoke Test

This runs end-to-end without requiring OpenAI access (uses `llm_enabled=false`):

```bash
python backend/scripts/test_agents.py
```

Expected:
- A result payload containing `critic`, `memory`, `routing`, `execution`, `reasoning`
- Graph state showing nodes/edges added
- Recent reasoning entries printed for MemoryAgent

## How the Coordinator Works

### `process_new_information(info)`

Input (example):

```json
{
  "type": "decision",
  "topic": "Budget",
  "priority": "high",
  "content": "We approved a $250k budget for Q2 hiring.",
  "stakeholders": ["finance@enron.com", "cto@enron.com"],
  "date": "2001-04-10"
}
```

Pipeline:
1. **CriticAgent** runs `detect_conflicts` (returns `{conflict, severity, explanation}`)
2. If conflict: stop and return conflict report
3. **MemoryAgent** runs `update_knowledge` (adds nodes/edges, increments version)
4. **RouterAgent** runs `route_information` (must/should/fyi lists)
5. Coordinator returns aggregated results + recent reasoning logs

### `get_agent_status()`

Returns:
- capabilities + recent reasoning for each agent
- graph stats + version
- recent coordinator executions

## Using via API (current wiring)

The FastAPI endpoint `POST /agent/process` calls `Coordinator.process(payload)`.

- If you send a payload **with `content` and without `intent`**, the coordinator treats it as **new information** and runs the Phase 3 pipeline.
- If you send a payload **with `intent`**, the coordinator uses the legacy intent routing path.

## Notes / Troubleshooting

- If OpenAI is rate-limited or disabled, agents fall back to safe defaults and include an `_error` field in outputs.
- If you see an import error when running scripts directly, ensure you’re running them as documented (repo-root command shown above).

