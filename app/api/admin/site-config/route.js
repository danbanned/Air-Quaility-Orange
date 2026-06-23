import { NextResponse } from 'next/server';
import { requireTrueAdmin } from '../../../../lib/api';
import { getSiteConfig, logActivity, upsertSiteConfig } from '../../../../lib/admin-system';

export async function GET() {
  const { error } = await requireTrueAdmin();
  if (error) return error;

  const data = await getSiteConfig();
  return NextResponse.json(data);
}

export async function PUT(request) {
  const { session, error } = await requireTrueAdmin();
  if (error) return error;

  const payload = await request.json();
  const record = await upsertSiteConfig(payload);

  await logActivity({
    action: 'UPDATE',
    entityType: 'SITE_CONFIG',
    entityId: record.id,
    userId: session.user.id,
    details: { siteName: payload.siteName },
  });

  return NextResponse.json(record.data);
}
