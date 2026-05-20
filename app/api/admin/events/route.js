import { NextResponse } from 'next/server';
import { requireAuthenticated, requireAdminAccess } from '@/lib/api';
import {
  canDirectDelete,
  DELETE_REQUEST_STATUS,
  logActivity,
  notifyRoles,
} from '@/lib/admin-system';
import { validateEventPayload } from '@/lib/content-service';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const { error } = await requireAdminAccess();
  if (error) {
    return error;
  }

  const items = await prisma.event.findMany({
    orderBy: [{ date: 'asc' }, { createdAt: 'desc' }],
  });
  return NextResponse.json(items);
}

export async function POST(request) {
  const { session, error } = await requireAdminAccess();
  if (error) {
    return error;
  }

  const payload = await request.json();
  const validation = validateEventPayload(payload);
  if (validation.error) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const event = await prisma.event.create({ data: validation.data });
  await logActivity({
    action: 'CREATE',
    entityType: 'EVENT',
    entityId: event.id,
    userId: session.user.id,
    details: { title: event.title },
  });

  return NextResponse.json(event, { status: 201 });
}

export async function DELETE(request) {
  const { session, error } = await requireAuthenticated();
  if (error) {
    return error;
  }

  const payload = await request.json();
  if (!payload?.id) {
    return NextResponse.json({ error: 'Missing event id' }, { status: 400 });
  }

  const event = await prisma.event.findUnique({ where: { id: payload.id } });
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  if (canDirectDelete(session.user.role)) {
    await prisma.event.delete({ where: { id: payload.id } });
    await logActivity({
      action: 'DELETE',
      entityType: 'EVENT',
      entityId: payload.id,
      userId: session.user.id,
      details: { title: event.title },
    });
    return NextResponse.json({ success: true });
  }

  const requestRecord = await prisma.deleteRequest.create({
    data: {
      entityType: 'EVENT',
      entityId: payload.id,
      entityLabel: event.title,
      requestedById: session.user.id,
      status: DELETE_REQUEST_STATUS.PENDING,
      reason: payload.reason?.trim() || null,
    },
  });

  await notifyRoles(
    ['ADMIN'],
    'DELETE_REQUEST_PENDING',
    'Event delete request pending',
    `Delete request for event "${event.title}" from ${session.user.email}.`,
    requestRecord.id
  );

  return NextResponse.json({ message: 'Delete request sent to admin' }, { status: 202 });
}
