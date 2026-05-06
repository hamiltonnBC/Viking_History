# How Viking Atlas Works

A technical walkthrough of the React + TypeScript + D3 application.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Data Layer](#data-layer)
4. [The Map (React + D3)](#the-map-react--d3)
5. [The Timeline](#the-timeline)
6. [The Sidebar & Chronicle](#the-sidebar--chronicle)
7. [The Info Panel & Hub Panel](#the-info-panel--hub-panel)
8. [Filters](#filters)
9. [Overlay Pages](#overlay-pages)
10. [Rune Translator](#rune-translator)
11. [Styling System](#styling-system)
12. [Adding New Content](#adding-new-content)

---

## Overview

Viking Atlas is an interactive historical map that lets you travel through the Viking Age (750–1408 AD) using a timeline slider. As you advance the year, map hotspots progressively appear at their real geographic coordinates, each one clickable for a detailed description. Routes animate between origin hubs and destinations. A sidebar provides a scrollable **Chronicle** of scholarly events sourced from *The Age of the Vikings* (Winroth, 2016).

The application renders entirely in the browser. There is no backend, no database, and no API calls at runtime. All data is compiled TypeScript, and all map geometry is computed client-side using D3.

---

## Tech Stack

| Tool | Role |
|------|------|
| **React 19** | UI component tree, declarative rendering, state management |
| **TypeScript 5.9** | Strict typing for all data models and component props |
| **Vite 8** | Dev server and production bundler |
| **D3 7.9 (d3-geo, d3-zoom)** | Map projection math and zoom transforms (not DOM manipulation) |
| **Vanilla CSS** | Design system via CSS custom properties (no framework) |
| **clsx** | Conditional className utility |
| **Vitest** | Unit testing with property-based testing via fast-check |

---

## Data Layer

There are **three data files** that power the application.

### 1. `vikingData.ts` - Map Data

This drives everything visual on the map. It exports:

```ts
START_YEAR: 750
END_YEAR: 1408
ERAS: Era[]             // named historical periods with year ranges
EVENTS: VikingEvent[]   // hotspots on the map
ROUTES: Route[]         // animated polylines between points
ORIGIN_HUBS: OriginHub[] // fixed departure ports (Denmark, Norway, Sweden, etc.)
EVENT_YEARS: number[]   // sorted, deduplicated event years for slider snapping
```

**`VikingEvent`** is the core map type:

```ts
interface VikingEvent {
  id: string;
  year: number;           // when it becomes visible on the map
  coords: [lng, lat];     // geographic position (D3 uses [lng, lat] order)
  title: string;
  date: string;           // human-readable, e.g. "June 8, 793 AD"
  tag: string;            // display label for the badge
  body: string;           // prose description shown in the InfoPanel
  type: EventType;        // controls icon, color, and filter behaviour
  routes?: string[];      // IDs of Route objects to activate with this event
}
```

**`Route`** is a polyline drawn on the map:

```ts
interface Route {
  id: string;
  type: 'raid' | 'exploration' | 'trade';
  origin: string;         // ID of an OriginHub (departure port)
  points: [lng, lat][];   // sequence of geographic waypoints
  name: string;
  description: string;
}
```

Routes stay invisible until an event that references them becomes active. They then animate with a dashed, glowing stroke and arrowhead markers.

**`OriginHub`** represents a Viking homeland departure port:

```ts
interface OriginHub {
  id: string;
  label: string;          // e.g. "Denmark", "Norway"
  coords: [lng, lat];
  description: string;    // historical context paragraph
  relatedEntryIds: string[]; // IDs of chronicle entries linked to this hub
}
```

**`EventType`** is a union that controls map icon shapes, colours, and sidebar filtering:

```ts
type EventType = 'ships' | 'raid' | 'settlement' | 'trade' | 'conquest' | 'exploration' | 'battle';
```

### 2. `timelineEntries.ts` - Chronicle Data

The scholarly layer, derived from *The Age of the Vikings* (Winroth, 2016):

```ts
interface TimelineEntry {
  id: string;
  year: number;
  date: string;           // display date, e.g. "c. 800 AD"
  title: string;
  body: string;           // full explanatory paragraph
  source: string;         // chapter citation
  tags: EventType[];      // links entry to the filter system
}
```

### 3. `filterConstants.ts` — Filter Metadata

Defines the 7 filter types with labels, CSS color variables, and descriptions used by the FiltersOverlay component.

---

## The Map (React + D3)

### Philosophy

D3 handles **math only** — projections, path generation, and zoom transforms. React handles **all rendering** via JSX. This avoids the classic conflict between D3's enter/update/exit and React's virtual DOM.

### Projection

```ts
const projection = d3.geoMercator()
  .center([0, 58])        // centered on Scandinavia
  .scale(500)
  .translate([width / 2, height / 2]);

const pathGenerator = d3.geoPath().projection(projection);
```

### Rendering Layers (bottom to top)

1. **Base geography** — GeoJSON world polygons loaded from `public/data/world.geojson`
2. **Country labels** — Positioned at feature centroids with manual overrides
3. **Routes** — `<path>` elements with animated dashes, arrowhead markers at endpoints
4. **Origin hub markers** — Ring + dot markers at fixed departure ports
5. **Event hotspot icons** — Thematic SVG icons with labels, revealed as timeline progresses

### Hotspot Icons

Each `VikingEvent` renders as a `<g className="hotspot">` group containing a thematic SVG icon and a text label. Icons are defined in the `EVENT_ICONS` map at the top of `MapContainer.tsx`:

| EventType | Icon Shape |
|-----------|-----------|
| ships | Viking longship |
| raid | Crossed axes |
| settlement | House with peaked roof |
| trade | Ship/boat |
| conquest | Crown |
| exploration | Compass rose |
| battle | Crossed swords |

Each icon is rendered as a `<path>` element with:
- A faint background `<circle>` at 20% opacity for a halo effect
- A `filter="url(#icon-glow)"` drop-shadow for visibility against the dark map
- Scaling that adjusts with the zoom level (`iconScale = (BASE_R / 8) / zoomScale`)

### Visibility Logic

- **Hotspots**: visible when `event.year <= currentYear && activeFilters.includes(event.type)`
- **Routes**: visible when route type is in `activeFilters` AND at least one referencing event is active
- **Origin hubs**: always visible, highlighted when their routes are active

### Zoom & Pan

D3 zoom is the one exception to "React renders everything" — it directly manipulates the SVG `<g>` transform attribute for 60fps performance during drag. Scale extent is 1–8x. The `ZoomContext` React context exposes `handleZoomIn`, `handleZoomOut`, and `handleZoomReset` to the `ZoomControls` component.

### Interactions

- **Hotspot click** — opens InfoPanel with event details
- **Route click** — opens InfoPanel with route details and connected events
- **Hub click** — opens HubPanel with country description and related chronicle entries
- **Route hover** — tooltip with route name follows cursor

---

## The Timeline

The `Timeline` component is a `<footer>` fixed to the bottom of the viewport.

### Elements

1. **Era pills** — Buttons for each historical era. Clicking jumps the slider to that era's start year and scrolls the sidebar to the corresponding section.
2. **Prev/Next buttons** — Jump to the previous or next event year in the sorted `EVENT_YEARS` array.
3. **Slider** — HTML `<input type="range">` from 750 to 1408. On change, the raw value snaps to the nearest event year.
4. **Year tick marks** — Clickable dots positioned at each event year along the track.
5. **Rune button** — Opens the Rune Translator overlay.

### Snapping

```ts
function snapToNearestEvent(raw: number): number {
  const snapPoints = [START_YEAR, ...EVENT_YEARS];
  return snapPoints.reduce((best, year) =>
    Math.abs(year - raw) < Math.abs(best - raw) ? year : best
  );
}
```

This prevents the slider from landing on empty years where nothing would change visually. `START_YEAR` (750) is included as a valid snap point so the user can always drag the slider back to the beginning.

---

## The Sidebar & Chronicle

The `Sidebar` is a 360px collapsible panel on the left side of the viewport.

### Chronicle Entries

- Filtered by `activeFilters` — only entries whose `tags` overlap the active filters are shown.
- Sorted chronologically.
- Grouped by era with section headers.
- Each `ChronicleEntry` is expandable (click to reveal full body text and source citation).

### Scroll-to-Era Signal

When the user clicks an era pill in the Timeline:
1. `App` sets `scrollToEra` to the era index.
2. If the sidebar is closed, `App` forces it open via `effectiveSidebarOpen`.
3. `Sidebar`'s `useEffect` scrolls to the corresponding era header element.
4. `onScrollToEraConsumed()` resets the signal to `null`.

This one-way signal pattern prevents circular state updates.

---

## The Info Panel & Hub Panel

### InfoPanel

A 400px slide-in panel on the right edge of the map. Two modes:

- **Event mode**: title, date, Badge, body text, and a "Connected Routes" section with buttons to navigate to any route the event belongs to.
- **Route mode**: route name, description, Badge, and a "Connected Events" list with buttons to navigate to each event on that route.

This bidirectional navigation (event to route and route to event) allows users to explore the relationships between events and the paths that connect them.

### HubPanel

Similar slide-in panel for origin hubs. Shows:

- Hub name and anchor icon
- Historical description paragraph
- Related chronicle entries (looked up by `relatedEntryIds`), sorted chronologically
- Each entry shows date, tags (as Badges), title, body, and source citation
- Uses a sticky close bar so the close button remains accessible while scrolling

---

## Filters

The `FiltersOverlay` is a floating dropdown anchored to a "Filters" button in the top-left of the map area.

- 7 toggles (one per `EventType`) with colored indicators
- Select All / Deselect All checkbox
- Active count badge on the trigger button
- Closes on outside click via `mousedown` listener
- Filter state (`activeFilters`) affects both the map (hotspot/route visibility) and the sidebar (chronicle entry filtering)

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
- Detail sub-pages have a "Back" button (returns to topic grid) and a close button (closes overlay entirely)
- Detail page content is placeholder ("Content coming soon") ready for future expansion

---

## Rune Translator

A full-screen overlay that translates Latin text into runic characters.

### Two Themes

- **Elder Futhark** (c. 150–800 AD) — 24 characters, direct letter mapping
- **Younger Futhark** (c. 800–1100 AD) — 16 characters, the true Viking Age alphabet

### Implementation

```ts
// Special digraphs handled first
lower = lower.replace(/th/g, 'ᚦ');
if (theme === 'elder') lower = lower.replace(/ng/g, 'ᛜ');

// Then character-by-character lookup
return lower.split('').map(char => RUNIC_MAPS[theme][char] || char).join('');
```

Includes copy-to-clipboard with success/error feedback.

---

## Styling System

All styles live in a single `App.css` file using CSS custom properties.

### Design Tokens

```css
/* Event type colors */
--blood: #630707;           /* battle */
--blood-bright: #e40707;    /* raid */
--conquest: #462ff8;        /* conquest */
--gold: #1f8e3e;            /* trade */
--gold-bright: #F59E0B;     /* accents, dates, ships */
--parchment: #f9eccc;       /* settlement */
--exploration: #60e5fa;     /* exploration */

/* Glass effect */
--glass-bg: rgba(12, 21, 36, 0.72);
--glass-border: rgba(255, 255, 255, 0.07);

/* Typography */
--font-heading: 'Outfit', sans-serif;
--font-body: 'Inter', sans-serif;
```

### Visual Language

- **Glassmorphism** — Panels use `backdrop-filter: blur()` with semi-transparent backgrounds
- **Dark maritime theme** — Deep navy/slate backgrounds evoking the North Sea
- **Animated transitions** — Slide-in panels, route dash animations, hover scales
- **Responsive layout** — Flexbox-based, adapts to viewport size

---

## Adding New Content

### Adding a Map Event

1. Add an entry to the `EVENTS` array in `src/data/vikingData.ts`:
   ```ts
   { id: 'unique-id', year: 850, coords: [lng, lat], title: '...', date: '...', tag: 'Raid', body: '...', type: 'raid' }
   ```
2. The event will automatically appear on the map when the timeline reaches its year.

### Adding a Route

1. Add to the `ROUTES` array with an `origin` (hub ID) and `points` (waypoints):
   ```ts
   { id: 'route-id', type: 'raid', origin: 'hub-denmark', points: [[lng, lat], ...], name: '...', description: '...' }
   ```
2. Reference the route ID in an event's `routes` array to link them.

### Adding a Chronicle Entry

1. Add to `TIMELINE_ENTRIES` in `src/data/timelineEntries.ts`:
   ```ts
   { id: 'tl-unique-id', year: 850, date: '850 AD', title: '...', body: '...', source: 'Ch. 3', tags: ['raid'] }
   ```
2. Optionally add the entry's ID to an origin hub's `relatedEntryIds` array.

### Adding a New Era

1. Add to the `ERAS` array in `vikingData.ts` with `min`, `max`, `label`, and `summary`.
2. The Timeline will automatically render a new era pill.

### Adding a New EventType

1. Add the literal to the `EventType` union in `src/types.ts`
2. Add a colour mapping in `Badge.tsx` (`TAG_COLORS`)
3. Add a label mapping in `Badge.tsx` (`TAG_LABELS`)
4. Add the filter entry in `src/data/filterConstants.ts` (`ALL_FILTERS`)
5. Add a colour mapping in `MapContainer.tsx` (`getEventColor`)
6. Add an SVG icon path in `MapContainer.tsx` (`EVENT_ICONS`)
7. Add a CSS variable for the colour in `:root` in `App.css`
8. Add an SVG `<marker>` in `MapContainer.tsx`'s `<defs>` block if it's also a route type
9. Add the icon and description to `MapGuide.tsx` (`EVENT_ICONS` array)

### Adding a Learn More Topic

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

## Performance Notes

- **`useMemo`** for D3 projection and path generator (recomputed only on dimension change)
- **GeoJSON lazy-loaded** on mount via `fetch()`
- **Resize handling** via `addEventListener('resize', ...)` with dimension state
- **CSS transitions** for hardware-accelerated panel animations
- **Slider snapping** prevents unnecessary re-renders on empty years
- **Derived state** computed inline (no extra renders from `useEffect` chains)

---

> The in-app credits block lives in the **About page** (`HomeSplash`). The credits below are for the documentation file only.

### Made by Nicholas Hamilton & America Gaona Borges

**Nicholas Hamilton**
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/hamiltonnBC)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/nicholas-trey-hamilton/)

**America Gaona Borges**
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/gaonaborgesa)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/america-gaona-borges/)
