import "server-only";

import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import {
  buildVendorProjectGroups,
  computeProjectSummary,
  computeVendorSummary,
  expensePaidAmount,
  expensePaymentStatus,
  expenseUnpaidBalance,
  validatePaymentTotal,
} from "@/lib/bookkeeping/calculations";
import type {
  BkBookkeepingStore,
  BkClientInvoiceStatus,
  BkExpensePayment,
  BkExpenseWithPayments,
  BkIncomeCategory,
  BkInvoiceTaxMode,
  BkPaymentMethod,
  BkPaymentStage,
  BkProject,
  BkProjectExpense,
  BkProjectIncome,
  BkProjectListItem,
  BkProjectStatus,
  BkTaxStatus,
  BkVendor,
  BkVendorInvoiceStatus,
  BkVendorListItem,
  BkVendorProjectGroup,
  BkVendorTaxMode,
} from "@/lib/bookkeeping/types";
import { incomeTaxBreakdown, legacyInvoiceStatus, legacyTaxStatus } from "@/lib/bookkeeping/income-tax";
import { deriveVendorTaxMode, deriveVendorPayableNet, normalizeVendorExpenseTax, syncExpenseDraftPayable } from "@/lib/bookkeeping/vendor-tax";
import { isDateWithinRange } from "@/lib/bookkeeping/date-range";
import { createSupabaseTenantClient } from "@/lib/supabase/server";
import { isSupabaseTenantConfigured } from "@/lib/supabase/env";

const STORE_PATH = path.join(process.cwd(), "data", "bookkeeping", "store.json");

const EMPTY_STORE: BkBookkeepingStore = {
  projects: [],
  project_incomes: [],
  vendors: [],
  project_expenses: [],
  expense_payments: [],
};

function nowIso() {
  return new Date().toISOString();
}

function positiveAmount(value: unknown, label: string): number {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`${label}必須大於 0`);
  }
  return Math.round(amount);
}

function nonNegativeAmount(value: unknown, label: string): number {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error(`${label}不可為負數`);
  }
  return Math.round(amount);
}

async function readLocalStore(): Promise<BkBookkeepingStore> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    const store = JSON.parse(raw) as BkBookkeepingStore;
    for (const income of store.project_incomes) {
      income.client_invoice_status ??= "不需";
      income.client_invoice_no ??= null;
      income.invoice_tax_mode ??=
        income.client_invoice_status === "不需" ? "不開" : "內含";
      income.tax_status ??= "不適用";
      income.tax_amount ??= null;
      income.tax_paid_date ??= null;
      income.income_category ??= "工程款";
    }
    for (const project of store.projects) {
      project.client_tax_id ??= null;
      project.client_invoice_tax_mode ??= "不開";
      project.client_invoice_no ??= null;
      project.design_fee_amount ??= 0;
      project.prepayment_amount ??= 0;
      project.design_invoice_tax_mode ??= "不開";
      project.design_invoice_no ??= null;
      project.prepayment_invoice_tax_mode ??= "不開";
      project.prepayment_invoice_no ??= null;
    }
    for (const expense of store.project_expenses) {
      expense.vendor_tax_mode = deriveVendorTaxMode(expense);
      const tax = normalizeVendorExpenseTax(expense);
      expense.vendor_tax_mode = tax.vendor_tax_mode;
      expense.vendor_invoice_status = tax.vendor_invoice_status;
      expense.payable_net_amount ??=
        expense.vendor_tax_mode === "免稅"
          ? expense.payable_amount
          : Math.round(expense.payable_amount / 1.05);
      expense.invoice_amount ??= null;
      expense.vendor_invoice_note ??= null;
    }
    return store;
  } catch {
    return structuredClone(EMPTY_STORE);
  }
}

async function writeLocalStore(store: BkBookkeepingStore) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

function enrichExpense(
  expense: BkProjectExpense,
  payments: BkExpensePayment[],
  vendorName?: string,
  projectName?: string,
): BkExpenseWithPayments {
  const paid = expensePaidAmount(payments);
  return {
    ...expense,
    payments,
    paid_amount: paid,
    unpaid_balance: expenseUnpaidBalance(expense.payable_amount, paid),
    payment_status: expensePaymentStatus(expense.payable_amount, paid),
    vendor_name: vendorName,
    project_name: projectName,
  };
}

function projectSummaryFor(
  store: BkBookkeepingStore,
  project: BkProject,
) {
  const incomes = store.project_incomes.filter((item) => item.project_id === project.id);
  const expenses = store.project_expenses.filter((item) => item.project_id === project.id);
  const expenseIds = new Set(expenses.map((item) => item.id));
  const payments = store.expense_payments.filter((item) => expenseIds.has(item.expense_id));
  return computeProjectSummary(project, incomes, expenses, payments);
}

async function withLocalStore<T>(fn: (store: BkBookkeepingStore) => T | Promise<T>): Promise<T> {
  const store = await readLocalStore();
  const result = await fn(store);
  await writeLocalStore(store);
  return result;
}

async function withLocalStoreRead<T>(fn: (store: BkBookkeepingStore) => T): Promise<T> {
  const store = await readLocalStore();
  return fn(store);
}

export function isBookkeepingStorageAvailable() {
  return isSupabaseTenantConfigured() || process.env.NODE_ENV !== "production";
}

export function bookkeepingUsesLocalStorage() {
  return !isSupabaseTenantConfigured();
}

// --- Supabase helpers ---

