import { NextResponse } from 'next/server';
import { getHomePageContent } from '@/lib/admin-system';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await getHomePageContent();
  return NextResponse.json(data);
}
