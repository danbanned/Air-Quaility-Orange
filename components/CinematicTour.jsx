// app/components/CinematicTour.js
'use client';

import {
  COMMUNITY_SOLUTIONS,
  HEAT_ISLAND_ZONES,
  NICETOWN_COORDINATES,
  POLLUTION_SOURCES,
  CHARACTERS,
  VEHICLES,
  STREET_TOUR_STOPS,
  STORY_HEADING,
} from '../utils/mapUtils';
import { mapWaypointsToStreets, buildOrderedTrailCoords } from '../utils/roadMapper';

const ROOSEVELT_EXTENSION = POLLUTION_SOURCES.find((item) => item.id === 1);
const MIDVALE_PLANT = POLLUTION_SOURCES.find((item) => item.id === 2);
const WAYNE_JUNCTION = POLLUTION_SOURCES.find((item) => item.id === 3);
const FURTICK_FARMS = COMMUNITY_SOLUTIONS.find((item) => item.id === 1);
const HUNTING_PARK_GARDEN = COMMUNITY_SOLUTIONS.find((item) => item.id === 2);
const CSI_STORMWATER = COMMUNITY_SOLUTIONS.find((item) => item.id === 4);
const HUNTING_PARK_HEAT_ZONE = HEAT_ISLAND_ZONES.find((item) => item.id === 1);

// Helper to build waypoints for models
function buildModelWaypoints(models, type) {
  return models.map((model, index) => ({
    id: 100 + index,
    name: model.name,
    description: model.role || model.description,
    location: {
      lon: model.lon,
      lat: model.lat,
      height: 0, // ground level
    },
    orientation: {
      heading: 0,
      pitch: -22,
      roll: 0,
    },
    duration: 4,
    orbitSeconds: 3,
    stat: type === 'character'
      ? { label: 'Community Voice', description: model.name, comparison: model.role }
      : { label: 'Vehicle', description: model.name, comparison: model.description },
    highlight: { lon: model.lon, lat: model.lat },
  }));
}

// Base waypoints (existing)
const baseWaypoints = [
  {
    id: 1,
    name: 'Welcome to Nicetown',
    description:
      "This is Nicetown Park, the heart of the community. Let's explore the environmental challenges residents face daily.",
    location: { lon: NICETOWN_COORDINATES.lng, lat: NICETOWN_COORDINATES.lat, height: NICETOWN_COORDINATES.alt },
    orientation: { heading: -12, pitch: -80, roll: 0 },
    duration: 6.2,
    stat: null,
  },
  {
    id: 2,
    name: 'The Asthma Crisis',
    description:
      'Childhood asthma rates here are 21%, nearly three times the national average. This ZIP code has one of the highest hospitalization rates in Philadelphia.',
    location: { lat: 40.026814, lon: -75.162541, height: 80 },
    orientation: { heading: 28, pitch: -18, roll: 0 },
    duration: 7.2,
    stat: { label: '21%', description: 'Childhood Asthma Rate', comparison: '3x national average' },
    highlight: { lon: -75.162541, lat: 40.026814 },
  },
  {
    id: 3,
    name: 'Roosevelt Extension',
    description:
      'This elevated highway carries heavy traffic daily. Diesel trucks and tailpipe emissions create a persistent pollution burden.',
    location: {
      lon: ROOSEVELT_EXTENSION.coordinates.lng - 0.0005,
      lat: ROOSEVELT_EXTENSION.coordinates.lat - 0.00035,
      height: 80,
    },
    orientation: { heading: 104, pitch: -22, roll: 0 },
    duration: 8.2,
    stat: { label: '100,000+', description: 'Vehicles Daily', comparison: 'Major local pollution source' },
    highlight: { lon: ROOSEVELT_EXTENSION.coordinates.lng, lat: ROOSEVELT_EXTENSION.coordinates.lat },
  },
  {
    id: 4,
    name: 'SEPTA Midvale Plant',
    description:
      'The Midvale plant contributes ozone-forming emissions around the clock and compounds the area-wide air quality burden.',
    location: {
      lon: MIDVALE_PLANT.coordinates.lng - 0.00042,
      lat: MIDVALE_PLANT.coordinates.lat + 0.00038,
      height: 90,
    },
    orientation: { heading: -36, pitch: -20, roll: 0 },
    duration: 7.6,
    stat: { label: '24/7', description: 'Emission Presence', comparison: 'Natural gas still harms local air' },
    highlight: { lon: MIDVALE_PLANT.coordinates.lng, lat: MIDVALE_PLANT.coordinates.lat },
  },
  {
    id: 5,
    name: 'Wayne Junction',
    description:
      'Diesel trains and idling activity add particulate pollution. Living near rail infrastructure increases respiratory risk.',
    location: {
      lon: WAYNE_JUNCTION.coordinates.lng - 0.00055,
      lat: WAYNE_JUNCTION.coordinates.lat + 0.00018,
      height: 85,
    },
    orientation: { heading: 74, pitch: -20, roll: 0 },
    duration: 7.4,
    stat: { label: '30%', description: 'Higher Respiratory Risk', comparison: 'Near rail yards' },
    highlight: { lon: WAYNE_JUNCTION.coordinates.lng, lat: WAYNE_JUNCTION.coordinates.lat },
  },
  {
    id: 6,
    name: 'Furtick Farms',
    description:
      'Furtick Farms is a community response: fresh food, cooling green space, and resilience built right inside the neighborhood.',
    location: {
      lon: FURTICK_FARMS.coordinates.lng - 0.00022,
      lat: FURTICK_FARMS.coordinates.lat - 0.0002,
      height: 40,
    },
    orientation: { heading: 172, pitch: -26, roll: 0 },
    duration: 7.2,
    stat: { label: '200+', description: 'Families Served Weekly', comparison: 'Community solution in action' },
    highlight: { lon: FURTICK_FARMS.coordinates.lng, lat: FURTICK_FARMS.coordinates.lat },
  },
  {
    id: 7,
    name: 'CSI Stormwater Project',
    description:
      'Green stormwater infrastructure captures runoff, cools streets, and reduces flooding. Each installation is a climate adaptation win for the neighborhood.',
    location: {
      lon: CSI_STORMWATER.coordinates.lng,
      lat: CSI_STORMWATER.coordinates.lat - 0.00018,
      height: 50,
    },
    orientation: { heading: 0, pitch: -20, roll: 0 },
    duration: 7,
    stat: { label: '35%', description: 'Runoff Reduction', comparison: 'Green infrastructure in action' },
    highlight: { lon: CSI_STORMWATER.coordinates.lng, lat: CSI_STORMWATER.coordinates.lat },
  },
  {
    id: 8,
    name: 'Hunting Park Heat Island',
    description:
      'This area runs 8 to 12 degrees hotter than nearby neighborhoods because of dark surfaces and limited tree canopy.',
    location: {
      lon: HUNTING_PARK_HEAT_ZONE.coordinates.lng - 0.0005,
      lat: HUNTING_PARK_HEAT_ZONE.coordinates.lat - 0.0002,
      height: 70,
    },
    orientation: { heading: 252, pitch: -30, roll: 0 },
    duration: 7.4,
    stat: { label: '8-12°F', description: 'Hotter Than Surrounding Areas', comparison: 'Heat island effect' },
    highlight: { lon: HUNTING_PARK_HEAT_ZONE.coordinates.lng, lat: HUNTING_PARK_HEAT_ZONE.coordinates.lat },
  },
  {
    id: 9,
    name: 'The Cancer Disparity',
    description:
      'This disparity did not happen by accident. Redlining and industrial zoning shaped who lives closest to environmental risk.',
    location: { lon: -75.15425, lat: 40.01965, height: 90 },
    orientation: { heading: 8, pitch: -34, roll: 0 },
    duration: 8,
    stat: { label: '41% vs 15%', description: 'Cancer Risk Disparity', comparison: 'Black vs White residents' },
    redliningOverlay: true,
  },
  {
    id: 10,
    name: 'The Path Forward',
    description:
      'Tree planting, green infrastructure, and community-led projects show that neighborhood-scale climate and health solutions work.',
    location: {
      lon: HUNTING_PARK_GARDEN.coordinates.lng + 0.00012,
      lat: HUNTING_PARK_GARDEN.coordinates.lat + 0.00012,
      height: 80,
    },
    orientation: { heading: -8, pitch: -24, roll: 0 },
    duration: 7,
    stat: { label: '385', description: 'New Trees Planted', comparison: 'Community action works' },
  },
];

