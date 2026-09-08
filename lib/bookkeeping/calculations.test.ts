import { describe, expect, it } from "vitest";
import {
  computeProjectSummary,
  computeVendorSummary,
  expensePaymentStatus,
  expenseUnpaidBalance,
  validatePaymentTotal,
} from "@/lib/bookkeeping/calculations";
import type {
  BkExpensePayment,
  BkProjectExpense,
  BkProjectIncome,
} from "@/lib/bookkeeping/types";

describe("bookkeeping calculations", () => {
  it("computes acceptance example for project A", () => {
    const project = {
      design_fee_amount: 0,
      prepayment_amount: 0,
      contract_amount: 1_000_000,
    };
    const incomes: BkProjectIncome[] = [
      {
        id: "income-1",
        project_id: "project-a",
        income_category: "工程款",
        received_date: "2026-01-15",
        amount: 600_000,
        payment_method: "匯款",
        reference_no: null,
        invoice_tax_mode: "不開",
        client_invoice_status: "不需",
        client_invoice_no: null,
        tax_status: "不適用",
        tax_amount: null,
        tax_paid_date: null,
        note: null,
        created_at: "2026-01-15T00:00:00.000Z",
      },
    ];
    const expenses: BkProjectExpense[] = [
      {
        id: "expense-1",
        project_id: "project-a",
        vendor_id: "vendor-a",
        expense_date: "2026-02-01",
        trade: "泥作",
        description: "泥作工程",
        payable_net_amount: 95_238,
        payable_amount: 100_000,
        due_date: null,
        payment_stage: null,
        invoice_no: null,
        invoice_amount: null,
        vendor_tax_mode: "應稅",
        vendor_invoice_status: "待收",
        vendor_invoice_note: null,
        note: null,
        created_at: "2026-02-01T00:00:00.000Z",
        updated_at: "2026-02-01T00:00:00.000Z",
      },
      {
        id: "expense-2",
        project_id: "project-a",
        vendor_id: "vendor-b",
        expense_date: "2026-03-01",
        trade: "水電",
        description: "水電工程",
        payable_net_amount: 47_619,
        payable_amount: 50_000,
        due_date: null,
        payment_stage: null,
        invoice_no: null,
        invoice_amount: null,
        vendor_tax_mode: "應稅",
        vendor_invoice_status: "待收",
        vendor_invoice_note: null,
        note: null,
        created_at: "2026-03-01T00:00:00.000Z",
        updated_at: "2026-03-01T00:00:00.000Z",
      },
    ];
    const payments: BkExpensePayment[] = [
      {
        id: "payment-1",
        expense_id: "expense-1",
        paid_date: "2026-02-10",
        amount: 60_000,
        payment_method: "匯款",
        reference_no: null,
        note: null,
        created_at: "2026-02-10T00:00:00.000Z",
      },
    ];

    const summary = computeProjectSummary(project, incomes, expenses, payments);

    expect(summary.income_total).toBe(600_000);
    expect(summary.client_unpaid).toBe(0);
    expect(summary.expense_payable_total).toBe(150_000);
    expect(summary.expense_paid_total).toBe(60_000);
    expect(summary.payable_now).toBe(90_000);
    expect(summary.estimated_gross_profit).toBe(450_000);
    expect(summary.cash_balance).toBe(540_000);
  });

  it("computes vendor summaries from shared expense records", () => {
    const vendorAExpenses = [{ payable_amount: 100_000 }];
    const vendorAPayments = [{ amount: 60_000 }];
    const vendorBExpenses = [{ payable_amount: 50_000 }];
    const vendorBPayments: { amount: number }[] = [];

    const vendorA = computeVendorSummary(vendorAExpenses, vendorAPayments, ["project-a"]);
    const vendorB = computeVendorSummary(vendorBExpenses, vendorBPayments, ["project-a"]);

    expect(vendorA.payable_total).toBe(100_000);
    expect(vendorA.paid_total).toBe(60_000);
    expect(vendorA.payable_now).toBe(40_000);
    expect(vendorB.payable_total).toBe(50_000);
    expect(vendorB.paid_total).toBe(0);
    expect(vendorB.payable_now).toBe(50_000);
  });

  it("derives payment status from paid and payable amounts", () => {
    expect(expensePaymentStatus(100_000, 0)).toBe("未付款");
    expect(expensePaymentStatus(100_000, 60_000)).toBe("部分付款");
    expect(expensePaymentStatus(100_000, 100_000)).toBe("已結清");
    expect(expenseUnpaidBalance(100_000, 60_000)).toBe(40_000);
    expect(expenseUnpaidBalance(100_000, 120_000)).toBe(-20_000);
  });

  it("rejects payments that exceed payable amount", () => {
    const validation = validatePaymentTotal(100_000, [{ amount: 60_000 }], 50_000);
    expect(validation.ok).toBe(false);
    if (!validation.ok) {
      expect(validation.message).toContain("不可超過");
    }
  });
});
