# AI Implementation Brief — Nicetown Map: "Path Forward" Perspective, Performance Mode & 3D People

**Read this whole brief before writing any code.** Do not assume my file structure, framework, or existing variable names. Inspect the actual `/map` and `/simple-map` code first, then adapt these patterns to whatever is already there. Where I show code, treat it as a *pattern to integrate*, not a drop-in file.

There are three deliverables in priority order:

1. **A "Path Forward" perspective toggle** — switch the map between *Full Reality* (problems + solutions) and *Solutions Only* (only real, currently-actionable community solutions).
2. **Request Render Mode** — stop continuously re-rendering the whole globe so the map stops lagging.
3. **Constrain the scene to Nicetown + Hunting Park** — so we're not paying to stream the entire Earth when we only ever look at one neighborhood.

Plus a short note on **where the CUTES GLB people models go**.

**Before any of that**, there's a *Foundation Layers* section covering the three base data layers (Features 1–3: building footprints, road/curb polygons, green-space polygons). The toggle and performance work in Deliverables 1–3 operate *on* these layers, so build/confirm them first. If a layer already exists in the codebase, skip its build steps and just make sure it carries the `narrativeRole` / `popupContent` / unique-ID properties described below.

---

## Foundation Layers — Features 1, 2, 3 (build or confirm these first)

These are the source-data layers everything else sits on. Every one of them must, at the end of its build, satisfy the **four shared requirements** below — that's what lets the toggle, popups, and admin system work later. I'll state them once here and not repeat them per feature:

- **Tag it:** set `entity.properties` with `narrativeRole`, a unique `id`, and a `popupContent` string (see Deliverable 1 for the `PropertyBag` shape).
- **Render it:** call `viewer.scene.requestRender()` inside the data source's load `.then()` after all entities are styled (see Deliverable 2 — nothing draws without this).
- **Bound it:** load only data inside the Nicetown + Hunting Park extent (see Deliverable 3). **Strongly preferred: pre-clip the GeoJSON to the neighborhood in QGIS before it ever reaches the browser** — you already have QGIS and the neighborhood tracts isolated, so clip each source layer to the Nicetown rectangle and export a small GeoJSON. City-wide GeoJSON loaded client-side is the #1 cause of the lag you're trying to fix.
- **Make it clickable:** rely on Cesium's built-in InfoBox for now — set `entity.description` to the placeholder, and the popup works on click with no extra code. The admin system replaces `description` from `popupContent` later (Feature 12).

A generic loader pattern all three reuse:

```js
async function loadLayer(url, styleFn, role) {
  const ds = await Cesium.GeoJsonDataSource.load(url, { clampToGround: true });
  let i = 0;
  for (const e of ds.entities.values) {
    const props = readGeoJsonProps(e);                 // feature's original GeoJSON attributes
    styleFn(e, props);                                 // per-feature styling (below)
    e.description = e.description || placeholderFor(role, props);   // InfoBox popup
    e.properties = new Cesium.PropertyBag({
      narrativeRole: role,
      id: props.OBJECTID ?? props.id ?? `${role}-${i++}`,   // adapt to the real ID field
      popupContent: e.description,
      // solutionStatus: "active",   // add for green spaces
    });
  }
  viewer.dataSources.add(ds);
  viewer.scene.requestRender();
  return ds;
}
```

### Feature 1 — Clickable Building Footprints  (`narrativeRole: "context"`)

**Source:** Philadelphia Building Footprints 2026 GeoJSON from PASDA. Each footprint = one Cesium polygon entity.

Build steps:

- Pre-clip the footprints to the Nicetown/Hunting Park rectangle in QGIS first — citywide this is tens of thousands of polygons and will crush performance. Export the clipped subset as GeoJSON.
- Load with the pattern above. In the style function:
  - Fill **light blue / neutral**, semi-transparent (e.g. `alpha ≈ 0.4`) so 3D terrain shows through.
  - **Extrude if height data exists:** check the feature's properties for a height field (names vary — look for something like `height`, `MAX_HGT`, `BLDG_HT`). If present, set `entity.polygon.extrudedHeight = heightValue` and `entity.polygon.height = 0`. If absent, leave flat — do not invent heights.
  - Outline lightly so individual buildings are distinguishable.
