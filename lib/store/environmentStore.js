'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const STALE_AFTER_MS = 10 * 60 * 1000;

export const useEnvironmentStore = create(
  persist(
    (set, get) => ({
      aqi: null,
      temp: null,
      pollenLevel: 'low',
      isSummer: false,
      weatherDescription: null,
      lastUpdated: null,
      loading: false,
      error: null,
      async fetchData(lat, lon, options = {}) {
        const { force = false } = options;
        const lastUpdated = get().lastUpdated;

        if (!force && lastUpdated && Date.now() - lastUpdated < STALE_AFTER_MS) {
          return;
        }

        set({ loading: true, error: null });

        try {
          const response = await fetch(`/api/aqi-weather?lat=${lat}&lon=${lon}`, { cache: 'no-store' });
          const payload = await response.json();

          if (!response.ok) {
            throw new Error(payload.error || 'Unable to fetch environment data.');
          }

          set({
            aqi: payload.aqi,
            temp: payload.temperature,
            pollenLevel: payload.pollenLevel,
            isSummer: payload.isSummer,
            weatherDescription: payload.weatherDescription || null,
            lastUpdated: Date.now(),
            loading: false,
            error: null,
          });
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },
    }),
    {
      name: 'environment-data',
      partialize: (state) => ({
        aqi: state.aqi,
        temp: state.temp,
        pollenLevel: state.pollenLevel,
        isSummer: state.isSummer,
        weatherDescription: state.weatherDescription,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);
