import { NextResponse } from 'next/server';
import { requireAuthenticated } from '../../../../../lib/api';
import { createNotification, logActivity, notifyRoles } from '../../../../../lib/admin-system';
import { validateOpportunityInterestPayload } from '../../../../../lib/content-service';
import { prisma } from '../../../../../lib/prisma';

export async function POST(request, { params }) {
  const { id } = await params;
  const { session, error } = await requireAuthenticated();
  if (error) {
    return error;
  }

  if (session.user.role !== 'USER') {
    return NextResponse.json({ error: 'Only users can express interest' }, { status: 403 });
  }

  const payload = await request.json();
  const validation = validateOpportunityInterestPayload(payload);
  if (validation.error) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const opportunity = await prisma.opportunity.findUnique({ where: { id } });
  if (!opportunity) {
    return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
  }

  const interest = await prisma.opportunityInterest.create({
    data: {
      ...validation.data,
      opportunityId: id,
      userId: session.user.id,
    },
  });

  await notifyRoles(
    ['ADMIN'],
    'OPPORTUNITY_INTEREST',
    'New opportunity interest',
    `${validation.data.name} is interested in ${opportunity.title}.`,
    interest.id
  );

  await createNotification(
    session.user.id,
    'INTEREST_SUBMITTED',
    'Interest submitted',
    `Your interest in "${opportunity.title}" has been sent to AQO.`,
    interest.id
  );

  await logActivity({
    action: 'CREATE',
    entityType: 'OPPORTUNITY_INTEREST',
    entityId: interest.id,
    userId: session.user.id,
    details: { opportunityId: opportunity.id, title: opportunity.title },
  });

  return NextResponse.json(interest, { status: 201 });
}