- **Popup placeholder:** `"Building at " + (props.address ?? "this location") + ". Story coming soon."`
- **Role:** `context` — stays visible in Solutions Only mode but de-emphasized (dimmed) per Deliverable 1.

### Feature 2 — Clickable Road & Curb Polygons  (`narrativeRole: "context"`)

**Source:** Philadelphia Streets – Curblines, **or** street centerlines buffered into polygons.

Build steps:

- Curblines/centerlines are usually *lines*. To get clickable *surfaces*, either use a curb-polygon layer directly or **buffer the centerlines into polygons in QGIS** (buffer by roughly half the road width), then export GeoJSON. Polygons are what you click; thin lines are hard to hit.
- **Focus major roads first** — Roosevelt Boulevard Extension and the streets around Wayne Junction — to keep the entity count and lag down. Filter to those in QGIS before export.
- Style **dark grey, slightly transparent** (`alpha ≈ 0.5`).
- **Popup placeholder:** `"Road segment – details coming soon."`
- **Role:** `context`.

### Feature 3 — Clickable Grass & Tree Canopy Polygons  (`narrativeRole: "solution"`, `solutionStatus: "active"`)

**Source:** the Philadelphia Land Cover Raster 2018 (you already have this from the QGIS work) — vectorize the **tree-canopy** and **grass/shrub** classes into polygons; *or* use an existing PASDA green-space vector layer.

Build steps:

- In QGIS: **Raster → Conversion → Polygonize** on the land-cover raster, keep only class 1 (tree canopy) and class 2 (grass/shrub), then **filter out tiny polygons** (set a minimum area) and optionally dissolve adjacent ones. Raw polygonize output is thousands of pixel-sized shards — prioritize larger green areas as the spec says, or the entity count explodes. Export the cleaned result as GeoJSON, clipped to the neighborhood.
- Style by class: **tree canopy = dark green**, **grass/shrub = light green**, both semi-transparent. Each polygon is its own entity (the loader already does this).
- **Popup placeholder:** `"Green space – story coming soon."`
- **Role:** `solution` with `solutionStatus: "active"` — these are exactly the assets that should **remain visible when the user flips to Solutions Only**. They are the community gardens, tree canopy, and green infrastructure that the "path forward" is about.

> If a green-space patch corresponds to a named asset (Furtick Farms plot, a community garden, the Hunting Park tree-planting area), give it a more specific `popupContent` and it'll line up with the people models and solution points placed there.

---

## Deliverable 1 — The "Path Forward" Perspective Toggle

### The intent (read this — the *why* drives the implementation)

The default map shows the full, honest picture of Nicetown: pollution sources, heat islands, redlining, plus the community solutions. The new perspective answers a different question: **"What is actually being done right now, and what realistically could improve this neighborhood?"**

When the user flips the toggle ON, the problem/challenge layers fall away and the map shows **only solutions that are real and already happening in some form** — so that "more access to these resources over time" becomes the visible story. The emotional point is the contrast: the viewer watches the problems disappear and is left looking at hope they can act on.

### Architecture: tag every entity with a narrative role (do NOT hard-code lists)

Add a property to **every** entity the map creates — buildings, roads, green spaces, pollution points, solution points, heat islands, redlining tracts, cars, people. This is the single source of truth the toggle reads from. It also slots cleanly into the existing per-entity `type`/`category` property work (Feature 10) and the layer toggle work (Feature 11).

```js
// When you create or finish loading each entity, set:
entity.properties = new Cesium.PropertyBag({
  narrativeRole: "problem",      // "problem" | "solution" | "context"
  solutionStatus: null,          // for solutions only: "active" | "expanding"
  // ...keep existing id / type / popupContent properties alongside these
});
```

