// STATUS: done | Task R.10
import { auth } from "@/lib/auth";
import { getAppUserContext } from "@/lib/auth/appContext";
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
  params: Promise<{ purchaseId: string }>;
}) {
  const ctx = await getAppUserContext();
  if (!ctx) redirect("/login");

  const userId = ctx.userId;
  const { purchaseId } = await params;

  if (typeof purchaseId !== "string" || purchaseId.length === 0) {
    redirect("/reports");
  }

  const purchase = await db.reportPurchase.findUnique({
    where: { id: purchaseId },
    include: {
      reportProduct: true,
      generatedReport: true,
      user: { select: { id: true, email: true } },
    },
  });

  if (!purchase) redirect("/reports");

  const isOwner = purchase.user.id === userId;
  const rawSession = await auth();
  const isRealAdmin =
    rawSession?.user?.role === "ADMIN" ||
    rawSession?.user?.isAdmin === true;

  if (!isOwner && !isRealAdmin) {
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
        <V4GlassCard>
          <div className="flex flex-col gap-5">
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
            {isRealAdmin && status !== "COMPLETE" && (
              <div className="glass-card p-5">
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
              <div className="glass-card p-10 text-center">
                <p className="cc-body text-lg">
                  {status === "GENERATING"
                    ? "Your report is being generated. This may take a few minutes."
                    : "Your report is queued and will be ready soon."}
                </p>
              </div>
            )}

            {/* Report Content */}
            {content && (
              <div className="report-prose">
                <ReactMarkdown
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1 className="report-h1" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 className="report-h2" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 className="report-h3" {...props} />
                    ),
                    h4: ({ node, ...props }) => (
                      <h4 className="report-h4" {...props} />
                    ),
                    p: ({ node, ...props }) => (
                      <p className="report-p" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul className="report-ul" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="report-ol" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="report-li" {...props} />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong className="report-strong" {...props} />
                    ),
                    em: ({ node, ...props }) => (
                      <em className="report-em" {...props} />
                    ),
                    hr: ({ node, ...props }) => (
                      <hr className="report-hr" {...props} />
                    ),
                    blockquote: ({ node, ...props }) => (
                      <blockquote className="report-blockquote" {...props} />
                    ),
                    a: ({ node, ...props }) => (
                      <a className="underline text-amber-200 hover:text-amber-100 transition-colors" {...props} />
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

