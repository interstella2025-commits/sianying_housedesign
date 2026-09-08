import type { BkInvoiceTaxMode, BkProjectIncome } from "@/lib/bookkeeping/types";

export const BK_INVOICE_TAX_MODES = ["不開", "內含", "外加"] as const;

const TAX_RATE = 0.05;
const TAX_DIVISOR = 1.05;

export type IncomeTaxBreakdown = {
  mode: BkInvoiceTaxMode;
  net: number;
  tax: number;
  received: number;
};

export function normalizeInvoiceTaxMode(input: {
  invoice_tax_mode?: BkInvoiceTaxMode | null;
  client_invoice_status?: string | null;
}): BkInvoiceTaxMode {
  if (input.invoice_tax_mode && BK_INVOICE_TAX_MODES.includes(input.invoice_tax_mode)) {
    return input.invoice_tax_mode;
  }
  if (input.client_invoice_status === "不需") return "不開";
  return "內含";
}

export function incomeTaxBreakdown(input: {
  amount: number;
  invoice_tax_mode?: BkInvoiceTaxMode | null;
  client_invoice_status?: string | null;
}): IncomeTaxBreakdown {
  const mode = normalizeInvoiceTaxMode(input);
  const amount = Math.round(input.amount);
  if (amount <= 0) {
    return { mode, net: 0, tax: 0, received: 0 };
  }

  if (mode === "不開") {
    return { mode, net: amount, tax: 0, received: amount };
  }

  if (mode === "內含") {
    const tax = Math.round((amount * TAX_RATE) / TAX_DIVISOR);
    const net = amount - tax;
    return { mode, net, tax, received: amount };
  }

  const tax = Math.round(amount * TAX_RATE);
  const received = amount + tax;
  return { mode, net: amount, tax, received };
}

export function incomeReceivedAmount(input: {
  amount: number;
  invoice_tax_mode?: BkInvoiceTaxMode | null;
  client_invoice_status?: string | null;
}) {
  return incomeTaxBreakdown(input).received;
}

export function incomeAmountPlaceholder(mode: BkInvoiceTaxMode) {
  if (mode === "外加") return "未稅報價";
  if (mode === "內含") return "實收含稅";
  return "收款金額";
}

export function legacyInvoiceStatus(mode: BkInvoiceTaxMode, invoiceNo?: string | null) {
  if (mode === "不開") return "不需" as const;
  return invoiceNo?.trim() ? ("已開" as const) : ("待開" as const);
}

export function legacyTaxStatus(mode: BkInvoiceTaxMode) {
  return mode === "不開" ? ("不適用" as const) : ("待繳" as const);
}

export function deriveProjectInvoiceTaxMode(project: {
  client_invoice_tax_mode?: BkInvoiceTaxMode | null;
}): BkInvoiceTaxMode {
  if (
    project.client_invoice_tax_mode &&
    BK_INVOICE_TAX_MODES.includes(project.client_invoice_tax_mode)
  ) {
    return project.client_invoice_tax_mode;
  }

  return "不開";
}

export function deriveDesignInvoiceTaxMode(project: {
  design_invoice_tax_mode?: BkInvoiceTaxMode | null;
}): BkInvoiceTaxMode {
  if (
    project.design_invoice_tax_mode &&
    BK_INVOICE_TAX_MODES.includes(project.design_invoice_tax_mode)
  ) {
    return project.design_invoice_tax_mode;
  }

  return "不開";
}

export function deriveDesignInvoiceNo(
  project: { design_invoice_no?: string | null },
  incomes: Pick<BkProjectIncome, "client_invoice_no" | "income_category">[],
): string {
  if (project.design_invoice_no?.trim()) return project.design_invoice_no.trim();

  for (const income of incomes) {
    if (
      (income.income_category ?? "工程款") === "設計費" &&
      income.client_invoice_no?.trim()
    ) {
      return income.client_invoice_no.trim();
    }
  }

  return "";
}

export function deriveProjectInvoiceNo(
  project: { client_invoice_no?: string | null },
  incomes: Pick<BkProjectIncome, "client_invoice_no">[],
): string {
  if (project.client_invoice_no?.trim()) return project.client_invoice_no.trim();

  for (const income of incomes) {
    if (income.client_invoice_no?.trim()) return income.client_invoice_no.trim();
  }

  return "";
}
