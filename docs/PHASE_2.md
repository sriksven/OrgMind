# Phase 2 — Real Data & Knowledge Graph Construction (Enron)

Goal: download real Enron emails, extract entities with OpenAI (GPT-4o), and build a knowledge graph that the API can serve.

## 1) Put the raw dataset in place

Download the Enron dataset CSV from Kaggle and place it here:

`backend/data/raw/enron_emails.csv`

Notes:
- This file is large and is gitignored (`backend/.gitignore`).

## 2) Filter to a manageable subset (10k)

```bash
python backend/data_pipeline/load_enron.py \
  --input backend/data/raw/enron_emails.csv \
  --output backend/data/processed/enron_10k.csv
```

## 3) Select the most “important” emails (top 200)

```bash
python backend/data_pipeline/select_important.py \
  --input backend/data/processed/enron_10k.csv \
  --output backend/data/processed/enron_200.csv
```

## 4) Inspect the sample

```bash
python backend/scripts/inspect_enron.py --csv backend/data/processed/enron_200.csv
```

## 5) Extract entities with OpenAI (first 100)

Make sure `backend/.env` exists and contains `OPENAI_API_KEY`.

```bash
python backend/scripts/extract_entities.py \
  --input backend/data/processed/enron_200.csv \
  --output backend/data/processed/enron_entities.json \
  --limit 100 \
  --batch-size 10 \
  --sleep 1
```

## 6) Build the knowledge graph

```bash
python backend/scripts/build_graph.py \
  --emails backend/data/processed/enron_200.csv \
  --entities backend/data/processed/enron_entities.json \
  --output backend/data/processed/knowledge_graph.pkl
```

## 7) Export for ReactFlow (optional)

```bash
python backend/scripts/export.py \
  --graph backend/data/processed/knowledge_graph.pkl \
  --output backend/data/processed/graph_viz.json
```

## 8) Serve the graph via the API

When `backend/data/processed/knowledge_graph.pkl` exists, the backend loads it on startup automatically.

```bash
cd backend
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Check:
- `GET /health` includes `"graph_loaded": true`
- `GET /graph` returns `{ "nodes": [...], "edges": [...] }`
