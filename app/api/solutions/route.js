import { NextResponse } from 'next/server';
import { listSolutions } from '@/lib/content-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const items = await listSolutions();
  return NextResponse.json(items);
}
