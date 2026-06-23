'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TOUR_WAYPOINTS, createCinematicTour, createStreetTrailTour, createStoryTour } from './CinematicTour';
import TourControls from './TourControls';
import EnvironmentOverlay from './environment/EnvironmentOverlay';
import ParticleSystem from './environment/ParticleSystem';
import { useEnvironmentData } from '../lib/hooks/useEnvironmentData';
import { useLocations } from '../lib/hooks/useLocations';
import {
  COMMUNITY_SOLUTIONS,
  HEAT_ISLAND_ZONES,
  NICETOWN_COORDINATES,
  POLLUTION_SOURCES,
  CHARACTERS,
  VEHICLES,
  CHARACTER_SCALE,
  STORY_HEADING,
} from '../utils/mapUtils';
import { TEST_STORIES } from '../data/testStories';

// Tight bounding box around Nicetown + Hunting Park.
// Replaces the old Philadelphia-wide bounds — this is what stops the globe from loading.
const NICETOWN_BOUNDS = {
  west: -75.170,
  east: -75.115,
  south: 39.995,
  north: 40.035,
};

// A static JulianDate-like value that satisfies Cesium ConstantProperty.getValue(time).
// All our properties are constants so any valid time works.
const EPOCH = { secondsOfDay: 0, dayNumber: 2457388 };

// Read a value out of a Cesium PropertyBag without touching Cesium.JulianDate.now().
function readProp(entity, name) {
  const bag = entity.properties;
  if (!bag) return undefined;
  const p = bag[name];
  if (p === undefined || p === null) return undefined;
  return typeof p.getValue === 'function' ? p.getValue(EPOCH) : p;
}

// Extract plain-JS props from a GeoJSON-loaded entity's PropertyBag.
function readGeoJsonProps(entity) {
  const bag = entity.properties;
  if (!bag) return {};
  const names = bag.propertyNames || [];
  const out = {};
  names.forEach((n) => {
    const p = bag[n];
    out[n] = typeof p?.getValue === 'function' ? p.getValue(EPOCH) : p;
  });
  return out;
}

const AQO_STATS = [
  { id: 'asthma',     value: '21%',  label: 'Childhood Asthma Rate',        description: '3x national average',       color: '#FF6B35' },
  { id: 'cancer',     value: '41%',  label: 'Residents In High Cancer Zones',description: 'Major racial disparity',     color: '#FF4444' },
  { id: 'deaths',     value: '125',  label: 'Premature Deaths Per Year',      description: 'Air pollution related',      color: '#FF8844' },
  { id: 'air-grade',  value: 'F',    label: 'Air Quality Grade',              description: 'Philadelphia 2025',          color: '#FF2222' },
  { id: 'particulate',value: '61%',  label: 'Higher Particulate Exposure',    description: 'Black Americans nationally', color: '#FF6633' },
  { id: 'tree-canopy',value: '15%',  label: 'Tree Canopy',                    description: 'Roughly half of wealthier areas', color: '#4CAF50' },
];



async function loadCesiumRuntime() {
  if (typeof window === 'undefined') {
    throw new Error('Cesium can only load in the browser.');
  }

  window.CESIUM_BASE_URL = '/cesium';

  if (!document.getElementById('cesium-widgets-css')) {
    const link = document.createElement('link');
    link.id = 'cesium-widgets-css';
    link.rel = 'stylesheet';
    link.href = '/cesium/Widgets/widgets.css';
    document.head.appendChild(link);
  }

  await new Promise((resolve, reject) => {
    if (window.Cesium) return resolve();
    if (document.getElementById('cesium-script')) {
      document.getElementById('cesium-script').addEventListener('load', resolve);
      return;
    }
    const script = document.createElement('script');
    script.id = 'cesium-script';
    script.src = '/cesium/Cesium.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return window.Cesium;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function hasUsableGoogleMapsKey(key) {
  if (!key) return false;
  const normalized = String(key).trim().toLowerCase();
  if (!normalized) return false;
  return !(
    normalized.includes('your_api_key_here') ||
    normalized.includes('your_google_maps_api_key') ||
    normalized.includes('placeholder') ||
    normalized.startsWith('your_')
  );
}

function withTimeout(promise, timeoutMs, label) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timeoutId = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    promise.then(
      (value) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);
        resolve(value);
      },
      (error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);
        reject(error);
      }
    );
  });
}

// Returns a WGS84 height (metres) that places a model above the terrain/3D-tile
// surface at the given lng/lat. Uses globe.getHeight for a synchronous terrain
// sample with a 55 m fallback (Nicetown's approximate WGS84 ellipsoid baseline).
function safeModelHeight(Cesium, viewer, lng, lat) {
  const carto = Cesium.Cartographic.fromDegrees(lng, lat);
  return (viewer.scene.globe.getHeight(carto) ?? 55) + 20;
}

// Threshold in degrees (~3 m at Nicetown's latitude).
const COLLISION_DEG = 0.000030;

// Returns adjusted [lat, lng] so the new character doesn't overlap an already-placed one.
// Works in degree space to avoid ECEF complexity; at this scale the error is negligible.
function resolveCollision(newLat, newLng, placedPairs) {
  let lat = newLat, lng = newLng;
  for (let attempt = 0; attempt < 10; attempt++) {
    const clash = placedPairs.find(([pLat, pLng]) =>
      Math.hypot(lat - pLat, lng - pLng) < COLLISION_DEG
    );
    if (!clash) break;
    const [pLat, pLng] = clash;
    const dlat = lat - pLat, dlng = lng - pLng;
    const dist = Math.hypot(dlat, dlng);
    if (dist < 1e-9) {
      // Exact same point — push east by one threshold unit
      lng += COLLISION_DEG * 1.5;
    } else {
      const push = (COLLISION_DEG - dist + COLLISION_DEG * 0.5) / dist;
      lat += dlat * push;
      lng += dlng * push;
    }
  }
  return [lat, lng];
}

function createStatBillboard(stat) {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 124;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.fillStyle = 'rgba(4, 8, 16, 0.88)';
  ctx.strokeStyle = stat.color;
  ctx.lineWidth = 3;
  ctx.fillRect(8, 8, canvas.width - 16, canvas.height - 16);
  ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
  ctx.fillStyle = stat.color;
  ctx.font = '700 32px "Sora", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(stat.value, canvas.width / 2, 46);
  ctx.fillStyle = '#F7F1E3';
  ctx.font = '600 14px "Sora", sans-serif';
  ctx.fillText(stat.label, canvas.width / 2, 74);
  ctx.fillStyle = 'rgba(247, 241, 227, 0.72)';
  ctx.font = '500 12px "Sora", sans-serif';
  ctx.fillText(stat.description, canvas.width / 2, 98);
  return canvas.toDataURL('image/png');
}

function createMarkerBillboard({ name, accent, eyebrow }) {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 380;
  canvas.height = 108;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.fillStyle = 'rgba(4, 8, 16, 0.85)';
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.fillRect(8, 8, canvas.width - 16, canvas.height - 16);
  ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
  ctx.fillStyle = 'rgba(247, 241, 227, 0.64)';
  ctx.font = '600 16px "Sora", sans-serif';
  ctx.fillText(eyebrow, 28, 36);
  ctx.fillStyle = '#F7F1E3';
  ctx.font = '700 26px "Sora", sans-serif';
  ctx.fillText(name, 28, 72);
  ctx.fillStyle = accent;
  ctx.fillRect(28, 82, 136, 4);
  return canvas.toDataURL('image/png');
}

