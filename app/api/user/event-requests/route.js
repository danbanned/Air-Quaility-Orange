import { NextResponse } from 'next/server';
import { requireAuthenticated } from '@/lib/api';
import { createNotification, logActivity, notifyRoles } from '@/lib/admin-system';
import { validateEventRequestPayload } from '@/lib/content-service';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  const { session, error } = await requireAuthenticated();
  if (error) {
    return error;
  }

  const payload = await request.json();
  const validation = validateEventRequestPayload(payload);
  if (validation.error) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const item = await prisma.eventRequest.create({
    data: {
      ...validation.data,
      userId: session.user.id,
    },
  });

  await notifyRoles(
    ['ADMIN'],
    'EVENT_REQUEST_PENDING',
    'New event request',
    `New event request from ${validation.data.requesterName}: ${validation.data.title}`,
    item.id
  );

  await createNotification(
    session.user.id,
    'REQUEST_PENDING',
    'Your event request was submitted',
    `Your event request "${item.title}" is pending review.`,
    item.id
  );

  await logActivity({
    action: 'CREATE',
    entityType: 'EVENT_REQUEST',
    entityId: item.id,
    userId: session.user.id,
    details: { title: item.title },
  });

  return NextResponse.json(item, { status: 201 });
}
