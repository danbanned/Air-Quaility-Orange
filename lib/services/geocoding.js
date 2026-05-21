const geocodeCache = new Map();
const GEOCODE_TTL_MS = 24 * 60 * 60 * 1000;

function getGoogleMapsApiKey() {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
}

function buildCacheKey(address) {
  return address.trim().toLowerCase();
}

export async function geocodeAddress(address) {
  const key = buildCacheKey(address);
  const cached = geocodeCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    throw new Error('Google Maps API key is not configured.');
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
  const response = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });
  const payload = await response.json();

  if (!response.ok || payload.status !== 'OK' || !payload.results?.length) {
    throw new Error(payload.error_message || payload.status || 'Unable to geocode address.');
  }

  const match = payload.results[0];
  const value = {
    lat: match.geometry.location.lat,
    lng: match.geometry.location.lng,
    formattedAddress: match.formatted_address,
    placeId: match.place_id,
  };

  geocodeCache.set(key, { value, expiresAt: Date.now() + GEOCODE_TTL_MS });
  return value;
}
