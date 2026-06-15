// utils/mapUtils.js

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
    coordinates: { lat: 40.01815, lng: -75.144094 },
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
    coordinates: { lat: 40.018755, lng: -75.156376 },
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