import { NextResponse } from 'next/server';
import { requireAdminAccess } from '../../../../lib/api';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  const { session, error } = await requireAdminAccess();
  if (error) {
    return error;
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(notifications);
}
