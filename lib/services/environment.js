const environmentCache = new Map();
const ENVIRONMENT_TTL_MS = 15 * 60 * 1000;

function getCacheKey(lat, lng) {
  return `${Number(lat).toFixed(4)},${Number(lng).toFixed(4)}`;
}

async function fetchAirQuality(lat, lng, apiKey) {
  const url = 'https://airquality.googleapis.com/v1/currentConditions:lookup?key=' + encodeURIComponent(apiKey);
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: { latitude: Number(lat), longitude: Number(lng) },
      universalAqi: true,
      extraComputations: ['HEALTH_RECOMMENDATIONS', 'POLLUTANT_CONCENTRATION', 'LOCAL_AQI'],
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error?.message || 'Unable to load air quality.');
  }

  return payload;
}

async function fetchWeather(lat, lng) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('Google Maps API key is not configured.');
  }

  const url = new URL('https://weather.googleapis.com/v1/currentConditions:lookup');
  url.searchParams.set('key', apiKey);
  url.searchParams.set('location.latitude', String(lat));
  url.searchParams.set('location.longitude', String(lng));
  url.searchParams.set('unitsSystem', 'METRIC');

  const response = await fetch(url.toString(), { next: { revalidate: 60 * 15 } });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error?.message || payload.message || 'Unable to load weather.');
  }

  return payload;
}

function derivePollenLevel(aqi, temp) {
  if (aqi >= 100 || temp >= 30) return 'high';
  if (aqi >= 60 || temp >= 24) return 'medium';
  return 'low';
}

export async function getEnvironmentSnapshot(lat = 40.01999, lng = -75.1554) {
  const cacheKey = getCacheKey(lat, lng);
  const cached = environmentCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const now = new Date();
  const month = now.getMonth();
  const isSummer = month >= 4 && month <= 8;

  let aqi = 75;
  let temperature = 24;
  let weatherDescription = 'Unavailable';
  let recommendations = null;

  if (googleApiKey) {
    try {
      const airQuality = await fetchAirQuality(lat, lng, googleApiKey);
      aqi = airQuality.indexes?.[0]?.aqi || airQuality.indexes?.[0]?.aqiDisplay || aqi;
      recommendations = airQuality.healthRecommendations || null;
    } catch (error) {
      console.warn('Air quality fetch failed, using fallback AQI.', error);
    }
  }

  try {
    const weather = await fetchWeather(lat, lng);
    temperature =
      weather.temperature?.value ??
      weather.feelsLikeTemperature?.value ??
      temperature;
    weatherDescription =
      weather.weatherCondition?.description?.text ||
      weather.weatherCondition?.description?.localizedText?.text ||
      weatherDescription;
  } catch (error) {
    console.warn('Weather fetch failed, using fallback temperature.', error);
  }

  const pollenLevel = derivePollenLevel(Number(aqi), Number(temperature));
  const value = {
    aqi: Number(aqi),
    temperature: Number(temperature),
    pollenLevel,
    isSummer,
    weatherDescription,
    recommendations,
    fetchedAt: new Date().toISOString(),
  };

  environmentCache.set(cacheKey, { value, expiresAt: Date.now() + ENVIRONMENT_TTL_MS });
  return value;
}
