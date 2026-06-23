'use client';

import { useEffect } from 'react';
import { useEnvironmentStore } from '../../lib/store/environmentStore';

export function useEnvironmentData(lat, lng) {
  const aqi = useEnvironmentStore((state) => state.aqi);
  const temp = useEnvironmentStore((state) => state.temp);
  const pollenLevel = useEnvironmentStore((state) => state.pollenLevel);
  const isSummer = useEnvironmentStore((state) => state.isSummer);
  const weatherDescription = useEnvironmentStore((state) => state.weatherDescription);
  const loading = useEnvironmentStore((state) => state.loading);
  const error = useEnvironmentStore((state) => state.error);
  const fetchData = useEnvironmentStore((state) => state.fetchData);

  useEffect(() => {
    if (lat == null || lng == null) {
      return;
    }

    fetchData(lat, lng);
    const intervalId = window.setInterval(() => {
      fetchData(lat, lng, { force: true });
    }, 15 * 60 * 1000);

    return () => window.clearInterval(intervalId);
  }, [fetchData, lat, lng]);

  return { aqi, temp, pollenLevel, isSummer, weatherDescription, loading, error, fetchData };
}
