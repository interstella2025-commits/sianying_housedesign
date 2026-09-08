"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BkTypeaheadInput } from "@/components/admin/bookkeeping/BkTypeaheadInput";
import { BkDateInput } from "@/components/admin/bookkeeping/BkDateInput";
import { BookkeepingExportBar } from "@/components/admin/bookkeeping/BookkeepingExportBar";
import { BookkeepingNav, BkStatusBadge, bkFetch } from "@/components/admin/bookkeeping/BookkeepingNav";
import { VendorPaymentModal } from "@/components/admin/bookkeeping/VendorPaymentModal";
import { exportVendorDetailCsv } from "@/lib/bookkeeping/csv-export";
import { formatDateRangeLabel } from "@/lib/bookkeeping/date-range";
import { formatCurrency, formatDateTW } from "@/lib/bookkeeping/format";
import {
  isVendorInvoiceOutstanding,
  vendorInvoicePrintFields,
  vendorInvoiceSummary,
} from "@/lib/bookkeeping/vendor-tax";
import { BK_PAYMENT_STATUSES } from "@/lib/bookkeeping/types";
import type {
  BkExpenseWithPayments,
  BkVendor,
  BkVendorProjectGroup,
  BkVendorSummary,
} from "@/lib/bookkeeping/types";

type VendorDetailResponse = {
  vendor: BkVendor;
  summary: BkVendorSummary;
  groups: BkVendorProjectGroup[];
  expenses: BkExpenseWithPayments[];
};

type SuggestionsResponse = { vendors: string[]; trades: string[] };

type PaymentScope = {
  key: string;
  projectId: string;
  trade: string;
  label: string;
};

type InvoiceDraft = {
  invoiceNo: string;
  invoiceAmount: string;
};

