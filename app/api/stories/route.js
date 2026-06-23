import { NextResponse } from 'next/server';
import { TEST_STORIES } from '../../../data/testStories';

export const dynamic = 'force-dynamic';

let listStories = null;
let STORY_STATUS = null;

// Lazy-load the DB layer so a Prisma/LibSQL init failure doesn't crash the route.
async function tryLoadDb() {
  if (listStories && STORY_STATUS) return true;
  try {
    const svc = await import('../../../lib/story-service');
    const adm = await import('../../../lib/admin-system');
    listStories = svc.listStories;
    STORY_STATUS = adm.STORY_STATUS;
    return true;
  } catch (e) {
    console.error('[api/stories] DB layer failed to load:', e.message);
    return false;
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'APPROVED';

  const dbReady = await tryLoadDb();

  if (dbReady) {
    try {
      const stories = await listStories({ status: STORY_STATUS.APPROVED });
      return NextResponse.json(stories);
    } catch (e) {
      console.error('[api/stories] DB query failed, falling back to TEST_STORIES:', e.message);
    }
  }

  // Fallback: return TEST_STORIES filtered by requested status
  const filtered = status === 'APPROVED'
    ? TEST_STORIES.filter(s => s.status === 'APPROVED')
    : TEST_STORIES;
  return NextResponse.json(filtered);
}
