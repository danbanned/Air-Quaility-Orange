'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TOUR_WAYPOINTS, createCinematicTour } from './CinematicTour';
import TourControls from './TourControls';
import EnvironmentOverlay from './environment/EnvironmentOverlay';
import ParticleSystem from './environment/ParticleSystem';
import { useEnvironmentData } from '@/lib/hooks/useEnvironmentData';
import { useLocations } from '@/lib/hooks/useLocations';
import {
  COMMUNITY_SOLUTIONS,
  HEAT_ISLAND_ZONES,
  NICETOWN_COORDINATES,
  POLLUTION_SOURCES,
} from '../utils/mapUtils';

const PHILADELPHIA_BOUNDS = {
  west: -75.284,
  east: -74.955,
  south: 39.867,
  north: 40.137,
};

const AQO_STATS = [
  {
    id: 'asthma',
    value: '21%',
    label: 'Childhood Asthma Rate',
    description: '3x national average',
    color: '#FF6B35',
  },
  {
    id: 'cancer',
    value: '41%',
    label: 'Residents In High Cancer Zones',
    description: 'Major racial disparity',
    color: '#FF4444',
  },
  {
    id: 'deaths',
    value: '125',
    label: 'Premature Deaths Per Year',
    description: 'Air pollution related',
    color: '#FF8844',
  },
  {
    id: 'air-grade',
    value: 'F',
    label: 'Air Quality Grade',
    description: 'Philadelphia 2025',
    color: '#FF2222',
  },
  {
    id: 'particulate',
    value: '61%',
    label: 'Higher Particulate Exposure',
    description: 'Black Americans nationally',
    color: '#FF6633',
  },
  {
    id: 'tree-canopy',
    value: '15%',
    label: 'Tree Canopy',
    description: 'Roughly half of wealthier areas',
    color: '#4CAF50',
  },
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
  if (!key) {
    return false;
  }

  const normalized = String(key).trim().toLowerCase();
  if (!normalized) {
    return false;
  }

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
      if (settled) {
        return;
      }
      settled = true;
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise.then(
      (value) => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timeoutId);
        resolve(value);
      },
      (error) => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timeoutId);
        reject(error);
      }
    );
  });
}

