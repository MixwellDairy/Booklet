import type { Book, ShelfItem } from "@/lib/types";

function isExcludedStatus(status: ShelfItem["status"]) {
  return status === "READ" || status === "DNF";
}

function isFictionBook(book: Book) {
  if (!book.isFiction) {
    return false;
  }

  if (!book.categories.length) {
    return true;
  }

  return book.categories.some((category) => category.toLowerCase().includes("fiction"));
}

export function buildRecommendationCandidates(params: {
  shelfItems: ShelfItem[];
  discoverBooks: Book[];
  maxCandidates?: number;
}): Book[] {
  const { shelfItems, discoverBooks, maxCandidates = 50 } = params;

  const seenIds = new Set<string>();

  const tbrBooks = shelfItems
    .filter((item) => item.status === "TBR" && item.book && isFictionBook(item.book))
    .map((item) => item.book as Book);

  const otherShelfUnread = shelfItems
    .filter((item) => !isExcludedStatus(item.status) && item.status !== "TBR" && item.book && isFictionBook(item.book))
    .map((item) => item.book as Book);

  const discoverFiction = discoverBooks.filter(isFictionBook);

  const ordered = [...tbrBooks, ...otherShelfUnread, ...discoverFiction].filter((book) => {
    if (seenIds.has(book.id)) {
      return false;
    }
    seenIds.add(book.id);
    return true;
  });

  return ordered.slice(0, maxCandidates);
}
