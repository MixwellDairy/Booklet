export type ShelfStatus = "TBR" | "READING" | "READ" | "DNF";

export interface Book {
  id: string;
  title: string;
  authors: string[];
  description?: string;
  pageCount?: number;
  categories: string[];
  publishedDate?: string;
  thumbnail?: string;
  isbn13?: string;
  isFiction: boolean;
}

export interface ShelfItem {
  userId: string;
  bookId: string;
  status: ShelfStatus;
  createdAt: string;
  updatedAt: string;
  book?: Book;
}

export interface UserPreferences {
  userId: string;
  fictionOnly: boolean;
  vibeTags: string[];
  updatedAt: string;
}

export interface RecConstraints {
  mood?: string;
  maxPages?: number;
  vibeTags?: string[];
}

export interface RankedPick {
  bookId: string;
  reason: string;
}

export interface RecResult {
  bestPick: RankedPick;
  picks: RankedPick[];
  fallbackUsed: boolean;
}

export interface ApiErrorPayload {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface ApiSuccessPayload<T> {
  ok: true;
  data: T;
}

export type ApiPayload<T> = ApiSuccessPayload<T> | ApiErrorPayload;
