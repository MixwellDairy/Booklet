import { describe, expect, it } from "vitest";
import { buildRecommendationCandidates } from "../../lib/recommendations/candidates";
import type { Book, ShelfItem } from "../../lib/types";

function makeBook(id: string, title: string, categories: string[], isFiction = true): Book {
  return {
    id,
    title,
    authors: ["Author"],
    categories,
    isFiction,
  };
}

describe("buildRecommendationCandidates", () => {
  it("excludes READ/DNF and keeps fiction-only candidates with TBR priority", () => {
    const tbr = makeBook("1", "TBR Book", ["Fiction"]);
    const reading = makeBook("2", "Reading Book", ["Literary Fiction"]);
    const read = makeBook("3", "Read Book", ["Fiction"]);
    const dnf = makeBook("4", "DNF Book", ["Fiction"]);
    const nonFictionDiscover = makeBook("5", "Memoir", ["Biography"], false);
    const fictionDiscover = makeBook("6", "Discover Fiction", ["Fantasy Fiction"]);

    const shelfItems: ShelfItem[] = [
      { userId: "u", bookId: tbr.id, status: "TBR", createdAt: "", updatedAt: "", book: tbr },
      { userId: "u", bookId: reading.id, status: "READING", createdAt: "", updatedAt: "", book: reading },
      { userId: "u", bookId: read.id, status: "READ", createdAt: "", updatedAt: "", book: read },
      { userId: "u", bookId: dnf.id, status: "DNF", createdAt: "", updatedAt: "", book: dnf },
    ];

    const results = buildRecommendationCandidates({
      shelfItems,
      discoverBooks: [nonFictionDiscover, fictionDiscover],
    });

    expect(results.map((book) => book.id)).toEqual(["1", "2", "6"]);
  });
});
