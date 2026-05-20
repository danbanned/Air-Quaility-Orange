import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { ROLE } from './auth';

export const STORY_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  ARCHIVED: 'ARCHIVED',
};

export const REQUEST_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

export const EVENT_REQUEST_STATUS = {
  PENDING: 'PENDING',
  APPROVED_WITH_SUPPORT: 'APPROVED_WITH_SUPPORT',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

export const EVENT_STATUS = {
  ACTIVE: 'ACTIVE',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
};

export const DELETE_REQUEST_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  DENIED: 'DENIED',
};

export const HOME_CONTENT_KEY = 'home-page';
export const SITE_CONFIG_KEY = 'site-config';

export const defaultSiteConfig = {
  siteName: 'Air Quality Orange',
  siteSubtitle: 'Nicetown • Hunting Park • Eastwick',
  logoIcon: '🌍',
  theme: {
    '--aqo-orange': '#FF6B35',
    '--aqo-orange-light': '#FF8C5A',
    '--aqo-orange-dark': '#E54B1E',
    '--aqo-brown': '#C6A87A',
    '--aqo-cream': '#E2D4B0',
    '--aqo-white': '#F7F1E3',
    '--aqo-black': '#04101B',
    '--aqo-green': '#4CAF50',
    '--aqo-red': '#f44336',
    '--aqo-blue': '#2196F3',
  },
};

export const defaultHomePageContent = {
  sectionOrder: ['cards', 'cta', 'stats', 'quote'],
  cards: [
    {
      title: 'Community Voices',
      description: 'Stories from neighbors documenting asthma, heat, organizing, and local wins.',
      icon: '🎙️',
      link: '/voices',
    },
    {
      title: 'Local Events',
      description: 'Workshops, cleanups, trainings, and health events across AQO communities.',
      icon: '📅',
      link: '/events',
    },
    {
      title: 'Get Involved',
      description: 'Volunteer, advocate, donate, or partner with AQO and neighborhood groups.',
      icon: '🤝',
      link: '/get-involved',
    },
  ],
  stats: [
    { value: '3', label: 'Focus communities' },
    { value: '6', label: 'Default solution pathways' },
    { value: '1', label: 'Shared air justice platform' },
  ],
  quote: {
    text: 'Environmental justice starts with residents having the tools to act on what they already know.',
    author: 'Air Quality Orange',
  },
  cta: {
    title: 'Turn local knowledge into action.',
    body: 'Read community stories, join events, and find practical ways to support cleaner, healthier neighborhoods.',
    primaryText: 'Share Your Story',
    primaryHref: '/voices',
    secondaryText: 'Find Opportunities',
    secondaryHref: '/get-involved',
  },
};

export function normalizeEmail(email) {
  return email?.toLowerCase().trim() || '';
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function createNotification(userId, type, title, message, relatedId = null) {
  return prisma.notification.create({
    data: { userId, type, title, message, relatedId },
  });
}

export async function notifyRoles(roles, type, title, message, relatedId = null) {
  const recipients = await prisma.user.findMany({
    where: { role: { in: roles } },
    select: { id: true },
  });

  if (!recipients.length) {
    return [];
  }

  return prisma.$transaction(
    recipients.map((recipient) =>
      prisma.notification.create({
        data: {
          userId: recipient.id,
          type,
          title,
          message,
          relatedId,
        },
      })
    )
  );
}

export async function logActivity({ action, entityType, entityId, userId, details = {} }) {
  return prisma.activityLog.create({
    data: {
      action,
      entityType,
      entityId,
      userId,
      details,
    },
  });
}

export function parseJsonArray(value, fallback = []) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== 'string' || !value.trim()) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function parseJsonObject(value, fallback = {}) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value;
  }

  if (typeof value !== 'string' || !value.trim()) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export async function ensureDefaultHomePageContent() {
  const existing = await prisma.homePageContent.findUnique({
    where: { key: HOME_CONTENT_KEY },
  });

  if (existing) {
    return existing;
  }

  return prisma.homePageContent.create({
    data: {
      key: HOME_CONTENT_KEY,
      data: defaultHomePageContent,
    },
  });
}

export async function getHomePageContent() {
  const record = await ensureDefaultHomePageContent();
  return record.data;
}

export async function upsertHomePageContent(data) {
  return prisma.homePageContent.upsert({
    where: { key: HOME_CONTENT_KEY },
    update: { data },
    create: { key: HOME_CONTENT_KEY, data },
  });
}

export function canDirectDelete(role) {
  return role === ROLE.ADMIN;
}

export function shouldAutoApproveStory(role) {
  return role === ROLE.ADMIN || role === ROLE.ADMIN_ASSISTANT;
}

export async function ensureDefaultSiteConfig() {
  const existing = await prisma.homePageContent.findUnique({
    where: { key: SITE_CONFIG_KEY },
  });

  if (existing) {
    return existing;
  }

  return prisma.homePageContent.create({
    data: {
      key: SITE_CONFIG_KEY,
      data: defaultSiteConfig,
    },
  });
}

export async function getSiteConfig() {
  const record = await ensureDefaultSiteConfig();
  return record.data;
}

export async function upsertSiteConfig(data) {
  return prisma.homePageContent.upsert({
    where: { key: SITE_CONFIG_KEY },
    update: { data },
    create: { key: SITE_CONFIG_KEY, data },
  });
}

export function getDeleteEntityConfig(entityType) {
  const map = {
    STORY: {
      model: prisma.story,
      labelField: 'title',
    },
    SOLUTION: {
      model: prisma.solution,
      labelField: 'title',
    },
    EVENT: {
      model: prisma.event,
      labelField: 'title',
    },
    OPPORTUNITY: {
      model: prisma.opportunity,
      labelField: 'title',
    },
  };

  return map[entityType] || null;
}
