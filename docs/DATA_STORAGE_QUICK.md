# Data Storage - Quick Reference

## 📊 How Data Gets Stored in OrgMind

### Simple Answer
Your data flows through 4 layers:
1. **CSV files** (you can edit)
2. **Pickle file** (compiled graph)
3. **RAM** (active processing)
4. **JSON** (sent to browser)

---

## Visual Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. SOURCE DATA (Editable)                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━                                 │
│  📄 company_emails.csv (10 KB)                              │
│     ├── 20 emails                                            │
│     ├── Human readable                                       │
│     └── Easy to edit in Excel/text editor                   │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ python scripts/load_real_data.py
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  2. COMPILED GRAPH (Persistent)                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                             │
│  💾 knowledge_graph.pkl (4.7 KB)                            │
│     ├── NetworkX DiGraph (binary)                           │
│     ├── 71 nodes + 7 edges                                  │
│     └── NOT human readable                                  │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ Backend starts, loads .pkl
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  3. IN-MEMORY GRAPH (Active)                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                              │
│  ⚡ RAM (~1 MB)                                              │
│     ├── graph_builder: GraphBuilder                         │
│     ├── coordinator: Coordinator (agents)                   │
│     ├── Fast queries (microseconds)                         │
│     └── Lost on restart unless saved                        │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ API request
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  4. API RESPONSE (Frontend)                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━                               │
│  🌐 JSON (~50 KB)                                           │
│     ├── {nodes: [...], edges: [...]}                       │
│     ├── Sent to browser                                     │
│     └── Rendered as graph visualization                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Storage Details

### 📄 Layer 1: CSV (Source)
**File**: `backend/data/raw/company_emails.csv`

```csv
id,date,sender,to,cc,subject,body
1,2024-01-15,john.smith@company.com,team@company.com,...
```

**Technology**: Plain text CSV  
**Size**: ~10 KB  
**Editable**: ✅ Yes, with any text editor  
**Persistent**: ✅ Yes, committed to git

---

### 💾 Layer 2: Pickle (Compiled)
**File**: `backend/data/processed/knowledge_graph.pkl`

**Technology**: Python Pickle + NetworkX  
**Size**: 4.7 KB  
**Format**: Binary (not human-readable)  

**What's Inside**:
```python
NetworkX DiGraph
├── Nodes: {
│     "Susan Williams": {label: "Susan Williams", type: "person"},
│     "decision_0": {label: "Product Launch...", type: "decision"},
│     ...
│   }
└── Edges: {
      ("decision_0", "John Smith"): {relation_type: "made_by"},
      ...
    }
```

**How It's Created**:
```python
# graph_builder.py
def save(self, path):
    with open(path, "wb") as f:
        pickle.dump(self._graph, f)  # Serialize NetworkX graph

def load(cls, path):
    with open(path, "rb") as f:
        graph = pickle.load(f)  # Deserialize
    return GraphBuilder(graph)
```

**Pros**: Fast to load, preserves graph structure  
**Cons**: Binary format, Python-specific

---

### ⚡ Layer 3: RAM (Active Processing)
**Location**: Backend process memory

**Main Objects**:
```python
# main.py (shared state)
graph_builder = GraphBuilder()  # The live graph
coordinator = Coordinator()     # AI agents
app.state.graph_cache = {}      # JSON cache
```

**Technology**: NetworkX DiGraph in Python memory  
**Size**: ~1 MB  
**Speed**: Microseconds  
**Persistent**: ❌ No (lost on restart)

**Operations**:
```python
# Add a new person (happens in RAM)
graph_builder.add_entity("Jane Doe", "Jane Doe", {"type": "person"})

# Add a connection (happens in RAM)
graph_builder.add_relation("Jane Doe", "Project Alpha", "works_on")

# Query (instant, from RAM)
nodes = graph_builder.get_nodes()
edges = graph_builder.get_edges()
```

---

### 🌐 Layer 4: JSON (API Response)
**Location**: HTTP response to frontend

**Format**:
```json
{
  "nodes": [
    {"id": "Susan Williams", "label": "Susan Williams", "type": "person"},
    {"id": "decision_0", "label": "Product Launch", "type": "decision"}
  ],
  "edges": [
    {"source": "decision_0", "target": "John Smith", "relation_type": "made_by"}
  ],
  "metadata": {
    "node_count": 72,
    "edge_count": 7,
    "version": 0
  }
}
```

**Created by**:
```python
# graph_export.py
exporter = GraphExporter(graph_builder)
json_data = exporter.to_dict()
```

**Sent to**: Frontend React app  
**Used for**: Visualization with ReactFlow

---

## Key Files

```
backend/
├── data/
│   ├── raw/
│   │   └── company_emails.csv           ← YOU EDIT THIS
│   └── processed/
│       └── knowledge_graph.pkl          ← COMPILED OUTPUT
│
├── knowledge_graph/
│   └── graph_builder.py                 ← STORAGE LOGIC
│       • save() → pickle.dump()
│       • load() → pickle.load()
│       • NetworkX DiGraph
│
├── scripts/
│   └── load_real_data.py                ← CSV → PKL CONVERTER
│       • Reads CSV
│       • Builds graph
│       • Saves as pickle
│
└── main.py                              ← BACKEND SERVER
    • Loads .pkl on startup
    • Keeps graph in RAM
    • Serves JSON via API
```

---

## Storage Technologies

