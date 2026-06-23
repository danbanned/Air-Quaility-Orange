markdown
# AI Instructions: Read GeoJSON File for Street Data Integration

## Context

You need to read the `nicetown_roads.geojson` file that was exported from QGIS. This file contains all the road data for Nicetown, including street names, geometries (LineString/MultiLineString), and their coordinates.

---

## Where the GeoJSON Should Be Placed

The file should be in your Next.js project at:
/public/geojson/nicetown_roads.geojson

text

If the `geojson` folder doesn't exist, create it.

---

## How to Read the GeoJSON in the App

### Option 1: Server-Side (API Route)

Create `app/api/streets/route.js` to serve street names:

```javascript
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public/geojson/nicetown_roads.geojson');
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'GeoJSON file not found' }, { status: 404 });
    }
    
    const file = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(file);
    
    // Extract unique street names
    const streetNames = new Set();
    data.features.forEach(feature => {
      const name = feature.properties?.STREETNAME || feature.properties?.FULLNAME || feature.properties?.name;
      if (name) streetNames.add(name);
    });
    
    // Also return full GeoJSON for mapping
    return NextResponse.json({
      streetNames: Array.from(streetNames).sort(),
      featureCount: data.features.length
    });
  } catch (error) {
    console.error('Failed to load streets:', error);
    return NextResponse.json({ error: 'Failed to load streets' }, { status: 500 });
  }
}
Option 2: Client-Side (Direct Fetch)
In your component, fetch the GeoJSON directly:

javascript
// In a component
const loadRoads = async () => {
  try {
    const response = await fetch('/geojson/nicetown_roads.geojson');
    const data = await response.json();
    console.log('Roads loaded:', data.features.length);
    return data;
  } catch (error) {
    console.error('Failed to load GeoJSON:', error);
  }
};
Option 3: Import Directly (Static)
If you're using Webpack/Next.js, you can import the GeoJSON directly:

javascript
import nicetownRoads from '@/public/geojson/nicetown_roads.geojson';

// Access features
const features = nicetownRoads.features;
How to Read Street Data from the GeoJSON
The GeoJSON structure will look like:

json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "STREETNAME": "Roosevelt Blvd",
        "FULLNAME": "Roosevelt Boulevard",
        // ... other properties
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [-75.1555, 40.020608],
          [-75.1550, 40.020800],
          // ... more points
        ]
      }
    }
  ]
}
Example: Extract All Street Names
javascript
function getAllStreetNames(geojson) {
  const names = new Set();
  geojson.features.forEach(feature => {
    const name = feature.properties?.STREETNAME || 
                 feature.properties?.FULLNAME || 
                 feature.properties?.name;
    if (name) names.add(name);
  });
  return Array.from(names).sort();
}
Example: Get Coordinates for a Street
javascript
function getStreetCoordinates(geojson, streetName) {
  const features = geojson.features.filter(f => 
    f.properties?.STREETNAME === streetName || 
    f.properties?.FULLNAME === streetName
  );
  
  if (features.length === 0) return null;
  
  // Extract all coordinates
  let allCoords = [];
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
  
  return allCoords;
}
Example: Find Nearest Street to a Waypoint
javascript
function findNearestStreet(geojson, lat, lng) {
  let nearest = null;
  let minDist = Infinity;
  
  geojson.features.forEach(feature => {
    const coords = feature.geometry.coordinates;
    // Flatten coordinates
    let points = [];
    if (Array.isArray(coords[0])) {
      coords.forEach(line => line.forEach(c => points.push(c)));
    } else {
      coords.forEach(c => points.push(c));
    }
    
    // Find closest point on this street
    points.forEach(([lon, lat2]) => {
      const dist = Math.sqrt(
        Math.pow(lat - lat2, 2) + 
        Math.pow(lng - lon, 2)
      );
      if (dist < minDist) {
        minDist = dist;
        nearest = {
          name: feature.properties?.STREETNAME || feature.properties?.FULLNAME,
          coordinates: points,
          distance: dist
        };
      }
    });
  });
  
  return nearest;
}
Implementation Checklist
Task	File	Status
Place GeoJSON in /public/geojson/	nicetown_roads.geojson	✅
Create street name API	app/api/streets/route.js	To Do
Load GeoJSON in Cesium	CesiumMap.jsx	To Do
Extract street names for dropdown	app/voices/page.jsx	To Do
Map waypoints to streets	utils/roadMapper.js	To Do
Build camera trail	CinematicTour.js	To Do
How to Verify the GeoJSON is Loading
Open your browser's Network tab.

Navigate to the page that loads the GeoJSON.

Look for a request to /geojson/nicetown_roads.geojson.

Check the response – it should show the GeoJSON data.

Error Handling
If the GeoJSON fails to load:

Check the file path in public/geojson/.

Verify the file is valid JSON (use a JSON validator).

Check that the file has features array.

Log the error to debug.

javascript
try {
  const response = await fetch('/geojson/nicetown_roads.geojson');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  if (!data.features) {
    throw new Error('Invalid GeoJSON: missing features array');
  }
  // Use data
} catch (error) {
  console.error('GeoJSON load error:', error);
  // Use fallback or display error
}
Summary
Task	Method
Read street names	app/api/streets/route.js + fetch()
Get street coordinates	Parse GeoJSON features
Find nearest street	Iterate through features
Use in Cesium	Convert coordinates to Cartesian3
The GeoJSON now provides the bridge between street names (used by users) and geographic coordinates (used by Cesium).

text
