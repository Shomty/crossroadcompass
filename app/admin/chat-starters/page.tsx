import { requireAdminSession } from "@/lib/admin/requireAdmin";
import { ChatStartersManager } from "@/components/admin/ChatStartersManager";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminChatStartersPage() {
  await requireAdminSession();

  const starters = await db.chatStarterPrompt.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontFamily: "var(--font-mono, 'DM Mono')",
            fontSize: 10,
            color: "#c8873a",
            letterSpacing: "0.2em",
            marginBottom: 8,
          }}
        >
          ADMIN · COSMIC CHAT
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display, 'Cormorant Garamond')",
            fontSize: 28,
            color: "#e8b96a",
            margin: 0,
            fontWeight: 400,
          }}
        >
          Chat starter prompts
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body, 'Instrument Sans')",
            fontSize: 13,
            color: "#606880",
            margin: "10px 0 0",
            maxWidth: 560,
          }}
        >
          When at least one row is enabled, Cosmic Chat uses these starters. If none
          are enabled, the app falls back to the built-in defaults.
        </p>
      </div>

      <ChatStartersManager initial={starters} />
    </div>
  );
}
