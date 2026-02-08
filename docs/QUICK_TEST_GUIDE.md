# Quick Test Guide - New Features

## 🚀 Quick Start

Your application is running at: **http://localhost:5173/**

## 📋 Test Checklist

### 1. Verify Tab Navigation ✅

**Location**: Right sidebar (top of panel)

**Expected**: 4 tabs visible:
- 📋 Situation Brief (default)
- 🤖 AI Activity
- 📅 Timeline
- 🔍 Conflicts

**Test**:
```
✓ Click each tab
✓ Tab highlights when active
✓ Blue underline appears
✓ Content switches smoothly
```

---

### 2. Test Agent Activity Tab 🤖

**Steps**:
1. Click "AI Activity" tab
2. Ask a question: "Who is blocked?"
3. Watch processing indicator
4. Click on agent cards to expand

**Expected**:
```
✓ Processing spinner shows while loading
✓ 4 agent cards visible:
  - 🧠 Intelligence Agent (Blue)
  - 🔍 Critic Agent (Orange)
  - 💾 Memory Agent (Green)
  - 🎯 Router Agent (Purple)
✓ Cards show activity count
✓ Expanding shows reasoning steps
✓ Confidence badges (%) visible
✓ Timestamps displayed
```

**Screenshot locations** (for demo):
- Processing state
- Expanded Intelligence Agent
- All 4 agents with activity

---

### 3. Test Timeline Tab 📅

**Steps**:
1. Click "Timeline" tab
2. Scroll through events
3. Hover over events

**Expected**:
```
✓ Events grouped by:
  - Today
  - Yesterday  
  - Earlier
✓ Event types color-coded:
  - 📋 Decision (Blue)
  - 🛑 Blocker (Red)
  - 🎯 Routing (Purple)
✓ Relative times ("2h ago")
✓ Full timestamps on hover
✓ Smooth scroll
```

**If Empty**:
Timeline shows: "📭 No recent activity"
This is normal if no events yet.

---

### 4. Test Conflict Detection Tab 🔍

**Steps**:
1. Click "Conflicts" tab
2. Check status

**Expected (No Conflicts)**:
```
✓ Green check icon (✓)
✓ "No conflicts detected"
✓ "Critic agent is monitoring"
```

**Expected (With Conflicts)**:
```
✓ Orange warning indicator
✓ Conflict count badge
✓ Expandable conflict cards
✓ Side-by-side comparison
✓ Resolve/Dismiss buttons
```

**To Generate Conflicts** (optional):
See `docs/NEW_FEATURES_IMPLEMENTATION.md` for API calls.

---

### 5. Test Original Features Still Work ✅

**Situation Brief Tab**:
1. Click "Situation Brief" tab
2. Verify it loads normally
3. Test features:
   - Health score visible
   - Blockers display (if intelligence mode)
   - Actions work (click to test)
   - Close button (X) works

**Expected**:
```
✓ Everything works as before
✓ No breaking changes
✓ Smooth transition between tabs
```

---

## 🎬 Demo Scenarios

### Scenario 1: "Show Agent Reasoning"
```
1. Open app
2. Type: "Who is blocked?"
3. Click "Ask Organization"
4. Switch to "AI Activity" tab
5. Expand "Intelligence Agent"
6. Point out: "See the AI analyzing step-by-step"
```

### Scenario 2: "What Changed Today?"
```
1. Switch to "Timeline" tab
2. Point to "Today" section
3. Show color-coded events
4. Explain: "Living timeline of org changes"
```

### Scenario 3: "Conflict Detection"
```
1. Switch to "Conflicts" tab
2. Show "All Clear" status
3. Explain: "Critic agent monitors for contradictions"
4. (If conflicts exist, show comparison)
```

---

## 🐛 Troubleshooting

### Issue: Tabs not showing
**Fix**: 
```bash
# Refresh browser
Cmd+R (Mac) or Ctrl+R (Windows)

# Check console for errors
F12 → Console tab
```

### Issue: Agent Activity empty
**Reason**: No queries run yet
**Fix**: Ask a question first

### Issue: Timeline empty
**Reason**: No recent events
**Normal**: Will populate as you use the system

### Issue: CSS looks broken
**Fix**:
```bash
# Hard refresh
Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

---

## 📸 Screenshots for Demo

### Key Screenshots to Capture:

1. **Tab Navigation**
   - All 4 tabs visible at top
   - Active tab highlighted

2. **Agent Activity - Processing**
   - Spinner animation
   - "Agents analyzing..." text

3. **Agent Activity - Expanded**
   - Intelligence Agent showing steps
   - Confidence scores visible
   - Timestamps shown

4. **Timeline - Populated**
   - Multiple events grouped
   - Color-coded types
   - "Today" section prominent

5. **Conflicts - All Clear**
   - Green check icon
   - Clean status message

6. **Conflicts - Detected** (if available)
   - Orange warning
   - Expanded comparison
   - Resolution options

---

## ✨ Key Points to Emphasize

### For Judges:
1. **"Visualizing agentic AI reasoning"** - Agent Activity tab
2. **"What changed today?"** - Timeline tab
3. **"Conflict detection"** - Conflicts tab
4. **Multi-agent coordination** - 4 agents working together
5. **Professional UI** - Smooth animations, clean design

### Technical Highlights:
- Real-time reasoning logs
- Versioned timeline
- Confidence scoring
- Side-by-side conflict comparison
- Color-coded severity levels

---

## 🎯 Success Criteria

### Must Work:
- [x] All 4 tabs clickable
- [x] Situation Brief still functions
- [x] Agent Activity shows reasoning
- [x] Timeline displays events
- [x] Conflicts shows status

### Should Work:
- [x] Smooth animations
- [x] Proper colors/styling
- [x] Expandable cards
- [x] Confidence badges
- [x] Timestamps

### Nice to Have:
- [x] Processing indicators
- [x] Hover effects
- [x] Custom scrollbars
- [x] Glow effects on icons

---

## 📝 Notes for Presentation

### Opening (15 seconds):
"OrgMind has 4 AI agents working as your Chief of Staff. Let me show you their reasoning in real-time."

### Demo (2 minutes):
1. Ask question → Show processing
2. Agent Activity → Expand reasoning
3. Timeline → Show changes
4. Conflicts → Show monitoring

### Closing (15 seconds):
"This is organizational intelligence - not just Q&A, but AI that sees, understands, and coordinates your company's information flow."

---

## 🚨 Pre-Demo Checklist

Before presenting:
- [ ] Browser at http://localhost:5173/
- [ ] Backend running (check http://localhost:8000/health)
- [ ] Test question ready: "Who is blocked?"
- [ ] Know which tabs to show
- [ ] Screenshots captured (backup)
- [ ] Console cleared (F12 → Clear)
- [ ] Network stable

---

## 📚 Reference Documents

Detailed docs at:
- `docs/NEW_FEATURES_IMPLEMENTATION.md` - Full feature guide
- `docs/IMPLEMENTATION_COMPLETE.md` - Summary & status
- `docs/OPENAI_CHALLENGE_EVALUATION.md` - Challenge criteria

---

## Last Updated
February 8, 2026

**Status**: ✅ READY FOR TESTING
