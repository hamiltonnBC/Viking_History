# Component Reference

This document describes each React component in Viking Atlas, its props, and its responsibilities.

---

## Layout Components

### App (`src/App.tsx`)

The root component. Holds all global state and orchestrates the layout.

**Responsibilities:**
- Manages all top-level state (currentYear, selectedItem, filters, overlays, etc.)
- Computes derived state (effectiveSelectedItem, effectiveSidebarOpen)
- Passes state and callbacks to child components via props

**No props** — this is the root.

---

### Header (`src/components/Header.tsx`)

Fixed top bar displaying the app title, current era, and year.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `currentYear` | `number` | The active year to display |
| `onOpenHome` | `() => void` | Callback to show the About overlay |

**Layout:** Three columns — title + era label (left), year display (center), About button (right).

---

### Timeline (`src/components/Timeline.tsx`)

Fixed bottom bar with the year slider and navigation controls.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `currentYear` | `number` | Current slider position |
| `onYearChange` | `(year: number) => void` | Called when year changes |
| `onOpenRunes` | `() => void` | Opens the Rune Translator |
| `onEraJump` | `(eraIndex: number) => void` | Called when an era pill is clicked |

**Features:**
- Era pill buttons for quick navigation
- Prev/Next event buttons
- Range slider with snapping to nearest event year
- Clickable year tick marks
- Animated fill bar showing progress

---

### Sidebar (`src/components/Sidebar.tsx`)

Collapsible left panel containing the Chronicle.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | Whether the sidebar is expanded |
| `onToggle` | `() => void` | Toggle open/closed |
| `activeFilters` | `EventType[]` | Which event types to show |
| `scrollToEra` | `number \| null` | Era index to scroll to |
| `onScrollToEraConsumed` | `() => void` | Reset scroll signal |

**Features:**
- Filters chronicle entries by active filters
- Groups entries by era with section headers
- Scroll-to-era via requestAnimationFrame
- Entry count badge
- Collapse button on right edge

---

## Map Components

### MapContainer (`src/components/Map/MapContainer.tsx`)

The core SVG map with all geographic rendering.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `currentYear` | `number` | Controls hotspot/route visibility |
| `events` | `VikingEvent[]` | All map events |
| `routes` | `Route[]` | All route polylines |
| `originHubs` | `OriginHub[]` | Departure port markers |
| `activeFilters` | `EventType[]` | Which types are visible |
| `onEventClick` | `(event: VikingEvent) => void` | Hotspot click handler |
| `onRouteClick` | `(route: Route) => void` | Route click handler |
| `onHubClick` | `(hub: OriginHub) => void` | Hub click handler |

**Rendering layers (bottom to top):**
1. GeoJSON land polygons
2. Country labels
3. Route polylines with arrowheads
4. Origin hub markers (ring + dot)
5. Event hotspot circles with labels

**D3 integration:**
- `d3.geoMercator()` for projection
- `d3.geoPath()` for SVG path generation
- `d3.zoom()` for pan/zoom (directly manipulates `<g>` transform)

---

### ZoomControls (`src/components/Map/ZoomControls.tsx`)

Floating buttons for map zoom control.

**Props:** None (uses `ZoomContext` to access zoom callbacks).

**Buttons:** Zoom In (+), Zoom Out (−), Reset.

---

### ZoomContext (`src/components/Map/ZoomContext.tsx`)

React context that exposes zoom control functions from MapContainer to ZoomControls.

```ts
interface ZoomControls {
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleZoomReset: () => void;
}
```

---

## Panel Components

### InfoPanel (`src/components/InfoPanel.tsx`)

Slide-in panel on the right edge for event and route details.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `selectedItem` | `VikingEvent \| Route \| null` | What to display |
| `onClose` | `() => void` | Close the panel |
| `onEventClick` | `(event: VikingEvent) => void` | Click a connected event |

**Two modes:**
- **Event mode**: Title, date, Badge, body text
- **Route mode**: Name, description, connected events as clickable buttons

---

### HubPanel (`src/components/HubPanel.tsx`)

Slide-in panel for origin hub details.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `hub` | `OriginHub \| null` | Hub to display |
| `onClose` | `() => void` | Close the panel |

**Content:**
- Hub name with anchor icon
- Historical description
- Related chronicle entries (sorted chronologically)
- Each entry shows date, tags, title, body, source

---

### FiltersOverlay (`src/components/FiltersOverlay.tsx`)

Floating dropdown for event type filtering.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | Whether dropdown is visible |
| `onToggle` | `() => void` | Toggle dropdown |
| `activeFilters` | `EventType[]` | Currently active types |
| `onToggleFilter` | `(type: EventType) => void` | Toggle a single filter |
| `onSelectAll` | `() => void` | Toggle all on/off |
| `toggleRef` | `RefObject<HTMLButtonElement>` | Ref for positioning |

---

## Overlay Components

### HomeSplash (`src/components/HomeSplash.tsx`)

Full-screen About page overlay.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `isVisible` | `boolean` | Show/hide the overlay |
| `onEnter` | `() => void` | Dismiss and enter the app |

**Content:**
- Project description
- Usage instructions
- Creator credits (Nicholas Hamilton & America Gaona Borges)
- Professor attribution (Dr. Tyler Sergent)
- GitHub and LinkedIn links

---

### RuneTranslator (`src/components/RuneTranslator.tsx`)

Full-screen rune translation overlay.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `isVisible` | `boolean` | Show/hide the overlay |
| `onClose` | `() => void` | Close the overlay |

**Features:**
- Text input field
- Two theme cards (Elder Futhark / Younger Futhark)
- Real-time rune output
- Copy-to-clipboard with status feedback

---

## Shared Components

### Badge (`src/components/Badge.tsx`)

Reusable colored pill displaying an event type label.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `tag` | `EventType` | Determines color and label text |

---

### ChronicleEntry (`src/components/ChronicleEntry.tsx`)

Expandable card for a single chronicle entry in the Sidebar.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `entry` | `TimelineEntry` | The entry data to render |

**Features:**
- Click to expand/collapse
- Shows date, tags (as Badges), title
- Expanded: body text, source citation
- Chevron rotation animation
