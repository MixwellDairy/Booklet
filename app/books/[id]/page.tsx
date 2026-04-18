import Link from "next/link";
import { notFound } from "next/navigation";
import { generateExternalLinks } from "@/lib/books/external-links";
import { getBookById } from "@/lib/books/repository";
import { AddToShelfButton } from "./add-to-shelf-button";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await getBookById(id);

  if (!book) {
    notFound();
  }

  const links = generateExternalLinks(book);

  return (
    <div className="stack">
      <section className="card stack">
        <h1>{book.title}</h1>
        <p className="muted">{book.authors.join(", ") || "Unknown author"}</p>
        {book.pageCount ? <p>{book.pageCount} pages</p> : null}
        {book.description ? <p>{book.description}</p> : null}
      </section>

      <section className="card stack">
        <h2>Where to read or buy</h2>
        <a href={links.amazon} target="_blank" rel="noreferrer">Amazon</a>
        <a href={links.appleBooks} target="_blank" rel="noreferrer">Apple Books</a>
        <a href={links.googlePlayBooks} target="_blank" rel="noreferrer">Google Play Books</a>
        <a href={links.kobo} target="_blank" rel="noreferrer">Kobo</a>
      </section>

      <section className="card stack">
        <h2>Add to shelf</h2>
        <AddToShelfButton bookId={book.id} />
        <Link href="/tbr">Go to shelf</Link>
      </section>
    </div>
  );
}