Role assignment:

| Role | Layers / entities | Shown in Full Reality | Shown in Solutions Only |
| --- | --- | --- | --- |
| `problem` | Pollution source points (Feature 6), Heat island polygons (Feature 8), Redlining/health-disparity tracts (Feature 9), Cars near busy roads (Feature 4) | Yes | **No** |
| `solution` | Community solution points (Feature 7), green space / tree canopy / community gardens (Feature 3), solution-oriented people models (Feature 5) | Yes | **Yes** |
| `context` | Buildings (Feature 1), roads/curbs (Feature 2) | Yes | Yes, but **de-emphasized** (see below) |

The `solutionStatus` field exists so you can phase solutions in over time without code changes:

- `"active"` — real and happening now: the **385 trees in Hunting Park**, **expanded community gardens**, **Furtick Farms**, **Philadelphia More Beautiful Committee block captains**, **Philly Thrive**, **CoolSeal reflective pavement**, **green stormwater infrastructure**.
- `"expanding"` — planned / growing access. Lets the admin later reveal "coming soon" resources by flipping a data flag, not by editing the map.

In Solutions Only mode you may optionally surface only `"active"` first, or show both with `"expanding"` ones styled lighter. Make this a one-line config flag, not a structural decision.

### What the toggle actually does

```js
function setPerspective(mode) {            // mode: "full" | "solutions"
  const solutionsOnly = mode === "solutions";

  for (const ds of viewer.dataSources._dataSources) {       // iterate every data source
    for (const e of ds.entities.values) {
      const role = readProp(e, "narrativeRole");            // helper below
      if (role === "problem") {
        e.show = !solutionsOnly;                            // hide problems in solutions mode
      } else if (role === "context") {
        e.show = true;                                       // keep buildings/roads
        deEmphasize(e, solutionsOnly);                       // dim them in solutions mode
      } else {
        e.show = true;                                       // solutions always visible
      }
    }
  }
  // ALSO handle entities you added directly to viewer.entities (cars, people, points)
  for (const e of viewer.entities.values) { /* same logic */ }

  viewer.scene.requestRender();   // CRITICAL — see Deliverable 2. Nothing updates without this.
}
```

Reading a Cesium property correctly (common bug — `entity.properties.x` is a `Property`, not a value):

```js
function readProp(entity, name) {
  const bag = entity.properties;
  if (!bag || !bag[name]) return undefined;
  return bag[name].getValue(Cesium.JulianDate.now());
}
```

"De-emphasize" for context layers in Solutions mode = drop building/road opacity (e.g. to ~0.25) and mute the color toward grey, so attention lands on the green. Restore original styling when returning to Full Reality. Store each entity's original material/color once so you can restore it rather than recomputing.

### The UI control

A single switch labeled clearly — e.g. **"Show the path forward"** / **"Solutions only"** — with a short caption: *"Real changes already underway in Nicetown & Hunting Park."* Use whatever UI layer the existing layer-toggle panel (Feature 11) uses; reuse that panel, don't invent a second floating widget. The toggle should feel like the headline control, visually distinct from the per-layer checkboxes.

Optionally, on switching into Solutions mode, `viewer.camera.flyTo` to a gentle overview of the neighborhood so the cleared map reads as a fresh, hopeful view. Keep it short (1–1.5s) and don't fight the camera constraints from Deliverable 3.

### Same page vs. separate page — my recommendation

**Build it as an in-place toggle on the existing `/map` page.** The whole power of this feature is the *transition* — problems dissolving to reveal solutions — which only works if it's the same scene. A separate page loses that.

Only build a separate route (e.g. `/path-forward`) if you specifically need a clean, shareable URL for outreach that opens directly in Solutions mode. If you do, it should mount the **same** viewer/initialization code with a single query param or prop (`?perspective=solutions`) that calls `setPerspective("solutions")` after load — **no duplicated map logic**. Refactor initialization into one shared module that both routes call.

---

## Deliverable 2 — Request Render Mode (fix the lag)

