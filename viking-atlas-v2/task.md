# Route Accuracy Fixes

## Tasks

### 1. Split Volga Trade Route into two distinct routes (Volga → Caspian, Dnieper → Constantinople)
- **Status:** DONE
- **Issue:** The app conflates two separate historical routes into one. The Volga went to the Caspian Sea/Arab Caliphate. The Dnieper went to Constantinople. Constantinople cannot be reached via the Volga.
- **Fix:** Create a new "Dnieper Trade Route" (Sweden → Smolensk → Constantinople) and update the existing Volga route to terminate at the Caspian Sea. Update event linkages accordingly.

### 2. Fix Siege of Paris (845) route linkage
- **Status:** DONE
- **Issue:** `spot-paris-845` has `routes: ['route-nantes']` (Loire Raid Route), but Paris is on the Seine. The route-seine description even mentions carrying fleets to Paris in 845.
- **Fix:** Change `routes: ['route-nantes']` to `routes: ['route-seine']` on the Paris event.

### 3. Fix Iceland Settlement Route waypoint (Hebrides → Faroe Islands)
- **Status:** DONE
- **Issue:** The intermediate waypoint `[-6.4, 56.3]` is near the Outer Hebrides. The reference document states the route went via the Faroe Islands (~[-7, 62]), which are significantly further north.
- **Fix:** Update the waypoint coordinates to approximately `[-7.0, 62.0]` (Faroe Islands) and update the description to say "via the Faroe Islands" instead of "via the Scottish islands."

### 4. Reclassify Mediterranean Expedition route from 'exploration' to 'raid'
- **Status:** DONE
- **Issue:** The 859 Mediterranean expedition was a raiding fleet (62 ships attacking Morocco, southern France, Italy). The reference document categorizes it under "Western Raid and Coastal Routes," not exploration.
- **Fix:** Change `type: 'exploration'` to `type: 'raid'` on `route-mediterranean`. Also consider reclassifying the linked event `spot-mediterranean` from type `exploration` to `raid`.

### 5. Fix Western Raid Route (route-france) — Rollo was Norwegian, not Danish
- **Status:** DONE
- **Issue:** The route originates from `hub-denmark` and the description attributes it to Rollo, who is traditionally considered Norwegian (from Møre). 
- **Fix:** Either change the origin to `hub-norway` or rewrite the description to avoid specifically naming Rollo and instead describe it as a general raiding corridor to the Frankish coast.

### 6. Add missing Scandinavian Coastal Navigation Route
- **Status:** DONE
- **Issue:** The reference document describes domestic protected navigation routes through the Baltic archipelago and along Norway's coast (used by merchants like Ottar in the late 9th century). This route category doesn't exist in the app.
- **Fix:** Add a new route of type `trade` representing coastal/archipelago navigation within Scandinavia.
