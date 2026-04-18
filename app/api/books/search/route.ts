import { apiError, ok } from "@/lib/api/response";
import { searchGoogleBooks } from "@/lib/books/google-books";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();

  if (!q) {
    return apiError("VALIDATION_ERROR", "Query parameter 'q' is required.", 400);
  }

  try {
    const books = await searchGoogleBooks(q);
    return ok({ books });
  } catch (error) {
    return apiError("UPSTREAM_ERROR", "Unable to search books right now.", 502, String(error));
  }
}