async function supabaseFetchAll() {
  const supabase = await createSupabaseTenantClient();
  const [
    projects,
    projectIncomes,
    vendors,
    projectExpenses,
    expensePayments,
  ] = await Promise.all([
    supabase.from("sianying_bk_projects").select("*").order("updated_at", { ascending: false }),
    supabase.from("sianying_bk_project_incomes").select("*").order("received_date", { ascending: false }),
    supabase.from("sianying_bk_vendors").select("*").order("name"),
    supabase.from("sianying_bk_project_expenses").select("*").order("expense_date", { ascending: false }),
    supabase.from("sianying_bk_expense_payments").select("*").order("paid_date", { ascending: false }),
  ]);

  for (const result of [projects, projectIncomes, vendors, projectExpenses, expensePayments]) {
    if (result.error) throw new Error(result.error.message);
  }

  return {
    projects: (projects.data ?? []) as BkProject[],
    project_incomes: (projectIncomes.data ?? []) as BkProjectIncome[],
    vendors: (vendors.data ?? []) as BkVendor[],
    project_expenses: (projectExpenses.data ?? []) as BkProjectExpense[],
    expense_payments: (expensePayments.data ?? []) as BkExpensePayment[],
  } satisfies BkBookkeepingStore;
}

// --- Public API ---

export async function listBookkeepingSuggestions(query?: string) {
  const q = query?.trim().toLowerCase() ?? "";
  const build = (store: BkBookkeepingStore) => {
    const vendorNames = Array.from(
      new Set(store.vendors.map((item) => item.name.trim()).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b, "zh-Hant"));
    const trades = Array.from(
      new Set(
        [
          ...store.vendors.map((item) => item.trade?.trim() ?? ""),
          ...store.project_expenses.map((item) => item.trade.trim()),
        ].filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b, "zh-Hant"));

    const filter = (items: string[]) =>
      q ? items.filter((item) => item.toLowerCase().includes(q)) : items;

    const vendorNameById = new Map(
      store.vendors.map((vendor) => [vendor.id, vendor.name.trim()]),
    );
    const vendorTrades: Array<{ vendor: string; trade: string }> = [];
    const seenVendorTrades = new Set<string>();
    const addVendorTrade = (vendor: string, trade: string) => {
      const trimmedVendor = vendor.trim();
      const trimmedTrade = trade.trim();
      if (!trimmedVendor || !trimmedTrade) return;
      const key = `${trimmedTrade.toLowerCase()}\u0000${trimmedVendor.toLowerCase()}`;
      if (seenVendorTrades.has(key)) return;
      seenVendorTrades.add(key);
      vendorTrades.push({ vendor: trimmedVendor, trade: trimmedTrade });
    };

    [...store.project_expenses]
      .sort(
        (a, b) =>
          b.expense_date.localeCompare(a.expense_date) ||
          b.updated_at.localeCompare(a.updated_at),
      )
      .forEach((expense) => {
        addVendorTrade(vendorNameById.get(expense.vendor_id) ?? "", expense.trade);
      });

    store.vendors.forEach((vendor) => {
      addVendorTrade(vendor.name, vendor.trade ?? "");
    });

    const filteredVendorTrades = q
      ? vendorTrades.filter(
          (item) =>
            item.vendor.toLowerCase().includes(q) || item.trade.toLowerCase().includes(q),
        )
      : vendorTrades;

    return {
      vendors: filter(vendorNames).slice(0, 12),
      trades: filter(trades).slice(0, 12),
      vendorTrades: filteredVendorTrades.slice(0, 200),
    };
  };

  if (bookkeepingUsesLocalStorage()) {
    return withLocalStoreRead(build);
  }
  return build(await supabaseFetchAll());
}

async function resolveOrCreateVendorByName(name: string, trade?: string | null): Promise<BkVendor> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("請輸入廠商名稱");

  if (bookkeepingUsesLocalStorage()) {
    return withLocalStore((store) => {
      const existing = store.vendors.find(
        (item) => item.name.trim().toLowerCase() === trimmed.toLowerCase(),
      );
      if (existing) {
        if (trade?.trim() && !existing.trade) {
          existing.trade = trade.trim();
          existing.updated_at = nowIso();
        }
        return existing;
      }
      const vendor: BkVendor = {
        id: randomUUID(),
        name: trimmed,
        trade: trade?.trim() || null,
        contact_name: null,
        phone: null,
        tax_id: null,
        bank_info: null,
        note: null,
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      store.vendors.push(vendor);
      return vendor;
    });
  }

  const supabase = await createSupabaseTenantClient();
  const { data: vendors, error } = await supabase.from("sianying_bk_vendors").select("*");
  if (error) throw new Error(error.message);
  const existing = (vendors ?? []).find(
    (item) => item.name.trim().toLowerCase() === trimmed.toLowerCase(),
  ) as BkVendor | undefined;
  if (existing) return existing;
  return createBookkeepingVendor({ name: trimmed, trade: trade ?? undefined });
}

