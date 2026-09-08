"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import {
  BookkeepingDatalists,
  ExpenseDraftRow,
} from "@/components/admin/bookkeeping/BookkeepingInlineRows";
import { BookkeepingIncomeSections } from "@/components/admin/bookkeeping/BookkeepingIncomeSections";
import { BookkeepingVendorPanel } from "@/components/admin/bookkeeping/BookkeepingVendorPanel";
import { BookkeepingExportBar } from "@/components/admin/bookkeeping/BookkeepingExportBar";
import {
  computeDraftSummary,
  expenseToDraft,
  incomeToDraft,
  newExpenseDraft,
  newIncomeDraft,
  persistExpenseDrafts,
  persistIncomeDrafts,
  submitExpenseDraftPayment,
  updateExpenseDraftPayment,
  vendorExpenseSummary,
  type ExpenseDraft,
  type IncomeDraft,
} from "@/components/admin/bookkeeping/bookkeeping-draft";
import { BookkeepingNav, BkStatusBadge, bkFetch } from "@/components/admin/bookkeeping/BookkeepingNav";
import { exportLedgerCsv } from "@/lib/bookkeeping/csv-export";
import { formatCurrency, todayISODate } from "@/lib/bookkeeping/format";
import { deriveDesignInvoiceNo, deriveDesignInvoiceTaxMode, deriveProjectInvoiceNo, deriveProjectInvoiceTaxMode } from "@/lib/bookkeeping/income-tax";
import { vendorsForTrade, type VendorTradeSuggestion } from "@/lib/bookkeeping/suggestions";
import { BK_PROJECT_STATUSES } from "@/lib/bookkeeping/types";
import type {
  BkExpenseWithPayments,
  BkIncomeCategory,
  BkInvoiceTaxMode,
  BkProject,
  BkProjectIncome,
  BkProjectStatus,
  BkProjectSummary,
} from "@/lib/bookkeeping/types";

type SuggestionsResponse = {
  vendors: string[];
  trades: string[];
  vendorTrades?: VendorTradeSuggestion[];
};

type ProjectDetailResponse = {
  project: BkProject;
  summary: BkProjectSummary;
  incomes: BkProjectIncome[];
  expenses: BkExpenseWithPayments[];
};

type HeaderDraft = {
  name: string;
  client_name: string;
  client_tax_id: string;
  client_invoice_tax_mode: BkInvoiceTaxMode;
  client_invoice_no: string;
  design_invoice_tax_mode: BkInvoiceTaxMode;
  design_invoice_no: string;
  client_phone: string;
  address: string;
  design_fee_amount: number;
  prepayment_amount: number;
  contract_amount: number;
  status: BkProjectStatus;
  note: string;
};

type SheetView = "internal" | "customer" | "vendor";

const emptyHeader = (): HeaderDraft => ({
  name: "",
  client_name: "",
  client_tax_id: "",
  client_invoice_tax_mode: "不開",
  client_invoice_no: "",
  design_invoice_tax_mode: "不開",
  design_invoice_no: "",
  client_phone: "",
  address: "",
  design_fee_amount: 0,
  prepayment_amount: 0,
  contract_amount: 0,
  status: "進行中",
  note: "",
});

