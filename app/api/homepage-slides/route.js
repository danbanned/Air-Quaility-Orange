import { NextResponse } from 'next/server';
import { listHeroSlides } from '@/lib/hero-slide-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const slides = await listHeroSlides(false);
  return NextResponse.json(slides);
}
