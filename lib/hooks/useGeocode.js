'use client';

import { useCallback } from 'react';

export function useGeocode() {
  const geocode = useCallback(async (address) => {
    const response = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`, { cache: 'no-store' });
    const payload = await response.json();
    if (!response.ok || payload.error) {
      throw new Error(payload.error || 'Unable to geocode address.');
    }
    return payload;
  }, []);

  return { geocode };
}