export function BookkeepingLedgerSheet({ projectId }: { projectId?: string }) {
  const isNew = !projectId;
  const vendorListId = useId();
  const tradeListId = useId();

  const [header, setHeader] = useState<HeaderDraft>(emptyHeader);
  const [savedProjectId, setSavedProjectId] = useState<string | null>(projectId ?? null);
  const [detail, setDetail] = useState<ProjectDetailResponse | null>(isNew ? null : null);
  const [incomeRows, setIncomeRows] = useState<IncomeDraft[]>([]);
  const [expenseRows, setExpenseRows] = useState<ExpenseDraft[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionsResponse>({ vendors: [], trades: [] });
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [paymentSubmittingKey, setPaymentSubmittingKey] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sheetView, setSheetView] = useState<SheetView>("internal");
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);

  const activeProjectId = savedProjectId;

  const loadDetail = useCallback(async (overrideProjectId?: string) => {
    const targetId = overrideProjectId ?? activeProjectId;
    if (!targetId) return;
    setError(null);
    try {
      const [projectPayload, suggestionPayload] = await Promise.all([
        bkFetch<ProjectDetailResponse>(`/api/bookkeeping/projects/${targetId}`),
        bkFetch<SuggestionsResponse>("/api/bookkeeping/suggestions"),
      ]);
      setDetail(projectPayload);
      setHeader({
        name: projectPayload.project.name,
        client_name: projectPayload.project.client_name ?? "",
        client_tax_id: projectPayload.project.client_tax_id ?? "",
        client_invoice_tax_mode: deriveProjectInvoiceTaxMode(projectPayload.project),
        client_invoice_no: deriveProjectInvoiceNo(projectPayload.project, projectPayload.incomes),
        design_invoice_tax_mode: deriveDesignInvoiceTaxMode(projectPayload.project),
        design_invoice_no: deriveDesignInvoiceNo(projectPayload.project, projectPayload.incomes),
        client_phone: projectPayload.project.client_phone ?? "",
        address: projectPayload.project.address ?? "",
        design_fee_amount: projectPayload.project.design_fee_amount ?? 0,
        prepayment_amount: projectPayload.project.prepayment_amount ?? 0,
        contract_amount: projectPayload.project.contract_amount,
        status: projectPayload.project.status,
        note: projectPayload.project.note ?? "",
      });
      setSuggestions(suggestionPayload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "載入失敗");
    }
  }, [activeProjectId]);

  useEffect(() => {
    if (isNew && !activeProjectId) {
      void bkFetch<SuggestionsResponse>("/api/bookkeeping/suggestions").then(setSuggestions).catch(() => {});
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- admin detail fetch
    void loadDetail();
  }, [isNew, activeProjectId, loadDetail]);

  useEffect(() => {
    if (!detail) {
      if (isNew && !activeProjectId) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- reset drafts for new sheet
        setIncomeRows([]);
        setExpenseRows([]);
      }
      return;
    }
    setIncomeRows(detail.incomes.map(incomeToDraft));
    setExpenseRows(detail.expenses.map(expenseToDraft));
  }, [detail, isNew, activeProjectId]);

  async function createProject(): Promise<string | null> {
    if (!header.name.trim()) {
      setError("請先填寫案名");
      return null;
    }
    const result = await bkFetch<{ project: BkProject }>("/api/bookkeeping/projects", {
      method: "POST",
      body: JSON.stringify({
        name: header.name.trim(),
          client_name: header.client_name || null,
          client_tax_id: header.client_tax_id || null,
          client_invoice_tax_mode: header.client_invoice_tax_mode,
          client_invoice_no: header.client_invoice_no || null,
          design_invoice_tax_mode: header.design_invoice_tax_mode,
          design_invoice_no: header.design_invoice_no || null,
          client_phone: header.client_phone || null,
        address: header.address || null,
        design_fee_amount: 0,
        prepayment_amount: 0,
        contract_amount: 0,
        status: header.status,
        note: header.note || null,
      }),
    });
    const id = result.project.id;
    setSavedProjectId(id);
    window.history.replaceState(null, "", `/admin/bookkeeping/projects/${id}`);
    return id;
  }

  async function saveProjectHeader(projectId: string, amountOverrides?: {
    design_fee_amount: number;
    prepayment_amount: number;
    contract_amount: number;
  }) {
    await bkFetch(`/api/bookkeeping/projects/${projectId}`, {
      method: "PUT",
      body: JSON.stringify({
        name: header.name.trim(),
          client_name: header.client_name || null,
          client_tax_id: header.client_tax_id || null,
          client_invoice_tax_mode: header.client_invoice_tax_mode,
          client_invoice_no: header.client_invoice_no || null,
          design_invoice_tax_mode: header.design_invoice_tax_mode,
          design_invoice_no: header.design_invoice_no || null,
          client_phone: header.client_phone || null,
        address: header.address || null,
        design_fee_amount: amountOverrides?.design_fee_amount ?? header.design_fee_amount,
        prepayment_amount: amountOverrides?.prepayment_amount ?? header.prepayment_amount,
        contract_amount: amountOverrides?.contract_amount ?? header.contract_amount,
        status: header.status,
        note: header.note || null,
      }),
    });
  }

  async function saveAll() {
    setSaving(true);
    setError(null);
    setStatusMessage(null);
    try {
      const wasNew = !activeProjectId;
      let projectId = activeProjectId;
      const draftSummary = computeDraftSummary(
        {
          design: header.design_invoice_tax_mode,
          construction: header.client_invoice_tax_mode,
        },
        incomeRows,
        expenseRows,
      );
      const syncedAmounts = {
        design_fee_amount: draftSummary.design_income_total,
        prepayment_amount: draftSummary.prepayment_income_total,
        contract_amount: draftSummary.construction_income_total,
      };

      if (!projectId) {
        projectId = await createProject();
        if (!projectId) return;
      }

      await persistIncomeDrafts(projectId, incomeRows, {
        design: {
          taxMode: header.design_invoice_tax_mode,
          invoiceNo: header.design_invoice_no,
        },
        construction: {
          taxMode: header.client_invoice_tax_mode,
          invoiceNo: header.client_invoice_no,
        },
      });
      await persistExpenseDrafts(projectId, expenseRows);
      await saveProjectHeader(projectId, syncedAmounts);

      setStatusMessage(wasNew ? "已建立並儲存案件" : "已儲存全部紀錄");
      await loadDetail(projectId);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "儲存失敗");
    } finally {
      setSaving(false);
    }
  }

  function addIncomeRow(category: BkIncomeCategory = "工程款") {
    setIncomeRows((rows) => [...rows, newIncomeDraft(category)]);
  }

  function updateIncomeRow(key: string, patch: Partial<IncomeDraft>) {
    setIncomeRows((rows) => rows.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function removeIncomeRow(row: IncomeDraft) {
    if (row.id) {
      setIncomeRows((rows) =>
        rows.map((item) => (item.key === row.key ? { ...item, markedDelete: true } : item)),
      );
      return;
    }
    setIncomeRows((rows) => rows.filter((item) => item.key !== row.key));
  }

  function addExpenseRow() {
    setExpenseRows((rows) => [...rows, newExpenseDraft()]);
  }

  function updateExpenseRow(key: string, patch: Partial<ExpenseDraft>) {
    setExpenseRows((rows) => rows.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function removeExpenseRow(row: ExpenseDraft) {
    if (row.id) {
      setExpenseRows((rows) =>
        rows.map((item) => (item.key === row.key ? { ...item, markedDelete: true } : item)),
      );
      return;
    }
    setExpenseRows((rows) => rows.filter((item) => item.key !== row.key));
  }

  async function submitExpensePayment(row: ExpenseDraft) {
    if (!activeProjectId) {
      setError("請先儲存案件後再新增付款");
      return;
    }

    setPaymentSubmittingKey(row.key);
    setError(null);
    try {
      const result = await submitExpenseDraftPayment(activeProjectId, row);
      updateExpenseRow(row.key, {
        id: result.expenseId,
        payments: [...row.payments, result.payment],
        paid_amount: result.paid_amount,
        payment_amount: "",
        payment_date: todayISODate(),
      });
      setStatusMessage("已新增付款");
    } catch (err) {
      setError(err instanceof Error ? err.message : "新增付款失敗");
    } finally {
      setPaymentSubmittingKey(null);
    }
  }

  async function updateExpensePayment(
    row: ExpenseDraft,
    paymentId: string,
    input: { paid_date: string; amount: number },
  ) {
    setPaymentSubmittingKey(row.key);
    setError(null);
    try {
      const result = await updateExpenseDraftPayment(row, paymentId, input);
      updateExpenseRow(row.key, {
        payments: row.payments.map((payment) =>
          payment.id === paymentId ? result.payment : payment,
        ),
        paid_amount: result.paid_amount,
      });
      setStatusMessage("已更新付款");
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新付款失敗");
    } finally {
      setPaymentSubmittingKey(null);
    }
  }

  function openVendorDetail(vendorName: string) {
    setSelectedVendor(vendorName);
    setSheetView("vendor");
  }

  function addVendorExpense() {
    if (!selectedVendor) return;
    setExpenseRows((rows) => [...rows, { ...newExpenseDraft(), vendor_name: selectedVendor }]);
  }

  if (!isNew && activeProjectId && !detail && !error) {
    return (
      <>
        <BookkeepingNav />
        <p className="admin-note">載入中…</p>
      </>
    );
  }

  const summary = computeDraftSummary(
    {
      design: header.design_invoice_tax_mode,
      construction: header.client_invoice_tax_mode,
    },
    incomeRows,
    expenseRows,
  );
  const visibleExpenseRows = expenseRows.filter((row) => !row.markedDelete);
  const vendorDetail = selectedVendor ? vendorExpenseSummary(expenseRows, selectedVendor) : null;
  const projectStatus = detail?.project.status ?? header.status;
  const viewLabel =
    sheetView === "customer"
      ? "客戶收款表"
      : sheetView === "vendor" && selectedVendor
        ? `廠商：${selectedVendor}`
        : "記帳";

  function handleExportCsv() {
    exportLedgerCsv({
      header: {
        name: header.name,
        client_name: header.client_name,
        client_tax_id: header.client_tax_id,
        client_phone: header.client_phone,
        address: header.address,
        status: projectStatus,
      },
      incomeRows,
      expenseRows,
      summary,
      viewLabel,
    });
  }

  return (
    <>
      <BookkeepingNav />
      <p className="admin-note bk-no-print">
        <Link href="/admin/bookkeeping">← 返回案件列表</Link>
      </p>

      <div className="bk-ledger-toolbar">
        <h2 className="bk-ledger-title">收入／支出紀錄</h2>
        <div className="bk-ledger-toolbar-actions bk-no-print">
          <BookkeepingExportBar onExportCsv={handleExportCsv} />
          {activeProjectId ? <BkStatusBadge status={projectStatus} /> : null}
          <button className="admin-button" type="button" disabled={saving} onClick={() => void saveAll()}>
            {saving ? "儲存中…" : "儲存全部"}
          </button>
          {activeProjectId ? (
            <button className="admin-button secondary" type="button" onClick={() => setSettingsOpen(true)}>
              案件設定
            </button>
          ) : null}
        </div>
      </div>

      {statusMessage ? <p className="admin-inline-status">{statusMessage}</p> : null}
      {error ? <p className="admin-inline-status is-error">{error}</p> : null}

      <div className="bk-ledger-view-tabs bk-no-print">
        <button
          className={`bk-ledger-view-tab${sheetView === "internal" ? " is-active" : ""}`}
          type="button"
          onClick={() => {
            setSheetView("internal");
            setSelectedVendor(null);
          }}
        >
          記帳
        </button>
        <button
          className={`bk-ledger-view-tab${sheetView === "customer" ? " is-active" : ""}`}
          type="button"
          onClick={() => {
            setSheetView("customer");
            setSelectedVendor(null);
          }}
        >
          客戶收款表
        </button>
        {sheetView === "vendor" && selectedVendor ? (
          <span className="bk-ledger-view-current">廠商：{selectedVendor}</span>
        ) : null}
      </div>

      <div className="bk-print-area">
      <div
        className={`bk-ledger-sheet${sheetView === "customer" ? " bk-ledger-sheet-customer" : ""}${sheetView === "vendor" ? " bk-ledger-sheet-vendor" : ""}`}
      >
        <header className="bk-ledger-header">
          <div className="bk-ledger-header-group">
            <div className="bk-ledger-header-cell">
              <span className="bk-ledger-label">案名</span>
              <input
                className="bk-ledger-input"
                value={header.name}
                placeholder="請輸入案名"
                onChange={(event) => setHeader({ ...header, name: event.target.value })}
              />
            </div>
            <div className="bk-ledger-header-cell">
              <span className="bk-ledger-label">客戶姓名</span>
              <input
                className="bk-ledger-input"
                value={header.client_name}
                onChange={(event) => setHeader({ ...header, client_name: event.target.value })}
              />
            </div>
            <div className="bk-ledger-header-cell">
              <span className="bk-ledger-label">統編</span>
              <input
                className="bk-ledger-input"
                value={header.client_tax_id}
                placeholder="8 碼"
                onChange={(event) => setHeader({ ...header, client_tax_id: event.target.value })}
              />
            </div>
          </div>
          <div className="bk-ledger-header-group">
            <div className="bk-ledger-header-cell">
              <span className="bk-ledger-label">連絡電話</span>
              <input
                className="bk-ledger-input"
                value={header.client_phone}
                onChange={(event) => setHeader({ ...header, client_phone: event.target.value })}
              />
            </div>
            <div className="bk-ledger-header-cell">
              <span className="bk-ledger-label">工地地址</span>
              <input
                className="bk-ledger-input"
                value={header.address}
                onChange={(event) => setHeader({ ...header, address: event.target.value })}
              />
            </div>
          </div>
        </header>

        <div className="bk-ledger-body">
          {sheetView === "vendor" && selectedVendor && vendorDetail ? (
            <div className="bk-ledger-pane bk-ledger-pane-full">
              <BookkeepingVendorPanel
                vendorName={selectedVendor}
                rows={vendorDetail.rows}
                payable={vendorDetail.payable}
                paid={vendorDetail.paid}
                unpaid={vendorDetail.unpaid}
                vendorListId={vendorListId}
                tradeListId={tradeListId}
                onBack={() => {
                  setSheetView("internal");
                  setSelectedVendor(null);
                }}
                onAddExpense={addVendorExpense}
                onUpdateExpense={updateExpenseRow}
                onRemoveExpense={removeExpenseRow}
                onSubmitPayment={submitExpensePayment}
                onUpdatePayment={updateExpensePayment}
                paymentSubmittingKey={paymentSubmittingKey}
              />
            </div>
          ) : sheetView === "customer" ? (
            <div className="bk-ledger-pane bk-ledger-pane-left bk-ledger-pane-full bk-ledger-pane-customer">
              <BookkeepingIncomeSections
                rows={incomeRows}
                designInvoiceTaxMode={header.design_invoice_tax_mode}
                designInvoiceNo={header.design_invoice_no}
                constructionInvoiceTaxMode={header.client_invoice_tax_mode}
                constructionInvoiceNo={header.client_invoice_no}
                designTotal={summary.design_income_total}
                prepaymentTotal={summary.prepayment_income_total}
                constructionTotal={summary.construction_income_total}
                onDesignInvoiceTaxModeChange={(mode) =>
                  setHeader({ ...header, design_invoice_tax_mode: mode })
                }
                onDesignInvoiceNoChange={(value) =>
                  setHeader({ ...header, design_invoice_no: value })
                }
                onConstructionInvoiceTaxModeChange={(mode) =>
                  setHeader({ ...header, client_invoice_tax_mode: mode })
                }
                onConstructionInvoiceNoChange={(value) =>
                  setHeader({ ...header, client_invoice_no: value })
                }
                onAddIncome={addIncomeRow}
                onUpdateIncome={updateIncomeRow}
                onRemoveIncome={removeIncomeRow}
              />
              <div className="bk-ledger-subfoot bk-ledger-subfoot-customer">
                <div className="bk-ledger-subtotal">
                  <span>設計費合計</span>
                  <strong className="bk-ledger-amount">
                    {formatCurrency(summary.design_income_total)}
                  </strong>
                </div>
                <div className="bk-ledger-subtotal">
                  <span>工程款合計</span>
                  <strong className="bk-ledger-amount">
                    {formatCurrency(summary.construction_income_total)}
                  </strong>
                </div>
                <div className="bk-ledger-subtotal">
                  <span>收款合計</span>
                  <strong className="bk-ledger-amount">
                    {formatCurrency(summary.client_contract_total)}
                  </strong>
                </div>
                {summary.prepayment_income_total > 0 ? (
                  <div className="bk-ledger-subtotal bk-ledger-subtotal-muted">
                    <span>預收折抵</span>
                    <strong className="bk-ledger-amount bk-ledger-amount-negative">
                      −{formatCurrency(summary.prepayment_income_total)}
                    </strong>
                  </div>
                ) : null}
                <div className="bk-ledger-subtotal bk-ledger-subtotal-highlight">
                  <span>合計收入</span>
                  <strong className="bk-ledger-amount">
                    {formatCurrency(summary.client_net_receipt)}
                  </strong>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="bk-ledger-pane bk-ledger-pane-left bk-ledger-pane-income">
                <BookkeepingIncomeSections
                  rows={incomeRows}
                  designInvoiceTaxMode={header.design_invoice_tax_mode}
                  designInvoiceNo={header.design_invoice_no}
                  constructionInvoiceTaxMode={header.client_invoice_tax_mode}
                  constructionInvoiceNo={header.client_invoice_no}
                  designTotal={summary.design_income_total}
                  prepaymentTotal={summary.prepayment_income_total}
                  constructionTotal={summary.construction_income_total}
                  onDesignInvoiceTaxModeChange={(mode) =>
                    setHeader({ ...header, design_invoice_tax_mode: mode })
                  }
                  onDesignInvoiceNoChange={(value) =>
                    setHeader({ ...header, design_invoice_no: value })
                  }
                  onConstructionInvoiceTaxModeChange={(mode) =>
                    setHeader({ ...header, client_invoice_tax_mode: mode })
                  }
                  onConstructionInvoiceNoChange={(value) =>
                    setHeader({ ...header, client_invoice_no: value })
                  }
                  onAddIncome={addIncomeRow}
                  onUpdateIncome={updateIncomeRow}
                  onRemoveIncome={removeIncomeRow}
                />
              </div>

              <div className="bk-ledger-pane bk-ledger-pane-right bk-ledger-pane-expenses">
                <div className="bk-ledger-expense-head">
                  <div className="bk-ledger-block-head">
                    <span>合計工程支出（內部）</span>
                    <strong className="bk-ledger-computed">
                      {formatCurrency(summary.expense_payable_total)}
                    </strong>
                  </div>
                </div>
                <div className="bk-ledger-expense-table">
                  <table className="bk-ledger-table bk-ledger-table-expense">
                    <colgroup>
                      <col className="bk-col-date" />
                      <col className="bk-col-trade" />
                      <col className="bk-col-vendor" />
                      <col className="bk-col-payable" />
                      <col className="bk-col-pay-history" />
                      <col className="bk-col-unpaid" />
                      <col className="bk-col-tax" />
                      <col className="bk-col-invoice" />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>日期</th>
                        <th>工種</th>
                        <th>廠商</th>
                        <th>應付(未稅)</th>
                        <th className="bk-ledger-pay-history-head">付款紀錄</th>
                        <th>未付</th>
                        <th>稅別</th>
                        <th>發票</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleExpenseRows.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="bk-ledger-empty">
                            尚無支出紀錄，可按下方「＋ 新增支出」
                          </td>
                        </tr>
                      ) : null}
                      {visibleExpenseRows.map((row) => (
                        <ExpenseDraftRow
                          key={row.key}
                          row={row}
                          vendorListId={vendorListId}
                          tradeListId={tradeListId}
                          onVendorClick={openVendorDetail}
                          onChange={(patch) => updateExpenseRow(row.key, patch)}
                          onRemove={() => removeExpenseRow(row)}
                          onSubmitPayment={submitExpensePayment}
                          onUpdatePayment={updateExpensePayment}
                          paymentSubmitting={paymentSubmittingKey === row.key}
                          vendorSuggestions={vendorsForTrade(
                            suggestions.vendorTrades ?? [],
                            row.trade,
                          )}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bk-ledger-expense-add">
                  <button className="bk-ledger-add" type="button" onClick={addExpenseRow}>
                    ＋ 新增支出
                  </button>
                </div>
                <div className="bk-ledger-expense-subfoot">
                  <div className="bk-ledger-subfoot">
                    <div className="bk-ledger-subtotal">
                      <span>已付款</span>
                      <strong className="bk-ledger-amount">
                        {formatCurrency(summary.expense_paid_total)}
                      </strong>
                    </div>
                    <div
                      className={`bk-ledger-subtotal bk-ledger-subtotal-highlight${summary.payable_now < 0 ? " bk-ledger-subtotal-overpaid" : ""}`}
                    >
                      <span>目前應付款</span>
                      <strong className="bk-ledger-amount">{formatCurrency(summary.payable_now)}</strong>
                    </div>
                  </div>
                </div>
              </div>
                </>
          )}
        </div>

        {sheetView !== "customer" ? (
          <footer className="bk-ledger-footer">
            <div className="bk-ledger-footer-cell">
              <span>合計收入</span>
              <strong>{formatCurrency(summary.income_total)}</strong>
            </div>
            <div className="bk-ledger-footer-cell">
              <span>合計支出</span>
              <strong>{formatCurrency(summary.expense_payable_total)}</strong>
            </div>
          </footer>
        ) : null}
      </div>
      </div>

      <BookkeepingDatalists
        vendorListId={vendorListId}
        tradeListId={tradeListId}
        vendors={suggestions.vendors}
        trades={suggestions.trades}
      />

      {settingsOpen && activeProjectId && detail
        ? createPortal(
            <ProjectSettingsModal
              header={header}
              onClose={() => setSettingsOpen(false)}
              onSaved={async (next) => {
                setHeader(next);
                setSettingsOpen(false);
                setStatusMessage("已更新案件設定");
                await loadDetail();
              }}
              onDelete={() => {
                window.location.href = "/admin/bookkeeping";
              }}
              onError={setError}
              projectId={activeProjectId}
            />,
            document.body,
          )
        : null}
    </>
  );
}

function ProjectSettingsModal({
  projectId,
  header,
  onClose,
  onSaved,
  onDelete,
  onError,
}: {
  projectId: string;
  header: HeaderDraft;
  onClose: () => void;
  onSaved: (header: HeaderDraft) => Promise<void>;
  onDelete: () => void;
  onError: (message: string | null) => void;
}) {
  const [draft, setDraft] = useState(header);

  async function save() {
    onError(null);
    try {
      await bkFetch(`/api/bookkeeping/projects/${projectId}`, {
        method: "PUT",
        body: JSON.stringify({
          name: draft.name.trim(),
          client_name: draft.client_name || null,
          client_phone: draft.client_phone || null,
          address: draft.address || null,
          contract_amount: draft.contract_amount,
          status: draft.status,
          note: draft.note || null,
        }),
      });
      await onSaved(draft);
    } catch (saveError) {
      onError(saveError instanceof Error ? saveError.message : "儲存失敗");
    }
  }

  async function removeProject() {
    if (!window.confirm("確定刪除此案件？所有收款與支出將一併刪除。")) return;
    onError(null);
    try {
      await bkFetch(`/api/bookkeeping/projects/${projectId}`, { method: "DELETE" });
      onDelete();
    } catch (deleteError) {
      onError(deleteError instanceof Error ? deleteError.message : "刪除失敗");
    }
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal admin-form-wide" onClick={(event) => event.stopPropagation()}>
        <h2>案件設定</h2>
        <div className="admin-form admin-form-wide">
          <label>
            狀態
            <select
              value={draft.status}
              onChange={(event) => setDraft({ ...draft, status: event.target.value as BkProjectStatus })}
            >
              {BK_PROJECT_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            備註
            <textarea rows={3} value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} />
          </label>
        </div>
        <div className="admin-modal-actions">
          <button className="admin-button" type="button" onClick={() => void save()}>
            儲存
          </button>
          <button className="admin-button danger" type="button" onClick={() => void removeProject()}>
            刪除案件
          </button>
          <button className="admin-button secondary" type="button" onClick={onClose}>
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
