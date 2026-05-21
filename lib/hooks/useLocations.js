'use client';

import useSWR from 'swr';

const fetcher = async (url) => {
  const response = await fetch(url, { cache: 'no-store' });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || 'Unable to fetch locations.');
  }
  return payload;
};

export function useLocations() {
  const { data, error, mutate } = useSWR('/api/locations', fetcher, {
    refreshInterval: 5 * 60 * 1000,
    revalidateOnFocus: false,
  });

  return {
    locations: data || [],
    isLoading: !data && !error,
    error: error || null,
    mutate,
  };
}
