import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Booklet MVP",
  description: "Fiction-only book recommendation web MVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <nav className="site-nav">
            <Link href="/">Booklet</Link>
            <div className="site-nav-links">
              <Link href="/search">Search</Link>
              <Link href="/tbr">TBR Shelf</Link>
              <Link href="/onboarding">Preferences</Link>
            </div>
          </nav>
        </header>
        <main className="main-container">{children}</main>
      </body>
    </html>
  );
}
