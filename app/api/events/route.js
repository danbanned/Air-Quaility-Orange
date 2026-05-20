import { NextResponse } from 'next/server';
import { listEvents } from '@/lib/content-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const items = await listEvents(false);
  return NextResponse.json(items);
}
