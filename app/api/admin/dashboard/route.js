import { NextResponse } from 'next/server';
import { requireAdminAccess } from '../../../../lib/api';
import { DELETE_REQUEST_STATUS, EVENT_REQUEST_STATUS, STORY_STATUS } from '../../../../lib/admin-system';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  const { session, error } = await requireAdminAccess();
  if (error) {
    return error;
  }

  const isAssistant = session.user.role === 'ADMIN_ASSISTANT';

  const [
    pendingStoriesCount,
    eventRequestCount,
    opportunityInterests,
    notifications,
    deleteRequests,
    activityLogs,
    pendingStories,
    allStories,
    eventRequests,
  ] = await Promise.all([
    prisma.story.count({ where: { status: STORY_STATUS.PENDING } }),
    prisma.eventRequest.count({ where: { status: EVENT_REQUEST_STATUS.PENDING } }),
    prisma.opportunityInterest.count(),
    prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.deleteRequest.findMany({
      where: isAssistant
        ? { requestedById: session.user.id }
        : { status: DELETE_REQUEST_STATUS.PENDING },
      orderBy: { createdAt: 'desc' },
      include: {
        requestedBy: { select: { id: true, email: true, name: true } },
      },
      take: 10,
    }),
    prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: isAssistant ? 15 : 25,
      include: {
        user: { select: { id: true, email: true, name: true, role: true } },
      },
    }),
    prisma.story.findMany({
      where: { status: STORY_STATUS.PENDING },
      orderBy: { createdAt: 'desc' },
      include: {
        submittedBy: {
          select: { id: true, email: true, name: true, role: true },
        },
      },
      take: 20,
    }),
    prisma.story.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        submittedBy: {
          select: { id: true, email: true, name: true, role: true },
        },
      },
    }),
    prisma.eventRequest.findMany({
      where: isAssistant ? undefined : { status: EVENT_REQUEST_STATUS.PENDING },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, email: true, name: true, role: true } },
      },
      take: 20,
    }),
  ]);

  return NextResponse.json({
    role: session.user.role,
    stats: {
      pendingStories: pendingStoriesCount,
      eventRequests: eventRequestCount,
      opportunityInterests,
      pendingDeletions: deleteRequests.filter((item) => item.status === DELETE_REQUEST_STATUS.PENDING).length,
    },
    notifications,
    pendingStories,
    allStories,
    eventRequests,
    pendingDeletions: deleteRequests,
    deleteRequests,
    activityLog: activityLogs.map((item) => ({
      id: item.id,
      action: item.action,
      entityType: item.entityType,
      entityId: item.entityId,
      details: JSON.stringify(item.details),
      createdAt: item.createdAt,
      user: item.user,
    })),
    activityLogs,
  });
}
