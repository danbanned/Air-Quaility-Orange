import { NextResponse } from 'next/server';
import { requireAdminSession, requireRole, requireSession, ROLE } from './auth';

export function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function getJsonBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function requireAuthenticated() {
  const session = await requireSession();
  if (!session) {
    return { error: jsonError('Unauthorized', 401) };
  }

  return { session };
}

export async function requireAdminAccess() {
  const session = await requireAdminSession();
  if (!session) {
    return { error: jsonError('Unauthorized', 401) };
  }

  return { session };
}

export async function requireTrueAdmin() {
  const session = await requireRole([ROLE.ADMIN]);
  if (!session) {
    return { error: jsonError('Forbidden', 403) };
  }

  return { session };
}
