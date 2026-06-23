import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './lib/prisma';

export const ROLE = {
  ADMIN: 'ADMIN',
  ADMIN_ASSISTANT: 'ADMIN_ASSISTANT',
  USER: 'USER',
};

export const ADMIN_ROLES = [ROLE.ADMIN, ROLE.ADMIN_ASSISTANT];

export const { auth, handlers, signIn, signOut } = NextAuth({
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: String(credentials.email).toLowerCase().trim() },
        });

        if (!user) return null;

        const passwordMatches = await bcrypt.compare(String(credentials.password), user.password);
        if (!passwordMatches) return null;

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
});
