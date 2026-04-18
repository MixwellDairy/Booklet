"use client";

import { FormEvent, useEffect, useState } from "react";

export default function OnboardingPage() {
  const [fictionOnly, setFictionOnly] = useState(true);
  const [vibeTags, setVibeTags] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/preferences")
      .then((response) => response.json())
      .then((payload: { ok: boolean; data?: { preferences: { fictionOnly: boolean; vibeTags: string[] } } }) => {
        if (!payload.ok || !payload.data) {
          return;
        }

        setFictionOnly(payload.data.preferences.fictionOnly);
        setVibeTags(payload.data.preferences.vibeTags.join(", "));
      })
      .catch(() => {
        setMessage("Could not load existing preferences.");
      });
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const tags = vibeTags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const response = await fetch("/api/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fictionOnly, vibeTags: tags }),
    });

    const payload = (await response.json()) as { ok: boolean; error?: { message: string } };

    if (!payload.ok) {
      setMessage(payload.error?.message || "Unable to save preferences.");
      return;
    }

    setMessage("Preferences saved.");
  }

  return (
    <div className="stack">
      <h1>Onboarding preferences</h1>
      <form onSubmit={onSubmit} className="card stack">
        <label>
          <input
            type="checkbox"
            checked={fictionOnly}
            onChange={(event) => setFictionOnly(event.target.checked)}
          />{" "}
          Fiction only
        </label>

        <label htmlFor="vibe-tags">Vibe tags (comma-separated)</label>
        <input
          id="vibe-tags"
          value={vibeTags}
          onChange={(event) => setVibeTags(event.target.value)}
          placeholder="cozy, dark academia, enemies-to-lovers"
        />

        <button type="submit">Save preferences</button>
      </form>

      {message ? <p className="muted">{message}</p> : null}
    </div>
  );
}
