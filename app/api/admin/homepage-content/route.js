import { NextResponse } from 'next/server';
import { requireTrueAdmin } from '@/lib/api';
import { getHomePageContent, logActivity, upsertHomePageContent } from '@/lib/admin-system';

export async function GET() {
  const { error } = await requireTrueAdmin();
  if (error) {
    return error;
  }

  const data = await getHomePageContent();
  return NextResponse.json(data);
}

export async function PUT(request) {
  const { session, error } = await requireTrueAdmin();
  if (error) {
    return error;
  }

  const payload = await request.json();
  const record = await upsertHomePageContent(payload);

  await logActivity({
    action: 'UPDATE',
    entityType: 'HOME_PAGE',
    entityId: record.id,
    userId: session.user.id,
    details: payload,
  });

  return NextResponse.json(record.data);
}
