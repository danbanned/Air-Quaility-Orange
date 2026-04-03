import React from 'react';
import dynamic from 'next/dynamic';

const CesiumMap = dynamic(() => import('../CesiumMap.jsx'), { ssr: false });

const SiteBackground = () => (
  <div className="site-background" aria-hidden="true">
    <div className="site-background-map">
      <CesiumMap backgroundMode initialHeight={4200} />
    </div>
    <div className="site-background-overlay" />
    <div className="site-background-grid" />
    <div className="site-background-glow site-background-glow-left" />
    <div className="site-background-glow site-background-glow-right" />
  </div>
);

export default SiteBackground;
