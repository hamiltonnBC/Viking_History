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
10. [The Hub Panel](#the-hub-panel)
11. [Overlay Pages](#overlay-pages)
12. [Styling System](#styling-system)
13. [Adding New Events](#adding-new-events)

---

## Overview

Viking Atlas is an interactive historical map that lets you travel through the Viking Age (750-1408 AD) using a timeline slider. As you advance the year, map hotspots progressively appear at their real geographic coordinates, each one clickable for a detailed description. A sidebar provides filter controls and a scrollable **Chronicle** of scholarly events sourced from *The Age of the Vikings* (Winroth, 2016).

The application renders entirely in the browser. There is no backend, no database, and no API calls at runtime. All data is compiled TypeScript, and all map geometry is computed client-side using D3.

---

## Tech Stack

| Tool | Role |
|------|------|
| **React 18** | UI component tree, declarative rendering, state management |
| **TypeScript** | Strict typing for all data models and component props |
| **Vite** | Dev server and production bundler |
| **D3 (d3-geo, d3-zoom)** | Map projection math and zoom transforms (not DOM manipulation) |
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
│   │   ├── vikingData.ts       # Map events, routes, eras, origin hubs
│   │   ├── timelineEntries.ts  # Scholarly chronicle entries (sidebar-only)
│   │   └── filterConstants.ts  # ALL_FILTERS array shared by FiltersOverlay
│   │
│   ├── utils/
│   │   ├── timelineUtils.ts    # getActiveEraIndex helper
│   │   └── runeTranslator.ts   # Elder Futhark translation logic
│   │
│   └── components/
│       ├── Header.tsx          # Top bar: title, year, era name, nav buttons
│       ├── Timeline.tsx        # Bottom slider + era pills + prev/next
│       ├── Sidebar.tsx         # Collapsible Chronicle panel
│       ├── FiltersOverlay.tsx  # Floating filter dropdown (map overlay)
│       ├── Badge.tsx           # Reusable colored tag pill
│       ├── ChronicleEntry.tsx  # Single expandable chronicle card
│       ├── InfoPanel.tsx       # Slide-in detail panel (event or route)
│       ├── HubPanel.tsx        # Slide-in panel for origin hub (country) details
│       ├── HomeSplash.tsx      # About page overlay
│       ├── DetailsPage.tsx     # Application details overlay (era categories, sources)
│       ├── MapGuide.tsx        # Map legend overlay (icons + route colours)
│       ├── LearnMore.tsx       # Topic grid overlay with sub-pages
│       ├── RuneTranslator.tsx  # Rune translation overlay
│       └── Map/
│           ├── MapContainer.tsx    # SVG map, routes, hotspot icons
│           ├── ZoomContext.tsx     # React context for zoom controls
│           └── ZoomControls.tsx    # +/−/reset buttons
│
└── data/
    ├── timelinevikings.md      # Source material (reference only)
    └── timelinevikings_pt2.md  # Source material part 2 (reference only)
```

---

## Data Layer

There are **two separate but related datasets**.

### 1. `vikingData.ts` - Map Data

This drives everything visual on the map. It exports:

```ts
EVENTS: VikingEvent[]       // hotspots on the map
ROUTES: Route[]             // animated lines between points
ERAS: Era[]                 // named historical periods
ORIGIN_HUBS: OriginHub[]    // departure port markers (countries)
EVENT_YEARS: number[]       // sorted unique years used as snap points
START_YEAR: number          // 750
END_YEAR: number            // 1408
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
  type: EventType;        // controls the icon, color, and filter behaviour
  routes?: string[];      // IDs of Route objects to activate with this event
}
```

**`Route`** is a polyline drawn on the map:

```ts
interface Route {
  id: string;
  type: 'raid' | 'exploration' | 'trade';
  origin: string;         // ID of the OriginHub this route starts from
  points: [lng, lat][];   // sequence of geographic coordinates
  name: string;           // displayed in the tooltip and InfoPanel header
  description: string;    // shown in the InfoPanel route view
}
```

Routes stay invisible (opacity 0) until an event that references them becomes active. They then animate with a dashed, glowing stroke.

**`OriginHub`** represents a Viking homeland departure point:

```ts
interface OriginHub {
  id: string;
  label: string;            // e.g. "Denmark", "Norway"
  coords: [lng, lat];
  description: string;      // shown in the HubPanel
  relatedEntryIds: string[]; // IDs of TimelineEntries shown in the HubPanel
}
```

**`EventType`** is a union that controls map icon shapes, colours, and filter behaviour:

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

### 2. `timelineEntries.ts` - Chronicle Data

This is the scholarly layer, derived from *The Age of the Vikings* (Winroth, 2016). It has its own type:

```ts
interface TimelineEntry {
  id: string;
  year: number;
  date: string;           // display date, e.g. "c. 800 AD"
  title: string;
  body: string;           // full explanatory paragraph
  source: string;         // chapter citation
  tags: EventType[];      // one or more tags, used for filter linking
}
```

Chronicle entries are **not** shown on the map (they have no coordinates). They live only in the sidebar Chronicle tab. However, their `tags` array mirrors `EventType`, so they are filtered in/out in sync with the map filter toggles.

> **Relationship between the two datasets:** For events that *do* have a real geographic location (e.g. the Sack of Nantes), there is *both* a `VikingEvent` in `vikingData.ts` (for the map hotspot) *and* a `TimelineEntry` in `timelineEntries.ts` (for the scholarly sidebar card). The two share the same `year` and thematic `tags`, but exist independently.

---

## Component Architecture

State flows top-down from `App.tsx`. No external state library is needed.

```
App
├── currentYear: number              ← drives map visibility + header
├── selectedItem: VikingEvent|Route  ← drives InfoPanel open/closed
├── selectedHub: OriginHub|null      ← drives HubPanel open/closed
├── activeFilters: EventType[]       ← drives map + sidebar Chronicle
├── isHomeVisible: boolean           ← About overlay (HomeSplash)
├── isDetailsVisible: boolean        ← Details overlay (DetailsPage)
├── isMapGuideVisible: boolean       ← Map Guide overlay (MapGuide)
├── isLearnMoreVisible: boolean      ← Learn More overlay (LearnMore)
├── isRuneVisible: boolean           ← Rune Translator overlay
├── isSidebarOpen: boolean           ← sidebar collapse/expand
├── isFiltersOpen: boolean           ← FiltersOverlay visibility
├── scrollToEra: number | null       ← one-way scroll signal Timeline → Sidebar
│
├── <HomeSplash />
├── <RuneTranslator />
├── <DetailsPage />
├── <MapGuide />
├── <LearnMore />
├── <Header currentYear onOpenHome onOpenDetails onOpenMapGuide onOpenLearnMore />
├── <Sidebar isOpen activeFilters scrollToEra onScrollToEraConsumed />
├── <MapContainer currentYear events routes originHubs activeFilters ... />
├── <FiltersOverlay isOpen activeFilters onToggleFilter onSelectAll />
├── <InfoPanel selectedItem events routes onSelectEvent onSelectRoute onClose />
├── <HubPanel hub onClose />
└── <Timeline currentYear onYearChange onOpenRunes onEraJump />
```

### How state flows

1. **User drags the slider** → `Timeline` calls `onYearChange(n)` → `App` sets `currentYear` → `MapContainer` re-renders, showing/hiding hotspots and routes.
2. **User clicks a hotspot** → `MapContainer` calls `onEventClick(event)` → `App` sets `selectedItem` → `InfoPanel` slides in showing event detail (with "Connected Routes" buttons if applicable).
3. **User clicks a route** → `MapContainer` calls `onRouteClick(route)` → `App` sets `selectedItem` → `InfoPanel` slides in showing route name, description, and connected events.
4. **User clicks an origin hub** → `MapContainer` calls `onHubClick(hub)` → `App` sets `selectedHub` → `HubPanel` slides in showing country details and related chronicle entries.
5. **User toggles a filter** → `FiltersOverlay` calls `onToggleFilter(type)` → `App` toggles it in the `activeFilters` array → `MapContainer` hides matching dots and routes, `Sidebar` hides matching Chronicle entries.
6. **User clicks "View Route" on an event** → `InfoPanel` calls `onSelectRoute(route)` → `App` sets `selectedItem` to the route → panel switches to route mode.
7. **User clicks a connected event on a route** → `InfoPanel` calls `onSelectEvent(event)` → `App` sets `selectedItem` to the event → panel switches to event mode.

---

## The Map (React + D3)

The map is an `<svg>` element managed entirely by React. D3 is used **only for maths**, never for direct DOM manipulation.

### Projection

`MapContainer` creates a `d3.geoMercator()` projection on mount (via `useMemo`). The projection translates latitude/longitude pairs into SVG pixel coordinates. The projection is recalculated whenever the SVG dimensions change (tracked by a resize listener).

### Base geography

World country polygons are loaded from `public/data/world.geojson` via `fetch()` on mount. Each polygon is rendered as a `<path>` element with its `d` attribute computed by `d3.geoPath(projection)`. React handles the iteration:

```tsx
{features.map(f => (
  <path key={f.id} className="land" d={pathGenerator(f)} />
))}
```

### Hotspot Icons

Each `VikingEvent` becomes a `<g className="hotspot">` group containing a thematic SVG icon and a text label. Icons are defined in the `EVENT_ICONS` map at the top of `MapContainer.tsx`:

| EventType | Icon Shape |
|-----------|-----------|
| raid | Crossed axes |
| settlement | House with peaked roof |
| trade | Ship/boat |
| conquest | Crown |
| exploration | Compass rose |
| battle | Crossed swords |
| origin | Viking shield (circle with cross) |

Each icon is rendered as a `<path>` element with:
- A faint background `<circle>` at 20% opacity for a halo effect
- A `filter="url(#icon-glow)"` drop-shadow for visibility against the dark map
- Scaling that adjusts with the zoom level (`iconScale = (BASE_R / 8) / zoomScale`)

A hotspot is visible when:

```ts
event.year <= currentYear && activeFilters.includes(event.type)
```

The icon colour is determined by the `getEventColor(type)` function.

### Origin Hub Markers

`OriginHub` entries are rendered as concentric circles with a text label. They are always visible on the map. Clicking one opens the `HubPanel`.

### Routes

Each `Route` is drawn as a `<path>` with `className="route"`. It becomes `active` (and gains an animated dashed stroke) when its type is in `activeFilters` AND at least one active event references it. Active routes also render a wide transparent hit-area path on top (20px stroke, `pointerEvents: 'stroke'`) to make them easy to click. Clicking a route calls `onRouteClick`, which opens the `InfoPanel` in route mode. Hovering a route shows a `route-tooltip` with the route name. Active routes render SVG `<marker>` arrowheads defined in a `<defs>` block (one set per route type).

### Zoom

`d3-zoom` is attached to the SVG's `<g>` wrapper via a `useEffect`. Zoom transforms are applied by updating the `transform` attribute on that `<g>`. The `ZoomControls` component accesses zoom handlers via `ZoomContext` (React context).

### Cursor Feedback

`MapContainer` tracks a local `isDragging: boolean` state driven by D3's zoom events. The `isDragging` state is applied as an inline `style` directly on the `<svg>` element (`cursor: grabbing` when dragging, `cursor: grab` otherwise).

---

## The Timeline Slider

`Timeline` is a styled HTML `<input type="range">` with `min={750}` and `max={1408}`. Its `value` is always `currentYear` (controlled input). On `onChange`, it snaps to the nearest event year via `snapToNearestEvent()`.

The snap function includes `START_YEAR` (750) as a valid snap point alongside all event years, so the user can always drag the slider back to the beginning even though no event occurs at exactly 750.

A gold fill bar (`timeline-fill`) is positioned behind the thumb and sized as a percentage of the total range:

```ts
const pct = ((currentYear - START_YEAR) / (END_YEAR - START_YEAR)) * 100;
```

### Era Navigation

Era pill buttons (`.era-pill`) are rendered above the slider. Clicking a pill calls both `onYearChange(era.min)` and `onEraJump(i)` (to trigger a scroll in the Sidebar chronicle). The active pill is highlighted based on `getActiveEraIndex(currentYear)`.

Prev/Next arrow buttons (`.timeline-era-btn`) navigate by **event year** (snapping to the nearest earlier or later entry in `EVENT_YEARS`) rather than by era boundary.

---

## The Sidebar & Chronicle

`Sidebar` is a collapsible panel. When closed, it slides off-screen via `transform: translateX(-100%)` and `margin-left: -360px`. A reopen tab appears on the left edge of the map when the sidebar is closed.

Filters are controlled by `FiltersOverlay`, a floating dropdown anchored to a "Filters" button in the top-left corner of the map.

### Chronicle

Renders `TIMELINE_ENTRIES` filtered to only those whose `tags` overlap `activeFilters`, sorted chronologically. Era section headers are inserted as dividers. The scroll-to-era signal from the Timeline triggers a `scrollIntoView` call to the corresponding era header.

### Badge Component

`Badge` is a standalone reusable component that takes a `tag: EventType` and renders a coloured pill. Used in `ChronicleEntry`, `InfoPanel`, and `HubPanel`.

---

## The Info Panel

`InfoPanel` is an absolutely-positioned overlay on the right edge of the map. Its visibility is toggled purely by CSS (`transform: translateX(100%)` / `translateX(0)`).

The panel renders in one of two modes:

**Event mode** (user clicked a hotspot):
- Event title, date, badge, and body text
- **Connected Routes** section: if the event belongs to one or more routes, buttons are shown to navigate to each route's detail view

**Route mode** (user clicked a route):
- Route name, badge, and description
- **Connected Events** list: buttons for each event on that route, clicking switches to event mode

This two-way navigation (event → route and route → event) allows users to explore the relationships between events and the paths that connect them.

---

## The Hub Panel

`HubPanel` is a slide-in panel on the right edge of the map (same position as `InfoPanel`, but controlled by `selectedHub` state). It shows:

- Country name and "Viking Homeland" subtitle
- Description of the country's role in the Viking Age
- A chronological list of related Chronicle entries (sourced from `relatedEntryIds` on the `OriginHub`)

The close button uses a sticky bar layout so it remains accessible while scrolling through long entry lists.

---

## Overlay Pages

The application uses full-screen overlay components rather than client-side routing. Each overlay is toggled by a boolean state in `App.tsx` and uses the same slide-in/out CSS animation pattern (`.visible` / `.hidden` classes with `transform` and `opacity` transitions).

### About (`HomeSplash`)
- Triggered by the "About" button in the header
- Contains the app introduction text and author credits
- Has a "Click here to view the timeline" button to dismiss

### Details (`DetailsPage`)
- Triggered by the "Details" button in the header
- Documents that the era categories (Age of Raids, Age of Conquest & Settlement, Age of Kings, End of the Viking Age) are not formally recognised academic periodisations
- Credits the History.com article "Vikings: History" as inspiration for the era structure
- Lists data sources (Winroth, 2016) and technology stack

### Map Guide (`MapGuide`)
- Triggered by the "Map Guide" button in the header
- Two-column layout (collapses to single column on mobile)
- Left column: all 7 event icons with their colours and descriptions
- Right column: all 3 route colour types with dashed-line swatches and descriptions
- Serves as a visual legend for the map

### Learn More (`LearnMore`)
- Triggered by the "Learn More" button in the header
- Displays a 3-column grid of 6 topic cards:
  1. Who Were the Vikings?
  2. Spread of Christianity
  3. History During the Viking Age
  4. Ships and Seafaring
  5. Trade and Economy
  6. Legacy and Influence
- Each card navigates to a dedicated detail sub-page (managed via local `activeTopic` state)
- Detail sub-pages have a "← Back" button (returns to topic grid) and an "✕" button (closes overlay entirely)
- Detail page content is placeholder ("Content coming soon") ready for future expansion

### Rune Translator (`RuneTranslator`)
- Triggered by the "Write your name in Runes!" button in the Timeline footer
- Translates user-entered text into Elder Futhark runes

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
  --sea: #0c1524;           /* map background */
  --sea-dark: #020617;      /* map background outer */
  --land: #172033;          /* country polygon fill */
  --land-stroke: #2a3a52;   /* country polygon outline */
  --glass-bg: rgba(12,21,36,0.72);
  --glass-border: rgba(255,255,255,0.07);

  --font-heading: 'Outfit', sans-serif;
  --font-body: 'Inter', sans-serif;
}
```

Glassmorphism panels (sidebar, header, timeline, info panel, overlays) all use `backdrop-filter: blur()` on a semi-transparent background.

Interactive elements use `cubic-bezier(0.16, 1, 0.3, 1)` (an "ease-out spring" curve) for hover/active transitions.

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
  type: 'raid',             // controls icon, colour, and filter visibility
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
  origin: 'hub-denmark',    // which OriginHub this route starts from
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
6. Add an SVG icon path in `MapContainer.tsx` (`EVENT_ICONS`)
7. Add a CSS variable for the colour in `:root` in `App.css`
8. Add an SVG `<marker>` in `MapContainer.tsx`'s `<defs>` block if it's also a route type
9. Add the icon and description to `MapGuide.tsx` (`EVENT_ICONS` array)

### To add a new Learn More topic

Add an entry to the `TOPICS` array in `src/components/LearnMore.tsx`:

```ts
{
  id: 'my-topic',
  title: 'My Topic Title',
  subtitle: 'Brief description of what this covers',
  icon: '🏛️',
}
```

The detail sub-page will automatically be created with placeholder content. Replace the placeholder in the `activeTopic` render branch with real content when ready.

---

> The in-app credits block lives in the **About page** (`HomeSplash`). The credits below are for the documentation file only.

### Made by Nicholas Hamilton & America Gaona Borges

**Nicholas Hamilton**  
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/hamiltonnBC)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/nicholas-trey-hamilton/)

**America Gaona Borges**  
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/gaonaborgesa)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/america-gaona-borges/)
