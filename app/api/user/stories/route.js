import { NextResponse } from 'next/server';
import { requireAuthenticated } from '@/lib/api';
import {
  createNotification,
  logActivity,
  notifyRoles,
  shouldAutoApproveStory,
} from '@/lib/admin-system';
import { createStorySubmission, validateStoryPayload } from '@/lib/story-service';

export async function POST(request) {
  const { session, error } = await requireAuthenticated();
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

  if (story.status === 'PENDING') {
    await notifyRoles(
      ['ADMIN', 'ADMIN_ASSISTANT'],
      'REQUEST_PENDING',
      'New story pending approval',
      `New story pending approval from ${session.user.email}.`,
      story.id
    );
  } else {
    await createNotification(
      session.user.id,
      'STORY_APPROVED',
      'Your story was published',
      `Your story "${story.title}" was published immediately.`,
      story.id
    );
  }

  await logActivity({
    action: 'CREATE',
    entityType: 'STORY',
    entityId: story.id,
    userId: session.user.id,
    details: { title: story.title, status: story.status },
  });

  return NextResponse.json(story, { status: 201 });
}
