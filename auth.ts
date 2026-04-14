import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"
import authConfig from "./auth.config"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  callbacks: {
    ...authConfig.callbacks,
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await db.user.findUnique({
        where: { id: token.sub }
      });

      if (!existingUser) return token;

      token.role = existingUser.role;

      return token;
    }
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    {
      id: "credentials",
      name: "Credentials",
      type: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await db.user.findUnique({
          where: { email: credentials.email as string }
        });

        if (!user || !user.password) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (passwordMatch) return user;

        return null;
      }
    }
  ],
})