const CesiumMap = ({
  initialLat = NICETOWN_COORDINATES.lat,
  initialLon = NICETOWN_COORDINATES.lng,
  initialHeight = NICETOWN_COORDINATES.alt,
  backgroundMode = false,
}) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const cesiumRef = useRef(null);
  const tourControllerRef = useRef(null);
  const streetTrailRef = useRef(null);
  const storyTourRef = useRef(null);
  const managedLocationEntityIdsRef = useRef([]);
  const cleanupRef = useRef([]);
  const orbitStateRef = useRef({ active: false, removeTick: null });
  const isRedirectingRef = useRef(false);
  // RAF loop ref — drives rendering only while orbit/tour animation is active
  const rafLoopRef = useRef(null);
  // Stores original polygon/point colors for context entities so they can be restored
  const contextMaterialsRef = useRef(new Map());

  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [usingGoogleTiles, setUsingGoogleTiles] = useState(false);
  const [isTourPlaying, setIsTourPlaying] = useState(false);
  const [activeTourWaypoint, setActiveTourWaypoint] = useState(null);
  const [activeTourStat, setActiveTourStat] = useState(null);
  const [clickCoords, setClickCoords] = useState(null);
  const [perspective, setPerspectiveState] = useState('full');
  const [debugMode, setDebugMode] = useState(false);
  const [tourLocation, setTourLocation] = useState(null);
  const [showAllStreets, setShowAllStreets] = useState(false);
  const [isStoryTourPlaying, setIsStoryTourPlaying] = useState(false);
  const [activeStoryInfo, setActiveStoryInfo] = useState(null);
  const streetOverlayRef = useRef([]);
  const perspectiveRef = useRef('full');

  const environment = useEnvironmentData(backgroundMode ? null : initialLat, backgroundMode ? null : initialLon);
  const { locations: managedLocations } = useLocations();

  const overlayStats = useMemo(() => AQO_STATS.slice(0, 4), []);
  const showParticles = !backgroundMode && (
    (environment.isSummer || (environment.temp ?? 0) >= 28) ||
    environment.pollenLevel === 'high'
  );

  // ---------------------------------------------------------------------------
  // syncManagedLocations — rebuilds admin-managed location entities when DB data changes
  // ---------------------------------------------------------------------------
  const syncManagedLocations = (viewer, Cesium, locations) => {
    managedLocationEntityIdsRef.current.forEach((entityId) => {
      const entity = viewer.entities.getById(entityId);
      if (entity) viewer.entities.remove(entity);
    });
    managedLocationEntityIdsRef.current = [];

    const reservedNames = new Set([
      ...POLLUTION_SOURCES.map((item) => item.name.toLowerCase()),
      ...COMMUNITY_SOLUTIONS.map((item) => item.name.toLowerCase()),
    ]);

    locations.forEach((location) => {
      if (!location?.name || reservedNames.has(location.name.toLowerCase())) return;
      const isPollution = location.type === 'pollution';
      const accent = isPollution ? '#FF5A4F' : '#40C97C';
      const eyebrow = isPollution ? 'Admin-managed pollution point' : 'Admin-managed solution point';
      const entityId = `managed-location-${location.id}`;

      viewer.entities.add({
        id: entityId,
        name: location.name,
        position: Cesium.Cartesian3.fromDegrees(location.lng, location.lat, 30),
        point: {
          pixelSize: 10,
          color: Cesium.Color.fromCssColorString(accent),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        billboard: {
          image: createMarkerBillboard({ name: location.name, accent, eyebrow }),
          width: 190,
          height: 52,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -18),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        description: `
          <div style="padding: 12px; max-width: 280px; color: #111827;">
            <h3 style="margin: 0 0 8px; color: ${accent};">${location.name}</h3>
            <p style="margin: 0 0 8px;">${location.address}</p>
            <p style="margin: 0;"><strong>Type:</strong> ${location.type}</p>
          </div>
        `,
        properties: new Cesium.PropertyBag({
          narrativeRole: isPollution ? 'problem' : 'solution',
          solutionStatus: isPollution ? null : 'active',
          id: entityId,
          popupContent: location.name,
        }),
      });
      managedLocationEntityIdsRef.current.push(entityId);
    });

    viewer.scene.requestRender();
  };

  // ---------------------------------------------------------------------------
  // Main initialization effect
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const registerCleanup = (fn) => { cleanupRef.current.push(fn); };

    // RAF loop — drives postRender-based orbit animation while active.
    // With requestRenderMode: true + maximumRenderTimeChange: Infinity, nothing renders
    // unless we explicitly call requestRender(). This loop fires one render per frame
    // only while orbit or cinematic tour animation is running.
    const startRenderLoop = (viewer) => {
      const loop = () => {
        if (!viewer || viewer.isDestroyed()) return;
        viewer.scene.requestRender();
        rafLoopRef.current = requestAnimationFrame(loop);
      };
      if (!rafLoopRef.current) {
        rafLoopRef.current = requestAnimationFrame(loop);
      }
    };

    const stopRenderLoop = () => {
      if (rafLoopRef.current) {
        cancelAnimationFrame(rafLoopRef.current);
        rafLoopRef.current = null;
      }
    };

    const stopOrbit = (Cesium) => {
      const orbitState = orbitStateRef.current;
      if (orbitState.removeTick) orbitState.removeTick();
      if (viewerRef.current && Cesium && !viewerRef.current.isDestroyed()) {
        viewerRef.current.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
      }
      orbitStateRef.current = { active: false, removeTick: null };
      stopRenderLoop();
    };

    const startOrbit = (viewer, Cesium, focus, range) => {
      stopOrbit(Cesium);
      startRenderLoop(viewer); // RAF loop drives the postRender orbit tick

      const target = Cesium.Cartesian3.fromDegrees(focus.lng, focus.lat, focus.height || 0);
      const orbitState = { angle: Cesium.Math.toRadians(20) };

      const tick = () => {
        if (!viewer || viewer.isDestroyed()) return;
        orbitState.angle += backgroundMode ? 0.0008 : 0.0012;
        viewer.camera.lookAt(
          target,
          new Cesium.HeadingPitchRange(orbitState.angle, Cesium.Math.toRadians(-28), range)
        );
      };

      viewer.scene.postRender.addEventListener(tick);
      orbitStateRef.current = {
        active: true,
        removeTick: () => viewer.scene.postRender.removeEventListener(tick),
      };
    };

    const flyHome = (viewer, Cesium, duration = 2.4, options = {}) => {
      stopOrbit(Cesium);
      viewer.camera.cancelFlight();
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(initialLon, initialLat, initialHeight),
        orientation: {
          heading: Cesium.Math.toRadians(-12),
          pitch: Cesium.Math.toRadians(-24),
          roll: 0,
        },
        duration,
        easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
        complete: () => {
          if (!backgroundMode && options.orbitAfterArrival) {
            startOrbit(viewer, Cesium, { lng: initialLon, lat: initialLat }, initialHeight * 1.22);
          }
        },
      });
    };

    // -------------------------------------------------------------------------
    // Entity builders — every entity gets a narrativeRole PropertyBag so the
    // perspective toggle can show/hide it without hard-coded lists.
    // -------------------------------------------------------------------------

    const addStatsEntities = (viewer, Cesium) => {
      AQO_STATS.forEach((stat, index) => {
        const lonOffset = -0.012 + (index % 3) * 0.012;
        const latOffset = 0.013 - Math.floor(index / 3) * 0.009;
        viewer.entities.add({
          id: `aqo-stat-${stat.id}`,
          position: Cesium.Cartesian3.fromDegrees(initialLon + lonOffset, initialLat + latOffset, 140),
          billboard: {
            image: createStatBillboard(stat),
            width: 160,
            height: 62,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -8),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          properties: new Cesium.PropertyBag({
            narrativeRole: 'problem',
            id: `aqo-stat-${stat.id}`,
            popupContent: `${stat.label}: ${stat.value}`,
          }),
        });
      });
    };

    const addNeighborhoodFeatures = (viewer, Cesium) => {
      // Store original park color up-front so de-emphasis can restore it.
      const parkColor = Cesium.Color.fromCssColorString('#FF6B35').withAlpha(0.35);
      contextMaterialsRef.current.set('nicetown-park-polygon', parkColor);

      viewer.entities.add({
        id: 'nicetown-park',
        name: 'Nicetown Park',
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray([
            -75.1580, 40.0185,
            -75.1535, 40.0185,
            -75.1535, 40.0215,
            -75.1580, 40.0215,
          ]),
          material: parkColor,
          outline: true,
          outlineColor: Cesium.Color.WHITE.withAlpha(0.92),
          perPositionHeight: false,
          height: 0,
        },
        description: `
          <div style="padding: 12px; max-width: 280px; color: #111827;">
            <h3 style="margin: 0 0 8px; color: #FF6B35;">Nicetown Park</h3>
            <p style="margin: 0 0 8px;">Community anchor and map starting point for AQO storytelling.</p>
            <p style="margin: 0;"><strong>Coordinates:</strong> 40.01999, -75.15540</p>
          </div>
        `,
        properties: new Cesium.PropertyBag({
          narrativeRole: 'context',
          id: 'nicetown-park',
          popupContent: 'Nicetown Park — community anchor.',
        }),
      });

      POLLUTION_SOURCES.forEach((source) => {
        const accent = source.type === 'industrial' ? '#FF4444' : '#FF7A45';
        viewer.entities.add({
          id: `pollution-${source.id}`,
          name: source.name,
          position: Cesium.Cartesian3.fromDegrees(source.coordinates.lng, source.coordinates.lat, 28),
          point: {
            pixelSize: 13,
            color: Cesium.Color.fromCssColorString(accent),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          billboard: {
            image: createMarkerBillboard({ name: source.name, accent, eyebrow: 'Pollution source' }),
            width: 180,
            height: 52,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -18),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          description: `
            <div style="padding: 12px; max-width: 280px; color: #111827;">
              <h3 style="margin: 0 0 8px; color: ${accent};">${source.name}</h3>
              <p style="margin: 0 0 8px;">${source.description}</p>
              <p style="margin: 0;"><strong>Category:</strong> ${source.type}</p>
            </div>
          `,
          properties: new Cesium.PropertyBag({
            narrativeRole: 'problem',
            id: `pollution-${source.id}`,
            popupContent: source.description,
          }),
        });
      });

      COMMUNITY_SOLUTIONS.forEach((location) => {
        const accent = location.type === 'infrastructure' ? '#2DD4BF' : '#4CAF50';
        viewer.entities.add({
          id: `solution-${location.id}`,
          name: location.name,
          position: Cesium.Cartesian3.fromDegrees(location.coordinates.lng, location.coordinates.lat, 24),
          point: {
            pixelSize: 11,
            color: Cesium.Color.fromCssColorString(accent),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          billboard: {
            image: createMarkerBillboard({ name: location.name, accent, eyebrow: 'Community solution' }),
            width: 180,
            height: 52,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -18),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          description: `
            <div style="padding: 12px; max-width: 280px; color: #111827;">
              <h3 style="margin: 0 0 8px; color: ${accent};">${location.name}</h3>
              <p style="margin: 0 0 8px;">${location.description}</p>
              <p style="margin: 0;"><strong>Category:</strong> ${location.type}</p>
            </div>
          `,
          properties: new Cesium.PropertyBag({
            narrativeRole: 'solution',
            solutionStatus: 'active',
            id: `solution-${location.id}`,
            popupContent: location.description,
          }),
        });
      });

      HEAT_ISLAND_ZONES.forEach((zone) => {
        const color = zone.intensity === 'high' ? '#FF3B30' : '#FF9F0A';
        viewer.entities.add({
          id: `heat-zone-${zone.id}`,
          name: zone.name,
          position: Cesium.Cartesian3.fromDegrees(zone.coordinates.lng, zone.coordinates.lat, 0),
          ellipse: {
            semiMajorAxis: zone.radius,
            semiMinorAxis: zone.radius,
            material: Cesium.Color.fromCssColorString(color).withAlpha(0.22),
            outline: true,
            outlineColor: Cesium.Color.fromCssColorString(color).withAlpha(0.8),
            height: 0,
          },
          description: `
            <div style="padding: 12px; max-width: 280px; color: #111827;">
              <h3 style="margin: 0 0 8px; color: ${color};">${zone.name}</h3>
              <p style="margin: 0;"><strong>Heat intensity:</strong> ${zone.intensity}</p>
            </div>
          `,
          properties: new Cesium.PropertyBag({
            narrativeRole: 'problem',
            id: `heat-zone-${zone.id}`,
            popupContent: `${zone.name} — heat intensity: ${zone.intensity}`,
          }),
        });
      });
    };

    // Returns the WGS84 height at which a model should be placed so it appears
    // on/above the ground surface rather than being occluded by terrain or 3D tiles.
    // Uses globe.getHeight (synchronous, reads whatever terrain tile is loaded)
    // and falls back to 55 m (the approximate WGS84 ellipsoid height for Nicetown).
    // Adding 2 m above that baseline keeps the model clear of the 3D tile mesh.
    // Place GLB character and vehicle models from public/models/.
    const addCharacterModels = (viewer, Cesium) => {
      CHARACTERS.forEach((char, i) => {
        const pos = Cesium.Cartesian3.fromDegrees(char.lon, char.lat, 0);
        viewer.entities.add({
          id: `character-${i}`,
          name: char.name,
          position: pos,
          orientation: Cesium.Transforms.headingPitchRollQuaternion(
            pos, new Cesium.HeadingPitchRoll(STORY_HEADING, 0, 0)
          ),
          model: {
            uri: char.uri,
            scale: CHARACTER_SCALE,
            minimumPixelSize: 64,
            runAnimations: false,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          description: `
            <div style="padding: 12px; max-width: 280px; color: #ffffff;">
              <h3 style="margin: 0 0 8px; color: #4CAF50;">${char.name}</h3>
              <p style="margin: 0;">${char.role}</p>
            </div>
          `,
          properties: new Cesium.PropertyBag({
            narrativeRole: 'solution',
            solutionStatus: 'active',
            id: `character-${i}`,
            popupContent: char.role,
          }),


        });

      });

      

      VEHICLES.forEach((v, i) => {
        viewer.entities.add({
          id: `vehicle-${i}`,
          name: v.name,
          position: Cesium.Cartesian3.fromDegrees(v.lon, v.lat),
          model: {
            uri: v.uri,
            scale: v.scale,
            minimumPixelSize: 24,
            heightReference: Cesium.HeightReference.CLAMP_TO_3D_TILE,
          },
          description: `
            <div style="padding: 12px; max-width: 280px; color: #111827;">
              <h3 style="margin: 0 0 8px;">${v.name}</h3>
              <p style="margin: 0;">${v.description}</p>
            </div>
          `,
          properties: new Cesium.PropertyBag({
            narrativeRole: v.narrativeRole,
            solutionStatus: v.solutionStatus || null,
            id: `vehicle-${i}`,
            popupContent: v.description,
          }),
        });
      });

      viewer.scene.requestRender();

      // Event-driven render trigger — fires requestRender() the moment each GLB resolves.
      // ModelVisualizer creates Model primitives during the update phase (before postUpdate fires),
      // so scanning on postUpdate finds them on the same frame they are created.
      // Duck-type: Model primitives have readyEvent (Event) + url (string) but no .asset (tilesets do).
      const hookedPrimitives = new WeakSet();

      const scanAndHook = () => {
        if (!viewer || viewer.isDestroyed()) return;
        const prims = viewer.scene.primitives;
        for (let i = 0; i < prims.length; i++) {
          const p = prims.get(i);
          if (!p || hookedPrimitives.has(p)) continue;
          if (typeof p.readyEvent !== 'object' || typeof p.url !== 'string' || p.asset) continue;
          hookedPrimitives.add(p);
          const label = decodeURIComponent(p.url.split('/').pop());
          if (p.ready) {
            console.log(`[AQO models] ${label} — already ready`);
            viewer.scene.requestRender();
          } else {
            p.readyEvent.addEventListener(() => {
              console.log(`[AQO models] ${label} — loaded OK → requestRender`);
              viewer.scene.requestRender();
            });
            if (p.errorEvent) {
              p.errorEvent.addEventListener((err) => {
                console.error(`[AQO models] ${label} — LOAD FAILED`, err);
              });
            }
          }
        }
      };

      const removeScanListener = viewer.scene.postUpdate.addEventListener(scanAndHook);
      registerCleanup(removeScanListener);
    };

    // Generic GeoJSON layer loader.
    // Activate each layer by dropping a pre-clipped GeoJSON file into public/geojson/.
    // Silently skips if the file is not present yet — no error, no crash.
    const loadGeoJsonLayer = async (url, styleFn, role, solutionStatus = null) => {
      try {
        const ds = await Cesium.GeoJsonDataSource.load(url, { clampToGround: true });
        let counter = 0;
        for (const e of ds.entities.values) {
          const props = readGeoJsonProps(e);
          styleFn(e, props, Cesium);
          const id = props.OBJECTID ?? props.id ?? props.objectid ?? `${role}-${counter++}`;
          const descHtml = e.description?.getValue?.(EPOCH) ?? String(e.description ?? `${role} feature.`);
          e.description = descHtml;
          e.properties = new Cesium.PropertyBag({
            narrativeRole: role,
            id: String(id),
            popupContent: descHtml,
            ...(solutionStatus ? { solutionStatus } : {}),
          });
        }
        viewer.dataSources.add(ds);
        viewer.scene.requestRender();
        return ds;
      } catch {
        return null; // file not yet available — silent skip
      }
    };

    // Shared helper — adds story character entities to the viewer with collision avoidance.
    // `stories` is an array of objects that each have: id, personName, lat, lng,
    // modelUri?, characterColor?, streetName?, content?.
    // `placedPairs` is a mutable array of [lat, lng] pairs already placed this session;
    // it is updated in place so callers can accumulate across multiple batches.
    const renderStoryCharacters = (viewer, Cesium, stories, placedPairs) => {
      let added = 0;
      for (const story of stories) {
        if (!story.lat || !story.lng) continue;

        if (viewer.entities.getById(`story-character-${story.id}`)) {
          viewer.entities.removeById(`story-character-${story.id}`);
        }

        const [lat, lng] = resolveCollision(story.lat, story.lng, placedPairs);
        placedPairs.push([lat, lng]);

        const color = story.characterColor || '#FF6B35';
        const storyPos = Cesium.Cartesian3.fromDegrees(lng, lat, 0);
        viewer.entities.add({
          id: `story-character-${story.id}`,
          name: story.personName,
          position: storyPos,
          orientation: Cesium.Transforms.headingPitchRollQuaternion(
            storyPos, new Cesium.HeadingPitchRoll(STORY_HEADING, 0, 0)
          ),
          model: {
            uri: story.modelUri || '/models/characters/CharacterBase.glb',
            scale: CHARACTER_SCALE,
            minimumPixelSize: 64,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            color: Cesium.Color.fromCssColorString(color),
            runAnimations: false,
            silhouetteColor: Cesium.Color.WHITE,
            silhouetteSize: 4,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          description: `
            <div style="padding:12px;max-width:300px;color:#ffffff;font-family:sans-serif;">
              <h3 style="margin:0 0 6px;color:${color};font-size:16px;">${story.personName}</h3>
              ${story.community ? `<p style="margin:0 0 4px;font-size:12px;color:#d1d5db;">${story.community}</p>` : ''}
              ${story.streetName ? `<p style="margin:0 0 8px;font-size:12px;"><strong>Location:</strong> ${story.streetName}</p>` : ''}
              <p style="margin:0;font-size:13px;line-height:1.5;">${story.content || ''}</p>
            </div>
          `,
          properties: new Cesium.PropertyBag({
            narrativeRole: 'user-story',
            storyId: story.id,
            personName: story.personName,
            streetName: story.streetName || '',
            content: story.content || '',
            community: story.community || '',
          }),
        });
        added++;
      }
      return added;
    };

    // Load approved stories from the DB on initial map load.
    const loadUserStories = async (viewer, Cesium) => {
      try {
        const res = await fetch('/api/stories?status=APPROVED');
        const stories = await res.json();
        console.log('[AQO stories] API returned:', Array.isArray(stories) ? `${stories.length} stories` : stories);
        if (!Array.isArray(stories)) return;

        const placedPairs = [];
        const count = renderStoryCharacters(viewer, Cesium, stories, placedPairs);

        // In development also load test stories (same collision pool so they don't overlap DB stories)
        if (process.env.NODE_ENV === 'development') {
          const testCount = renderStoryCharacters(viewer, Cesium, TEST_STORIES, placedPairs);
          console.log(`[AQO stories] Dev mode: added ${testCount} test story characters`);
        }

        viewer.scene.requestRender();
        console.log(`[AQO stories] Loaded ${count} story characters from DB`);
      } catch (err) {
        console.warn('[AQO stories] Failed to load user stories:', err.message);
      }
    };

    // -------------------------------------------------------------------------
    // initialize — creates the Cesium viewer and loads all content
    // -------------------------------------------------------------------------
    const initialize = async () => {
      try {
        const Cesium = await withTimeout(loadCesiumRuntime(), 30000, 'Cesium runtime');

        if (!isMounted || !containerRef.current || viewerRef.current) return;

        if (process.env.NEXT_PUBLIC_CESIUM_TOKEN) {
          Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_TOKEN;
        }

        const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        const shouldUseGoogleTiles = hasUsableGoogleMapsKey(googleMapsApiKey) && Boolean(Cesium.GoogleMaps);
        if (shouldUseGoogleTiles) {
          Cesium.GoogleMaps.defaultApiKey = googleMapsApiKey;
        }

        cesiumRef.current = Cesium;

        // Constrain the initial camera position to Nicetown before the viewer is created.
        Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(
          NICETOWN_BOUNDS.west, NICETOWN_BOUNDS.south,
          NICETOWN_BOUNDS.east, NICETOWN_BOUNDS.north
        );

        const viewer = new Cesium.Viewer(containerRef.current, {
          baseLayerPicker: false,
          geocoder: false,
          homeButton: !backgroundMode,
          sceneModePicker: false,
          navigationHelpButton: false,
          animation: false,
          timeline: false,
          fullscreenButton: !backgroundMode,
          infoBox: false,
          selectionIndicator: false,
          // Request render mode: only redraw when something actually changes.
          // Orbit/tour animation drives rendering via a RAF loop + postRender listener.
          requestRenderMode: true,
          maximumRenderTimeChange: Infinity,
          scene3DOnly: true,
          shadows: false,
        });

        viewerRef.current = viewer;
        window.viewer = viewer;
        viewer.resolutionScale = Math.min(window.devicePixelRatio || 1, 1.5);

        for (let i = 0; i < viewer.scene.primitives.length; i++) {
            console.log(i, viewer.scene.primitives.get(i));
          }

        viewer.scene.globe.depthTestAgainstTerrain = false;
        viewer.scene.globe.enableLighting = true;
        viewer.scene.globe.dynamicAtmosphereLighting = true;
        viewer.scene.globe.dynamicAtmosphereLightingFromSun = false;
        // Fog and sky disabled — they add streaming cost and are never visible at this zoom
        viewer.scene.fog.enabled = false;
        viewer.scene.highDynamicRange = false;
        viewer.scene.skyAtmosphere.show = false;
        viewer.scene.postProcessStages.fxaa.enabled = true;
        // Higher SSE = less terrain/imagery detail = faster (default is 2)
        viewer.scene.globe.maximumScreenSpaceError = 4;

        if (viewer.scene.postProcessStages.bloom) {
          viewer.scene.postProcessStages.bloom.enabled = false;
          viewer.scene.postProcessStages.bloom.uniforms.glowOnly = false;
          viewer.scene.postProcessStages.bloom.uniforms.delta = 0.25;
          viewer.scene.postProcessStages.bloom.uniforms.sigma = 1.1;
          viewer.scene.postProcessStages.bloom.uniforms.stepSize = 1.0;
        }

        if (viewer.scene.postProcessStages.ambientOcclusion) {
          viewer.scene.postProcessStages.ambientOcclusion.enabled = false;
          viewer.scene.postProcessStages.ambientOcclusion.uniforms.intensity = 1.2;
          viewer.scene.postProcessStages.ambientOcclusion.uniforms.bias = 0.1;
          viewer.scene.postProcessStages.ambientOcclusion.uniforms.lengthCap = 0.22;
        }

        const cameraCtrl = viewer.scene.screenSpaceCameraController;
        cameraCtrl.enableCollisionDetection = true;
        cameraCtrl.enableTilt = true;
        cameraCtrl.enableLook = !backgroundMode;
        cameraCtrl.enableTranslate = !backgroundMode;
        cameraCtrl.enableZoom = true;
        cameraCtrl.enableRotate = true;
        cameraCtrl.inertiaSpin = 0.9;
        cameraCtrl.inertiaTranslate = 0.9;
        cameraCtrl.inertiaZoom = 0.85;
        // minimumZoomDistance = 1 so we can descend to street level to see person-scale models.
        // maximumZoomDistance keeps the globe from loading — the neighbourhood is all that streams.
        cameraCtrl.minimumZoomDistance = 1;
        cameraCtrl.maximumZoomDistance = 6000;

        viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(initialLon, initialLat, initialHeight),
          orientation: {
            heading: Cesium.Math.toRadians(-12),
            pitch: Cesium.Math.toRadians(-24),
            roll: 0,
          },
        });

        viewer.camera.percentageChanged = 0.001;
        viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date('2026-05-19T18:45:00Z'));

        if (isMounted) setIsLoaded(true);

        if (viewer.homeButton) {
          const beforeExecute = (event) => {
            event.cancel = true;
            flyHome(viewer, Cesium, 1.8);
          };
          viewer.homeButton.viewModel.command.beforeExecute.addEventListener(beforeExecute);
          registerCleanup(() => viewer.homeButton.viewModel.command.beforeExecute.removeEventListener(beforeExecute));
        }

        // Pan boundary — bounce camera back if it leaves Nicetown bounds
        const moveEndHandler = () => {
          if (backgroundMode || isRedirectingRef.current) return;

          const cartographic = viewer.camera.positionCartographic;
          const lon = Cesium.Math.toDegrees(cartographic.longitude);
          const lat = Cesium.Math.toDegrees(cartographic.latitude);

          const isOutOfBounds =
            lon < NICETOWN_BOUNDS.west ||
            lon > NICETOWN_BOUNDS.east ||
            lat < NICETOWN_BOUNDS.south ||
            lat > NICETOWN_BOUNDS.north;

          if (!isOutOfBounds) return;

          isRedirectingRef.current = true;
          const safeLon = clamp(lon, NICETOWN_BOUNDS.west + 0.002, NICETOWN_BOUNDS.east - 0.002);
          const safeLat = clamp(lat, NICETOWN_BOUNDS.south + 0.002, NICETOWN_BOUNDS.north - 0.002);

          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(safeLon, safeLat, cartographic.height),
            orientation: {
              heading: viewer.camera.heading,
              pitch: clamp(viewer.camera.pitch, Cesium.Math.toRadians(-75), Cesium.Math.toRadians(-15)),
              roll: 0,
            },
            duration: 0.8,
            easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
            complete: () => { isRedirectingRef.current = false; },
            cancel:   () => { isRedirectingRef.current = false; },
          });
        };

        viewer.camera.moveEnd.addEventListener(moveEndHandler);
        registerCleanup(() => viewer.camera.moveEnd.removeEventListener(moveEndHandler));

        try {
          const terrainProvider = await withTimeout(
            Cesium.createWorldTerrainAsync({ requestVertexNormals: true, requestWaterMask: true }),
            8000, 'World terrain'
          );
          if (!viewer.isDestroyed()) viewer.terrainProvider = terrainProvider;
        } catch (terrainError) {
          console.warn('World terrain unavailable. Continuing without terrain.', terrainError);
        }

        // Google Photorealistic 3D Tiles — the single 3D base layer.
        // Building geometry is baked into this mesh; no separate building tileset is added.
        // We subscribe to initialTilesLoaded so scene.requestRender() fires once the first
        // tile batch arrives, which is also when CLAMP_TO_3D_TILE heights resolve.
        try {
          if (shouldUseGoogleTiles) {
            const tileset = await withTimeout(
              Cesium.createGooglePhotorealistic3DTileset({ onlyUsingWithGoogleGeocoder: true }),
              10000, 'Google Photorealistic 3D Tiles'
            );
            viewer.scene.primitives.add(tileset);
            setUsingGoogleTiles(true);
            console.log('[AQO] Google Photorealistic 3D Tiles loaded — CLAMP_TO_3D_TILE is active.');
            tileset.initialTilesLoaded.addEventListener(() => {
              console.log('[AQO] Google tiles: initial batch streamed in. Heights should now resolve.');
              viewer.scene.requestRender();
            });
            viewer.scene.requestRender();
          } else {
            console.warn('[AQO] Google Maps API key missing or invalid — 3D tiles NOT loaded. CLAMP_TO_3D_TILE will fall back to terrain. Models may be at wrong height.');
          }
        } catch (tilesError) {
          console.warn('[AQO] Google Photorealistic 3D Tiles failed to load — CLAMP_TO_3D_TILE falling back to terrain.', tilesError);
        }

        if (!backgroundMode) {
          addNeighborhoodFeatures(viewer, Cesium);
          viewer.scene.requestRender();

          addStatsEntities(viewer, Cesium);
          viewer.scene.requestRender();

          syncManagedLocations(viewer, Cesium, managedLocations);

          addCharacterModels(viewer, Cesium);

          // Load approved user stories as character models on the map
          await loadUserStories(viewer, Cesium);

          // GeoJSON foundation layers — activate by placing pre-clipped files at these paths.
          // Each call is a no-op until the file exists; no error is thrown.
          // Building footprints — draped onto the Google Photorealistic 3D tile surface
          // so picking works on the photoreal mesh. Near-invisible fill: the buildings
          // are already rendered by the photoreal tiles; this layer adds click targets only.
          await loadGeoJsonLayer(
            '/geojson/buildings.geojson',
            (e, props, C) => {
              if (e.polygon) {
                e.polygon.material = C.Color.WHITE.withAlpha(0.04);
                e.polygon.outline = false;
                // Drape onto the 3D tile surface rather than extruding above it
                e.polygon.classificationType = C.ClassificationType.CESIUM_3D_TILE;
              }
              e.description = `Building at ${props.ADDRESS ?? props.address ?? 'this location'}. Story coming soon.`;
            },
            'context'
          );

          await loadGeoJsonLayer(
            '/geojson/roads.geojson',
            (e, props, C) => {
              if (e.polygon) e.polygon.material = C.Color.fromCssColorString('#555555').withAlpha(0.5);
              e.description = 'Road segment — details coming soon.';
            },
            'context'
          );

          await loadGeoJsonLayer(
            '/geojson/greenspace.geojson',
            (e, props, C) => {
              const cls = Number(props.gridcode ?? props.class ?? props.CLASS ?? 1);
              const color = cls === 1 ? '#2D6A4F' : '#74C69D'; // 1=tree canopy, 2=grass/shrub
              if (e.polygon) e.polygon.material = C.Color.fromCssColorString(color).withAlpha(0.55);
              e.description = 'Green space — story coming soon.';
            },
            'solution',
            'active'
          );

          tourControllerRef.current = createCinematicTour({
            viewer,
            Cesium,
            onWaypointChange: setActiveTourWaypoint,
            onStatsChange: setActiveTourStat,
            onPlayingChange: setIsTourPlaying,
            onAnimationStart: () => startRenderLoop(viewer),
            onAnimationStop: stopRenderLoop,
          });

          //get the abnimation for whatevr starts 
          storyTourRef.current = createStoryTour({
            viewer,
            Cesium,
            onPlayingChange: setIsStoryTourPlaying,
            onStoryChange: setActiveStoryInfo,
          });

          const clickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
          clickHandler.setInputAction((movement) => {
            const picked = viewer.scene.pick(movement.position);
            if (Cesium.defined(picked) && picked.id) viewer.selectedEntity = picked.id;

            const cartesian =
              viewer.scene.pickPosition(movement.position) ||
              viewer.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
            if (Cesium.defined(cartesian)) {
              const carto = Cesium.Cartographic.fromCartesian(cartesian);
              setClickCoords({
                lat: parseFloat(Cesium.Math.toDegrees(carto.latitude).toFixed(6)),
                lng: parseFloat(Cesium.Math.toDegrees(carto.longitude).toFixed(6)),
                alt: Math.round(carto.height),
              });
            }
          }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
          registerCleanup(() => clickHandler.destroy());
        }

        flyHome(viewer, Cesium, backgroundMode ? 0 : 2.6, { orbitAfterArrival: backgroundMode });
        if (backgroundMode) {
          startOrbit(viewer, Cesium, { lng: initialLon, lat: initialLat }, initialHeight * 2.4);
        }
      } catch (loadError) {
        console.error('Failed to initialize Cesium map:', loadError);
        if (isMounted) setError(loadError.message || 'Failed to initialize map');
      }
    };

    initialize();

    return () => {
      isMounted = false;
      stopRenderLoop();

      cleanupRef.current.forEach((fn) => {
        try { fn(); } catch (cleanupError) { console.warn('Cleanup error:', cleanupError); }
      });
      cleanupRef.current = [];

      if (tourControllerRef.current) tourControllerRef.current.stopTour();
      tourControllerRef.current = null;

      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        try { stopOrbit(cesiumRef.current || window.Cesium); } catch {}
        viewerRef.current.destroy();
      }
      viewerRef.current = null;
      cesiumRef.current = null;
      managedLocationEntityIdsRef.current = [];
    };
  }, [backgroundMode, initialHeight, initialLat, initialLon]);

  // Sync managed locations whenever the DB result changes
  useEffect(() => {
    if (!viewerRef.current || !cesiumRef.current || backgroundMode) return;
    syncManagedLocations(viewerRef.current, cesiumRef.current, managedLocations);
  }, [backgroundMode, managedLocations]);

  // Keyboard navigation for story slideshow (left/right arrows)
  useEffect(() => {
    if (!isStoryTourPlaying) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') storyTourRef.current?.next();
      if (e.key === 'ArrowLeft')  storyTourRef.current?.prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isStoryTourPlaying]);

  // AQI-driven fog — re-enable fog only when live AQI data arrives
  useEffect(() => {
    if (!viewerRef.current || !cesiumRef.current || backgroundMode || environment.aqi == null) return;
    const viewer = viewerRef.current;
    const fogDensity = Math.min(0.00012, Math.max(0.00001, Number(environment.aqi) / 900000));
    viewer.scene.fog.enabled = true;
    viewer.scene.fog.density = fogDensity;
    viewer.scene.fog.minimumBrightness = environment.aqi >= 100 ? 0.76 : 0.86;
    viewer.scene.requestRender();
  }, [backgroundMode, environment.aqi]);

  // ---------------------------------------------------------------------------
  // Perspective toggle — switches between Full Reality and Solutions Only.
  // Reads narrativeRole from every entity's PropertyBag; never hard-codes lists.
  // ---------------------------------------------------------------------------
  const setPerspective = (mode) => {
    perspectiveRef.current = mode;
    setPerspectiveState(mode);

    const viewer = viewerRef.current;
    const Cesium = cesiumRef.current;
    if (!viewer || !Cesium || viewer.isDestroyed()) return;

    const isSolutions = mode === 'solutions';

    const applyRole = (entity) => {
      const role = readProp(entity, 'narrativeRole');
      if (!role) return;

      if (role === 'problem') {
        entity.show = !isSolutions;
      } else if (role === 'context') {
        entity.show = true;
        if (entity.polygon) {
          const key = `${entity.id}-polygon`;
          if (isSolutions) {
            // Store original on first de-emphasis; re-use stored value after that
            if (!contextMaterialsRef.current.has(key)) {
              const mat = entity.polygon.material;
              contextMaterialsRef.current.set(
                key,
                mat?.color?.getValue ? mat.color.getValue(EPOCH) : Cesium.Color.WHITE.withAlpha(0.35)
              );
            }
            entity.polygon.material = Cesium.Color.LIGHTGRAY.withAlpha(0.1);
          } else {
            const orig = contextMaterialsRef.current.get(key);
            if (orig) entity.polygon.material = orig;
          }
        }
      } else {
        // solution — always visible
        entity.show = true;
      }
    };

    for (const e of viewer.entities.values) applyRole(e);

    for (let i = 0; i < viewer.dataSources.length; i++) {
      const ds = viewer.dataSources.get(i);
      for (const e of ds.entities.values) applyRole(e);
    }

    // Fly to a neighborhood overview so the cleared map reads as fresh and hopeful
    if (isSolutions) {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(-75.142, 40.016, 1200),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-45),
          roll: 0,
        },
        duration: 1.2,
        easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
      });
    }

    viewer.scene.requestRender();
  };

  // ---------------------------------------------------------------------------
  // Tour / camera handlers
  // ---------------------------------------------------------------------------
  const handleStopTour = () => {
    if (streetTrailRef.current) {
      streetTrailRef.current.stop();
      streetTrailRef.current = null;
    }
    if (storyTourRef.current?.isPlaying()) {
      storyTourRef.current.stopTour();
    }
    if (!tourControllerRef.current) return;
    tourControllerRef.current.stopTour();
    setActiveTourWaypoint(null);
    setActiveTourStat(null);
  };

  const handleStartStoryTour = () => {
    if (!storyTourRef.current) return;
    // Stop any other active tour first
    if (streetTrailRef.current) { streetTrailRef.current.stop(); streetTrailRef.current = null; }
    if (tourControllerRef.current?.isPlaying()) tourControllerRef.current.stopTour();
    storyTourRef.current.startTour();
  };

  const handleStopStoryTour = () => {
    if (storyTourRef.current) storyTourRef.current.stopTour();
  };

  const handleStartTour = async () => {
    if (!viewerRef.current || !cesiumRef.current || !tourControllerRef.current) return;
    const ctrl = viewerRef.current.scene.screenSpaceCameraController;
    ctrl.enableRotate = true;
    ctrl.enableTranslate = true;
    ctrl.enableZoom = true;
    ctrl.enableTilt = true;
    ctrl.enableLook = true;
    await tourControllerRef.current.startTour();
  };

  const handleStartStreetTrail = async () => {
    if (!viewerRef.current || !cesiumRef.current) return;
    if (streetTrailRef.current) {
      streetTrailRef.current.stop();
      streetTrailRef.current = null;
    }
    if (tourControllerRef.current?.isPlaying()) tourControllerRef.current.stopTour();
    setIsTourPlaying(true);
    const viewer = viewerRef.current;
    const Cesium = cesiumRef.current;
    const startRenderLoop = () => {
      const loop = () => {
        if (!viewer || viewer.isDestroyed()) return;
        viewer.scene.requestRender();
        rafLoopRef.current = requestAnimationFrame(loop);
      };
      if (!rafLoopRef.current) rafLoopRef.current = requestAnimationFrame(loop);
    };
    const stopRenderLoop = () => {
      if (rafLoopRef.current) { cancelAnimationFrame(rafLoopRef.current); rafLoopRef.current = null; }
    };
    const trail = await createStreetTrailTour({
      viewer,
      Cesium,
      onAnimationStart: startRenderLoop,
      onAnimationStop: () => { stopRenderLoop(); setIsTourPlaying(false); streetTrailRef.current = null; setTourLocation(null); },
      onSegmentChange: (info) => setTourLocation(info),
      debug: debugMode,
    });
    streetTrailRef.current = trail;
  };

  const handleFreeRoam = () => {
    handleStopTour();
    if (!viewerRef.current) return;
    const ctrl = viewerRef.current.scene.screenSpaceCameraController;
    ctrl.enableRotate = true;
    ctrl.enableTranslate = true;
    ctrl.enableZoom = true;
    ctrl.enableTilt = true;
    ctrl.enableLook = true;
  };

  const handleVisitUserStories = async () => {
    const viewer = viewerRef.current;
    const Cesium = cesiumRef.current;
    if (!viewer || !Cesium || viewer.isDestroyed()) return;

    try {
      // Remove all existing story entities by ID pattern
      const toRemove = viewer.entities.values.filter(
        (e) => typeof e.id === 'string' && e.id.startsWith('story-character-')
      );
      toRemove.forEach((e) => viewer.entities.remove(e));

      // Re-fetch approved stories, if stories is an array than stories = res.json() else stories = []
      let stories = [];
      try {
        const res = await fetch('/api/stories?status=APPROVED');
        stories = await res.json();
        if (!Array.isArray(stories)) stories = [];
      } catch (err) {
        console.warn('[AQO stories] Fetch failed:', err.message);
      }

      const withCoords = stories.filter((s) => s.lat && s.lng);

      // In development also include test stories
      const allStories = process.env.NODE_ENV === 'development'
        ? [...withCoords, ...TEST_STORIES]
        : withCoords;

      if (allStories.length === 0) {
        alert('No approved stories have map locations yet. Ask community members to select a street when submitting their story.');
        return;
      }

      // Place with collision avoidance
      const placedPairs = [];
      for (const story of allStories) {
        const [lat, lng] = resolveCollision(story.lat, story.lng, placedPairs);
        placedPairs.push([lat, lng]);
        const color = story.characterColor || '#FF6B35';
        const visitPos = Cesium.Cartesian3.fromDegrees(lng, lat, 0);
        viewer.entities.add({
          id: `story-character-${story.id}`,
          name: story.personName,
          position: visitPos,
          orientation: Cesium.Transforms.headingPitchRollQuaternion(
            visitPos, new Cesium.HeadingPitchRoll(STORY_HEADING, 0, 0)
          ),
          model: {
            uri: story.modelUri || '/models/characters/CharacterBase.glb',
            scale: CHARACTER_SCALE,
            minimumPixelSize: 64,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            color: Cesium.Color.fromCssColorString(color),
            runAnimations: false,
            silhouetteColor: Cesium.Color.WHITE,
            silhouetteSize: 4,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          description: `
            <div style="padding:12px;max-width:300px;color:#ffffff;font-family:sans-serif;">
              <h3 style="margin:0 0 6px;color:${color};font-size:16px;">${story.personName}</h3>
              ${story.community ? `<p style="margin:0 0 4px;font-size:12px;color:#d1d5db;">${story.community}</p>` : ''}
              ${story.streetName ? `<p style="margin:0 0 8px;font-size:12px;"><strong>Location:</strong> ${story.streetName}</p>` : ''}
              <p style="margin:0;font-size:13px;line-height:1.5;">${story.content || ''}</p>
            </div>
          `,
          properties: new Cesium.PropertyBag({
            narrativeRole: 'user-story',
            storyId: story.id,
            personName: story.personName,
            streetName: story.streetName || '',
            content: story.content || '',
            community: story.community || '',
          }),
        });
      }
      viewer.scene.requestRender();
      console.log(`[AQO stories] Placed ${placedPairs.length} story characters`);

      // Fly to bounding sphere of all placed positions
      const positions = placedPairs.map(([lat, lng]) =>
        Cesium.Cartesian3.fromDegrees(lng, lat, 0)
      );
      if (positions.length === 1) {
        const [lat, lng] = placedPairs[0];
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(lng, lat, 180),
          orientation: { heading: 0, pitch: Cesium.Math.toRadians(-35), roll: 0 },
          duration: 2.0,
        });
      } else {
        const sphere = Cesium.BoundingSphere.fromPoints(positions);
        viewer.camera.flyToBoundingSphere(sphere, {
          duration: 2.0,
          offset: new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-35), Math.max(sphere.radius * 3, 300) + 200),
        });
      }
    } catch (err) {
      console.error('[AQO stories] handleVisitUserStories failed:', err);
      alert('Failed to load story locations. Check the browser console for details.');
    }
  };

  const handleToggleAllStreets = async () => {
    const viewer = viewerRef.current;
    const Cesium = cesiumRef.current;
    if (!viewer || !Cesium || viewer.isDestroyed()) return;

    if (showAllStreets) {
      streetOverlayRef.current.forEach((e) => viewer.entities.remove(e));
      streetOverlayRef.current = [];
      setShowAllStreets(false);
      viewer.scene.requestRender();
      return;
    }

    const res = await fetch('/geojson/nicetown_roads.geojson');
    if (!res.ok) return;
    const geojson = await res.json();

    // Assign a stable color per unique street name using a simple hash
    const palette = [
      '#e63946','#f4a261','#2a9d8f','#457b9d','#e9c46a',
      '#6a4c93','#f77f00','#4cc9f0','#80b918','#ff499e',
      '#7b2d8b','#00b4d8','#d62828','#52b788','#fb8500',
      '#3a86ff','#ffbe0b','#8338ec','#06d6a0','#ef476f',
    ];
    const colorMap = {};
    let colorIdx = 0;
    function streetColor(name) {
      if (!colorMap[name]) { colorMap[name] = palette[colorIdx % palette.length]; colorIdx++; }
      return colorMap[name];
    }

    // Group all coordinates by street name so we can place one label per street
    const streetCoords = {}; // name → [[lon,lat], ...]
    for (const feature of geojson.features) {
      const name = feature.properties?.stname || feature.properties?.STREETNAME || feature.properties?.FULLNAME || 'Unknown';
      streetColor(name); // ensure color assigned in order
      const lines = feature.geometry.type === 'MultiLineString'
        ? feature.geometry.coordinates
        : [feature.geometry.coordinates];
      if (!streetCoords[name]) streetCoords[name] = [];
      lines.forEach((line) => streetCoords[name].push(...line));
    }

    const added = [];

    // Draw polylines
    for (const feature of geojson.features) {
      const name = feature.properties?.stname || feature.properties?.STREETNAME || feature.properties?.FULLNAME || 'Unknown';
      const hex = colorMap[name];
      const color = Cesium.Color.fromCssColorString(hex).withAlpha(0.9);

      const rawCoords = feature.geometry.type === 'MultiLineString'
        ? feature.geometry.coordinates
        : [feature.geometry.coordinates];

      for (const line of rawCoords) {
        const positions = line.map(([lon, lat]) => Cesium.Cartesian3.fromDegrees(lon, lat));
        const e = viewer.entities.add({
          polyline: {
            positions,
            width: 4,
            material: new Cesium.PolylineOutlineMaterialProperty({
              color,
              outlineColor: Cesium.Color.BLACK.withAlpha(0.5),
              outlineWidth: 1,
            }),
            clampToGround: true,
          },
          properties: new Cesium.PropertyBag({ type: 'street-overlay', streetName: name }),
        });
        added.push(e);
      }
    }

    // One label per street, positioned at the median coordinate of all its points
    for (const [name, coords] of Object.entries(streetCoords)) {
      const mid = coords[Math.floor(coords.length / 2)];
      const hex = colorMap[name];
      const color = Cesium.Color.fromCssColorString(hex);
      const e = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(mid[0], mid[1], 25),
        label: {
          text: name,
          font: 'bold 12px sans-serif',
          fillColor: Cesium.Color.WHITE,
          outlineColor: color,
          outlineWidth: 3,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scaleByDistance: new Cesium.NearFarScalar(100, 1.2, 1500, 0.4),
          translucencyByDistance: new Cesium.NearFarScalar(800, 1.0, 2000, 0.0),
        },
        properties: new Cesium.PropertyBag({ type: 'street-label' }),
      });
      added.push(e);
    }

    streetOverlayRef.current = added;
    setShowAllStreets(true);
    viewer.scene.requestRender();
    console.log(`[AQO streets] Drew ${added.length - Object.keys(streetCoords).length} polylines + ${Object.keys(streetCoords).length} labels for ${Object.keys(colorMap).length} unique streets`);
  };

  const handleRecenter = () => {
    if (!viewerRef.current || !cesiumRef.current) return;
    handleStopTour();
    viewerRef.current.camera.flyTo({
      destination: cesiumRef.current.Cartesian3.fromDegrees(initialLon, initialLat, 420),
      orientation: {
        heading: cesiumRef.current.Math.toRadians(-18),
        pitch: cesiumRef.current.Math.toRadians(-28),
        roll: 0,
      },
      duration: 1.6,
      easingFunction: cesiumRef.current.EasingFunction.QUADRATIC_IN_OUT,
    });
  };

  if (error && !backgroundMode) {
    return (
      <div className="aqo-map-shell aqo-map-error">
        <h3>Map failed to load</h3>
        <p>{error}</p>
        <button type="button" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className={`aqo-map-shell${backgroundMode ? ' aqo-map-shell-background' : ''}`}>
      <div className="aqo-map-wrapper">
        <div
          className={`aqo-map-canvas${backgroundMode ? ' aqo-map-canvas-background' : ''}`}
          style={{ height: backgroundMode ? '100vh' : '70vh' }}
        >
          <div ref={containerRef} className="aqo-cesium-container" />
          <ParticleSystem active={showParticles} intensity={environment.pollenLevel} />

          {!backgroundMode && tourLocation && (
            <div style={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(10,10,20,0.82)',
              backdropFilter: 'blur(6px)',
              color: '#fff',
              padding: '10px 22px',
              borderRadius: '10px',
              textAlign: 'center',
              pointerEvents: 'none',
              zIndex: 20,
              minWidth: '220px',
              maxWidth: '340px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: '4px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Stop {tourLocation.segmentIndex + 1} of {tourLocation.total}
                {' · '}
                {tourLocation.phase === 'ORBITING' ? 'Orbiting' : 'En route'}
                {tourLocation.isHighway && (
                  <span style={{ marginLeft: '6px', background: '#dc2626', color: '#fff', borderRadius: '3px', padding: '1px 5px', fontSize: '10px', letterSpacing: '0.04em' }}>
                    HIGHWAY
                  </span>
                )}
              </div>
              <div style={{ fontSize: '17px', fontWeight: 700, lineHeight: 1.2, marginBottom: '3px' }}>
                {tourLocation.waypointName}
              </div>
              {tourLocation.description && (
                <div style={{ fontSize: '12px', opacity: 0.65, marginTop: '4px', lineHeight: 1.4 }}>
                  {tourLocation.description}
                </div>
              )}
            </div>
          )}

          {/* Story slideshow — left/right nav arrows */}
          {!backgroundMode && isStoryTourPlaying && activeStoryInfo && (
            <>
              <button
                type="button"
                onClick={() => storyTourRef.current?.prev()}
                disabled={activeStoryInfo.index === 0}
                aria-label="Previous story"
                style={{
                  position: 'absolute', left: '16px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent', border: 'none',
                  color: '#fff', fontSize: '56px', lineHeight: 1,
                  padding: '12px 18px', cursor: 'pointer',
                  opacity: activeStoryInfo.index === 0 ? 0.15 : 0.45,
                  transition: 'opacity 0.2s',
                  zIndex: 25, pointerEvents: 'auto',
                }}
                onMouseEnter={e => { if (activeStoryInfo.index > 0) e.currentTarget.style.opacity = '0.9'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = activeStoryInfo.index === 0 ? '0.15' : '0.45'; }}
              >‹</button>

              <button
                type="button"
                onClick={() => storyTourRef.current?.next()}
                disabled={activeStoryInfo.index === activeStoryInfo.total - 1}
                aria-label="Next story"
                style={{
                  position: 'absolute', right: '16px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent', border: 'none',
                  color: '#fff', fontSize: '56px', lineHeight: 1,
                  padding: '12px 18px', cursor: 'pointer',
                  opacity: activeStoryInfo.index === activeStoryInfo.total - 1 ? 0.15 : 0.45,
                  transition: 'opacity 0.2s',
                  zIndex: 25, pointerEvents: 'auto',
                }}
                onMouseEnter={e => { if (activeStoryInfo.index < activeStoryInfo.total - 1) e.currentTarget.style.opacity = '0.9'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = activeStoryInfo.index === activeStoryInfo.total - 1 ? '0.15' : '0.45'; }}
              >›</button>
            </>
          )}

          {!backgroundMode && clickCoords && (
            <div className="aqo-coord-inspector">
              <button
                type="button"
                className="aqo-coord-close"
                onClick={() => setClickCoords(null)}
                title="Dismiss"
              >✕</button>
              <div className="aqo-coord-label">Clicked position</div>
              <div className="aqo-coord-row"><span>Lat</span><code>{clickCoords.lat}</code></div>
              <div className="aqo-coord-row"><span>Lng</span><code>{clickCoords.lng}</code></div>
              <div className="aqo-coord-row"><span>Alt (m)</span><code>{clickCoords.alt}</code></div>
              <button
                type="button"
                className="aqo-coord-copy"
                onClick={() => navigator.clipboard.writeText(`lat: ${clickCoords.lat}, lng: ${clickCoords.lng}`)}
              >Copy lat/lng</button>
            </div>
          )}

          {!backgroundMode && isLoaded && (
            <TourControls
              onStartTour={handleStartTour}
              onStopTour={handleStopTour}
              onStartStreetTrail={handleStartStreetTrail}
              isTourPlaying={isTourPlaying}
              onFreeRoam={handleFreeRoam}
              onRecenter={handleRecenter}
              perspective={perspective}
              onPerspectiveToggle={() => setPerspective(perspective === 'full' ? 'solutions' : 'full')}
            />
          )}

          {!backgroundMode && !isLoaded && !error && (
            <div className="aqo-map-loading">
              <div className="aqo-map-spinner" />
              <p>Loading Philadelphia 3D map...</p>
            </div>
          )}
        </div>

        {!backgroundMode && isLoaded && (
          <div className="aqo-map-ui-section">
            <div className="aqo-ui-row aqo-ui-row-data">
              <div className="aqo-map-stats-panel">
                <h2>AQO Neighborhood Impact</h2>
                <div className="aqo-map-stats-grid">
                  {overlayStats.map((stat) => (
                    <article key={stat.id}>
                      <strong style={{ color: stat.color }}>{stat.value}</strong>
                      <span>{stat.label}</span>
                      <small>{stat.description}</small>
                    </article>
                  ))}
                </div>
              </div>
              <EnvironmentOverlay
                aqi={environment.aqi}
                temp={environment.temp}
                pollenLevel={environment.pollenLevel}
                weatherDescription={environment.weatherDescription}
                isLoading={environment.loading}
                error={environment.error}
              />
            </div>

            <div className="aqo-ui-row aqo-ui-row-legend">
              <div className="aqo-map-legend">
                <div><span className="aqo-map-dot aqo-map-dot-pollution" />Pollution sources</div>
                <div><span className="aqo-map-dot aqo-map-dot-solution" />Community solutions</div>
                <div><span className="aqo-map-dot aqo-map-dot-heat" />Heat islands</div>
                <div><span className="aqo-map-dot aqo-map-dot-park" />Nicetown Park</div>
                <div><span className="aqo-map-dot aqo-map-dot-managed" />Admin-managed locations</div>
              </div>
              <button
                type="button"
                onClick={handleVisitUserStories}
                style={{
                  padding: '8px 16px',
                  background: '#FF6B35',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px',
                  whiteSpace: 'nowrap',
                }}
              >
                Visit User Stories
              </button>
              <button
                type="button"
                onClick={isStoryTourPlaying ? handleStopStoryTour : handleStartStoryTour}
                title={isStoryTourPlaying ? 'Stop the story tour' : 'Tour all story characters with auto-orbit and popup at each stop'}
                style={{
                  padding: '8px 14px',
                  background: isStoryTourPlaying ? '#b45309' : '#7c3aed',
                  color: '#fff',
                  border: isStoryTourPlaying ? '2px solid #fbbf24' : '2px solid transparent',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px',
                  whiteSpace: 'nowrap',
                }}
              >
                {isStoryTourPlaying ? 'Stop Story Tour' : 'Story Tour'}
              </button>
              {/* these are and ifs meaning they dont render components them,selvs, they wait for the condition to be true */}
              <button
                type="button"
                onClick={() => setDebugMode((d) => !d)}
                title={debugMode ? 'Debug mode ON — street segments and waypoints will be drawn when the Street Trail Tour starts' : 'Debug mode OFF'}
                style={{
                  padding: '8px 14px',
                  background: debugMode ? '#16a34a' : '#374151',
                  color: '#fff',
                  border: debugMode ? '2px solid #4ade80' : '2px solid transparent',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px',
                  whiteSpace: 'nowrap',
                }}
              >
                {debugMode ? 'Debug ON' : 'Debug OFF'}
              </button>
              <button
                type="button"
                onClick={handleToggleAllStreets}
                title={showAllStreets ? 'Hide street overlay' : 'Show all streets in the GeoJSON as colored polylines'}
                style={{
                  padding: '8px 14px',
                  background: showAllStreets ? '#1d4ed8' : '#374151',
                  color: '#fff',
                  border: showAllStreets ? '2px solid #60a5fa' : '2px solid transparent',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px',
                  whiteSpace: 'nowrap',
                }}
              >
                {showAllStreets ? 'Hide Streets' : 'Show Streets'}
              </button>
            </div>
          </div>
        )}

        {!backgroundMode && activeTourStat && (
          <div className="aqo-tour-stat-popover">
            <strong>{activeTourStat.label}</strong>
            <span>{activeTourStat.description}</span>
            <small>{activeTourStat.comparison}</small>
          </div>
        )}

        {!backgroundMode && isTourPlaying && activeTourWaypoint && (
          <div className="aqo-tour-waypoint">
            <div className="aqo-tour-waypoint-index">
              Tour stop {activeTourWaypoint.id}/{TOUR_WAYPOINTS.length}
            </div>
            <div className="aqo-tour-waypoint-title">{activeTourWaypoint.name}</div>
            <p>{activeTourWaypoint.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CesiumMap;