const characterWaypoints = buildModelWaypoints(CHARACTERS, 'character');
const vehicleWaypoints = buildModelWaypoints(VEHICLES, 'vehicle');

// Map base waypoint names to character names that should appear immediately after
const solutionToCharacterMap = {
  'Furtick Farms': ['Community Farmer'],
  'CSI Stormwater Project': ['Resident'],
  'The Path Forward': ['Youth Organizer', 'Block Captain', 'Garden Volunteer', 'Community Member'],
  // Optional: you can add more mappings, e.g., "Roosevelt Extension" could have a vehicle character
};

// Build final ordered waypoints
function buildOrderedWaypoints() {
  const ordered = [];
  const insertedCharacterNames = new Set();

  for (const wp of baseWaypoints) {
    ordered.push(wp);
    const charNames = solutionToCharacterMap[wp.name];
    if (charNames) {
      for (const name of charNames) {
        const charWp = characterWaypoints.find(w => w.name === name);
        if (charWp) {
          ordered.push(charWp);
          insertedCharacterNames.add(name);
        }
      }
    }
  }

  // Append any character waypoints not inserted
  for (const wp of characterWaypoints) {
    if (!insertedCharacterNames.has(wp.name)) {
      ordered.push(wp);
    }
  }

  // Append all vehicle waypoints at the end
  ordered.push(...vehicleWaypoints);

  return ordered;
}

export const TOUR_WAYPOINTS = buildOrderedWaypoints();

// The rest (flyCamera, orbitWaypoint, createCinematicTour) remains unchanged.
// Keep your existing implementations below.

function flyCamera(viewer, Cesium, waypoint) {
  return new Promise((resolve) => {
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      resolve();
    };

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        waypoint.location.lon,
        waypoint.location.lat,
        waypoint.location.height
      ),
      orientation: {
        heading: Cesium.Math.toRadians(waypoint.orientation.heading),
        pitch: Cesium.Math.toRadians(waypoint.orientation.pitch),
        roll: Cesium.Math.toRadians(waypoint.orientation.roll),
      },
      duration: waypoint.duration,
      easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
      complete: done,
      cancel: done,
    });
  });
}




// Orbit the camera around a waypoint for `seconds` seconds.
// onAnimationStart/Stop wire up the RAF render loop in CesiumMap so the
// postRender orbit tick fires while requestRenderMode is on.
function orbitWaypoint(viewer, Cesium, waypoint, seconds, token, getToken, onAnimationStart, onAnimationStop) {
  return new Promise((resolve) => {
    const center = Cesium.Cartesian3.fromDegrees(
      waypoint.highlight?.lon ?? waypoint.location.lon,
      waypoint.highlight?.lat ?? waypoint.location.lat,
      40
    );

    let angle = viewer.camera.heading;
    const pitch = Cesium.Math.toRadians(waypoint.orientation.pitch);
    const range = waypoint.orbitRange ?? 220;

    if (onAnimationStart) onAnimationStart();

    const removeTick = viewer.scene.postRender.addEventListener(() => {
      if (viewer.isDestroyed() || token !== getToken()) {
        removeTick();
        return;
      }
      angle += 0.0035; // ~12°/s
      viewer.camera.lookAt(center, new Cesium.HeadingPitchRange(angle, pitch, range));
    });

    window.setTimeout(() => {
      removeTick();
      if (onAnimationStop) onAnimationStop();
      if (!viewer.isDestroyed()) {
        viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
      }
      resolve();
    }, seconds * 1000);
  });
}

