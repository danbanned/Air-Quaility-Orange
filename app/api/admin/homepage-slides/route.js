import { requireTrueAdmin } from '../../../../lib/api';
import { NextResponse } from 'next/server';
import {
  createHeroSlide,
  deleteHeroSlide,
  listHeroSlides,
  validateHeroSlidePayload,
} from '../../../../lib/hero-slide-service';

export async function GET() {
  const { error } = await requireTrueAdmin();
  if (error) {
    return error;
  }

  const slides = await listHeroSlides(true);
  return NextResponse.json(slides);
}

export async function POST(request) {
  const { error } = await requireTrueAdmin();
  if (error) {
    return error;
  }

  const payload = await request.json();
  const validation = validateHeroSlidePayload(payload);

  if (validation.error) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const slide = await createHeroSlide(validation.data);
  return NextResponse.json(slide, { status: 201 });
}

export async function DELETE(request) {
  const { error } = await requireTrueAdmin();
  if (error) {
    return error;
  }

  const payload = await request.json();

  if (!payload?.id) {
    return NextResponse.json({ error: 'Missing slide id' }, { status: 400 });
  }

  await deleteHeroSlide(payload.id);
  return NextResponse.json({ success: true });
}
