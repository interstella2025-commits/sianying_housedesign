import { describe, expect, it } from "vitest";
import { expenseDraftBalances } from "@/components/admin/bookkeeping/bookkeeping-draft";
import type { ExpenseDraft } from "@/components/admin/bookkeeping/bookkeeping-draft";

function makeExpenseRow(overrides: Partial<ExpenseDraft> = {}): ExpenseDraft {
  return {
    key: "row-1",
    expense_date: "2026-07-02",
    vendor_name: "廖師傅",
    trade: "泥作",
    description: "",
    payable_net_amount: 1_428_571,
    payable_amount: 1_500_000,
    paid_amount: 1_500_000,
    payments: [
      {
        id: "payment-1",
        expense_id: "row-1",
        paid_date: "2026-07-27",
        amount: 1_500_000,
        payment_method: "匯款",
        reference_no: null,
        note: null,
        created_at: "2026-07-27T00:00:00.000Z",
      },
    ],
    payment_date: "2026-08-07",
    payment_amount: "",
    due_date: "",
    vendor_tax_mode: "免稅",
    vendor_invoice_status: "不需",
    invoice_no: "",
    vendor_invoice_note: "",
    note: "",
    ...overrides,
  };
}

describe("expenseDraftBalances", () => {
  it("shows negative unpaid when paid exceeds synced payable", () => {
    const balances = expenseDraftBalances(makeExpenseRow());

    expect(balances.payable).toBe(1_428_571);
    expect(balances.paid).toBe(1_500_000);
    expect(balances.unpaid).toBe(-71_429);
  });
});
