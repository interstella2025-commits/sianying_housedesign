import { NextResponse } from "next/server";
import {
  bookkeepingErrorResponse,
  requireBookkeepingAdmin,
} from "@/lib/bookkeeping/api.server";
import {
  createExpensePayment,
  deleteExpensePayment,
  updateExpensePayment,
} from "@/lib/bookkeeping/storage.server";
import type { BkPaymentMethod } from "@/lib/bookkeeping/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const denied = await requireBookkeepingAdmin();
  if (denied) return denied;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const payment = await createExpensePayment({
      expense_id: String(body.expense_id ?? ""),
      paid_date: String(body.paid_date ?? ""),
      amount: Number(body.amount ?? 0),
      payment_method: body.payment_method as BkPaymentMethod | undefined,
      reference_no: body.reference_no ? String(body.reference_no) : undefined,
      note: body.note ? String(body.note) : undefined,
    });
    return NextResponse.json({ payment });
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
    const payment = await updateExpensePayment(id, {
      paid_date: body.paid_date ? String(body.paid_date) : undefined,
      amount: body.amount === undefined ? undefined : Number(body.amount),
      payment_method: body.payment_method as BkPaymentMethod | undefined,
      reference_no:
        body.reference_no === undefined ? undefined : body.reference_no ? String(body.reference_no) : null,
      note: body.note === undefined ? undefined : body.note ? String(body.note) : null,
    });
    return NextResponse.json({ payment });
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
    await deleteExpensePayment(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return bookkeepingErrorResponse(error);
  }
}
