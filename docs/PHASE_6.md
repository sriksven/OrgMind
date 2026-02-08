# Phase 6 — Deployment to Production

Goal: deploy backend to Railway and frontend to Vercel with public URLs.

## Files Added

- `backend/railway.json`
- `backend/Procfile`
- `frontend/vercel.json`
- `frontend/.env.production`

## Backend Notes

### CORS

Updated in `backend/main.py`:
- `http://localhost:5173`
- `https://orgmind.vercel.app`
- Any Vercel preview domain via `allow_origin_regex` (`https://*.vercel.app`)

### Environment Variables

`backend/.env.example` now supports:
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (default: `gpt-4o`)

## Railway Deployment (Manual)

1. Create Railway project from GitHub repo.
2. Set env:
   - `OPENAI_API_KEY`
   - `ENVIRONMENT=production`
3. Deploy using `backend/railway.json` / `backend/Procfile`.
4. Validate:
   - `GET /health`
   - `GET /graph`
   - `GET /demo/scenarios`

## Vercel Deployment (Manual)

1. Import repo into Vercel.
2. Root: `frontend`
3. Build: `npm run build`
4. Output: `dist`
5. Env:
   - `VITE_API_BASE_URL=https://orgmind-production.up.railway.app`

## URLs (Expected)

- Backend: `https://orgmind-production.up.railway.app`
- Frontend: `https://orgmind.vercel.app`

