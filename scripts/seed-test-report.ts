// STATUS: done | Task R.12
async function main() {
  try {
    const { db } = await import("../lib/db");

    const slug = "shadow-work-deep-dive-test";

    const existing = await db.reportProduct.findUnique({
      where: { slug },
    });

    if (existing) {
      console.log("Test report product already exists:", existing.id);
      return;
    }

    const product = await db.reportProduct.create({
      data: {
        slug,
        title: "Shadow Work Deep Dive",
        subtitle: "Your blind spots, your growth edge, your liberation",
        description:
          "A ~2,000-word personalized analysis of your shadow patterns based on your placements, undefined centers, and themes. Includes journaling prompts and a practical integration pathway.",
        category: "SHADOW_WORK",
        priceUsd: 4900, // $49.00 (cents)
        estimatedWordCount: 2000,
        isActive: true,
        sortOrder: 1,
        coverImageUrl: null,
        createdBy: "shomty@hotmail.com",
        geminiPrompt: `You are a deeply skilled Vedic astrologer and Human Design analyst specializing in shadow work and psychological integration.

The user is a {{hd_type}} with {{hd_authority}} Authority and a {{hd_profile}} profile.
Their Vedic Lagna is {{lagna}}, Moon Sign is in {{moon_sign}}, and they are currently in their {{current_dasha}} Mahadasha period.

Write a comprehensive, warm, and practically focused Shadow Work report for {{user_name}}.

The report should:
1. Open with a poetic but grounded framing of what shadow work means in their specific context
2. Identify their top 3 shadow themes from their chart data (12th house, undefined centers, Ketu themes)
3. Explain how each theme manifests in daily life — specific, observable behaviors
4. Provide 3-5 journaling prompts tailored to their exact configuration
5. Offer an integration pathway: practical steps, not just awareness
6. Close with an affirmation of their unique growth path

Tone: warm, non-clinical, non-predictive. Never say "you will".
Use "you may notice", "this pattern tends to", "your chart suggests".
Write in clear sections with markdown headings. Aim for 2,000 words minimum.
Every paragraph must feel written for THIS person specifically, not generic type.`,
      },
    });

    console.log("Created test report product:", product.id);
    console.log("Slug:", product.slug);
  } finally {
    // db is a singleton in this repo; leave it connected.
  }
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    // Prisma disconnect handled inside main (client is dynamically created).
  });

