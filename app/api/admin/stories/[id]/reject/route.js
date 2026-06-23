import { NextResponse } from 'next/server';
import { requireAdminAccess } from '../../../../../../lib/api';
import { createNotification, logActivity } from '../../../../../../lib/admin-system';
import { rejectStory } from '../../../../../../lib/story-service';

export async function POST(request, { params }) {
  const { id } = await params;
  const { session, error } = await requireAdminAccess();
  if (error) {
    return error;
  }

  const payload = await request.json().catch(() => ({}));
  const adminNotes = payload?.adminNotes?.trim();

  if (!adminNotes) {
    return NextResponse.json({ error: 'adminNotes is required' }, { status: 400 });
  }

  const story = await rejectStory(id, adminNotes);

  if (story.submittedById) {
    await createNotification(
      story.submittedById,
      'STORY_REJECTED',
      'Your story was not approved',
      `Your story "${story.title}" was not approved. Reason: ${adminNotes}`,
      story.id
    );
  }

  await logActivity({
    action: 'REJECT',
    entityType: 'STORY',
    entityId: story.id,
    userId: session.user.id,
    details: { title: story.title, adminNotes },
  });

  return NextResponse.json(story);
}
