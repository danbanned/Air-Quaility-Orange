// utils/mapUtils.js

// Nicetown Park coordinates
export const NICETOWN_COORDINATES = {
  lat: 40.01999,
  lng: -75.15540
};

// Pollution sources
export const POLLUTION_SOURCES = [
  {
    id: 1,
    name: 'Roosevelt Extension Roadway',
    coordinates: { lat: 40.02345, lng: -75.15234 },
    description: 'Major roadway contributing to air pollution',
    type: 'transportation'
  },
  {
    id: 2,
    name: 'SEPTA Midvale Natural Gas Plant',
    coordinates: { lat: 40.01678, lng: -75.15890 },
    description: 'Natural gas facility impacting local air quality',
    type: 'industrial'
  },
  {
    id: 3,
    name: 'Wayne Junction Rail Station',
    coordinates: { lat: 40.02123, lng: -75.14876 },
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
    coordinates: { lat: 40.02234, lng: -75.15123 },
    description: 'Community farm providing fresh food',
    type: 'garden'
  },
  {
    id: 2,
    name: 'Hunting Park Community Garden',
    coordinates: { lat: 40.01876, lng: -75.15789 },
    description: 'Urban garden and community space',
    type: 'garden'
  },
  {
    id: 3,
    name: 'Tree Planting Site - Diamond Street',
    coordinates: { lat: 40.02045, lng: -75.14987 },
    description: 'New trees being planted to improve canopy',
    type: 'greenspace'
  },
  {
    id: 4,
    name: 'GSI Stormwater Project',
    coordinates: { lat: 40.01912, lng: -75.15567 },
    description: 'Green stormwater infrastructure project',
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

export const calculateHeatIntensity = (location) => {
  // Simple heat intensity calculation based on tree canopy and development
  const treeCanopy = 0.15; // 15% tree canopy in Hunting Park
  const imperviousSurface = 0.65; // 65% impervious surface
  return (imperviousSurface - treeCanopy) * 100;
};