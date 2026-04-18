import { describe, expect, it } from "vitest";
import { generateExternalLinks } from "../../lib/books/external-links";

describe("generateExternalLinks", () => {
  it("prefers ISBN for link queries when available", () => {
    const links = generateExternalLinks({
      title: "Mistborn",
      authors: ["Brandon Sanderson"],
      isbn13: "9780765311788",
    });

    expect(links.amazon).toContain("9780765311788");
    expect(links.appleBooks).toContain("9780765311788");
  });

  it("falls back to title+author when ISBN is missing", () => {
    const links = generateExternalLinks({
      title: "The Hobbit",
      authors: ["J.R.R. Tolkien"],
      isbn13: undefined,
    });

    expect(links.googlePlayBooks).toContain("The%20Hobbit%20J.R.R.%20Tolkien");
    expect(links.kobo).toContain("The%20Hobbit%20J.R.R.%20Tolkien");
  });
});
