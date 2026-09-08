import type {
  BkExpensePayment,
  BkIncomeCategory,
  BkPaymentStatus,
  BkProject,
  BkProjectExpense,
  BkProjectIncome,
  BkProjectSummary,
  BkVendorProjectGroup,
  BkVendorProjectPaymentLine,
  BkVendorSummary,
} from "@/lib/bookkeeping/types";
import { incomeReceivedAmount } from "@/lib/bookkeeping/income-tax";

export function sumAmounts(items: { amount: number }[]): number {
  return items.reduce((total, item) => total + item.amount, 0);
}

export function sumPayableAmounts(expenses: { payable_amount: number }[]): number {
  return expenses.reduce((total, item) => total + item.payable_amount, 0);
}

export function expensePaidAmount(payments: { amount: number }[]): number {
  return sumAmounts(payments);
}

export function expenseUnpaidBalance(payableAmount: number, paidAmount: number): number {
  return payableAmount - paidAmount;
}

export function expenseRemainingPayable(payableAmount: number, paidAmount: number): number {
  return Math.max(expenseUnpaidBalance(payableAmount, paidAmount), 0);
}

export function expensePaymentStatus(
  payableAmount: number,
  paidAmount: number,
): BkPaymentStatus {
  if (paidAmount <= 0) return "未付款";
  if (paidAmount >= payableAmount) return "已結清";
  return "部分付款";
}

export function validatePaymentTotal(
  payableAmount: number,
  payments: { amount: number }[],
  nextAmount = 0,
): { ok: true } | { ok: false; message: string } {
  const total = sumAmounts(payments) + nextAmount;
  if (nextAmount <= 0) {
    return { ok: false, message: "付款金額必須大於 0" };
  }
  if (total > payableAmount) {
    return { ok: false, message: "累計付款不可超過應付金額" };
  }
  return { ok: true };
}

export function computeProjectSummary(
  _project: Pick<BkProject, "design_fee_amount" | "prepayment_amount" | "contract_amount">,
  incomes: BkProjectIncome[],
  expenses: BkProjectExpense[],
  payments: BkExpensePayment[],
): BkProjectSummary {
  const sumCategory = (category: BkIncomeCategory) =>
    incomes
      .filter((income) => (income.income_category ?? "工程款") === category)
      .reduce((total, income) => total + incomeReceivedAmount(income), 0);

  const designIncome = sumCategory("設計費");
  const prepaymentIncome = sumCategory("預付款");
  const constructionIncome = sumCategory("工程款");
  const incomeTotal = designIncome + prepaymentIncome + constructionIncome;
  const clientContractTotal = designIncome + constructionIncome;

  const expensePayableTotal = sumPayableAmounts(expenses);
  const expensePaidTotal = sumAmounts(payments);

  return {
    income_total: incomeTotal,
    client_unpaid: 0,
    expense_payable_total: expensePayableTotal,
    expense_paid_total: expensePaidTotal,
    payable_now: expensePayableTotal - expensePaidTotal,
    estimated_gross_profit: clientContractTotal - expensePayableTotal,
    cash_balance: incomeTotal - expensePaidTotal,
  };
}

export function computeVendorSummary(
  expenses: { payable_amount: number }[],
  payments: { amount: number }[],
  projectIds: string[],
): BkVendorSummary {
  const payableTotal = sumPayableAmounts(expenses);
  const paidTotal = sumAmounts(payments);

  return {
    payable_total: payableTotal,
    paid_total: paidTotal,
    payable_now: payableTotal - paidTotal,
    project_count: new Set(projectIds).size,
  };
}

export function lastPaidDate(payments: BkExpensePayment[]): string | null {
  if (!payments.length) return null;
  return payments
    .slice()
    .sort((a, b) => b.paid_date.localeCompare(a.paid_date))[0].paid_date;
}

export function groupPaymentLines(
  expenses: Array<{ payments: BkExpensePayment[] }>,
): BkVendorProjectPaymentLine[] {
  return expenses
    .flatMap((expense) => expense.payments)
    .slice()
    .sort(
      (a, b) =>
        a.paid_date.localeCompare(b.paid_date) || a.created_at.localeCompare(b.created_at),
    )
    .map((payment) => ({ paid_date: payment.paid_date, amount: payment.amount }));
}

export function buildVendorProjectGroups(input: {
  expenses: Array<
    BkProjectExpense & {
      payments: BkExpensePayment[];
      project_name: string;
    }
  >;
}): BkVendorProjectGroup[] {
  const groups = new Map<string, BkVendorProjectGroup>();

  for (const expense of input.expenses) {
    const key = `${expense.project_id}::${expense.trade}`;
    const paid = expensePaidAmount(expense.payments);

    const existing = groups.get(key);
    if (!existing) {
      const enrichedExpenses = [
        {
          ...expense,
          paid_amount: paid,
          unpaid_balance: expenseUnpaidBalance(expense.payable_amount, paid),
          payment_status: expensePaymentStatus(expense.payable_amount, paid),
        },
      ];
      groups.set(key, {
        project_id: expense.project_id,
        project_name: expense.project_name,
        trade: expense.trade,
        payable_total: expense.payable_amount,
        paid_total: paid,
        unpaid_balance: expenseUnpaidBalance(expense.payable_amount, paid),
        payment_stage: expense.payment_stage,
        payment_lines: groupPaymentLines(enrichedExpenses),
        payment_status: expensePaymentStatus(expense.payable_amount, paid),
        expenses: enrichedExpenses,
      });
      continue;
    }

    existing.payable_total += expense.payable_amount;
    existing.paid_total += paid;
    existing.unpaid_balance = expenseUnpaidBalance(existing.payable_total, existing.paid_total);
    existing.payment_status = expensePaymentStatus(existing.payable_total, existing.paid_total);
    existing.expenses.push({
      ...expense,
      paid_amount: paid,
      unpaid_balance: expenseUnpaidBalance(expense.payable_amount, paid),
      payment_status: expensePaymentStatus(expense.payable_amount, paid),
    });
    existing.payment_lines = groupPaymentLines(existing.expenses);
  }

  return Array.from(groups.values()).sort((a, b) =>
    a.project_name.localeCompare(b.project_name, "zh-Hant"),
  );
}
