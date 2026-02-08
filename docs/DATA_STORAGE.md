# Data Storage Architecture

## Overview

OrgMind uses a **multi-layer storage system** with in-memory processing, file-based persistence, and runtime caching.

---

## Storage Layers

### 1. **Source Data Layer** (Raw)
📁 **Location**: `/backend/data/raw/company_emails.csv`

**Format**: CSV (Comma-Separated Values)

**Structure**:
```csv
id,date,sender,to,cc,subject,body
1,2024-01-15T09:30:00Z,john.smith@company.com,engineering-team@company.com,...
```

**Purpose**: 
- Human-readable source data
- Easy to edit and add new emails
- 20 emails currently stored

**Pros**:
- ✅ Easy to edit manually
- ✅ Version control friendly
- ✅ Can be viewed in spreadsheets

**Cons**:
- ❌ Not optimized for querying
- ❌ No relationships stored
- ❌ Linear structure only

---

### 2. **Knowledge Graph Layer** (Processed)
📁 **Location**: `/backend/data/processed/knowledge_graph.pkl`

**Format**: Python Pickle (Binary)

**Size**: 4.7 KB

**Structure**: Serialized `GraphBuilder` object containing:
- NetworkX graph (nodes + edges)
- Node attributes (type, label, metadata)
- Edge attributes (relation_type, weight)

**How It's Created**:
```python
# From load_real_data.py
graph = GraphBuilder()
graph.add_entity("John Smith", "John Smith", {"type": "person"})
graph.add_decision("decision_1", content="...", date="...")
graph.add_relation("decision_1", "John Smith", "made_by")
graph.save("data/processed/knowledge_graph.pkl")
```

**Internal Structure**:
```python
GraphBuilder
├── _graph: networkx.DiGraph
│   ├── nodes: dict[node_id, {label, type, ...}]
│   └── edges: dict[(source, target), {relation_type, weight}]
└── Methods: add_entity(), add_relation(), save(), load()
```

**Purpose**:
- Fast graph queries
- Relationship traversal
- Entity connections
- Quick load on startup

**Pros**:
- ✅ Fast to load (4.7KB → milliseconds)
- ✅ Preserves graph structure
- ✅ Supports complex queries
- ✅ NetworkX powers graph algorithms

**Cons**:
- ❌ Binary format (not human-readable)
- ❌ Python-specific (not portable)
- ❌ No concurrent writes
- ❌ Loses data if corrupted

---

### 3. **Runtime Memory Layer** (Active)
📦 **Location**: Backend process memory

**Format**: Python objects in RAM

**Structure**:
```python
# main.py - Shared state
graph_builder = GraphBuilder()        # In-memory graph
coordinator = Coordinator(graph=...)  # Agent system
app.state.graph_cache = {...}         # FastAPI cache
```

**What's Stored**:
1. **graph_builder**: The live NetworkX graph
2. **coordinator**: Agent memory and reasoning history
3. **app.state.graph_cache**: Exported JSON for API responses
4. **app.state.graph_history**: Version history timeline
5. **app.state.stats**: Request statistics

**Purpose**:
- Ultra-fast queries (no disk I/O)
- Real-time modifications
- Agent reasoning state
- API response caching

**Lifecycle**:
```
Backend Start
  ↓
Load knowledge_graph.pkl → graph_builder (RAM)
  ↓
Serve API requests (use RAM)
  ↓
Optional: Save modified graph back to .pkl
  ↓
Backend Stop (RAM cleared)
```

**Pros**:
- ✅ Instant access (microseconds)
- ✅ Supports rapid modifications
- ✅ No file locks

**Cons**:
- ❌ Lost on crash/restart
- ❌ Limited by RAM size
- ❌ No persistence without explicit save

---

### 4. **API Response Cache** (Temporary)
📦 **Location**: `app.state.graph_cache` (FastAPI application state)

**Format**: Python dictionary (JSON-serializable)

**Structure**:
```python
{
    "nodes": [
        {"id": "John Smith", "label": "John Smith", "type": "person"},
        ...
    ],
    "edges": [
        {"source": "decision_1", "target": "John Smith", "relation_type": "made_by"},
        ...
    ],
    "metadata": {
        "version": 0,
        "node_count": 72,
        "edge_count": 7,
        "loaded_from_disk": true
    }
}
```

**Purpose**:
- Avoid re-exporting graph on every API call
- Fast JSON responses
- Version tracking

**When Updated**:
- On backend startup
- After processing new information
- After demo scenarios run
- On manual refresh

---

## Data Flow

### Initial Load (Backend Startup)

```
1. Backend starts (main.py)
   ↓
2. Check if knowledge_graph.pkl exists
   ↓
3a. IF EXISTS:
    → Load pickle → Deserialize GraphBuilder → Set graph_builder
   ↓
3b. IF NOT EXISTS:
    → Generate mock data → Build graph in memory
   ↓
4. Export to app.state.graph_cache (JSON format)
   ↓
5. Ready to serve API requests
```

### Adding New Data

