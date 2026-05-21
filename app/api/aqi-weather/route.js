import { NextResponse } from 'next/server';
import { getEnvironmentSnapshot } from '@/lib/services/environment';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get('lat') || 40.01999);
  const lon = Number(searchParams.get('lon') || -75.1554);

  try {
    const snapshot = await getEnvironmentSnapshot(lat, lon);
    return NextResponse.json(snapshot);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
