# OrgMind UI - Visual Design Guide

## Design Philosophy

**Modern • Professional • Accessible**

The new UI embraces contemporary design principles with a focus on:
- Visual hierarchy and readability
- Smooth, purposeful animations  
- Premium glassmorphism effects
- Consistent spacing and rhythm
- Delightful micro-interactions

---

## Color Palette

### Primary Colors
```
Primary:       #667eea  ████  (Purple-Blue)
Primary Dark:  #5568d3  ████  (Deeper Purple)
Primary Light: #8190f2  ████  (Lighter Blue)
Secondary:     #764ba2  ████  (Rich Purple)
```

### Semantic Colors
```
Success:  #10b981  ████  (Green)
Warning:  #f59e0b  ████  (Amber)
Error:    #ef4444  ████  (Red)
```

### Text Colors
```
Primary:    #111827  ████  (Near Black)
Secondary:  #6b7280  ████  (Gray)
Muted:      #9ca3af  ████  (Light Gray)
```

### Background Colors
```
Primary:    #ffffff  ████  (White)
Secondary:  #f9fafb  ████  (Off White)
Tertiary:   #f3f4f6  ████  (Light Gray)
```

---

## Typography

### Font Family
- **Primary**: Inter (weights: 400, 500, 600, 700, 800)
- **Fallback**: -apple-system, BlinkMacSystemFont, Segoe UI

### Scale
```
H1: 2.5rem  (40px) - 800 weight - Main page title
H2: 1.875rem (30px) - 700 weight - Section headers
H3: 1.5rem   (24px) - 700 weight - Panel titles
H4: 1.25rem  (20px) - 700 weight - Card titles
Body: 1rem   (16px) - 400 weight - Default text
Small: 0.875rem (14px) - Text in cards/metrics
```

### Special Effects
- Gradient text for major headings
- Letter-spacing: -0.01em for headings
- Line-height: 1.6 for body text

---

## Spacing System

### Consistent Scale
```
XS:  0.5rem  (8px)
SM:  1rem    (16px)
MD:  1.5rem  (24px)
LG:  2rem    (32px)
XL:  2.5rem  (40px)
2XL: 3rem    (48px)
```

### Component Padding
- **Panels**: 2.5rem (40px)
- **Cards**: 1.5-2rem (24-32px)
- **Buttons**: 1rem × 2rem (16px × 32px)
- **Inputs**: 1.25rem × 1.5rem

---

## Border Radius

### Scale
```
XS:  6px   - Small elements
SM:  10px  - Compact cards
MD:  14px  - Buttons, inputs
LG:  18px  - Cards
XL:  20px  - Major panels
Round: 999px - Pills, badges
```

---

## Shadows

### Depth System
```
XS: 0 1px 2px rgba(0,0,0,0.05)    - Subtle lift
SM: 0 2px 4px rgba(0,0,0,0.06)    - Small cards
MD: 0 8px 16px rgba(0,0,0,0.08)   - Standard elevation
LG: 0 16px 32px rgba(0,0,0,0.12)  - Hover states
XL: 0 24px 48px rgba(0,0,0,0.16)  - Major panels
```

### Special Shadows
- Primary button: `0 8px 20px rgba(102, 126, 234, 0.3)`
- Success pill: `0 4px 12px rgba(16, 185, 129, 0.3)`

---

## Animation Guidelines

### Timing Functions
```
Fast:   0.15s cubic-bezier(0.4, 0, 0.2, 1)  - Micro-interactions
Normal: 0.25s cubic-bezier(0.4, 0, 0.2, 1)  - Standard transitions
Slow:   0.4s cubic-bezier(0.4, 0, 0.2, 1)   - Page transitions
```

### Transform Principles
- Use `transform` for performance (GPU-accelerated)
- Prefer `translateY` for lifts
- Use `translateX` for slides
- Apply `scale` sparingly

### Hover Effects
```
Cards:   translateY(-6px) + shadow-lg
Buttons: translateY(-3px) + enhanced shadow
Metrics: translateY(-4px) + color tint shadow
```

---

## Component Patterns

### Glassmorphism
```css
background: rgba(255, 255, 255, 0.98);
backdrop-filter: blur(24px);
border: 1px solid rgba(255, 255, 255, 0.5);
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
```

### Gradient Overlays
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Gradient Text
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

### Accent Borders
```css
border-top: 5px solid;
border-image: linear-gradient(90deg, #667eea, #764ba2) 1;
```

---

## Interactive States

### Button States
```
Default:  Primary gradient + shadow
Hover:    Lift -3px + enhanced shadow
Active:   Lift -1px
Disabled: opacity: 0.5
```

### Card States
```
Default:  White bg + border
Hover:    Lift + accent color border
Active:   Top gradient bar reveal
```

### Input States
```
Default:  Gray border
Focus:    Primary border + ring shadow
Error:    Red border + red ring
```

---

## Responsive Breakpoints

### Breakpoints
```
Mobile:   < 768px
Tablet:   768px - 1100px
Desktop:  1100px - 1400px
Wide:     > 1400px
```

### Layout Changes
- **< 768px**: Single column, stacked layout
- **768-1100px**: Reduced gaps, smaller panels
- **> 1100px**: Two-column grid layout
- **> 1400px**: Full width with max 1920px

---

## Accessibility

### Focus Indicators
- 3px solid outline
- Primary color with 50% opacity
- 2px offset from element

### Color Contrast
- Text/Background: Minimum 4.5:1
- Large Text: Minimum 3:1
- UI Components: Minimum 3:1

### Touch Targets
- Minimum 44×44px for mobile
- Generous padding on all interactive elements

---

## Performance Optimizations

### CSS Best Practices
- Use `transform` and `opacity` for animations
- Avoid animating `width`, `height`, `top`, `left`
- Enable hardware acceleration with `will-change`
- Use `backdrop-filter` sparingly

### Loading States
- Skeleton screens with shimmer animation
- Spinner with smooth rotation
- Progressive content reveal

---

## Usage Examples

### Primary Button
```jsx
<button className="btn primary">
  Submit Query
</button>
```

### Card with Hover
```jsx
<div className="scenario-card">
  <h4 className="scenario-title">Budget Analysis</h4>
  <p className="scenario-desc">Detect conflicts...</p>
</div>
```

### Metric Display
```jsx
<div className="metric">
  <span>Nodes</span>
  <strong>72</strong>
</div>
```

### Status Pill
```jsx
<span className="status-pill active">
  Active
</span>
```

---

## Quick Reference

### Class Names
```
.btn.primary          - Primary action button
.btn.secondary        - Secondary action button
.glass                - Glassmorphism panel
.scenario-card        - Interactive scenario card
.agent-card           - Agent status card
.metric               - Numeric metric display
.status-pill.active   - Active status indicator
.reasoning-item       - Reasoning step display
.processing           - Loading indicator
```

---

## Implementation Notes

1. **Always use CSS variables** from `:root` for consistency
2. **Test hover states** on all interactive elements
3. **Verify responsive design** at all breakpoints
4. **Check accessibility** with keyboard navigation
5. **Optimize animations** for smooth 60fps performance

---

**Last Updated**: February 2026
**Version**: 2.0 Enhanced
