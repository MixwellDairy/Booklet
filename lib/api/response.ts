import { NextResponse } from "next/server";
import type { ApiPayload } from "@/lib/types";

export function ok<T>(data: T, status = 200) {
  const payload: ApiPayload<T> = { ok: true, data };
  return NextResponse.json(payload, { status });
}

export function apiError(code: string, message: string, status = 400, details?: unknown) {
  const payload: ApiPayload<never> = {
    ok: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
  return NextResponse.json(payload, { status });
}
