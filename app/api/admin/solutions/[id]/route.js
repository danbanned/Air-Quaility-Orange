import { NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/api';
import { logActivity } from '@/lib/admin-system';
import { validateSolutionPayload } from '@/lib/content-service';
import { prisma } from '@/lib/prisma';

export async function PUT(request, { params }) {
  const { id } = await params;
  const { session, error } = await requireAdminAccess();
  if (error) {
    return error;
  }

  const payload = await request.json();
  const validation = validateSolutionPayload(payload);
  if (validation.error) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const solution = await prisma.solution.update({
    where: { id },
    data: validation.data,
  });

  await logActivity({
    action: 'UPDATE',
    entityType: 'SOLUTION',
    entityId: solution.id,
    userId: session.user.id,
    details: { title: solution.title },
  });

  return NextResponse.json(solution);
}
