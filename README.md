# Booklet Web MVP (Fiction-Only)

This repository now contains an initial **web-only** MVP foundation for Booklet using Next.js (TypeScript + App Router).

Implemented vertical slice:
- auth-ready request/user structure (header-based user placeholder)
- onboarding preferences capture
- book search
- book detail with external links
- TBR shelf endpoints + UI
- recommendation endpoint scaffold with Groq + deterministic fallback

## Tech Stack
- Next.js (App Router, TypeScript)
- Supabase-first persistence (with in-memory fallback for local MVP runs without keys)
- Google Books API proxy/normalization
- Groq chat completions integration (server-side key only)
- Vitest unit tests

## Environment Variables
Copy `.env.example` to `.env.local` and fill values as available:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GROQ_API_KEY`

Notes:
- Supabase vars are optional for quick local runs; if omitted, API routes use an in-memory fallback store.
- `GROQ_API_KEY` is optional; recommendations fall back to deterministic ranking when absent.

## Database Migrations
Migration file:
- `/home/runner/work/Booklet/Booklet/supabase/migrations/20260418163000_initial_mvp.sql`

Apply with Supabase CLI (example):

```bash
supabase db push
```

Or run the SQL in your Supabase SQL editor.

Core tables:
- `profiles`
- `user_preferences` (fiction-only default `true`)
- `books` (external metadata cache)
- `shelf_items` (`TBR`, `READING`, `READ`, `DNF`)

Includes lookup indexes/constraints for shelf and book queries.

## Run Locally
```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts
- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run test`

## API Endpoints Implemented
- `GET /api/books/search?q=...`
- `GET /api/books/[id]`
- `POST /api/shelf`
- `GET /api/shelf?status=...`
- `PATCH /api/shelf/[bookId]`
- `GET /api/preferences`
- `POST /api/preferences`
- `POST /api/recs/next`

All endpoints return typed JSON payloads with user-friendly error envelopes.

## Assumptions
- Current auth is scaffolded (user resolved from `x-user-id` header or `demo-user`) and intended to be replaced by real Supabase Auth session handling.
- Fiction-only policy is enforced by normalized metadata/category filtering.
- External links are generated from ISBN-13 (preferred) or title/author search fallback.

## Next Iteration Follow-ups
- Replace placeholder user resolution with real required auth sessions.
- Add RLS policies and server auth context wiring for Supabase.
- Add richer discover source and stronger recommendation prompt evaluation.
- Improve shelf UX with inline add-from-search and optimistic updates.
