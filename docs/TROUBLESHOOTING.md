# Troubleshooting Guide

## Issue: "I don't see the company map"

### Quick Fixes

1. **Hard Refresh the Browser**
   - **Mac**: `Cmd + Shift + R`
   - **Windows/Linux**: `Ctrl + Shift + R`
   - This clears the cache and loads the latest CSS

2. **Check Browser Console**
   - Press `F12` to open DevTools
   - Look for any red errors in the Console tab
   - Common errors and solutions below

3. **Verify Backend is Running**
   ```bash
   curl http://localhost:8000/health
   ```
   Should return: `{"status":"ok",...}`

4. **Verify Frontend is Running**
   ```bash
   curl http://localhost:5173/
   ```
   Should return HTML content

---

## Common Issues

### 1. Graph Panel is Empty

**Symptoms**: You see the "Company Map" header but no visualization

**Causes & Solutions**:

✅ **Missing CSS Styles**
- The graph canvas needs specific CSS to be visible
- Solution: Styles have been added to `App.css`
- Hard refresh browser to load new styles

✅ **No Graph Data**
- Check if backend has loaded data
- Run: `curl http://localhost:8000/graph | python -m json.tool`
- Should show nodes and edges
- If empty, reload data:
  ```bash
  cd backend
  python scripts/load_real_data.py
  ```

✅ **ReactFlow Not Loading**
- Check browser console for errors
- Verify `reactflow` is installed:
  ```bash
  cd frontend
  npm list reactflow
  ```
- Reinstall if needed: `npm install reactflow`

### 2. Graph Shows But Nodes Are Scattered

**Symptoms**: Nodes appear but are poorly positioned

**Solution**: Click the "Fit View" button in the graph controls (bottom-right icon)

### 3. Very Few Connections

**Current State**: Graph has 72 nodes but only 7 edges

**Why**: The email dataset has limited explicit relationships

**To Add More Connections**:
1. Run demo scenarios to create more edges
2. Add more emails to `backend/data/raw/company_emails.csv`
3. Reload the graph:
   ```bash
   cd backend
   python scripts/load_real_data.py
   ```
4. Restart backend

### 4. Graph Loads Slowly

**Solutions**:
- Reduce node limit in `KnowledgeGraph.jsx` (currently 200)
- Use the filter buttons (People, Decisions, Topics)
- Clear browser cache

### 5. Graph Styling Issues

**If graph looks broken**:
1. Verify `App.css` has graph styles:
   ```bash
   grep "graph-canvas" frontend/src/App.css
   ```
2. Should show `.graph-canvas` with height and border
3. If missing, styles were added - hard refresh browser

---

## Checking System Status

### Quick Health Check
```bash
# Backend health
curl http://localhost:8000/health

# Graph data
curl http://localhost:8000/graph | python -c "import sys,json; d=json.load(sys.stdin); print(f'Nodes: {len(d.get(\"nodes\",[]))}  Edges: {len(d.get(\"edges\",[]))}')"

# Agents status
curl http://localhost:8000/agents/status
```

### View Graph Data Details
```bash
curl -s http://localhost:8000/graph | python -m json.tool | head -50
```

### Check Frontend Build
```bash
cd frontend
npm run build  # Check for build errors
```

---

## Browser Compatibility

### Tested Browsers
- ✅ Chrome 90+ (Recommended)
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Known Issues
- Safari < 14: Backdrop blur may not work
- Firefox: Minor CSS differences in glassmorphism

---

## Complete Reset

If nothing works, try a complete reset:

```bash
# 1. Stop all servers (Ctrl+C in terminals)

# 2. Clear frontend cache
cd frontend
rm -rf node_modules/.vite
rm -rf dist

# 3. Restart backend
cd ../backend
python main.py

# 4. In another terminal, restart frontend
cd ../frontend
npm run dev

# 5. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
```

---

## Getting Help

### Information to Include
When reporting issues, include:

1. **Browser & Version**: (e.g., Chrome 120)
2. **Error Messages**: From browser console (F12)
3. **Backend Status**: Output of `curl http://localhost:8000/health`
4. **Graph Data**: Output of graph data check above
5. **Screenshot**: If visual issue

### Useful Commands
```bash
# Backend logs
cd backend
tail -f logs/orgmind.log  # If logging is set up

# Frontend dev server output
# Check the terminal where you ran `npm run dev`

# Check terminal files
ls -la ~/.cursor/projects/*/terminals/
```

---

## Advanced Debugging

### Enable Verbose Logging

**Backend** (`backend/main.py`):
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

**Frontend** (Browser Console):
```javascript
localStorage.setItem('debug', 'orgmind:*')
```

### Inspect ReactFlow State

In browser console:
```javascript
// Check if ReactFlow is loaded
document.querySelector('.react-flow')

// Check nodes
document.querySelectorAll('.react-flow__node').length

// Check edges
document.querySelectorAll('.react-flow__edge').length
```

---

## Still Not Working?

1. Check this document is up to date
2. Review recent changes in git: `git log -5 --oneline`
3. Try rolling back CSS: 
   ```bash
   cd frontend/src
   cp App_Original.css App.css
   cp index_original.css index.css
   ```
4. Restart everything and try again

---

**Last Updated**: February 2026