export function createCinematicTour({
  viewer,
  Cesium,
  onWaypointChange,
  onStatsChange,
  onPlayingChange,
  onAnimationStart,
  onAnimationStop,
}) {
  let playing = false;
  let activeHighlight = null;
  let activeOverlay = null;
  let pendingTimeout = null;
  let runToken = 0;

  const clearPending = () => {
    if (pendingTimeout) {
      window.clearTimeout(pendingTimeout);
      pendingTimeout = null;
    }
  };

  const clearVisuals = () => {
    if (activeHighlight && !viewer.isDestroyed()) {
      viewer.entities.remove(activeHighlight);
      activeHighlight = null;
      viewer.scene.requestRender();
    }
    if (activeOverlay && !viewer.isDestroyed()) {
      viewer.entities.remove(activeOverlay);
      activeOverlay = null;
      viewer.scene.requestRender();
    }
  };

  const stopTour = () => {
    playing = false;
    runToken += 1;
    clearPending();
    clearVisuals();
    if (onAnimationStop) onAnimationStop();
    viewer.camera.cancelFlight();
    viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    onWaypointChange(null);
    onStatsChange(null);
    onPlayingChange(false);
  };

  const runWaypoint = async (index) => {
    const token = runToken;
    if (!playing || viewer.isDestroyed()) return;

    const waypoint = TOUR_WAYPOINTS[index];
    if (!waypoint) {
      stopTour();
      return;
    }

    clearVisuals();
    onWaypointChange(waypoint);
    onStatsChange(waypoint.stat || null);

    if (waypoint.highlight) {
      activeHighlight = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(waypoint.highlight.lon, waypoint.highlight.lat, 42),
        ellipse: {
          semiMajorAxis: 48,
          semiMinorAxis: 48,
          material: Cesium.Color.fromCssColorString('#FF6B35').withAlpha(0.22),
          outline: true,
          outlineColor: Cesium.Color.YELLOW.withAlpha(0.95),
          outlineWidth: 2,
          height: 0,
        },
      });
      viewer.scene.requestRender();
    }

    if (waypoint.redliningOverlay) {
      activeOverlay = viewer.entities.add({
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray([
            -75.162, 40.014,
            -75.148, 40.014,
            -75.148, 40.026,
            -75.162, 40.026,
          ]),
          material: Cesium.Color.fromCssColorString('#8B0000').withAlpha(0.18),
          outline: true,
          outlineColor: Cesium.Color.RED.withAlpha(0.72),
        },
      });
      viewer.scene.requestRender();
    }

    await flyCamera(viewer, Cesium, waypoint);

    if (!playing || token !== runToken) return;

    await orbitWaypoint(
      viewer, Cesium, waypoint,
      waypoint.orbitSeconds ?? 4,
      token, () => runToken,
      onAnimationStart, onAnimationStop
    );

    if (!playing || token !== runToken) return;

    pendingTimeout = window.setTimeout(() => {
      runWaypoint(index + 1);
    }, 800);
  };

  const startTour = async () => {
    clearPending();
    clearVisuals();
    runToken += 1;
    playing = true;
    onPlayingChange(true);
    await runWaypoint(0);
  };

  return {
    startTour,
    stopTour,
    isPlaying: () => playing,
  };
}

// ── Story Tour ──────────────────────────────────────────────────────────────────
// Visits every story-character entity already on the map, orbits each for a
// configurable duration, auto-shows the Cesium InfoBox at each stop, then clears
// the selection when done. Works with both real DB stories and test stories since
// it reads directly from viewer.entities (no hardcoded list).

// ─────────────────────────────────────────────────────────────────────────────
// STORY TOUR FIX — replace the existing `orbitStoryEntity` function AND the
// existing `createStoryTour` function in app/components/CinematicTour.js with
// the two below. Nothing else in the file changes.
//
// WHAT WAS WRONG:
//   Story characters are CLAMP_TO_3D_TILE, so they RENDER on the Google photoreal
//   surface (~45 m up), but entity.position.getValue() returns the UN-clamped base
//   (~sea level). The old code orbited that sea-level point, so the camera circled
//   ~45 m underground and the model was off-screen above it. Changing ORBIT_PITCH
//   only moved an already-buried camera, which is why it "glitched into the ground".
//
// THE FIX:
//   1. Sample the REAL surface height under each character with clampToHeightMostDetailed.
//   2. Raise that point to eye height and orbit THAT.
//   3. ORBIT_PITCH is now negative (camera above, looking down).
//   4. The fly-in uses the same centre/pitch/range as the orbit, and the orbit seeds
//      its sweep from the camera's actual current position, so the hand-off is seamless.
//   5. The render loop stays on for the whole tour so clampToHeightMostDetailed can
//      stream tiles under requestRenderMode (it can't sample a surface that never renders).
// ─────────────────────────────────────────────────────────────────────────────

// ── Story Tour — Slideshow ────────────────────────────────────────────────────

