import { apiError, ok } from "@/lib/api/response";
import { getCurrentUserId } from "@/lib/auth";
import { searchGoogleBooks } from "@/lib/books/google-books";
import { buildRecommendationCandidates } from "@/lib/recommendations/candidates";
import { rankCandidatesWithGroq } from "@/lib/recommendations/groq";
import { listShelfItems } from "@/lib/shelf/repository";
import type { RecConstraints } from "@/lib/types";
import { NextRequest } from "next/server";

async function discoverFallback(constraints: RecConstraints) {
  const seed = constraints.mood?.trim() || constraints.vibeTags?.[0] || "bestseller";
  try {
    return await searchGoogleBooks(`fiction ${seed}`, 20);
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  const userId = getCurrentUserId(request);

  let body: RecConstraints;
  try {
    body = (await request.json()) as RecConstraints;
  } catch {
    return apiError("INVALID_JSON", "Request body must be valid JSON.", 400);
  }

  const maxPages = body.maxPages;
  if (typeof maxPages !== "undefined" && (!Number.isInteger(maxPages) || maxPages <= 0)) {
    return apiError("VALIDATION_ERROR", "maxPages must be a positive integer.", 400);
  }

  try {
    const [shelfItems, discoverBooks] = await Promise.all([
      listShelfItems(userId),
      discoverFallback(body),
    ]);

    const candidatePool = buildRecommendationCandidates({
      shelfItems,
      discoverBooks,
      maxCandidates: 60,
    }).filter((book) => (typeof maxPages === "number" ? (book.pageCount || 0) <= maxPages : true));

    const ranking = await rankCandidatesWithGroq(candidatePool, body);

    const bookLookup = new Map(candidatePool.map((book) => [book.id, book]));

    return ok({
      ...ranking,
      candidatesCount: candidatePool.length,
      picks: ranking.picks.map((pick) => ({
        ...pick,
        book: bookLookup.get(pick.bookId) || null,
      })),
      bestPick: {
        ...ranking.bestPick,
        book: bookLookup.get(ranking.bestPick.bookId) || null,
      },
    });
  } catch (error) {
    return apiError("RECOMMENDATION_ERROR", "Unable to generate recommendations.", 500, String(error));
  }
}
