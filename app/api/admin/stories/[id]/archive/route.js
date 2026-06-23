import { NextResponse } from 'next/server';
import { requireAdminAccess } from '../../../../../../lib/api';
import { archiveStory, getStoryById } from '../../../../../../lib/story-service';
import { logActivity } from '../../../../../../lib/admin-system';

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

  const archived = await archiveStory(id);

  await logActivity({
    action: 'ARCHIVE',
    entityType: 'STORY',
    entityId: id,
    userId: session.user.id,
    details: { title: story.title },
  });

  return NextResponse.json(archived);
}