// Word-wraps `text` into lines that fit within `maxWidth` pixels (measured by ctx).
// Returns at most `maxLines` lines; the last line gets "…" appended if text was cut.
function wrapText(ctx, text, maxWidth, maxLines) {
  const words = (text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let wi = 0;
  while (wi < words.length && lines.length < maxLines) {
    let line = words[wi++];
    while (wi < words.length && ctx.measureText(`${line} ${words[wi]}`).width <= maxWidth) {
      line += ` ${words[wi++]}`;
    }
    lines.push(line);
  }
  if (wi < words.length) {
    // Words still remain — truncate last line with ellipsis.
    let last = lines[lines.length - 1] || '';
    while (last && ctx.measureText(`${last}…`).width > maxWidth) {
      const sp = last.lastIndexOf(' ');
      last = sp > 0 ? last.slice(0, sp) : last.slice(0, -1);
    }
    lines[lines.length - 1] = `${last}…`;
  }
  return lines;
}

// Renders a story card to an off-screen canvas and returns { image, width, height }.
// Canvas is drawn at 2× (480 px wide) for retina sharpness; display dimensions are halved.
// Canvas height is computed from the wrapped body lines — it grows to fit, up to 8 lines.
function createStoryBillboard(story) {
  if (typeof document === 'undefined') return { image: '', width: 240, height: 100 };

  const CANVAS_W  = 480;
  const PAD       = 24;
  const CONTENT_W = CANVAS_W - PAD * 2;
  const LINE_H    = 36;   // 18 px displayed
  const MAX_LINES = 8;
  const accent    = story.characterColor || '#FF6B35';

  // Pre-measure to wrap the body text before sizing the canvas.
  const m = document.createElement('canvas').getContext('2d');
  m.font  = '400 26px "Sora", sans-serif';
  const bodyLines = wrapText(m, story.content || '', CONTENT_W, MAX_LINES);

  // Layout baselines (all in canvas coords, i.e. 2× scale).
  const NAME_Y    = PAD + 36;
  const STREET_Y  = NAME_Y + 32;
  const DIVIDER_Y = STREET_Y + 18;
  const BODY_Y    = DIVIDER_Y + 28;
  const CANVAS_H  = BODY_Y + bodyLines.length * LINE_H + PAD;

  const canvas    = document.createElement('canvas');
  canvas.width    = CANVAS_W;
  canvas.height   = CANVAS_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { image: '', width: 240, height: Math.round(CANVAS_H / 2) };

  // Background
  ctx.fillStyle = 'rgba(4,8,16,0.92)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Accent left strip
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, 6, CANVAS_H);

  // Name
  ctx.fillStyle = '#F7F1E3';
  ctx.font      = '700 32px "Sora", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(story.personName || '', PAD + 6, NAME_Y);

  // Street
  ctx.fillStyle = 'rgba(247,241,227,0.55)';
  ctx.font      = '500 24px "Sora", sans-serif';
  ctx.fillText(story.streetName || '', PAD + 6, STREET_Y);

  // Divider
  ctx.fillStyle = `${accent}55`;
  ctx.fillRect(PAD + 6, DIVIDER_Y, CONTENT_W - 6, 2);

  // Body text
  ctx.fillStyle = 'rgba(247,241,227,0.88)';
  ctx.font      = '400 26px "Sora", sans-serif';
  bodyLines.forEach((line, i) => {
    ctx.fillText(line, PAD + 6, BODY_Y + i * LINE_H);
  });

  return {
    image:  canvas.toDataURL('image/png'),
    width:  Math.round(CANVAS_W / 2),
    height: Math.round(CANVAS_H / 2),
  };
}

// Samples the real photoreal surface height via clampToHeightMostDetailed.
// Seeds the ray from 2 km above so it reliably hits the tile mesh on the way down.
// Pumps requestRender in a setInterval so tiles can stream under requestRenderMode.
// Sample terrain height (ground only — no buildings) for a story character.
// Uses sampleTerrainMostDetailed so the anchor lands at the character's feet,
// not on a building rooftop above them.
async function sampleAnchorPosition(viewer, Cesium, entity, rawPos, headHeight) {
  const carto = Cesium.Cartographic.fromCartesian(rawPos);
  const lon   = Cesium.Math.toDegrees(carto.longitude);
  const lat   = Cesium.Math.toDegrees(carto.latitude);

  const pump = setInterval(() => {
    if (!viewer.isDestroyed()) viewer.scene.requestRender();
  }, 50);

  let surfaceH = null;
  try {
    const positions = [Cesium.Cartographic.fromDegrees(lon, lat)];
    const sampled = await Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, positions);
    if (sampled?.[0]?.height != null) {
      surfaceH = sampled[0].height;
    }
  } catch (_) {}
  finally {
    clearInterval(pump);
  }

  if (surfaceH == null || surfaceH < 0) {
    // Nicetown WGS84 baseline: ~25 m MSL + ~30 m geoid offset ≈ 55 m above ellipsoid
    surfaceH = 55;
  }

  return Cesium.Cartesian3.fromDegrees(lon, lat, surfaceH + headHeight);
}