function createStatBillboard(stat) {
  if (typeof document === 'undefined') {
    return '';
  }

  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 124;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return '';
  }

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
  if (typeof document === 'undefined') {
    return '';
  }

  const canvas = document.createElement('canvas');
  canvas.width = 380;
  canvas.height = 108;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return '';
  }

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
  initialHeight = 2200,
  backgroundMode = false,
}) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const cesiumRef = useRef(null);
  const tourControllerRef = useRef(null);
  const managedLocationEntityIdsRef = useRef([]);
  const cleanupRef = useRef([]);
  const orbitStateRef = useRef({ active: false, removeTick: null });
  const isRedirectingRef = useRef(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [usingGoogleTiles, setUsingGoogleTiles] = useState(false);
  const [isTourPlaying, setIsTourPlaying] = useState(false);
  const [activeTourWaypoint, setActiveTourWaypoint] = useState(null);
  const [activeTourStat, setActiveTourStat] = useState(null);
  const environment = useEnvironmentData(backgroundMode ? null : initialLat, backgroundMode ? null : initialLon);
  const { locations: managedLocations } = useLocations();

  const overlayStats = useMemo(() => AQO_STATS.slice(0, 4), []);
  const showParticles = !backgroundMode && ((environment.isSummer || (environment.temp ?? 0) >= 28) || environment.pollenLevel === 'high');

  const syncManagedLocations = (viewer, Cesium, locations) => {
    managedLocationEntityIdsRef.current.forEach((entityId) => {
      const entity = viewer.entities.getById(entityId);
      if (entity) {
        viewer.entities.remove(entity);
      }
    });
    managedLocationEntityIdsRef.current = [];

    const reservedNames = new Set([
      ...POLLUTION_SOURCES.map((item) => item.name.toLowerCase()),
      ...COMMUNITY_SOLUTIONS.map((item) => item.name.toLowerCase()),
    ]);

    locations.forEach((location) => {
      if (!location?.name || reservedNames.has(location.name.toLowerCase())) {
        return;
      }

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
          image: createMarkerBillboard({
            name: location.name,
            accent,
            eyebrow,
          }),
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
      });

      managedLocationEntityIdsRef.current.push(entityId);
    });
  };

  useEffect(() => {
    let isMounted = true;

    const registerCleanup = (fn) => {
      cleanupRef.current.push(fn);
    };

    const stopOrbit = (Cesium) => {
      const orbitState = orbitStateRef.current;
      if (orbitState.removeTick) {
        orbitState.removeTick();
      }
      if (viewerRef.current && Cesium && !viewerRef.current.isDestroyed()) {
        viewerRef.current.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
      }
      orbitStateRef.current = { active: false, removeTick: null };
    };

    const startOrbit = (viewer, Cesium, focus, range) => {
      stopOrbit(Cesium);

      const target = Cesium.Cartesian3.fromDegrees(focus.lng, focus.lat, focus.height || 0);
      const orbitState = { angle: Cesium.Math.toRadians(20) };

      const tick = () => {
        if (!viewer || viewer.isDestroyed()) {
          return;
        }
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
        });
      });
    };

    const addNeighborhoodFeatures = (viewer, Cesium) => {
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
          material: Cesium.Color.fromCssColorString('#FF6B35').withAlpha(0.35),
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
            image: createMarkerBillboard({
              name: source.name,
              accent,
              eyebrow: 'Pollution source',
            }),
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
            image: createMarkerBillboard({
              name: location.name,
              accent,
              eyebrow: 'Community solution',
            }),
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
        });
      });
    };

    const initialize = async () => {
      try {
        const Cesium = await withTimeout(loadCesiumRuntime(), 30000, 'Cesium runtime');

        if (!isMounted || !containerRef.current || viewerRef.current) {
          return;
        }

        if (process.env.NEXT_PUBLIC_CESIUM_TOKEN) {
          Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_TOKEN;
        }

        const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        const shouldUseGoogleTiles =
          hasUsableGoogleMapsKey(googleMapsApiKey) && Boolean(Cesium.GoogleMaps);

        if (shouldUseGoogleTiles) {
          Cesium.GoogleMaps.defaultApiKey = googleMapsApiKey;
        }

        cesiumRef.current = Cesium;

        const viewer = new Cesium.Viewer(containerRef.current, {
          baseLayerPicker: false,
          geocoder: false,
          homeButton: !backgroundMode,
          sceneModePicker: false,
          navigationHelpButton: false,
          animation: false,
          timeline: false,
          fullscreenButton: !backgroundMode,
          infoBox: !backgroundMode,
          selectionIndicator: !backgroundMode,
          requestRenderMode: false,
          scene3DOnly: true,
          shadows: true,
        });

        viewerRef.current = viewer;
        viewer.resolutionScale = Math.min(window.devicePixelRatio || 1, 1.5);

        viewer.scene.globe.depthTestAgainstTerrain = false;
        viewer.scene.globe.enableLighting = true;
        viewer.scene.globe.dynamicAtmosphereLighting = true;
        viewer.scene.globe.dynamicAtmosphereLightingFromSun = false;
        viewer.scene.fog.enabled = !backgroundMode;
        viewer.scene.fog.density = backgroundMode ? 0.0 : 0.00003;
        viewer.scene.fog.minimumBrightness = backgroundMode ? 1.0 : 0.84;
        viewer.scene.highDynamicRange = false;
        viewer.scene.skyAtmosphere.show = true;
        viewer.scene.postProcessStages.fxaa.enabled = true;
        viewer.scene.globe.maximumScreenSpaceError = 0.8;

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

        viewer.scene.screenSpaceCameraController.enableCollisionDetection = true;
        viewer.scene.screenSpaceCameraController.minimumZoomDistance = backgroundMode ? 900 : 120;
        viewer.scene.screenSpaceCameraController.maximumZoomDistance = backgroundMode ? 12000 : 18000;
        viewer.scene.screenSpaceCameraController.enableTilt = true;
        viewer.scene.screenSpaceCameraController.enableLook = !backgroundMode;
        viewer.scene.screenSpaceCameraController.enableTranslate = !backgroundMode;
        viewer.scene.screenSpaceCameraController.enableZoom = true;
        viewer.scene.screenSpaceCameraController.enableRotate = true;
        viewer.scene.screenSpaceCameraController.inertiaSpin = 0.9;
        viewer.scene.screenSpaceCameraController.inertiaTranslate = 0.9;
        viewer.scene.screenSpaceCameraController.inertiaZoom = 0.85;

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

        if (isMounted) {
          setIsLoaded(true);
        }

        if (viewer.homeButton) {
          const beforeExecute = (event) => {
            event.cancel = true;
            flyHome(viewer, Cesium, 1.8);
          };
          viewer.homeButton.viewModel.command.beforeExecute.addEventListener(beforeExecute);
          registerCleanup(() => viewer.homeButton.viewModel.command.beforeExecute.removeEventListener(beforeExecute));
        }

        const moveEndHandler = () => {
          if (backgroundMode || isRedirectingRef.current) {
            return;
          }

          const cartographic = viewer.camera.positionCartographic;
          const lon = Cesium.Math.toDegrees(cartographic.longitude);
          const lat = Cesium.Math.toDegrees(cartographic.latitude);

          const isOutOfBounds =
            lon < PHILADELPHIA_BOUNDS.west ||
            lon > PHILADELPHIA_BOUNDS.east ||
            lat < PHILADELPHIA_BOUNDS.south ||
            lat > PHILADELPHIA_BOUNDS.north;

          if (!isOutOfBounds) {
            return;
          }

          isRedirectingRef.current = true;
          const safeLon = clamp(lon, PHILADELPHIA_BOUNDS.west + 0.01, PHILADELPHIA_BOUNDS.east - 0.01);
          const safeLat = clamp(lat, PHILADELPHIA_BOUNDS.south + 0.01, PHILADELPHIA_BOUNDS.north - 0.01);

          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
              safeLon,
              safeLat,
              clamp(cartographic.height, 900, 6000)
            ),
            orientation: {
              heading: viewer.camera.heading,
              pitch: clamp(viewer.camera.pitch, Cesium.Math.toRadians(-75), Cesium.Math.toRadians(-15)),
              roll: 0,
            },
            duration: 0.8,
            easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
            complete: () => {
              isRedirectingRef.current = false;
            },
            cancel: () => {
              isRedirectingRef.current = false;
            },
          });
        };

        viewer.camera.moveEnd.addEventListener(moveEndHandler);
        registerCleanup(() => viewer.camera.moveEnd.removeEventListener(moveEndHandler));

        try {
          const terrainProvider = await withTimeout(
            Cesium.createWorldTerrainAsync({
              requestVertexNormals: true,
              requestWaterMask: true,
            }),
            8000,
            'World terrain'
          );
          if (!viewer.isDestroyed()) {
            viewer.terrainProvider = terrainProvider;
          }
        } catch (terrainError) {
          console.warn('World terrain unavailable. Continuing without terrain.', terrainError);
        }

        try {
          if (shouldUseGoogleTiles) {
            const tileset = await withTimeout(
              Cesium.createGooglePhotorealistic3DTileset({
                onlyUsingWithGoogleGeocoder: true,
              }),
              10000,
              'Google Photorealistic 3D Tiles'
            );
            viewer.scene.primitives.add(tileset);
            setUsingGoogleTiles(true);
          } else {
            throw new Error('Google Maps API key is missing or still using a placeholder value.');
          }
        } catch (tilesError) {
          const osmTileset = await Cesium.createOsmBuildingsAsync();
          viewer.scene.primitives.add(osmTileset);
          console.warn('Google Photorealistic 3D Tiles unavailable. Falling back to OSM buildings.', tilesError);
        }

        if (!backgroundMode) {
          addNeighborhoodFeatures(viewer, Cesium);
          addStatsEntities(viewer, Cesium);
          syncManagedLocations(viewer, Cesium, managedLocations);
          tourControllerRef.current = createCinematicTour({
            viewer,
            Cesium,
            onWaypointChange: setActiveTourWaypoint,
            onStatsChange: setActiveTourStat,
            onPlayingChange: setIsTourPlaying,
          });

          const clickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
          clickHandler.setInputAction((movement) => {
            const picked = viewer.scene.pick(movement.position);
            if (Cesium.defined(picked) && picked.id) {
              viewer.selectedEntity = picked.id;
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
        if (isMounted) {
          setError(loadError.message || 'Failed to initialize map');
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;

      cleanupRef.current.forEach((fn) => {
        try {
          fn();
        } catch (cleanupError) {
          console.warn('Cleanup error:', cleanupError);
        }
      });
      cleanupRef.current = [];

      if (tourControllerRef.current) {
        tourControllerRef.current.stopTour();
      }
      tourControllerRef.current = null;

      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        try {
          stopOrbit(cesiumRef.current || window.Cesium);
        } catch (orbitError) {
          console.warn('Orbit cleanup error:', orbitError);
        }
        viewerRef.current.destroy();
      }
      viewerRef.current = null;
      cesiumRef.current = null;
      managedLocationEntityIdsRef.current = [];
    };
  }, [backgroundMode, initialHeight, initialLat, initialLon]);

  useEffect(() => {
    if (!viewerRef.current || !cesiumRef.current || backgroundMode) {
      return;
    }

    syncManagedLocations(viewerRef.current, cesiumRef.current, managedLocations);
  }, [backgroundMode, managedLocations]);

  useEffect(() => {
    if (!viewerRef.current || !cesiumRef.current || backgroundMode || environment.aqi == null) {
      return;
    }

    const viewer = viewerRef.current;
    const fogDensity = Math.min(0.00012, Math.max(0.00001, Number(environment.aqi) / 900000));
    viewer.scene.fog.enabled = true;
    viewer.scene.fog.density = fogDensity;
    viewer.scene.fog.minimumBrightness = environment.aqi >= 100 ? 0.76 : 0.86;
  }, [backgroundMode, environment.aqi]);

  const handleStopTour = () => {
    if (!tourControllerRef.current) {
      return;
    }
    tourControllerRef.current.stopTour();
    setActiveTourWaypoint(null);
    setActiveTourStat(null);
  };

  const handleStartTour = async () => {
    if (!viewerRef.current || !cesiumRef.current || !tourControllerRef.current) {
      return;
    }

    const viewer = viewerRef.current;
    viewer.scene.screenSpaceCameraController.enableRotate = true;
    viewer.scene.screenSpaceCameraController.enableTranslate = true;
    viewer.scene.screenSpaceCameraController.enableZoom = true;
    viewer.scene.screenSpaceCameraController.enableTilt = true;
    viewer.scene.screenSpaceCameraController.enableLook = true;

    await tourControllerRef.current.startTour();
  };

  const handleFreeRoam = () => {
    handleStopTour();
    if (!viewerRef.current) {
      return;
    }

    const controller = viewerRef.current.scene.screenSpaceCameraController;
    controller.enableRotate = true;
    controller.enableTranslate = true;
    controller.enableZoom = true;
    controller.enableTilt = true;
    controller.enableLook = true;
  };

  const handleRecenter = () => {
    if (!viewerRef.current || !cesiumRef.current) {
      return;
    }

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
        <button type="button" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`aqo-map-shell${backgroundMode ? ' aqo-map-shell-background' : ''}`}>
      <div ref={containerRef} className="aqo-cesium-container" />
      <ParticleSystem active={showParticles} intensity={environment.pollenLevel} />

      {!backgroundMode && (
        <>
          <div className="aqo-map-topbar">
            <div>
              <h1>AQO Environmental Justice Tour</h1>
              <p>Nicetown and Hunting Park with guided stops, free roam, and Philly-only performance bounds.</p>
            </div>
            <div className="aqo-map-badges">
              <span>{usingGoogleTiles ? 'Google Photorealistic 3D' : 'OSM Building Fallback'}</span>
              <span>Free roam + cinematic tour</span>
            </div>
          </div>

          {isLoaded && (
            <TourControls
              onStartTour={handleStartTour}
              onStopTour={handleStopTour}
              isTourPlaying={isTourPlaying}
              onFreeRoam={handleFreeRoam}
              onRecenter={handleRecenter}
            />
          )}

          {activeTourStat && (
            <div className="aqo-tour-stat-popover">
              <strong>{activeTourStat.label}</strong>
              <span>{activeTourStat.description}</span>
              <small>{activeTourStat.comparison}</small>
            </div>
          )}

          {isTourPlaying && activeTourWaypoint && (
            <div className="aqo-tour-waypoint">
              <div className="aqo-tour-waypoint-index">
                Tour stop {activeTourWaypoint.id}/{TOUR_WAYPOINTS.length}
              </div>
              <div className="aqo-tour-waypoint-title">{activeTourWaypoint.name}</div>
              <p>{activeTourWaypoint.description}</p>
            </div>
          )}

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

          <div className="aqo-map-legend">
            <div><span className="aqo-map-dot aqo-map-dot-pollution" /> Pollution sources</div>
            <div><span className="aqo-map-dot aqo-map-dot-solution" /> Community solutions</div>
            <div><span className="aqo-map-dot aqo-map-dot-heat" /> Heat islands</div>
            <div><span className="aqo-map-dot aqo-map-dot-park" /> Nicetown Park</div>
            <div><span className="aqo-map-dot aqo-map-dot-managed" /> Admin-managed locations</div>
          </div>

          {!isLoaded && !error && (
            <div className="aqo-map-loading">
              <div className="aqo-map-spinner" />
              <p>Loading Philadelphia 3D map...</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CesiumMap;