export function BookkeepingVendorDetail({ vendorId }: { vendorId: string }) {
  const router = useRouter();
  const [detail, setDetail] = useState<VendorDetailResponse | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionsResponse>({ vendors: [], trades: [] });
  const [editOpen, setEditOpen] = useState(false);
  const [deletingVendor, setDeletingVendor] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentLoadingKey, setPaymentLoadingKey] = useState<string | null>(null);
  const [paymentExpenses, setPaymentExpenses] = useState<BkExpenseWithPayments[]>([]);
  const [paymentScopeLabel, setPaymentScopeLabel] = useState("");
  const [invoiceEditId, setInvoiceEditId] = useState<string | null>(null);
  const [invoiceDraft, setInvoiceDraft] = useState<InvoiceDraft>({
    invoiceNo: "",
    invoiceAmount: "",
  });
  const [invoiceSavingId, setInvoiceSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [projectId, setProjectId] = useState("");
  const [trade, setTrade] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const paymentButtonRef = useRef<HTMLButtonElement>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (projectId) params.set("projectId", projectId);
    if (trade) params.set("trade", trade);
    if (status) params.set("status", status);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    const suffix = params.toString();
    return suffix ? `?${suffix}` : "";
  }, [projectId, trade, status, dateFrom, dateTo]);

  const loadDetail = useCallback(async () => {
    setError(null);
    try {
      const [payload, suggestionPayload] = await Promise.all([
        bkFetch<VendorDetailResponse>(`/api/bookkeeping/vendors/${vendorId}${query}`),
        bkFetch<SuggestionsResponse>("/api/bookkeeping/suggestions"),
      ]);
      setDetail(payload);
      setSuggestions(suggestionPayload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "載入失敗");
    }
  }, [vendorId, query]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- admin detail fetch
    void loadDetail();
  }, [loadDetail]);

  const closePaymentModal = useCallback(() => {
    setPaymentOpen(false);
    setPaymentExpenses([]);
    setPaymentScopeLabel("");
    window.requestAnimationFrame(() => paymentButtonRef.current?.focus());
  }, []);

  async function openPaymentModal(scope?: PaymentScope, trigger?: HTMLButtonElement) {
    if (trigger) paymentButtonRef.current = trigger;
    const loadingKey = scope?.key ?? "all";
    setPaymentLoadingKey(loadingKey);
    setError(null);
    setStatusMessage(null);
    try {
      const fullDetail = await bkFetch<VendorDetailResponse>(`/api/bookkeeping/vendors/${vendorId}`);
      const unpaidExpenses = fullDetail.expenses.filter(
        (expense) =>
          expense.unpaid_balance > 0 &&
          (!scope || (expense.project_id === scope.projectId && expense.trade === scope.trade)),
      );
      if (!unpaidExpenses.length) {
        setError(scope ? "這個案場目前沒有未付款項。" : "這個廠商目前沒有未付款項。");
        await loadDetail();
        return;
      }
      setPaymentExpenses(unpaidExpenses);
      setPaymentScopeLabel(
        scope ? `${fullDetail.vendor.name} · ${scope.label}` : fullDetail.vendor.name,
      );
      setPaymentOpen(true);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "未付款項載入失敗");
    } finally {
      setPaymentLoadingKey(null);
    }
  }

  function beginInvoiceEdit(expense: BkExpenseWithPayments) {
    setInvoiceEditId(expense.id);
    setInvoiceDraft({
      invoiceNo: expense.invoice_no ?? "",
      invoiceAmount: expense.invoice_amount == null ? "" : String(expense.invoice_amount),
    });
    setError(null);
    setStatusMessage(null);
  }

  function focusInvoiceExpense(expense: BkExpenseWithPayments) {
    beginInvoiceEdit(expense);
    window.requestAnimationFrame(() => {
      document.getElementById(`vendor-expense-${expense.id}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }

  async function saveInvoice(
    expense: BkExpenseWithPayments,
    nextDraft: InvoiceDraft = invoiceDraft,
  ) {
    const invoiceNo = nextDraft.invoiceNo.trim();
    const hasAmount = nextDraft.invoiceAmount.trim() !== "";
    const invoiceAmount = hasAmount ? Number(nextDraft.invoiceAmount) : null;
    const isClearing = !invoiceNo && !hasAmount;

    setError(null);
    setStatusMessage(null);
    if (!isClearing && (!invoiceNo || invoiceAmount == null)) {
      setError("請同時輸入發票號碼與發票金額。");
      return;
    }
    if (invoiceAmount != null && (!Number.isFinite(invoiceAmount) || invoiceAmount <= 0)) {
      setError("發票金額必須大於 0。");
      return;
    }

    setInvoiceSavingId(expense.id);
    try {
      await bkFetch("/api/bookkeeping/expenses", {
        method: "PUT",
        body: JSON.stringify({
          id: expense.id,
          invoice_no: isClearing ? null : invoiceNo,
          invoice_amount: isClearing ? null : invoiceAmount,
          vendor_invoice_status: isClearing ? "待收" : "已收到",
        }),
      });
      setInvoiceEditId(null);
      setInvoiceDraft({ invoiceNo: "", invoiceAmount: "" });
      setStatusMessage(isClearing ? "已改回尚未開立" : "發票資料已儲存");
      await loadDetail();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "發票資料儲存失敗");
    } finally {
      setInvoiceSavingId(null);
    }
  }

  async function deleteVendor(vendor: BkVendor, canDelete: boolean) {
    if (!canDelete) {
      setError("此廠商仍有支出紀錄，無法刪除。");
      return;
    }
    const confirmed = window.confirm(
      `確定刪除廠商「${vendor.name}」？\n\n刪除後無法復原。`,
    );
    if (!confirmed) return;

    setDeletingVendor(true);
    setError(null);
    try {
      await bkFetch(`/api/bookkeeping/vendors/${vendor.id}`, { method: "DELETE" });
      router.push("/admin/bookkeeping/vendors");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "刪除廠商失敗");
      setDeletingVendor(false);
    }
  }

  if (!detail) {
    return (
      <>
        <BookkeepingNav />
        {error ? <p className="admin-inline-status is-error">{error}</p> : <p className="admin-note">載入中…</p>}
      </>
    );
  }

  const { vendor, summary, groups, expenses } = detail;
  const projectOptions = Array.from(new Map(groups.map((group) => [group.project_id, group.project_name])).entries());
  const tradeOptions = Array.from(new Set(groups.map((group) => group.trade))).sort((a, b) =>
    a.localeCompare(b, "zh-Hant"),
  );
  const periodActive = Boolean(dateFrom || dateTo);
  const periodLabel = formatDateRangeLabel(dateFrom, dateTo);
  const visibleSummary = expenses.reduce(
    (result, expense) => ({
      payable_total: result.payable_total + expense.payable_amount,
      paid_total: result.paid_total + expense.paid_amount,
      payable_now: result.payable_now + expense.unpaid_balance,
    }),
    { payable_total: 0, paid_total: 0, payable_now: 0 },
  );
  const displayedSummary = periodActive ? visibleSummary : summary;
  const unpaidExpenses = expenses.filter((expense) => expense.unpaid_balance > 0);
  const pendingInvoiceExpenses = expenses.filter(isVendorInvoiceOutstanding);
  const unpaidTotal = unpaidExpenses.reduce((total, expense) => total + expense.unpaid_balance, 0);
  const pendingInvoiceTotal = pendingInvoiceExpenses.reduce(
    (total, expense) => total + expense.payable_amount,
    0,
  );

  return (
    <>
      <BookkeepingNav />
      <p className="admin-note bk-no-print">
        <Link href="/admin/bookkeeping/vendors">← 返回廠商列表</Link>
      </p>

      <div className="bk-detail-head">
        <div>
          <h2 className="bk-detail-title">{vendor.name}</h2>
          <p className="admin-note">
            {vendor.trade || "—"} · {vendor.phone || "—"} · {vendor.contact_name || "—"}
          </p>
        </div>
        <div className="bk-detail-head-actions bk-no-print">
          <button
            className="admin-button bk-vendor-payment-trigger"
            type="button"
            disabled={paymentLoadingKey !== null || summary.payable_now <= 0}
            onClick={(event) => void openPaymentModal(undefined, event.currentTarget)}
          >
            {paymentLoadingKey === "all"
              ? "載入中…"
              : summary.payable_now > 0
                ? "登記付款"
                : "已全部結清"}
          </button>
          <BookkeepingExportBar
            onExportCsv={() =>
              exportVendorDetailCsv({
                vendorName: vendor.name,
                trade: vendor.trade ?? "",
                summary: displayedSummary,
                groups,
                expenses,
                period: periodActive ? periodLabel : undefined,
              })
            }
          />
          <button className="admin-button secondary" type="button" onClick={() => setEditOpen(true)}>
            編輯廠商
          </button>
          <button
            className="admin-button danger"
            type="button"
            disabled={deletingVendor || summary.project_count > 0}
            title={summary.project_count > 0 ? "此廠商已有支出紀錄，無法刪除" : undefined}
            onClick={() => void deleteVendor(vendor, summary.project_count === 0)}
          >
            {deletingVendor ? "刪除中…" : "刪除廠商"}
          </button>
        </div>
      </div>

      <div className="bk-print-area">

      {periodActive ? (
        <p className="bk-report-period">
          支出期間 <strong>{periodLabel}</strong>
        </p>
      ) : null}

      <div className="bk-summary-grid bk-summary-grid-compact">
        <SummaryCard
          label={periodActive ? "期間應付" : "總應付"}
          value={formatCurrency(displayedSummary.payable_total)}
        />
        <SummaryCard
          label={periodActive ? "期間已付" : "總已付"}
          value={formatCurrency(displayedSummary.paid_total)}
        />
        <SummaryCard
          label={periodActive ? "期間未付" : "目前應付款"}
          value={formatCurrency(displayedSummary.payable_now)}
          highlight
          overpaid={displayedSummary.payable_now < 0}
        />
      </div>

      <div className="admin-toolbar bk-toolbar bk-no-print">
        <select value={projectId} onChange={(event) => setProjectId(event.target.value)}>
          <option value="">全部案件</option>
          {projectOptions.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
        <select value={trade} onChange={(event) => setTrade(event.target.value)}>
          <option value="">全部工種</option>
          {tradeOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">全部狀態</option>
          {BK_PAYMENT_STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <div className="bk-period-filter" role="group" aria-label="顯示期間">
          <span className="bk-period-filter-label">期間</span>
          <BkDateInput
            value={dateFrom}
            aria-label="開始日期"
            placeholder="開始日期"
            onChange={(value) => {
              setDateFrom(value);
              if (value && dateTo && value > dateTo) setDateTo(value);
            }}
          />
          <span className="bk-period-filter-separator">至</span>
          <BkDateInput
            value={dateTo}
            aria-label="結束日期"
            placeholder="結束日期"
            onChange={(value) => {
              setDateTo(value);
              if (value && dateFrom && value < dateFrom) setDateFrom(value);
            }}
          />
          {periodActive ? (
            <button
              className="bk-period-filter-clear"
              type="button"
              onClick={() => {
                setDateFrom("");
                setDateTo("");
              }}
            >
              清除
            </button>
          ) : null}
        </div>
      </div>

      {statusMessage ? <p className="admin-inline-status">{statusMessage}</p> : null}
      {error ? <p className="admin-inline-status is-error">{error}</p> : null}

      <div className="bk-vendor-worklists bk-no-print">
        <details className="bk-vendor-worklist">
          <summary>
            <span className="bk-vendor-worklist-heading">
              <strong>尚未付款</strong>
              <small>{unpaidExpenses.length} 筆待處理</small>
            </span>
            <span className="bk-vendor-worklist-total">
              <small>未付金額</small>
              <strong>{formatCurrency(unpaidTotal)}</strong>
            </span>
          </summary>
          <div className="bk-vendor-worklist-body">
            {unpaidExpenses.length ? (
              <div className="admin-table-wrap bk-table-wrap">
                <table className="admin-table bk-table bk-vendor-worklist-table">
                  <thead>
                    <tr>
                      <th>日期</th>
                      <th>案名</th>
                      <th>工種</th>
                      <th>應付</th>
                      <th>已付</th>
                      <th>尚未付款</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unpaidExpenses.map((expense) => (
                      <tr key={expense.id}>
                        <td>{formatDateTW(expense.expense_date)}</td>
                        <td>
                          <Link className="bk-link" href={`/admin/bookkeeping/projects/${expense.project_id}`}>
                            {expense.project_name || "—"}
                          </Link>
                        </td>
                        <td>{expense.trade}</td>
                        <td>{formatCurrency(expense.payable_amount)}</td>
                        <td>{formatCurrency(expense.paid_amount)}</td>
                        <td className="bk-vendor-worklist-emphasis">
                          {formatCurrency(expense.unpaid_balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="admin-note">目前沒有尚未付款的支出。</p>
            )}
          </div>
        </details>

        <details className="bk-vendor-worklist">
          <summary>
            <span className="bk-vendor-worklist-heading">
              <strong>尚未開發票</strong>
              <small>{pendingInvoiceExpenses.length} 筆待處理</small>
            </span>
            <span className="bk-vendor-worklist-total">
              <small>待開金額</small>
              <strong>{formatCurrency(pendingInvoiceTotal)}</strong>
            </span>
          </summary>
          <div className="bk-vendor-worklist-body">
            {pendingInvoiceExpenses.length ? (
              <div className="admin-table-wrap bk-table-wrap">
                <table className="admin-table bk-table bk-vendor-worklist-table">
                  <thead>
                    <tr>
                      <th>日期</th>
                      <th>案名</th>
                      <th>工種</th>
                      <th>應付</th>
                      <th>發票狀態</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingInvoiceExpenses.map((expense) => (
                      <tr key={expense.id}>
                        <td>{formatDateTW(expense.expense_date)}</td>
                        <td>
                          <Link className="bk-link" href={`/admin/bookkeeping/projects/${expense.project_id}`}>
                            {expense.project_name || "—"}
                          </Link>
                        </td>
                        <td>{expense.trade}</td>
                        <td>{formatCurrency(expense.payable_amount)}</td>
                        <td>
                          <span className="bk-vendor-invoice-pending">未開立</span>
                        </td>
                        <td>
                          <button
                            className="admin-button secondary small"
                            type="button"
                            onClick={() => focusInvoiceExpense(expense)}
                          >
                            登記發票
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="admin-note">目前沒有尚未開立的應稅發票。</p>
            )}
          </div>
        </details>
      </div>

      <section className="bk-section">
        <h3>依案件彙總</h3>
        <div className="admin-table-wrap bk-table-wrap">
          <table className="admin-table bk-table bk-vendor-groups-table">
            <thead>
              <tr>
                <th>案名</th>
                <th>工種</th>
                <th>累計應付</th>
                <th>累計已付</th>
                <th>目前未付</th>
                <th>付款階段</th>
                <th>付款明細</th>
                <th>狀態</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => {
                const groupKey = `${group.project_id}-${group.trade}`;
                const groupIsLoading = paymentLoadingKey === groupKey;

                return (
                  <tr key={groupKey}>
                    <td data-label="案名">
                      <Link className="bk-link" href={`/admin/bookkeeping/projects/${group.project_id}`}>
                        {group.project_name}
                      </Link>
                    </td>
                    <td data-label="工種">{group.trade}</td>
                    <td data-label="累計應付">{formatCurrency(group.payable_total)}</td>
                    <td data-label="累計已付">{formatCurrency(group.paid_total)}</td>
                    <td data-label="目前未付">{formatCurrency(group.unpaid_balance)}</td>
                    <td data-label="付款階段">{group.payment_stage || "—"}</td>
                    <td className="bk-group-payments-cell" data-label="付款明細">
                      {group.payment_lines.length === 0 ? (
                        "—"
                      ) : (
                        <ul className="bk-group-payments-list">
                          {group.payment_lines.map((line, index) => (
                            <li key={`${line.paid_date}-${line.amount}-${index}`}>
                              {formatDateTW(line.paid_date)} · {formatCurrency(line.amount)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="bk-group-status-cell" data-label="狀態與操作">
                      {group.unpaid_balance > 0 ? (
                        <button
                          className={`bk-status bk-status-${group.payment_status} bk-group-payment-status-button`}
                          type="button"
                          disabled={paymentLoadingKey !== null}
                          aria-label={`為「${group.project_name}」${group.trade}登記付款`}
                          onClick={(event) =>
                            void openPaymentModal(
                              {
                                key: groupKey,
                                projectId: group.project_id,
                                trade: group.trade,
                                label: group.project_name,
                              },
                              event.currentTarget,
                            )
                          }
                        >
                          {groupIsLoading ? (
                            "載入中…"
                          ) : (
                            <>
                              <span>{group.payment_status}</span>
                              <span className="bk-group-payment-action-label">
                                {group.payment_status === "部分付款" ? "繼續付款" : "登記付款"}
                              </span>
                            </>
                          )}
                        </button>
                      ) : (
                        <BkStatusBadge status={group.payment_status} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!groups.length ? <p className="admin-note">沒有符合條件的彙總資料。</p> : null}
        </div>
      </section>

      <section className="bk-section">
        <h3>支出明細</h3>
        <div className="admin-table-wrap bk-table-wrap">
          <table className="admin-table bk-table bk-vendor-expenses-table">
            <thead>
              <tr>
                <th>日期</th>
                <th>案名</th>
                <th>工種</th>
                <th>事由</th>
                <th>應付</th>
                <th>已付</th>
                <th>未付</th>
                <th>稅別</th>
                <th>發票資料</th>
                <th>狀態</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => {
                const invoicePrint = vendorInvoicePrintFields(expense);
                const editingInvoice = invoiceEditId === expense.id;
                const invoiceSaving = invoiceSavingId === expense.id;

                return (
                  <tr id={`vendor-expense-${expense.id}`} key={expense.id}>
                    <td>{formatDateTW(expense.expense_date)}</td>
                    <td>
                      <Link className="bk-link" href={`/admin/bookkeeping/projects/${expense.project_id}`}>
                        {expense.project_name || "—"}
                      </Link>
                    </td>
                    <td>{expense.trade}</td>
                    <td>{expense.description || "—"}</td>
                    <td>{formatCurrency(expense.payable_amount)}</td>
                    <td>{formatCurrency(expense.paid_amount)}</td>
                    <td>{formatCurrency(expense.unpaid_balance)}</td>
                    <td>{expense.vendor_tax_mode}</td>
                    <td className="bk-vendor-invoice-cell">
                      <div className="bk-screen-only">
                        {expense.vendor_tax_mode === "免稅" ? (
                          <span>免稅</span>
                        ) : editingInvoice ? (
                          <form
                            className="bk-vendor-invoice-form"
                            onSubmit={(event) => {
                              event.preventDefault();
                              void saveInvoice(expense);
                            }}
                          >
                            <label>
                              <span>發票號碼</span>
                              <input
                                autoFocus
                                value={invoiceDraft.invoiceNo}
                                placeholder="例 AB12345678"
                                disabled={invoiceSaving}
                                onChange={(event) =>
                                  setInvoiceDraft((current) => ({
                                    ...current,
                                    invoiceNo: event.target.value,
                                  }))
                                }
                              />
                            </label>
                            <label>
                              <span>發票金額</span>
                              <input
                                type="number"
                                min={1}
                                inputMode="numeric"
                                value={invoiceDraft.invoiceAmount}
                                placeholder="輸入金額"
                                disabled={invoiceSaving}
                                onChange={(event) =>
                                  setInvoiceDraft((current) => ({
                                    ...current,
                                    invoiceAmount: event.target.value,
                                  }))
                                }
                              />
                            </label>
                            <div className="bk-vendor-invoice-actions">
                              <button className="admin-button small" type="submit" disabled={invoiceSaving}>
                                {invoiceSaving ? "儲存中…" : "儲存"}
                              </button>
                              <button
                                className="admin-button secondary small"
                                type="button"
                                disabled={invoiceSaving}
                                onClick={() => setInvoiceEditId(null)}
                              >
                                取消
                              </button>
                              {expense.vendor_invoice_status === "已收到" ? (
                                <button
                                  className="bk-vendor-invoice-clear"
                                  type="button"
                                  disabled={invoiceSaving}
                                  onClick={() => {
                                    setInvoiceDraft({ invoiceNo: "", invoiceAmount: "" });
                                    void saveInvoice(expense, { invoiceNo: "", invoiceAmount: "" });
                                  }}
                                >
                                  改回未開立
                                </button>
                              ) : null}
                            </div>
                          </form>
                        ) : (
                          <div className="bk-vendor-invoice-display">
                            <span className={isVendorInvoiceOutstanding(expense) ? "is-pending" : "is-issued"}>
                              {vendorInvoiceSummary(expense) === "已開" ? "已開立" : "未開立"}
                            </span>
                            {expense.vendor_invoice_status === "已收到" ? (
                              <span>{expense.invoice_no || "號碼未填"}</span>
                            ) : null}
                            {expense.vendor_invoice_status === "已收到" ? (
                              <span>
                                {expense.invoice_amount == null
                                  ? "金額未填"
                                  : formatCurrency(expense.invoice_amount)}
                              </span>
                            ) : null}
                            <button
                              className="bk-vendor-invoice-edit"
                              type="button"
                              onClick={() => beginInvoiceEdit(expense)}
                            >
                              {expense.vendor_invoice_status === "已收到" ? "編輯" : "登記"}
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="bk-print-only">
                        {invoicePrint.status === "" ? (
                          <span className="bk-print-invoice-blank">&nbsp;</span>
                        ) : invoicePrint.status === "免稅" ? (
                          "免稅"
                        ) : (
                          <span className="bk-print-invoice-record">
                            {invoicePrint.invoiceNo ? <span>{invoicePrint.invoiceNo}</span> : null}
                            {invoicePrint.invoiceAmount != null ? (
                              <span>{formatCurrency(invoicePrint.invoiceAmount)}</span>
                            ) : null}
                            {!invoicePrint.invoiceNo && invoicePrint.invoiceAmount == null ? "已開立" : null}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <BkStatusBadge status={expense.payment_status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!expenses.length ? <p className="admin-note">沒有符合條件的支出明細。</p> : null}
        </div>
      </section>

      <section className="bk-section">
        <h3>付款紀錄</h3>
        <div className="bk-payment-history">
          {expenses.some((expense) => expense.payments.length) ? (
            <ul>
              {expenses.flatMap((expense) =>
                expense.payments.map((payment) => (
                  <li key={payment.id}>
                    <span>
                      {formatDateTW(payment.paid_date)} · {expense.project_name} · {expense.trade} ·{" "}
                      {formatCurrency(payment.amount)} · {payment.payment_method}
                    </span>
                  </li>
                )),
              )}
            </ul>
          ) : (
            <p className="admin-note">尚無付款紀錄。</p>
          )}
        </div>
      </section>
      </div>

      {editOpen
        ? createPortal(
            <VendorEditModal
              vendor={vendor}
              suggestions={suggestions}
              onClose={() => setEditOpen(false)}
              onSaved={async () => {
                setEditOpen(false);
                await loadDetail();
              }}
              onError={setError}
            />,
            document.body,
          )
        : null}
      {paymentOpen
        ? createPortal(
            <VendorPaymentModal
              vendorName={paymentScopeLabel || vendor.name}
              expenses={paymentExpenses}
              onClose={closePaymentModal}
              onSaved={async () => {
                closePaymentModal();
                setStatusMessage("付款已登記");
                await loadDetail();
              }}
            />,
            document.body,
          )
        : null}
    </>
  );
}

function VendorEditModal({
  vendor,
  suggestions,
  onClose,
  onSaved,
  onError,
}: {
  vendor: BkVendor;
  suggestions: SuggestionsResponse;
  onClose: () => void;
  onSaved: () => Promise<void>;
  onError: (message: string | null) => void;
}) {
  const [draft, setDraft] = useState({
    name: vendor.name,
    trade: vendor.trade ?? "",
    contact_name: vendor.contact_name ?? "",
    phone: vendor.phone ?? "",
    tax_id: vendor.tax_id ?? "",
    bank_info: vendor.bank_info ?? "",
    note: vendor.note ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  async function save() {
    onError(null);
    setModalError(null);
    setSaving(true);
    try {
      await bkFetch(`/api/bookkeeping/vendors/${vendor.id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...draft,
          trade: draft.trade || null,
          contact_name: draft.contact_name || null,
          phone: draft.phone || null,
          tax_id: draft.tax_id || null,
          bank_info: draft.bank_info || null,
          note: draft.note || null,
        }),
      });
      await onSaved();
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "儲存失敗";
      setModalError(message);
      onError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal admin-form-wide" onClick={(event) => event.stopPropagation()}>
        <h2>編輯廠商</h2>
        <div className="admin-form admin-form-wide">
          <BkTypeaheadInput
            label="廠商名稱"
            value={draft.name}
            suggestions={suggestions.vendors}
            onChange={(name) => setDraft({ ...draft, name })}
          />
          <BkTypeaheadInput
            label="主要工種"
            value={draft.trade}
            suggestions={suggestions.trades}
            onChange={(trade) => setDraft({ ...draft, trade })}
          />
          <label>
            聯絡人
            <input
              value={draft.contact_name}
              onChange={(event) => setDraft({ ...draft, contact_name: event.target.value })}
            />
          </label>
          <label>
            電話
            <input value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} />
          </label>
          <label>
            統編
            <input value={draft.tax_id} onChange={(event) => setDraft({ ...draft, tax_id: event.target.value })} />
          </label>
          <label>
            匯款資訊
            <input
              value={draft.bank_info}
              onChange={(event) => setDraft({ ...draft, bank_info: event.target.value })}
            />
          </label>
          <label>
            備註
            <textarea rows={2} value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} />
          </label>
        </div>
        {modalError ? (
          <p className="admin-inline-status is-error" role="alert">
            {modalError}
          </p>
        ) : null}
        <div className="admin-modal-actions">
          <button className="admin-button" type="button" disabled={saving} onClick={() => void save()}>
            {saving ? "儲存中…" : "儲存"}
          </button>
          <button className="admin-button secondary" type="button" disabled={saving} onClick={onClose}>
            取消
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  highlight = false,
  overpaid = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  overpaid?: boolean;
}) {
  return (
    <article
      className={`bk-summary-card${highlight ? " is-highlight" : ""}${overpaid ? " is-overpaid" : ""}`}
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
