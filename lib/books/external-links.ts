import type { Book } from "@/lib/types";

export interface ExternalLinks {
  amazon: string;
  appleBooks: string;
  googlePlayBooks: string;
  kobo: string;
}

function encodeQuery(value: string) {
  return encodeURIComponent(value.trim());
}

function getBookQuery(book: Pick<Book, "title" | "authors" | "isbn13">): string {
  if (book.isbn13) {
    return book.isbn13;
  }
  const author = book.authors[0] ? ` ${book.authors[0]}` : "";
  return `${book.title}${author}`;
}

export function generateExternalLinks(book: Pick<Book, "title" | "authors" | "isbn13">): ExternalLinks {
  const query = encodeQuery(getBookQuery(book));

  return {
    amazon: `https://www.amazon.com/s?k=${query}`,
    appleBooks: `https://books.apple.com/us/search?term=${query}`,
    googlePlayBooks: `https://play.google.com/store/search?q=${query}&c=books`,
    kobo: `https://www.kobo.com/us/en/search?query=${query}`,
  };
}