export function createStoryTour({
  viewer,
  Cesium,
  onPlayingChange,
  onStoryChange,
}) {
  const PORTRAIT_DISTANCE    = 16;  // metres camera stands back from anchor
  const HEAD_HEIGHT          = 1.5; // metres above terrain — billboard anchor + camera target height
  const CAMERA_HEIGHT_OFFSET = -1.2; // negative = camera below anchor = slight upward look
  const PHILLY_GROUND_EST    = 55;  // WGS84 ellipsoid height (m) for Nicetown (~25m MSL + 30m geoid offset)

  let playing    = false;
  let currentIdx = 0;
  let busy       = false;
  const anchorCache = new Map();
  let hiddenBillboardEntities = [];

  const getStoryEntities = () =>
    viewer.entities.values.filter(
      (e) => typeof e.id === 'string' && e.id.startsWith('story-character-')
    );

  const readProp = (entity, name) => {
    const bag = entity.properties;
    if (!bag) return undefined;
    const p = bag[name];
    if (p === undefined || p === null) return undefined;
    return typeof p.getValue === 'function' ? p.getValue({ dayNumber: 2457388, secondsOfDay: 0 }) : p;
  };

  // Compute + apply portrait camera from any anchor point.
  // Called twice per snap: immediately with an estimated anchor (no async wait),
  // then again with the precise clamped anchor after tile sampling.
  const applyCameraFromAnchor = (anchorPt) => {
    const enuToEcef = Cesium.Transforms.eastNorthUpToFixedFrame(anchorPt);
    const enuForward = new Cesium.Cartesian3(Math.sin(STORY_HEADING), Math.cos(STORY_HEADING), 0);
    const ecefForward = new Cesium.Cartesian3();
    Cesium.Matrix4.multiplyByPointAsVector(enuToEcef, enuForward, ecefForward);
    Cesium.Cartesian3.normalize(ecefForward, ecefForward);

    const pos = Cesium.Cartesian3.add(
      anchorPt,
      Cesium.Cartesian3.multiplyByScalar(ecefForward, PORTRAIT_DISTANCE, new Cesium.Cartesian3()),
      new Cesium.Cartesian3()
    );
    const up = new Cesium.Cartesian3();
    Cesium.Ellipsoid.WGS84.geodeticSurfaceNormal(pos, up);
    Cesium.Cartesian3.add(
      pos,
      Cesium.Cartesian3.multiplyByScalar(up, CAMERA_HEIGHT_OFFSET, new Cesium.Cartesian3()),
      pos
    );
    const dir = new Cesium.Cartesian3();
    Cesium.Cartesian3.subtract(anchorPt, pos, dir);
    Cesium.Cartesian3.normalize(dir, dir);
    viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    viewer.camera.setView({ destination: pos, orientation: { direction: dir, up } });
    viewer.scene.requestRender();
  };

  const snapTo = async (stories, index) => {
    if (busy) return;
    busy = true;
    try {
      const entity = stories[index];
      const rawPos = entity.position?.getValue(Cesium.JulianDate.now());
      if (!rawPos) return;

      const rawCarto = Cesium.Cartographic.fromCartesian(rawPos);
      const lon = Cesium.Math.toDegrees(rawCarto.longitude);
      const lat = Cesium.Math.toDegrees(rawCarto.latitude);

      // ── Immediate pre-snap ────────────────────────────────────────────────
      // Moves camera to portrait position instantly, before async tile sampling.
      // Prevents camera from staying stuck at the aerial/overview position.
      const estAnchor = Cesium.Cartesian3.fromDegrees(lon, lat, PHILLY_GROUND_EST + HEAD_HEIGHT);
      applyCameraFromAnchor(estAnchor);

      // ── Anchor (lazy + cached) ────────────────────────────────────────────
      let anchor = anchorCache.get(entity.id);
      if (!anchor) {
        anchor = await sampleAnchorPosition(viewer, Cesium, entity, rawPos, HEAD_HEIGHT);
        if (!playing) return;
        anchorCache.set(entity.id, anchor);

        const { image, width, height } = createStoryBillboard({
          personName:     readProp(entity, 'personName') || entity.name || '',
          streetName:     readProp(entity, 'streetName') || '',
          content:        readProp(entity, 'content')    || '',
          characterColor: '#FF6B35',
        });
        viewer.entities.add({
          id:       `story-label-${entity.id}`,
          position: anchor,
          billboard: {
            image,
            width,
            height,
            verticalOrigin:           Cesium.VerticalOrigin.BOTTOM,
            pixelOffset:              new Cesium.Cartesian2(0, -8),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
        });
      }

      // ── Show only this stop's billboard, hide all others ─────────────────
      const currentLabelId = `story-label-${entity.id}`;
      viewer.entities.values.forEach((e) => {
        if (typeof e.id === 'string' && e.id.startsWith('story-label-')) {
          e.show = e.id === currentLabelId;
        }
      });

      // ── Precise camera snap using real clamped anchor ─────────────────────
      applyCameraFromAnchor(anchor);

      if (onStoryChange) {
        onStoryChange({
          index,
          total:      stories.length,
          personName: readProp(entity, 'personName') || entity.name || '—',
          streetName: readProp(entity, 'streetName') || '',
          content:    readProp(entity, 'content')    || '',
          community:  readProp(entity, 'community')  || '',
        });
      }
    } finally {
      busy = false;
    }
  };

  const stopTour = () => {
    playing = false;
    anchorCache.clear();
    if (!viewer.isDestroyed()) {
      viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
      const labels = viewer.entities.values.filter(
        (e) => typeof e.id === 'string' && e.id.startsWith('story-label-')
      );
      labels.forEach((e) => viewer.entities.remove(e));
      // Restore all billboards that were hidden at tour start.
      hiddenBillboardEntities.forEach((e) => { e.show = true; });
      hiddenBillboardEntities = [];
    }
    if (onPlayingChange) onPlayingChange(false);
    if (onStoryChange)   onStoryChange(null);
  };

  const startTour = () => {
    const stories = getStoryEntities();
    if (stories.length === 0) {
      alert('No story characters on the map. Load them first using "Visit User Stories", then start the Story Tour.');
      return;
    }
    // Hide all billboard/label entities that aren't part of the story tour
    // so they don't bleed into the portrait view.
    hiddenBillboardEntities = [];
    viewer.entities.values.forEach((e) => {
      const isStoryEntity = typeof e.id === 'string' &&
        (e.id.startsWith('story-character-') || e.id.startsWith('story-label-'));
      if (!isStoryEntity && (e.billboard || e.label) && e.show !== false) {
        e.show = false;
        hiddenBillboardEntities.push(e);
      }
    });
    anchorCache.clear();
    playing    = true;
    currentIdx = 0;
    if (onPlayingChange) onPlayingChange(true);
    snapTo(stories, currentIdx);
  };

  const next = () => {
    if (!playing) return;
    const stories = getStoryEntities();
    if (currentIdx < stories.length - 1) {
      currentIdx++;
      snapTo(stories, currentIdx);
    }
  };

  const prev = () => {
    if (!playing) return;
    const stories = getStoryEntities();
    if (currentIdx > 0) {
      currentIdx--;
      snapTo(stories, currentIdx);
    }
  };

  return {
    startTour,
    stopTour,
    next,
    prev,
    currentIndex: () => currentIdx,
    isPlaying: () => playing,
  };
}

// Street-following camera trail — fetches nicetown_roads.geojson, maps all known
// waypoints to their nearest streets, concatenates into a continuous path, then
// animates the camera via viewer.trackedEntity so Cesium handles the follow natively.
export async function createStreetTrailTour({
  viewer,
  Cesium,
  onAnimationStart,
  onAnimationStop,
  onSegmentChange,
  debug = false,
}) {
  let stopped = false;
  let removeTickListener = null;
  const debugEntities = [];

  // ── CONFIGURATION ──────────────────────────────────────────────────────────
  const CONFIG = {
    cameraRange: 10,          // meters from target to camera
    cameraPitch: 15,          // degrees above horizontal
    heightAboveGround: 5,     // meters above the LIVE terrain height each tick
    secondsPerSegment: 14,
    orbitDuration: 6,
  };
  // Fallback ellipsoid height used only when a tile hasn't loaded yet.
  // Nicetown sits 40–55 m above WGS84; 60 keeps the camera above ground in all cases.
  const NICETOWN_ELLIPSOID_BASELINE = 60;
  // ────────────────────────────────────────────────────────────────────────────

  const stop = () => {
    if (stopped) return;
    stopped = true;
    if (removeTickListener) { removeTickListener(); removeTickListener = null; }
    if (!viewer.isDestroyed()) {
      viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
      debugEntities.forEach((e) => viewer.entities.remove(e));
      debugEntities.length = 0;
    }
    if (onAnimationStop) onAnimationStop();
  };

  console.log('[AQO trail] ── createStreetTrailTour START ──');
  console.log('[AQO trail] viewer ok:', !!viewer, '| Cesium ok:', !!Cesium);
  console.log('[AQO trail] requestRenderMode:', viewer.scene.requestRenderMode);

  try {
    // ── 1. Load GeoJSON ──────────────────────────────────────────────────────
    console.log('[AQO trail] 1. Fetching /geojson/nicetown_roads.geojson …');
    const res = await fetch('/geojson/nicetown_roads.geojson');
    console.log('[AQO trail] 1. Fetch status:', res.status, res.ok ? 'OK' : 'FAILED');
    if (!res.ok) throw new Error(`GeoJSON fetch failed: ${res.status}`);
    const geojson = await res.json();
    console.log('[AQO trail] 1. Features loaded:', geojson.features.length);
    if (geojson.features.length === 0) throw new Error('GeoJSON has 0 features');
    console.log('[AQO trail] 1. First feature geometry type:', geojson.features[0].geometry.type);
    console.log('[AQO trail] 1. Sample property keys:', Object.keys(geojson.features[0].properties || {}));

    // ── 2. Helpers ───────────────────────────────────────────────────────────
    function flattenCoordinates(geometry) {
      if (geometry.type === 'MultiLineString') return geometry.coordinates.flat(1);
      return geometry.coordinates;
    }

    function ptDist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }

    // ── 4. Build ordered full-street paths from STREET_TOUR_STOPS by name ──────
    // Each stop is matched directly by stname — no coordinate guessing needed.
    // Highway stops get a heightAboveGround override so the camera rises above buildings.
    const HIGHWAY_HEIGHT = 35;

    // Flexible name matcher: case-insensitive, strips leading directional prefix (W/N/S/E)
    function matchName(geojsonName, stopName) {
      const strip = (s) => s.trim().toUpperCase().replace(/^[WNES]\s+/, '');
      const a = geojsonName.trim().toUpperCase();
      const b = stopName.trim().toUpperCase();
      return a === b || strip(a) === strip(b);
    }

    // Build a fully-ordered path from all GeoJSON features for a street.
    // Finds the true dangling endpoint first so the path travels start→end without doubling back.
    function buildStreetPath(stopName) {
      const features = geojson.features.filter((f) => {
        const n = f.properties?.stname || f.properties?.STREETNAME || f.properties?.FULLNAME || '';
        return matchName(n, stopName);
      });
      if (!features.length) return null;

      const rawLines = [];
      features.forEach((f) => {
        const lines = f.geometry.type === 'MultiLineString'
          ? f.geometry.coordinates : [f.geometry.coordinates];
        rawLines.push(...lines);
      });

      if (rawLines.length === 1) return rawLines[0];

      // Find the true dangling endpoint: a point that no other segment shares.
      // This is where the street begins so the camera travels the full length without reversing.
      const EPS = 1e-6;
      const samePoint = (a, b) => Math.abs(a[0] - b[0]) < EPS && Math.abs(a[1] - b[1]) < EPS;

      let startSegIdx = 0, reverseStart = false;
      outerSearch: for (let i = 0; i < rawLines.length; i++) {
        for (let e = 0; e < 2; e++) {
          const pt = e === 0 ? rawLines[i][0] : rawLines[i][rawLines[i].length - 1];
          const shared = rawLines.some((seg, j) => {
            if (j === i) return false;
            return samePoint(pt, seg[0]) || samePoint(pt, seg[seg.length - 1]);
          });
          if (!shared) { startSegIdx = i; reverseStart = (e === 1); break outerSearch; }
        }
      }

      // Chain from the dangling end, connecting exact-matching endpoints first,
      // falling back to nearest if the street has small gaps between features.
      const path = reverseStart ? [...rawLines[startSegIdx]].reverse() : [...rawLines[startSegIdx]];
      const used = new Set([startSegIdx]);

      while (used.size < rawLines.length) {
        const tail = path[path.length - 1];
        // Prefer exact endpoint match, then nearest
        let bestIdx = -1, bestDist = Infinity, bestRev = false;
        rawLines.forEach((seg, i) => {
          if (used.has(i)) return;
          const dFwd = ptDist(tail, seg[0]);
          const dRev = ptDist(tail, seg[seg.length - 1]);
          if (dFwd < bestDist) { bestDist = dFwd; bestIdx = i; bestRev = false; }
          if (dRev < bestDist) { bestDist = dRev; bestIdx = i; bestRev = true; }
        });
        if (bestIdx === -1) break;
        used.add(bestIdx);
        const seg = bestRev ? [...rawLines[bestIdx]].reverse() : rawLines[bestIdx];
        path.push(...seg.slice(1));
      }
      return path;
    }

    const allWaypoints = STREET_TOUR_STOPS;
    console.log('[AQO trail] 4. STREET_TOUR_STOPS to load:', allWaypoints.length);

    const segments = [];
    const segmentMeta = [];
    for (const stop of allWaypoints) {
      const path = buildStreetPath(stop.name);
      if (!path || path.length < 2) {
        console.warn(`[AQO trail] 4.   "${stop.name}" — not found in GeoJSON, skipping`);
        continue;
      }
      const isHighway = /roosevelt|ramp|blvd/i.test(stop.name);
      segments.push(path);
      segmentMeta.push({
        waypointName: stop.name,
        streetName: stop.name,
        description: stop.description || '',
        isHighway,
        heightAboveGround: isHighway ? HIGHWAY_HEIGHT : CONFIG.heightAboveGround,
      });
      console.log(`[AQO trail] 4.   "${stop.name}" → ${path.length} coords | highway: ${isHighway}`);
    }
    console.log('[AQO trail] 4. Segments collected:', segments.length);

    if (segments.length === 0) {
      console.error('[AQO trail] 4. ABORT — no stops matched GeoJSON. Check STREET_TOUR_STOPS names vs stname field.');
      if (onAnimationStop) onAnimationStop();
      return { stop };
    }

    // ── 4b. Debug visualization ──────────────────────────────────────────────
    if (debug) {
      // Polylines: clampToGround drapes them directly on the terrain/tiles surface
      segments.forEach((coords, idx) => {
        const positions = coords.map(([lon, lat]) =>
          Cesium.Cartesian3.fromDegrees(lon, lat)
        );
        const color = Cesium.Color.fromRandom({ alpha: 1.0 });
        const e = viewer.entities.add({
          polyline: {
            positions,
            width: 6,
            material: new Cesium.PolylineOutlineMaterialProperty({
              color,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 1,
            }),
            clampToGround: true,
          },
          properties: new Cesium.PropertyBag({ type: 'debug-segment', index: idx }),
        });
        debugEntities.push(e);
      });

      // Waypoint labels: use RELATIVE_TO_GROUND so they sit above terrain regardless of ellipsoid height
      allWaypoints.forEach((wp) => {
        const e = viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(wp.lng, wp.lat, 30),
          point: {
            pixelSize: 14,
            color: Cesium.Color.YELLOW,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
          },
          label: {
            text: wp.name,
            font: 'bold 13px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -18),
            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          properties: new Cesium.PropertyBag({ type: 'debug-waypoint' }),
        });
        debugEntities.push(e);
      });

      viewer.scene.requestRender();
      console.log(`[AQO debug] Drew ${segments.length} segment polylines + ${allWaypoints.length} waypoint markers. Stop the tour to remove them.`);
    }

    // ── 5. Build per-segment position arrays ────────────────────────────────
    // segPositions: Cartesian3 at height=0 — used ONLY for heading math (horizontal direction).
    // segments2D:   raw [lon, lat] pairs — used in the tick loop to recompute live ground
    //               height every frame so the camera follows terrain as tiles stream in.
    const segments2D = segments; // [[lon,lat]…] per segment — already built above
    const segPositions = segments.map((seg, i) => {
      const pts = seg.map(([lon, lat]) => Cesium.Cartesian3.fromDegrees(lon, lat, 0));
      console.log(`[AQO trail] 5. Segment ${i}: ${pts.length} pts (flat, for heading only)`);
      return pts;
    });
    console.log('[AQO trail] 5. Total segments:', segPositions.length);
    if (segPositions.length === 0 || segPositions[0].length < 2) {
      console.error('[AQO trail] 5. ABORT — no usable segments');
      if (onAnimationStop) onAnimationStop();
      return { stop };
    }

    // ── 6. Helpers ───────────────────────────────────────────────────────────
    // Linearly interpolate along a segment at t ∈ [0,1]
    function sampleSegment(pts, t) {
      if (pts.length === 1) return pts[0];
      const raw = t * (pts.length - 1);
      const i = Math.min(Math.floor(raw), pts.length - 2);
      const frac = raw - i;
      return Cesium.Cartesian3.lerp(pts[i], pts[i + 1], frac, new Cesium.Cartesian3());
    }

    // Compute compass heading (radians) from one Cartesian3 to another in ENU frame
    function headingBetween(from, to) {
      const transform = Cesium.Transforms.eastNorthUpToFixedFrame(from);
      const inv = Cesium.Matrix4.inverseTransformation(transform, new Cesium.Matrix4());
      const dir = Cesium.Cartesian3.subtract(to, from, new Cesium.Cartesian3());
      if (Cesium.Cartesian3.magnitudeSquared(dir) < 1e-8) return 0;
      const enu = Cesium.Matrix4.multiplyByPointAsVector(inv, dir, new Cesium.Cartesian3());
      return Math.atan2(enu.x, enu.y); // East=x, North=y → compass heading
    }

    // ── 7. State machine setup ───────────────────────────────────────────────
    // TRAVELING: camera moves along the current segment
    // ORBITING:  camera spins 360° at the end of each segment before moving on
    let phase = 'TRAVELING';
    let segIdx = 0;
    let phaseTime = 0;        // seconds elapsed in the current phase
    let prevRealMs = null;    // for frame-delta (real wall-clock, not sim time)
    let lastHeading = 0;
    let orbitStartHeading = 0;
    let currentPos = sampleSegment(segPositions[0], 0);

    function notifySegment(idx, p) {
      if (!onSegmentChange) return;
      const meta = segmentMeta[idx] || { waypointName: '—', streetName: '—', description: '', isHighway: false };
      onSegmentChange({
        segmentIndex: idx,
        total: segmentMeta.length,
        waypointName: meta.waypointName,
        streetName: meta.streetName,
        description: meta.description,
        isHighway: meta.isHighway,
        phase: p,
      });
    }

    // Pre-compute heading toward the first segment's second point
    lastHeading = headingBetween(segPositions[0][0], segPositions[0][1] || segPositions[0][0]);

    // Helper: recompute the camera target at live terrain height for a given segment index + t
    function livePos(segI, t) {
      const pts2D = segments2D[segI];
      const raw = t * (pts2D.length - 1);
      const ii = Math.min(Math.floor(raw), pts2D.length - 2);
      const frac = raw - ii;
      const lon = pts2D[ii][0] + frac * (pts2D[ii + 1][0] - pts2D[ii][0]);
      const lat = pts2D[ii][1] + frac * (pts2D[ii + 1][1] - pts2D[ii][1]);
      const carto = Cesium.Cartographic.fromDegrees(lon, lat);
      const groundH = viewer.scene.globe.getHeight(carto) ?? NICETOWN_ELLIPSOID_BASELINE;
      const h = segmentMeta[segI]?.heightAboveGround ?? CONFIG.heightAboveGround;
      return Cesium.Cartesian3.fromDegrees(lon, lat, groundH + h);
    }

    // ── 8. Initial camera placement ──────────────────────────────────────────
    currentPos = livePos(0, 0);
    if (viewer.trackedEntity) viewer.trackedEntity = undefined;
    viewer.camera.lookAt(
      currentPos,
      new Cesium.HeadingPitchRange(lastHeading, Cesium.Math.toRadians(CONFIG.cameraPitch), CONFIG.cameraRange)
    );
    console.log('[AQO trail] 8. Camera placed at start | CONFIG:', JSON.stringify(CONFIG));

    viewer.clock.shouldAnimate = true;
    viewer.scene.requestRender();
    if (onAnimationStart) onAnimationStart();
    notifySegment(0, 'TRAVELING');
    console.log('[AQO trail] 8. onAnimationStart fired — entering tick loop');

    // ── 9. Tick loop — state machine drives camera each frame ────────────────
    let tickCount = 0;
    removeTickListener = viewer.clock.onTick.addEventListener(() => {
      if (stopped || viewer.isDestroyed()) {
        if (removeTickListener) { removeTickListener(); removeTickListener = null; }
        return;
      }
      tickCount++;

      // Real-time dt so speed is independent of clock multiplier
      const nowMs = performance.now();
      if (prevRealMs === null) { prevRealMs = nowMs; }
      const dt = Math.min((nowMs - prevRealMs) / 1000, 0.1);
      prevRealMs = nowMs;
      phaseTime += dt;

      const pts = segPositions[segIdx];

      if (phase === 'TRAVELING') {
        const t = Math.min(phaseTime / CONFIG.secondsPerSegment, 1);

        // Recompute camera target from LIVE terrain height every frame — prevents
        // clipping when terrain tiles stream in after the tour has already started.
        currentPos = livePos(segIdx, t);

        // Look 1 second ahead for a stable heading (flat positions are fine for direction)
        const tAhead = Math.min((phaseTime + 1) / CONFIG.secondsPerSegment, 1);
        const aheadPos = sampleSegment(pts, tAhead);
        if (Cesium.Cartesian3.distanceSquared(
          sampleSegment(pts, t), aheadPos) > 1e-6) {
          lastHeading = headingBetween(sampleSegment(pts, t), aheadPos);
        }

        viewer.camera.lookAt(
          currentPos,
          new Cesium.HeadingPitchRange(lastHeading, Cesium.Math.toRadians(CONFIG.cameraPitch), CONFIG.cameraRange)
        );

        if (t >= 1) {
          currentPos = livePos(segIdx, 1);
          orbitStartHeading = lastHeading;

          if (segIdx + 1 < segPositions.length) {
            const nextFirst = segPositions[segIdx + 1][0];
            lastHeading = headingBetween(pts[pts.length - 1], nextFirst);
          }

          console.log(`[AQO trail] Segment ${segIdx} done → ORBITING | heading to next: ${Cesium.Math.toDegrees(lastHeading).toFixed(1)}°`);
          phase = 'ORBITING';
          phaseTime = 0;
          notifySegment(segIdx, 'ORBITING');
        }
      } else if (phase === 'ORBITING') {
        const progress = Math.min(phaseTime / CONFIG.orbitDuration, 1);
        const totalSweep = Math.PI * 2 + (lastHeading - orbitStartHeading);
        const orbitHeading = orbitStartHeading + progress * totalSweep;

        // Also use live height during orbit so terrain pop-in doesn't clip
        viewer.camera.lookAt(
          currentPos,
          new Cesium.HeadingPitchRange(orbitHeading, Cesium.Math.toRadians(CONFIG.cameraPitch), CONFIG.cameraRange)
        );

        if (progress >= 1) {
          segIdx++;
          if (segIdx >= segPositions.length) {
            console.log('[AQO trail] All segments complete. Tour done.');
            stop();
            return;
          }
          console.log(`[AQO trail] → TRAVELING segment ${segIdx}`);
          phase = 'TRAVELING';
          phaseTime = 0;
          currentPos = livePos(segIdx, 0);
          notifySegment(segIdx, 'TRAVELING');
        }
      }

      viewer.scene.requestRender();

      if (tickCount % 300 === 0) {
        console.log(`[AQO trail] tick#${tickCount} | seg ${segIdx}/${segPositions.length} | phase ${phase} | phaseTime ${phaseTime.toFixed(1)}s | heading ${Cesium.Math.toDegrees(lastHeading).toFixed(1)}°`);
      }
    });
    console.log('[AQO trail] 9. Tick listener registered. State machine running.');

    return { stop };
  } catch (err) {
    console.error('[AQO trail] FATAL:', err.message, err);
    if (onAnimationStop) onAnimationStop();
    return { stop };
  }
}
