import { NextResponse } from 'next/server';
import { requireAuthenticated, requireAdminAccess } from '@/lib/api';
import {
  canDirectDelete,
  DELETE_REQUEST_STATUS,
  logActivity,
  notifyRoles,
} from '@/lib/admin-system';
import { validateOpportunityPayload } from '@/lib/content-service';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const { error } = await requireAdminAccess();
  if (error) {
    return error;
  }

  const items = await prisma.opportunity.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      interests: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  return NextResponse.json(items);
}

export async function POST(request) {
  const { session, error } = await requireAdminAccess();
  if (error) {
    return error;
  }

  const payload = await request.json();
  const validation = validateOpportunityPayload(payload);
  if (validation.error) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const item = await prisma.opportunity.create({ data: validation.data });
  await logActivity({
    action: 'CREATE',
    entityType: 'OPPORTUNITY',
    entityId: item.id,
    userId: session.user.id,
    details: { title: item.title },
  });

  return NextResponse.json(item, { status: 201 });
}

export async function DELETE(request) {
  const { session, error } = await requireAuthenticated();
  if (error) {
    return error;
  }

  const payload = await request.json();
  if (!payload?.id) {
    return NextResponse.json({ error: 'Missing opportunity id' }, { status: 400 });
  }

  const item = await prisma.opportunity.findUnique({ where: { id: payload.id } });
  if (!item) {
    return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
  }

  if (canDirectDelete(session.user.role)) {
    await prisma.opportunity.delete({ where: { id: payload.id } });
    await logActivity({
      action: 'DELETE',
      entityType: 'OPPORTUNITY',
      entityId: payload.id,
      userId: session.user.id,
      details: { title: item.title },
    });
    return NextResponse.json({ success: true });
  }

  const requestRecord = await prisma.deleteRequest.create({
    data: {
      entityType: 'OPPORTUNITY',
      entityId: payload.id,
      entityLabel: item.title,
      requestedById: session.user.id,
      status: DELETE_REQUEST_STATUS.PENDING,
      reason: payload.reason?.trim() || null,
    },
  });

  await notifyRoles(
    ['ADMIN'],
    'DELETE_REQUEST_PENDING',
    'Opportunity delete request pending',
    `Delete request for opportunity "${item.title}" from ${session.user.email}.`,
    requestRecord.id
  );

  return NextResponse.json({ message: 'Delete request sent to admin' }, { status: 202 });
}