By default Cesium renders ~60 times per second forever, even when nothing moves. That's the lag. Turn it off so the map only redraws when something actually changes.

### Enable it at viewer creation

```js
const viewer = new Cesium.Viewer("cesiumContainer", {
  requestRenderMode: true,
  maximumRenderTimeChange: Infinity,   // never redraw just because time passed
  // ...your existing options
});
```

### The one rule you must follow everywhere

**With Request Render Mode on, the screen will NOT update on its own.** After any programmatic change that should be visible, you must call:

```js
viewer.scene.requestRender();
```

Audit the whole codebase and add `requestRender()` after **every** one of these:

- The perspective toggle (Deliverable 1)
- Any layer checkbox toggle (Feature 11)
- Any entity style/color change (Feature 10 dynamic styling)
- The `.then()` of every `Cesium.GeoJsonDataSource.load(...)` (buildings, roads, land cover) — once entities are added and styled
- After GLB models finish loading
- Any entity `.show` change, add, or remove

Cesium already auto-requests a render on camera movement and on InfoBox selection, so clicking entities and panning will work without extra calls.

### Animation caveat — decide this deliberately

Request Render Mode **freezes time-based animation** unless you opt back in. This affects:

- **Pulsing pollution points (Feature 6)** — they will sit static.
- **Idle character animations** on the CUTES models (Feature 5).

Choose one per case:

1. **Accept static** (simplest, best performance) — pollution points use a bright steady glow/outline instead of a pulse. Recommended for v1, and it's irrelevant in Solutions mode anyway since problems are hidden.
2. **Keep specific animation** — drive it from the Cesium clock with a `CallbackProperty` and set `maximumRenderTimeChange` to a small finite number (e.g. `0.5`) so Cesium redraws periodically. This costs some of the performance you just gained — use only if the pulse is essential.

My recommendation: go with static glow for v1. Revisit only if the pulse is requested.

---

## Deliverable 3 — Lock the scene to Nicetown + Hunting Park

You're streaming global terrain and imagery because the camera is allowed to roam the whole planet. Fence it in and most of the cost disappears.

### 1. Open on the neighborhood, not the globe

Set this **before** creating the viewer:

```js
// Bounding box covering Nicetown + Hunting Park (approximate — verify/tune against your data)
const NICETOWN_RECT = Cesium.Rectangle.fromDegrees(
  -75.170,  // west
   39.995,  // south
  -75.115,  // east
   40.035   // north
);
Cesium.Camera.DEFAULT_VIEW_RECTANGLE = NICETOWN_RECT;
```

> These coordinates are a starting estimate for the North Philadelphia 19140 area. Confirm them against the actual extent of your `locations` data and the census tracts you isolated (Nicetown tracts 204/205/280/281) and tighten the box so it frames your content snugly.

### 2. Stop the user from zooming out to space

```js
const ctrl = viewer.scene.screenSpaceCameraController;
ctrl.minimumZoomDistance = 150;     // can't clip into the ground
ctrl.maximumZoomDistance = 6000;    // can't pull back to "whole Earth" view (tune in meters)
```

This single change is what removes the "the entire Earth is loading" feeling — if they can't see the Earth, Cesium won't stream it.

### 3. (Optional) Keep panning inside the box

Cesium has no built-in hard pan boundary. If users pan off into the rest of the city, clamp it:

```js
viewer.camera.changed.addEventListener(() => {
  const c = viewer.camera.positionCartographic;
  if (!Cesium.Rectangle.contains(NICETOWN_RECT, c)) {
    viewer.camera.flyHome(0.5);   // or flyTo NICETOWN_RECT
  }
});
viewer.camera.percentageChanged = 0.1;   // fire the listener more readily
```

Treat this as a polish step; the zoom limit above is the important one.

### 4. Lighten what gets loaded

```js
viewer.scene.globe.maximumScreenSpaceError = 4;  // higher = less terrain/imagery detail = faster (default 2)
viewer.scene.fog.enabled = false;
viewer.scene.skyAtmosphere.show = false;          // we never see the horizon at this zoom
```

