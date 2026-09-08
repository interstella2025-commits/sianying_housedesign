import { describe, expect, it } from "vitest";
import {
  deriveDesignInvoiceTaxMode,
  deriveProjectInvoiceTaxMode,
  incomeTaxBreakdown,
  incomeReceivedAmount,
} from "@/lib/bookkeeping/income-tax";

describe("income tax breakdown", () => {
  it("computes 內含 tax from gross received amount", () => {
    const result = incomeTaxBreakdown({ amount: 100, invoice_tax_mode: "內含" });
    expect(result.received).toBe(100);
    expect(result.net).toBe(95);
    expect(result.tax).toBe(5);
  });

  it("computes 外加 tax from net quote amount", () => {
    const result = incomeTaxBreakdown({ amount: 100, invoice_tax_mode: "外加" });
    expect(result.net).toBe(100);
    expect(result.tax).toBe(5);
    expect(result.received).toBe(105);
  });

  it("treats 不開 as full income without tax", () => {
    const result = incomeTaxBreakdown({ amount: 100, invoice_tax_mode: "不開" });
    expect(result.received).toBe(100);
    expect(result.tax).toBe(0);
    expect(result.net).toBe(100);
  });

  it("uses received amount for project income totals", () => {
    expect(
      incomeReceivedAmount({
        amount: 100,
        invoice_tax_mode: "外加",
        client_invoice_status: "待開",
      }),
    ).toBe(105);
  });

  it("derives project invoice mode from project field first", () => {
    expect(deriveProjectInvoiceTaxMode({ client_invoice_tax_mode: "外加" })).toBe("外加");
  });

  it("derives design invoice mode from project field first", () => {
    expect(deriveDesignInvoiceTaxMode({ design_invoice_tax_mode: "外加" })).toBe("外加");
  });

  it("defaults to 不開 when project field is missing", () => {
    expect(deriveProjectInvoiceTaxMode({})).toBe("不開");
  });
});