export async function listBookkeepingProjects(filters?: {
  q?: string;
  status?: BkProjectStatus | "全部";
}): Promise<BkProjectListItem[]> {
  if (bookkeepingUsesLocalStorage()) {
    return withLocalStoreRead((store) => {
      const q = filters?.q?.trim().toLowerCase();
      return store.projects
        .filter((project) => {
          if (filters?.status && filters.status !== "全部" && project.status !== filters.status) {
            return false;
          }
          if (!q) return true;
          return [project.name, project.client_name ?? ""]
            .join(" ")
            .toLowerCase()
            .includes(q);
        })
        .map((project) => ({ ...project, ...projectSummaryFor(store, project) }))
        .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
    });
  }

  const store = await supabaseFetchAll();
  const q = filters?.q?.trim().toLowerCase();
  return store.projects
    .filter((project) => {
      if (filters?.status && filters.status !== "全部" && project.status !== filters.status) {
        return false;
      }
      if (!q) return true;
      return [project.name, project.client_name ?? ""].join(" ").toLowerCase().includes(q);
    })
    .map((project) => ({ ...project, ...projectSummaryFor(store, project) }))
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export async function getBookkeepingProject(id: string) {
  if (bookkeepingUsesLocalStorage()) {
    return withLocalStoreRead((store) => {
      const project = store.projects.find((item) => item.id === id);
      if (!project) return null;

      const vendors = new Map(store.vendors.map((item) => [item.id, item.name]));
      const incomes = store.project_incomes
        .filter((item) => item.project_id === id)
        .sort((a, b) => b.received_date.localeCompare(a.received_date));
      const expenses = store.project_expenses
        .filter((item) => item.project_id === id)
        .sort((a, b) => b.expense_date.localeCompare(a.expense_date))
        .map((expense) =>
          enrichExpense(
            expense,
            store.expense_payments.filter((item) => item.expense_id === expense.id),
            vendors.get(expense.vendor_id),
          ),
        );

      return {
        project,
        summary: projectSummaryFor(store, project),
        incomes,
        expenses,
      };
    });
  }

  const store = await supabaseFetchAll();
  const project = store.projects.find((item) => item.id === id);
  if (!project) return null;

  const vendors = new Map(store.vendors.map((item) => [item.id, item.name]));
  const incomes = store.project_incomes
    .filter((item) => item.project_id === id)
    .sort((a, b) => b.received_date.localeCompare(a.received_date));
  const expenses = store.project_expenses
    .filter((item) => item.project_id === id)
    .sort((a, b) => b.expense_date.localeCompare(a.expense_date))
    .map((expense) =>
      enrichExpense(
        expense,
        store.expense_payments.filter((item) => item.expense_id === expense.id),
        vendors.get(expense.vendor_id),
      ),
    );

  return {
    project,
    summary: projectSummaryFor(store, project),
    incomes,
    expenses,
  };
}

export async function createBookkeepingProject(input: {
  name: string;
  client_name?: string;
  client_phone?: string;
  client_tax_id?: string;
  client_invoice_tax_mode?: BkInvoiceTaxMode;
  client_invoice_no?: string;
  design_invoice_tax_mode?: BkInvoiceTaxMode;
  design_invoice_no?: string;
  prepayment_invoice_tax_mode?: BkInvoiceTaxMode;
  prepayment_invoice_no?: string;
  address?: string;
  design_fee_amount?: number;
  prepayment_amount?: number;
  contract_amount?: number;
  status?: BkProjectStatus;
  note?: string;
}) {
  const name = input.name.trim();
  if (!name) throw new Error("案名為必填");

  const payload = {
    name,
    client_name: input.client_name?.trim() || null,
    client_phone: input.client_phone?.trim() || null,
    client_tax_id: input.client_tax_id?.trim() || null,
    client_invoice_tax_mode: input.client_invoice_tax_mode ?? "不開",
    client_invoice_no: input.client_invoice_no?.trim() || null,
    design_invoice_tax_mode: input.design_invoice_tax_mode ?? "不開",
    design_invoice_no: input.design_invoice_no?.trim() || null,
    prepayment_invoice_tax_mode: input.prepayment_invoice_tax_mode ?? "不開",
    prepayment_invoice_no: input.prepayment_invoice_no?.trim() || null,
    address: input.address?.trim() || null,
    design_fee_amount: nonNegativeAmount(input.design_fee_amount, "設計費簽約金額"),
    prepayment_amount: nonNegativeAmount(input.prepayment_amount, "預付款金額"),
    contract_amount: nonNegativeAmount(input.contract_amount, "工程款簽約金額"),
    status: input.status ?? "進行中",
    note: input.note?.trim() || null,
  };

  if (bookkeepingUsesLocalStorage()) {
    return withLocalStore((store) => {
      const project: BkProject = {
        id: randomUUID(),
        ...payload,
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      store.projects.unshift(project);
      return project;
    });
  }

  const supabase = await createSupabaseTenantClient();
  const { data, error } = await supabase.from("sianying_bk_projects").insert(payload).select("*").single();
  if (error) throw new Error(error.message);
  return data as BkProject;
}

export async function updateBookkeepingProject(
  id: string,
  input: Partial<{
    name: string;
    client_name: string | null;
    client_phone: string | null;
    client_tax_id: string | null;
    client_invoice_tax_mode: BkInvoiceTaxMode;
    client_invoice_no: string | null;
    design_invoice_tax_mode: BkInvoiceTaxMode;
    design_invoice_no: string | null;
    prepayment_invoice_tax_mode: BkInvoiceTaxMode;
    prepayment_invoice_no: string | null;
    address: string | null;
    design_fee_amount: number;
    prepayment_amount: number;
    contract_amount: number;
    status: BkProjectStatus;
    note: string | null;
  }>,
) {
  if (bookkeepingUsesLocalStorage()) {
    return withLocalStore((store) => {
      const project = store.projects.find((item) => item.id === id);
      if (!project) throw new Error("找不到案件");
      Object.assign(project, input, { updated_at: nowIso() });
      return project;
    });
  }

  const supabase = await createSupabaseTenantClient();
  const { data, error } = await supabase
    .from("sianying_bk_projects")
    .update({ ...input, updated_at: nowIso() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as BkProject;
}

export async function deleteBookkeepingProject(id: string) {
  if (bookkeepingUsesLocalStorage()) {
    return withLocalStore((store) => {
      store.projects = store.projects.filter((item) => item.id !== id);
      store.project_incomes = store.project_incomes.filter((item) => item.project_id !== id);
      const expenseIds = new Set(
        store.project_expenses.filter((item) => item.project_id === id).map((item) => item.id),
      );
      store.project_expenses = store.project_expenses.filter((item) => item.project_id !== id);
      store.expense_payments = store.expense_payments.filter((item) => !expenseIds.has(item.expense_id));
    });
  }

  const supabase = await createSupabaseTenantClient();
  const { error } = await supabase.from("sianying_bk_projects").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listBookkeepingVendors(filters?: { q?: string }): Promise<BkVendorListItem[]> {
  const build = (store: BkBookkeepingStore) => {
    const q = filters?.q?.trim().toLowerCase();
    return store.vendors
      .filter((vendor) => {
        if (!q) return true;
        return [vendor.name, vendor.trade ?? ""].join(" ").toLowerCase().includes(q);
      })
      .map((vendor) => {
        const expenses = store.project_expenses.filter((item) => item.vendor_id === vendor.id);
        const expenseIds = new Set(expenses.map((item) => item.id));
        const payments = store.expense_payments.filter((item) => expenseIds.has(item.expense_id));
        const projectIds = expenses.map((item) => item.project_id);
        return {
          ...vendor,
          ...computeVendorSummary(expenses, payments, projectIds),
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name, "zh-Hant"));
  };

  if (bookkeepingUsesLocalStorage()) {
    return withLocalStoreRead(build);
  }
  return build(await supabaseFetchAll());
}

export async function getBookkeepingVendor(id: string, filters?: {
  projectId?: string;
  trade?: string;
  status?: string;
  month?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const build = (store: BkBookkeepingStore) => {
    const vendor = store.vendors.find((item) => item.id === id);
    if (!vendor) return null;

    const projects = new Map(store.projects.map((item) => [item.id, item.name]));
    const expenses = store.project_expenses
      .filter((item) => item.vendor_id === id)
      .filter((item) => !filters?.projectId || item.project_id === filters.projectId)
      .filter((item) => !filters?.trade || item.trade === filters.trade)
      .filter((item) => !filters?.month || item.expense_date.startsWith(filters.month))
      .filter((item) =>
        isDateWithinRange(item.expense_date, filters?.dateFrom, filters?.dateTo),
      )
      .map((expense) =>
        enrichExpense(
          expense,
          store.expense_payments.filter((item) => item.expense_id === expense.id),
          vendor.name,
          projects.get(expense.project_id),
        ),
      )
      .filter((expense) => !filters?.status || expense.payment_status === filters.status);

    const allExpenses = store.project_expenses.filter((item) => item.vendor_id === id);
    const expenseIds = new Set(allExpenses.map((item) => item.id));
    const allPayments = store.expense_payments.filter((item) => expenseIds.has(item.expense_id));

    const groups: BkVendorProjectGroup[] = buildVendorProjectGroups({
      expenses: expenses.map((expense) => ({
        ...expense,
        project_name: projects.get(expense.project_id) ?? "—",
      })),
    });

    return {
      vendor,
      summary: computeVendorSummary(
        allExpenses,
        allPayments,
        allExpenses.map((item) => item.project_id),
      ),
      groups,
      expenses,
    };
  };

  if (bookkeepingUsesLocalStorage()) {
    return withLocalStoreRead(build);
  }
  return build(await supabaseFetchAll());
}

export async function createBookkeepingVendor(input: {
  name: string;
  trade?: string;
  contact_name?: string;
  phone?: string;
  tax_id?: string;
  bank_info?: string;
  note?: string;
}) {
  const name = input.name.trim();
  if (!name) throw new Error("廠商名稱為必填");

  const payload = {
    name,
    trade: input.trade?.trim() || null,
    contact_name: input.contact_name?.trim() || null,
    phone: input.phone?.trim() || null,
    tax_id: input.tax_id?.trim() || null,
    bank_info: input.bank_info?.trim() || null,
    note: input.note?.trim() || null,
  };

  if (bookkeepingUsesLocalStorage()) {
    return withLocalStore((store) => {
      const vendor: BkVendor = {
        id: randomUUID(),
        ...payload,
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      store.vendors.push(vendor);
      return vendor;
    });
  }

  const supabase = await createSupabaseTenantClient();
  const { data, error } = await supabase.from("sianying_bk_vendors").insert(payload).select("*").single();
  if (error) throw new Error(error.message);
  return data as BkVendor;
}

export async function updateBookkeepingVendor(
  id: string,
  input: Partial<{
    name: string;
    trade: string | null;
    contact_name: string | null;
    phone: string | null;
    tax_id: string | null;
    bank_info: string | null;
    note: string | null;
  }>,
) {
  if (bookkeepingUsesLocalStorage()) {
    return withLocalStore((store) => {
      const vendor = store.vendors.find((item) => item.id === id);
      if (!vendor) throw new Error("找不到廠商");
      Object.assign(vendor, input, { updated_at: nowIso() });
      return vendor;
    });
  }

  const supabase = await createSupabaseTenantClient();
  const { data, error } = await supabase
    .from("sianying_bk_vendors")
    .update({ ...input, updated_at: nowIso() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as BkVendor;
}

export async function deleteBookkeepingVendor(id: string) {
  if (bookkeepingUsesLocalStorage()) {
    const store = await readLocalStore();
    const vendorExists = store.vendors.some((item) => item.id === id);
    if (!vendorExists) throw new Error("找不到廠商");
    const hasExpenses = store.project_expenses.some((item) => item.vendor_id === id);
    if (hasExpenses) throw new Error("此廠商仍有支出紀錄，無法刪除");
    return withLocalStore((next) => {
      next.vendors = next.vendors.filter((item) => item.id !== id);
    });
  }

  const supabase = await createSupabaseTenantClient();
  const { count, error: expenseError } = await supabase
    .from("sianying_bk_project_expenses")
    .select("id", { count: "exact", head: true })
    .eq("vendor_id", id);
  if (expenseError) throw new Error(expenseError.message);
  if ((count ?? 0) > 0) throw new Error("此廠商仍有支出紀錄，無法刪除");

  const { error } = await supabase.from("sianying_bk_vendors").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function createProjectIncome(input: {
  project_id: string;
  income_category?: BkIncomeCategory;
  received_date: string;
  amount: number;
  payment_method?: BkPaymentMethod;
  reference_no?: string;
  invoice_tax_mode?: BkInvoiceTaxMode;
  client_invoice_status?: BkClientInvoiceStatus;
  client_invoice_no?: string;
  tax_status?: BkTaxStatus;
  tax_amount?: number | null;
  tax_paid_date?: string | null;
  note?: string;
}) {
  const taxMode = input.invoice_tax_mode ?? "不開";
  const breakdown = incomeTaxBreakdown({
    amount: positiveAmount(input.amount, "收款金額"),
    invoice_tax_mode: taxMode,
  });
  const invoiceStatus = input.client_invoice_status ?? legacyInvoiceStatus(taxMode, input.client_invoice_no);
  const taxStatus = input.tax_status ?? legacyTaxStatus(taxMode);

  const payload = {
    project_id: input.project_id,
    income_category: input.income_category ?? "工程款",
    received_date: input.received_date,
    amount: breakdown.mode === "外加" ? breakdown.net : positiveAmount(input.amount, "收款金額"),
    payment_method: input.payment_method ?? "匯款",
    reference_no: input.reference_no?.trim() || null,
    invoice_tax_mode: breakdown.mode,
    client_invoice_status: invoiceStatus,
    client_invoice_no: input.client_invoice_no?.trim() || null,
    tax_status: taxStatus,
    tax_amount: breakdown.tax,
    tax_paid_date: input.tax_paid_date || null,
    note: input.note?.trim() || null,
  };

  if (bookkeepingUsesLocalStorage()) {
    return withLocalStore((store) => {
      const income: BkProjectIncome = {
        id: randomUUID(),
        ...payload,
        created_at: nowIso(),
      };
      store.project_incomes.unshift(income);
      const project = store.projects.find((item) => item.id === payload.project_id);
      if (project) project.updated_at = nowIso();
      return income;
    });
  }

  const supabase = await createSupabaseTenantClient();
  const { data, error } = await supabase.from("sianying_bk_project_incomes").insert(payload).select("*").single();
  if (error) throw new Error(error.message);
  await supabase.from("sianying_bk_projects").update({ updated_at: nowIso() }).eq("id", payload.project_id);
  return data as BkProjectIncome;
}

export async function updateProjectIncome(
  id: string,
  input: Partial<{
    income_category: BkIncomeCategory;
    received_date: string;
    amount: number;
    payment_method: BkPaymentMethod;
    reference_no: string | null;
    invoice_tax_mode: BkInvoiceTaxMode;
    client_invoice_status: BkClientInvoiceStatus;
    client_invoice_no: string | null;
    tax_status: BkTaxStatus;
    tax_amount: number | null;
    tax_paid_date: string | null;
    note: string | null;
  }>,
) {
  let patch: Partial<{
    income_category: BkIncomeCategory;
    received_date: string;
    amount: number;
    payment_method: BkPaymentMethod;
    reference_no: string | null;
    invoice_tax_mode: BkInvoiceTaxMode;
    client_invoice_status: BkClientInvoiceStatus;
    client_invoice_no: string | null;
    tax_status: BkTaxStatus;
    tax_amount: number | null;
    tax_paid_date: string | null;
    note: string | null;
  }> = { ...input };

  if (input.amount !== undefined) {
    const taxMode = input.invoice_tax_mode ?? "不開";
    const breakdown = incomeTaxBreakdown({
      amount: positiveAmount(input.amount, "收款金額"),
      invoice_tax_mode: taxMode,
    });
    patch = {
      ...patch,
      amount: breakdown.mode === "外加" ? breakdown.net : positiveAmount(input.amount, "收款金額"),
      invoice_tax_mode: breakdown.mode,
      tax_amount: breakdown.tax,
      client_invoice_status:
        input.client_invoice_status ?? legacyInvoiceStatus(breakdown.mode, input.client_invoice_no),
      tax_status: input.tax_status ?? legacyTaxStatus(breakdown.mode),
    };
  } else if (input.tax_amount !== undefined && input.tax_amount !== null) {
    patch.tax_amount = nonNegativeAmount(input.tax_amount, "稅金金額");
  }

  if (bookkeepingUsesLocalStorage()) {
    return withLocalStore((store) => {
      const income = store.project_incomes.find((item) => item.id === id);
      if (!income) throw new Error("找不到收款紀錄");
      Object.assign(income, patch);
      const project = store.projects.find((item) => item.id === income.project_id);
      if (project) project.updated_at = nowIso();
      return income;
    });
  }

  const supabase = await createSupabaseTenantClient();
  const { data, error } = await supabase.from("sianying_bk_project_incomes").update(patch).eq("id", id).select("*").single();
  if (error) throw new Error(error.message);
  return data as BkProjectIncome;
}

export async function deleteProjectIncome(id: string) {
  if (bookkeepingUsesLocalStorage()) {
    return withLocalStore((store) => {
      const income = store.project_incomes.find((item) => item.id === id);
      store.project_incomes = store.project_incomes.filter((item) => item.id !== id);
      if (income) {
        const project = store.projects.find((item) => item.id === income.project_id);
        if (project) project.updated_at = nowIso();
      }
    });
  }

  const supabase = await createSupabaseTenantClient();
  const { error } = await supabase.from("sianying_bk_project_incomes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function createProjectExpense(input: {
  project_id: string;
  vendor_id?: string;
  vendor_name?: string;
  expense_date: string;
  trade: string;
  description?: string;
  payable_net_amount?: number;
  payable_amount: number;
  due_date?: string;
  payment_stage?: BkPaymentStage | null;
  invoice_no?: string;
  invoice_amount?: number;
  vendor_tax_mode?: BkVendorTaxMode;
  vendor_invoice_status?: BkVendorInvoiceStatus;
  vendor_invoice_note?: string;
  note?: string;
}) {
  const trade = input.trade.trim();
  if (!trade) throw new Error("工種為必填");

  let vendorId = input.vendor_id;
  if (input.vendor_name?.trim()) {
    const vendor = await resolveOrCreateVendorByName(input.vendor_name, trade);
    vendorId = vendor.id;
  }
  if (!vendorId) throw new Error("請輸入廠商名稱");

  const tax = normalizeVendorExpenseTax(input);
  const payable = syncExpenseDraftPayable({
    payable_net_amount:
      input.payable_net_amount ??
      (input.vendor_tax_mode === "免稅" ? input.payable_amount : Math.round(input.payable_amount / 1.05)),
    vendor_tax_mode: tax.vendor_tax_mode,
  });

  const payload = {
    project_id: input.project_id,
    vendor_id: vendorId,
    expense_date: input.expense_date,
    trade,
    description: input.description?.trim() || null,
    payable_net_amount: Number(payable.payable_net_amount),
    payable_amount: positiveAmount(Number(payable.payable_amount), "應付金額"),
    due_date: input.due_date || null,
    payment_stage: input.payment_stage ?? null,
    invoice_no: input.invoice_no?.trim() || null,
    invoice_amount:
      input.invoice_amount == null
        ? null
        : positiveAmount(input.invoice_amount, "發票金額"),
    vendor_tax_mode: tax.vendor_tax_mode,
    vendor_invoice_status: tax.vendor_invoice_status,
    vendor_invoice_note: input.vendor_invoice_note?.trim() || null,
    note: input.note?.trim() || null,
  };

  if (bookkeepingUsesLocalStorage()) {
    return withLocalStore((store) => {
      const expense: BkProjectExpense = {
        id: randomUUID(),
        ...payload,
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      store.project_expenses.unshift(expense);
      const project = store.projects.find((item) => item.id === payload.project_id);
      if (project) project.updated_at = nowIso();
      return enrichExpense(expense, [], undefined, project?.name);
    });
  }

  const supabase = await createSupabaseTenantClient();
  const { data, error } = await supabase.from("sianying_bk_project_expenses").insert(payload).select("*").single();
  if (error) throw new Error(error.message);
  await supabase.from("sianying_bk_projects").update({ updated_at: nowIso() }).eq("id", payload.project_id);
  return data as BkProjectExpense;
}

export async function updateProjectExpense(
  id: string,
  input: Partial<{
    vendor_id: string;
    vendor_name: string;
    expense_date: string;
    trade: string;
    description: string | null;
    payable_net_amount: number | null;
    payable_amount: number;
    due_date: string | null;
    payment_stage: BkPaymentStage | null;
    invoice_no: string | null;
    invoice_amount: number | null;
    vendor_tax_mode: BkVendorTaxMode;
    vendor_invoice_status: BkVendorInvoiceStatus;
    vendor_invoice_note: string | null;
    note: string | null;
  }>,
) {
  const patch: Partial<BkProjectExpense> & { vendor_id?: string } = { ...input };
  if (input.invoice_amount !== undefined && input.invoice_amount !== null) {
    patch.invoice_amount = positiveAmount(input.invoice_amount, "發票金額");
  }
  if (input.vendor_tax_mode !== undefined || input.vendor_invoice_status !== undefined) {
    const tax = normalizeVendorExpenseTax({
      vendor_tax_mode: input.vendor_tax_mode,
      vendor_invoice_status: input.vendor_invoice_status,
    });
    patch.vendor_tax_mode = tax.vendor_tax_mode;
    patch.vendor_invoice_status = tax.vendor_invoice_status;
  }
  if (input.vendor_name?.trim()) {
    const vendor = await resolveOrCreateVendorByName(
      input.vendor_name,
      input.trade ?? undefined,
    );
    patch.vendor_id = vendor.id;
    delete (patch as { vendor_name?: string }).vendor_name;
  }

  const shouldSyncPayable =
    input.payable_net_amount !== undefined ||
    input.payable_amount !== undefined ||
    input.vendor_tax_mode !== undefined;

  if (shouldSyncPayable) {
    const resolveCurrent = async () => {
      if (bookkeepingUsesLocalStorage()) {
        const store = await readLocalStore();
        const expense = store.project_expenses.find((item) => item.id === id);
        if (!expense) throw new Error("找不到支出紀錄");
        return expense;
      }
      const supabase = await createSupabaseTenantClient();
      const { data, error } = await supabase.from("sianying_bk_project_expenses").select("*").eq("id", id).single();
      if (error || !data) throw new Error("找不到支出紀錄");
      return data as BkProjectExpense;
    };

    const current = await resolveCurrent();
    const taxMode = patch.vendor_tax_mode ?? deriveVendorTaxMode(current);
    const netInput =
      input.payable_net_amount !== undefined
        ? input.payable_net_amount ?? 0
        : input.payable_amount !== undefined
          ? deriveVendorPayableNet({
              payable_amount: input.payable_amount,
              payable_net_amount: input.payable_net_amount,
              vendor_tax_mode: taxMode,
            })
          : deriveVendorPayableNet(current);
    const synced = syncExpenseDraftPayable({
      payable_net_amount: netInput,
      vendor_tax_mode: taxMode,
    });
    patch.payable_net_amount = Number(synced.payable_net_amount);
    patch.payable_amount = positiveAmount(Number(synced.payable_amount), "應付金額");
  }

  if (bookkeepingUsesLocalStorage()) {
    return withLocalStore((store) => {
      const expense = store.project_expenses.find((item) => item.id === id);
      if (!expense) throw new Error("找不到支出紀錄");
      const payments = store.expense_payments.filter((item) => item.expense_id === id);
      if (patch.payable_amount !== undefined) {
        const paid = expensePaidAmount(payments);
        if (paid > patch.payable_amount) throw new Error("應付金額不可小於已付金額");
      }
      Object.assign(expense, { ...patch, updated_at: nowIso() });
      const project = store.projects.find((item) => item.id === expense.project_id);
      if (project) project.updated_at = nowIso();
      return expense;
    });
  }

  const supabase = await createSupabaseTenantClient();
  if (patch.payable_amount !== undefined) {
    const { data: payments } = await supabase.from("sianying_bk_expense_payments").select("amount").eq("expense_id", id);
    const paid = expensePaidAmount((payments ?? []) as BkExpensePayment[]);
    if (paid > patch.payable_amount) throw new Error("應付金額不可小於已付金額");
  }

  const { data, error } = await supabase
    .from("sianying_bk_project_expenses")
    .update({ ...patch, updated_at: nowIso() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as BkProjectExpense;
}

export async function deleteProjectExpense(id: string) {
  if (bookkeepingUsesLocalStorage()) {
    const store = await readLocalStore();
    const payments = store.expense_payments.filter((item) => item.expense_id === id);
    if (payments.length) {
      throw new Error("此支出已有付款紀錄，刪除前請先確認並移除付款");
    }
    return withLocalStore((next) => {
      const expense = next.project_expenses.find((item) => item.id === id);
      next.project_expenses = next.project_expenses.filter((item) => item.id !== id);
      if (expense) {
        const project = next.projects.find((item) => item.id === expense.project_id);
        if (project) project.updated_at = nowIso();
      }
    });
  }

  const supabase = await createSupabaseTenantClient();
  const { data: payments } = await supabase.from("sianying_bk_expense_payments").select("id").eq("expense_id", id);
  if ((payments ?? []).length) {
    throw new Error("此支出已有付款紀錄，刪除前請先確認並移除付款");
  }
  const { error } = await supabase.from("sianying_bk_project_expenses").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function createExpensePayment(input: {
  expense_id: string;
  paid_date: string;
  amount: number;
  payment_method?: BkPaymentMethod;
  reference_no?: string;
  note?: string;
}) {
  const amount = positiveAmount(input.amount, "付款金額");
  const payload = {
    expense_id: input.expense_id,
    paid_date: input.paid_date,
    amount,
    payment_method: input.payment_method ?? "匯款",
    reference_no: input.reference_no?.trim() || null,
    note: input.note?.trim() || null,
  };

  if (bookkeepingUsesLocalStorage()) {
    return withLocalStore((store) => {
      const expense = store.project_expenses.find((item) => item.id === payload.expense_id);
      if (!expense) throw new Error("找不到支出紀錄");
      const payments = store.expense_payments.filter((item) => item.expense_id === payload.expense_id);
      const validation = validatePaymentTotal(expense.payable_amount, payments, amount);
      if (!validation.ok) throw new Error(validation.message);

      const payment: BkExpensePayment = {
        id: randomUUID(),
        ...payload,
        created_at: nowIso(),
      };
      store.expense_payments.unshift(payment);
      const project = store.projects.find((item) => item.id === expense.project_id);
      if (project) project.updated_at = nowIso();
      expense.updated_at = nowIso();
      return payment;
    });
  }

  const supabase = await createSupabaseTenantClient();
  const { data: expense, error: expenseError } = await supabase
    .from("sianying_bk_project_expenses")
    .select("*")
    .eq("id", payload.expense_id)
    .single();
  if (expenseError) throw new Error(expenseError.message);

  const { data: payments } = await supabase
    .from("sianying_bk_expense_payments")
    .select("amount")
    .eq("expense_id", payload.expense_id);
  const validation = validatePaymentTotal(
    (expense as BkProjectExpense).payable_amount,
    (payments ?? []) as BkExpensePayment[],
    amount,
  );
  if (!validation.ok) throw new Error(validation.message);

  const { data, error } = await supabase.from("sianying_bk_expense_payments").insert(payload).select("*").single();
  if (error) throw new Error(error.message);
  await supabase
    .from("sianying_bk_project_expenses")
    .update({ updated_at: nowIso() })
    .eq("id", payload.expense_id);
  await supabase
    .from("sianying_bk_projects")
    .update({ updated_at: nowIso() })
    .eq("id", (expense as BkProjectExpense).project_id);
  return data as BkExpensePayment;
}

export async function updateExpensePayment(
  id: string,
  input: Partial<{
    paid_date: string;
    amount: number;
    payment_method: BkPaymentMethod;
    reference_no: string | null;
    note: string | null;
  }>,
) {
  if (bookkeepingUsesLocalStorage()) {
    return withLocalStore((store) => {
      const payment = store.expense_payments.find((item) => item.id === id);
      if (!payment) throw new Error("找不到付款紀錄");
      const expense = store.project_expenses.find((item) => item.id === payment.expense_id);
      if (!expense) throw new Error("找不到支出紀錄");

      const others = store.expense_payments.filter((item) => item.expense_id === payment.expense_id && item.id !== id);
      const nextAmount = input.amount === undefined ? payment.amount : positiveAmount(input.amount, "付款金額");
      const validation = validatePaymentTotal(expense.payable_amount, others, nextAmount);
      if (!validation.ok) throw new Error(validation.message);

      Object.assign(payment, input, { amount: nextAmount });
      expense.updated_at = nowIso();
      const project = store.projects.find((item) => item.id === expense.project_id);
      if (project) project.updated_at = nowIso();
      return payment;
    });
  }

  const supabase = await createSupabaseTenantClient();
  const { data: payment, error: paymentError } = await supabase
    .from("sianying_bk_expense_payments")
    .select("*")
    .eq("id", id)
    .single();
  if (paymentError) throw new Error(paymentError.message);

  const { data: expense } = await supabase
    .from("sianying_bk_project_expenses")
    .select("*")
    .eq("id", (payment as BkExpensePayment).expense_id)
    .single();

  const { data: others } = await supabase
    .from("sianying_bk_expense_payments")
    .select("amount")
    .eq("expense_id", (payment as BkExpensePayment).expense_id)
    .neq("id", id);

  const nextAmount =
    input.amount === undefined
      ? (payment as BkExpensePayment).amount
      : positiveAmount(input.amount, "付款金額");
  const validation = validatePaymentTotal(
    (expense as BkProjectExpense).payable_amount,
    (others ?? []) as BkExpensePayment[],
    nextAmount,
  );
  if (!validation.ok) throw new Error(validation.message);

  const { data, error } = await supabase
    .from("sianying_bk_expense_payments")
    .update({ ...input, amount: nextAmount })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as BkExpensePayment;
}

export async function deleteExpensePayment(id: string) {
  if (bookkeepingUsesLocalStorage()) {
    return withLocalStore((store) => {
      const payment = store.expense_payments.find((item) => item.id === id);
      store.expense_payments = store.expense_payments.filter((item) => item.id !== id);
      if (payment) {
        const expense = store.project_expenses.find((item) => item.id === payment.expense_id);
        if (expense) {
          expense.updated_at = nowIso();
          const project = store.projects.find((item) => item.id === expense.project_id);
          if (project) project.updated_at = nowIso();
        }
      }
    });
  }

  const supabase = await createSupabaseTenantClient();
  const { error } = await supabase.from("sianying_bk_expense_payments").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listBookkeepingVendorsSimple() {
  if (bookkeepingUsesLocalStorage()) {
    return withLocalStoreRead((store) => store.vendors.sort((a, b) => a.name.localeCompare(b.name, "zh-Hant")));
  }
  const supabase = await createSupabaseTenantClient();
  const { data, error } = await supabase.from("sianying_bk_vendors").select("*").order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as BkVendor[];
}

export async function seedBookkeepingDemoData() {
  const existing = await listBookkeepingProjects();
  if (existing.length) return { seeded: false };

  const project = await createBookkeepingProject({
    name: "案件 A（示範）",
    client_name: "示範客戶",
    contract_amount: 1_000_000,
    status: "進行中",
  });

  await createProjectIncome({
    project_id: project.id,
    received_date: "2026-01-15",
    amount: 600_000,
    payment_method: "匯款",
  });

  const vendorA = await createBookkeepingVendor({ name: "廠商甲", trade: "泥作" });
  const vendorB = await createBookkeepingVendor({ name: "廠商乙", trade: "水電" });

  const expenseA = await createProjectExpense({
    project_id: project.id,
    vendor_id: vendorA.id,
    expense_date: "2026-02-01",
    trade: "泥作",
    description: "泥作工程",
    payable_amount: 100_000,
  });

  await createExpensePayment({
    expense_id: expenseA.id,
    paid_date: "2026-02-10",
    amount: 60_000,
    payment_method: "匯款",
  });

  await createProjectExpense({
    project_id: project.id,
    vendor_id: vendorB.id,
    expense_date: "2026-03-01",
    trade: "水電",
    description: "水電工程",
    payable_amount: 50_000,
  });

  return { seeded: true, projectId: project.id };
}
