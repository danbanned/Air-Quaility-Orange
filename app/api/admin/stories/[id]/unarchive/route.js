import { NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/api';
import { unarchiveStory, getStoryById } from '@/lib/story-service';
import { logActivity } from '@/lib/admin-system';

export async function POST(_request, { params }) {
  const { id } = await params;
  const { session, error } = await requireAdminAccess();
  if (error) {
    return error;
  }

  const story = await getStoryById(id);
  if (!story) {
    return NextResponse.json({ error: 'Story not found' }, { status: 404 });
  }

  const unarchived = await unarchiveStory(id);

  await logActivity({
    action: 'UNARCHIVE',
    entityType: 'STORY',
    entityId: id,
    userId: session.user.id,
    details: { title: story.title },
  });

  return NextResponse.json(unarchived);
}
