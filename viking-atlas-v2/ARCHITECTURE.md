# Viking Atlas — Architecture

## Overview

Viking Atlas is an interactive historical map application that lets users explore the Viking Age (750–1408 AD) through a timeline-driven interface. Built with React 19, TypeScript, and D3.js, it renders entirely in the browser with no backend, no database, and no API calls at runtime. All data is compiled TypeScript; all map geometry is computed client-side.

The project is a complete rewrite of a legacy vanilla JavaScript + D3 DOM-manipulation app, now using a modern component-based architecture with strict typing and a glassmorphic design system.

---

## Tech Stack

| Tool | Role |
|------|------|
| **React 19** | Component tree, declarative rendering, state via hooks |
| **TypeScript 5.9** | Strict typing for all data models and component props |
| **Vite 8** | Dev server, HMR, and production bundler |
| **D3 7.9 (d3-geo, d3-zoom)** | Map projection math and zoom transforms — *not* DOM manipulation |
| **Vanilla CSS** | Design system via CSS custom properties (no framework) |
| **clsx** | Conditional className composition |
| **Vitest** | Unit and property-based testing |

---

## Project Structure

```
viking-atlas-v2/
├── index.html                    # HTML shell, loads Google Fonts
├── package.json                  # Dependencies & scripts
├── vite.config.ts                # Vite config (base path: /Viking_History/)
├── tsconfig.json                 # TypeScript project references
├── eslint.config.js              # ESLint flat config
│
├── public/
│   ├── data/world.geojson        # World map geometry (Natural Earth)
│   ├── favicon.svg
│   └── icons.svg
│
├── src/
│   ├── main.tsx                  # React root mount
│   ├── App.tsx                   # Global state holder & layout
│   ├── App.css                   # Full design system + component styles
│   ├── index.css                 # Global resets
│   ├── types.ts                  # Shared TypeScript interfaces
│   │
│   ├── components/
│   │   ├── Header.tsx            # Top bar: title, era label, year, About btn
│   │   ├── Timeline.tsx          # Bottom slider + era pills + prev/next
│   │   ├── Sidebar.tsx           # Collapsible Chronicle panel
│   │   ├── ChronicleEntry.tsx    # Expandable chronicle card
│   │   ├── FiltersOverlay.tsx    # Floating filter dropdown
│   │   ├── InfoPanel.tsx         # Slide-in event/route detail panel
│   │   ├── HubPanel.tsx          # Slide-in origin hub detail panel
│   │   ├── HomeSplash.tsx        # Full-screen About overlay
│   │   ├── RuneTranslator.tsx    # Rune translation overlay
│   │   ├── Badge.tsx             # Reusable colored tag pill
│   │   └── Map/
│   │       ├── MapContainer.tsx  # SVG map, routes, hotspots, hubs
│   │       ├── ZoomControls.tsx  # +/−/reset buttons
│   │       └── ZoomContext.tsx   # React context for zoom callbacks
│   │
│   ├── data/
│   │   ├── vikingData.ts         # Events, routes, eras, origin hubs
│   │   ├── timelineEntries.ts    # Scholarly chronicle entries
│   │   └── filterConstants.ts    # Filter type definitions & metadata
│   │
│   └── utils/
│       ├── runeTranslator.ts     # Elder/Younger Futhark translation
│       └── timelineUtils.ts      # Era index lookup
│
├── data/                         # Source material (reference only)
│   ├── timelinevikings.md
│   └── timelinevikings_pt2.md
│
└── dist/                         # Production build output (gitignored)
```

---

## State Management

All application state lives in `App.tsx` and flows down via props. No external state library is used.

### Primary State

| State | Type | Purpose |
|-------|------|---------|
| `currentYear` | `number` | Drives timeline position, map visibility, era display |
| `selectedItem` | `VikingEvent \| Route \| null` | Controls InfoPanel content |
| `selectedHub` | `OriginHub \| null` | Controls HubPanel content |
| `activeFilters` | `EventType[]` | Which event types are visible on map & sidebar |
| `isHomeVisible` | `boolean` | About overlay toggle |
| `isRuneVisible` | `boolean` | Rune Translator overlay toggle |
| `isSidebarOpen` | `boolean` | Chronicle sidebar toggle |
| `isFiltersOpen` | `boolean` | Filter dropdown toggle |
| `scrollToEra` | `number \| null` | One-way signal: Timeline → Sidebar scroll |

### Derived State

- **`effectiveSelectedItem`** — Clears `selectedItem` if the timeline moves before the event's year. Prevents showing future events.
- **`effectiveSidebarOpen`** — Forces sidebar open when `scrollToEra` fires.

---

## Component Hierarchy

```
App
├── HomeSplash              (z-index 900+, full-screen overlay)
├── RuneTranslator          (z-index 900+, full-screen overlay)
├── Header                  (fixed top, z-index 100)
│
├── main.atlas-container
│   ├── Sidebar             (360px, z-index 40)
│   │   └── ChronicleEntry[]
│   │
│   └── .map-holder         (flex: 1)
│       ├── MapContainer    (SVG fills container)
│       │   └── ZoomContext.Provider
│       ├── ZoomControls    (bottom-left)
│       ├── FiltersOverlay  (top-left, z-index 46)
│       ├── InfoPanel       (right edge, z-index 50)
│       └── HubPanel        (right edge, z-index 51)
│
└── Timeline                (fixed bottom, z-index 100)
```

