import { NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/api';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const { session, error } = await requireAdminAccess();
  if (error) {
    return error;
  }

  const requests = await prisma.deleteRequest.findMany({
    where: session.user.role === 'ADMIN_ASSISTANT' ? { requestedById: session.user.id } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      requestedBy: {
        select: { id: true, email: true, name: true, role: true },
      },
      reviewedBy: {
        select: { id: true, email: true, name: true, role: true },
      },
    },
  });

  return NextResponse.json(requests);
}
