# Contributing Guide

How to add content, run the project, and maintain code quality.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
cd viking-atlas-v2
npm install
npm run dev
```

The dev server starts at `http://localhost:5173/Viking_History/`.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | TypeScript check + production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests (single pass) |
| `npm run test:watch` | Run tests in watch mode |

---

## Adding Historical Content

### New Map Event

1. Open `src/data/vikingData.ts`
2. Add to the `EVENTS` array:

```ts
{
  id: 'unique-kebab-id',
  year: 850,
  coords: [-1.5, 54.0],    // [longitude, latitude]
  title: 'Event Title',
  date: '850 AD',
  tag: 'Raid',
  body: 'Detailed description of the event...',
  type: 'raid',
  routes: ['route-id'],     // optional: link to routes
}
```

3. The event appears automatically when the timeline reaches its year.

### New Route

1. Add to the `ROUTES` array in `vikingData.ts`:

```ts
{
  id: 'route-unique-id',
  type: 'raid',
  origin: 'hub-denmark',    // must match an OriginHub id
  points: [
    [2.3, 48.8],            // waypoint 1 [lng, lat]
    [0.1, 51.5],            // waypoint 2
  ],
  name: 'Route Display Name',
  description: 'Description shown in the InfoPanel...',
}
```

2. Reference the route's ID in an event's `routes` array to link them.

### New Chronicle Entry

1. Open `src/data/timelineEntries.ts`
2. Add to `TIMELINE_ENTRIES`:

```ts
{
  id: 'tl-unique-id',
  year: 850,
  date: '850 AD',
  title: 'Entry Title',
  body: 'Scholarly description...',
  source: 'Winroth, Ch. 4',
  tags: ['raid', 'battle'],
}
```

3. Optionally add the ID to an origin hub's `relatedEntryIds` in `vikingData.ts`.

### New Origin Hub

1. Add to `ORIGIN_HUBS` in `vikingData.ts`:

```ts
{
  id: 'hub-unique',
  label: 'Hub Name',
  coords: [lng, lat],
  description: 'Historical context...',
  relatedEntryIds: ['tl-entry-1', 'tl-entry-2'],
}
```

### New Era

1. Add to the `ERAS` array in `vikingData.ts`:

```ts
{
  min: 1100,
  max: 1200,
  label: 'Era Name',
  summary: 'Brief tooltip description',
}
```

2. Ensure eras don't overlap and cover the full timeline range.

---

## Code Conventions

### TypeScript

- Strict mode enabled
- All component props have explicit interfaces
- Use `type` imports for type-only imports
- Prefer `interface` for object shapes, `type` for unions

### Components

- Functional components only (no class components)
- Named exports (not default exports)
- Props interface defined above the component
- Use `clsx` for conditional classNames

### CSS

- All styles in `App.css`
- Use CSS custom properties for any value that might be reused
- BEM-like naming: `.component-name`, `.component-name__element`, `.component-name--modifier`
- No inline styles except for dynamic values (positions, percentages)

### Data

- All coordinates in `[longitude, latitude]` order
- IDs use kebab-case
- Years are integers (no decimals)
- Body text can include basic prose but no HTML

---

## Project Structure Rules

- **Components** go in `src/components/` (or `src/components/Map/` for map-specific ones)
- **Data files** go in `src/data/`
- **Utility functions** go in `src/utils/`
- **Types** shared across files go in `src/types.ts`
- **Static assets** go in `public/` (for files that need a stable URL) or `src/assets/` (for imports)

---

## Deployment

The app deploys as a static site. The build output goes to `dist/`.

```bash
npm run build
```

### Base Path

The base path defaults to `/Viking_History/` for GitHub Pages. Override with:

```bash
VITE_BASE_PATH=/custom-path/ npm run build
```

### GitHub Pages

The project includes a GitHub Actions workflow for automatic deployment on push to main.

---

## Testing

Tests use Vitest with React Testing Library and fast-check for property-based testing.

```bash
npm run test          # single run
npm run test:watch    # watch mode
```

Place test files adjacent to the code they test or in a `__tests__` directory.
