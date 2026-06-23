import { NextResponse } from 'next/server';
import { geocodeAddress } from '../../../lib/services/geocoding';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address?.trim()) {
    return NextResponse.json({ error: 'Address is required.' }, { status: 400 });
  }

  try {
    const result = await geocodeAddress(address);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
