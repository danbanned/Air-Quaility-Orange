'use client';

import { useCallback } from 'react';

export function usePlaceDetails() {
  const getPlace = useCallback(async (name) => {
    const response = await fetch(`/api/place-details?name=${encodeURIComponent(name)}`, { cache: 'no-store' });
    const payload = await response.json();
    if (!response.ok || payload.error) {
      throw new Error(payload.error || 'Unable to fetch place details.');
    }
    return payload;
  }, []);

  return { getPlace };
}
