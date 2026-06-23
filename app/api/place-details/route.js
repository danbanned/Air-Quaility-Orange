import { NextResponse } from 'next/server';
import { getPlaceDetailsByName } from '../../../lib/services/places';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Place name is required.' }, { status: 400 });
  }

  try {
    const result = await getPlaceDetailsByName(name);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
