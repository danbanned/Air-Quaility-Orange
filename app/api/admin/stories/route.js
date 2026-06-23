import { NextResponse } from 'next/server';
import { requireAdminAccess, requireAuthenticated, requireTrueAdmin } from '../../../../lib/api';
import {
  canDirectDelete,
  createNotification,
  DELETE_REQUEST_STATUS,
  logActivity,
  notifyRoles,
  shouldAutoApproveStory,
} from '../../../../lib/admin-system';
import { ROLE } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import {
  createStorySubmission,
  deleteStory,
  listStories,
  validateStoryPayload,
} from '../../../../lib/story-service';

export async function GET() {
  const { error } = await requireAdminAccess();
  if (error) {
    return error;
  }

  const stories = await listStories();
  return NextResponse.json(stories);
}

export async function POST(request) {
  const { session, error } = await requireAdminAccess();
  if (error) {
    return error;
  }

  const payload = await request.json();
  const validation = validateStoryPayload(payload);

  if (validation.error) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const story = await createStorySubmission({
    userId: session.user.id,
    storyData: validation.data,
    autoApprove: shouldAutoApproveStory(session.user.role),
  });

  await logActivity({
    action: 'CREATE',
    entityType: 'STORY',
    entityId: story.id,
    userId: session.user.id,
    details: { status: story.status, title: story.title },
  });

  return NextResponse.json(story, { status: 201 });
}

export async function DELETE(request) {
  const { session, error } = await requireAuthenticated();
  if (error) {
    return error;
  }

  if (![ROLE.ADMIN, ROLE.ADMIN_ASSISTANT].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const payload = await request.json();

  if (!payload?.id) {
    return NextResponse.json({ error: 'Missing story id' }, { status: 400 });
  }

  const story = await prisma.story.findUnique({ where: { id: payload.id } });
  if (!story) {
    return NextResponse.json({ error: 'Story not found' }, { status: 404 });
  }

  if (canDirectDelete(session.user.role)) {
    await deleteStory(payload.id);
    await logActivity({
      action: 'DELETE',
      entityType: 'STORY',
      entityId: payload.id,
      userId: session.user.id,
      details: { title: story.title },
    });

    return NextResponse.json({ success: true });
  }

  const deleteRequest = await prisma.deleteRequest.create({
    data: {
      entityType: 'STORY',
      entityId: payload.id,
      entityLabel: story.title,
      requestedById: session.user.id,
      status: DELETE_REQUEST_STATUS.PENDING,
      reason: payload.reason?.trim() || null,
    },
  });

  await notifyRoles(
    [ROLE.ADMIN],
    'DELETE_REQUEST_PENDING',
    'Story delete request pending',
    `Delete request for story "${story.title}" from ${session.user.email}.`,
    deleteRequest.id
  );

  await logActivity({
    action: 'REQUEST_APPROVAL',
    entityType: 'STORY',
    entityId: payload.id,
    userId: session.user.id,
    details: { deleteRequestId: deleteRequest.id, title: story.title },
  });

  return NextResponse.json({ message: 'Delete request sent to admin' }, { status: 202 });
}
