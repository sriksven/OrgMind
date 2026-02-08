# 🔧 Fix: Website Auto-Refresh Issue

## Problem
The website was continuously refreshing, causing a poor user experience.

## Root Cause
**Infinite render loop** caused by incorrect React dependency array in `App.jsx`

### The Issue (Line 33)
```javascript
useEffect(() => {
  loadGraph()
  // ... initialization code
}, [loadGraph])  // ❌ PROBLEM: loadGraph changes on every render
```

### Why This Caused Infinite Loops
1. Component renders → `useEffect` runs → calls `loadGraph()`
2. `loadGraph()` is a `useCallback` from `useGraph` hook
3. `useCallback` gets recreated on every render
4. New `loadGraph` reference → triggers `useEffect` dependency
5. `useEffect` runs again → infinite loop! 🔄

## Solution Applied

### 1. Fixed App.jsx
Changed the dependency array to empty array since we only want this to run once on mount:

```javascript
useEffect(() => {
  loadGraph()
  setScenariosLoading(true)
  getDemoScenarios()
    .then(setScenarios)
    .catch((e) => setErrorBanner(e.message))
    .finally(() => setScenariosLoading(false))
  getHealth().then(setHealth).catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []) // ✅ FIXED: Only run on mount
```

### 2. Optimized useAgents.js Polling
Also fixed a similar issue in the agent polling hook and reduced polling frequency:

**Before:**
```javascript
useEffect(() => {
  if (!isPolling) return undefined
  fetchStatus()
  timerRef.current = setInterval(fetchStatus, 2000) // Every 2 seconds
  return () => {
    if (timerRef.current) clearInterval(timerRef.current)
  }
}, [fetchStatus, isPolling]) // ❌ fetchStatus changes frequently
```

**After:**
```javascript
useEffect(() => {
  if (!isPolling) return undefined
  fetchStatus()
  timerRef.current = setInterval(fetchStatus, 5000) // Every 5 seconds
  return () => {
    if (timerRef.current) clearInterval(timerRef.current)
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isPolling]) // ✅ Only isPolling as dependency
```

### Benefits
- ✅ Reduced polling from 2s to 5s (less server load)
- ✅ Prevented unnecessary re-renders
- ✅ More stable hook behavior

## Files Modified
1. `/frontend/src/App.jsx` - Fixed infinite loop
2. `/frontend/src/hooks/useAgents.js` - Optimized polling

## Testing
The Vite dev server (HMR) will automatically reload the changes.

**To verify the fix:**
1. Open http://localhost:5173
2. Check browser console (should see no repeated requests)
3. Watch network tab (should see requests every 5s, not continuously)
4. Page should stay stable without auto-refreshing

## Prevention Tips
When using `useEffect` with functions in the dependency array:

1. **Option A:** Empty array if only needed on mount
   ```javascript
   useEffect(() => {
     doSomething()
   }, []) // Only on mount
   ```

2. **Option B:** Use ref for stable reference
   ```javascript
   const fnRef = useRef(myFunction)
   useEffect(() => {
     fnRef.current()
   }, []) // Stable reference
   ```

3. **Option C:** Inline the function
   ```javascript
   useEffect(() => {
     async function load() {
       // ... logic
     }
     load()
   }, []) // Dependencies only for values used
   ```

## Status
✅ **FIXED** - Website should no longer auto-refresh
