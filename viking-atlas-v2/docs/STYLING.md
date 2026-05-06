# Styling Guide

Viking Atlas uses a single `App.css` file with CSS custom properties for theming. No CSS framework or CSS-in-JS library is used.

---

## Design Philosophy

- **Glassmorphism** — Semi-transparent panels with backdrop blur
- **Dark maritime theme** — Deep navy/slate backgrounds evoking the North Sea at night
- **Warm accents** — Gold, amber, and fire tones for interactive elements
- **Minimal motion** — Smooth transitions that don't distract from content

---

## Design Tokens

### Colors

```css
:root {
  /* Event type colors */
  --blood: #630707;              /* battle */
  --blood-bright: #e40707;       /* raid */
  --conquest: #462ff8;           /* conquest */
  --gold: #1f8e3e;              /* trade */
  --gold-bright: #F59E0B;       /* accents, dates, origin/ships */
  --parchment: #f9eccc;         /* settlement */
  --exploration: #60e5fa;       /* exploration */

  /* Map colors */
  --sea: #0c1524;               /* map background */
  --sea-dark: #040a27;          /* outer map background */
  --land: #172033;              /* country fill */
  --land-stroke: #2a3a52;       /* country borders */

  /* Glass effect */
  --glass-bg: rgba(12, 21, 36, 0.72);
  --glass-border: rgba(255, 255, 255, 0.07);
  --glass-border-light: rgba(255, 255, 255, 0.12);

  /* Text */
  --text-primary: #F1F5F9;
  --text-secondary: #94A3B8;
  --text-muted: #64748B;
}
```

### Typography

```css
:root {
  --font-heading: 'Outfit', sans-serif;
  --font-body: 'Inter', sans-serif;
}
```

Fonts are loaded from Google Fonts in `index.html`. Cinzel is used decoratively in the header.

### Spacing & Radius

```css
:root {
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;
}
```

### Shadows

```css
:root {
  --shadow-ambient: 0 8px 32px rgba(0, 0, 0, 0.4);
  --shadow-elevated: 0 16px 48px rgba(0, 0, 0, 0.6);
}
```

### Easing

```css
:root {
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

---

## Layout Structure

```
┌─────────────────────────────────────────────────┐
│  Header (fixed top, z-100)                      │
├──────────┬──────────────────────────────────────┤
│          │                                      │
│ Sidebar  │  Map Holder (flex: 1)                │
│ (360px)  │  ┌──────────────────────────────┐    │
│ z-40     │  │  SVG Map                     │    │
│          │  │                              │    │
│          │  │  [ZoomControls] bottom-left   │    │
│          │  │  [Filters] top-left           │    │
│          │  │  [InfoPanel] right edge       │    │
│          │  │  [HubPanel] right edge        │    │
│          │  └──────────────────────────────┘    │
├──────────┴──────────────────────────────────────┤
│  Timeline (fixed bottom, z-100)                 │
└─────────────────────────────────────────────────┘

Overlays (z-900+): HomeSplash, RuneTranslator
```

---

## Z-Index Scale

| Layer | Z-Index | Components |
|-------|---------|------------|
| Base | 0 | Map SVG, land polygons |
| Sidebar | 40 | Chronicle panel |
| Filters | 46 | FiltersOverlay dropdown |
| InfoPanel | 50 | Event/route detail panel |
| HubPanel | 51 | Origin hub detail panel |
| Header | 100 | Top bar |
| Timeline | 100 | Bottom bar |
| Overlays | 900+ | HomeSplash, RuneTranslator |

---

## Glass Effect Pattern

Used on panels, overlays, and controls:

```css
.panel {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-ambient);
}
```

---

## Animation Patterns

### Slide-in Panels

```css
.info-panel {
  transform: translateX(100%);
  transition: transform 0.35s var(--ease-out);
}
.info-panel.open {
  transform: translateX(0);
}
```

### Route Dash Animation

```css
.route.active {
  stroke-dasharray: 8 4;
  animation: dash-flow 1.5s linear infinite;
}
@keyframes dash-flow {
  to { stroke-dashoffset: -24; }
}
```

### Hotspot Hover

```css
.hotspot:hover {
  transform: scale(1.3);
  filter: brightness(1.2);
}
```

---

## Event Type Color Mapping

When rendering badges, dots, or route strokes, use these CSS variables:

| EventType | CSS Variable | Hex |
|-----------|-------------|-----|
| `origin` | `--gold-bright` | #F59E0B |
| `raid` | `--blood-bright` | #e40707 |
| `settlement` | `--parchment` | #f9eccc |
| `trade` | `--gold` | #1f8e3e |
| `exploration` | `--exploration` | #60e5fa |
| `battle` | `--blood` | #630707 |
| `conquest` | `--conquest` | #462ff8 |

---

## Responsive Behavior

- The map fills all available space (`flex: 1`)
- Sidebar collapses to 0 width when closed (slides off-screen)
- Header and Timeline are fixed and always visible
- Panels overlay the map rather than pushing content
- Map dimensions update on window resize

---

## Adding New Styles

1. Define any new tokens as CSS custom properties in `:root`
2. Use existing tokens wherever possible for consistency
3. Follow the glass effect pattern for new panels
4. Use `var(--ease-out)` for standard transitions
5. Use `clsx` for conditional class application in components
