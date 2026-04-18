import { apiError, ok } from "@/lib/api/response";
import { generateExternalLinks } from "@/lib/books/external-links";
import { getBookById } from "@/lib/books/repository";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id) {
    return apiError("VALIDATION_ERROR", "Book id is required.", 400);
  }

  try {
    const book = await getBookById(id);

    if (!book) {
      return apiError("NOT_FOUND", "Book not found.", 404);
    }

    return ok({
      book,
      links: generateExternalLinks(book),
    });
  } catch (error) {
    return apiError("BOOK_DETAIL_ERROR", "Unable to load book detail.", 500, String(error));
  }
}
