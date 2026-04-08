'use client';  // Next.js directive - tells Next.js to render this component on the client-side only, not on the server
// This is needed because Cesium requires browser APIs (window, document, WebGL) that don't exist on the server

// Import React hooks for managing component state and lifecycle
import React, { useEffect, useRef, useState } from 'react';
// useRef: creates mutable references that persist across renders (for DOM element and viewer instance)


function loadCesiumRuntime() {
    //we are looking for existing cesium script tag in the page to prevent loading it multiple times if the user navigates away and back to the map page, if we find it we attach event listeners to resolve or reject the promise based on whether the script loads successfully or fails to load
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Cesium can only load in the browser.'));
      return;
    }
    //this fucntion mauallly loads cesium by injecting a script tga <script> into the page  this is a common pattern for loading javascript libraries, after the script gets 
    //injected we return a new promsi which is a javascript constructer  that creates a promis object, a promis
    //reperesents a value that may not be available yet but will be at some point 
    //resolve and reject  are callback functions that javascript gives you when you crearte a promis 
    // reslove gets called when the async operation is successful it then passes the value to whatever is waiting with a .then() method 
    //and reject gets called when the async operation fails and it passes the error to whatever is waiting with a .catch() method
    //(typeof window === 'undefined')  checks to see if we are in the browser or on the serever if we are on the serever cedsium rejects because it can only run in the browser

    if (window.Cesium) {
      resolve(window.Cesium);
      return;
    }
    //we check if cesium is already loaded in the window if it is we resolve the promis immdediantly with the existing cesium.window 
    //thus allows for us to avoid loading the script multiple times if the user navigates away and back to the map page



    const existingScript = document.querySelector('script[data-cesium-runtime="true"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.Cesium), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Cesium runtime.')), { once: true });
      return;
    }
    //we check if the script tag is already loading cesium by using a queryselector to look for the script tag with
    // script[data-cesium-runtime="true"]' in the html page, document.querySelector() finds the first html element matching, a css selector returns the element 
    //found if it exist or null if it doesnt 'script[data-cesium-runtime="true"]'
    //is a css attribute selector that looks for a script tag with a custom attribute called  data-cesium-runtime with the value true
    //we look for this specifc attribute to ensure we are targeting the correct script tag incase theres others
    //and to prevent duplicate loading if the cesium script was already added by another componet or a previouse rneder 

 
    //we are seperating js and css loading because cesium has a default css file that needs to be loaded for the map to display correctly, and we want to ensure the css is loaded before the js runs to prevent any flash of unstyled content or broken layout when the map first loads, by checking and loading the css first we can ensure the styles are in place before cesium tries to render the map, this also allows us to avoid loading the css multiple times if the user navigates away and back to the map page since we check for its existence before adding it

    if (!document.getElementById('cesium-widgets-css')) {
      const link = document.createElement('link');
      link.id = 'cesium-widgets-css';
      link.rel = 'stylesheet';
      link.href = '/cesium/Widgets/widgets.css';
      document.head.appendChild(link);
    }
    //we the check if a css link with the ID cesium-widgets-css already exists 
    //if it doesnt we cretae it by creating a new link elementand we set it 
    //to load /cesium/Widgets/widgets.css which is the default css for cesium widgets like the info box and home button, this ensures the map has the correct styling
    //the we add it to the <head> of the html page which looks like this <head>
    //<link id="cesium-widgets-css" rel="stylesheet" href="/cesium/Widgets/widgets.css"></head>

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
//this injects code directly into the live html page on your browser webpage 
//What this does:
//Creates a new <script> tag
//Sets its source to /cesium/Cesium.js (the main Cesium library)
//async = true means the script downloads in the background without blocking page rendering
//Adds a custom attribute data-cesium-runtime="true" for tracking
//Sets up onload - when script successfully downloads, check if window.Cesium exists (the library loaded properly), then either resolve the Promise or reject with error
//Sets up onerror - if script fails to download, reject the Promise

