import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ADMIN_IMPERSONATE_COOKIE } from "@/lib/auth/appContext";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const admin =
    session.user.role === "ADMIN" || session.user.isAdmin === true;
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const jar = await cookies();
  if (!jar.get(ADMIN_IMPERSONATE_COOKIE)?.value) {
    return NextResponse.json({ ok: true });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_IMPERSONATE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
