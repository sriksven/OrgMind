# Phase 5 — Frontend Dashboard Development

Goal: build a polished React dashboard that visualizes the knowledge graph, shows live agent reasoning, and runs demo scenarios.

## Key Files

- `frontend/src/App.jsx` — main shell + layout + state
- `frontend/src/services/api.js` — API client
- `frontend/src/hooks/useGraph.js` — graph state
- `frontend/src/hooks/useAgents.js` — agent polling
- `frontend/src/components/KnowledgeGraph.jsx` — ReactFlow graph
- `frontend/src/components/AgentPanel.jsx` — agent activity
- `frontend/src/components/Dashboard.jsx` — demos, query, stats
- `frontend/src/index.css` — global styles + ReactFlow import
- `frontend/src/App.css` — component styling

## API Calls Used

Configured in `frontend/src/services/api.js`:
- `GET /graph`
- `POST /process`
- `POST /query`
- `GET /agents/status`
- `GET /demo/scenarios`
- `POST /demo/run/{id}`

Base URL is read from `VITE_API_BASE_URL` (defaults to `http://localhost:8000`).

## UI Layout

- Header with branding + graph stats
- Left panel (controls + agent cards)
- Main panel (graph visualization)
- Responsive breakpoint at 1100px

## Graph Features

- ReactFlow rendering, limited to 200 nodes
- Node styles by type:
  - People: `#3b82f6`
  - Decisions: `#f59e0b`
  - Topics: `#10b981`
- Smoothstep edges, thickness based on weight
- Filters: All / People / Decisions / Topics
- Node detail panel on click
- Hover highlight of connected nodes

## Agent Panel

- Memory, Router, Critic cards
- Recent reasoning (last 5)
- Memory card shows graph stats + version
- Glassmorphism styling + Framer Motion entry animations

## Dashboard Controls

- Demo scenario buttons (from `/demo/scenarios`)
- Query input to `/query`
- Live stats + processing indicator

## Run Locally

```bash
cd frontend
npm install
npm run dev
```

Open: `http://localhost:5173`

