const placeCache = new Map();
const PLACE_TTL_MS = 24 * 60 * 60 * 1000;

function getApiKey() {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
}

export async function getPlaceDetailsByName(name) {
  const cacheKey = name.trim().toLowerCase();
  const cached = placeCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Google Maps API key is not configured.');
  }

  const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
    name
  )}&inputtype=textquery&fields=place_id,name,formatted_address,geometry,photos&key=${apiKey}`;

  const searchResponse = await fetch(searchUrl, { next: { revalidate: 60 * 60 * 24 } });
  const searchPayload = await searchResponse.json();

  if (!searchResponse.ok || searchPayload.status === 'REQUEST_DENIED') {
    throw new Error(searchPayload.error_message || 'Unable to search place details.');
  }

  const candidate = searchPayload.candidates?.[0];
  if (!candidate?.place_id) {
    throw new Error('Place not found.');
  }

  const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${candidate.place_id}&fields=name,formatted_address,geometry,photos,website,url&key=${apiKey}`;
  const detailsResponse = await fetch(detailsUrl, { next: { revalidate: 60 * 60 * 24 } });
  const detailsPayload = await detailsResponse.json();

  if (!detailsResponse.ok || detailsPayload.status !== 'OK' || !detailsPayload.result) {
    throw new Error(detailsPayload.error_message || detailsPayload.status || 'Unable to load place details.');
  }

  const result = detailsPayload.result;
  const value = {
    placeId: candidate.place_id,
    name: result.name,
    formattedAddress: result.formatted_address,
    location: result.geometry?.location || null,
    website: result.website || null,
    mapsUrl: result.url || null,
    photoReference: result.photos?.[0]?.photo_reference || null,
  };

  placeCache.set(cacheKey, { value, expiresAt: Date.now() + PLACE_TTL_MS });
  return value;
}
