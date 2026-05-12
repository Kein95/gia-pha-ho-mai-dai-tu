import { redirect } from "next/navigation";

// Setup page is no longer needed — Drizzle migrations run via CLI outside the UI.
// Redirect to login so any legacy links still work.
export default function SetupPage() {
  redirect("/login");
}
