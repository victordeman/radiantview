import type { NextAuthConfig } from "next-auth"

export default {
  providers: [], // This will be expanded in auth.ts
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  session: { strategy: "jwt" },
  callbacks: {
    // Only includes callbacks that don't depend on Prisma
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
