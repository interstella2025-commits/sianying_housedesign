import type { BkVendorInvoiceStatus, BkVendorTaxMode } from "@/lib/bookkeeping/types";
import { BK_VENDOR_TAX_MODES, BK_VENDOR_TAXABLE_INVOICE_STATUSES } from "@/lib/bookkeeping/types";

export { BK_VENDOR_TAX_MODES, BK_VENDOR_TAXABLE_INVOICE_STATUSES };

export function deriveVendorTaxMode(input: {
  vendor_tax_mode?: BkVendorTaxMode | null;
  vendor_invoice_status?: BkVendorInvoiceStatus | null;
}): BkVendorTaxMode {
  if (input.vendor_tax_mode && BK_VENDOR_TAX_MODES.includes(input.vendor_tax_mode)) {
    return input.vendor_tax_mode;
  }
  if (input.vendor_invoice_status === "不需") return "免稅";
  return "應稅";
}

export function normalizeVendorExpenseTax(input: {
  vendor_tax_mode?: BkVendorTaxMode | null;
  vendor_invoice_status?: BkVendorInvoiceStatus | null;
}): { vendor_tax_mode: BkVendorTaxMode; vendor_invoice_status: BkVendorInvoiceStatus } {
  const vendor_tax_mode = deriveVendorTaxMode(input);

  if (vendor_tax_mode === "免稅") {
    return { vendor_tax_mode: "免稅", vendor_invoice_status: "不需" };
  }

  const vendor_invoice_status =
    input.vendor_invoice_status === "已收到" ? "已收到" : "待收";

  return { vendor_tax_mode: "應稅", vendor_invoice_status };
}

export function vendorExpenseTaxPatch(
  patch: Partial<{
    vendor_tax_mode: BkVendorTaxMode;
    vendor_invoice_status: BkVendorInvoiceStatus;
  }>,
  current: {
    vendor_tax_mode: BkVendorTaxMode;
    vendor_invoice_status: BkVendorInvoiceStatus;
  },
): { vendor_tax_mode: BkVendorTaxMode; vendor_invoice_status: BkVendorInvoiceStatus } {
  return normalizeVendorExpenseTax({
    vendor_tax_mode: patch.vendor_tax_mode ?? current.vendor_tax_mode,
    vendor_invoice_status: patch.vendor_invoice_status ?? current.vendor_invoice_status,
  });
}

export function vendorInvoiceSummary(input: {
  vendor_tax_mode: BkVendorTaxMode;
  vendor_invoice_status: BkVendorInvoiceStatus;
  invoice_no?: string | null;
}): string {
  if (input.vendor_tax_mode === "免稅") return "免稅";
  return input.vendor_invoice_status === "已收到" ? "已開" : "未開";
}

export function isVendorInvoiceOutstanding(input: {
  vendor_tax_mode: BkVendorTaxMode;
  vendor_invoice_status: BkVendorInvoiceStatus;
}): boolean {
  return input.vendor_tax_mode === "應稅" && input.vendor_invoice_status !== "已收到";
}

export function vendorInvoicePrintFields(input: {
  vendor_tax_mode: BkVendorTaxMode;
  vendor_invoice_status: BkVendorInvoiceStatus;
  invoice_no?: string | null;
  invoice_amount?: number | null;
}): { status: string; invoiceNo: string; invoiceAmount: number | null } {
  if (input.vendor_tax_mode === "免稅") {
    return { status: "免稅", invoiceNo: "", invoiceAmount: null };
  }
  if (isVendorInvoiceOutstanding(input)) {
    return { status: "", invoiceNo: "", invoiceAmount: null };
  }
  return {
    status: "已開",
    invoiceNo: input.invoice_no?.trim() ?? "",
    invoiceAmount: input.invoice_amount ?? null,
  };
}

const VENDOR_TAX_RATE = 0.05;

export type VendorPayableBreakdown = {
  net: number;
  tax: number;
  gross: number;
};

export function vendorPayableBreakdown(input: {
  net: number;
  vendor_tax_mode: BkVendorTaxMode;
}): VendorPayableBreakdown {
  const net = Math.round(input.net);
  if (net <= 0) {
    return { net: 0, tax: 0, gross: 0 };
  }
  if (input.vendor_tax_mode === "免稅") {
    return { net, tax: 0, gross: net };
  }
  const tax = Math.round(net * VENDOR_TAX_RATE);
  return { net, tax, gross: net + tax };
}

export function deriveVendorPayableNet(input: {
  payable_amount: number;
  payable_net_amount?: number | null;
  vendor_tax_mode: BkVendorTaxMode;
}): number {
  if (input.payable_net_amount != null && input.payable_net_amount >= 0) {
    return input.payable_net_amount;
  }
  if (input.vendor_tax_mode === "免稅") {
    return input.payable_amount;
  }
  return Math.round(input.payable_amount / (1 + VENDOR_TAX_RATE));
}

export function syncExpenseDraftPayable(input: {
  payable_net_amount: number | "";
  vendor_tax_mode: BkVendorTaxMode;
}): { payable_net_amount: number | ""; payable_amount: number | "" } {
  if (input.payable_net_amount === "" || input.payable_net_amount === 0) {
    return { payable_net_amount: "", payable_amount: "" };
  }
  const breakdown = vendorPayableBreakdown({
    net: Number(input.payable_net_amount),
    vendor_tax_mode: input.vendor_tax_mode,
  });
  return {
    payable_net_amount: breakdown.net,
    payable_amount: breakdown.gross,
  };
}
