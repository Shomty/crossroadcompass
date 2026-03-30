import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdmin";

export async function GET(request: Request) {
  const { error } = await requireAdminApi(request);
  if (error) return error;
  return NextResponse.json(
    { error: "Payments not yet implemented.", code: "PAYMENTS_DEFERRED" },
    { status: 501 }
  );
}