### NetworkX
**What**: Python library for graphs/networks  
**Version**: 3.6.1  
**Why**: Industry standard for graph algorithms

**Core Structure**:
```python
import networkx as nx

# Create directed graph
graph = nx.DiGraph()

# Add nodes with attributes
graph.add_node("John", label="John Smith", type="person")

# Add edges with attributes  
graph.add_edge("John", "Project A", relation_type="works_on")

# Query
graph.nodes(data=True)   # All nodes with attributes
graph.edges(data=True)   # All edges with attributes
graph.neighbors("John")  # Connected nodes
```

**Why DirectedGraph (DiGraph)?**
- Relationships have direction: `A → B` ≠ `B → A`
- Example: "John **made** decision_1" (not: decision_1 made John)

---

### Python Pickle
**What**: Python's built-in serialization format  
**Format**: Binary

**How It Works**:
```python
import pickle

# Save
with open('graph.pkl', 'wb') as f:
    pickle.dump(networkx_graph, f)

# Load
with open('graph.pkl', 'rb') as f:
    graph = pickle.load(f)
```

**Pros**:
- ✅ Fast serialize/deserialize
- ✅ Preserves Python objects exactly
- ✅ Built-in (no extra dependencies)

**Cons**:
- ❌ Binary (not human-readable)
- ❌ Python-only (not portable to other languages)
- ❌ Security risk with untrusted files

---

## Data Lifecycle

### Startup Sequence
```
1. Backend starts
   ↓
2. Check: does knowledge_graph.pkl exist?
   ↓
3. YES → Load pickle → Deserialize → Store in RAM
   NO  → Generate mock data → Store in RAM
   ↓
4. Export to JSON cache
   ↓
5. Server ready (graph in memory)
```

### Adding New Data
```
1. Edit company_emails.csv
   ↓
2. Run: python scripts/load_real_data.py
   ↓
3. Script reads CSV, builds graph, saves .pkl
   ↓
4. Restart backend
   ↓
5. Backend loads new .pkl
   ↓
6. New data visible in UI
```

### Runtime Changes
```
User submits query → POST /query
   ↓
Coordinator processes (modifies RAM graph)
   ↓
Changes exist in RAM only
   ↓
NOT saved to .pkl (unless explicitly called)
   ↓
Lost on restart
```

---

## Persistence Strategy

### ✅ What Gets Saved
- Source CSV (manual edits)
- Compiled .pkl (from script)

### ❌ What Doesn't Get Saved
- Runtime graph changes (API modifications)
- Agent reasoning history
- Query results
- Demo scenario changes

### 🔄 To Persist Runtime Changes
Currently NO auto-save. To implement:

```python
# Option 1: Save after every change
@app.post("/process")
async def process_info(info):
    result = coordinator.process(info)
    graph_builder.save("data/processed/knowledge_graph.pkl")
    return result

# Option 2: Manual save endpoint
@app.post("/graph/save")
async def save_graph():
    graph_builder.save("data/processed/knowledge_graph.pkl")
    return {"status": "saved"}

# Option 3: Periodic auto-save (background task)
@app.on_event("startup")
async def periodic_save():
    while True:
        await asyncio.sleep(300)  # Every 5 minutes
        graph_builder.save("data/processed/knowledge_graph.pkl")
```

---

## Advantages of This Architecture

### ✅ Pros
1. **Fast Queries**: All data in RAM, microsecond access
2. **Simple**: No database setup needed
3. **Portable**: Single .pkl file
4. **Graph Algorithms**: NetworkX has 100+ built-in algorithms
5. **Flexible**: Easy to modify graph structure

### ⚠️ Cons
1. **Not Persistent**: Runtime changes lost
2. **Single Process**: Can't scale to multiple servers
3. **No Transactions**: No rollback on errors
4. **RAM Limited**: Graph size limited by memory
5. **Binary Format**: Can't inspect .pkl directly

---

## Future Improvements

### Recommended Next Steps

1. **Add Database** (PostgreSQL)
   - Persistent storage
   - Concurrent access
   - Transactions
   
2. **Add Auto-Save**
   - Save after modifications
   - Versioned backups
   
3. **Add Vector Store** (pgvector)
   - Semantic search
   - Similar entities
   
4. **Export Options**
   - GraphML for Neo4j
   - JSON for portability
   
5. **Add Backup System**
   - Daily snapshots
   - Version control

---

## Quick Commands

```bash
# View source data
cat backend/data/raw/company_emails.csv

# Rebuild graph from CSV
cd backend
python scripts/load_real_data.py

# Inspect pickle
python3 << EOF
import pickle
with open('data/processed/knowledge_graph.pkl', 'rb') as f:
    graph = pickle.load(f)
    print(f"Nodes: {graph.number_of_nodes()}")
    print(f"Edges: {graph.number_of_edges()}")
EOF

# Check backend API
curl http://localhost:8000/graph | python -m json.tool

# Check graph stats
curl http://localhost:8000/health | python -m json.tool
```

---

## Summary

**Storage Stack**:
- **CSV** (source) → **Pickle** (compiled) → **RAM** (active) → **JSON** (display)

**Key Insight**: The graph lives in memory (RAM) for speed, backed by a pickle file for persistence. Changes in RAM are NOT auto-saved.

**Main Technology**: NetworkX DiGraph serialized with Python Pickle

**File Size**: 4.7 KB (very compact!)

---

**Questions?** Check `DATA_STORAGE.md` for the complete technical documentation.
