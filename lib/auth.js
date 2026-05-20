import CredentialsProvider from 'next-auth/providers/credentials';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const ROLE = {
  ADMIN: 'ADMIN',
  ADMIN_ASSISTANT: 'ADMIN_ASSISTANT',
  USER: 'USER',
};

export const ADMIN_ROLES = [ROLE.ADMIN, ROLE.ADMIN_ASSISTANT];

function normalizeEmail(email) {
  return email?.toLowerCase().trim() || '';
}

export function hasRole(user, roles) {
  return Boolean(user?.role && roles.includes(user.role));
}

export function isAdmin(user) {
  return hasRole(user, [ROLE.ADMIN]);
}

export function isAdminAssistant(user) {
  return hasRole(user, [ROLE.ADMIN_ASSISTANT]);
}

export function canAccessAdmin(user) {
  return hasRole(user, ADMIN_ROLES);
}

export const authOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: normalizeEmail(credentials.email) },
        });

        if (!user) {
          return null;
        }

        const passwordMatches = await bcrypt.compare(credentials.password, user.password);
        if (!passwordMatches) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          contactInfo: user.contactInfo,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.contactInfo = user.contactInfo;
        token.canAccessAdmin = ADMIN_ROLES.includes(user.role);
      }

      if (!token.canAccessAdmin && token.role) {
        token.canAccessAdmin = ADMIN_ROLES.includes(token.role);
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role;
        session.user.contactInfo = token.contactInfo;
        session.user.isAdmin = token.role === ROLE.ADMIN;
        session.user.isAdminAssistant = token.role === ROLE.ADMIN_ASSISTANT;
        session.user.canAccessAdmin = Boolean(token.canAccessAdmin);
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export function getSession() {
  return getServerSession(authOptions);
}

export async function requireSession() {
  const session = await getSession();
  return session?.user ? session : null;
}

export async function requireRole(roles) {
  const session = await requireSession();

  if (!session?.user || !roles.includes(session.user.role)) {
    return null;
  }

  return session;
}

export async function requireAdminSession() {
  return requireRole(ADMIN_ROLES);
}
