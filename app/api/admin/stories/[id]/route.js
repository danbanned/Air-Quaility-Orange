import { NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/api';
import { logActivity } from '@/lib/admin-system';
import { updateStory, validateStoryPayload } from '@/lib/story-service';

export async function PUT(request, { params }) {
  const { id } = await params;
  const { session, error } = await requireAdminAccess();
  if (error) {
    return error;
  }

  const payload = await request.json();
  const validation = validateStoryPayload(payload);

  if (validation.error) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const story = await updateStory(id, validation.data);
  await logActivity({
    action: 'UPDATE',
    entityType: 'STORY',
    entityId: story.id,
    userId: session.user.id,
    details: { title: story.title },
  });

  return NextResponse.json(story);
}
