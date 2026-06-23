// utils/mapUtils.js

// Uniform scale for all human character models.
// Change this one constant to resize every character on the map + in all tours.
export const CHARACTER_SCALE = 1.5;

// PORTRAIT_HEADING — the world direction we want story characters to face (south = Math.PI).
export const PORTRAIT_HEADING = Math.PI;

// GLB_FORWARD_HEADING — correction for CharacterBase.glb's actual authored forward.
// glTF -Z → north at heading=0 is the assumed default; if the face is diagonal, tune here.
// Try:  Math.PI / 4 (45° more clockwise)
//       Math.PI / 2 (90°) if that overshoots
//       negate the value if it rotates the wrong way
export const GLB_FORWARD_HEADING = Math.PI / 4;

// STORY_HEADING — single value consumed by both CesiumMap (model orientation)
// and CinematicTour (camera placement).  Change GLB_FORWARD_HEADING to dial the portrait.
export const STORY_HEADING = PORTRAIT_HEADING + GLB_FORWARD_HEADING;

// Nicetown Park coordinates
export const NICETOWN_COORDINATES = {
  lat: 40.011575,
  lng: -75.152031,
  alt: 10000
};

// Pollution sources
export const POLLUTION_SOURCES = [
  {
    id: 1,
    name: 'Roosevelt Extension Roadway',
    coordinates: { lat: 40.020608, lng: -75.1555 },
    description: 'Major roadway contributing to air pollution',
    type: 'transportation'
  },
  {
    id: 2,
    name: 'SEPTA Midvale Natural Gas Plant',
    coordinates: { lat: 40.01334591915903, lng: -75.1685843256967 },
    description: 'Natural gas facility impacting local air quality',
    type: 'industrial'
  },
  {
    id: 3,
    name: 'Wayne Junction Rail Station',
    coordinates: { lat: 40.022707, lng: -75.159773 },
    description: 'Rail hub with diesel emissions',
    type: 'transportation'
  },
  {
    id: 4,
    name: 'Former PES Refinery Site',
    coordinates: { lat: 40.01789, lng: -75.16234 },
    description: 'Former petroleum refinery, ongoing environmental concerns',
    type: 'industrial'
  }
];

// Community solutions
export const COMMUNITY_SOLUTIONS = [
  {
    id: 1,
    name: 'Furtick Farms',
    coordinates: { lat: 40.01894, lng: -75.156786 },
    description: 'Community farm providing fresh food',
    type: 'garden'
  },
  {
    id: 2,
    name: 'Hunting Park Community Garden',
    coordinates: { lat: 40.01815, lng: -75.144094 },
    description: 'Urban garden and community space',
    type: 'garden'
  },
  {
    id: 3,
    name: 'Tree Planting Site - Diamond Street',
    coordinates: { lat: 40.018857, lng: -75.156727 },
    description: 'New trees being planted to improve canopy',
    type: 'greenspace'
  },
  {
    id: 4,
    name: 'CSI Stormwater Project',
    coordinates: { lat: 40.020623, lng: -75.157938 },
    description: 'Green stormwater infrastructure installation',
    type: 'infrastructure'
  }
];

// Heat island zones
export const HEAT_ISLAND_ZONES = [
  {
    id: 1,
    name: 'Hunting Park High Heat Zone',
    coordinates: { lat: 40.01888, lng: -75.15666 },
    radius: 500,
    intensity: 'high'
  },
  {
    id: 2,
    name: 'Nicetown Moderate Heat Zone',
    coordinates: { lat: 40.02045, lng: -75.15333 },
    radius: 400,
    intensity: 'moderate'
  }
];

//street tour stops
export const STREET_TOUR_STOPS = [
  {
    id: 1,
    name: 'GERMANTOWN AVE',
    coordinates: { lat: 40.015894, lng: -75.153851 },
    description: 'Community farm providing fresh food'
  },
  {
    id: 2,
    name: 'W CAYUGA ST',
    coordinates: { lat: 40.016824, lng: -75.147193 },
    description: 'Urban garden and community space'
  },
  {
    id: 3,
    name: 'N BROAD ST',
    coordinates: { lat: 40.018071, lng: -75.149338 },
    description: 'New trees being planted to improve canopy'
  },
  {
    id: 4,
    name: 'BLABON ST',
    coordinates: { lat: 0, lng: 0},
    description: 'Green stormwater infrastructure installation'
  },
  {
    id: 5,
    name: 'Roosevelt BLVD RAMP C',
    coordinates: { lat: 40.019267, lng: -75.163737 },
    description: 'THE HIGHWAY — starting point for the tour, with heavy traffic and pollution'
  }
];

export const getMapOptions = (mapType = 'roadmap') => {
  return {
    center: NICETOWN_COORDINATES,
    zoom: 14,
    mapTypeId: mapType,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  };
};

// Characters – coordinates now aligned with their matching locations
export const CHARACTERS = [
  {
    uri: '/models/characters/CharacterBase.glb',
    lat: 40.01894,          // Furtick Farms
    lon: -75.156786,
    scale: 1,
    name: 'Community Farmer',
    role: 'Farmer at Furtick Farms, growing fresh food for the neighborhood.',
  },
  {
    uri: '/models/characters/CharacterBase.glb',
    lat: 40.018857,         // Tree Planting Site – Diamond Street
    lon: -75.156727,
    scale: 1,
    name: 'Youth Organizer',
    role: 'Youth organizer at the Diamond Street tree-planting site.',
  },
  {
    uri: '/models/characters/CharacterBase.glb',
    lat: 40.011575,         // Nicetown Park (starting point)
    lon: -75.152031,
    scale: 1,
    name: 'Block Captain',
    role: 'Block captain at Nicetown Park.',
  },
  {
    uri: '/models/characters/CharacterBase.glb',
    lat: 40.020623,         // CSI Stormwater Project
    lon: -75.157938,
    scale: 1,
    name: 'Resident',
    role: 'Resident near the green stormwater infrastructure project.',
  },
  {
    uri: '/models/characters/CharacterBase.glb',
    lat: 40.01815,          // Hunting Park Community Garden
    lon: -75.144094,
    scale: 1,
    name: 'Garden Volunteer',
    role: 'Volunteer at Hunting Park Community Garden.',
  },
  {
    uri: '/models/characters/CharacterBase.glb',
    lat: 40.01888,          // Hunting Park Heat Island (center)
    lon: -75.15666,
    scale: 1,
    name: 'Community Member',
    role: 'Community member in the Hunting Park area.',
  },
];

export const VEHICLES = [
  {
    uri: '/models/veichles/Vehicle.glb',
    lat: 40.020608,
    lon: -75.1555,
    scale: 10,
    name: 'Traffic — Roosevelt Extension',
    narrativeRole: 'problem',
    description: 'Heavy vehicle traffic contributing to local air pollution.',
  },
  {
    uri: '/models/veichles/TaxiVehicle.glb',
    lat: 40.022707,
    lon: -75.159773,
    scale: 10,
    name: 'Traffic — Wayne Junction',
    narrativeRole: 'problem',
    description: 'Vehicle traffic near Wayne Junction rail yard.',
  },
  {
    uri: '/models/veichles/OrangeVehicle.glb',
    lat: 40.019045,
    lon: -75.155679,
    scale: 5,
    name: 'AQO Community Vehicle',
    narrativeRole: 'solution',
    solutionStatus: 'active',
    description: 'Air Quality Orange community outreach vehicle.',
  },
];

export const calculateHeatIntensity = (location) => {
  const treeCanopy = 0.15;
  const imperviousSurface = 0.65;
  return (imperviousSurface - treeCanopy) * 100;
};