---

## Data Layer

Two separate but related datasets power the app:

### 1. `vikingData.ts` — Map Data

Exports constants that drive everything visual on the map:

- **`EVENTS: VikingEvent[]`** — Hotspots with geographic coordinates, year, type, and prose body.
- **`ROUTES: Route[]`** — Polylines connecting origin hubs to destination waypoints.
- **`ERAS: Era[]`** — Named historical periods (e.g., "Early Raids", "Great Heathen Army").
- **`ORIGIN_HUBS: OriginHub[]`** — Fixed departure ports (Denmark, Norway, Sweden, Iceland, England, France) with descriptions and linked chronicle entry IDs.
- **`EVENT_YEARS: number[]`** — Sorted, deduplicated array of all event years for slider snapping.
- **`START_YEAR` / `END_YEAR`** — 750 / 1408.

### 2. `timelineEntries.ts` — Chronicle Data

Scholarly entries sourced from *The Age of the Vikings* (Winroth, 2016). Each entry has tags that link it to the filter system and an ID that origin hubs reference.

### 3. `filterConstants.ts` — Filter Metadata

Defines the 7 event types with labels, CSS color variables, and descriptions used by `FiltersOverlay`.

---

## React + D3 Integration

The map uses a **React-driven D3** pattern:

- **D3 for math**: `d3.geoMercator()` and `d3.geoPath()` compute SVG path strings from GeoJSON and coordinate arrays.
- **React for rendering**: JSX maps over data arrays to produce `<path>`, `<circle>`, `<g>`, and `<line>` elements.
- **D3 zoom (exception)**: The zoom behavior directly manipulates the SVG `<g>` transform attribute via `d3.zoom()`, since React re-renders would be too expensive at 60fps drag events.

This avoids the classic conflict between D3's enter/update/exit pattern and React's virtual DOM diffing.

---

## Styling System

All styles live in `App.css` using CSS custom properties for theming:

- **Glassmorphism**: `backdrop-filter: blur()` + semi-transparent backgrounds
- **Color tokens**: Semantic names (`--blood`, `--gold`, `--exploration`, `--conquest`, etc.)
- **Typography**: Outfit (headings), Inter (body), Cinzel (decorative)
- **Animations**: CSS transitions with custom easing (`--ease-out`, `--ease-spring`)
- **Layout**: CSS Flexbox, fixed positioning for header/timeline, absolute for panels

---

## Build & Deployment

| Command | Action |
|---------|--------|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | TypeScript check + Vite production build |
| `npm run lint` | ESLint |
| `npm run preview` | Preview production build locally |
| `npm run test` | Vitest (single run) |
| `npm run test:watch` | Vitest watch mode |

- **Base path**: `/Viking_History/` (configurable via `VITE_BASE_PATH` env var)
- **Output**: `dist/` directory, suitable for GitHub Pages or any static host
- **Target**: Modern browsers (ES2020+)

---

## Documentation Index

Additional documentation lives in the `docs/` directory. Refer to the appropriate doc when working on a specific area of the codebase.

| Document | Path | Use When... |
|----------|------|-------------|
| **How It Works** | `HOW_IT_WORKS.md` | You need a narrative walkthrough of the full app — good for onboarding or understanding the big picture. |
| **Data Model** | `docs/DATA_MODEL.md` | You're adding events, routes, hubs, or chronicle entries, or need to understand type relationships. |
| **Components** | `docs/COMPONENTS.md` | You're modifying a component's props, behavior, or adding a new component. |
| **Map System** | `docs/MAP_SYSTEM.md` | You're working on the D3 map — projection, zoom, hotspots, routes, or SVG rendering. |
| **Styling** | `docs/STYLING.md` | You're changing the visual design — colors, layout, animations, or adding new CSS. |
| **Contributing** | `docs/CONTRIBUTING.md` | You're setting up the project, adding content, or need to know code conventions and deployment steps. |

> **Keep docs in sync.** If you change the architecture, add components, modify the data model, or alter the styling system, update the relevant documentation to match. Outdated docs are worse than no docs.

---

## Key Design Decisions

1. **No routing library** — Single-page app with state-driven UI panels; no URL-based navigation needed.
2. **No external state library** — App complexity doesn't warrant Redux/Zustand; React hooks suffice.
3. **D3 for math only** — Keeps React as the single source of truth for the DOM.
4. **One-way scroll signal** — `scrollToEra` prevents circular updates between Timeline and Sidebar.
5. **Slider snaps to event years** — Prevents landing on empty years with no visible change.
6. **Origin hubs as first-class entities** — Routes originate from named geographic ports, not arbitrary coordinates.
7. **Derived state over useEffect** — `effectiveSelectedItem` computed inline rather than via side effects.
8. **Single CSS file** — Keeps the design system cohesive; CSS custom properties provide the modularity.
