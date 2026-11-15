# CRUX Fitness App - Phase 6 Profile Section Design Guidelines

## Design Approach
**System:** Custom fitness-focused design system inspired by Strava's clean data presentation + Apple HIG's clarity, built on emerald green foundation. Focus on scannable information hierarchy and effortless interaction patterns.

---

## Color Palette

**Primary (Emerald Green):**
- Primary: 160 84% 39% (emerald-600)
- Primary Hover: 160 84% 35%
- Primary Light: 160 84% 96% (for light mode backgrounds)
- Primary Dark: 160 84% 24% (for dark mode accents)

**Neutrals:**
- Dark Mode Base: 222 47% 11% (slate-900)
- Dark Mode Surface: 217 33% 17% (slate-800)
- Dark Mode Elevated: 215 25% 27% (slate-700)
- Light Mode Base: 0 0% 100%
- Light Mode Surface: 220 14% 96%

**Semantic:**
- Success: 142 71% 45% (green stats/achievements)
- Warning: 38 92% 50% (goals approaching)
- Info: 199 89% 48% (activity highlights)

---

## Typography

**Families:**
- Headlines: Inter (600-700 weight)
- Body: Inter (400-500 weight)
- Stats/Numbers: JetBrains Mono (500-600 weight)

**Scale:**
- Tab Labels: text-sm font-medium
- Section Headers: text-lg font-semibold
- Stat Values: text-3xl font-semibold (JetBrains Mono)
- Stat Labels: text-xs uppercase tracking-wide
- Body Text: text-sm
- Debug Labels: text-xs font-mono

---

## Layout System

**Spacing Primitives:** Use Tailwind units 2, 4, 6, 8, 12, 16 consistently
- Component padding: p-6
- Card internal spacing: p-4
- Section gaps: space-y-6
- Grid gaps: gap-4

**Container Structure:**
- Max width: max-w-4xl mx-auto
- Page padding: px-4 md:px-6
- Mobile-first responsive breakpoints

---

## Component Specifications

### Tab Navigation
**Layout:** Full-width horizontal scrollable bar, sticky top
- Background: Dark mode slate-800, Light mode white
- Border bottom: 1px slate-700/slate-200
- Tab items: Flex row, gap-8, px-6 py-4
- Active state: Emerald-600 bottom border (3px), emerald-600 text
- Inactive state: Slate-400 text, hover slate-300
- Smooth slide indicator underneath active tab

### Stats Cards
**Grid Layout:** 2-column on mobile, 4-column on desktop (grid-cols-2 lg:grid-cols-4 gap-4)
**Card Structure:**
- Background: Dark mode slate-800, Light mode white
- Border: 1px slate-700/slate-200
- Padding: p-4
- Rounded: rounded-xl
- Stat value: Top, text-3xl emerald-500 (JetBrains Mono)
- Label: Below value, text-xs uppercase slate-400
- Icon: Top-right corner, 20x20, emerald-500/30 opacity

### Avatar & Badge Selection
**Avatar Display:** 
- Size: 96x96 circle, center aligned
- Border: 3px emerald-600 with pulse animation on active badge
- Background: Gradient emerald-500 to emerald-700

**Badge Grid:**
- Grid: grid-cols-4 md:grid-cols-6 gap-3
- Badge item: 64x64 rounded-lg, clickable
- Selected: Ring-2 emerald-500, scale-105 transform
- Unselected: opacity-60, grayscale hover:opacity-100
- Lock overlay: Slate-900/80 backdrop with lock icon for locked badges

### Theme Selector
**Implementation:** Segmented control (button group)
- Container: Inline-flex rounded-full bg-slate-700/50 p-1
- Buttons: px-4 py-2 rounded-full transition-all
- Active: bg-emerald-600 text-white shadow-lg
- Inactive: text-slate-300 hover:text-white
- Options: Light / Dark / Auto with icons

### Settings List
**Layout:** Vertical stack, space-y-2
- Item structure: Flex row justify-between, p-4, rounded-lg
- Background: Hover bg-slate-700/50
- Label: Left, text-sm
- Control: Right (toggle/chevron/value)
- Dividers: 1px slate-700 between major sections

### Debug Panel
**Layout:** Collapsible accordion style
- Header: Flex row, bg-slate-800, p-4, cursor-pointer
- Content: Grid 2-column on desktop, gap-4, p-4
- Debug items: Key-value pairs, font-mono text-xs
- Actions: Button group at bottom, destructive actions in red-600
- Copy buttons: Small, outline variant next to values

---

## Interaction Patterns

**Transitions:** 200ms ease-in-out for state changes
**Shadows:** 
- Elevated: shadow-lg on cards
- Active: shadow-xl shadow-emerald-500/20 on interactive elements

**Focus States:** 2px emerald-500 ring, ring-offset-2 slate-900

**Loading States:** Pulse animation on skeleton cards matching layout structure

---

## Images
**No hero images required** - This is an app profile section, not a landing page. Avatar is user-uploaded circular photo. Badge icons are SVG graphics from Heroicons (trophy, star, fire, etc.).