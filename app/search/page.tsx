"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import type { Book } from "@/lib/types";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!query.trim()) {
      setError("Please enter a search term.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`);
      const payload = (await response.json()) as {
        ok: boolean;
        data?: { books: Book[] };
        error?: { message: string };
      };

      if (!payload.ok || !payload.data) {
        setError(payload.error?.message || "Search failed.");
        setBooks([]);
        return;
      }

      setBooks(payload.data.books);
    } catch {
      setError("Search failed.");
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }

  async function addToTbr(bookId: string) {
    const response = await fetch("/api/shelf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bookId, status: "TBR" }),
    });

    const payload = (await response.json()) as { ok: boolean; error?: { message: string } };
    if (!payload.ok) {
      setError(payload.error?.message || "Unable to add to shelf.");
      setMessage(null);
      return;
    }

    setError(null);
    setMessage("Added to TBR shelf.");
  }

  return (
    <div className="stack">
      <h1>Search fiction books</h1>
      <form onSubmit={onSubmit} className="card stack">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Title, author, or vibe"
          aria-label="Search query"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error ? <p className="muted">{error}</p> : null}
      {message ? <p className="muted">{message}</p> : null}

      <div className="grid">
        {books.map((book) => (
          <article key={book.id} className="card stack">
            <h3>{book.title}</h3>
            <p className="muted">{book.authors.join(", ") || "Unknown author"}</p>
            <div>
              <Link href={`/books/${encodeURIComponent(book.id)}`}>View details</Link>
            </div>
            <button type="button" onClick={() => void addToTbr(book.id)}>
              Add to TBR
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
