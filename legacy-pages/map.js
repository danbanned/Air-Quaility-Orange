'use client';

// pages/map.js
import React from 'react';
import Layout from '../components/Layout/Layout';
import MapComponent from '../components/Map/MapComponent';
import styles from '../styles/Map.module.css';
import useRouteInfo from '../utils/useRouteInfo';

const MapPage = () => {
  const { userId } = useRouteInfo();

  return (
    <>
      <div className="container">
        <div className={styles.header}>
          <h1 className="section-title">Interactive Environmental Justice Map</h1>
          <p className="section-subtitle">
            Explore pollution sources, community solutions, and environmental impacts in our neighborhoods
          </p>
        </div>

        <MapComponent userId={userId} />

        <div className={styles.mapGuide}>
          <h2>How to Use This Map</h2>
          <div className={styles.guideSteps}>
            <div className={styles.guideStep}>
              <span className={styles.stepNumber}>1</span>
              <h3>Click on Markers</h3>
              <p>Click any red, green, or orange marker to learn about pollution sources or community solutions.</p>
            </div>
            
            <div className={styles.guideStep}>
              <span className={styles.stepNumber}>2</span>
              <h3>Toggle Layers</h3>
              <p>Use the layer controls to show or hide pollution sources, community solutions, and heat zones.</p>
            </div>
            
            <div className={styles.guideStep}>
              <span className={styles.stepNumber}>3</span>
              <h3>Change Map Type</h3>
              <p>Switch between road, satellite, and hybrid views to see different perspectives.</p>
            </div>
            
            <div className={styles.guideStep}>
              <span className={styles.stepNumber}>4</span>
              <h3>Explore Stories</h3>
              <p>Click on community solution markers to read stories of hope and action.</p>
            </div>
          </div>
        </div>

        <div className={styles.mapLocations}>
          <h2>Key Locations in Our Communities</h2>
          
          <div className={styles.locationsGrid}>
            <div className={styles.locationCategory}>
              <h3>🚨 Pollution Sources</h3>
              <ul>
                <li><strong>Roosevelt Extension</strong> - Major highway, high traffic emissions</li>
                <li><strong>SEPTA Midvale Plant</strong> - Natural gas facility</li>
                <li><strong>Wayne Junction</strong> - Rail station, diesel emissions</li>
                <li><strong>Former PES Refinery</strong> - Ongoing remediation site</li>
              </ul>
            </div>
            
            <div className={styles.locationCategory}>
              <h3>🌱 Community Solutions</h3>
              <ul>
                <li><strong>Furtick Farms</strong> - Urban farm and community space</li>
                <li><strong>Hunting Park Garden</strong> - Community garden</li>
                <li><strong>Diamond Street Trees</strong> - Recent tree plantings</li>
                <li><strong>GSI Projects</strong> - Stormwater infrastructure</li>
              </ul>
            </div>
            
            <div className={styles.locationCategory}>
              <h3>🔥 Heat Island Zones</h3>
              <ul>
                <li><strong>Hunting Park Core</strong> - High intensity heat zone</li>
                <li><strong>Nicetown</strong> - Moderate heat zone</li>
                <li><strong>Industrial Corridor</strong> - Extreme heat from surfaces</li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.mapStory}>
          <h2>A Guided Tour Through Environmental Justice</h2>
          <p>
            Start at Nicetown Park (40.01999, -75.15540). From there, look east to see the Roosevelt Extension, 
            a major source of traffic pollution. To the west, you'll find the Hunting Park heat island zone. 
            Throughout the map, you'll see green markers showing where our community is fighting back with 
            gardens, trees, and green infrastructure.
          </p>
        </div>

        {userId && (
          <div className={styles.userContext}>
            <p>Welcome back! The map highlights areas relevant to your community profile.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default MapPage;
