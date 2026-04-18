import type { Book, RecConstraints, RecResult } from "@/lib/types";

function deterministicRank(candidates: Book[], constraints: RecConstraints): RecResult {
  const maxPages = constraints.maxPages;

  const ranked = [...candidates].sort((a, b) => {
    const aPages = a.pageCount ?? Number.MAX_SAFE_INTEGER;
    const bPages = b.pageCount ?? Number.MAX_SAFE_INTEGER;

    if (typeof maxPages === "number") {
      const aPenalty = aPages > maxPages ? 1 : 0;
      const bPenalty = bPages > maxPages ? 1 : 0;
      if (aPenalty !== bPenalty) {
        return aPenalty - bPenalty;
      }
    }

    if (aPages !== bPages) {
      return aPages - bPages;
    }

    return a.title.localeCompare(b.title);
  });

  const picks = ranked.slice(0, 5).map((book) => ({
    bookId: book.id,
    reason: "Deterministic fallback ranking: fiction-only, unread-first, and constraint-aware.",
  }));

  return {
    bestPick: picks[0] || {
      bookId: "",
      reason: "No candidates available",
    },
    picks,
    fallbackUsed: true,
  };
}

function safeParseGroqResult(content: string | null | undefined): RecResult | null {
  if (!content) {
    return null;
  }

  try {
    const parsed = JSON.parse(content) as Partial<RecResult>;
    if (!parsed.bestPick?.bookId || !Array.isArray(parsed.picks)) {
      return null;
    }

    return {
      bestPick: {
        bookId: parsed.bestPick.bookId,
        reason: parsed.bestPick.reason || "Top match",
      },
      picks: parsed.picks
        .filter((pick) => Boolean(pick.bookId))
        .slice(0, 5)
        .map((pick) => ({
          bookId: pick.bookId,
          reason: pick.reason || "Good fit",
        })),
      fallbackUsed: false,
    };
  } catch {
    return null;
  }
}

export async function rankCandidatesWithGroq(candidates: Book[], constraints: RecConstraints): Promise<RecResult> {
  if (!candidates.length) {
    return {
      bestPick: {
        bookId: "",
        reason: "No candidates available",
      },
      picks: [],
      fallbackUsed: true,
    };
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return deterministicRank(candidates, constraints);
  }

  const payload = {
    model: "llama-3.1-8b-instant",
    response_format: { type: "json_object" },
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "You rank fiction book candidates only. Return STRICT JSON with this exact shape: {\"bestPick\": {\"bookId\": string, \"reason\": string}, \"picks\": [{\"bookId\": string, \"reason\": string}]}. Return up to 5 picks and ensure bestPick is also present in picks.",
      },
      {
        role: "user",
        content: JSON.stringify({
          constraints,
          candidates: candidates.map((book) => ({
            id: book.id,
            title: book.title,
            authors: book.authors,
            categories: book.categories,
            pageCount: book.pageCount,
          })),
        }),
      },
    ],
  };

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return deterministicRank(candidates, constraints);
  }

  const data = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  const content = data.choices?.[0]?.message?.content;
  const parsed = safeParseGroqResult(content);
  if (!parsed || !parsed.picks.length) {
    return deterministicRank(candidates, constraints);
  }

  return parsed;
}
