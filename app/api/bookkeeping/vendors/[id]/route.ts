import { NextResponse } from "next/server";
import {
  bookkeepingErrorResponse,
  requireBookkeepingAdmin,
} from "@/lib/bookkeeping/api.server";
import {
  deleteBookkeepingVendor,
  getBookkeepingVendor,
  updateBookkeepingVendor,
} from "@/lib/bookkeeping/storage.server";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const denied = await requireBookkeepingAdmin();
  if (denied) return denied;

  try {
    const { id } = await context.params;
    const url = new URL(request.url);
    const detail = await getBookkeepingVendor(id, {
      projectId: url.searchParams.get("projectId") ?? undefined,
      trade: url.searchParams.get("trade") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
      month: url.searchParams.get("month") ?? undefined,
      dateFrom: url.searchParams.get("dateFrom") ?? undefined,
      dateTo: url.searchParams.get("dateTo") ?? undefined,
    });
    if (!detail) {
      return NextResponse.json({ error: "找不到廠商" }, { status: 404 });
    }
    return NextResponse.json(detail);
  } catch (error) {
    return bookkeepingErrorResponse(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const denied = await requireBookkeepingAdmin();
  if (denied) return denied;

  try {
    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const vendor = await updateBookkeepingVendor(id, {
      name: body.name ? String(body.name) : undefined,
      trade: body.trade === undefined ? undefined : body.trade ? String(body.trade) : null,
      contact_name:
        body.contact_name === undefined ? undefined : body.contact_name ? String(body.contact_name) : null,
      phone: body.phone === undefined ? undefined : body.phone ? String(body.phone) : null,
      tax_id: body.tax_id === undefined ? undefined : body.tax_id ? String(body.tax_id) : null,
      bank_info:
        body.bank_info === undefined ? undefined : body.bank_info ? String(body.bank_info) : null,
      note: body.note === undefined ? undefined : body.note ? String(body.note) : null,
    });
    return NextResponse.json({ vendor });
  } catch (error) {
    return bookkeepingErrorResponse(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const denied = await requireBookkeepingAdmin();
  if (denied) return denied;

  try {
    const { id } = await context.params;
    await deleteBookkeepingVendor(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return bookkeepingErrorResponse(error);
  }
}
