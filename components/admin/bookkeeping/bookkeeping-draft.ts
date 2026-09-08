import { bkFetch } from "@/components/admin/bookkeeping/BookkeepingNav";
import { todayISODate } from "@/lib/bookkeeping/format";
import {
  expensePaidAmount,
  expenseUnpaidBalance,
  expenseRemainingPayable,
  sumPayableAmounts,
} from "@/lib/bookkeeping/calculations";
import {
  incomeReceivedAmount,
  incomeTaxBreakdown,
  legacyInvoiceStatus,
  legacyTaxStatus,
} from "@/lib/bookkeeping/income-tax";
import type {
  BkExpensePayment,
  BkExpenseWithPayments,
  BkIncomeCategory,
  BkInvoiceTaxMode,
  BkPaymentMethod,
  BkProjectIncome,
  BkVendorInvoiceStatus,
  BkVendorTaxMode,
} from "@/lib/bookkeeping/types";
import { deriveVendorTaxMode, deriveVendorPayableNet, normalizeVendorExpenseTax, syncExpenseDraftPayable } from "@/lib/bookkeeping/vendor-tax";

export type IncomeDraft = {
  key: string;
  id?: string;
  markedDelete?: boolean;
  income_category: BkIncomeCategory;
  received_date: string;
  amount: number | "";
  payment_method: BkPaymentMethod;
  reference_no: string;
  note: string;
};

export type ExpenseDraft = {
  key: string;
  id?: string;
  markedDelete?: boolean;
  vendor_name: string;
  expense_date: string;
  trade: string;
  description: string;
  payable_net_amount: number | "";
  payable_amount: number | "";
  paid_amount: number;
  payments: BkExpensePayment[];
  payment_date: string;
  payment_amount: number | "";
  due_date: string;
  vendor_tax_mode: BkVendorTaxMode;
  vendor_invoice_status: BkVendorInvoiceStatus;
  invoice_no: string;
  vendor_invoice_note: string;
  note: string;
};

export function newIncomeDraft(category: BkIncomeCategory = "工程款"): IncomeDraft {
  return {
    key: crypto.randomUUID(),
    income_category: category,
    received_date: todayISODate(),
    amount: "",
    payment_method: "匯款",
    reference_no: "",
    note: "",
  };
}

export function incomeToDraft(income: BkProjectIncome): IncomeDraft {
  return {
    key: income.id,
    id: income.id,
    income_category: income.income_category ?? "工程款",
    received_date: income.received_date,
    amount: income.amount,
    payment_method: income.payment_method,
    reference_no: income.reference_no ?? "",
    note: income.note ?? "",
  };
}

export function newExpenseDraft(): ExpenseDraft {
  return {
    key: crypto.randomUUID(),
    expense_date: todayISODate(),
    vendor_name: "",
    trade: "",
    description: "",
    payable_net_amount: "",
    payable_amount: "",
    paid_amount: 0,
    payments: [],
    payment_date: todayISODate(),
    payment_amount: "",
    due_date: "",
    vendor_tax_mode: "應稅",
    vendor_invoice_status: "待收",
    invoice_no: "",
    vendor_invoice_note: "",
    note: "",
  };
}

export function expenseToDraft(expense: BkExpenseWithPayments): ExpenseDraft {
  const vendor_tax_mode = deriveVendorTaxMode(expense);
  const payable_net_amount = deriveVendorPayableNet(expense);
  const syncedPayable = syncExpenseDraftPayable({
    payable_net_amount,
    vendor_tax_mode,
  });

  return {
    key: expense.id,
    id: expense.id,
    vendor_name: expense.vendor_name ?? "",
    expense_date: expense.expense_date,
    trade: expense.trade,
    description: expense.description ?? "",
    payable_net_amount: syncedPayable.payable_net_amount,
    payable_amount: syncedPayable.payable_amount,
    paid_amount: expense.paid_amount,
    payments: expense.payments,
    payment_date: todayISODate(),
    payment_amount: "",
    due_date: expense.due_date ?? "",
    vendor_tax_mode,
    vendor_invoice_status: normalizeVendorExpenseTax({
      vendor_tax_mode,
      vendor_invoice_status: expense.vendor_invoice_status,
    }).vendor_invoice_status,
    invoice_no: expense.invoice_no ?? "",
    vendor_invoice_note: expense.vendor_invoice_note ?? "",
    note: expense.note ?? "",
  };
}

export function isIncomeDraftEmpty(row: IncomeDraft) {
  return !row.id && (row.amount === "" || row.amount === 0);
}

export function isExpenseDraftEmpty(row: ExpenseDraft) {
  return !row.id && !row.vendor_name.trim() && !row.trade.trim() && (row.payable_net_amount === "" || row.payable_net_amount === 0);
}

