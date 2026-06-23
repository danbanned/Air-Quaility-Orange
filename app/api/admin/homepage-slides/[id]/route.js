import { NextResponse } from 'next/server';
import { requireTrueAdmin } from '../../../../../lib/api';
import { prisma } from '../../../../../lib/prisma';
import { validateHeroSlidePayload } from '../../../../../lib/hero-slide-service';

export async function PUT(request, { params }) {
  const { id } = await params;
  const { error } = await requireTrueAdmin();
  if (error) {
    return error;
  }

  const payload = await request.json();
  const validation = validateHeroSlidePayload(payload);
  if (validation.error) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const slide = await prisma.heroSlide.update({
    where: { id },
    data: validation.data,
  });

  return NextResponse.json(slide);
}
