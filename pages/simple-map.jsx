import React from 'react';
import Head from 'next/head';
import CesiumMap from '../components/CesiumMap';

const SimpleMapPage = () => {
  return (
    <>
      <Head>
        <title>AQO Map - Nicetown Environmental Justice</title>
        <meta name="description" content="Interactive 3D map of Nicetown, Philadelphia showing pollution sources and community solutions" />
      </Head>

      <div style={{ 
        minHeight: '100vh', 
        background: '#050912',
        fontFamily: "'Sora', sans-serif"
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 32px',
          background: 'linear-gradient(to bottom, rgba(5,9,18,0.95), transparent)',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          pointerEvents: 'none'
        }}>
          <h1 style={{ 
            fontFamily: "'DM Serif Display', serif", 
            fontSize: '24px', 
            color: '#e2d4b0',
            margin: 0
          }}>
            Air Quality Orange
          </h1>
          <p style={{ 
            fontSize: '12px', 
            color: 'rgba(226,212,176,0.5)',
            marginTop: '4px'
          }}>
            Environmental Justice Map · Nicetown, Philadelphia
          </p>
        </div>

        {/* Legend */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          zIndex: 10,
          background: 'rgba(5,9,18,0.85)',
          backdropFilter: 'blur(10px)',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)',
          pointerEvents: 'none'
        }}>
          <h4 style={{ color: '#e2d4b0', marginBottom: '12px', fontSize: '12px' }}>Map Legend</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', background: '#FF0000', borderRadius: '50%' }}></div>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>Pollution Source</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', background: '#FF6B35', borderRadius: '50%' }}></div>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>Transportation</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', background: '#4CAF50', borderRadius: '50%' }}></div>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>Community Solution</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', background: '#FF6B35', opacity: '0.5' }}></div>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>Nicetown Park (AQO Hub)</span>
            </div>
          </div>
        </div>

        {/* The Map */}
        <CesiumMap />

        {/* Footer hint */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          zIndex: 10,
          fontSize: '11px',
          color: 'rgba(255,255,255,0.3)',
          pointerEvents: 'none'
        }}>
          Click on any marker to learn more
        </div>
      </div>
    </>
  );
};

export default SimpleMapPage;