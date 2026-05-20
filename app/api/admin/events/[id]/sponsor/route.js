import { NextResponse } from 'next/server';
import { requireTrueAdmin } from '@/lib/api';
import { createNotification, logActivity } from '@/lib/admin-system';
import { prisma } from '@/lib/prisma';

export async function POST(_request, { params }) {
  const { id } = await params;
  const { session, error } = await requireTrueAdmin();
  if (error) {
    return error;
  }

  const event = await prisma.event.update({
    where: { id },
    data: { isSponsored: true },
  });

  const matchingRequests = await prisma.eventRequest.findMany({
    where: { title: event.title },
    select: { userId: true },
  });

  await Promise.all(
    matchingRequests
      .filter((requestItem) => requestItem.userId)
      .map((requestItem) =>
        createNotification(
          requestItem.userId,
          'EVENT_SPONSORED',
          'Your event was sponsored',
          `Your event "${event.title}" has been sponsored by AQO!`,
          event.id
        )
      )
  );

  await logActivity({
    action: 'SPONSOR',
    entityType: 'EVENT',
    entityId: event.id,
    userId: session.user.id,
    details: { title: event.title },
  });

  return NextResponse.json(event);
}
