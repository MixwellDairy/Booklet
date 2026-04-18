import { apiError, ok } from "@/lib/api/response";
import { getCurrentUserId } from "@/lib/auth";
import { getBookById, upsertCachedBook } from "@/lib/books/repository";
import { addShelfItem, listShelfItems } from "@/lib/shelf/repository";
import type { ShelfStatus } from "@/lib/types";
import { NextRequest } from "next/server";

const allowedStatuses: ShelfStatus[] = ["TBR", "READING", "READ", "DNF"];

function parseStatus(input: string | null): ShelfStatus | null {
  if (!input) {
    return null;
  }
  return allowedStatuses.includes(input as ShelfStatus) ? (input as ShelfStatus) : null;
}

export async function POST(request: NextRequest) {
  const userId = getCurrentUserId(request);

  let body: { bookId?: string; status?: string };
  try {
    body = (await request.json()) as { bookId?: string; status?: string };
  } catch {
    return apiError("INVALID_JSON", "Request body must be valid JSON.", 400);
  }

  const bookId = body.bookId?.trim();
  const status = parseStatus(body.status || "");

  if (!bookId || !status) {
    return apiError("VALIDATION_ERROR", "bookId and valid status are required.", 400);
  }

  try {
    const book = await getBookById(bookId);
    if (!book) {
      return apiError("NOT_FOUND", "Book not found.", 404);
    }

    await upsertCachedBook(book);
    const item = await addShelfItem({ userId, book, status });
    return ok({ item }, 201);
  } catch (error) {
    return apiError("SHELF_WRITE_ERROR", "Unable to update shelf.", 500, String(error));
  }
}

export async function GET(request: NextRequest) {
  const userId = getCurrentUserId(request);
  const status = parseStatus(request.nextUrl.searchParams.get("status"));

  if (request.nextUrl.searchParams.get("status") && !status) {
    return apiError("VALIDATION_ERROR", "Invalid status filter.", 400);
  }

  try {
    const items = await listShelfItems(userId, status || undefined);
    return ok({ items });
  } catch (error) {
    return apiError("SHELF_READ_ERROR", "Unable to read shelf items.", 500, String(error));
  }
}
