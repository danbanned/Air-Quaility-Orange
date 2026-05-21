'use client';

import { useMemo } from 'react';
import useSWR from 'swr';

const fetcher = async (url) => {
  const response = await fetch(url, { cache: 'no-store' });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || 'Request failed.');
  }
  return payload;
};

export function useMap() {
  const locationsRequest = useSWR('/api/locations', fetcher, {
    refreshInterval: 5 * 60 * 1000,
    revalidateOnFocus: false,
  });

  return useMemo(
    () => ({
      locations: locationsRequest.data || [],
      isLoadingLocations: !locationsRequest.data && !locationsRequest.error,
      locationsError: locationsRequest.error || null,
      mutateLocations: locationsRequest.mutate,
    }),
    [locationsRequest.data, locationsRequest.error, locationsRequest.mutate]
  );
}
