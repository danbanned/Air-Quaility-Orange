import { NextResponse } from 'next/server';
import { requireAdminAccess } from '../../../../lib/api';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  const { session, error } = await requireAdminAccess();
  if (error) {
    return error;
  }

  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { id: true, email: true, name: true, role: true },
      },
    },
    take: session.user.role === 'ADMIN_ASSISTANT' ? 50 : 100,
  });

  return NextResponse.json(logs);
}
