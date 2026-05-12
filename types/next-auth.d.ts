import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role: "admin" | "editor" | "member";
    isActive: boolean;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: "admin" | "editor" | "member";
      isActive: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "admin" | "editor" | "member";
    isActive: boolean;
  }
}
