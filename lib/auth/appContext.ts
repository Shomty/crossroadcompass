/**
 * Effective app user (admin impersonation). Prefer this over raw auth() in (app) routes
 * so dashboard data matches the impersonated account.
 */

import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const IMPERSONATE_COOKIE = "adminImpersonating";

export type AppUserContext = {
  userId: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  isAdmin: boolean;
  impersonating: boolean;
  /** Admin user id when impersonating */
  realAdminUserId: string | null;
};

export async function getAppUserContext(): Promise<AppUserContext | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const jar = await cookies();
  const impId = jar.get(IMPERSONATE_COOKIE)?.value;
  const adminGate =
    session.user.isAdmin === true || session.user.role === "ADMIN";

  if (impId && adminGate) {
    const target = await db.user.findUnique({
      where: { id: impId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        isAdmin: true,
      },
    });
    if (
      target &&
      target.role !== "ADMIN" &&
      !target.isAdmin
    ) {
      return {
        userId: target.id,
        email: target.email,
        name: target.name,
        image: target.image,
        role: target.role,
        isAdmin: false,
        impersonating: true,
        realAdminUserId: session.user.id,
      };
    }
  }

  return {
    userId: session.user.id,
    email: session.user.email ?? "",
    name: session.user.name ?? null,
    image: session.user.image ?? null,
    role: session.user.role,
    isAdmin: adminGate,
    impersonating: false,
    realAdminUserId: null,
  };
}

export const ADMIN_IMPERSONATE_COOKIE = IMPERSONATE_COOKIE;
