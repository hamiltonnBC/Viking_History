# Viking Atlas Architecture

## Overview
Viking Atlas has been rewritten in React and TypeScript using Vite to provide a more scalable, maintainable, and type-safe architecture compared to the legacy vanilla Javascript and D3 manipulation approach.

## Tech Stack
- **React**: Manages UI state, renders components declaratively.
- **TypeScript**: Ensures type safety across all domain entities (e.g., `VikingEvent`, `Era`, `Route`).
- **Vite**: Provides a fast, modern build environment.
- **D3.js (d3-geo & d3-zoom)**: Calculates complex map projections and zoom transforms, but does *not* directly manipulate the DOM.
- **Vanilla CSS (App.css)**: Retains the original aesthetic with minimal overhead.

## Core Concepts

### 1. State Management
State is localized primarily in `App.tsx` using the following hooks:
- `currentYear`: Drives the timeline slider, the displayed active Era, and filters which data points and routes appear on the map.
- `selectedItem: VikingEvent | Route | null`: Controls what information displays in the sliding `InfoPanel`. Clicking a hotspot or a route sets this state. Two helper functions (`isVikingEvent`, `isRoute`) inside `InfoPanel.tsx` discriminate between the two types.
- `selectedHub: OriginHub | null`: Controls the `HubPanel` slide-in for origin country details.
- `isHomeVisible`: Controls the About page overlay (`HomeSplash`).
- `isRuneVisible`: Controls the Rune Translator overlay.
- `isDetailsVisible`: Controls the Details page overlay (`DetailsPage`).
- `isMapGuideVisible`: Controls the Map Guide overlay (`MapGuide`).
- `isLearnMoreVisible`: Controls the Learn More overlay (`LearnMore`).
- `isSidebarOpen`: Controls whether the Chronicle sidebar is expanded or collapsed.
- `isFiltersOpen`: Controls whether the `FiltersOverlay` dropdown is visible.
- `scrollToEra: number | null`: Carries a one-way scroll signal from the Timeline to the Sidebar. It is set when the user clicks an era pill, consumed by `Sidebar`'s `useEffect`, and immediately reset to `null` via `onScrollToEraConsumed`. If the sidebar is closed when the signal fires, `App` reopens it first.

Because the app is relatively simple, we elevate this state to the top-level container (`App.tsx`) and pass it via standard React props.

### 2. React-driven Data Visualization
Instead of relying on standard `d3.select().enter().append()` patterns which conflict with React's virtual DOM diffing, we employ a **React-driven D3 approach**.

- **Mathematics**: `d3-geo` (specifically `d3.geoMercator` and `d3.geoPath`) computes paths (translating lat/lng arrays into SVG `d` string attributes).
- **Rendering**: React takes over rendering. We iterate over our data arrays (`events`, `routes`) to return standard JSX elements like `<path>`, `<g>`, `<circle>`. This makes the visualization declarative and tightly integrated with React's component lifecycles, and much easier to interpret as typical UI code.

### 3. Map Icons
Map hotspots use thematic SVG icons instead of plain circles. Each `EventType` has a unique icon shape defined in the `EVENT_ICONS` map at the top of `MapContainer.tsx`:

| EventType | Icon |
|-----------|------|
| raid | Crossed axes |
| settlement | House with peaked roof |
| trade | Ship/boat |
| conquest | Crown |
| exploration | Compass rose |
| battle | Crossed swords |
| origin | Viking shield (circle with cross) |

Icons are rendered as `<path>` elements scaled relative to the zoom level, with a subtle glow filter (`#icon-glow`) and a faint background circle for visibility against the dark map.

