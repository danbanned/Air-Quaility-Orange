import { auth } from '../auth';

export { ROLE, ADMIN_ROLES } from '../auth';

export function hasRole(user, roles) {
  return Boolean(user?.role && roles.includes(user.role));
}

export function isAdmin(user) {
  return hasRole(user, ['ADMIN']);
}

export function isAdminAssistant(user) {
  return hasRole(user, ['ADMIN_ASSISTANT']);
}

export function canAccessAdmin(user) {
  return hasRole(user, ['ADMIN', 'ADMIN_ASSISTANT']);
}

export function getSession() {
  return auth();
}

export async function requireSession() {
  const session = await auth();
  return session?.user ? session : null;
}

export async function requireRole(roles) {
  const session = await requireSession();
  if (!session?.user || !roles.includes(session.user.role)) return null;
  return session;
}

export async function requireAdminSession() {
  return requireRole(['ADMIN', 'ADMIN_ASSISTANT']);
}
