import type { NextAuthConfig } from "next-auth";

// Middleware-safe config — không import DB, chạy được trên Edge
export const authConfig = {
  pages: { signIn: "/login" },
  providers: [],
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected = nextUrl.pathname.startsWith("/dashboard");
      const isLoginPage = nextUrl.pathname.startsWith("/login");

      if (isProtected && !isLoggedIn) return false;
      if (isLoginPage && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.isActive = user.isActive;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "admin" | "editor" | "member";
        session.user.isActive = token.isActive as boolean;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
