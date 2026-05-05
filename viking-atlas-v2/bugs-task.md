# Bug & Issue Tracker

## Actual Bugs

### 1. Favicon path is wrong
- **File:** `index.html`
- **Issue:** References `/vite.svg` but the actual file is `public/favicon.svg`. With `base: '/Viking_History/'` in vite.config, this will 404 in production.
- **Fix:** Change to the correct favicon path.
- **Status:** ☑ DONE

### 2. Google Fonts mismatch between index.html and index.css
- **File:** `index.html`, `src/index.css`
- **Issue:** `index.html` loads `Cinzel Decorative`, `IM Fell English` — neither is used anywhere. The fonts the app actually uses (`Outfit`, `Inter`) are loaded only via `index.css`, causing a flash of unstyled text. The `index.html` `<link>` tag is dead weight.
- **Fix:** Remove the unused font link from `index.html`. Optionally move the real font import into `index.html` for faster loading.
- **Status:** ☑ DONE — Replaced with correct fonts in index.html, removed @import from index.css, added preconnect hints.

### 3. InfoPanel splits on `<br><br>` but no event body contains that string
- **File:** `src/components/InfoPanel.tsx`
- **Issue:** `event.body.split('<br><br>')` is a no-op since no body text contains that delimiter. Misleading code that will confuse future contributors.
- **Fix:** Remove the split or document the convention. If multi-paragraph bodies are desired, use `\n\n` as the delimiter and split on that.
- **Status:** ☑ DONE — Changed delimiter to `\n\n`.

### 4. Exploration badge color inconsistency
- **File:** `src/components/Badge.tsx`, `src/data/filterConstants.ts`
- **Issue:** `filterConstants.ts` and the map hotspots use `#60a5fa` (blue) for exploration, but `Badge.tsx` uses `var(--text-primary)` (white). The badge in the InfoPanel renders white while everything else is blue.
- **Fix:** Change `Badge.tsx` exploration color to `#60a5fa` to match.
- **Status:** ☑ DONE

### 5. `@types/d3` in production dependencies
- **File:** `package.json`
- **Issue:** `@types/d3` is listed under `dependencies` instead of `devDependencies`. Type packages are dev-only.
- **Fix:** Move to `devDependencies`.
- **Status:** ☑ DONE

---

## Design/Architecture Issues

### 6. Zoom controls coupled via window global
- **File:** `src/components/Map/MapContainer.tsx`, `src/components/Map/ZoomControls.tsx`
- **Issue:** Zoom handlers are exposed on `(window as any).__vikingMapZoomControls`. Fragile coupling that pollutes global scope and breaks in SSR.
- **Fix:** Use React context or a callback ref pattern.
- **Status:** ☑ DONE — Created `ZoomContext.tsx`, MapContainer provides context, ZoomControls consumes it.

### 7. Fast Refresh violations
- **Files:** `src/components/RuneTranslator.tsx`, `src/components/Timeline.tsx`
- **Issue:** Both export utility functions alongside components. Vite's React Fast Refresh requires modules to export only components — edits trigger full page reloads instead of hot updates.
- **Fix:** Move `translateToRunes()` and `getActiveEraIndex()` to separate utility files.
- **Status:** ☑ DONE — Extracted to `src/utils/runeTranslator.ts` and `src/utils/timelineUtils.ts`.

### 8. No error state for GeoJSON loading failure
- **File:** `src/components/Map/MapContainer.tsx`
- **Issue:** If `world.geojson` fails to load, the map renders empty with no user feedback.
- **Fix:** Add an error state and display a fallback message.
- **Status:** ☑ DONE — Added `geoError` state, HTTP status check, and fallback UI overlay.

### 9. Route `route-volga` has non-sequential points
- **File:** `src/data/vikingData.ts`
- **Issue:** Points go Scandinavia (59°N) → Constantinople (41°N) → central Russia (55°N) → east (55°N). Geographically the Volga route went Scandinavia → through Russia → down to Constantinople.
- **Fix:** Reorder to `[[18.0, 59.3], [37.6, 55.7], [49.1, 55.8], [28.9, 41.0]]`.
- **Status:** ☑ DONE

---

## Minor/Cosmetic

### 10. Package name is `vite_temp`
- **File:** `package.json`
- **Fix:** Rename to `viking-atlas` or similar.
- **Status:** ☑ DONE

### 11. Hardcoded base path
- **File:** `vite.config.ts`
- **Issue:** `base: '/Viking_History/'` only works for that exact deploy path.
- **Fix:** Make configurable via env variable if needed for multiple environments.
- **Status:** ☑ DONE — Now reads `VITE_BASE_PATH` env var with `/Viking_History/` as fallback.

### 12. HomeSplash uses `position: absolute` inside flex parent
- **File:** `src/App.css`
- **Issue:** Works now but fragile if layout changes.
- **Status:** ☑ DONE — Changed to `position: fixed` for viewport-relative positioning.
