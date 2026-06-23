import { NextResponse } from 'next/server';
import { getSiteConfig } from '../../../lib/admin-system';

export async function GET() {
  const data = await getSiteConfig();
  return NextResponse.json(data);
}
