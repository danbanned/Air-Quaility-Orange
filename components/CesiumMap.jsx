'use client';  // Next.js directive - tells Next.js to render this component on the client-side only, not on the server
// This is needed because Cesium requires browser APIs (window, document, WebGL) that don't exist on the server

// Import React hooks for managing component state and lifecycle
import React, { useEffect, useRef, useState } from 'react';
// useEffect: runs code after component renders (for loading Cesium)
// useRef: creates mutable references that persist across renders (for DOM element and viewer instance)
// useState: manages component state (loading status and errors)

function loadCesiumRuntime() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Cesium can only load in the browser.'));
      return;
    }

    if (window.Cesium) {
      resolve(window.Cesium);
      return;
    }

    const existingScript = document.querySelector('script[data-cesium-runtime="true"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.Cesium), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Cesium runtime.')), { once: true });
      return;
    }

    if (!document.getElementById('cesium-widgets-css')) {
      const link = document.createElement('link');
      link.id = 'cesium-widgets-css';
      link.rel = 'stylesheet';
      link.href = '/cesium/Widgets/widgets.css';
      document.head.appendChild(link);
    }

    const script = document.createElement('script');
    script.src = '/cesium/Cesium.js';
    script.async = true;
    script.dataset.cesiumRuntime = 'true';
    script.onload = () => {
      if (window.Cesium) {
        resolve(window.Cesium);
      } else {
        reject(new Error('Cesium runtime loaded but window.Cesium is unavailable.'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load /cesium/Cesium.js'));
    document.body.appendChild(script);
  });
}

const CesiumMap = ({ 
  // Destructure props with default values if not provided
  initialLat = 40.01999,  // Default latitude: Nicetown Park, Philadelphia
  initialLon = -75.15540, // Default longitude: Nicetown Park
  initialHeight = 2000,   // Camera height in meters above ground
  backgroundMode = false
}) => {
  // containerRef: reference to the DOM div where Cesium will render the 3D map
  // This connects to the div in the JSX below via ref={containerRef}
  const containerRef = useRef(null);
  
  // viewerRef: stores the Cesium Viewer instance after it's created
  // This allows us to access/manipulate the map from other functions
  const viewerRef = useRef(null);
  
  // isLoaded: tracks if Cesium has finished loading and the map is ready
  // Used to show/hide the loading spinner overlay
  const [isLoaded, setIsLoaded] = useState(false);
  
  // error: stores any error message if Cesium fails to load
  // Used to show an error UI instead of a broken map
  const [error, setError] = useState(null);

  // Pollution sources in Nicetown
  // These are data points that will become red/orange markers on the map
  // Each object connects to the entity creation code below
  const pollutionSources = [
    { name: "Roosevelt Extension", lat: 40.01968402262896, lon: -75.15575350419238, type: "highway", description: "Major roadway with heavy diesel traffic" },
    { name: "SEPTA Midvale Plant", lat: 40.01678, lon: -75.15890, type: "industrial", description: "Natural gas power plant" },
    { name: "Wayne Junction", lat: 40.02123, lon: -75.14876, type: "rail", description: "Rail station with diesel emissions" },
    { name: "Former PES Refinery", lat: 40.01789, lon: -75.16234, type: "industrial", description: "Closed refinery, ongoing remediation" }
  ];

  // Community solutions - these become green markers
  // Different color helps users distinguish problems (red) from solutions (green)
  const communitySolutions = [
    { name: "Furtick Farms", lat: 40.0192379893929, lon: -75.1559609779134, type: "garden", description: "Community farm providing fresh food" },
    { name: "Hunting Park Garden", lat: 40.01876, lon: -75.15789, type: "garden", description: "Urban garden and community space" },
    { name: "Tree Planting Site", lat: 40.02045, lon: -75.14987, type: "greenspace", description: "New trees being planted" }
  ];

  // Coordinates for Nicetown CDC (approximate)
  // Array of longitude,latitude pairs that define a polygon shape
  // Format: [lon1, lat1, lon2, lat2, lon3, lat3, lon4, lat4] in degrees
  const nicetownCDCCoordinates = [
    -75.1580, 40.0185,  // Bottom-left corner
    -75.1570, 40.0185,  // Bottom-right corner
    -75.1570, 40.0192,  // Top-right corner
    -75.1580, 40.0192   // Top-left corner (back to start)
  ];

  // useEffect hook - runs after the component mounts to the DOM
  // Empty dependency array [] means this runs once when component first loads
  useEffect(() => {
    // Check if window exists (prevents errors during server-side rendering)
    // This connects to the 'use client' directive at the top
    if (typeof window === 'undefined') return;

    // Define async function to load Cesium (can't make useEffect async directly)
    const loadCesium = async () => {
      try {
        const Cesium = await loadCesiumRuntime();
        
        // Set the base URL where Cesium's static assets (images, workers, etc.) are located
        // This connects to the npm script that copies Cesium files to public/cesium
        window.CESIUM_BASE_URL = '/cesium';
        
        // Set your Cesium Ion access token (required for terrain, satellite imagery)
        // Token comes from environment variable in .env.local
        // This connects Cesium to Cesium Ion's cloud services
        const token = process.env.NEXT_PUBLIC_CESIUM_TOKEN;
        if (token) {
          Cesium.Ion.defaultAccessToken = token;
        } else {
          console.warn('No Cesium token found. Some features may be limited.');
        }

        // Create the Cesium Viewer - the main 3D map object
        // containerRef.current is the DOM div where the map will render
        const viewer = new Cesium.Viewer(containerRef.current, {
          // Configuration options that control what UI elements appear
          baseLayerPicker: false,  // Hides button to switch map styles (satellite/roads)
          geocoder: false,         // Hides search box for finding locations
          homeButton: false,       // Hides button to reset camera to home view
          sceneModePicker: false,  // Hides button to switch 2D/3D/Columbus view
          navigationHelpButton: false, // Hides help button for navigation
          animation: false,        // Hides animation widget (speed control for time)
          timeline: false,         // Hides timeline slider
          fullscreenButton: !backgroundMode,
          infoBox: !backgroundMode,
          selectionIndicator: !backgroundMode,
          terrainExaggeration: 1.0, // Normal terrain height (1x real elevation)
          orderIndependentTranslucency: true, // Better transparent rendering
          contextOptions: {        // WebGL configuration for better graphics
            webgl: {
              alpha: false,        // No transparency in background
              depth: true,         // Enable depth testing (3D positioning)
              stencil: true,       // Enable stencil buffer (for outlines)
              antialias: true,     // Smooth edges of 3D objects
              powerPreference: "high-performance" // Use GPU for better performance
            }
          }
        });

        if (backgroundMode) {
          viewer.scene.screenSpaceCameraController.enableInputs = false;
          viewer.scene.globe.enableLighting = true;
          viewer.scene.fog.enabled = true;
          viewer.scene.fog.density = 0.00035;
          viewer.cesiumWidget.creditContainer.style.display = 'none';
        }

        // Wait for viewer to be ready, then fly camera to Nicetown
        // viewer.camera.flyTo animates the camera movement instead of jumping instantly
        viewer.camera.flyTo({
          // Convert lat/lon/height to Cartesian (x,y,z) coordinates Cesium understands
          destination: Cesium.Cartesian3.fromDegrees(initialLon, initialLat, initialHeight),
          orientation: {
            heading: Cesium.Math.toRadians(0),   // Direction camera faces (0 = north)
            pitch: Cesium.Math.toRadians(-45),   // Camera tilt (-45 = looking down at 45° angle)
            roll: 0                               // Camera rotation (0 = level horizon)
          },
          duration: 2  // Animation takes 2 seconds to complete
        });

        // Add pollution source markers to the map
        // forEach loops through each source in the pollutionSources array
        pollutionSources.forEach(source => {
          // Determine marker color based on pollution type
          // Ternary operators (?:) choose color: highway=orange, industrial=red, else=orange-yellow
          const color = source.type === 'highway' ? '#FF6B35' : 
                        source.type === 'industrial' ? '#FF0000' : '#FFA500';
          
          // viewer.entities.add creates a new object on the map (marker, label, shape)
          // Entities persist and can be clicked/interacted with
          viewer.entities.add({
            name: source.name,  // Identifies entity in Cesium's selection system
            
            // Position where the marker appears - converts lat/lon to 3D coordinates
            position: Cesium.Cartesian3.fromDegrees(source.lon, source.lat),
            
            // point: configures the marker appearance (circle with color)
            point: {
              pixelSize: 14,    // Diameter of marker in pixels on screen
              color: Cesium.Color.fromCssColorString(color), // Marker color from above
              outlineColor: Cesium.Color.WHITE, // White border around marker
              outlineWidth: 2,  // Border thickness in pixels
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND // Marker sticks to ground
            },
            
            // label: text that appears near the marker
            label: {
              text: source.name,  // Display the pollution source name
              font: '14px "Sora", sans-serif', // Font style matching site design
              fillColor: Cesium.Color.WHITE,    // Text color
              outlineColor: Cesium.Color.BLACK, // Dark outline makes text readable
              outlineWidth: 2,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE, // Both fill and outline
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // Label anchors at bottom
              pixelOffset: new Cesium.Cartesian2(0, -20), // Move label 20px above marker
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
              show: !backgroundMode
            },
            
            // description: HTML that appears in info box when marker is clicked
            // This connects to infoBox: true in viewer configuration
            description: `
              <div style="padding: 10px; max-width: 300px;">
                <h3 style="color: ${color}; margin-bottom: 8px;">${source.name}</h3>
                <p><strong>Type:</strong> ${source.type}</p>
                <p>${source.description}</p>
                <hr style="margin: 10px 0; border-color: rgba(255,255,255,0.1);">
                <p style="font-size: 12px; color: #FF6B35;">📍 Click to learn more about community impacts</p>
              </div>
            `
          });
        }); // End of pollutionSources.forEach - now 4 markers added to map

        // Add community solution markers (green)
        // Similar to pollution markers but with different color and message
        communitySolutions.forEach(solution => {
          viewer.entities.add({
            name: solution.name,
            position: Cesium.Cartesian3.fromDegrees(solution.lon, solution.lat),
            point: {
              pixelSize: 14,
              color: Cesium.Color.fromCssColorString('#4CAF50'), // Green for solutions
              outlineColor: Cesium.Color.WHITE,
              outlineWidth: 2,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            },
            label: {
              text: solution.name,
              font: '14px "Sora", sans-serif',
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -20),
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
              show: !backgroundMode
            },
            description: `  // Positive messaging for solutions
              <div style="padding: 10px; max-width: 300px;">
                <h3 style="color: #4CAF50; margin-bottom: 8px;">${solution.name}</h3>
                <p><strong>Type:</strong> ${solution.type}</p>
                <p>${solution.description}</p>
                <hr style="margin: 10px 0; border-color: rgba(255,255,255,0.1);">
                <p style="font-size: 12px; color: #4CAF50;">🌱 This is a community-led solution!</p>
              </div>
            `
          });
        });

        // Add 3D buildings from OpenStreetMap data
        // createOsmBuildingsAsync fetches building data and creates 3D geometry
        // This adds realistic building shapes to the map automatically
        try {
          const tileset = await Cesium.createOsmBuildingsAsync(); // Async network request
          viewer.scene.primitives.add(tileset); // Add buildings to scene
        } catch (error) {
          console.error('Failed to add 3D buildings:', error); // Non-critical, map still works
        }

        // Create a 3D extruded building for Community Center
        // polygon defines a flat shape on ground, extrudedHeight pulls it up into 3D
        viewer.entities.add({
          name: "Community Center",
          polygon: {
            // fromDegreesArray expects alternating [lon, lat, lon, lat...]
            hierarchy: Cesium.Cartesian3.fromDegreesArray([
              -75.1560, 40.0190,  // Corner 1
              -75.1550, 40.0190,  // Corner 2
              -75.1550, 40.0200,  // Corner 3
              -75.1560, 40.0200   // Corner 4
            ]),
            extrudedHeight: 15.0,  // Building height in meters (about 5 stories)
            material: Cesium.Color.fromCssColorString('#FF6B35').withAlpha(0.7), // Semi-transparent orange
            outline: true,  // Show white outline around building
            outlineColor: Cesium.Color.WHITE
          }
        });

        // Make Nicetown CDC a 3D building (Community Development Corporation office)
        viewer.entities.add({
          name: "Nicetown CDC",
          polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray(nicetownCDCCoordinates),
            extrudedHeight: 12,  // 12 meters tall (about 4 stories)
            material: Cesium.Color.fromCssColorString('#FF6B35'), // Solid orange
            outline: true,
            outlineColor: Cesium.Color.WHITE
          }
        });

        // Add a polygon for Nicetown Park (show the park boundaries)
        viewer.entities.add({
          name: "Nicetown Park",
          polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray([
              -75.1575, 40.0182,  // Southwest corner
              -75.1535, 40.0182,  // Southeast corner
              -75.1535, 40.0212,  // Northeast corner
              -75.1575, 40.0212   // Northwest corner
            ]),
            material: Cesium.Color.fromCssColorString('#FF6B35').withAlpha(0.3), // Semi-transparent
            outline: true,
            outlineColor: Cesium.Color.fromCssColorString('#FF6B35'),
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND // Polygon follows terrain
          },
          description: `  // Clickable info for the park
            <div style="padding: 10px;">
              <h3 style="color: #FF6B35;">Nicetown Park</h3>
              <p>❤️ Heart of the community. Starting point for the AQO virtual tour.</p>
              <p><strong>Coordinates:</strong> 40.01999, -75.15540</p>
              <hr style="margin: 10px 0;">
              <p>From here, you can explore pollution sources (red/orange) and community solutions (green).</p>
            </div>
          `
        });

        // Store viewer instance in ref so other functions can access it
        viewerRef.current = viewer;
        
        // Update state to hide loading spinner
        setIsLoaded(true);

      } catch (err) {
        // If any error occurs in the try block, catch it and update error state
        console.error('Failed to load Cesium:', err);
        setError(err.message || 'Unknown error');
      }
    };

    // Execute the async function to load Cesium
    loadCesium();

    // Cleanup function - runs when component unmounts
    // Prevents memory leaks by destroying Cesium viewer
    return () => {
      // Check if viewer exists and hasn't been destroyed yet
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();  // Frees WebGL resources and removes event listeners
      }
    };
  }, []); // Empty array means this effect runs once on mount, never again

  // If there's an error, show error UI instead of map
  // This connects to the catch block above
  if (error) {
    if (backgroundMode) {
      return <div style={{ width: '100%', height: '100%', background: '#050912' }} />;
    }

    return (
      <div style={{ 
        padding: '60px 40px', 
        textAlign: 'center', 
        background: '#1a1a2e', 
        color: '#e2d4b0',
        borderRadius: '10px',
        margin: '20px'
      }}>
        <h3 style={{ color: '#FF6B35', marginBottom: '16px' }}>⚠️ Cesium Map Failed to Load</h3>
        <p style={{ marginBottom: '16px' }}>Error: {error}</p>
        <div style={{ 
          background: '#0d1117', 
          padding: '16px', 
          borderRadius: '8px', 
          textAlign: 'left',
          marginTop: '20px'
        }}>
          <p style={{ fontSize: '13px', marginBottom: '8px' }}><strong>Troubleshooting:</strong></p>
          <ul style={{ fontSize: '12px', color: '#aaa', marginLeft: '20px' }}>
            <li>Make sure you have a valid Cesium token in <code>.env.local</code></li>
            <li>Check that you've run <code>npm run copy-cesium</code></li>
            <li>Try refreshing the page</li>
            <li>Check your internet connection (Cesium loads assets from CDN)</li>
          </ul>
        </div>
      </div>
    );
  }

  // Main return: renders the map container with loading overlay
  return (
    <div style={{ position: 'relative', width: '100%', height: backgroundMode ? '100%' : '600px', borderRadius: backgroundMode ? '0' : '12px', overflow: 'hidden', pointerEvents: backgroundMode ? 'none' : 'auto' }}>
      {/* containerRef attaches to this div - Cesium renders here */}
      <div ref={containerRef} style={{ width: '100%', height: '100%', filter: backgroundMode ? 'saturate(0.82) brightness(0.7) contrast(1.08)' : 'none' }} />
      
      {/* Loading overlay - shows while !isLoaded (Cesium still loading) */}
      {!isLoaded && !error && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: '#050912',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10  // Appears above the map div
        }}>
          <div style={{ textAlign: 'center' }}>
            {/* CSS spinner animation defined below */}
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '3px solid #FF6B35', 
              borderTop: '3px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            {!backgroundMode ? <p style={{ color: '#e2d4b0' }}>Loading 3D Map of Nicetown...</p> : null}
          </div>
        </div>
      )}

      {/* CSS keyframe animation for the spinner */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CesiumMap;  // Makes component importable in other files
