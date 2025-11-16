import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { prisma } from './lib/prisma';

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      // Check if email is in allowed list
      const allowedEmails = process.env.ALLOWED_EMAILS?.split(',').map(e => e.trim()) || [];
      if (!allowedEmails.includes(user.email)) {
        return false;
      }

      // Create or update user in database
      try {
        await prisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name || undefined,
            image: user.image || undefined,
          },
          create: {
            email: user.email,
            name: user.name || undefined,
            image: user.image || undefined,
            role: 'OPERATOR', // Default role
          },
        });
        return true;
      } catch (error) {
        console.error('Error creating/updating user:', error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user?.email) {
        // Fetch user role from database
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, role: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'OPERATOR' | 'ADMIN';
      }
      return session;
    },
  },
});
