import type { ExpenseDraft, IncomeDraft } from "@/components/admin/bookkeeping/bookkeeping-draft";
import { formatDateTW } from "@/lib/bookkeeping/format";
import { vendorInvoiceSummary } from "@/lib/bookkeeping/vendor-tax";
import type {
  BkExpenseWithPayments,
  BkProjectListItem,
  BkVendorListItem,
  BkVendorProjectGroup,
} from "@/lib/bookkeeping/types";

export function escapeCsvCell(value: string | number | null | undefined): string {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function downloadCsv(filename: string, rows: Array<Array<string | number | null | undefined>>) {
  const bom = "\uFEFF";
  const content = rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
  const blob = new Blob([bom + content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function safeFilename(name: string) {
  return name.replace(/[\\/:*?"<>|]/g, "_").trim() || "export";
}

export function exportProjectsCsv(projects: BkProjectListItem[]) {
  downloadCsv("案件列表.csv", [
    ["案名", "客戶", "收款合計", "工程支出", "已付款", "目前應付", "狀態"],
    ...projects.map((project) => [
      project.name,
      project.client_name ?? "",
      project.income_total,
      project.expense_payable_total,
      project.expense_paid_total,
      project.payable_now,
      project.status,
    ]),
  ]);
}

export function exportVendorsCsv(vendors: BkVendorListItem[]) {
  downloadCsv("廠商列表.csv", [
    ["廠商", "工種", "總應付", "總已付", "目前應付", "案件數"],
    ...vendors.map((vendor) => [
      vendor.name,
      vendor.trade ?? "",
      vendor.payable_total,
      vendor.paid_total,
      vendor.payable_now,
      vendor.project_count,
    ]),
  ]);
}

function paymentHistoryText(
  payments: Array<{ paid_date: string; amount: number }>,
): string {
  return payments
    .slice()
    .sort((a, b) => a.paid_date.localeCompare(b.paid_date))
    .map((payment) => `${formatDateTW(payment.paid_date)} ${payment.amount}`)
    .join("；");
}

export function exportLedgerCsv(input: {
  header: {
    name: string;
    client_name: string;
    client_tax_id: string;
    client_phone: string;
    address: string;
    status: string;
  };
  incomeRows: IncomeDraft[];
  expenseRows: ExpenseDraft[];
  summary: {
    design_income_total: number;
    prepayment_income_total: number;
    construction_income_total: number;
    client_contract_total: number;
    client_net_receipt: number;
    income_total: number;
    expense_payable_total: number;
    expense_paid_total: number;
    payable_now: number;
  };
  viewLabel: string;
}) {
  const rows: Array<Array<string | number | null | undefined>> = [
    ["記帳匯出"],
    ["視圖", input.viewLabel],
    ["案名", input.header.name],
    ["客戶", input.header.client_name],
    ["統編", input.header.client_tax_id],
    ["電話", input.header.client_phone],
    ["地址", input.header.address],
    ["狀態", input.header.status],
    [],
    ["收款明細"],
    ["類別", "日期", "金額", "方式", "備註"],
  ];

  for (const row of input.incomeRows.filter((item) => !item.markedDelete)) {
    rows.push([
      row.income_category,
      row.received_date,
      Number(row.amount || 0),
      row.payment_method,
      row.note,
    ]);
  }

  rows.push(
    [],
    ["收款摘要"],
    ["設計費合計", input.summary.design_income_total],
    ["工程款合計", input.summary.construction_income_total],
    ["收款合計", input.summary.client_contract_total],
    ["預收折抵", input.summary.prepayment_income_total > 0 ? -input.summary.prepayment_income_total : 0],
    ["合計收入", input.summary.client_net_receipt],
    [],
    ["支出明細"],
    ["日期", "工種", "廠商", "未稅", "含稅應付", "付款紀錄", "未付", "稅別", "發票", "備註"],
  );

  for (const row of input.expenseRows.filter((item) => !item.markedDelete)) {
    const payable = Number(row.payable_amount || 0);
    const paid = row.paid_amount + Number(row.payment_amount || 0);
    const net = Number(row.payable_net_amount || 0);
    rows.push([
      row.expense_date,
      row.trade,
      row.vendor_name,
      net,
      payable,
      paymentHistoryText(row.payments),
      payable - paid,
      row.vendor_tax_mode,
      vendorInvoiceSummary(row),
      row.description || row.note,
    ]);
  }

  rows.push(
    [],
    ["收支摘要"],
    ["合計收入（實收）", input.summary.income_total],
    ["合計支出", input.summary.expense_payable_total],
    ["已付款", input.summary.expense_paid_total],
    ["目前應付", input.summary.payable_now],
  );

  downloadCsv(`${safeFilename(input.header.name || "案件")}-記帳.csv`, rows);
}

export function exportVendorDetailCsv(input: {
  vendorName: string;
  trade: string;
  summary: { payable_total: number; paid_total: number; payable_now: number };
  groups: BkVendorProjectGroup[];
  expenses: BkExpenseWithPayments[];
  period?: string;
}) {
  const rows: Array<Array<string | number | null | undefined>> = [
    ["廠商匯出"],
    ["廠商", input.vendorName],
    ["工種", input.trade],
    ...(input.period ? [["支出期間", input.period]] : []),
    [input.period ? "期間應付" : "總應付", input.summary.payable_total],
    [input.period ? "期間已付" : "總已付", input.summary.paid_total],
    [input.period ? "期間未付" : "目前應付", input.summary.payable_now],
    [],
    ["依案件彙總"],
    ["案名", "工種", "累計應付", "累計已付", "目前未付", "付款明細", "狀態"],
    ...input.groups.map((group) => [
      group.project_name,
      group.trade,
      group.payable_total,
      group.paid_total,
      group.unpaid_balance,
      group.payment_lines
        .map((line) => `${formatDateTW(line.paid_date)} ${line.amount}`)
        .join("；"),
      group.payment_status,
    ]),
    [],
    ["支出明細"],
    [
      "日期",
      "案名",
      "工種",
      "事由",
      "應付",
      "已付",
      "未付",
      "稅別",
      "發票狀態",
      "發票號碼",
      "發票金額",
      "付款紀錄",
    ],
    ...input.expenses.map((expense) => [
      expense.expense_date,
      expense.project_name ?? "",
      expense.trade,
      expense.description ?? "",
      expense.payable_amount,
      expense.paid_amount,
      expense.unpaid_balance,
      expense.vendor_tax_mode,
      vendorInvoiceSummary(expense),
      expense.vendor_invoice_status === "已收到" ? expense.invoice_no : "",
      expense.vendor_invoice_status === "已收到" ? expense.invoice_amount : null,
      paymentHistoryText(expense.payments),
    ]),
  ];

  downloadCsv(`${safeFilename(input.vendorName)}-廠商明細.csv`, rows);
}
