// STATUS: done | Task R.10
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { PageLayout } from "@/components/layout/PageLayout";
import { V4GlassCard } from "@/components/v4/V4GlassCard";
import { GenerateReportButton } from "../GenerateReportButton";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default async function ReportReaderPage({
  params,
}: {
  params: { purchaseId: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const purchaseId = params?.purchaseId;

  if (typeof purchaseId !== "string" || purchaseId.length === 0) {
    redirect("/reports");
  }

  const reportPurchase = (db as any).reportPurchase as
    | { findUnique: Function }
    | undefined;

  if (!reportPurchase?.findUnique) {
    return (
      <PageLayout
        eyebrow="REPORTS"
        title="My Reports"
        subtitle="Deep, personalized reports generated from your unique chart data."
      >
        <section className="animate-enter animate-enter-2">
          <div className="glass-card border border-white/10 rounded-xl p-6 cc-body">
            Reports are not ready yet. Please run `npx prisma generate` and
            restart the dev server so the Prisma client includes
            `reportPurchase` tables.
          </div>
        </section>
      </PageLayout>
    );
  }

  const purchase = await reportPurchase.findUnique({
    where: { id: purchaseId },
    include: {
      reportProduct: true,
      generatedReport: true,
      user: { select: { id: true, email: true } },
    },
  });

  if (!purchase) redirect("/reports");

  const isOwner = purchase.user.id === userId;
  const isAdmin = session.user.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    redirect("/reports");
  }

  const status = purchase.status;
  const content = purchase.generatedReport?.content ?? null;
  const generatedAt = purchase.generatedReport?.generatedAt?.toISOString() ?? null;
  const wordCount = purchase.generatedReport?.wordCount ?? null;

  const product = purchase.reportProduct;

  return (
    <PageLayout
      eyebrow={String(product.category)}
      title={product.title}
      subtitle={product.subtitle ?? "Your personalised report"}
    >
      <section className="animate-enter animate-enter-2">
        <V4GlassCard className="rounded-2xl">
          <div className="p-5 md:p-6 flex flex-col gap-5">
            <Link
              href="/reports"
              className="cc-body text-sm text-amber-200 hover:text-amber-100 transition-colors"
            >
              ← Back to Reports
            </Link>

            {/* Meta */}
            <div className="flex flex-wrap gap-2 items-center">
              {generatedAt && (
                <span className="cc-tag" aria-label="Generated date">
                  Generated {formatDate(generatedAt)}
                </span>
              )}
              {wordCount != null && (
                <span className="cc-tag" aria-label="Word count">
                  {wordCount.toLocaleString()} words
                </span>
              )}
              <span
                className={[
                  "cc-tag",
                  status === "COMPLETE"
                    ? "cc-tag--amber"
                    : status === "GENERATING"
                      ? "cc-tag--amber"
                      : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {status === "COMPLETE"
                  ? "READY TO READ"
                  : status === "GENERATING"
                    ? "GENERATING"
                    : "QUEUED"}
              </span>
            </div>

            {/* Admin Controls */}
            {isAdmin && status !== "COMPLETE" && (
              <div className="glass-card border border-amber-400/30 rounded-xl p-5">
                <p className="cc-body text-amber-200">
                  Admin: report status is <strong>{status}</strong>. Trigger generation below.
                </p>
                <div className="mt-4">
                  <GenerateReportButton purchaseId={purchase.id} />
                </div>
              </div>
            )}

            {/* Not Ready State */}
            {!content && status !== "COMPLETE" && (
              <div className="glass-card border border-white/10 rounded-xl p-10 text-center">
                <p className="cc-body text-lg">
                  {status === "GENERATING"
                    ? "Your report is being generated. This may take a few minutes."
                    : "Your report is queued and will be ready soon."}
                </p>
              </div>
            )}

            {/* Report Content */}
            {content && (
              <div className="cc-body">
                <ReactMarkdown
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1 className="cc-title-lg mt-6 mb-3" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 className="cc-title-card mt-6 mb-2" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 className="cc-title-card mt-5 mb-2" {...props} />
                    ),
                    p: ({ node, ...props }) => (
                      <p className="cc-body mt-4" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc pl-6" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="list-decimal pl-6" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="cc-body mt-2" {...props} />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong className="font-semibold text-amber-200" {...props} />
                    ),
                    a: ({ node, ...props }) => (
                      <a className="underline text-amber-200 hover:text-amber-100" {...props} />
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </V4GlassCard>
      </section>
    </PageLayout>
  );
}

