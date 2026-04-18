import type { UserPreferences } from "@/lib/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const memoryPreferences = new Map<string, UserPreferences>();

function nowIso() {
  return new Date().toISOString();
}

export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return (
      memoryPreferences.get(userId) || {
        userId,
        fictionOnly: true,
        vibeTags: [],
        updatedAt: nowIso(),
      }
    );
  }

  const { data } = await supabase
    .from("user_preferences")
    .select("user_id,fiction_only,vibe_tags,updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) {
    return {
      userId,
      fictionOnly: true,
      vibeTags: [],
      updatedAt: nowIso(),
    };
  }

  return {
    userId: data.user_id,
    fictionOnly: data.fiction_only,
    vibeTags: data.vibe_tags || [],
    updatedAt: data.updated_at,
  };
}

export async function upsertUserPreferences(params: {
  userId: string;
  fictionOnly: boolean;
  vibeTags: string[];
}): Promise<UserPreferences> {
  const { userId, fictionOnly, vibeTags } = params;
  const updatedAt = nowIso();
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    const payload: UserPreferences = {
      userId,
      fictionOnly,
      vibeTags,
      updatedAt,
    };
    memoryPreferences.set(userId, payload);
    return payload;
  }

  const { data, error } = await supabase
    .from("user_preferences")
    .upsert(
      {
        user_id: userId,
        fiction_only: fictionOnly,
        vibe_tags: vibeTags,
        updated_at: updatedAt,
      },
      { onConflict: "user_id" },
    )
    .select("user_id,fiction_only,vibe_tags,updated_at")
    .single();

  if (error || !data) {
    throw new Error("Failed to upsert user preferences");
  }

  return {
    userId: data.user_id,
    fictionOnly: data.fiction_only,
    vibeTags: data.vibe_tags || [],
    updatedAt: data.updated_at,
  };
}
