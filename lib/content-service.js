import { prisma } from './prisma';
import {
  EVENT_REQUEST_STATUS,
  EVENT_STATUS,
  parseJsonArray,
  parseJsonObject,
} from './admin-system';

function requiredFieldError(fields, normalized) {
  const missingField = fields.find((field) => {
    const value = normalized[field];
    return value === undefined || value === null || value === '';
  });

  return missingField ? `Missing required field: ${missingField}` : null;
}

export function validateSolutionPayload(payload = {}) {
  const data = {
    title: payload.title?.trim(),
    description: payload.description?.trim(),
    icon: payload.icon?.trim(),
    imageUrl: payload.imageUrl?.trim() || null,
    category: payload.category?.trim(),
    resources: parseJsonObject(payload.resources, {
      links: [],
      emails: [],
      classes: [],
      actionButtons: [],
    }),
  };

  const error = requiredFieldError(['title', 'description', 'icon', 'category'], data);
  return error ? { error } : { data };
}

export function validateEventPayload(payload = {}) {
  const data = {
    title: payload.title?.trim(),
    description: payload.description?.trim(),
    date: payload.date ? new Date(payload.date) : null,
    time: payload.time?.trim(),
    location: payload.location?.trim(),
    address: payload.address?.trim(),
    imageUrl: payload.imageUrl?.trim() || null,
    category: payload.category?.trim(),
    organizer: payload.organizer?.trim(),
    spots: Number(payload.spots),
    registered: Number.isFinite(Number(payload.registered)) ? Number(payload.registered) : 0,
    ticketUrl: payload.ticketUrl?.trim() || null,
    isExternal: Boolean(payload.isExternal),
    isSponsored: Boolean(payload.isSponsored),
    status: payload.status || EVENT_STATUS.ACTIVE,
  };

  const error = requiredFieldError(
    ['title', 'description', 'date', 'time', 'location', 'address', 'category', 'organizer'],
    data
  );

  if (error) {
    return { error };
  }

  if (Number.isNaN(data.date?.getTime())) {
    return { error: 'date must be a valid date' };
  }

  if (!Number.isInteger(data.spots) || data.spots < 0) {
    return { error: 'spots must be a non-negative integer' };
  }

  if (!Number.isInteger(data.registered) || data.registered < 0) {
    return { error: 'registered must be a non-negative integer' };
  }

  return { data };
}

export function validateOpportunityPayload(payload = {}) {
  const data = {
    title: payload.title?.trim(),
    description: payload.description?.trim(),
    icon: payload.icon?.trim(),
    imageUrl: payload.imageUrl?.trim() || null,
    commitments: parseJsonArray(payload.commitments, []),
    skills: parseJsonArray(payload.skills, []),
    category: payload.category?.trim(),
    actionUrl: payload.actionUrl?.trim() || null,
  };

  const error = requiredFieldError(['title', 'description', 'icon', 'category'], data);
  return error ? { error } : { data };
}

export function validateEventRequestPayload(payload = {}) {
  const data = {
    requesterName: payload.requesterName?.trim(),
    requesterEmail: payload.requesterEmail?.trim(),
    requesterContact: payload.requesterContact?.trim(),
    title: payload.title?.trim(),
    description: payload.description?.trim(),
    proposedDate: payload.proposedDate ? new Date(payload.proposedDate) : null,
    proposedLocation: payload.proposedLocation?.trim(),
  };

  const error = requiredFieldError(
    ['requesterName', 'requesterEmail', 'requesterContact', 'title', 'description', 'proposedDate', 'proposedLocation'],
    data
  );

  if (error) {
    return { error };
  }

  if (Number.isNaN(data.proposedDate?.getTime())) {
    return { error: 'proposedDate must be a valid date' };
  }

  return { data };
}

export function validateOpportunityInterestPayload(payload = {}) {
  const data = {
    name: payload.name?.trim(),
    email: payload.email?.trim(),
    phone: payload.phone?.trim() || null,
    neighborhood: payload.neighborhood?.trim() || null,
    message: payload.message?.trim() || null,
  };

  const error = requiredFieldError(['name', 'email'], data);
  return error ? { error } : { data };
}

export async function listSolutions() {
  return prisma.solution.findMany({ orderBy: { updatedAt: 'desc' } });
}

export async function listEvents(includeAllStatuses = false) {
  return prisma.event.findMany({
    where: includeAllStatuses ? undefined : { status: EVENT_STATUS.ACTIVE },
    orderBy: [{ date: 'asc' }, { createdAt: 'desc' }],
  });
}

export async function listOpportunities() {
  return prisma.opportunity.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: {
        select: { interests: true },
      },
    },
  });
}

export async function listEventRequests() {
  return prisma.eventRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { id: true, email: true, name: true },
      },
    },
  });
}

export async function updateEventRequest(id, data) {
  return prisma.eventRequest.update({
    where: { id },
    data,
  });
}

export function validateEventRequestDecisionPayload(payload = {}) {
  const status = payload.status;
  const allowed = Object.values(EVENT_REQUEST_STATUS);

  if (!allowed.includes(status)) {
    return { error: 'Invalid event request status' };
  }

  return {
    data: {
      status,
      adminResponse: payload.adminResponse?.trim() || null,
      suggestedVenue: payload.suggestedVenue?.trim() || null,
    },
  };
}
