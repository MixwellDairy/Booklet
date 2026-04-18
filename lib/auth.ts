import type { NextRequest } from "next/server";

export function getCurrentUserId(request: NextRequest): string {
  return request.headers.get("x-user-id") || "demo-user";
}