If terrain detail isn't important for the story, consider a flat ellipsoid (`EllipsoidTerrainProvider`) — it eliminates terrain streaming entirely. Only keep 3D world terrain if the slope/relief actually matters.

### 5. Cluster the dense points

For the pollution/solution point layers (and any large point set), enable clustering on the data source so hundreds of markers don't tank the frame:

```js
dataSource.clustering.enabled = true;
dataSource.clustering.pixelRange = 40;
dataSource.clustering.minimumClusterSize = 3;
```

And keep the existing guidance: prioritize Nicetown-area features first, don't load city-wide footprint counts at once.

---

## Where the CUTES GLB people models go

GLB files must be served as **static public assets over HTTP** and referenced by a URL path the browser can fetch. The exact folder depends on your stack, but the rule is the same: put them under whatever directory your app serves at the web root, then reference them by that root-relative path.

- **Vite / Next.js / Create-React-App / most setups:** put them in the `public/` directory →
  `public/models/characters/farmer.glb` → reference as **`/models/characters/farmer.glb`**
- **Plain static site:** any folder served by the web server, mirrored into the URL path.
- **If files are large or you use a CDN/asset host:** upload there and reference the full URL.

Create the folder `models/characters/` inside your static/public root and drop the CUTES Part One GLBs there with clear names (`farmer.glb`, `youth-organizer.glb`, `block-captain.glb`, `resident.glb`). Then:

```js
viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(LON, LAT),   // exact coords from your data
  model: {
    uri: "/models/characters/farmer.glb",
    scale: 4,                                            // tune so they aren't giants
    minimumPixelSize: 32,                                // stay visible when zoomed out
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
  },
  properties: new Cesium.PropertyBag({
    narrativeRole: "solution",
    solutionStatus: "active",
    popupContent: "[Name/Role] – story coming soon.",
  }),
});
// after the models resolve, nudge a render (Deliverable 2):
viewer.scene.requestRender();
```

Notes: GLBs must be glTF 2.0 binary (the CUTES bundle already is). Clamp every character to the ground so they don't float. Place the farmer at Furtick Farms, the youth organizer at the Diamond Street planting site, the block captain at Nicetown Park, the resident near the SEPTA plant — all of these are `solution`-role so they survive the Solutions Only toggle.

---

## Integration checklist (acceptance criteria)

- [ ] Building footprints (Feature 1), road/curb polygons (Feature 2), and green-space polygons (Feature 3) load from GeoJSON **pre-clipped to the Nicetown/Hunting Park extent**, each polygon its own entity, styled and clickable.
- [ ] Buildings extrude where height data exists; green spaces split into dark-green canopy vs light-green grass; roads dark grey; all semi-transparent.
- [ ] Every entity created by the map carries a `narrativeRole` property (`problem` / `solution` / `context`), set at creation or right after data-source load.
- [ ] A single, prominent toggle switches between Full Reality and Solutions Only; problems vanish, solutions remain, buildings/roads de-emphasize, and styling fully restores when switched back.
- [ ] `requestRenderMode: true` is set, and `scene.requestRender()` is called after the toggle, every layer change, every style change, every data-source load `.then()`, and after models load.
- [ ] No animation depends on continuous rendering unless explicitly opted in via the clock (pollution points use a static glow for v1).
- [ ] Camera opens framed on Nicetown/Hunting Park; zoom-out is capped so the full globe never loads; `maximumScreenSpaceError` raised; sky/fog disabled.
- [ ] Point layers cluster.
- [ ] CUTES GLBs live under the public static root at `/models/characters/...`, clamped to ground, scaled sanely, tagged `solution`.
- [ ] If a separate `/path-forward` route is built, it reuses the same initialization module and only differs by an initial perspective flag.
- [ ] All `popupContent` remains readable from a property so the future admin system can inject real stories (Feature 12) without map code changes.