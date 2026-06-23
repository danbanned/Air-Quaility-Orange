import { NextResponse } from 'next/server';
import { listOpportunities } from '../../../lib/content-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const items = await listOpportunities();
  return NextResponse.json(items);
}
