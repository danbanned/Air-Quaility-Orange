'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

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
  );
}
