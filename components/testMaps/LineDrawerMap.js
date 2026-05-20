'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

const CesiumMap = () => {
  const mapContainerRef = useRef(null);
  const viewerRef = useRef(null);
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // ✅ MOVED TO TOP LEVEL (outside useEffect)
  const pendingPointsRef = useRef([]);  // Stores collected coordinates
  const shapeCountRef = useRef(0);       // Counts how many shapes we've made
  const clickHandlerRef = useRef(null);  // Stores the click handler for cleanup

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Define pathPoints inside useEffect
    const pathPoints = [
      -75.155571, 40.019404,
      -75.155349, 40.020454,
      -75.155287, 40.020438,
      -75.155510, 40.019402
    ];

    // Function to update the UI display of points
    const updatePointsDisplay = () => {
      const pointsList = document.getElementById('points-list');
      if (pointsList) {
        if (pendingPointsRef.current.length === 0) {
          pointsList.innerHTML = '<div style="color: #888; font-style: italic;">No points yet. Click the map to start drawing.</div>';
        } else {
          pointsList.innerHTML = pendingPointsRef.current.map((point, idx) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
              <span>
                <strong>Point ${idx + 1}:</strong><br>
                Lon: ${point.lon.toFixed(6)}<br>
                Lat: ${point.lat.toFixed(6)}
              </span>
              <span style="color: ${idx === 3 ? '#4CAF50' : '#FF6B35'}; font-size: 12px;">
                ${idx === 3 ? '✓ Ready' : `${4 - (idx + 1)} more needed`}
              </span>
            </div>
          `).join('');
        }
      }
      
      const pointCounter = document.getElementById('point-counter');
      if (pointCounter) {
        pointCounter.textContent = `${pendingPointsRef.current.length}/4 points collected`;
      }
    };

    // Function to create a polygon from the collected points
    const createPolygonFromPoints = () => {
      if (pendingPointsRef.current.length !== 4) {
        console.log(`Need 4 points to create shape. Have ${pendingPointsRef.current.length}`);
        return;
      }
      
      const polygonCoordinates = [];
      pendingPointsRef.current.forEach(point => {
        polygonCoordinates.push(point.lon);
        polygonCoordinates.push(point.lat);
      });
      
      const extrudedHeight = 30;
      const colors = ['#FF6B35', '#4CAF50', '#2196F3', '#9C27B0', '#FFC107', '#E91E63'];
      const color = colors[shapeCountRef.current % colors.length];
      
      viewerRef.current.entities.add({
        name: `User Shape ${shapeCountRef.current + 1}`,
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray(polygonCoordinates),
          height: 0,
          extrudedHeight: extrudedHeight,
          material: Cesium.Color.fromCssColorString(color).withAlpha(0.5),
          outline: true,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2
        },
        description: `
          <div style="padding: 10px;">
            <h3 style="color: ${color};">Shape ${shapeCountRef.current + 1}</h3>
            <p><strong>Extruded Height:</strong> ${extrudedHeight}m (fixed)</p>
            <p><strong>Points used:</strong></p>
            <ul>
              ${pendingPointsRef.current.map(p => `<li>(${p.lat.toFixed(6)}, ${p.lon.toFixed(6)})</li>`).join('')}
            </ul>
          </div>
        `
      });
      
      pendingPointsRef.current.forEach((point, idx) => {
        viewerRef.current.entities.add({
          name: `Shape ${shapeCountRef.current + 1} - Corner ${idx + 1}`,
          position: Cesium.Cartesian3.fromDegrees(point.lon, point.lat, point.height + 1),
          point: {
            pixelSize: 10,
            color: Cesium.Color.fromCssColorString(color),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2
          },
          label: {
            text: `${idx + 1}`,
            font: '14px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -15)
          }
        });
      });
      
      shapeCountRef.current++;

      if (window.previewLine) {
        viewerRef.current.entities.remove(window.previewLine);
        window.previewLine = null;
      }
      
      pendingPointsRef.current = [];
      updatePointsDisplay();
      
      console.log(`✅ Shape ${shapeCountRef.current} created with fixed 30m height!`);
    };

    try {
      
      window.CESIUM_BASE_URL = '/cesium';
      Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_TOKEN;

      if (!viewerRef.current) {
        viewerRef.current = new Cesium.Viewer(mapContainerRef.current, {
          timeline: false,
          animation: false,
          homeButton: false,
          sceneModePicker: false,
          navigationHelpButton: false,
          baseLayerPicker: false,
          geocoder: false,
          infoBox: true,
          selectionIndicator: true,
          shouldAnimate: true,
          scene3DOnly: true,
          useDefaultRenderLoop: true,
          targetFrameRate: 60,
          contextOptions: {
            webgl: {
              preserveDrawingBuffer: true,
              antialias: true,
            }
          }
        });
      }

      setIsLoaded(true);

      // Fly to location
      viewerRef.current.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(-75.15540, 40.01999, 2000),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-45),
          roll: 0
        },
        duration: 3
      });

      // Add walking path
      viewerRef.current.entities.add({
        name: "Walking Path",
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray(pathPoints),
          width: 5,
          material: Cesium.Color.fromCssColorString('#FF6B35'),
          clampToGround: true,
          outline: true,
          outlineColor: Cesium.Color.WHITE
        }
      });

      // Add marker for Nicetown Park
      viewerRef.current.entities.add({
        name: "Nicetown Park",
        position: Cesium.Cartesian3.fromDegrees(-75.15540, 40.01999),
        point: {
          pixelSize: 14,
          color: Cesium.Color.fromCssColorString('#FF6B35'),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2
        },
        label: {
          text: 'Nicetown Park',
          font: '14px sans-serif',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -20)
        }
      });

      // ✅ SETUP CLICK HANDLER (once, correctly)
      clickHandlerRef.current = new Cesium.ScreenSpaceEventHandler(viewerRef.current.scene.canvas);
      
      clickHandlerRef.current.setInputAction((movement) => {
        const ray = viewerRef.current.camera.getPickRay(movement.position);
        const cartesianPosition = viewerRef.current.scene.globe.pick(ray, viewerRef.current.scene);
        
        if (Cesium.defined(cartesianPosition)) {
          const cartographic = Cesium.Cartographic.fromCartesian(cartesianPosition);
          const longitude = Cesium.Math.toDegrees(cartographic.longitude);
          const latitude = Cesium.Math.toDegrees(cartographic.latitude);
          const height = cartographic.height;
          
          const newPoint = {
            lon: longitude,
            lat: latitude,
            height: height,
            timestamp: Date.now()
          };
          
          pendingPointsRef.current.push(newPoint);

          // Preview line logic
          if (pendingPointsRef.current.length > 1 && pendingPointsRef.current.length < 4) {
            if (window.previewLine) {
              viewerRef.current.entities.remove(window.previewLine);
            }
            
            const previewCoords = [];
            pendingPointsRef.current.forEach(point => {
              previewCoords.push(point.lon);
              previewCoords.push(point.lat);
            });
            
            window.previewLine = viewerRef.current.entities.add({
              polyline: {
                positions: Cesium.Cartesian3.fromDegreesArray(previewCoords),
                width: 3,
                material: Cesium.Color.YELLOW.withAlpha(0.6),
                clampToGround: true
              }
            });
          }
          
          // Temporary marker feedback
          const tempMarker = viewerRef.current.entities.add({
            position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height + 2),
            point: {
              pixelSize: 12,
              color: Cesium.Color.YELLOW,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2
            },
            label: {
              text: `${pendingPointsRef.current.length}`,
              font: '16px bold sans-serif',
              fillColor: Cesium.Color.YELLOW,
              outlineColor: Cesium.Color.BLACK,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -20)
            }
          });
          
          setTimeout(() => {
            viewerRef.current.entities.remove(tempMarker);
          }, 1500);
          
          updatePointsDisplay();
          
          console.log(`Point ${pendingPointsRef.current.length} collected`);
          
          if (pendingPointsRef.current.length === 4) {
            console.log('🎯 4 points collected! Creating polygon...');
            createPolygonFromPoints();
            
            const notification = document.getElementById('shape-notification');
            if (notification) {
              notification.style.display = 'block';
              setTimeout(() => {
                notification.style.display = 'none';
              }, 2000);
            }
          }
        } else {
          console.log('Clicked on sky or empty space.');
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    } catch (err) {
      setError(err.message);
      console.error("Error initializing Cesium viewer:", err);
    }

    // ✅ CLEANUP - fixed to use clickHandlerRef.current
    return () => {
      if (clickHandlerRef.current) {
        clickHandlerRef.current.destroy();
        clickHandlerRef.current = null;
      }
      
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };

  }, []);
  

  if (error) {
    return (<div>Error initializing Cesium viewer: {error}</div>)
    
  }

  return (
      
   <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
   
   <button
      onClick={() => {
        pendingPointsRef.current = [];
        updatePointsDisplay();
        console.log('Points cleared');
      }}
      style={{
        marginTop: '8px',
        width: '100%',
        padding: '6px',
        background: 'rgba(255,107,53,0.2)',
        border: '1px solid rgba(255,107,53,0.5)',
        borderRadius: '8px',
        color: '#e2d4b0',
        cursor: 'pointer',
        fontSize: '11px'
      }}
    >
      🗑️ Clear Points
    </button>
   
    {/* Drawing Tool UI Panel */}
    <div style={{
      position: 'absolute',
      bottom: 20,
      right: 20,
      width: '280px',
      background: 'rgba(5, 9, 18, 0.92)',
      backdropFilter: 'blur(12px)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 107, 53, 0.3)',
      padding: '16px',
      color: '#e2d4b0',
      pointerEvents: 'auto',
      zIndex: 1002,
      fontFamily: 'sans-serif'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '12px',
        borderBottom: '1px solid rgba(255,107,53,0.5)',
        paddingBottom: '8px'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#FF6B35' }}>
          📐 Polygon Draw Tool
        </h3>
        <span id="point-counter" style={{ 
          background: 'rgba(255,107,53,0.2)', 
          padding: '2px 8px', 
          borderRadius: '12px',
          fontSize: '12px'
        }}>
          0/4 points collected
        </span>
      </div>
      
      <div id="points-list" style={{ 
        maxHeight: '200px', 
        overflowY: 'auto',
        fontSize: '12px',
        marginBottom: '12px'
      }}>
        <div style={{ color: '#888', fontStyle: 'italic' }}>No points yet. Click the map to start drawing.</div>
        </div>
        
        <div style={{ 
          fontSize: '11px', 
          color: '#aaa',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: '8px',
          marginTop: '8px'
        }}>
          💡 Click 4 corners on the ground to create a 3D building
        </div>
        
        <div id="shape-notification" style={{
          display: 'none',
          position: 'absolute',
          top: '-10px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#4CAF50',
          color: 'white',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          whiteSpace: 'nowrap'
        }}>
          ✅ Shape created!
        </div>
      </div>
    <div
        ref={mapContainerRef}
        style={{ width: '100%', height: '100vh', backgroundColor: '#050912' }}
      />
          {!isLoaded && !error && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#050912',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#e2d4b0',
              zIndex: 1000
            }}>
              Loading 3D map...
            </div>
          )}
      {/* The Cesium map will be rendered inside this div */}
      </div>


   
  )
}



export default CesiumMap;