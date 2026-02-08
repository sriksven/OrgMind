# OrgMind API

Base URL: `http://localhost:8000` (default).

## Endpoints

### GET /health

Health check.

**Response**

```json
{
  "status": "ok",
  "service": "orgmind"
}
```

---

### GET /graph

Returns the knowledge graph as nodes and edges for the frontend.

**Response**

```json
{
  "nodes": [
    {
      "id": "evt-0",
      "label": "Strategy Review",
      "type": "event"
    }
  ],
  "edges": [
    {
      "source": "ent-1",
      "target": "evt-0",
      "relation_type": "attended"
    }
  ]
}
```

---

### GET /agents

Lists registered agents and their capabilities.

**Response**

```json
{
  "agents": [
    {
      "name": "router",
      "capabilities": ["routing", "intent_classification"]
    },
    {
      "name": "memory",
      "capabilities": ["store", "retrieve", "context"]
    },
    {
      "name": "critic",
      "capabilities": ["critique", "quality_check", "refinement"]
    }
  ]
}
```

---

### POST /agent/process

Processes a request through the coordinator (route → execute → optional critique).

**Request body**

- Arbitrary JSON. Typical fields:
  - `intent`: Used by router to choose agent (e.g. `"memory"`).
  - `action`: For memory, `"store"` or `"retrieve"`.
  - `payload`: Data to store (for store).
  - `query`: Query string (for retrieve).

**Example (store)**

```json
{
  "intent": "memory",
  "action": "store",
  "payload": { "note": "Meeting follow-up" }
}
```

**Example (retrieve)**

```json
{
  "intent": "memory",
  "action": "retrieve",
  "query": "meeting"
}
```

**Response**

Structure depends on the target agent and whether critique is enabled; typically includes `coordinator`, `target`, and `result` (and optionally `_critique`).
