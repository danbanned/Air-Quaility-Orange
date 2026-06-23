import { POLLUTION_SOURCES, COMMUNITY_SOLUTIONS, HEAT_ISLAND_ZONES } from './mapUtils';

function flattenCoords(feature) {
  const coords = feature.geometry?.coordinates;
  if (!coords) return [];
  if (feature.geometry.type === 'MultiLineString') {
    return coords.flat(1);
  }
  return coords;
}

function distanceSq(lat, lng, coord) {
  const dlat = lat - coord[1];
  const dlng = lng - coord[0];
  return dlat * dlat + dlng * dlng;
}

function findNearestStreet(features, lat, lng) {
  let nearest = null;
  let minDist = Infinity;

  for (const feature of features) {
    const points = flattenCoords(feature);
    for (const coord of points) {
      const d = distanceSq(lat, lng, coord);
      if (d < minDist) {
        minDist = d;
        nearest = feature;
      }
    }
  }

  if (!nearest) return null;
  return {
    name: nearest.properties?.stname || nearest.properties?.STREETNAME || nearest.properties?.FULLNAME || 'Unknown St',
    coordinates: flattenCoords(nearest),
  };
}

export function mapWaypointsToStreets(geojsonData) {
  if (!geojsonData?.features?.length) return [];

  const waypoints = [
    ...POLLUTION_SOURCES.map((s) => ({ name: s.name, lat: s.coordinates.lat, lng: s.coordinates.lng })),
    ...COMMUNITY_SOLUTIONS.map((s) => ({ name: s.name, lat: s.coordinates.lat, lng: s.coordinates.lng })),
    ...HEAT_ISLAND_ZONES.map((z) => ({ name: z.name, lat: z.coordinates.lat, lng: z.coordinates.lng })),
  ];

  return waypoints
    .map((wp) => {
      const street = findNearestStreet(geojsonData.features, wp.lat, wp.lng);
      if (!street) return null;
      return {
        waypointName: wp.name,
        waypointCoords: { lat: wp.lat, lng: wp.lng },
        streetName: street.name,
        coordinates: street.coordinates,
      };
    })
    .filter(Boolean);
}

export function buildOrderedTrailCoords(mappedStreets) {
  const all = [];
  for (const { coordinates } of mappedStreets) {
    for (const [lng, lat] of coordinates) {
      all.push({ lat, lng });
    }
  }
  return all;
}
