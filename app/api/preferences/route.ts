import { apiError, ok } from "@/lib/api/response";
import { getCurrentUserId } from "@/lib/auth";
import { getUserPreferences, upsertUserPreferences } from "@/lib/preferences/repository";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const userId = getCurrentUserId(request);

  try {
    const preferences = await getUserPreferences(userId);
    return ok({ preferences });
  } catch (error) {
    return apiError("PREFERENCES_READ_ERROR", "Unable to load preferences.", 500, String(error));
  }
}

export async function POST(request: NextRequest) {
  const userId = getCurrentUserId(request);

  let body: { fictionOnly?: boolean; vibeTags?: string[] };
  try {
    body = (await request.json()) as { fictionOnly?: boolean; vibeTags?: string[] };
  } catch {
    return apiError("INVALID_JSON", "Request body must be valid JSON.", 400);
  }

  const fictionOnly = body.fictionOnly !== false;
  const vibeTags = Array.isArray(body.vibeTags)
    ? body.vibeTags.map((tag) => tag.trim()).filter(Boolean).slice(0, 20)
    : [];

  try {
    const preferences = await upsertUserPreferences({ userId, fictionOnly, vibeTags });
    return ok({ preferences });
  } catch (error) {
    return apiError("PREFERENCES_WRITE_ERROR", "Unable to save preferences.", 500, String(error));
  }
}
