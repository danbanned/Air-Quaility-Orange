import { prisma } from './prisma';

function normalizeSlidePayload(payload) {
  return {
    badge: payload.badge?.trim(),
    title: payload.title?.trim(),
    summary: payload.summary?.trim(),
    impact: payload.impact?.trim() || null,
    source: payload.source?.trim() || null,
    imageUrl: payload.imageUrl?.trim() || null,
    linkUrl: payload.linkUrl?.trim() || null,
    linkLabel: payload.linkLabel?.trim() || null,
    sortOrder: Number.isFinite(Number(payload.sortOrder)) ? Number(payload.sortOrder) : 0,
    isActive: payload.isActive !== false,
    publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : null,
  };
}

export function validateHeroSlidePayload(payload) {
  const normalized = normalizeSlidePayload(payload);
  const requiredFields = ['badge', 'title', 'summary'];
  const missingField = requiredFields.find((field) => !normalized[field]);

  if (missingField) {
    return { error: `Missing required field: ${missingField}` };
  }

  if (normalized.linkUrl && !normalized.linkLabel) {
    return { error: 'Missing required field: linkLabel' };
  }

  if (Number.isNaN(normalized.sortOrder)) {
    return { error: 'sortOrder must be a number' };
  }

  if (normalized.publishedAt && Number.isNaN(normalized.publishedAt.getTime())) {
    return { error: 'publishedAt must be a valid date' };
  }

  return { data: normalized };
}

export async function listHeroSlides(includeInactive = false) {
  return prisma.heroSlide.findMany({
    where: includeInactive ? undefined : { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function createHeroSlide(data) {
  return prisma.heroSlide.create({ data });
}

export async function deleteHeroSlide(id) {
  return prisma.heroSlide.delete({ where: { id } });
}
