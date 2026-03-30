import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { writeAuditLog } from "@/lib/auth/adminHelpers";
import { ADMIN_IMPERSONATE_COOKIE } from "@/lib/auth/appContext";
import { db } from "@/lib/db";

export async function POST(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  const { session, error } = await requireAdminApi(request);
  if (error) return error;

  const { userId } = await context.params;

  const target = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, isAdmin: true },
  });

  if (!target) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (target.role === "ADMIN" || target.isAdmin) {
    return NextResponse.json(
      { error: "Cannot impersonate another admin" },
      { status: 403 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_IMPERSONATE_COOKIE, target.id, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 30,
    secure: process.env.NODE_ENV === "production",
  });

  await writeAuditLog({
    adminEmail: session!.user.email ?? "admin",
    action: "user.impersonate",
    targetType: "user",
    targetId: userId,
  });

  return res;
}
