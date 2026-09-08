import { describe, expect, it } from "vitest";
import {
  deriveVendorTaxMode,
  isVendorInvoiceOutstanding,
  normalizeVendorExpenseTax,
  vendorInvoicePrintFields,
  vendorInvoiceSummary,
  vendorPayableBreakdown,
} from "@/lib/bookkeeping/vendor-tax";

describe("vendor expense tax", () => {
  it("derives 免稅 from legacy 不需 invoice status", () => {
    expect(deriveVendorTaxMode({ vendor_invoice_status: "不需" })).toBe("免稅");
  });

  it("forces 不需 invoice when 免稅", () => {
    expect(
      normalizeVendorExpenseTax({
        vendor_tax_mode: "免稅",
        vendor_invoice_status: "待收",
      }),
    ).toEqual({ vendor_tax_mode: "免稅", vendor_invoice_status: "不需" });
  });

  it("limits taxable invoice status to 待收 or 已收到", () => {
    expect(
      normalizeVendorExpenseTax({
        vendor_tax_mode: "應稅",
        vendor_invoice_status: "不需",
      }),
    ).toEqual({ vendor_tax_mode: "應稅", vendor_invoice_status: "待收" });
  });

  it("summarizes invoice only for taxable expenses", () => {
    expect(
      vendorInvoiceSummary({
        vendor_tax_mode: "免稅",
        vendor_invoice_status: "不需",
      }),
    ).toBe("免稅");
    expect(
      vendorInvoiceSummary({
        vendor_tax_mode: "應稅",
        vendor_invoice_status: "已收到",
        invoice_no: "AB123",
      }),
    ).toBe("已開");
    expect(
      vendorInvoiceSummary({
        vendor_tax_mode: "應稅",
        vendor_invoice_status: "待收",
      }),
    ).toBe("未開");
  });

  it("only treats taxable, unreceived invoices as outstanding", () => {
    expect(
      isVendorInvoiceOutstanding({
        vendor_tax_mode: "應稅",
        vendor_invoice_status: "待收",
      }),
    ).toBe(true);
    expect(
      isVendorInvoiceOutstanding({
        vendor_tax_mode: "應稅",
        vendor_invoice_status: "已收到",
      }),
    ).toBe(false);
    expect(
      isVendorInvoiceOutstanding({
        vendor_tax_mode: "免稅",
        vendor_invoice_status: "不需",
      }),
    ).toBe(false);
  });

  it("leaves pending invoice fields blank for print", () => {
    expect(
      vendorInvoicePrintFields({
        vendor_tax_mode: "應稅",
        vendor_invoice_status: "待收",
        invoice_no: "SHOULD-NOT-PRINT",
        invoice_amount: 12_000,
      }),
    ).toEqual({ status: "", invoiceNo: "", invoiceAmount: null });
    expect(
      vendorInvoicePrintFields({
        vendor_tax_mode: "應稅",
        vendor_invoice_status: "已收到",
        invoice_no: "AB12345678",
        invoice_amount: 12_000,
      }),
    ).toEqual({ status: "已開", invoiceNo: "AB12345678", invoiceAmount: 12_000 });
  });

  it("adds 5% tax on top of net payable when taxable", () => {
    expect(vendorPayableBreakdown({ net: 1_000_000, vendor_tax_mode: "應稅" })).toEqual({
      net: 1_000_000,
      tax: 50_000,
      gross: 1_050_000,
    });
    expect(vendorPayableBreakdown({ net: 1_000_000, vendor_tax_mode: "免稅" })).toEqual({
      net: 1_000_000,
      tax: 0,
      gross: 1_000_000,
    });
  });
});
