# How Viking Atlas Works

A technical walkthrough of the React + TypeScript + D3 application.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Data Layer](#data-layer)
5. [Component Architecture](#component-architecture)
6. [The Map (React + D3)](#the-map-react--d3)
7. [The Timeline Slider](#the-timeline-slider)
8. [The Sidebar & Chronicle](#the-sidebar--chronicle)
9. [The Info Panel](#the-info-panel)
10. [Styling System](#styling-system)
11. [Adding New Events](#adding-new-events)

---

## Overview

Viking Atlas is an interactive historical map that lets you travel through the Viking Age (750–1100 AD) using a timeline slider. As you advance the year, map hotspots progressively appear at their real geographic coordinates — each one clickable for a detailed description. A sidebar provides filter controls and a scrollable **Chronicle** of scholarly events sourced from *The Age of the Vikings* (Winroth, 2016).

The application renders entirely in the browser. There is no backend, no database, and no API calls at runtime. All data is compiled TypeScript, and all map geometry is computed client-side using D3.

---

## Tech Stack

| Tool | Role |
|------|------|
| **React 18** | UI component tree, declarative rendering, state management |
| **TypeScript** | Strict typing for all data models and component props |
| **Vite** | Dev server and production bundler |
| **D3 (d3-geo, d3-zoom)** | Map projection math and zoom transforms — *not* DOM manipulation |
| **Vanilla CSS** | Design system via CSS custom properties (no framework) |
| **clsx** | Conditional className utility |

---

## Project Structure

```
viking-atlas-v2/
├── index.html                  # Entry point
├── src/
│   ├── main.tsx                # React root mount
│   ├── App.tsx                 # Global state, layout
│   ├── App.css                 # Full design system (tokens + all components)
│   ├── index.css               # Global resets
│   ├── types.ts                # Shared TypeScript interfaces
│   │
│   ├── data/
│   │   ├── vikingData.ts       # Map events, routes, eras (the "main" dataset)
│   │   └── timelineEntries.ts  # Scholarly chronicle entries (sidebar-only)
│   │
│   └── components/
│       ├── Header.tsx          # Top bar: title, year, era name
│       ├── Timeline.tsx        # Bottom slider
│       ├── Sidebar.tsx         # Tabbed panel: Filters + Chronicle
│       ├── Badge.tsx           # Reusable colored tag pill
│       ├── ChronicleEntry.tsx  # Single chronicle card
│       ├── InfoPanel.tsx       # Slide-in detail panel (map click)
│       └── Map/
│           ├── MapContainer.tsx    # SVG map, routes, hotspots
│           └── ZoomControls.tsx    # +/−/reset buttons
│
└── data/
    └── timelinevikings.md      # Source material (reference only)
```

---

## Data Layer

There are **two separate but related datasets**.

### 1. `vikingData.ts` — Map Data

This drives everything visual on the map. It exports three constants:

```ts
EVENTS: VikingEvent[]   // hotspots on the map
ROUTES: Route[]         // animated lines between points
ERAS: Era[]             // named historical periods
```

**`VikingEvent`** is the core type:

```ts
interface VikingEvent {
  id: string;
  year: number;           // when it becomes visible on the map
  coords: [lng, lat];     // geographic position (D3 uses [lng, lat] order)
  title: string;
  date: string;           // human-readable, e.g. "June 8, 793 AD"
  tag: string;            // display label for the badge, e.g. "Raid"
  body: string;           // prose description shown in the InfoPanel
  type: EventType;        // controls the dot color and filter behaviour
  routes?: string[];      // IDs of Route objects to activate with this event
}
```

**`Route`** is a polyline drawn on the map:

```ts
interface Route {
  id: string;
  type: 'raid' | 'exploration' | 'trade';
  points: [lng, lat][];   // sequence of geographic coordinates
}
```

Routes stay invisible (opacity 0) until an event that references them becomes active. They then animate with a dashed, glowing stroke.

**`EventType`** is a union that both controls map dot colours and links map events to sidebar filters:

```ts
type EventType =
  | 'origin'
  | 'raid'
  | 'settlement'
  | 'trade'
  | 'conquest'
  | 'exploration'
  | 'battle';
```

---

### 2. `timelineEntries.ts` — Chronicle Data

This is the scholarly layer, derived from *The Age of the Vikings* (Winroth, 2016). It has its own type:

```ts
interface TimelineEntry {
  id: string;
  year: number;
  date: string;           // display date, e.g. "c. 800 AD"
  title: string;
  body: string;           // full explanatory paragraph
  source: string;         // chapter citation
  tags: EventType[];      // one or more tags — used for filter linking
}
```

Chronicle entries are **not** shown on the map — they have no coordinates. They live only in the sidebar Chronicle tab. However, their `tags` array mirrors `EventType`, so they are filtered in/out in sync with the map filter toggles.

> **Relationship between the two datasets:** For events that *do* have a real geographic location (e.g. the Sack of Nantes), there is *both* a `VikingEvent` in `vikingData.ts` (for the map hotspot) *and* a `TimelineEntry` in `timelineEntries.ts` (for the scholarly sidebar card). The two share the same `year` and thematic `tags`, but exist independently.

---

## Component Architecture

State flows top-down from `App.tsx`. No external state library is needed.

```
App
├── currentYear: number           ← drives map visibility + header
├── selectedEvent: VikingEvent    ← drives InfoPanel open/closed
├── activeFilters: EventType[]    ← drives map + sidebar Chronicle
├── isHomeVisible: boolean        ← controls the About overlay (HomeSplash)
│
├── <Header currentYear />
├── <Sidebar activeFilters onToggleFilter />
├── <MapContainer currentYear events routes activeFilters onEventClick />
├── <InfoPanel event onClose />
└── <Timeline currentYear onYearChange />
```

### How state flows

1. **User drags the slider** → `Timeline` calls `onYearChange(n)` → `App` sets `currentYear` → `MapContainer` re-renders, showing/hiding hotspots and routes.
2. **User clicks a hotspot** → `MapContainer` calls `onEventClick(event)` → `App` sets `selectedEvent` → `InfoPanel` slides in.
3. **User toggles a filter** → `Sidebar` calls `onToggleFilter(type)` → `App` toggles it in the `activeFilters` array → `MapContainer` hides matching dots, `Sidebar` hides matching Chronicle entries.

---

## The Map (React + D3)

The map is an `<svg>` element managed entirely by React. D3 is used **only for maths**, never for direct DOM manipulation.

### Projection

`MapContainer` creates a `d3.geoMercator()` projection on mount (via `useMemo`). The projection translates latitude/longitude pairs into SVG pixel coordinates. The projection is recalculated whenever the SVG dimensions change (tracked by a `ResizeObserver`).

### Base geography

World country polygons are loaded from `public/data/world.geojson` via `fetch()` on mount. Each polygon is rendered as a `<path>` element with its `d` attribute computed by `d3.geoPath(projection)`. React handles the iteration:

```tsx
{features.map(f => (
  <path key={f.id} className="land" d={pathGenerator(f)} />
))}
```

### Hotspots

Each `VikingEvent` becomes a `<g className="hotspot">` group containing a `<circle>` and a `<text>` label. A hotspot is visible when:

```ts
event.year <= currentYear && activeFilters.includes(event.type)
```

The dot colour is determined by a `type → colour` map inside the component.

### Routes

Each `Route` is drawn as a `<path>` with `className="route"`. It becomes `active` (and gains an animated stroke-dashoffset animation) when any event that references it is currently visible on the map.

### Zoom

`d3-zoom` is attached to the SVG's `<g>` wrapper via a `useEffect`. Zoom transforms are applied by updating the `transform` attribute on that `<g>` — React does not need to re-render the children; D3 manipulates the transform directly in this one intentional exception to the "D3 for maths only" rule.

The `ZoomControls` component fires zoom actions by calling handler functions exposed on the `window` object by `MapContainer`. This is a pragmatic escape hatch to avoid prop-drilling the D3 zoom instance.

### Cursor Feedback

`MapContainer` tracks a local `isDragging: boolean` state. `onMouseDown` on the SVG sets it to `true`; `onMouseUp` on the SVG sets it back to `false`. A `window` `mouseup` listener (registered and cleaned up inside the D3 zoom `useEffect`) ensures the cursor resets even if the user releases the mouse button outside the SVG element. The `isDragging` state drives a `.dragging` CSS class on the SVG: `.viking-map` has `cursor: grab` by default, and `.viking-map.dragging` overrides it with `cursor: grabbing`.

---

## The Timeline Slider

`Timeline` is a styled HTML `<input type="range">` with `min={750}` and `max={1100}`. Its `value` is always `currentYear` (controlled input). On `onChange`, it calls `onYearChange(parseInt(e.target.value))`.

A gold fill bar (`timeline-fill`) is positioned behind the thumb and sized as a percentage of the total range:

```ts
const pct = ((currentYear - START_YEAR) / (END_YEAR - START_YEAR)) * 100;
```

Map events appear at the exact year they occurred. Dragging the slider past a year causes that event's hotspot to fade in, and retracting it causes it to disappear.

---

## The Sidebar & Chronicle

`Sidebar` manages two tabs via local `activeTab` state (`'filters' | 'chronicle'`). It receives `activeFilters` and `onToggleFilter` from `App`.

### Filters Tab

Renders a list of `filter-btn` buttons, one per `EventType`. Each button has a coloured indicator dot and is styled with a CSS custom property (`--filter-color`) so a single rule drives the active glow, border, and dot fill.

### Chronicle Tab

Renders `TIMELINE_ENTRIES` filtered to only those whose `tags` overlap `activeFilters`, sorted chronologically. The count badge on the tab updates live.

Each entry is rendered by `<ChronicleEntry>`, which composes:
- **Date** — gold, uppercase, small
- **`<Badge>` pills** — one per tag, colour-coded via `--badge-color` CSS property
- **Title** — bold, white
- **Body** — de-emphasised prose
- **Source** — italic citation with a 📖 icon

### Badge Component

`Badge` is a standalone reusable component that takes a `tag: EventType` and renders a coloured pill. It is used in both `ChronicleEntry` (sidebar) and `InfoPanel` (map click detail), keeping tag styling consistent across contexts:

```tsx
// Badge.tsx
<span className="badge" style={{ '--badge-color': TAG_COLORS[tag] }}>
  {TAG_LABELS[tag]}
</span>
```

The colour is injected as a CSS custom property so a single `.badge` CSS rule drives background, border, and text colour with `color-mix()`.

---

## The Info Panel

`InfoPanel` is an absolutely-positioned overlay on the right edge of the map. It is always in the DOM; its visibility is toggled purely by CSS:

```css
.info-panel              { transform: translateX(100%); }  /* off-screen */
.info-panel.open         { transform: translateX(0); }     /* slides in */
```

The slide animation is a CSS transition (`transition: transform 0.5s cubic-bezier(...)`). React's only job is to add/remove the `open` class based on whether `selectedEvent` is non-null.

When a valid event is selected, the panel renders:
- The event `title`, `date`, and a `<Badge>` for its `type`
- The `body` text, split on `<br><br>` into separate `<p>` elements
- A close button that calls `onClose`, which sets `selectedEvent` back to `null`

---

## Styling System

All styles live in `App.css`. The foundation is a set of CSS custom properties (design tokens) defined on `:root`:

```css
:root {
  --blood: #DC2626;         /* raid / battle events */
  --blood-bright: #EF4444;
  --sea: #0F172A;           /* map background */
  --gold: #D97706;          /* trade / highlight */
  --gold-bright: #F59E0B;   /* dates, active tab, year display */
  --land: #1E293B;          /* country polygons */
  --glass-bg: rgba(15,23,42,0.6);    /* backdrop for panels */
  --glass-border: rgba(255,255,255,0.08);

  --font-heading: 'Outfit', sans-serif;
  --font-subheading: 'Cinzel', serif;
  --font-body: 'Inter', sans-serif;
}
```

Glassmorphism panels (sidebar, header, timeline, info panel) all use `backdrop-filter: blur()` on a semi-transparent `var(--glass-bg)` background.

Interactive elements use `cubic-bezier(0.16, 1, 0.3, 1)` — an "ease-out spring" curve — for hover/active transitions.

Notable CSS classes added during the UX polish pass:

- `.viking-map.dragging` — applies `cursor: grabbing` during active map drag (default is `cursor: grab` on `.viking-map`)
- `.rune-copy-btn` — Copy to Clipboard button inside the Rune Translator overlay; mirrors `.rune-btn` hover styling
- `.home-toggle-label` — "About" text label inside the header toggle button; hidden via `display: none` on viewports below 600px
- `.header-left` — flex column container for the app title and era label in the header (stacks them vertically with `gap: 2px`)
- `.rune-translator` uses `max-height: min(60%, calc(100vh - 80px))` for responsive height instead of a fixed `height: 60%`, ensuring the overlay never overflows on short viewports

---

## Adding New Events

### To add a map hotspot

Add an entry to `EVENTS` in `src/data/vikingData.ts`:

```ts
{
  id: 'spot-my-event',      // unique string
  year: 900,                // appears when slider reaches this year
  coords: [lng, lat],       // e.g. [2.35, 48.85] for Paris
  title: 'My Event',
  date: '900 AD',
  tag: 'Raid',              // display label
  body: 'What happened...',
  type: 'raid',             // controls colour + filter visibility
  routes: []                // optionally reference Route IDs
}
```

### To add a Chronicle (sidebar) entry

Add an entry to `TIMELINE_ENTRIES` in `src/data/timelineEntries.ts`:

```ts
{
  id: 'tl-my-event',
  year: 900,
  date: '900 AD',
  title: 'My Event',
  body: 'Scholarly description...',
  source: 'Book Title, Chapter N',
  tags: ['raid']            // controls which filter toggles show/hide it
}
```

### To add a new route

Add to `ROUTES` in `vikingData.ts` and reference its `id` from the appropriate event's `routes` array:

```ts
{ id: 'route-my-route', type: 'raid', points: [[lng1, lat1], [lng2, lat2]] }
```

### To add a new EventType

1. Add the literal to the `EventType` union in `src/types.ts`
2. Add a colour mapping in `Badge.tsx` (`TAG_COLORS`)
3. Add a label mapping in `Badge.tsx` (`TAG_LABELS`)
4. Add the filter button config in `Sidebar.tsx` (`ALL_FILTERS`)
5. Add a colour mapping in `MapContainer.tsx` (the `typeColor` map)

---

> The in-app credits block has moved from the Timeline footer to the **About page** (`HomeSplash`). The credits below are for the documentation file only.

### Made by Nicholas Hamilton & America Gaona Borges

**Nicholas Hamilton**  
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/hamiltonnBC)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/nicholas-trey-hamilton/)

**America Gaona Borges**  
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/gaonaborgesa)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/america-gaona-borges/)
