# Phase 1 — Project Foundation & Setup

Goal: a working dev environment with backend + frontend running locally.

## What You Get

- Backend API running (FastAPI + Uvicorn)
- Frontend dev server running (React + Vite)
- Frontend ↔ backend connectivity working
- Environment variable templates for local development

## Repo Structure

```
backend/   # FastAPI API + agents + graph + pipeline
frontend/  # React + Vite UI
docs/      # Architecture/API/demo + phase notes
```

## Prerequisites

- `pyenv` installed (recommended)
- Python 3.12+ (this repo uses `.python-version`)
- Node.js 18+ and npm

## Backend Setup (pyenv)

From the repo root:

```bash
# If you don't already have Python 3.12.9 installed in pyenv:
pyenv install 3.12.9

# Create the project virtualenv
pyenv virtualenv 3.12.9 orgmind

# Pin the repo to this env (creates/updates .python-version)
pyenv local orgmind
```

Install deps:

```bash
pip install -r backend/requirements.txt
```

### Backend env vars

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and set any secrets (e.g. `OPENAI_API_KEY`). This file is ignored by git (see `backend/.gitignore`).

### Start backend

```bash
cd backend
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Health check:

```bash
curl http://127.0.0.1:8000/health
```

Useful URLs:

- API: `http://127.0.0.1:8000`
- Docs: `http://127.0.0.1:8000/docs`

## Frontend Setup

```bash
cd frontend
npm install
```

### Frontend env vars (optional)

```bash
cp frontend/.env.example frontend/.env
```

By default the UI talks to `http://localhost:8000`. You can override with `VITE_API_BASE_URL`.

### Start frontend

```bash
npm run dev
```

Open: `http://localhost:5173`

## Validation Checklist

- Backend:
  - `GET /health` returns `{"status":"ok","service":"orgmind"}`
  - `GET /graph` returns `{"nodes":[...],"edges":[...]}`
- Frontend:
  - Loads at `http://localhost:5173`
  - Calls the backend successfully (no CORS errors)

## Notes

- Vite proxy is configured in `frontend/vite.config.js` for `/api → http://localhost:8000`.
- Backend CORS origins come from `CORS_ORIGINS` in `backend/.env` (comma-separated).
