import Link from "next/link";

export default function HomePage() {
  return (
    <div className="stack">
      <section className="card stack">
        <h1>Booklet (Web MVP)</h1>
        <p className="muted">
          Fiction-only recommendations with link-out buying/reading options.
        </p>
        <div>
          <Link href="/search">Search books</Link> · <Link href="/tbr">Open your shelf</Link> ·{" "}
          <Link href="/onboarding">Set preferences</Link>
        </div>
      </section>

      <section className="card stack">
        <h2>Get next recommendations</h2>
        <p className="muted">Use the API endpoint directly for now:</p>
        <code>POST /api/recs/next</code>
      </section>
    </div>
  );
}
