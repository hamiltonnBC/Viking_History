# Map System

Technical documentation for the D3 + React map implementation.

---

## Overview

The map is the centerpiece of Viking Atlas. It renders an SVG world map with interactive hotspots, animated routes, and origin hub markers — all driven by the timeline slider. The implementation uses D3 for geographic math and React for DOM rendering.

---

## Architecture

### React + D3 Split

| Concern | Handled By |
|---------|-----------|
| Projection (lat/lng → pixels) | D3 `geoMercator` |
| Path generation (GeoJSON → SVG `d`) | D3 `geoPath` |
| Zoom/pan transforms | D3 `zoom` (direct DOM) |
| Element rendering | React JSX |
| State & interactivity | React hooks |
| Styling | CSS classes |

### Why This Approach?

Traditional D3 apps use `d3.select().enter().append()` to create and manage DOM elements. This conflicts with React's virtual DOM — both want to own the DOM. By limiting D3 to math and letting React render, we get:

- Declarative, readable component code
- React DevTools support
- Standard event handling (`onClick`, `onMouseEnter`)
- No manual DOM cleanup

The one exception is **zoom**: D3 zoom directly sets the `transform` attribute on a `<g>` wrapper because React re-renders would be too slow at 60fps during drag.

---

## Projection

```ts
const projection = d3.geoMercator()
  .center([0, 58])              // Centered on Scandinavia/North Atlantic
  .scale(dimensions.width * 0.6) // Scale relative to container width
  .translate([dimensions.width / 2, dimensions.height / 2]);
```

The Mercator projection is chosen because:
- It preserves shapes (conformal)
- It's familiar to users
- Viking activity was concentrated in northern latitudes where Mercator distortion is moderate

---

## SVG Layer Stack

The map SVG contains a single `<g>` element that receives zoom transforms. Inside it, layers render in this order (painter's algorithm — later layers appear on top):

```
<svg>
  <g ref={zoomGroupRef}>        ← receives d3.zoom transform
    1. <path> elements          ← land polygons (GeoJSON features)
    2. <text> elements          ← country labels
    3. <g> route groups         ← polylines with markers
    4. <g> hub markers          ← origin port indicators
    5. <g> hotspot groups       ← event circles with labels
  </g>
</svg>
```

---

## GeoJSON Loading

The world map geometry is loaded asynchronously on mount:

```ts
useEffect(() => {
  fetch(`${import.meta.env.BASE_URL}data/world.geojson`)
    .then(res => res.json())
    .then(data => setGeoData(data))
    .catch(() => setGeoError(true));
}, []);
```

The GeoJSON file lives in `public/data/world.geojson` so it gets a stable URL regardless of bundling.

---

## Hotspots

Each `VikingEvent` renders as a `<circle>` with an adjacent `<text>` label.

### Visibility Rule

```ts
const isVisible = event.year <= currentYear && activeFilters.includes(event.type);
```

### Rendering

```tsx
{visibleEvents.map(event => {
  const [x, y] = projection(event.coords);
  return (
    <g key={event.id} onClick={() => onEventClick(event)}>
      <circle cx={x} cy={y} r={BASE_R / zoomScale} className={`hotspot hotspot--${event.type}`} />
      <text x={x} y={y - offset}>{event.title}</text>
    </g>
  );
})}
```

The radius scales inversely with zoom (`BASE_R / zoomScale`) so hotspots don't become enormous when zoomed in.

---

## Routes

Routes are polylines connecting an origin hub to a series of waypoints.

### Visibility Rule

A route is visible when:
1. Its `type` is in `activeFilters`
2. At least one event that references it (via `routes[]`) has `year <= currentYear`

### Rendering

```tsx
{visibleRoutes.map(route => {
  const hubCoords = ORIGIN_HUBS.find(h => h.id === route.origin)?.coords;
  const allPoints = [hubCoords, ...route.points];
  const pathData = lineGenerator(allPoints.map(p => projection(p)));
  
  return (
    <path
      key={route.id}
      d={pathData}
      className={`route route--${route.type} active`}
      markerEnd="url(#arrowhead)"
    />
  );
})}
```

### Animation

Active routes use a CSS dash animation:

```css
.route.active {
  stroke-dasharray: 8 4;
  animation: dash-flow 1.5s linear infinite;
}
```

---

## Origin Hubs

Fixed markers at departure ports (Denmark, Norway, Sweden, Iceland, England, France).

### Rendering

Each hub renders as a ring + center dot:

```tsx
<g onClick={() => onHubClick(hub)}>
  <circle cx={x} cy={y} r={outerR} className="hub-ring" />
  <circle cx={x} cy={y} r={innerR} className="hub-dot" />
</g>
```

Hubs are always visible on the map. They highlight when routes originating from them are active.

---

## Zoom & Pan

### Setup

```ts
const zoom = d3.zoom<SVGSVGElement, unknown>()
  .scaleExtent([1, 8])
  .on('start', () => setIsDragging(true))
  .on('zoom', (e) => {
    d3.select(zoomGroupRef.current).attr('transform', e.transform.toString());
    setZoomScale(e.transform.k);
  })
  .on('end', () => setIsDragging(false));
```

### Controls

The `ZoomContext` provides three functions to `ZoomControls`:

```ts
handleZoomIn:    scaleBy(1.5)
handleZoomOut:   scaleBy(0.6)
handleZoomReset: transform(zoomIdentity)
```

### Cursor Feedback

```css
.map-svg { cursor: grab; }
.map-svg.dragging { cursor: grabbing; }
```

---

## Resize Handling

The map tracks its container dimensions and recomputes the projection:

```ts
useEffect(() => {
  const updateDimensions = () => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
    }
  };
  window.addEventListener('resize', updateDimensions);
  return () => window.removeEventListener('resize', updateDimensions);
}, []);
```

The projection is memoized and only recomputes when dimensions change.

---

## Tooltips

Route hover shows a tooltip that follows the cursor:

```tsx
{hoveredRoute && (
  <div className="route-tooltip" style={{ left: tooltipPos.x, top: tooltipPos.y }}>
    {hoveredRoute.name}
  </div>
)}
```

Position is tracked via `onMouseMove` on route paths.

---

## Performance

- **Memoized projection**: Only recomputes on dimension change
- **Inverse radius scaling**: Prevents expensive re-renders on zoom
- **CSS animations**: Route dashes animated via CSS, not JavaScript
- **Lazy GeoJSON**: Loaded once on mount, not on every render
- **Zoom via D3**: Bypasses React for 60fps transform updates