export type ProjectIncomeInvoiceSettings = {
  design: { taxMode: BkInvoiceTaxMode; invoiceNo: string };
  construction: { taxMode: BkInvoiceTaxMode; invoiceNo: string };
};

function invoiceSettingsForCategory(
  category: BkIncomeCategory,
  settings: ProjectIncomeInvoiceSettings,
): { taxMode: BkInvoiceTaxMode; invoiceNo: string } {
  if (category === "設計費") return settings.design;
  if (category === "工程款") return settings.construction;
  // 預付款為折抵金流，不另開發票
  return { taxMode: "不開", invoiceNo: "" };
}

export function sumIncomeCategory(
  rows: IncomeDraft[],
  category: BkIncomeCategory,
  clientInvoiceTaxMode: BkInvoiceTaxMode,
) {
  return rows
    .filter((row) => !row.markedDelete && row.income_category === category)
    .reduce((total, row) => {
      const amount = Number(row.amount || 0);
      if (amount <= 0) return total;
      return total + incomeReceivedAmount({ amount, invoice_tax_mode: clientInvoiceTaxMode });
    }, 0);
}

export function computeDraftSummary(
  invoiceSettings: {
    design: BkInvoiceTaxMode;
    construction: BkInvoiceTaxMode;
  },
  incomeRows: IncomeDraft[],
  expenseRows: ExpenseDraft[],
) {
  const activeIncomes = incomeRows.filter((row) => !row.markedDelete);
  const activeExpenses = expenseRows.filter((row) => !row.markedDelete);

  const design_income_total = sumIncomeCategory(activeIncomes, "設計費", invoiceSettings.design);
  const prepayment_income_total = sumIncomeCategory(activeIncomes, "預付款", "不開");
  const construction_income_total = sumIncomeCategory(
    activeIncomes,
    "工程款",
    invoiceSettings.construction,
  );

  const income_total = design_income_total + prepayment_income_total + construction_income_total;

  const income_tax_total = activeIncomes.reduce((total, row) => {
    const amount = Number(row.amount || 0);
    if (amount <= 0) return total;
    const taxMode =
      row.income_category === "設計費"
        ? invoiceSettings.design
        : row.income_category === "工程款"
          ? invoiceSettings.construction
          : "不開";
    return total + incomeTaxBreakdown({ amount, invoice_tax_mode: taxMode }).tax;
  }, 0);

  const income_net_total = activeIncomes.reduce((total, row) => {
    const amount = Number(row.amount || 0);
    if (amount <= 0) return total;
    const taxMode =
      row.income_category === "設計費"
        ? invoiceSettings.design
        : row.income_category === "工程款"
          ? invoiceSettings.construction
          : "不開";
    return total + incomeTaxBreakdown({ amount, invoice_tax_mode: taxMode }).net;
  }, 0);

  const expensePayableItems = activeExpenses
    .map((row) => expenseDraftPayable(row))
    .filter((amount) => amount > 0)
    .map((amount) => ({ payable_amount: amount }));

  const expense_payable_total = sumPayableAmounts(expensePayableItems);

  const expense_paid_total = activeExpenses.reduce((total, row) => {
    const payable = expenseDraftPayable(row);
    if (payable <= 0) return total;
    return total + expenseDraftPaid(row) + Number(row.payment_amount || 0);
  }, 0);

  const design_unpaid = 0;
  const prepayment_unpaid = 0;
  const construction_unpaid = 0;
  const client_contract_total = design_income_total + construction_income_total;
  const client_unpaid = 0;
  const client_net_receipt = Math.max(
    client_contract_total - prepayment_income_total,
    0,
  );

  return {
    income_total,
    design_income_total,
    prepayment_income_total,
    construction_income_total,
    income_net_total,
    income_tax_total,
    design_unpaid,
    prepayment_unpaid,
    construction_unpaid,
    client_contract_total,
    client_net_receipt,
    client_unpaid,
    expense_payable_total,
    expense_paid_total,
    payable_now: expense_payable_total - expense_paid_total,
    estimated_gross_profit: client_contract_total - expense_payable_total,
    cash_balance: income_total - expense_paid_total,
  };
}

function incomePayload(
  projectId: string,
  row: IncomeDraft,
  clientInvoiceTaxMode: BkInvoiceTaxMode,
  clientInvoiceNo: string,
) {
  const breakdown = incomeTaxBreakdown({
    amount: Number(row.amount),
    invoice_tax_mode: clientInvoiceTaxMode,
  });
  return {
    project_id: projectId,
    income_category: row.income_category,
    received_date: row.received_date,
    amount: Number(row.amount),
    payment_method: row.payment_method,
    reference_no: row.reference_no || undefined,
    invoice_tax_mode: clientInvoiceTaxMode,
    client_invoice_status: legacyInvoiceStatus(clientInvoiceTaxMode, clientInvoiceNo),
    client_invoice_no:
      clientInvoiceTaxMode === "不開" ? undefined : clientInvoiceNo || undefined,
    tax_status: legacyTaxStatus(clientInvoiceTaxMode),
    tax_amount: breakdown.tax,
    note: row.note || undefined,
  };
}

