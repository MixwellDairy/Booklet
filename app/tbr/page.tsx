"use client";

import { useState } from "react";
import type { ShelfItem, ShelfStatus } from "@/lib/types";

const statuses: ShelfStatus[] = ["TBR", "READING", "READ", "DNF"];

export default function TbrPage() {
  const [items, setItems] = useState<ShelfItem[]>([]);
  const [filter, setFilter] = useState<ShelfStatus | "ALL">("ALL");
  const [error, setError] = useState<string | null>(null);

  async function loadItems(selectedStatus: ShelfStatus | "ALL") {
    const query = selectedStatus === "ALL" ? "" : `?status=${selectedStatus}`;
    const response = await fetch(`/api/shelf${query}`);
    const payload = (await response.json()) as {
      ok: boolean;
      data?: { items: ShelfItem[] };
      error?: { message: string };
    };

    if (!payload.ok || !payload.data) {
      setError(payload.error?.message || "Unable to load shelf items.");
      return;
    }

    setError(null);
    setItems(payload.data.items);
  }

  async function updateStatus(bookId: string, status: ShelfStatus) {
    await fetch(`/api/shelf/${encodeURIComponent(bookId)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    await loadItems(filter);
  }

  return (
    <div className="stack">
      <h1>My shelf</h1>
      <div className="card stack">
        <label htmlFor="status-filter">Filter by status</label>
        <select
          id="status-filter"
          value={filter}
          onChange={(event) => {
            const nextFilter = event.target.value as ShelfStatus | "ALL";
            setFilter(nextFilter);
            void loadItems(nextFilter);
          }}
        >
          <option value="ALL">All</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <button onClick={() => void loadItems(filter)}>Load shelf</button>
      </div>

      {error ? <p className="muted">{error}</p> : null}

      <div className="stack">
        {items.map((item) => (
          <article key={item.bookId} className="card stack">
            <h3>{item.book?.title || item.bookId}</h3>
            <p className="muted">Current status: {item.status}</p>
            <div className="stack">
              {statuses.map((status) => (
                <button key={status} onClick={() => updateStatus(item.bookId, status)}>
                  Mark {status}
                </button>
              ))}
            </div>
          </article>
        ))}
        {!items.length ? <p className="muted">Your shelf is empty. Add books from Search.</p> : null}
      </div>
    </div>
  );
}
