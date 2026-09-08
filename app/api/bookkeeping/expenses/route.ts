import { NextResponse } from "next/server";
import {
  bookkeepingErrorResponse,
  requireBookkeepingAdmin,
} from "@/lib/bookkeeping/api.server";
import {
  createProjectExpense,
  deleteProjectExpense,
  updateProjectExpense,
} from "@/lib/bookkeeping/storage.server";
import type { BkPaymentStage, BkVendorInvoiceStatus, BkVendorTaxMode } from "@/lib/bookkeeping/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const denied = await requireBookkeepingAdmin();
  if (denied) return denied;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const expense = await createProjectExpense({
      project_id: String(body.project_id ?? ""),
      vendor_id: body.vendor_id ? String(body.vendor_id) : undefined,
      vendor_name: body.vendor_name ? String(body.vendor_name) : undefined,
      expense_date: String(body.expense_date ?? ""),
      trade: String(body.trade ?? ""),
      description: body.description ? String(body.description) : undefined,
      payable_amount: Number(body.payable_amount ?? 0),
      due_date: body.due_date ? String(body.due_date) : undefined,
      payment_stage: (body.payment_stage as BkPaymentStage | null | undefined) ?? null,
      invoice_no: body.invoice_no ? String(body.invoice_no) : undefined,
      invoice_amount:
        body.invoice_amount === undefined || body.invoice_amount === null || body.invoice_amount === ""
          ? undefined
          : Number(body.invoice_amount),
      vendor_tax_mode: body.vendor_tax_mode as BkVendorTaxMode | undefined,
      vendor_invoice_status: body.vendor_invoice_status as BkVendorInvoiceStatus | undefined,
      vendor_invoice_note: body.vendor_invoice_note ? String(body.vendor_invoice_note) : undefined,
      note: body.note ? String(body.note) : undefined,
    });
    return NextResponse.json({ expense });
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
    const expense = await updateProjectExpense(id, {
      vendor_id: body.vendor_id ? String(body.vendor_id) : undefined,
      vendor_name: body.vendor_name ? String(body.vendor_name) : undefined,
      expense_date: body.expense_date ? String(body.expense_date) : undefined,
      trade: body.trade ? String(body.trade) : undefined,
      description:
        body.description === undefined ? undefined : body.description ? String(body.description) : null,
      payable_amount: body.payable_amount === undefined ? undefined : Number(body.payable_amount),
      due_date: body.due_date === undefined ? undefined : body.due_date ? String(body.due_date) : null,
      payment_stage:
        body.payment_stage === undefined ? undefined : (body.payment_stage as BkPaymentStage | null),
      invoice_no:
        body.invoice_no === undefined ? undefined : body.invoice_no ? String(body.invoice_no) : null,
      invoice_amount:
        body.invoice_amount === undefined
          ? undefined
          : body.invoice_amount === null || body.invoice_amount === ""
            ? null
            : Number(body.invoice_amount),
      vendor_tax_mode: body.vendor_tax_mode as BkVendorTaxMode | undefined,
      vendor_invoice_status: body.vendor_invoice_status as BkVendorInvoiceStatus | undefined,
      vendor_invoice_note:
        body.vendor_invoice_note === undefined
          ? undefined
          : body.vendor_invoice_note
            ? String(body.vendor_invoice_note)
            : null,
      note: body.note === undefined ? undefined : body.note ? String(body.note) : null,
    });
    return NextResponse.json({ expense });
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
    await deleteProjectExpense(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return bookkeepingErrorResponse(error);
  }
}