function expensePayload(projectId: string, row: ExpenseDraft) {
  const tax = normalizeVendorExpenseTax(row);
  const payable = syncExpenseDraftPayable(row);
  return {
    project_id: projectId,
    vendor_name: row.vendor_name.trim(),
    expense_date: row.expense_date,
    trade: row.trade.trim(),
    description: row.description || undefined,
    payable_net_amount: Number(payable.payable_net_amount),
    payable_amount: Number(payable.payable_amount),
    due_date: row.due_date || undefined,
    payment_stage: null,
    vendor_tax_mode: tax.vendor_tax_mode,
    vendor_invoice_status: tax.vendor_invoice_status,
    invoice_no: row.invoice_no || undefined,
    vendor_invoice_note: row.vendor_invoice_note || undefined,
    note: row.note || undefined,
  };
}

export async function persistIncomeDrafts(
  projectId: string,
  rows: IncomeDraft[],
  invoiceSettings: ProjectIncomeInvoiceSettings,
) {
  for (const row of rows) {
    if (row.markedDelete && row.id) {
      await bkFetch(`/api/bookkeeping/incomes?id=${row.id}`, { method: "DELETE" });
      continue;
    }
    if (row.markedDelete || isIncomeDraftEmpty(row)) continue;

    const amount = Number(row.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("收款金額必須大於 0");
    }
    if (!row.received_date) {
      throw new Error("請填寫收款日期");
    }

    const { taxMode, invoiceNo } = invoiceSettingsForCategory(row.income_category, invoiceSettings);
    const payload = incomePayload(projectId, row, taxMode, invoiceNo);
    if (row.id) {
      await bkFetch("/api/bookkeeping/incomes", {
        method: "PUT",
        body: JSON.stringify({ id: row.id, ...payload }),
      });
    } else {
      await bkFetch("/api/bookkeeping/incomes", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }
  }
}

export async function submitExpenseDraftPayment(
  projectId: string,
  row: ExpenseDraft,
): Promise<{ expenseId: string; payment: BkExpensePayment; paid_amount: number }> {
  const paymentAmount = Number(row.payment_amount || 0);
  if (paymentAmount <= 0) {
    throw new Error("請填寫付款金額");
  }
  if (!row.payment_date) {
    const label = row.vendor_name.trim() || row.trade.trim() || "支出";
    throw new Error(`${label} 請填寫付款日期`);
  }

  const unpaid = expenseRemainingPayable(expenseDraftPayable(row), expenseDraftPaid(row));
  if (paymentAmount > unpaid) {
    const label = row.vendor_name.trim() || row.trade.trim() || "支出";
    throw new Error(`${label} 付款金額不可超過未付 ${unpaid.toLocaleString("zh-TW")} 元`);
  }

  const expenseId = await persistExpenseDraft(projectId, row);
  if (!expenseId) {
    throw new Error("無法儲存支出");
  }

  const result = await bkFetch<{ payment: BkExpensePayment }>("/api/bookkeeping/payments", {
    method: "POST",
    body: JSON.stringify({
      expense_id: expenseId,
      paid_date: row.payment_date,
      amount: paymentAmount,
      payment_method: "匯款",
    }),
  });

  const payments = [...row.payments, result.payment];
  return {
    expenseId,
    payment: result.payment,
    paid_amount: expensePaidAmount(payments),
  };
}

export async function updateExpenseDraftPayment(
  row: ExpenseDraft,
  paymentId: string,
  input: { paid_date: string; amount: number },
): Promise<{ payment: BkExpensePayment; paid_amount: number }> {
  if (input.amount <= 0) {
    throw new Error("請填寫付款金額");
  }
  if (!input.paid_date) {
    const label = row.vendor_name.trim() || row.trade.trim() || "支出";
    throw new Error(`${label} 請填寫付款日期`);
  }

  const otherPaid = row.payments
    .filter((payment) => payment.id !== paymentId)
    .reduce((total, payment) => total + payment.amount, 0);
  const maxAmount = expenseDraftPayable(row) - otherPaid;
  if (input.amount > maxAmount) {
    const label = row.vendor_name.trim() || row.trade.trim() || "支出";
    throw new Error(`${label} 付款金額不可超過 ${maxAmount.toLocaleString("zh-TW")} 元`);
  }

  const result = await bkFetch<{ payment: BkExpensePayment }>("/api/bookkeeping/payments", {
    method: "PUT",
    body: JSON.stringify({
      id: paymentId,
      paid_date: input.paid_date,
      amount: input.amount,
    }),
  });

  const payments = row.payments.map((payment) =>
    payment.id === paymentId ? result.payment : payment,
  );
  return {
    payment: result.payment,
    paid_amount: expensePaidAmount(payments),
  };
}

export async function persistExpenseDrafts(projectId: string, rows: ExpenseDraft[]) {
  for (const row of rows) {
    if (row.markedDelete && row.id) {
      await bkFetch(`/api/bookkeeping/expenses?id=${row.id}`, { method: "DELETE" });
      continue;
    }
    if (row.markedDelete || isExpenseDraftEmpty(row)) continue;

    const expenseId = await persistExpenseDraft(projectId, row);
    if (!expenseId) continue;

    const paymentAmount = Number(row.payment_amount || 0);
    if (paymentAmount <= 0) continue;

    if (!row.payment_date) {
      const label = row.vendor_name.trim() || row.trade.trim() || "支出";
      throw new Error(`${label} 請填寫付款日期`);
    }

    const unpaid = expenseRemainingPayable(expenseDraftPayable(row), expenseDraftPaid(row));
    if (paymentAmount > unpaid) {
      const label = row.vendor_name.trim() || row.trade.trim() || "支出";
      throw new Error(`${label} 付款金額不可超過未付 ${unpaid.toLocaleString("zh-TW")} 元`);
    }

    await bkFetch("/api/bookkeeping/payments", {
      method: "POST",
      body: JSON.stringify({
        expense_id: expenseId,
        paid_date: row.payment_date || todayISODate(),
        amount: paymentAmount,
        payment_method: "匯款",
      }),
    });
  }
}

export async function persistExpenseDraft(
  projectId: string,
  row: ExpenseDraft,
  options: { skipEmpty?: boolean; skipDeleted?: boolean } = {},
): Promise<string | null> {
  if (options.skipDeleted && row.markedDelete) {
    if (row.id) {
      await bkFetch(`/api/bookkeeping/expenses?id=${row.id}`, { method: "DELETE" });
    }
    return null;
  }
  if (row.markedDelete) return null;
  if (options.skipEmpty && isExpenseDraftEmpty(row)) return null;

  if (!row.vendor_name.trim()) {
    throw new Error("請填寫支出廠商");
  }
  if (!row.trade.trim()) {
    throw new Error("請填寫支出工種");
  }
  const payable = Number(row.payable_amount);
  if (!Number.isFinite(payable) || payable <= 0) {
    throw new Error("支出應付金額必須大於 0");
  }
  if (!row.expense_date) {
    throw new Error("請填寫支出日期");
  }

  const payload = expensePayload(projectId, row);
  if (row.id) {
    await bkFetch("/api/bookkeeping/expenses", {
      method: "PUT",
      body: JSON.stringify({ id: row.id, ...payload }),
    });
    return row.id;
  }

  const result = await bkFetch<{ expense: { id: string } }>("/api/bookkeeping/expenses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return result.expense.id;
}

export function expenseDraftPayable(row: ExpenseDraft): number {
  const synced = syncExpenseDraftPayable({
    payable_net_amount: row.payable_net_amount,
    vendor_tax_mode: row.vendor_tax_mode,
  });
  if (synced.payable_amount !== "") {
    return Number(synced.payable_amount);
  }
  return Number(row.payable_amount || 0);
}

export function expenseDraftPaid(row: ExpenseDraft): number {
  return expensePaidAmount(row.payments);
}

export function expenseDraftBalances(row: ExpenseDraft) {
  const payable = expenseDraftPayable(row);
  const paid = expenseDraftPaid(row);
  const pendingPay = Number(row.payment_amount || 0);
  const pendingTotal = paid + (pendingPay > 0 ? pendingPay : 0);
  return {
    payable,
    paid,
    pendingPay,
    unpaid: expenseUnpaidBalance(payable, paid),
    unpaidAfterPending: expenseUnpaidBalance(payable, pendingTotal),
    remainingPayable: expenseRemainingPayable(payable, paid),
    remainingAfterPending: expenseRemainingPayable(payable, pendingTotal),
  };
}

export function vendorExpenseSummary(rows: ExpenseDraft[], vendorName: string) {
  const active = rows.filter((row) => !row.markedDelete && row.vendor_name.trim() === vendorName.trim());
  const payable = active.reduce((total, row) => total + expenseDraftPayable(row), 0);
  const paid = active.reduce(
    (total, row) => total + expenseDraftPaid(row) + Number(row.payment_amount || 0),
    0,
  );
  return {
    payable,
    paid,
    unpaid: payable - paid,
    rows: active,
  };
}
