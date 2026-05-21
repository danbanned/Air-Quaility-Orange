'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import ErrorBoundary from '@/components/ErrorBoundary';

const CesiumMap = dynamic(() => import('@/components/CesiumMap.jsx'), {
  ssr: false,
  loading: () => (
    <div className="aqo-map-route-loading">
      <div className="aqo-map-spinner" />
      <p>Loading 3D map...</p>
    </div>
  ),
});

export default function MapPage() {
  return (
    <div className="map-page">
      <ErrorBoundary>
        <Suspense
          fallback={
            <div className="aqo-map-route-loading">
              <div className="aqo-map-spinner" />
              <p>Loading 3D map...</p>
            </div>
          }
        >
          <CesiumMap />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
