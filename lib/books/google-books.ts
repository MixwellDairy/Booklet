import type { Book } from "@/lib/types";

interface GoogleBooksVolume {
  id: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    description?: string;
    pageCount?: number;
    categories?: string[];
    publishedDate?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
  };
}

interface GoogleBooksSearchResponse {
  items?: GoogleBooksVolume[];
}

function extractIsbn13(volume: GoogleBooksVolume) {
  const identifiers = volume.volumeInfo?.industryIdentifiers || [];
  return identifiers.find((entry) => entry.type === "ISBN_13")?.identifier;
}

function inferFiction(categories: string[]) {
  if (!categories.length) {
    return true;
  }

  return categories.some((category) => category.toLowerCase().includes("fiction"));
}

export function normalizeGoogleBook(volume: GoogleBooksVolume): Book {
  const categories = volume.volumeInfo?.categories || [];

  return {
    id: volume.id,
    title: volume.volumeInfo?.title || "Untitled",
    authors: volume.volumeInfo?.authors || [],
    description: volume.volumeInfo?.description,
    pageCount: volume.volumeInfo?.pageCount,
    categories,
    publishedDate: volume.volumeInfo?.publishedDate,
    thumbnail:
      volume.volumeInfo?.imageLinks?.thumbnail ||
      volume.volumeInfo?.imageLinks?.smallThumbnail,
    isbn13: extractIsbn13(volume),
    isFiction: inferFiction(categories),
  };
}

export async function searchGoogleBooks(query: string, maxResults = 20): Promise<Book[]> {
  const url = new URL("https://www.googleapis.com/books/v1/volumes");
  url.searchParams.set("q", `${query} subject:fiction`);
  url.searchParams.set("maxResults", String(Math.min(Math.max(maxResults, 1), 40)));

  const response = await fetch(url.toString(), {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Google Books search failed with status ${response.status}`);
  }

  const payload = (await response.json()) as GoogleBooksSearchResponse;
  return (payload.items || []).map(normalizeGoogleBook).filter((book) => book.isFiction);
}

export async function getGoogleBookById(id: string): Promise<Book | null> {
  const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(id)}`, {
    next: { revalidate: 3600 },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Google Books detail failed with status ${response.status}`);
  }

  const volume = (await response.json()) as GoogleBooksVolume;
  const normalized = normalizeGoogleBook(volume);
  return normalized.isFiction ? normalized : null;
}
