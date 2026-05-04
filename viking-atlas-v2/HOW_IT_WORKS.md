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
│   │   ├── timelineEntries.ts  # Scholarly chronicle entries (sidebar-only)
│   │   └── filterConstants.ts  # ALL_FILTERS array shared by FiltersOverlay
│   │
│   └── components/
│       ├── Header.tsx          # Top bar: title, year, era name
│       ├── Timeline.tsx        # Bottom slider + era pills + prev/next
│       ├── Sidebar.tsx         # Collapsible Chronicle panel
│       ├── FiltersOverlay.tsx  # Floating filter dropdown (map overlay)
│       ├── Badge.tsx           # Reusable colored tag pill
│       ├── ChronicleEntry.tsx  # Single expandable chronicle card
│       ├── InfoPanel.tsx       # Slide-in detail panel (event or route)
│       ├── RuneTranslator.tsx  # Rune translation overlay
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
  name: string;           // displayed in the tooltip and InfoPanel header
  description: string;    // shown in the InfoPanel route view
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
├── currentYear: number              ← drives map visibility + header
├── selectedItem: VikingEvent|Route  ← drives InfoPanel open/closed
├── activeFilters: EventType[]       ← drives map + sidebar Chronicle
├── isHomeVisible: boolean           ← controls the About overlay (HomeSplash)
├── isSidebarOpen: boolean           ← controls sidebar collapse/expand
├── isFiltersOpen: boolean           ← controls FiltersOverlay visibility
├── scrollToEra: number | null       ← one-way scroll signal from Timeline to Sidebar
│
├── <Header currentYear />
├── <Sidebar isOpen activeFilters scrollToEra onScrollToEraConsumed />
├── <MapContainer currentYear events routes activeFilters onEventClick onRouteClick />
├── <FiltersOverlay isOpen activeFilters onToggleFilter onSelectAll />
├── <InfoPanel selectedItem events onSelectEvent onClose />
└── <Timeline currentYear onYearChange onEraJump />
```

### How state flows

1. **User drags the slider** → `Timeline` calls `onYearChange(n)` → `App` sets `currentYear` → `MapContainer` re-renders, showing/hiding hotspots and routes.
2. **User clicks a hotspot** → `MapContainer` calls `onEventClick(event)` → `App` sets `selectedItem` → `InfoPanel` slides in showing event detail.
3. **User clicks a route** → `MapContainer` calls `onRouteClick(route)` → `App` sets `selectedItem` → `InfoPanel` slides in showing route name, description, and connected events.
4. **User toggles a filter** → `FiltersOverlay` calls `onToggleFilter(type)` → `App` toggles it in the `activeFilters` array → `MapContainer` hides matching dots and routes, `Sidebar` hides matching Chronicle entries.

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

Each `Route` is drawn as a `<path>` with `className="route"`. It becomes `active` (and gains an animated dashed stroke) when its type is in `activeFilters` AND at least one active event references it. Active routes also render a wide transparent hit-area path on top (20px stroke, `pointerEvents: 'stroke'`) to make them easy to click. Clicking a route calls `onRouteClick`, which opens the `InfoPanel` in route mode showing the route's name, description, and a list of connected events. Hovering a route shows a `route-tooltip` with the route name. Active routes also render SVG `<marker>` arrowheads at the end and a dot at the start, defined in a `<defs>` block — one set per route type (raid, exploration, trade).

### Zoom

`d3-zoom` is attached to the SVG's `<g>` wrapper via a `useEffect`. Zoom transforms are applied by updating the `transform` attribute on that `<g>` — React does not need to re-render the children; D3 manipulates the transform directly in this one intentional exception to the "D3 for maths only" rule.

The `ZoomControls` component fires zoom actions by calling handler functions exposed on the `window` object by `MapContainer`. This is a pragmatic escape hatch to avoid prop-drilling the D3 zoom instance.

### Cursor Feedback

`MapContainer` tracks a local `isDragging: boolean` state driven entirely by D3's zoom events — `zoom.on('start')` sets it to `true`, `zoom.on('end')` sets it back to `false`. A `window` `mouseup` listener (registered and cleaned up inside the D3 zoom `useEffect`) ensures the cursor resets even if the user releases the mouse button outside the SVG element.

The `isDragging` state is applied as an inline `style` directly on the `<svg>` element (`cursor: grabbing` when dragging, `cursor: grab` otherwise). D3 zoom sets its own inline cursor style on the SVG at initialisation, so that style is immediately cleared (`svg.style('cursor', null)`) to ensure React's inline style is the single source of truth and the `grabbing` cursor is never overridden.

---

## The Timeline Slider

`Timeline` is a styled HTML `<input type="range">` with `min={750}` and `max={1100}`. Its `value` is always `currentYear` (controlled input). On `onChange`, it calls `onYearChange(parseInt(e.target.value))`.

A gold fill bar (`timeline-fill`) is positioned behind the thumb and sized as a percentage of the total range:

```ts
const pct = ((currentYear - START_YEAR) / (END_YEAR - START_YEAR)) * 100;
```

Map events appear at the exact year they occurred. Dragging the slider past a year causes that event's hotspot to fade in, and retracting it causes it to disappear.

### Era Navigation

Era pill buttons (`.era-pill`) are rendered above the slider in a `.era-pills` flex row — one per era. Clicking a pill calls both `onYearChange(era.min)` (to jump the slider to the start of that era) and `onEraJump(i)` (to trigger a scroll in the Sidebar chronicle). The active pill is highlighted based on `getActiveEraIndex(currentYear)`, which finds the era whose `min`/`max` range contains the current year and clamps to the last era if no match is found.

Prev/Next arrow buttons (`.timeline-era-btn`) flank the slider inside a `.timeline-nav` flex row. These navigate by **event year** — snapping to the nearest earlier or later entry in `EVENT_YEARS` — rather than by era boundary. They call `onYearChange` only; they do not trigger `onEraJump`.

---

## The Sidebar & Chronicle

`Sidebar` is a collapsible panel. It accepts `isOpen`, `onToggle`, `activeFilters`, `scrollToEra`, and `onScrollToEraConsumed` props. When closed, it slides off-screen via `transform: translateX(-100%)` and `margin-left: -360px`. A collapse button (`.sidebar-collapse-btn`) peeks into the map area from the sidebar's right edge; when the sidebar is closed, a reopen tab (`.sidebar-reopen-tab`) appears on the left edge of the map instead.

Filters have moved out of the sidebar entirely. They are now controlled by `FiltersOverlay` — a floating dropdown anchored to a `Filters` button (`.filters-toggle-btn`) in the top-left corner of the map. The overlay closes when clicking outside it. A badge on the button shows the active count when any filters are disabled.

### Chronicle

Renders `TIMELINE_ENTRIES` filtered to only those whose `tags` overlap `activeFilters`, sorted chronologically. The count badge in the sidebar header updates live.

Each entry is rendered by `<ChronicleEntry>`, which composes:
- **Date** — gold, uppercase, small
- **`<Badge>` pills** — one per tag, colour-coded via `--badge-color` CSS property
- **Title** — bold, white
- **Body** — de-emphasised prose
- **Source** — italic citation with a 📖 icon

### Era Section Headers

The chronicle list now includes `.chronicle-era-header` dividers inserted before the first `ChronicleEntry` of each era. Headers are only rendered for eras that have at least one entry in `visibleEntries` (entries matching active filters, sorted by year). Each header has a stable `id="chronicle-era-{i}"` used as a scroll target, and a `.chronicle-era-label` span displaying the era name.

### Scroll-to-Era Signal

`Sidebar` accepts a `scrollToEra: number | null` prop. When non-null, a `useEffect` defers a `scrollIntoView` call to the next animation frame, then calls `onScrollToEraConsumed()` to reset the signal in `App`. If the sidebar is closed when an era jump is triggered, `App` automatically reopens it first. Manual scrolling of the chronicle never updates `currentYear` or `scrollToEra` — the signal is strictly one-way from timeline to chronicle.

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

The slide animation is a CSS transition (`transition: transform 0.5s cubic-bezier(...)`). React's only job is to add/remove the `open` class based on whether `selectedItem` is non-null.

The panel renders in one of two modes depending on what was clicked:

**Event mode** (user clicked a hotspot): renders the event `title`, `date`, a `<Badge>` for its `type`, and the `body` text split on `<br><br>` into separate `<p>` elements.

**Route mode** (user clicked a route): renders the route `name`, a `<Badge>` for its type, a `description` paragraph, and a "Connected Events" list. Each item in the list is a button — clicking it switches the panel to event mode for that event.

---

## Styling System

All styles live in `App.css`. The foundation is a set of CSS custom properties (design tokens) defined on `:root`:

```css
:root {
  --blood: #630707;         /* battle events */
  --blood-bright: #e40707;  /* raid events */
  --conquest: #462ff8;      /* conquest events */
  --gold: #1f8e3e;          /* trade events */
  --gold-bright: #F59E0B;   /* ships, UI accents, dates */
  --parchment: #f9eccc;     /* settlement events */
  --exploration: #60e5fa;   /* exploration events */
  --sea: #111b30;           /* map background */
  --sea-dark: #040a27;      /* map background outer */
  --land: #1E293B;          /* country polygon fill */
  --land-stroke: #596f8c;   /* country polygon outline */
  --glass-bg: rgba(12,27,62,0.6);
  --glass-border: rgba(255,255,255,0.144);

  --font-heading: 'Outfit', sans-serif;
  --font-body: 'Inter', sans-serif;
}
```

Glassmorphism panels (sidebar, header, timeline, info panel) all use `backdrop-filter: blur()` on a semi-transparent `var(--glass-bg)` background.

Interactive elements use `cubic-bezier(0.16, 1, 0.3, 1)` — an "ease-out spring" curve — for hover/active transitions.

Notable CSS classes:

- `.viking-map` — `cursor: grab` set via inline style; switches to `cursor: grabbing` during active drag (driven by D3 zoom start/end events via `isDragging` state)
- `.rune-copy-btn` — Copy to Clipboard button inside the Rune Translator overlay
- `.home-toggle-label` — "About" text label inside the header toggle button; hidden via `display: none` on viewports below 600px
- `.header-left` — flex column container for the app title and era label in the header
- `.timeline-nav` — flex row container for the prev arrow, timeline wrapper, and next arrow
- `.era-pills` — flex row container for the era pill buttons, rendered above the slider
- `.era-pill` — era jump button; active pill highlighted via `.era-pill.active`
- `.timeline-era-btn` — prev/next event arrow buttons flanking the timeline wrapper
- `.chronicle-era-header` — era section divider in the Chronicle tab with `::before`/`::after` separator lines
- `.chronicle-era-label` — era name text inside `.chronicle-era-header`
- `.sidebar--closed` — applied when sidebar is collapsed; slides it off-screen via `transform` + `margin-left`
- `.sidebar-collapse-btn` — tab on the sidebar's right edge that collapses it
- `.sidebar-reopen-tab` — tab on the map's left edge that reopens the sidebar (rendered by `App` when sidebar is closed)
- `.filters-toggle-btn` — floating "Filters" button in the top-left of the map
- `.filters-toggle-badge` — count badge on the filters button when some filters are inactive
- `.filters-overlay` — floating filter dropdown; animated open/close via opacity + transform
- `.filters-overlay--open` — applied when the overlay is visible
- `.route-tooltip` — hover tooltip showing a route's name
- `.panel-route-description` — route description paragraph in the InfoPanel route view
- `.panel-connected-events` — container for the connected events list in route view
- `.panel-connected-event-item` — clickable button for each connected event in route view

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
{
  id: 'route-my-route',
  type: 'raid',
  points: [[lng1, lat1], [lng2, lat2]],
  name: 'My Route Name',
  description: 'What this route represents...'
}
```

### To add a new EventType

1. Add the literal to the `EventType` union in `src/types.ts`
2. Add a colour mapping in `Badge.tsx` (`TAG_COLORS`)
3. Add a label mapping in `Badge.tsx` (`TAG_LABELS`)
4. Add the filter entry in `src/data/filterConstants.ts` (`ALL_FILTERS`)
5. Add a colour mapping in `MapContainer.tsx` (`getEventColor`)
6. Add a CSS variable for the colour in `:root` in `App.css`
7. Add an SVG `<marker>` in `MapContainer.tsx`'s `<defs>` block if it's also a route type

---

> The in-app credits block has moved from the Timeline footer to the **About page** (`HomeSplash`). The credits below are for the documentation file only.

### Made by Nicholas Hamilton & America Gaona Borges

**Nicholas Hamilton**  
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/hamiltonnBC)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/nicholas-trey-hamilton/)

**America Gaona Borges**  
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/gaonaborgesa)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/america-gaona-borges/)
