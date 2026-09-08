import { NextResponse } from "next/server";
import {
  bookkeepingErrorResponse,
  requireBookkeepingAdmin,
} from "@/lib/bookkeeping/api.server";
import {
  deleteBookkeepingProject,
  getBookkeepingProject,
  updateBookkeepingProject,
} from "@/lib/bookkeeping/storage.server";
import type { BkInvoiceTaxMode, BkProjectStatus } from "@/lib/bookkeeping/types";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const denied = await requireBookkeepingAdmin();
  if (denied) return denied;

  try {
    const { id } = await context.params;
    const detail = await getBookkeepingProject(id);
    if (!detail) {
      return NextResponse.json({ error: "找不到案件" }, { status: 404 });
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
    const project = await updateBookkeepingProject(id, {
      name: body.name ? String(body.name) : undefined,
      client_name: body.client_name === undefined ? undefined : body.client_name ? String(body.client_name) : null,
      client_phone:
        body.client_phone === undefined ? undefined : body.client_phone ? String(body.client_phone) : null,
      client_tax_id:
        body.client_tax_id === undefined ? undefined : body.client_tax_id ? String(body.client_tax_id) : null,
      client_invoice_tax_mode: body.client_invoice_tax_mode as BkInvoiceTaxMode | undefined,
      client_invoice_no:
        body.client_invoice_no === undefined
          ? undefined
          : body.client_invoice_no
            ? String(body.client_invoice_no)
            : null,
      design_invoice_tax_mode: body.design_invoice_tax_mode as BkInvoiceTaxMode | undefined,
      design_invoice_no:
        body.design_invoice_no === undefined
          ? undefined
          : body.design_invoice_no
            ? String(body.design_invoice_no)
            : null,
      prepayment_invoice_tax_mode: body.prepayment_invoice_tax_mode as BkInvoiceTaxMode | undefined,
      prepayment_invoice_no:
        body.prepayment_invoice_no === undefined
          ? undefined
          : body.prepayment_invoice_no
            ? String(body.prepayment_invoice_no)
            : null,
      design_fee_amount:
        body.design_fee_amount === undefined ? undefined : Number(body.design_fee_amount),
      prepayment_amount:
        body.prepayment_amount === undefined ? undefined : Number(body.prepayment_amount),
      address: body.address === undefined ? undefined : body.address ? String(body.address) : null,
      contract_amount: body.contract_amount === undefined ? undefined : Number(body.contract_amount),
      status: body.status as BkProjectStatus | undefined,
      note: body.note === undefined ? undefined : body.note ? String(body.note) : null,
    });
    return NextResponse.json({ project });
  } catch (error) {
    return bookkeepingErrorResponse(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const denied = await requireBookkeepingAdmin();
  if (denied) return denied;

  try {
    const { id } = await context.params;
    await deleteBookkeepingProject(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return bookkeepingErrorResponse(error);
  }
}