//Adds the script to the end of the <body>
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
  const cesiumRef = useRef(null);
  const cleanupRef = useRef([]);
  const orbitStateRef = useRef({ active: false, removeTick: null });
  
  // isLoaded: tracks if Cesium has finished loading and the map is ready
  // Used to show/hide the loading spinner overlay
  const [isLoaded, setIsLoaded] = useState(false);
  
  // error: stores any error message if Cesium fails to load
  // Used to show an error UI instead of a broken map
  const [error, setError] = useState(null);
  const [cameraMode, setCameraMode] = useState('free');
  const [cinematicMode, setCinematicMode] = useState(true);
  const [activeSceneLabel, setActiveSceneLabel] = useState('Nicetown Park');
  const [tourDebug, setTourDebug] = useState('idle');

  // Pollution sources in Nicetown
  // These are data points that will become red/orange markers on the map
  // Each object connects to the entity creation code below
  const pollutionSources = [
    { name: "Roosevelt Extension", lat: 40.01968402262896, lon: -75.15575350419238, type: "highway", description: "Major roadway with heavy diesel traffic", aqi: 142, alertColor: '#FF6B35' },
    { name: "SEPTA Midvale Plant", lat: 40.01678, lon: -75.15890, type: "industrial", description: "Natural gas power plant", aqi: 158, alertColor: '#FF0000' },
    { name: "Wayne Junction", lat: 40.02123, lon: -75.14876, type: "rail", description: "Rail station with diesel emissions", aqi: 126, alertColor: '#FFA500' },
    { name: "Former PES Refinery", lat: 40.01789, lon: -75.16234, type: "industrial", description: "Closed refinery, ongoing remediation", aqi: 111, alertColor: '#ff7f50' }
  ];

  // Community solutions - these become green markers
  // Different color helps users distinguish problems (red) from solutions (green)
  const communitySolutions = [
    { name: "Furtick Farms", lat: 40.0192379893929, lon: -75.1559609779134, type: "garden", description: "Community farm providing fresh food", aqi: 54 },
    { name: "Hunting Park Garden", lat: 40.01876, lon: -75.15789, type: "garden", description: "Urban garden and community space", aqi: 61 },
    { name: "Tree Planting Site", lat: 40.02045, lon: -75.14987, type: "greenspace", description: "New trees being planted", aqi: 58 }
  ];

  const tourWaypoints = [
    { lon: initialLon, lat: initialLat, targetHeight: 20, range: 680, heading: 2, pitch: -52, duration: 3.5, wait: 1500, name: 'Welcome to Nicetown Park' },
    { lon: -75.15575350419238, lat: 40.01968402262896, targetHeight: 18, range: 260, heading: 46, pitch: -28, duration: 4, wait: 1800, name: 'Roosevelt Extension pollution corridor' },
    { lon: -75.15890, lat: 40.01678, targetHeight: 18, range: 235, heading: -20, pitch: -24, duration: 3.5, wait: 1800, name: 'SEPTA Midvale Plant emissions zone' },
    { lon: -75.1559609779134, lat: 40.0192379893929, targetHeight: 18, range: 190, heading: 12, pitch: -22, duration: 3, wait: 1500, name: 'Furtick Farms community solution' },
    { lon: initialLon, lat: initialLat, targetHeight: 20, range: 460, heading: 0, pitch: -60, duration: 3, wait: 0, name: 'Return to Nicetown hub' }
  ];

  const registerCleanup = (fn) => {
    cleanupRef.current.push(fn);
  };
  //saves memory and prevents potential memory leaks
  //  by ensuring that any event listeners, animation loops, or other resources created by the component 
  // are properly cleaned up when the component unmounts
  //  or when certain actions occur (like stopping an orbit)
  //. By centralizing cleanup functions in an array and calling them all in a useEffect cleanup function,
  //  we can ensure that we don't leave behind any orphaned processes that
  //  could continue to run and consume resources after the component is no longer in use.

  const stopOrbit = () => {
    const orbitState = orbitStateRef.current;
    if (orbitState.removeTick) {
      orbitState.removeTick();
    }
    if (viewerRef.current && cesiumRef.current && !viewerRef.current.isDestroyed()) {
      viewerRef.current.camera.lookAtTransform(cesiumRef.current.Matrix4.IDENTITY);
    }
    orbitStateRef.current = { active: false, removeTick: null };
    if (!backgroundMode) {
      setCameraMode('free');
    }
  };
  //Cesium ahs its own function call for stopping the orbit tick function 
  //it also checks if the viewer is still valid and not destroyed 
  // before trying to reset the camera view to prevent errors
  //  if the user navigates away while an orbit is active,
  //  and it also resets the orbit state to inactive and clears the removeTick reference,
  //  finally if we are not in background mode we set the camera mode back to free to show 
  // the UI controls again
  //this controls a auto rotate or touring feature which is used
  //to automatically fly the camera around points of interest on the map,
  //  and this function allows us to stop that orbiting behavior and reset the camera view when needed, 
  // such as when the user wants to take manual control or when navigating away from the page
  //the lookattransform line: when orbiting cesium changes
  //the camera's reference point Matrix4.IDENTITY 
  // resets it back to normal so the user can control the camera freely again.



  const createLabelImage = (text, color, eyebrow) => {
    if (typeof document === 'undefined') {
      return '';
    }
    //this creates a custom marker label by drawing text onto a canvas element and then converting 
    // that canvas to a data URL which can be used as an image source for the marker icons,
    //  this allows us to have dynamic labels with custom styling directly on the map without
    //  needing separate image files for each marker, we can generate them on the fly based
    //  on the pollution source or community solution data,
    //  and it also allows us to include multiple lines of text 
    // (like an eyebrow and main label) with different styles and colors to make
    //  the markers more informative and visually appealing.
    // so cesium allows for us to create custom images instead of 
    //using a static icon for each marker, by using a canvas we can draw whatever we want on it (shapes, text, colors) and then convert that drawing into an image that cesium can use for the marker icon, this is especially useful for our application because we want to display the name of the pollution source or community solution directly on the map as part of the marker, and we also want to color code them based on AQI levels, so by generating these label images dynamically with a canvas we can achieve that level of customization and interactivity without needing to create and manage a large number of separate image files.

    const canvas = document.createElement('canvas');
    canvas.width = 420;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(4, 8, 16, 0.82)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.fillRect(8, 8, canvas.width - 16, canvas.height - 16);
    ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

    ctx.fillStyle = 'rgba(226,212,176,0.68)';
    ctx.font = '600 18px "Sora", sans-serif';
    ctx.fillText(eyebrow, 28, 38);

    ctx.fillStyle = '#f7f2e7';
    ctx.font = '700 30px "Sora", sans-serif';
    ctx.fillText(text, 28, 78);

    ctx.fillStyle = color;
    ctx.fillRect(28, 90, 120, 4);

    return canvas.toDataURL('image/png');
  };

  const applyCinematicState = (viewer, Cesium, enabled) => {
    viewer.scene.globe.enableLighting = enabled;
    viewer.scene.shadowMap.enabled = enabled;
    viewer.scene.fog.enabled = enabled;
    viewer.scene.fog.density = enabled ? 0.00075 : 0.00025;
    viewer.scene.fog.minimumBrightness = enabled ? 0.1 : 0.35;
    viewer.scene.highDynamicRange = enabled;
    viewer.scene.skyAtmosphere.show = true;
    viewer.scene.globe.atmosphereBrightnessShift = enabled ? -0.08 : 0;
    viewer.scene.globe.atmosphereHueShift = enabled ? -0.02 : 0;
    viewer.camera.percentageChanged = enabled ? 0.001 : 0.01;
    viewer.clock.currentTime = Cesium.JulianDate.fromDate(
      new Date(enabled ? '2026-04-04T18:45:00Z' : '2026-04-04T16:00:00Z')
    );
  };

  const startTour = () => {
    const viewer = viewerRef.current;
    const Cesium = cesiumRef.current;
    if (!viewer || !Cesium) {
      setTourDebug('tour blocked: viewer not ready');
      return;
    }

    stopOrbit();
    viewer.camera.cancelFlight();
    viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    setCameraMode('tour');
    setTourDebug('tour start requested');

    let currentIndex = 0;
    let cancelled = false;
    let pendingTimeout = null;

    const flyToNextPoint = () => {
      if (cancelled || currentIndex >= tourWaypoints.length) {
        if (!cancelled) {
          setCameraMode('free');
          setTourDebug('tour complete');
        }
        return;
      }

      const point = tourWaypoints[currentIndex];
      setActiveSceneLabel(point.name);
      setTourDebug(`flying to ${currentIndex + 1}/${tourWaypoints.length}: ${point.name}`);

      const target = Cesium.Cartesian3.fromDegrees(point.lon, point.lat, point.targetHeight || 0);
      const offset = new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(point.heading || 0),
        Cesium.Math.toRadians(point.pitch || -30),
        point.range || initialHeight
      );

      const completeFlight = () => {
        currentIndex += 1;
        if (currentIndex >= tourWaypoints.length) {
          setCameraMode('free');
          setTourDebug('tour complete');
          return;
        }
        setTourDebug(`arrived at ${point.name}; waiting ${point.wait || 1000}ms`);
        pendingTimeout = window.setTimeout(flyToNextPoint, point.wait || 1000);
      };

      try {
        viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
        viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(target, 30), {
          offset,
          duration: point.duration || 3,
          easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
          complete: completeFlight
        });
      } catch (flightError) {
        console.error('Cinematic tour flight failed, falling back to direct flyTo.', flightError);
        setTourDebug(`bounding-sphere flight failed at ${point.name}; using fallback`);
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(point.lon, point.lat, point.range || initialHeight),
          orientation: {
            heading: Cesium.Math.toRadians(point.heading || 0),
            pitch: Cesium.Math.toRadians(point.pitch || -30),
            roll: Cesium.Math.toRadians(point.roll || 0)
          },
          duration: point.duration || 3,
          easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
          complete: completeFlight
        });
      }
    };

    flyToNextPoint();

    registerCleanup(() => {
      cancelled = true;
      setTourDebug('tour cancelled during cleanup');
      if (pendingTimeout) {
        window.clearTimeout(pendingTimeout);
      }
    });
  };

  const startOrbit = (centerLon, centerLat, focusLabel = 'Pollution source orbit') => {
    const viewer = viewerRef.current;
    const Cesium = cesiumRef.current;
    if (!viewer || !Cesium) {
      setTourDebug('orbit blocked: viewer not ready');
      return;
    }

    stopOrbit();
    viewer.camera.cancelFlight();
    viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    setCameraMode('orbit');
    setActiveSceneLabel(focusLabel);
    setTourDebug(`orbit start requested: ${focusLabel}`);

    let orbitAngle = 0;
    const center = Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 40);
    viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(center, 30), {
      offset: new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(20),
        Cesium.Math.toRadians(-24),
        260
      ),
      duration: 1.6,
      easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
      complete: () => {
        setTourDebug(`orbit active: ${focusLabel}`);
      }
    });

    const removeTick = viewer.scene.postRender.addEventListener(() => {
      orbitAngle += 0.0035;
      if (viewer.isDestroyed()) {
        return;
      }
      viewer.camera.lookAt(
        center,
        new Cesium.HeadingPitchRange(
          orbitAngle,
          Cesium.Math.toRadians(-24),
          260
        )
      );
    });

    orbitStateRef.current = { active: true, removeTick };
    registerCleanup(stopOrbit);
  };

  const resetCamera = () => {
    const viewer = viewerRef.current;
    const Cesium = cesiumRef.current;
    if (!viewer || !Cesium) {
      return;
    }

    stopOrbit();
    setActiveSceneLabel('Nicetown Park');
    viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(initialLon, initialLat, initialHeight),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-45),
        roll: 0
      },
      duration: 2.4,
      easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT
    });
  };

  const handleCinematicToggle = () => {
    const viewer = viewerRef.current;
    const Cesium = cesiumRef.current;
    if (!viewer || !Cesium) {
      return;
    }

    setCinematicMode((prev) => {
      const next = !prev;
      applyCinematicState(viewer, Cesium, next);
      return next;
    });
  };

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
        cesiumRef.current = Cesium;
        
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
          viewer.cesiumWidget.creditContainer.style.display = 'none';
        }

        applyCinematicState(viewer, Cesium, backgroundMode ? true : cinematicMode);

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
          const hotspotEntity = viewer.entities.add({
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
                <p><strong>Live AQI:</strong> ${source.aqi}</p>
                <p>${source.description}</p>
                <hr style="margin: 10px 0; border-color: rgba(255,255,255,0.1);">
                <p style="font-size: 12px; color: #FF6B35;">📍 Click to learn more about community impacts</p>
              </div>
            `
          });

          viewer.entities.add({
            name: `${source.name} pulse`,
            position: Cesium.Cartesian3.fromDegrees(source.lon, source.lat),
            ellipse: {
              semiMajorAxis: new Cesium.CallbackProperty(() => 28 + Math.abs(Math.sin(Date.now() / 420)) * 95, false),
              semiMinorAxis: new Cesium.CallbackProperty(() => 28 + Math.abs(Math.sin(Date.now() / 420)) * 95, false),
              material: Cesium.Color.fromCssColorString(source.alertColor).withAlpha(0.12),
              outline: true,
              outlineColor: Cesium.Color.fromCssColorString(source.alertColor).withAlpha(0.72),
              height: 2
            }
          });

          for (let i = 0; i < 22; i += 1) {
            const baseAngle = (Math.PI * 2 * i) / 22;
            const baseRadius = 18 + (i % 5) * 12;
            const baseHeight = 14 + (i % 4) * 10;
            viewer.entities.add({
              position: new Cesium.CallbackProperty((time) => {
                const seconds = Cesium.JulianDate.secondsDifference(time, viewer.clock.startTime);
                const drift = seconds * 0.00002;
                const lon = source.lon + (Math.cos(baseAngle + drift) * baseRadius) / 111000;
                const lat = source.lat + (Math.sin(baseAngle + drift * 1.4) * baseRadius) / 111000;
                const height = baseHeight + (seconds * 6 + i * 4) % 70;
                return Cesium.Cartesian3.fromDegrees(lon, lat, height);
              }, false),
              point: {
                pixelSize: 4,
                color: Cesium.Color.fromCssColorString(source.alertColor).withAlpha(0.48),
                outlineColor: Cesium.Color.WHITE.withAlpha(0.55),
                outlineWidth: 1
              }
            });
          }

          viewer.entities.add({
            name: `${source.name} label`,
            position: Cesium.Cartesian3.fromDegrees(source.lon, source.lat, 48),
            billboard: {
              image: createLabelImage(source.name, source.alertColor, `AQI ${source.aqi}`),
              width: 210,
              height: 60,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -18),
              show: !backgroundMode
            }
          });

          hotspotEntity.point.pixelSize = 16;
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
                <p><strong>Live AQI:</strong> ${solution.aqi}</p>
                <p>${solution.description}</p>
                <hr style="margin: 10px 0; border-color: rgba(255,255,255,0.1);">
                <p style="font-size: 12px; color: #4CAF50;">🌱 This is a community-led solution!</p>
              </div>
            `
          });

          viewer.entities.add({
            name: `${solution.name} uplift ring`,
            position: Cesium.Cartesian3.fromDegrees(solution.lon, solution.lat),
            ellipse: {
              semiMajorAxis: new Cesium.CallbackProperty(() => 20 + Math.abs(Math.sin(Date.now() / 560)) * 65, false),
              semiMinorAxis: new Cesium.CallbackProperty(() => 20 + Math.abs(Math.sin(Date.now() / 560)) * 65, false),
              material: Cesium.Color.fromCssColorString('#4CAF50').withAlpha(0.08),
              outline: true,
              outlineColor: Cesium.Color.fromCssColorString('#7ef0a0').withAlpha(0.55),
              height: 1
            }
          });
        });

        const createWindFlow = (startLon, startLat, endLon, endLat, color) => {
          for (let i = 0; i < 18; i += 1) {
            viewer.entities.add({
              position: new Cesium.CallbackProperty((time) => {
                const seconds = Cesium.JulianDate.secondsDifference(time, viewer.clock.startTime);
                const t = ((i / 18) + seconds * 0.09) % 1;
                const lon = startLon + (endLon - startLon) * t;
                const lat = startLat + (endLat - startLat) * t;
                return Cesium.Cartesian3.fromDegrees(lon, lat, 28 + (i % 4) * 3);
              }, false),
              point: {
                pixelSize: 4,
                color: Cesium.Color.fromCssColorString(color).withAlpha(0.7)
              }
            });
          }

          viewer.entities.add({
            polyline: {
              positions: Cesium.Cartesian3.fromDegreesArray([startLon, startLat, endLon, endLat]),
              width: 2,
              material: Cesium.Color.fromCssColorString(color).withAlpha(0.22),
              clampToGround: false
            }
          });
        };

        createWindFlow(-75.161, 40.0175, -75.1495, 40.021, '#8dd6ff');
        createWindFlow(-75.1572, 40.022, -75.1508, 40.0184, '#ffd280');

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
            height: 0,
            material: Cesium.Color.fromCssColorString('#FF6B35').withAlpha(0.3), // Semi-transparent
            outline: false
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

        viewer.entities.add({
          name: 'AQO Hub Billboard',
          position: Cesium.Cartesian3.fromDegrees(initialLon, initialLat, 42),
          billboard: {
            image: createLabelImage('AQO Hub', '#FF6B35', 'Environmental Justice Map'),
            width: 240,
            height: 68,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            show: !backgroundMode
          }
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
      cleanupRef.current.forEach((cleanup) => cleanup());
      cleanupRef.current = [];
      stopOrbit();
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

      {!backgroundMode && isLoaded && !error && (
        <>
          <div style={{
            position: 'absolute',
            top: 20,
            right: 1,
            zIndex: 12,
            padding: '14px 16px',
            borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(5,9,18,0.76)',
            backdropFilter: 'blur(12px)',
            color: '#f1ead9',
            maxWidth: '320px'
          }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(226,212,176,0.55)' }}>
              Live Camera Mode
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, marginTop: '6px' }}>{activeSceneLabel}</div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '999px', background: 'rgba(255,107,53,0.16)', color: '#ffb08c' }}>
                {cameraMode}
              </span>
              <span style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '999px', background: 'rgba(91,170,255,0.16)', color: '#9ed0ff' }}>
                {cinematicMode ? 'cinematic on' : 'cinematic off'}
              </span>
            </div>
            <div style={{ fontSize: '11px', lineHeight: 1.5, marginTop: '10px', color: 'rgba(241,234,217,0.72)' }}>
              {tourDebug}
            </div>
          </div>

          <div style={{
            position: 'absolute',
            left: 20,
            bottom: 20,
            zIndex: 12,
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            padding: '12px',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(5,9,18,0.78)',
            backdropFilter: 'blur(12px)'
          }}>
            {[
              { label: 'Start Tour', onClick: startTour },
              { label: 'Orbit Plant', onClick: () => startOrbit(-75.15890, 40.01678, 'Orbiting SEPTA Midvale Plant') },
              { label: 'Reset', onClick: resetCamera },
              { label: cinematicMode ? 'Disable Cine' : 'Enable Cine', onClick: handleCinematicToggle }
            ].map((action) => (
              <button
                key={action.label}
                onClick={action.onClick}
                style={{
                  appearance: 'none',
                  border: '1px solid rgba(255,255,255,0.16)',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#f6efe0',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        </>
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
