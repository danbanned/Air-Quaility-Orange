import { NextResponse } from 'next/server';
import { requireAuthenticated, requireAdminAccess } from '@/lib/api';
import {
  canDirectDelete,
  DELETE_REQUEST_STATUS,
  logActivity,
  notifyRoles,
} from '@/lib/admin-system';
import { validateSolutionPayload } from '@/lib/content-service';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const { error } = await requireAdminAccess();
  if (error) {
    return error;
  }

  const items = await prisma.solution.findMany({ orderBy: { updatedAt: 'desc' } });
  return NextResponse.json(items);
}

export async function POST(request) {
  const { session, error } = await requireAdminAccess();
  if (error) {
    return error;
  }

  const payload = await request.json();
  const validation = validateSolutionPayload(payload);
  if (validation.error) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const solution = await prisma.solution.create({ data: validation.data });
  await logActivity({
    action: 'CREATE',
    entityType: 'SOLUTION',
    entityId: solution.id,
    userId: session.user.id,
    details: { title: solution.title },
  });

  return NextResponse.json(solution, { status: 201 });
}

export async function DELETE(request) {
  const { session, error } = await requireAuthenticated();
  if (error) {
    return error;
  }

  const payload = await request.json();
  if (!payload?.id) {
    return NextResponse.json({ error: 'Missing solution id' }, { status: 400 });
  }

  const solution = await prisma.solution.findUnique({ where: { id: payload.id } });
  if (!solution) {
    return NextResponse.json({ error: 'Solution not found' }, { status: 404 });
  }

  if (canDirectDelete(session.user.role)) {
    await prisma.solution.delete({ where: { id: payload.id } });
    await logActivity({
      action: 'DELETE',
      entityType: 'SOLUTION',
      entityId: payload.id,
      userId: session.user.id,
      details: { title: solution.title },
    });
    return NextResponse.json({ success: true });
  }

  const requestRecord = await prisma.deleteRequest.create({
    data: {
      entityType: 'SOLUTION',
      entityId: payload.id,
      entityLabel: solution.title,
      requestedById: session.user.id,
      status: DELETE_REQUEST_STATUS.PENDING,
      reason: payload.reason?.trim() || null,
    },
  });

  await notifyRoles(
    ['ADMIN'],
    'DELETE_REQUEST_PENDING',
    'Solution delete request pending',
    `Delete request for solution "${solution.title}" from ${session.user.email}.`,
    requestRecord.id
  );

  return NextResponse.json({ message: 'Delete request sent to admin' }, { status: 202 });
}
