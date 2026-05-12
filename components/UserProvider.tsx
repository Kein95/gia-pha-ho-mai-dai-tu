"use client";

import { useSession, SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

// Wraps the app with Auth.js SessionProvider so client components can call useSession()
export function UserProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

export default UserProvider;

// Compatibility hook — replaces old Supabase-backed useUser().
// Returns user email, role flags. supabase property removed.
export function useUser() {
  const { data: session } = useSession();
  const user = session?.user ?? null;
  const role = user?.role ?? "member";
  return {
    user,
    isAdmin: role === "admin",
    isEditor: role === "admin" || role === "editor",
  };
}
