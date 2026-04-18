import { getGoogleBookById } from "@/lib/books/google-books";
import type { Book } from "@/lib/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const memoryBooks = new Map<string, Book>();

function mapDbBook(row: {
  normalized_metadata: Book;
}): Book {
  return row.normalized_metadata;
}

export async function getCachedBookById(bookId: string): Promise<Book | null> {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return memoryBooks.get(bookId) || null;
  }

  const { data, error } = await supabase
    .from("books")
    .select("normalized_metadata")
    .eq("id", bookId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapDbBook(data as { normalized_metadata: Book });
}

export async function upsertCachedBook(book: Book): Promise<void> {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    memoryBooks.set(book.id, book);
    return;
  }

  await supabase.from("books").upsert(
    {
      id: book.id,
      title: book.title,
      authors: book.authors,
      isbn13: book.isbn13,
      page_count: book.pageCount,
      categories: book.categories,
      description: book.description,
      thumbnail_url: book.thumbnail,
      published_date: book.publishedDate,
      normalized_metadata: book,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
}

export async function getBookById(bookId: string): Promise<Book | null> {
  const cached = await getCachedBookById(bookId);
  if (cached) {
    return cached;
  }

  const remote = await getGoogleBookById(bookId);
  if (!remote) {
    return null;
  }

  await upsertCachedBook(remote);
  return remote;
}
