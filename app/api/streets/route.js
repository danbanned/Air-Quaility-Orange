import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function getStreetCenter(features, streetName) {
  const matched = features.filter(
    (f) =>
      f.properties?.stname === streetName ||
      f.properties?.STREETNAME === streetName ||
      f.properties?.FULLNAME === streetName
  );
  if (matched.length === 0) return null;

  const allCoords = [];
  matched.forEach((f) => {
    const coords = f.geometry?.coordinates;
    if (!coords) return;
    if (f.geometry.type === 'MultiLineString') {
      coords.forEach((line) => line.forEach((c) => allCoords.push(c)));
    } else {
      coords.forEach((c) => allCoords.push(c));
    }
  });

  if (allCoords.length === 0) return null;
  const sumLon = allCoords.reduce((s, c) => s + c[0], 0);
  const sumLat = allCoords.reduce((s, c) => s + c[1], 0);
  return { lat: sumLat / allCoords.length, lng: sumLon / allCoords.length };
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public/geojson/nicetown_roads.geojson');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json([], { status: 200 });
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const nameSet = new Set();
    data.features.forEach((f) => {
      const name = f.properties?.stname || f.properties?.STREETNAME || f.properties?.FULLNAME;
      if (name) nameSet.add(name);
    });

    const streets = Array.from(nameSet)
      .sort()
      .map((name) => ({ name, center: getStreetCenter(data.features, name) }));

    return NextResponse.json(streets);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
