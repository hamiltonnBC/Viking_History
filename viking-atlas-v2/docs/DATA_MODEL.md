# Data Model Reference

This document describes all data types and datasets used in Viking Atlas.

---

## Core Types

All types are defined in `src/types.ts`.

### EventType

```ts
type EventType = 'origin' | 'raid' | 'settlement' | 'trade' | 'conquest' | 'exploration' | 'battle';
```

Controls map dot colors, route visibility, sidebar filtering, and badge rendering.

| Type | Color Variable | Label | Description |
|------|---------------|-------|-------------|
| `origin` | `--gold-bright` | Ships | Shipbuilding, burial customs, pre-raid culture |
| `raid` | `--blood-bright` | Raids | Strikes on monasteries, towns, coastlines |
| `settlement` | `--parchment` | Settlements | Permanent Norse communities abroad |
| `trade` | `--gold` | Trade Routes | Merchant networks from Baltic to Byzantium |
| `exploration` | `--exploration` | Exploration | Atlantic voyages to Iceland, Greenland, Vinland |
| `battle` | `--blood` | Battles | Naval and land engagements |
| `conquest` | `--conquest` | Conquests | Permanent territorial takeovers |

### RouteType

```ts
type RouteType = 'raid' | 'exploration' | 'trade';
```

A subset of EventType used specifically for route polylines.

---

## Interfaces

### VikingEvent

A point on the map representing a historical event.

```ts
interface VikingEvent {
  id: string;              // Unique identifier (e.g. "lindisfarne-793")
  year: number;            // Year the event becomes visible (e.g. 793)
  coords: [number, number]; // [longitude, latitude] — D3 convention
  title: string;           // Display title
  date: string;            // Human-readable date (e.g. "June 8, 793 AD")
  tag: string;             // Badge label (e.g. "Raid")
  body: string;            // Prose description for InfoPanel
  type: EventType;         // Determines color and filter membership
  routes?: string[];       // IDs of Route objects activated with this event
}
```

### Route

A polyline connecting an origin hub to a destination.

```ts
interface Route {
  id: string;              // Unique identifier (e.g. "route-lindisfarne")
  type: RouteType;         // Determines line style and filter membership
  origin: string;          // ID of the OriginHub this route departs from
  points: [number, number][]; // Waypoints as [lng, lat] pairs
  name: string;            // Display name (e.g. "Lindisfarne Raid Route")
  description: string;     // Prose for InfoPanel route view
}
```

### OriginHub

A fixed departure port on the map.

```ts
interface OriginHub {
  id: string;              // e.g. "hub-denmark"
  label: string;           // e.g. "Denmark"
  coords: [number, number]; // [longitude, latitude]
  description: string;     // Historical context paragraph
  relatedEntryIds: string[]; // IDs of TimelineEntry objects linked to this hub
}
```

### Era

A named historical period.

```ts
interface Era {
  min: number;             // Start year (inclusive)
  max: number;             // End year (inclusive)
  label: string;           // Display name (e.g. "Early Raids")
  summary: string;         // Tooltip text
}
```

### TimelineEntry

A scholarly chronicle entry (defined in `src/data/timelineEntries.ts`).

```ts
interface TimelineEntry {
  id: string;              // e.g. "tl-lindisfarne"
  year: number;            // Chronological position
  date: string;            // Display date (e.g. "793 AD")
  title: string;           // Entry headline
  body: string;            // Full paragraph
  source: string;          // Citation (e.g. "Ch. 1, p. 12")
  tags: EventType[];       // Links to filter system
}
```

### FilterDescriptor

Metadata for each filter toggle (defined in `src/data/filterConstants.ts`).

```ts
interface FilterDescriptor {
  type: EventType;
  label: string;           // UI label
  color: string;           // CSS variable reference
  description: string;     // Tooltip/description text
}
```

---

## Data Files

### `src/data/vikingData.ts`

The primary dataset. Exports:

| Export | Type | Description |
|--------|------|-------------|
| `START_YEAR` | `750` | Timeline start |
| `END_YEAR` | `1408` | Timeline end |
| `ERAS` | `Era[]` | Historical period definitions |
| `EVENTS` | `VikingEvent[]` | All map hotspots |
| `ROUTES` | `Route[]` | All route polylines |
| `ORIGIN_HUBS` | `OriginHub[]` | Departure ports (6 hubs) |
| `EVENT_YEARS` | `number[]` | Sorted, deduplicated event years |

### `src/data/timelineEntries.ts`

Exports `TIMELINE_ENTRIES: TimelineEntry[]` — the scholarly chronicle entries displayed in the Sidebar.

### `src/data/filterConstants.ts`

Exports `ALL_FILTERS: FilterDescriptor[]` — the 7 filter definitions with metadata.

---

## Relationships Between Data

```
OriginHub
  ├── relatedEntryIds[] ──→ TimelineEntry.id
  └── id ←── Route.origin

VikingEvent
  └── routes[] ──→ Route.id

TimelineEntry
  └── tags[] ──→ EventType (shared with VikingEvent.type)
```

- A **Route** originates from an **OriginHub** (via `origin` field).
- A **VikingEvent** activates one or more **Routes** (via `routes` field).
- An **OriginHub** links to **TimelineEntries** (via `relatedEntryIds`).
- Both **VikingEvent** and **TimelineEntry** use **EventType** for filtering.

---

## Coordinate Convention

All coordinates use **[longitude, latitude]** order, which is the D3/GeoJSON convention. This is the opposite of Google Maps' [lat, lng] convention.

Examples:
- Denmark: `[9.8, 55.8]`
- Norway: `[10.4, 59.9]`
- Lindisfarne: `[-1.8, 55.67]`