```
1. CSV: Add email to company_emails.csv
   ↓
2. Run: python scripts/load_real_data.py
   ↓
3. Script:
   - Reads CSV
   - Builds GraphBuilder
   - Saves to knowledge_graph.pkl
   ↓
4. Restart backend
   ↓
5. Backend loads new .pkl file
   ↓
6. New data appears in UI
```

### Runtime Processing

```
User Query via API
   ↓
POST /process or POST /query
   ↓
Coordinator.process(info) [in memory]
   ↓
- MemoryAgent updates graph
- RouterAgent finds connections  
- CriticAgent validates
   ↓
graph_builder modified (RAM only)
   ↓
app.state.graph_cache updated
   ↓
Return JSON response
   ↓
(Changes in RAM but not persisted to .pkl)
```

---

## Storage Technology Stack

### Core Libraries

1. **NetworkX** (Graph Storage)
   - Python library for complex networks
   - Directed graph (DiGraph)
   - Node/edge attributes
   - Graph algorithms (shortest path, centrality, etc.)

2. **Pickle** (Serialization)
   - Python's native serialization
   - Binary format
   - Fast load/save
   - Preserves Python objects exactly

3. **Pandas** (CSV Processing)
   - Reads company_emails.csv
   - Data manipulation
   - Easy filtering/transformation

4. **FastAPI State** (Runtime Cache)
   - Application-level state management
   - Shared across all requests
   - Persists during server lifetime

---

## Data Persistence Strategy

### What Gets Saved

✅ **Persisted to Disk**:
- Source emails (CSV)
- Compiled knowledge graph (.pkl)

❌ **Not Persisted** (RAM only):
- Agent reasoning history
- Query results
- Session state
- Runtime modifications

### When Data is Saved

**Automatic Save**: NEVER (currently)
- Changes in RAM are not auto-saved to disk

**Manual Save Options**:
1. Run `load_real_data.py` script (rebuilds from CSV)
2. Add save logic to API endpoints
3. Periodic background saves (not implemented)

### Data Loss Scenarios

⚠️ **You Will Lose**:
- Runtime graph modifications (unless saved)
- Agent reasoning history
- Query results
- Demo scenario changes

🔒 **You Won't Lose**:
- Original CSV data
- Last saved .pkl graph
- Configuration files

---

## File Structure

```
backend/
├── data/
│   ├── raw/
│   │   └── company_emails.csv       # Source data (editable)
│   └── processed/
│       └── knowledge_graph.pkl       # Compiled graph (binary)
├── main.py                           # Backend server (loads .pkl)
├── knowledge_graph.py                # GraphBuilder class
└── scripts/
    └── load_real_data.py             # CSV → PKL converter
```

---

## Storage Comparison

| Layer | Format | Size | Speed | Persistent | Editable |
|-------|--------|------|-------|------------|----------|
| CSV | Text | ~10KB | Slow | ✅ Yes | ✅ Yes |
| Pickle | Binary | 4.7KB | Fast | ✅ Yes | ❌ No |
| RAM | Objects | ~1MB | Instant | ❌ No | ✅ Yes |
| Cache | JSON | ~50KB | Very Fast | ❌ No | ❌ No |

---

## Future Improvements

### Recommended Enhancements

1. **Add Database (PostgreSQL + pgvector)**
   ```python
   # Store vectors for semantic search
   # Support concurrent writes
   # Transaction safety
   ```

2. **Auto-Save on Modifications**
   ```python
   @app.post("/process")
   async def process_info(info: NewInformation):
       result = coordinator.process(info)
       graph_builder.save("data/processed/knowledge_graph.pkl")
       return result
   ```

3. **Version Control**
   ```python
   # Save timestamped versions
   graph_builder.save(f"data/processed/graph_{timestamp}.pkl")
   ```

4. **Backup Strategy**
   ```bash
   # Daily backups
   cp knowledge_graph.pkl backups/graph_$(date +%Y%m%d).pkl
   ```

5. **Export Formats**
   ```python
   # GraphML (Neo4j compatible)
   # JSON (portable)
   # GraphSON (Gremlin)
   ```

---

## How to Inspect Data

### View CSV Data
```bash
cat backend/data/raw/company_emails.csv
```

### Check Pickle Contents
```python
import pickle
with open('backend/data/processed/knowledge_graph.pkl', 'rb') as f:
    graph = pickle.load(f)
    print(graph.get_stats())
```

### Query via API
```bash
curl http://localhost:8000/graph | python -m json.tool
```

### Direct NetworkX Access
```python
from knowledge_graph import GraphBuilder
graph = GraphBuilder.load('data/processed/knowledge_graph.pkl')
nx_graph = graph.get_graph()
print(nx_graph.nodes(data=True))
print(nx_graph.edges(data=True))
```

---

## Summary

**Storage Flow**:
```
CSV (source)
  ↓ [load_real_data.py]
Pickle (persistent graph)
  ↓ [backend startup]
RAM (active graph)
  ↓ [API export]
JSON (frontend display)
```

**Key Points**:
- 📝 Edit CSV for new data
- 🔄 Run script to rebuild graph
- 💾 Pickle stores compiled graph
- ⚡ RAM powers fast queries
- 🌐 JSON serves frontend
- ⚠️ Runtime changes not auto-saved

---

**Last Updated**: February 2026
