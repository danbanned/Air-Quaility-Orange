import { NextResponse } from 'next/server';
import { requireAuthenticated } from '@/lib/api';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const { session, error } = await requireAuthenticated();
  if (error) {
    return error;
  }

  const submissions = await prisma.story.findMany({
    where: { submittedById: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(submissions);
}
