import { NextResponse } from 'next/server';
import { requireTrueAdmin } from '@/lib/api';
import {
  createNotification,
  DELETE_REQUEST_STATUS,
  getDeleteEntityConfig,
  logActivity,
} from '@/lib/admin-system';
import { prisma } from '@/lib/prisma';

export async function PUT(request, { params }) {
  const { id } = await params;
  const { session, error } = await requireTrueAdmin();
  if (error) {
    return error;
  }

  const payload = await request.json().catch(() => ({}));
  const status = payload?.status;

  if (![DELETE_REQUEST_STATUS.APPROVED, DELETE_REQUEST_STATUS.DENIED].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const deleteRequest = await prisma.deleteRequest.findUnique({
    where: { id },
  });

  if (!deleteRequest) {
    return NextResponse.json({ error: 'Delete request not found' }, { status: 404 });
  }

  const config = getDeleteEntityConfig(deleteRequest.entityType);
  if (!config) {
    return NextResponse.json({ error: 'Unsupported entity type' }, { status: 400 });
  }

  if (status === DELETE_REQUEST_STATUS.APPROVED) {
    try {
      await config.model.delete({ where: { id: deleteRequest.entityId } });
    } catch {
      return NextResponse.json({ error: 'Unable to delete entity' }, { status: 400 });
    }
  }

  const updated = await prisma.deleteRequest.update({
    where: { id },
    data: {
      status,
      reviewNotes: payload?.reviewNotes?.trim() || null,
      reviewedById: session.user.id,
    },
  });

  await createNotification(
    deleteRequest.requestedById,
    'DELETE_REQUEST_REVIEWED',
    'Delete request reviewed',
    `Your delete request for ${deleteRequest.entityType.toLowerCase()} "${deleteRequest.entityLabel || deleteRequest.entityId}" was ${status.toLowerCase()}.`,
    updated.id
  );

  await logActivity({
    action: status === DELETE_REQUEST_STATUS.APPROVED ? 'DELETE' : 'REJECT',
    entityType: deleteRequest.entityType,
    entityId: deleteRequest.entityId,
    userId: session.user.id,
    details: {
      deleteRequestId: updated.id,
      reviewNotes: updated.reviewNotes,
    },
  });

  return NextResponse.json(updated);
}
