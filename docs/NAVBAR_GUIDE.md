# Navigation Bar with AI Agents

## Overview

The new navbar provides a clean, professional interface with AI agents accessible via a dropdown panel.

---

## What It Looks Like

```
┌─────────────────────────────────────────────────────────────┐
│ 🧠 OrgMind    [👥 72 | 📋 14 | 🔗 7]    🤖 AI Activity ▼  ⚡│
└─────────────────────────────────────────────────────────────┘
```

---

## Features

### 1. **Logo** (Left)
- 🧠 Brain icon + "OrgMind" text
- Gradient purple/blue branding

### 2. **Quick Stats** (Center)
- **Clickable** stats pill
- Shows:
  - 👥 People count
  - 📋 Decisions tracked
  - 🔗 Connections
- Click to toggle AI activity panel

### 3. **AI Activity Button** (Right)
- 🤖 Icon + "AI Activity" text
- Dropdown chevron (▼)
- Click to show/hide AI agents
- Smooth animation

### 4. **Mode Toggle** (Right)
- Switch between Simple/Advanced
- Gradient purple button
- ⚡ Advanced or ✨ Simple

---

## AI Activity Dropdown

When you click "AI Activity" or the stats, a panel slides down showing:

### Memory Keeper 🧠
- **Purple** left border
- Remembers everything about your company
- Shows:
  - Tasks completed
  - Success rate
  - Recent activity (last 2 items)
  - ACTIVE/IDLE status

### Smart Router 🎯  
- **Blue** left border
- Figures out who needs to know what
- Shows routing decisions

### Fact Checker 🔍
- **Orange** left border
- Catches mistakes and conflicts
- Shows conflict checks

---

## Layout Structure

```
┌─ NAVBAR (Sticky) ─────────────────────────────────────────┐
│  Logo          Stats (clickable)         Actions          │
├───────────────────────────────────────────────────────────┤
│  [AI Activity Dropdown - appears when toggled]            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│  │ Memory   │  │ Router   │  │ Critic   │                │
│  │ Keeper   │  │          │  │          │                │
│  └──────────┘  └──────────┘  └──────────┘                │
└───────────────────────────────────────────────────────────┘

┌─ HEADER ──────────────────────────────────────────────────┐
│  Your Company Brain                                        │
│  See who knows what, track decisions...                   │
└───────────────────────────────────────────────────────────┘

┌─ MAIN CONTENT ────────────────────────────────────────────┐
│  Left Panel         │  Company Map (Graph)                │
│  - Examples         │                                      │
│  - Ask Anything     │                                      │
└─────────────────────┴──────────────────────────────────────┘
```

---

## Benefits

### ✅ Space Efficiency
- Removed bulky side panel
- Agents accessible but not intrusive
- More room for graph visualization

### ✅ Professional Look
- Familiar navbar pattern
- Clean, modern design
- Matches standard web apps

### ✅ Better UX
- Stats always visible
- One-click access to AI activity
- Smooth animations
- Responsive design

### ✅ Less Clutter
- Agents hidden by default
- Only show when needed
- Cleaner main workspace

---

## Components

### Files Created
1. **`Navbar.jsx`** - Main navbar component
2. **`Navbar.css`** - Navbar styles

### Files Modified
1. **`App.jsx`** - Integrated navbar, removed AgentPanel
2. **`App.css`** - Updated layout for navbar

---

## Code Structure

### Navbar Component

```jsx
<Navbar 
  agentStatus={agentStatus}      // Agent data from backend
  agentLoading={agentLoading}    // Loading state
  simpleMode={simpleMode}        // Simple/Advanced toggle
  onToggleMode={() => ...}       // Mode switch handler
  stats={stats}                  // People, decisions, links
/>
```

### Key Features

1. **Sticky Positioning**
   ```css
   position: sticky;
   top: 0;
   z-index: 100;
   ```

2. **Smooth Dropdown**
   ```jsx
   <AnimatePresence>
     <motion.div
       initial={{ height: 0, opacity: 0 }}
       animate={{ height: 'auto', opacity: 1 }}
       exit={{ height: 0, opacity: 0 }}
     />
   </AnimatePresence>
   ```

3. **Agent Status Badges**
   ```jsx
   <span className={`status-badge ${active ? 'active' : 'idle'}`}>
     {active ? 'ACTIVE' : 'IDLE'}
   </span>
   ```

---

## Styling Details

