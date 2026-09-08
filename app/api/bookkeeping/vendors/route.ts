import { NextResponse } from "next/server";
import {
  bookkeepingErrorResponse,
  requireBookkeepingAdmin,
} from "@/lib/bookkeeping/api.server";
import {
  createBookkeepingVendor,
  listBookkeepingVendors,
  listBookkeepingVendorsSimple,
} from "@/lib/bookkeeping/storage.server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const denied = await requireBookkeepingAdmin();
  if (denied) return denied;

  try {
    const url = new URL(request.url);
    const simple = url.searchParams.get("simple") === "1";
    if (simple) {
      const vendors = await listBookkeepingVendorsSimple();
      return NextResponse.json({ vendors });
    }

    const q = url.searchParams.get("q") ?? undefined;
    const vendors = await listBookkeepingVendors({ q });
    return NextResponse.json({ vendors });
  } catch (error) {
    return bookkeepingErrorResponse(error);
  }
}

export async function POST(request: Request) {
  const denied = await requireBookkeepingAdmin();
  if (denied) return denied;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const vendor = await createBookkeepingVendor({
      name: String(body.name ?? ""),
      trade: body.trade ? String(body.trade) : undefined,
      contact_name: body.contact_name ? String(body.contact_name) : undefined,
      phone: body.phone ? String(body.phone) : undefined,
      tax_id: body.tax_id ? String(body.tax_id) : undefined,
      bank_info: body.bank_info ? String(body.bank_info) : undefined,
      note: body.note ? String(body.note) : undefined,
    });
    return NextResponse.json({ vendor });
  } catch (error) {
    return bookkeepingErrorResponse(error);
  }
}
