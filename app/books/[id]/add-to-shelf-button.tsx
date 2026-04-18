"use client";

import { useState } from "react";

export function AddToShelfButton({ bookId }: { bookId: string }) {
  const [message, setMessage] = useState<string | null>(null);

  async function addToTbr() {
    const response = await fetch("/api/shelf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bookId, status: "TBR" }),
    });

    const payload = (await response.json()) as { ok: boolean; error?: { message: string } };

    if (!payload.ok) {
      setMessage(payload.error?.message || "Unable to add to shelf.");
      return;
    }

    setMessage("Added to TBR shelf.");
  }

  return (
    <div className="stack">
      <button type="button" onClick={() => void addToTbr()}>
        Add to TBR
      </button>
      {message ? <p className="muted">{message}</p> : null}
    </div>
  );
}
