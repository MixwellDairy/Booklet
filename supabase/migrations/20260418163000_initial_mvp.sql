create table if not exists profiles (
  id uuid primary key,
  email text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists user_preferences (
  user_id uuid primary key references profiles(id) on delete cascade,
  fiction_only boolean not null default true,
  vibe_tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists books (
  id text primary key,
  title text not null,
  authors text[] not null default '{}',
  isbn13 text,
  page_count integer,
  categories text[] not null default '{}',
  description text,
  thumbnail_url text,
  published_date text,
  normalized_metadata jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists shelf_items (
  user_id uuid not null references profiles(id) on delete cascade,
  book_id text not null references books(id) on delete cascade,
  status text not null check (status in ('TBR', 'READING', 'READ', 'DNF')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, book_id)
);

create index if not exists idx_shelf_items_user_status on shelf_items(user_id, status);
create index if not exists idx_shelf_items_updated_at on shelf_items(updated_at desc);
create index if not exists idx_books_title on books(title);
create unique index if not exists idx_books_isbn13_unique on books(isbn13) where isbn13 is not null;
create index if not exists idx_books_authors_gin on books using gin (authors);
create index if not exists idx_books_categories_gin on books using gin (categories);
