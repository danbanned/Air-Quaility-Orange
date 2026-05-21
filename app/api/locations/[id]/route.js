import { NextResponse } from 'next/server';
import { getJsonBody, requireAdminAccess } from '@/lib/api';
import { prisma } from '@/lib/prisma';

export async function GET(_request, { params }) {
  const location = await prisma.location.findUnique({ where: { id: params.id } });
  if (!location) {
    return NextResponse.json({ error: 'Location not found.' }, { status: 404 });
  }

  return NextResponse.json(location);
}

export async function PUT(request, { params }) {
  const { error } = await requireAdminAccess();
  if (error) {
    return error;
  }

  const payload = await getJsonBody(request);
  const existing = await prisma.location.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: 'Location not found.' }, { status: 404 });
  }

  const updated = await prisma.location.update({
    where: { id: params.id },
    data: {
      name: payload?.name?.trim() ?? existing.name,
      address: payload?.address?.trim() ?? existing.address,
      lat: payload?.lat != null ? Number(payload.lat) : existing.lat,
      lng: payload?.lng != null ? Number(payload.lng) : existing.lng,
      type: payload?.type?.trim() ?? existing.type,
      isActive: typeof payload?.isActive === 'boolean' ? payload.isActive : existing.isActive,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request, { params }) {
  const { error } = await requireAdminAccess();
  if (error) {
    return error;
  }

  const existing = await prisma.location.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: 'Location not found.' }, { status: 404 });
  }

  await prisma.location.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
