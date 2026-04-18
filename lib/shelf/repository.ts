import type { Book, ShelfItem, ShelfStatus } from "@/lib/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const memoryShelf = new Map<string, ShelfItem[]>();

function nowIso() {
  return new Date().toISOString();
}

function validStatus(status: string): status is ShelfStatus {
  return ["TBR", "READING", "READ", "DNF"].includes(status);
}

export async function addShelfItem(params: {
  userId: string;
  book: Book;
  status: ShelfStatus;
}): Promise<ShelfItem> {
  const { userId, book, status } = params;

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    const existing = memoryShelf.get(userId) || [];
    const current = existing.find((entry) => entry.bookId === book.id);

    if (current) {
      current.status = status;
      current.updatedAt = nowIso();
      current.book = book;
      return current;
    }

    const item: ShelfItem = {
      userId,
      bookId: book.id,
      status,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      book,
    };

    memoryShelf.set(userId, [...existing, item]);
    return item;
  }

  const { data, error } = await supabase
    .from("shelf_items")
    .upsert(
      {
        user_id: userId,
        book_id: book.id,
        status,
        updated_at: nowIso(),
      },
      { onConflict: "user_id,book_id" },
    )
    .select("user_id,book_id,status,created_at,updated_at")
    .single();

  if (error || !data) {
    throw new Error("Failed to upsert shelf item");
  }

  return {
    userId: data.user_id,
    bookId: data.book_id,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    book,
  };
}

export async function listShelfItems(userId: string, status?: ShelfStatus): Promise<ShelfItem[]> {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    const items = memoryShelf.get(userId) || [];
    return status ? items.filter((item) => item.status === status) : items;
  }

  let query = supabase
    .from("shelf_items")
    .select("user_id,book_id,status,created_at,updated_at,books(normalized_metadata)")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (status && validStatus(status)) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error || !data) {
    throw new Error("Failed to list shelf items");
  }

  return data.map((row) => {
    const bookSource = row.books as unknown;
    const bookPayload = (Array.isArray(bookSource) ? bookSource[0] : bookSource) as
      | { normalized_metadata?: Book }
      | null;
    const book = bookPayload?.normalized_metadata;

    return {
      userId: row.user_id,
      bookId: row.book_id,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      ...(book ? { book } : {}),
    };
  });
}

export async function updateShelfStatus(params: {
  userId: string;
  bookId: string;
  status: ShelfStatus;
}): Promise<ShelfItem | null> {
  const { userId, bookId, status } = params;
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    const items = memoryShelf.get(userId) || [];
    const found = items.find((item) => item.bookId === bookId);

    if (!found) {
      return null;
    }

    found.status = status;
    found.updatedAt = nowIso();
    return found;
  }

  const { data, error } = await supabase
    .from("shelf_items")
    .update({ status, updated_at: nowIso() })
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .select("user_id,book_id,status,created_at,updated_at")
    .maybeSingle();

  if (error) {
    throw new Error("Failed to update shelf item");
  }

  if (!data) {
    return null;
  }

  return {
    userId: data.user_id,
    bookId: data.book_id,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
