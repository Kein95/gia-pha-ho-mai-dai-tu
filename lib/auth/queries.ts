import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { auth } from "@/auth";

// React cache — đảm bảo 1 query/session per request
export const getUser = cache(async () => {
  const session = await auth();
  return session?.user ?? null;
});

// Full DB user record (vs session — session chỉ có subset fields)
export const getProfile = cache(async (userId?: string) => {
  let id = userId;
  if (!id) {
    const sessionUser = await getUser();
    if (!sessionUser) return null;
    id = sessionUser.id;
  }

  const [profile] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return profile ?? null;
});

export const getIsAdmin = cache(async () => {
  const user = await getUser();
  return user?.role === "admin";
});
