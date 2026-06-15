'use client';

import {
  COMMUNITY_SOLUTIONS,
  HEAT_ISLAND_ZONES,
  NICETOWN_COORDINATES,
  POLLUTION_SOURCES,
} from '../utils/mapUtils';

const ROOSEVELT_EXTENSION = POLLUTION_SOURCES.find((item) => item.id === 1);
const MIDVALE_PLANT = POLLUTION_SOURCES.find((item) => item.id === 2);
const WAYNE_JUNCTION = POLLUTION_SOURCES.find((item) => item.id === 3);
const FURTICK_FARMS = COMMUNITY_SOLUTIONS.find((item) => item.id === 1);
const HUNTING_PARK_GARDEN = COMMUNITY_SOLUTIONS.find((item) => item.id === 2);
const CSI_STORMWATER = COMMUNITY_SOLUTIONS.find((item) => item.id === 4);
const HUNTING_PARK_HEAT_ZONE = HEAT_ISLAND_ZONES.find((item) => item.id === 1);

export const TOUR_WAYPOINTS = [
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
    location: { lat: 40.024338, lon: -75.163767, height: 5 },
    orientation: { heading: 28, pitch: -18, roll: 0 },
    duration: 7.2,
    stat: { label: '21%', description: 'Childhood Asthma Rate', comparison: '3x national average' },
    highlight: { lon: -75.15455, lat: 40.0207 },
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

function flyCamera(viewer, Cesium, waypoint) {
  return new Promise((resolve) => {
    let finished = false;
    const done = () => {
      if (finished) {
        return;
      }
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

export function createCinematicTour({
  viewer,
  Cesium,
  onWaypointChange,
  onStatsChange,
  onPlayingChange,
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
    }
    if (activeOverlay && !viewer.isDestroyed()) {
      viewer.entities.remove(activeOverlay);
      activeOverlay = null;
    }
  };

  const stopTour = () => {
    playing = false;
    runToken += 1;
    clearPending();
    clearVisuals();
    viewer.camera.cancelFlight();
    viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    onWaypointChange(null);
    onStatsChange(null);
    onPlayingChange(false);
  };

  const runWaypoint = async (index) => {
    const token = runToken;
    if (!playing || viewer.isDestroyed()) {
      return;
    }

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
    }

    await flyCamera(viewer, Cesium, waypoint);

    if (!playing || token !== runToken) {
      return;
    }

    pendingTimeout = window.setTimeout(() => {
      runWaypoint(index + 1);
    }, 2400);
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
