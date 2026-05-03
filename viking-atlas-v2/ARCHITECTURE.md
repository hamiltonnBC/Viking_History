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
State is localized primarily in `App.tsx` using two hooks:
- `currentYear`: Drives the timeline slider, the displayed active Era, and filters which data points and routes appear on the map.
- `selectedEvent`: Controls what information displays in the sliding `InfoPanel`. Clicking a hotspot sets this state.

A third boolean `isHomeVisible` controls the About page overlay (`HomeSplash`), and `isRuneVisible` controls the Rune Translator overlay.

A fourth state variable `scrollToEra: number | null` carries a one-way scroll signal from the Timeline to the Sidebar. It is set when the user clicks an era marker or arrow button, consumed by `Sidebar`'s `useEffect`, and immediately reset to `null` via `onScrollToEraConsumed`.

Because the app is relatively simple, we elevate this state to the top-level container (`App.tsx`) and pass it via standard React props.

### 2. React-driven Data Visualization
Instead of relying on standard `d3.select().enter().append()` patterns which conflict with React's virtual DOM diffing, we employ a **React-driven D3 approach**.

- **Mathematics**: `d3-geo` (specifically `d3.geoMercator` and `d3.geoPath`) computes paths (translating lat/lng arrays into SVG `d` string attributes).
- **Rendering**: React takes over rendering. We iterate over our data arrays (`events`, `routes`) to return standard JSX elements like `<path>`, `<g>`, `<circle>`. This makes the visualization declarative and tightly integrated with React's component lifecycles, and much easier to interpret as typical UI code.

### 3. Component Hierarchy
1. **`App`**: Global state holder.
   - **`Header`**: Renders the app title, era label, and current year in a three-column layout (left: title + era label stacked; centre: year display; right: About button). Computes the active era continuously from the `ERAS` array.
   - **`HomeSplash`**: Full-screen overlay that serves as the **About page**. Contains the app introduction text and the author credits (Nicholas Hamilton & America Gaona Borges). Toggled by the `isHomeVisible` state in `App`.
   - **`MapContainer`**: The core SVG wrapper.
     - Automatically scales on resize via a ResizeObserver or local listener.
     - Maintains a local D3-Zoom instance bound to a `<g>` wrapper.
     - Renders base map polygons extracted and loaded from `public/data/world.geojson`.
     - Renders the trading/raiding `<path>` routes dynamically toggled based on the `currentYear`.
     - Renders the event hotspots (`<circle>`) that are revealed as the timeline progresses.
   - **`ZoomControls`**: Standard buttons (+, -, reset) which trigger the zoomed D3 instance via isolated handler callbacks injected into the window context.
   - **`InfoPanel`**: Absolute positioned HTML overlaid on the map. Slide-in animation is purely CSS-driven based on the presence of a selected event state.
   - **`Sidebar`**: Accepts `activeFilters`, `onToggleFilter`, `scrollToEra`, and `onScrollToEraConsumed` props. When `scrollToEra` is non-null, a `useEffect` switches the active tab to `'chronicle'` and scrolls to the corresponding era section header, then calls `onScrollToEraConsumed` to reset the signal.
   - **`Timeline`**: Controls the `currentYear`. Sliding it directly updates `App` state, causing the whole interface to react synchronously. Also accepts `onEraJump`, called when the user clicks an era marker or the prev/next arrow buttons, which triggers a scroll in the Sidebar chronicle.

## Data Models
See `src/types.ts` for strict typing of the timeline entries. The core concepts split data by **Events** (specific historical milestones and coordinates) and **Routes** (lines drawn between points, which only appear when an event that references them becomes active).
