import { NextResponse } from "next/server";
import {
  bookkeepingErrorResponse,
  requireBookkeepingAdmin,
} from "@/lib/bookkeeping/api.server";
import {
  createBookkeepingProject,
  listBookkeepingProjects,
  seedBookkeepingDemoData,
} from "@/lib/bookkeeping/storage.server";
import type { BkInvoiceTaxMode, BkProjectStatus } from "@/lib/bookkeeping/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const denied = await requireBookkeepingAdmin();
  if (denied) return denied;

  try {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") ?? undefined;
    const status = (url.searchParams.get("status") ?? "全部") as BkProjectStatus | "全部";
    const projects = await listBookkeepingProjects({ q, status });
    return NextResponse.json({ projects });
  } catch (error) {
    return bookkeepingErrorResponse(error);
  }
}

export async function POST(request: Request) {
  const denied = await requireBookkeepingAdmin();
  if (denied) return denied;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (body.action === "seed-demo") {
      const result = await seedBookkeepingDemoData();
      return NextResponse.json(result);
    }

    const project = await createBookkeepingProject({
      name: String(body.name ?? ""),
      client_name: body.client_name ? String(body.client_name) : undefined,
      client_phone: body.client_phone ? String(body.client_phone) : undefined,
      client_tax_id: body.client_tax_id ? String(body.client_tax_id) : undefined,
      client_invoice_tax_mode: body.client_invoice_tax_mode as BkInvoiceTaxMode | undefined,
      client_invoice_no: body.client_invoice_no ? String(body.client_invoice_no) : undefined,
      design_invoice_tax_mode: body.design_invoice_tax_mode as BkInvoiceTaxMode | undefined,
      design_invoice_no: body.design_invoice_no ? String(body.design_invoice_no) : undefined,
      prepayment_invoice_tax_mode: body.prepayment_invoice_tax_mode as BkInvoiceTaxMode | undefined,
      prepayment_invoice_no: body.prepayment_invoice_no ? String(body.prepayment_invoice_no) : undefined,
      design_fee_amount: body.design_fee_amount === undefined ? undefined : Number(body.design_fee_amount),
      prepayment_amount: body.prepayment_amount === undefined ? undefined : Number(body.prepayment_amount),
      address: body.address ? String(body.address) : undefined,
      contract_amount: Number(body.contract_amount ?? 0),
      status: body.status as BkProjectStatus | undefined,
      note: body.note ? String(body.note) : undefined,
    });
    return NextResponse.json({ project });
  } catch (error) {
    return bookkeepingErrorResponse(error);
  }
}
