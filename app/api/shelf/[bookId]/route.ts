import { apiError, ok } from "@/lib/api/response";
import { getCurrentUserId } from "@/lib/auth";
import { updateShelfStatus } from "@/lib/shelf/repository";
import type { ShelfStatus } from "@/lib/types";
import { NextRequest } from "next/server";

const allowedStatuses: ShelfStatus[] = ["TBR", "READING", "READ", "DNF"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> },
) {
  const userId = getCurrentUserId(request);
  const { bookId } = await params;

  let body: { status?: string };
  try {
    body = (await request.json()) as { status?: string };
  } catch {
    return apiError("INVALID_JSON", "Request body must be valid JSON.", 400);
  }

  const status = body.status as ShelfStatus;
  if (!allowedStatuses.includes(status)) {
    return apiError("VALIDATION_ERROR", "status must be one of TBR, READING, READ, DNF.", 400);
  }

  try {
    const item = await updateShelfStatus({ userId, bookId, status });
    if (!item) {
      return apiError("NOT_FOUND", "Shelf item not found.", 404);
    }

    return ok({ item });
  } catch (error) {
    return apiError("SHELF_UPDATE_ERROR", "Unable to update shelf status.", 500, String(error));
  }
}