### 4. Component Hierarchy
1. **`App`**: Global state holder.
   - **`Header`**: Renders the app title, era label, and current year in a three-column layout (left: title + era label stacked; centre: year display; right: nav buttons). Contains buttons for About, Map Guide, Learn More, and Details overlays.
   - **`HomeSplash`**: Full-screen overlay that serves as the **About page**. Contains the app introduction text and the author credits (Nicholas Hamilton & America Gaona Borges). Toggled by the `isHomeVisible` state in `App`.
   - **`DetailsPage`**: Full-screen overlay with application meta-information. Documents that the era categories (Age of Raids, Age of Conquest & Settlement, Age of Kings, End of the Viking Age) are not formally recognised academic periodisations and were inspired by a History.com article. Also covers data sources and technology.
   - **`MapGuide`**: Full-screen overlay with a two-column layout showing all event icons with descriptions and all route colour types with descriptions. Serves as a visual legend for the map.
   - **`LearnMore`**: Full-screen overlay with a grid of topic cards (Who Were the Vikings?, Spread of Christianity, History During the Viking Age, Ships and Seafaring, Trade and Economy, Legacy and Influence). Each card navigates to a dedicated detail sub-page with a back button and close button. Detail pages are placeholders for future content.
   - **`RuneTranslator`**: Full-screen overlay for translating text into Elder Futhark runes.
   - **`MapContainer`**: The core SVG wrapper.
     - Automatically scales on resize via a local listener.
     - Maintains a local D3-Zoom instance bound to a `<g>` wrapper.
     - Renders base map polygons extracted and loaded from `public/data/world.geojson`.
     - Renders the trading/raiding `<path>` routes dynamically toggled based on the `currentYear`.
     - Renders the event hotspots as thematic SVG icons that are revealed as the timeline progresses.
     - Renders origin hub markers (country dots) that open the `HubPanel` on click.
   - **`ZoomControls`**: Standard buttons (+, -, reset) which trigger the zoomed D3 instance via the `ZoomContext` provider.
   - **`FiltersOverlay`**: Floating dropdown anchored to a "Filters" button in the top-left of the map. Manages per-type filter toggles and a select-all control. Closes on outside click via a `mousedown` listener.
   - **`InfoPanel`**: Absolute positioned HTML overlaid on the map. Slide-in animation is purely CSS-driven based on whether `selectedItem` is non-null. Renders in two modes:
     - **Event mode**: title, date, badge, body, and a "Connected Routes" section with buttons to navigate to any route the event belongs to.
     - **Route mode**: name, description, badge, and a "Connected Events" list with buttons to navigate to each event on that route.
   - **`HubPanel`**: Slide-in panel for origin hub (country) details. Shows the country name, description, and a chronological list of related Chronicle entries. Uses a sticky close bar so the close button remains accessible while scrolling.
   - **`Sidebar`**: Collapsible Chronicle panel. Accepts `isOpen`, `onToggle`, `activeFilters`, `scrollToEra`, and `onScrollToEraConsumed` props. When `scrollToEra` is non-null, a `useEffect` scrolls to the corresponding era section header and calls `onScrollToEraConsumed` to reset the signal.
   - **`Timeline`**: Controls the `currentYear`. Sliding it directly updates `App` state, causing the whole interface to react synchronously. Also accepts `onEraJump`, called when the user clicks an era pill, which triggers a scroll in the Sidebar chronicle. The slider snaps to event years and also includes `START_YEAR` (750) as a valid snap point so the user can always return to the beginning.

## Data Models
See `src/types.ts` for strict typing of the timeline entries. The core concepts split data by **Events** (specific historical milestones and coordinates) and **Routes** (lines drawn between points, which only appear when an event that references them becomes active).

## Overlay Pages

The application uses full-screen overlay components rather than client-side routing. Each overlay is toggled by a boolean state in `App.tsx` and uses the same slide-in/out CSS animation pattern (`.visible` / `.hidden` classes with `transform` and `opacity` transitions).

| Page | Component | Trigger | Purpose |
|------|-----------|---------|---------|
| About | `HomeSplash` | "About" header button | App introduction and credits |
| Map Guide | `MapGuide` | "Map Guide" header button | Visual legend for icons and route colours |
| Learn More | `LearnMore` | "Learn More" header button | Topic grid with sub-pages for deeper reading |
| Details | `DetailsPage` | "Details" header button | Meta-info about era categories and data sources |
| Rune Translator | `RuneTranslator` | "Write your name in Runes!" button in Timeline | Translates text to Elder Futhark runes |
