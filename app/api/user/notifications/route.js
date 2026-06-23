import { NextResponse } from 'next/server';
import { requireAuthenticated } from '../../../../lib/api';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  const { session, error } = await requireAuthenticated();
  if (error) {
    return error;
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(notifications);
}
