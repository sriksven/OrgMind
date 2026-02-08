# 🚀 OrgMind Quick Start Guide

## Running the Application

### Start Backend
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

Backend will be available at: **http://localhost:8000**

### Start Frontend
```bash
cd frontend
npm run dev
```

Frontend will be available at: **http://localhost:5173**

---

## 🔍 Quick Health Check

### Check Backend Status
```bash
curl http://localhost:8000/health
```

### Check Agents
```bash
curl http://localhost:8000/agents
```

### View Knowledge Graph
```bash
curl http://localhost:8000/graph
```

---

## 🎬 Running Demo Scenarios

### List Available Scenarios
```bash
curl http://localhost:8000/demo/scenarios
```

### Run Scenario 1 (Product Launch Delayed)
```bash
curl -X POST http://localhost:8000/demo/run/1
```

### Run Scenario 2 (Budget Conflict)
```bash
curl -X POST http://localhost:8000/demo/run/2
```

### Run Scenario 3 (Daily Summary)
```bash
curl -X POST http://localhost:8000/demo/run/3
```

### Run Scenario 4 (New Team Member)
```bash
curl -X POST http://localhost:8000/demo/run/4
```

---

## 📊 Monitoring

### Check Agent Status
```bash
curl http://localhost:8000/agents/status
```

### View Statistics
```bash
curl http://localhost:8000/stats
```

---

## 🛠️ Development

### Backend Development
```bash
cd backend
python scripts/test_agents.py  # Test agents
python scripts/build_graph.py  # Build graph
```

### Frontend Development
```bash
cd frontend
npm run build   # Production build
npm run preview # Preview production build
```

---

## 🌐 Access Points

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs
- **API Health:** http://localhost:8000/health

---

## 🔑 Environment Variables

### Backend (.env)
```bash
LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
OPENAI_API_KEY=your-key-here
OPENAI_MODEL=gpt-4o
```

### Frontend (.env)
```bash
VITE_API_BASE_URL=http://localhost:8000
```

---

## 📝 Common Commands

### Stop All Services
```bash
# Find and kill backend
ps aux | grep uvicorn | grep -v grep | awk '{print $2}' | xargs kill

# Find and kill frontend
ps aux | grep vite | grep -v grep | awk '{print $2}' | xargs kill
```

### Restart Services
```bash
# Terminal 1 - Backend
cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd frontend && npm run dev
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Check what's using port 8000
lsof -i :8000

# Check what's using port 5173
lsof -i :5173

# Kill process on port
kill -9 $(lsof -t -i:8000)
kill -9 $(lsof -t -i:5173)
```

### Dependencies Issues
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## ✅ Current Status

Both services are currently running:
- ✅ Backend: http://localhost:8000 (PID: 82052)
- ✅ Frontend: http://localhost:5173 (PID: 83191)
