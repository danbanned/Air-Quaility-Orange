import { NextResponse } from 'next/server';
import { requireAdminAccess } from '../../../../../lib/api';
import { logActivity } from '../../../../../lib/admin-system';
import { validateOpportunityPayload } from '../../../../../lib/content-service';
import { prisma } from '../../../../../lib/prisma';

export async function PUT(request, { params }) {
  const { id } = await params;
  const { session, error } = await requireAdminAccess();
  if (error) {
    return error;
  }

  const payload = await request.json();
  const validation = validateOpportunityPayload(payload);
  if (validation.error) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const item = await prisma.opportunity.update({
    where: { id },
    data: validation.data,
  });

  await logActivity({
    action: 'UPDATE',
    entityType: 'OPPORTUNITY',
    entityId: item.id,
    userId: session.user.id,
    details: { title: item.title },
  });

  return NextResponse.json(item);
}
