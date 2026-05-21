import { NextResponse } from 'next/server';
import { getJsonBody, requireAdminAccess } from '@/lib/api';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const locations = await prisma.location.findMany({
    where: { isActive: true },
    orderBy: [{ type: 'asc' }, { updatedAt: 'desc' }],
  });

  return NextResponse.json(locations);
}

export async function POST(request) {
  const { error } = await requireAdminAccess();
  if (error) {
    return error;
  }

  const payload = await getJsonBody(request);
  if (!payload?.name || !payload?.address || payload?.lat == null || payload?.lng == null || !payload?.type) {
    return NextResponse.json({ error: 'Missing required location fields.' }, { status: 400 });
  }

  const location = await prisma.location.create({
    data: {
      name: payload.name.trim(),
      address: payload.address.trim(),
      lat: Number(payload.lat),
      lng: Number(payload.lng),
      type: payload.type.trim(),
      isActive: payload.isActive !== false,
    },
  });

  return NextResponse.json(location, { status: 201 });
}
