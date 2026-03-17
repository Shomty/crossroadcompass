/**
 * app/api/auth/[...nextauth]/route.ts
 * NextAuth v5 catch-all route handler.
 */

import { handlers } from "@/lib/auth";

export const runtime = "nodejs";
export const { GET, POST } = handlers;
