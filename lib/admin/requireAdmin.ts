// STATUS: done | Task Admin-2
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";

const ADMIN_EMAIL = "shomty@hotmail.com";

function isAdmin(session: Session | null): boolean {
  if (!session?.user) return false;
  return (
    session.user.role === "ADMIN" || session.user.email === ADMIN_EMAIL
  );
}

/**
 * Use in server components / page.tsx files.
 * Redirects non-admins to /dashboard. Never returns for non-admins.
 */
export async function requireAdminSession(): Promise<Session> {
  const session = await auth();
  if (!isAdmin(session)) {
    redirect("/dashboard?error=unauthorized");
  }
  return session as Session;
}

/**
 * Use in API route handlers.
 * Returns 403 NextResponse for non-admins.
 */
export async function requireAdminApi(
  _request: Request
): Promise<{ session: Session; error: null } | { session: null; error: NextResponse }> {
  const session = await auth();
  if (!isAdmin(session)) {
    return {
      session: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { session: session as Session, error: null };
}
