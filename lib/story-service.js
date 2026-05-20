import { prisma } from './prisma';
import { parseJsonObject, REQUEST_STATUS, STORY_STATUS } from './admin-system';

function normalizeStoryPayload(payload = {}) {
  return {
    title: payload.title?.trim(),
    personName: payload.personName?.trim(),
    community: payload.community?.trim(),
    content: payload.content?.trim(),
    audioUrl: payload.audioUrl?.trim() || null,
    imageUrl: payload.imageUrl?.trim() || null,
    category: payload.category?.trim(),
    adminNotes: payload.adminNotes?.trim() || null,
  };
}

export function validateStoryPayload(payload) {
  const normalized = normalizeStoryPayload(payload);
  const requiredFields = ['title', 'personName', 'community', 'content', 'category'];
  const missingField = requiredFields.find((field) => !normalized[field]);

  if (missingField) {
    return { error: `Missing required field: ${missingField}` };
  }

  return { data: normalized };
}

export async function listStories(where = {}) {
  return prisma.story.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      submittedBy: {
        select: { id: true, email: true, name: true, role: true },
      },
    },
  });
}

export async function getStoryById(id) {
  return prisma.story.findUnique({
    where: { id },
    include: {
      submittedBy: {
        select: { id: true, email: true, name: true, role: true },
      },
      storyRequests: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

export async function createStory(data) {
  return prisma.story.create({ data });
}

export async function updateStory(id, data) {
  return prisma.story.update({
    where: { id },
    data,
  });
}

export async function deleteStory(id) {
  return prisma.story.delete({ where: { id } });
}

export async function createStorySubmission({
  userId,
  storyData,
  autoApprove = false,
}) {
  const status = autoApprove ? STORY_STATUS.APPROVED : STORY_STATUS.PENDING;

  return prisma.story.create({
    data: {
      ...storyData,
      status,
      submittedById: userId,
      storyRequests: {
        create: {
          userId,
          status: autoApprove ? REQUEST_STATUS.APPROVED : REQUEST_STATUS.PENDING,
        },
      },
    },
    include: {
      storyRequests: true,
    },
  });
}

export async function approveStory(id, adminNotes = null) {
  return prisma.story.update({
    where: { id },
    data: {
      status: STORY_STATUS.APPROVED,
      adminNotes,
      storyRequests: {
        updateMany: {
          where: { status: REQUEST_STATUS.PENDING },
          data: {
            status: REQUEST_STATUS.APPROVED,
            adminNotes,
          },
        },
      },
    },
    include: {
      submittedBy: true,
    },
  });
}

export async function archiveStory(id) {
  return prisma.story.update({
    where: { id },
    data: { status: 'ARCHIVED' },
  });
}

export async function unarchiveStory(id) {
  return prisma.story.update({
    where: { id },
    data: { status: 'APPROVED' },
  });
}

export async function rejectStory(id, adminNotes) {
  return prisma.story.update({
    where: { id },
    data: {
      status: STORY_STATUS.REJECTED,
      adminNotes,
      storyRequests: {
        updateMany: {
          where: { status: REQUEST_STATUS.PENDING },
          data: {
            status: REQUEST_STATUS.REJECTED,
            adminNotes,
          },
        },
      },
    },
    include: {
      submittedBy: true,
    },
  });
}

export function normalizeResources(resources) {
  const safe = parseJsonObject(resources, {});
  return {
    links: Array.isArray(safe.links) ? safe.links : [],
    emails: Array.isArray(safe.emails) ? safe.emails : [],
    classes: Array.isArray(safe.classes) ? safe.classes : [],
    actionButtons: Array.isArray(safe.actionButtons) ? safe.actionButtons : [],
  };
}
