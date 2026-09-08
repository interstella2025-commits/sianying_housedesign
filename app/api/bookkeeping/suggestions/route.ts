import { NextResponse } from "next/server";
import {
  bookkeepingErrorResponse,
  requireBookkeepingAdmin,
} from "@/lib/bookkeeping/api.server";
import { listBookkeepingSuggestions } from "@/lib/bookkeeping/storage.server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const denied = await requireBookkeepingAdmin();
  if (denied) return denied;

  try {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") ?? undefined;
    const suggestions = await listBookkeepingSuggestions(q);
    return NextResponse.json(suggestions);
  } catch (error) {
    return bookkeepingErrorResponse(error);
  }
}
