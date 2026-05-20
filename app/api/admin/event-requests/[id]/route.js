import { NextResponse } from 'next/server';
import { requireTrueAdmin } from '@/lib/api';
import {
  createNotification,
  EVENT_REQUEST_STATUS,
  logActivity,
} from '@/lib/admin-system';
import { validateEventRequestDecisionPayload } from '@/lib/content-service';
import { prisma } from '@/lib/prisma';

export async function PUT(request, { params }) {
  const { id } = await params;
  const { session, error } = await requireTrueAdmin();
  if (error) {
    return error;
  }

  const payload = await request.json();
  const validation = validateEventRequestDecisionPayload(payload);
  if (validation.error) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const updated = await prisma.eventRequest.update({
    where: { id },
    data: validation.data,
  });

  if (updated.userId) {
    await createNotification(
      updated.userId,
      'EVENT_REQUEST_UPDATED',
      'Your event request was updated',
      `Your event request "${updated.title}" is now ${updated.status.toLowerCase().replaceAll('_', ' ')}.`,
      updated.id
    );
  }

  await logActivity({
    action: updated.status === EVENT_REQUEST_STATUS.REJECTED ? 'REJECT' : 'APPROVE',
    entityType: 'EVENT_REQUEST',
    entityId: updated.id,
    userId: session.user.id,
    details: { title: updated.title, status: updated.status },
  });

  return NextResponse.json(updated);
}