### Colors
- **Memory Agent**: Purple (#8b5cf6)
- **Router Agent**: Blue (#3b82f6)
- **Critic Agent**: Orange (#f59e0b)

### Animations
- Dropdown: 0.3s ease
- Hover effects: 0.2s cubic-bezier
- Chevron rotation: 180deg when open

### Responsive
- Desktop: 3-column agent grid
- Tablet: Single column
- Mobile: Stacked stats, full-width buttons

---

## How to Use

### View AI Activity
1. Click "AI Activity" button (top right)
2. OR click the stats pill (center)
3. Panel slides down with agent cards

### Hide AI Activity
1. Click "AI Activity" button again
2. OR click outside the dropdown
3. Panel slides up smoothly

### Switch Modes
1. Click mode toggle button (right)
2. Switches between Simple ↔ Advanced
3. Updates all UI text and details

---

## Interactions

### Stats Pill (Center)
```
[👥 72 | 📋 14 | 🔗 7]
  ↓ Click
Opens AI Activity Panel
```

### AI Activity Button
```
[🤖 AI Activity ▼]
  ↓ Click
Toggles dropdown
Chevron rotates 180°
```

### Agent Cards
```
┌─────────────────────┐
│ 🧠 Memory Keeper    │ ACTIVE
│ Remembers...        │
├─────────────────────┤
│ Tasks: 5  Success: 100% │
├─────────────────────┤
│ • Updated knowledge │
│ • OpenAI extracted  │
└─────────────────────┘
  ↓ Hover
Lifts up, shadow increases
```

---

## Responsive Behavior

### Desktop (> 1200px)
- Full navbar with all elements
- 3-column agent grid
- Stats centered

### Tablet (768px - 1200px)
- Stats wrap below logo
- Single column agent grid
- Buttons remain horizontal

### Mobile (< 768px)
- Stacked layout
- Full-width stats
- Full-width buttons
- Compact agent cards

---

## State Management

### Local State
```javascript
const [showAgents, setShowAgents] = useState(false)
```

### Props Received
- `agentStatus` - Real-time agent data
- `agentLoading` - Loading indicator
- `simpleMode` - UI mode
- `onToggleMode` - Mode switch callback
- `stats` - Graph statistics

---

## Animation Details

### Dropdown
```javascript
initial={{ height: 0, opacity: 0 }}
animate={{ height: 'auto', opacity: 1 }}
exit={{ height: 0, opacity: 0 }}
transition={{ duration: 0.3 }}
```

### Chevron
```css
transform: rotate(0deg);    /* Closed */
transform: rotate(180deg);  /* Open */
transition: transform 0.3s ease;
```

### Cards
```css
transform: translateY(0);     /* Default */
transform: translateY(-2px);  /* Hover */
box-shadow: 0 8px 20px ...;   /* Hover */
```

---

## Accessibility

### ARIA Labels
- Button titles for tooltips
- Aria-label on stats button
- Status badges with semantic colors

### Keyboard Navigation
- Tab through navbar elements
- Enter/Space to toggle dropdown
- Escape to close dropdown (TODO)

### Focus States
- Visible focus rings
- High contrast borders
- Keyboard-friendly

---

## Future Enhancements

### 1. Search Bar
Add global search in navbar center:
```jsx
<input placeholder="Search people, decisions..." />
```

### 2. Notifications Badge
Show unread count on AI Activity:
```jsx
<button>
  🤖 AI Activity {unreadCount > 0 && <span>{unreadCount}</span>}
</button>
```

### 3. User Profile
Add user avatar/menu on far right:
```jsx
<div className="user-menu">
  <img src={avatar} />
  <span>{userName}</span>
</div>
```

### 4. Keyboard Shortcuts
```javascript
// ESC to close dropdown
// Cmd+K to open search
// Cmd+/ to toggle agents
```

---

## Troubleshooting

### Navbar Not Showing
1. Hard refresh: `Cmd+Shift+R`
2. Check imports in `App.jsx`
3. Verify `Navbar.css` is imported

### Dropdown Not Working
1. Check `framer-motion` is installed
2. Verify state management
3. Check z-index conflicts

### Stats Not Updating
1. Verify `stats` prop is passed
2. Check `useGraph` hook
3. Refresh backend data

---

## Summary

**What Changed**:
- ❌ Removed: Bulky side agent panel
- ✅ Added: Clean navigation bar
- ✅ Added: Collapsible AI activity dropdown
- ✅ Improved: Space utilization
- ✅ Enhanced: Professional appearance

**Result**: A modern, professional interface with AI agents accessible but not intrusive!

---

**Last Updated**: February 2026
