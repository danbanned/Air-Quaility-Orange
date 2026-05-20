'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
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

  const Cesium = await import('cesium');
  return Cesium;
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
  initialHeight = 1500,
  backgroundMode = false,
}) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const cleanupRef = useRef([]);
  const orbitStateRef = useRef({ active: false, removeTick: null });
  const isRedirectingRef = useRef(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [usingGoogleTiles, setUsingGoogleTiles] = useState(false);

  const overlayStats = useMemo(() => AQO_STATS.slice(0, 4), []);

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

    const flyHome = (viewer, Cesium, duration = 2.4) => {
      stopOrbit(Cesium);
      viewer.camera.cancelFlight();
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(initialLon, initialLat, initialHeight),
        orientation: {
          heading: Cesium.Math.toRadians(-18),
          pitch: Cesium.Math.toRadians(-35),
          roll: 0,
        },
        duration,
        easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
        complete: () => {
          if (!backgroundMode) {
            startOrbit(viewer, Cesium, { lng: initialLon, lat: initialLat }, initialHeight * 1.15);
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
        const Cesium = await withTimeout(loadCesiumRuntime(), 10000, 'Cesium runtime');

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

        viewer.scene.globe.depthTestAgainstTerrain = false;
        viewer.scene.globe.enableLighting = true;
        viewer.scene.globe.dynamicAtmosphereLighting = true;
        viewer.scene.globe.dynamicAtmosphereLightingFromSun = false;
        viewer.scene.fog.enabled = true;
        viewer.scene.fog.density = backgroundMode ? 0.00015 : 0.00022;
        viewer.scene.fog.minimumBrightness = backgroundMode ? 0.35 : 0.18;
        viewer.scene.highDynamicRange = true;
        viewer.scene.skyAtmosphere.show = true;
        viewer.scene.postProcessStages.fxaa.enabled = true;

        if (viewer.scene.postProcessStages.bloom) {
          viewer.scene.postProcessStages.bloom.enabled = true;
          viewer.scene.postProcessStages.bloom.uniforms.glowOnly = false;
          viewer.scene.postProcessStages.bloom.uniforms.delta = 0.8;
          viewer.scene.postProcessStages.bloom.uniforms.sigma = 2.4;
          viewer.scene.postProcessStages.bloom.uniforms.stepSize = 3.0;
        }

        if (viewer.scene.postProcessStages.ambientOcclusion) {
          viewer.scene.postProcessStages.ambientOcclusion.enabled = !backgroundMode;
          viewer.scene.postProcessStages.ambientOcclusion.uniforms.intensity = 3.0;
          viewer.scene.postProcessStages.ambientOcclusion.uniforms.bias = 0.15;
          viewer.scene.postProcessStages.ambientOcclusion.uniforms.lengthCap = 0.45;
        }

        viewer.scene.screenSpaceCameraController.enableCollisionDetection = true;
        viewer.scene.screenSpaceCameraController.minimumZoomDistance = backgroundMode ? 900 : 120;
        viewer.scene.screenSpaceCameraController.maximumZoomDistance = backgroundMode ? 12000 : 18000;
        viewer.scene.screenSpaceCameraController.enableTilt = true;
        viewer.scene.screenSpaceCameraController.enableLook = !backgroundMode;
        viewer.scene.screenSpaceCameraController.enableTranslate = !backgroundMode;
        viewer.scene.screenSpaceCameraController.enableZoom = true;
        viewer.scene.screenSpaceCameraController.inertiaSpin = 0.9;
        viewer.scene.screenSpaceCameraController.inertiaTranslate = 0.9;
        viewer.scene.screenSpaceCameraController.inertiaZoom = 0.85;

        viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(initialLon, initialLat, initialHeight),
          orientation: {
            heading: Cesium.Math.toRadians(-18),
            pitch: Cesium.Math.toRadians(-35),
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

          const clickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
          clickHandler.setInputAction((movement) => {
            const picked = viewer.scene.pick(movement.position);
            if (Cesium.defined(picked) && picked.id) {
              viewer.selectedEntity = picked.id;
            }
          }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
          registerCleanup(() => clickHandler.destroy());
        }

        flyHome(viewer, Cesium, backgroundMode ? 0 : 2.6);
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

      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        try {
          stopOrbit(window.Cesium);
        } catch (orbitError) {
          console.warn('Orbit cleanup error:', orbitError);
        }
        viewerRef.current.destroy();
      }
      viewerRef.current = null;
    };
  }, [backgroundMode, initialHeight, initialLat, initialLon]);

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

      {!backgroundMode && (
        <>
          <div className="aqo-map-topbar">
            <div>
              <h1>Nicetown, Philadelphia</h1>
              <p>Environmental justice map focused on one neighborhood, not the whole globe.</p>
            </div>
            <div className="aqo-map-badges">
              <span>{usingGoogleTiles ? 'Google Photorealistic 3D' : 'OSM Building Fallback'}</span>
              <span>Philly-only camera bounds</span>
            </div>
          </div>

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

          <div className="aqo-map-legend">
            <div><span className="aqo-map-dot aqo-map-dot-pollution" /> Pollution sources</div>
            <div><span className="aqo-map-dot aqo-map-dot-solution" /> Community solutions</div>
            <div><span className="aqo-map-dot aqo-map-dot-heat" /> Heat islands</div>
            <div><span className="aqo-map-dot aqo-map-dot-park" /> Nicetown Park</div>
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
