import { NextResponse } from "next/server";
import {
  bookkeepingErrorResponse,
  requireBookkeepingAdmin,
} from "@/lib/bookkeeping/api.server";
import {
  createProjectIncome,
  deleteProjectIncome,
  updateProjectIncome,
} from "@/lib/bookkeeping/storage.server";
import type {
  BkIncomeCategory,
  BkInvoiceTaxMode,
  BkPaymentMethod,
} from "@/lib/bookkeeping/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const denied = await requireBookkeepingAdmin();
  if (denied) return denied;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const income = await createProjectIncome({
      project_id: String(body.project_id ?? ""),
      income_category: body.income_category as BkIncomeCategory | undefined,
      received_date: String(body.received_date ?? ""),
      amount: Number(body.amount ?? 0),
      payment_method: body.payment_method as BkPaymentMethod | undefined,
      reference_no: body.reference_no ? String(body.reference_no) : undefined,
      invoice_tax_mode: body.invoice_tax_mode as BkInvoiceTaxMode | undefined,
      client_invoice_no: body.client_invoice_no ? String(body.client_invoice_no) : undefined,
      note: body.note ? String(body.note) : undefined,
    });
    return NextResponse.json({ income });
  } catch (error) {
    return bookkeepingErrorResponse(error);
  }
}

export async function PUT(request: Request) {
  const denied = await requireBookkeepingAdmin();
  if (denied) return denied;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const id = String(body.id ?? "");
    const income = await updateProjectIncome(id, {
      received_date: body.received_date ? String(body.received_date) : undefined,
      income_category: body.income_category as BkIncomeCategory | undefined,
      amount: body.amount === undefined ? undefined : Number(body.amount),
      payment_method: body.payment_method as BkPaymentMethod | undefined,
      reference_no:
        body.reference_no === undefined ? undefined : body.reference_no ? String(body.reference_no) : null,
      invoice_tax_mode: body.invoice_tax_mode as BkInvoiceTaxMode | undefined,
      client_invoice_no:
        body.client_invoice_no === undefined
          ? undefined
          : body.client_invoice_no
            ? String(body.client_invoice_no)
            : null,
      note: body.note === undefined ? undefined : body.note ? String(body.note) : null,
    });
    return NextResponse.json({ income });
  } catch (error) {
    return bookkeepingErrorResponse(error);
  }
}

export async function DELETE(request: Request) {
  const denied = await requireBookkeepingAdmin();
  if (denied) return denied;

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "缺少 id" }, { status: 400 });
    }
    await deleteProjectIncome(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return bookkeepingErrorResponse(error);
  }
}
