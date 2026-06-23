# AI Instructions: User Stories & Cinematic Trails Integration for AQO

## Overview

You are integrating user-generated stories into the AQO map and creating cinematic camera trails that follow streets. This combines existing functionality with new features.

---

## Context Files to Read

Before starting, read these files to understand the current architecture:

| File | Purpose |
|------|---------|
| `claude.md` | Overall project architecture and context |
| `docs/Geojsonfile-drilling.md` | Specific instructions for this geoJson |
| `app/components/CesiumMap.jsx` | Main map component |
| `app/components/CinematicTour.js` | Tour logic |
| `utils/mapUtils.js` | Data definitions (POLLUTION_SOURCES, COMMUNITY_SOLUTIONS, etc.) |
| `app/api/stories/route.js` | Existing stories API |
| `app/admin/stories/` | Admin story management |
| `app/voices/page.jsx` | User story submission page |

---

## Part 1: User Stories as Map Characters

### 1.1 Update the Story Schema

Modify the Prisma schema to include location data:

```prisma
model Story {
  id          String   @id @default(cuid())
  title       String
  personName  String
  community   String
  content     String
  audioUrl    String?
  imageUrl    String?
  category    String
  status      StoryStatus @default(PENDING)
  submittedBy User?      @relation(fields: [submittedById], references: [id])
  submittedById String?
  // NEW FIELDS
  streetName  String?   // The street name from the dropdown
  lat         Float?    // Latitude from geocoding
  lng         Float?    // Longitude from geocoding
  height      Float?    // Height from raycasting/terrain
  characterColor String? // Random color for character model
  modelUri    String?   // Path to character model
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

Run migration:

bash
npx prisma migrate dev --name add_story_locations
npx prisma generate
1.2 Street Name Dropdown for Story Submission
In app/voices/page.jsx, add a dropdown populated from the GeoJSON:

javascript
// Fetch street names from the loaded GeoJSON
// You'll need to expose this via an API endpoint or load it client-side
const streetNames = await fetch('/api/streets').then(r => r.json());

// In the form
<select name="streetName" required>
  <option value="">Select a location...</option>
  {streetNames.map(name => (
    <option key={name} value={name}>{name}</option>
  ))}
</select>
1.3 Create Street Name API
Create app/api/streets/route.js:

javascript
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public/geojson/nicetown_roads.geojson');
    const file = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(file);
    
    // Extract unique street names
    const streetNames = new Set();
    data.features.forEach(feature => {
      const name = feature.properties?.STREETNAME || feature.properties?.FULLNAME;
      if (name) streetNames.add(name);
    });
    
    return NextResponse.json(Array.from(streetNames).sort());
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load streets' }, { status: 500 });
  }
}
1.4 Geocode Street Names
When a user submits a story with a street name, we need to convert it to coordinates. Use the GeoJSON data to find the center point of that street.

In the story submission API (app/api/stories/route.js):

javascript
// After receiving the street name, find its coordinates
import geojsonData from '@/public/geojson/nicetown_roads.geojson';

function getStreetCoordinates(streetName) {
  const features = geojsonData.features.filter(f => 
    f.properties?.STREETNAME === streetName || 
    f.properties?.FULLNAME === streetName
  );
  
  if (features.length === 0) return null;
  
  // Average all coordinates for that street (or use first feature's center)
  const allCoords = [];
  features.forEach(f => {
    const coords = f.geometry.coordinates;
    if (coords) {
      if (Array.isArray(coords[0])) {
        // MultiLineString
        coords.forEach(line => line.forEach(c => allCoords.push(c)));
      } else {
        // LineString
        coords.forEach(c => allCoords.push(c));
      }
    }
  });
  
  if (allCoords.length === 0) return null;
  
  // Calculate center (average)
  const sumLon = allCoords.reduce((s, c) => s + c[0], 0);
  const sumLat = allCoords.reduce((s, c) => s + c[1], 0);
  
  return {
    lat: sumLat / allCoords.length,
    lng: sumLon / allCoords.length,
    height: 0 // will be updated via raycasting
  };
}
1.5 Random Colors for Characters
In the story model loading function (addUserStories):

javascript
function getRandomColor() {
  const colors = [
    '#FF6B35', '#FF4444', '#4CAF50', '#2196F3', '#9C27B0',
    '#FF9800', '#00BCD4', '#E91E63', '#8BC34A', '#FF5722',
    '#3F51B5', '#FF4081', '#7C4DFF', '#00E676', '#FFEA00'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// When adding a story character:
const color = story.characterColor || getRandomColor();
1.6 Load User Stories as Characters
In CesiumMap.jsx, add a function to load approved stories as characters:

javascript
const loadUserStories = async (viewer, Cesium) => {
  try {
    const res = await fetch('/api/stories?status=APPROVED');
    const stories = await res.json();
    
    for (const story of stories) {
      if (!story.lat || !story.lng) continue;
      
      const position = Cesium.Cartesian3.fromDegrees(story.lng, story.lat);
      
      // Add character model
      viewer.entities.add({
        id: `story-character-${story.id}`,
        name: story.personName,
        position: position,
        model: {
          uri: story.modelUri || '/models/characters/CharacterBase.glb',
          scale: 1.5,
          minimumPixelSize: 32,
          heightReference: Cesium.HeightReference.CLAMP_TO_3D_TILE,
          color: Cesium.Color.fromCssColorString(story.characterColor || '#FF6B35'),
        },
        description: `
          <div style="padding: 12px; max-width: 280px;">
            <h3 style="color: #FF6B35;">${story.personName}</h3>
            <p><strong>Location:</strong> ${story.streetName}</p>
            <p>${story.content}</p>
          </div>
        `,
        properties: new Cesium.PropertyBag({
          narrativeRole: 'user-story',
          storyId: story.id,
          personName: story.personName,
          streetName: story.streetName,
        }),
      });
    }
  } catch (error) {
    console.error('Failed to load user stories:', error);
  }
};
1.7 "Visit User Stories" Button
Add a button in the UI controls to toggle user story visibility or create a separate tour:

javascript
const showUserStories = () => {
  // Zoom to user story locations
  const storyEntities = viewer.entities.values.filter(e => 
    e.properties?.narrativeRole?.getValue() === 'user-story'
  );
  
  // Fly to first story or show all
};
Add the button in the map UI:

jsx
<button onClick={showUserStories}>
  📍 Visit User Stories
</button>
Part 2: Cinematic Trails Along Streets
2.1 Create the Road Path Mapper
Create utils/roadMapper.js:

javascript
import geojsonData from '@/public/geojson/nicetown_roads.geojson';
import { POLLUTION_SOURCES, COMMUNITY_SOLUTIONS, HEAT_ISLAND_ZONES } from './mapUtils';

export function mapWaypointsToStreets() {
  const waypoints = [
    ...POLLUTION_SOURCES,
    ...COMMUNITY_SOLUTIONS,
    ...HEAT_ISLAND_ZONES
  ];
  
  const results = [];
  
  for (const waypoint of waypoints) {
    const { lat, lng } = waypoint.coordinates || waypoint;
    // Find the nearest street to this waypoint
    let nearestStreet = null;
    let minDistance = Infinity;
    
    for (const feature of geojsonData.features) {
      const coords = feature.geometry.coordinates;
      // Calculate distance from waypoint to street center
      // Use a simple bounding box check or more precise algorithm
      const distance = calculateDistance(lat, lng, coords);
      if (distance < minDistance) {
        minDistance = distance;
        nearestStreet = {
          name: feature.properties?.STREETNAME || feature.properties?.FULLNAME,
          coordinates: coords,
        };
      }
    }
    
    if (nearestStreet) {
      results.push({
        waypointName: waypoint.name,
        streetName: nearestStreet.name,
        coordinates: nearestStreet.coordinates,
        waypointCoords: { lat, lng }
      });
    }
  }
  
  return results;
}

function calculateDistance(lat, lng, coordinates) {
  // Simple approximation using the first point
  if (!coordinates || coordinates.length === 0) return Infinity;
  const first = Array.isArray(coordinates[0]) ? coordinates[0] : coordinates;
  return Math.sqrt(
    Math.pow(lat - first[1], 2) + 
    Math.pow(lng - first[0], 2)
  );
}
2.2 Build the Camera Trail
In CinematicTour.js, create a function that builds the trail from mapped streets:

javascript
import { mapWaypointsToStreets } from '@/utils/roadMapper';

function buildTrailFromWaypoints() {
  const mapped = mapWaypointsToStreets();
  let allPositions = [];
  
  for (const item of mapped) {
    const coords = item.coordinates;
    // Convert GeoJSON coords to Cesium Cartesian
    if (Array.isArray(coords) && coords.length > 0) {
      // Handle LineString or MultiLineString
      if (Array.isArray(coords[0])) {
        // MultiLineString
        for (const line of coords) {
          const positions = line.map(c => 
            Cesium.Cartesian3.fromDegrees(c[0], c[1], 10)
          );
          allPositions = allPositions.concat(positions);
        }
      } else {
        // LineString
        const positions = coords.map(c => 
          Cesium.Cartesian3.fromDegrees(c[0], c[1], 10)
        );
        allPositions = allPositions.concat(positions);
      }
    }
  }
  
  return allPositions;
}
2.3 Ensure Camera Faces Forward
When tracking the camera, use lookAt with a heading that always faces the direction of travel:

javascript
function startCameraFollowWithHeading(pathPositions) {
  const startTime = Cesium.JulianDate.now();
  const duration = 60;
  
  const positionProperty = new Cesium.SampledPositionProperty();
  const headingProperty = new Cesium.SampledProperty(Cesium.Quaternion);
  
  for (let i = 0; i < pathPositions.length; i++) {
    const time = Cesium.JulianDate.addSeconds(startTime, (i / pathPositions.length) * duration, new Cesium.JulianDate());
    positionProperty.addSample(time, pathPositions[i]);
    
    // Calculate heading based on direction of travel
    if (i < pathPositions.length - 1) {
      const nextPos = pathPositions[i + 1];
      const pos = pathPositions[i];
      
      // Calculate direction vector
      const dir = new Cesium.Cartesian3(
        nextPos.x - pos.x,
        nextPos.y - pos.y,
        nextPos.z - pos.z
      );
      Cesium.Cartesian3.normalize(dir, dir);
      
      // Convert direction to heading
      const heading = Math.atan2(dir.x, dir.y);
      const quaternion = Cesium.Quaternion.fromHeadingPitchRoll(
        new Cesium.HeadingPitchRoll(heading, 0, 0)
      );
      headingProperty.addSample(time, quaternion);
    }
  }
  
  const entity = viewer.entities.add({
    position: positionProperty,
    orientation: headingProperty,
    model: {
      uri: '/models/dummy.glb',
      show: false
    }
  });
  
  viewer.trackedEntity = entity;
  
  // Optional: Add camera offset
  viewer.camera.lookAt(
    entity.position.getValue(startTime),
    new Cesium.Cartesian3(-20, -10, 15)
  );
}
2.4 Get Accurate Height with Raycasting
To keep the camera at the right height (following terrain), use Cesium's raycasting:

javascript
function getGroundHeight(viewer, position, Cesium) {
  // Create a ray from the camera to the ground
  const ray = new Cesium.Ray(
    position, 
    new Cesium.Cartesian3(0, 0, -1)
  );
  
  // Intersect with the globe
  const result = viewer.scene.globe.pick(ray, viewer.scene);
  if (result) {
    const carto = Cesium.Cartographic.fromCartesian(result);
    return carto.height;
  }
  return 0;
}

// In the animation loop or when adding positions
function adjustPositionsWithHeight(viewer, positions, Cesium) {
  return positions.map(pos => {
    const height = getGroundHeight(viewer, pos, Cesium);
    const carto = Cesium.Cartographic.fromCartesian(pos);
    return Cesium.Cartesian3.fromDegrees(
      Cesium.Math.toDegrees(carto.longitude),
      Cesium.Math.toDegrees(carto.latitude),
      height + 2 // Add 2 meters to float above ground
    );
  });
}
2.5 Keep Camera at Consistent Height
To prevent the camera from dipping below terrain, use the minimumZoomDistance and a constant height offset:

javascript
// In the viewer initialization
const cameraCtrl = viewer.scene.screenSpaceCameraController;
cameraCtrl.minimumZoomDistance = 3; // Prevent getting too close

// When following the path, keep the camera at a fixed height offset
const cameraOffset = new Cesium.Cartesian3(-15, -10, 5); // x, y, z offset
viewer.camera.lookAt(
  entity.position.getValue(startTime),
  cameraOffset
);
2.6 Integrate with Existing Cinematic Tour
In CinematicTour.js, replace the waypoint-based tour with the road trail:

javascript
const trailPositions = buildTrailFromWaypoints();

// Instead of using TOUR_WAYPOINTS, use the trail
if (trailPositions.length > 0) {
  startCameraFollowWithHeading(trailPositions);
}
Summary Checklist
Task	File	Status
Update Prisma schema	prisma/schema.prisma	To Do
Create street name API	app/api/streets/route.js	To Do
Update story submission form	app/voices/page.jsx	To Do
Update story API	app/api/stories/route.js	To Do
Load user stories as characters	CesiumMap.jsx	To Do
Create road mapper	utils/roadMapper.js	To Do
Build camera trail	CinematicTour.js	To Do
Add "Visit User Stories" button	CesiumMap.jsx	To Do
Implement raycasting for height	CesiumMap.jsx	To Do
Random colors for models	CesiumMap.jsx	To Do
Dependencies & Environment Variables
Make sure your .env.local contains:

env
NEXT_PUBLIC_CESIUM_TOKEN=your_cesium_token
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_key
Testing Instructions
Submit a story with a street name

Verify the story appears as a character model at the correct location

Start the cinematic tour and verify the camera follows the mapped streets

Click the "Visit User Stories" button and verify the camera zooms to story locations