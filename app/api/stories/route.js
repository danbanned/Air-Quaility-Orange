import { NextResponse } from 'next/server';
import { STORY_STATUS } from '@/lib/admin-system';
import { listStories } from '@/lib/story-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const stories = await listStories({
    status: STORY_STATUS.APPROVED,
  });

  return NextResponse.json(stories);
}
