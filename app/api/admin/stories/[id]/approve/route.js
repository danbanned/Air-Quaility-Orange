import { NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/api';
import { createNotification, logActivity } from '@/lib/admin-system';
import { approveStory } from '@/lib/story-service';

export async function POST(request, { params }) {
  const { id } = await params;
  const { session, error } = await requireAdminAccess();
  if (error) {
    return error;
  }

  const payload = await request.json().catch(() => ({}));
  const story = await approveStory(id, payload?.adminNotes?.trim() || null);

  if (story.submittedById) {
    await createNotification(
      story.submittedById,
      'STORY_APPROVED',
      'Your story was approved',
      `Your story "${story.title}" has been approved.`,
      story.id
    );
  }

  await logActivity({
    action: 'APPROVE',
    entityType: 'STORY',
    entityId: story.id,
    userId: session.user.id,
    details: { title: story.title },
  });

  return NextResponse.json(story);
}
