"use client";

import { useState } from "react";
import { BkDateInput } from "@/components/admin/bookkeeping/BkDateInput";
import { BkTypeaheadInput } from "@/components/admin/bookkeeping/BkTypeaheadInput";
import { bkFetch } from "@/components/admin/bookkeeping/BookkeepingNav";
import { formatCurrency, formatDateTW, todayISODate } from "@/lib/bookkeeping/format";
import {
  BK_CLIENT_INVOICE_STATUSES,
  BK_PAYMENT_METHODS,
  BK_PAYMENT_STAGES,
  BK_TAX_STATUSES,
} from "@/lib/bookkeeping/types";
import type {
  BkClientInvoiceStatus,
  BkExpensePayment,
  BkExpenseWithPayments,
  BkPaymentMethod,
  BkPaymentStage,
  BkProjectIncome,
  BkTaxStatus,
  BkVendorInvoiceStatus,
  BkVendorTaxMode,
} from "@/lib/bookkeeping/types";
import { deriveVendorTaxMode, deriveVendorPayableNet, normalizeVendorExpenseTax, syncExpenseDraftPayable, vendorInvoiceSummary } from "@/lib/bookkeeping/vendor-tax";

export type SuggestionsResponse = { vendors: string[]; trades: string[] };

export function incomeTaxSummary(income: BkProjectIncome) {
  if (income.client_invoice_status === "不需" && income.tax_status === "不適用") return "—";
  const parts: string[] = [income.client_invoice_status];
  if (income.client_invoice_no) parts.push(income.client_invoice_no);
  if (income.tax_status !== "不適用") {
    parts.push(`稅${income.tax_status}`);
    if (income.tax_amount != null) parts.push(formatCurrency(income.tax_amount));
  }
  return parts.join(" · ");
}

export function expenseInvoiceSummary(expense: BkExpenseWithPayments) {
  return vendorInvoiceSummary(expense);
}

export async function deleteProjectIncome(
  id: string,
  reload: () => Promise<void>,
  setError: (value: string | null) => void,
) {
  if (!window.confirm("確定刪除此收款紀錄？")) return;
  setError(null);
  try {
    await bkFetch(`/api/bookkeeping/incomes?id=${id}`, { method: "DELETE" });
    await reload();
  } catch (deleteError) {
    setError(deleteError instanceof Error ? deleteError.message : "刪除失敗");
  }
}

export async function deleteProjectExpense(
  expense: BkExpenseWithPayments,
  reload: () => Promise<void>,
  setError: (value: string | null) => void,
) {
  const warning =
    expense.payments.length > 0
      ? "此支出已有付款紀錄，刪除前請先確認。確定刪除？"
      : "確定刪除此支出？";
  if (!window.confirm(warning)) return;
  setError(null);
  try {
    await bkFetch(`/api/bookkeeping/expenses?id=${expense.id}`, { method: "DELETE" });
    await reload();
  } catch (deleteError) {
    setError(deleteError instanceof Error ? deleteError.message : "刪除失敗");
  }
}

export function IncomeEntryModal({
  projectId,
  income,
  onClose,
  onSaved,
  onError,
}: {
  projectId: string;
  income?: BkProjectIncome;
  onClose: () => void;
  onSaved: () => Promise<void>;
  onError: (message: string | null) => void;
}) {
  const [draft, setDraft] = useState({
    received_date: income?.received_date ?? todayISODate(),
    amount: income?.amount ?? 0,
    payment_method: (income?.payment_method ?? "匯款") as BkPaymentMethod,
    reference_no: income?.reference_no ?? "",
    client_invoice_status: (income?.client_invoice_status ?? "不需") as BkClientInvoiceStatus,
    client_invoice_no: income?.client_invoice_no ?? "",
    tax_status: (income?.tax_status ?? "不適用") as BkTaxStatus,
    tax_amount: (income?.tax_amount ?? "") as number | "",
    tax_paid_date: income?.tax_paid_date ?? "",
    note: income?.note ?? "",
  });

  function updateInvoiceStatus(status: BkClientInvoiceStatus) {
    setDraft((current) => ({
      ...current,
      client_invoice_status: status,
      tax_status: status === "不需" ? "不適用" : current.tax_status === "不適用" ? "待繳" : current.tax_status,
    }));
  }

  async function save() {
    onError(null);
    try {
      const payload = {
        project_id: projectId,
        ...draft,
        tax_amount: draft.tax_amount === "" ? null : Number(draft.tax_amount),
        tax_paid_date: draft.tax_paid_date || null,
        client_invoice_no: draft.client_invoice_no || undefined,
      };
      if (income) {
        await bkFetch("/api/bookkeeping/incomes", {
          method: "PUT",
          body: JSON.stringify({ id: income.id, ...payload }),
        });
      } else {
        await bkFetch("/api/bookkeeping/incomes", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      await onSaved();
    } catch (saveError) {
      onError(saveError instanceof Error ? saveError.message : "儲存失敗");
    }
  }

  return (
    <ModalShell title={income ? "編輯收款" : "新增收款"} onClose={onClose} onSave={() => void save()}>
      <label>
        收款日期
        <BkDateInput
          value={draft.received_date}
          onChange={(received_date) => setDraft({ ...draft, received_date })}
        />
      </label>
      <label>
        金額
        <input
          type="number"
          min={1}
          value={draft.amount || ""}
          onChange={(event) => setDraft({ ...draft, amount: Number(event.target.value || 0) })}
        />
      </label>
      <label>
        方式
        <select
          value={draft.payment_method}
          onChange={(event) =>
            setDraft({ ...draft, payment_method: event.target.value as BkPaymentMethod })
          }
        >
          {BK_PAYMENT_METHODS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label>
        參考號碼
        <input
          value={draft.reference_no}
          onChange={(event) => setDraft({ ...draft, reference_no: event.target.value })}
        />
      </label>
      <label>
        備註
        <textarea rows={2} value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} />
      </label>
      <details className="bk-ledger-details">
        <summary>發票與稅金（需要時再填）</summary>
        <div className="bk-ledger-details-body">
          <label>
            客戶發票
            <select
              value={draft.client_invoice_status}
              onChange={(event) => updateInvoiceStatus(event.target.value as BkClientInvoiceStatus)}
            >
              {BK_CLIENT_INVOICE_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          {draft.client_invoice_status !== "不需" ? (
            <>
              <label>
                發票號碼
                <input
                  value={draft.client_invoice_no}
                  onChange={(event) => setDraft({ ...draft, client_invoice_no: event.target.value })}
                />
              </label>
              <label>
                稅金狀態
                <select
                  value={draft.tax_status}
                  onChange={(event) =>
                    setDraft({ ...draft, tax_status: event.target.value as BkTaxStatus })
                  }
                >
                  {BK_TAX_STATUSES.filter((item) => item !== "不適用").map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                稅金金額
                <input
                  type="number"
                  min={0}
                  value={draft.tax_amount}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      tax_amount: event.target.value === "" ? "" : Number(event.target.value),
                    })
                  }
                />
              </label>
              <label>
                繳稅日期
                <BkDateInput
                  value={draft.tax_paid_date}
                  onChange={(tax_paid_date) => setDraft({ ...draft, tax_paid_date })}
                />
              </label>
            </>
          ) : null}
        </div>
      </details>
    </ModalShell>
  );
}

export function ExpenseEntryModal({
  projectId,
  suggestions,
  expense,
  onClose,
  onSaved,
  onError,
}: {
  projectId: string;
  suggestions: SuggestionsResponse;
  expense?: BkExpenseWithPayments;
  onClose: () => void;
  onSaved: () => Promise<void>;
  onError: (message: string | null) => void;
}) {
  const [draft, setDraft] = useState({
    vendor_name: expense?.vendor_name ?? "",
    expense_date: expense?.expense_date ?? todayISODate(),
    trade: expense?.trade ?? "",
    description: expense?.description ?? "",
    payable_net_amount: expense ? deriveVendorPayableNet(expense) : 0,
    payable_amount: expense?.payable_amount ?? 0,
    due_date: expense?.due_date ?? "",
    payment_stage: (expense?.payment_stage ?? "") as BkPaymentStage | "",
    vendor_tax_mode: (expense ? deriveVendorTaxMode(expense) : "應稅") as BkVendorTaxMode,
    vendor_invoice_status: (expense?.vendor_invoice_status ?? "待收") as BkVendorInvoiceStatus,
    invoice_no: expense?.invoice_no ?? "",
    invoice_amount: (expense?.invoice_amount ?? "") as number | "",
    vendor_invoice_note: expense?.vendor_invoice_note ?? "",
    note: expense?.note ?? "",
  });

  async function save() {
    onError(null);
    try {
      const payable = syncExpenseDraftPayable({
        payable_net_amount: draft.payable_net_amount || "",
        vendor_tax_mode: draft.vendor_tax_mode,
      });
      const payload = {
        project_id: projectId,
        ...draft,
        payable_net_amount: Number(payable.payable_net_amount),
        payable_amount: Number(payable.payable_amount),
        payment_stage: draft.payment_stage || null,
        due_date: draft.due_date || undefined,
        invoice_amount: draft.invoice_amount === "" ? null : Number(draft.invoice_amount),
      };
      if (expense) {
        await bkFetch("/api/bookkeeping/expenses", {
          method: "PUT",
          body: JSON.stringify({ id: expense.id, ...payload }),
        });
      } else {
        await bkFetch("/api/bookkeeping/expenses", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      await onSaved();
    } catch (saveError) {
      onError(saveError instanceof Error ? saveError.message : "儲存失敗");
    }
  }

  return (
    <ModalShell title={expense ? "編輯支出" : "新增支出"} onClose={onClose} onSave={() => void save()}>
      <BkTypeaheadInput
        label="廠商"
        placeholder="自由輸入，會提示歷史廠商"
        value={draft.vendor_name}
        suggestions={suggestions.vendors}
        onChange={(vendor_name) => setDraft({ ...draft, vendor_name })}
      />
      <label>
        支出日期
        <BkDateInput
          value={draft.expense_date}
          onChange={(expense_date) => setDraft({ ...draft, expense_date })}
        />
      </label>
      <BkTypeaheadInput
        label="工種"
        placeholder="自由輸入"
        value={draft.trade}
        suggestions={suggestions.trades}
        onChange={(trade) => setDraft({ ...draft, trade })}
      />
      <label>
        {draft.vendor_tax_mode === "應稅" ? "未稅金額" : "應付金額"}
        <input
          type="number"
          min={1}
          value={draft.payable_net_amount || ""}
          onChange={(event) => {
            const next = syncExpenseDraftPayable({
              payable_net_amount: Number(event.target.value || 0),
              vendor_tax_mode: draft.vendor_tax_mode,
            });
            setDraft({
              ...draft,
              payable_net_amount: Number(next.payable_net_amount),
              payable_amount: Number(next.payable_amount),
            });
          }}
        />
      </label>
      {draft.vendor_tax_mode === "應稅" && draft.payable_amount > 0 ? (
        <p className="admin-note">含稅應付 {formatCurrency(draft.payable_amount)}</p>
      ) : null}
      <label>
        事由
        <input
          value={draft.description}
          onChange={(event) => setDraft({ ...draft, description: event.target.value })}
        />
      </label>
      <label>
        預計付款日
        <BkDateInput
          value={draft.due_date}
          onChange={(due_date) => setDraft({ ...draft, due_date })}
        />
      </label>
      <label>
        付款階段
        <select
          value={draft.payment_stage}
          onChange={(event) =>
            setDraft({ ...draft, payment_stage: event.target.value as BkPaymentStage | "" })
          }
        >
          <option value="">—</option>
          {BK_PAYMENT_STAGES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label>
        備註
        <textarea rows={2} value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} />
      </label>
      <details className="bk-ledger-details">
        <summary>廠商稅別與發票（需要時再填）</summary>
        <div className="bk-ledger-details-body">
          <label className="bk-invoice-check" title="勾選表示應稅計算">
            <input
              type="checkbox"
              checked={draft.vendor_tax_mode === "應稅"}
              aria-label="應稅"
              onChange={(event) => {
                const nextMode: BkVendorTaxMode = event.target.checked ? "應稅" : "免稅";
                const payable = syncExpenseDraftPayable({
                  payable_net_amount: draft.payable_net_amount || "",
                  vendor_tax_mode: nextMode,
                });
                setDraft({
                  ...draft,
                  ...normalizeVendorExpenseTax({
                    vendor_tax_mode: nextMode,
                    vendor_invoice_status: draft.vendor_invoice_status,
                  }),
                  payable_net_amount: Number(payable.payable_net_amount),
                  payable_amount: Number(payable.payable_amount),
                  invoice_no: nextMode === "免稅" ? "" : draft.invoice_no,
                  invoice_amount: nextMode === "免稅" ? "" : draft.invoice_amount,
                });
              }}
            />
            <span>應稅</span>
          </label>
          {draft.vendor_tax_mode === "應稅" ? (
            <>
              <label className="bk-invoice-check" title="發票已開">
                <input
                  type="checkbox"
                  checked={draft.vendor_invoice_status === "已收到"}
                  aria-label="發票已開"
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      vendor_tax_mode: "應稅",
                      vendor_invoice_status: event.target.checked ? "已收到" : "待收",
                    })
                  }
                />
                <span>已開</span>
              </label>
              <label>
                發票／憑證號碼
                <input
                  value={draft.invoice_no}
                  onChange={(event) => setDraft({ ...draft, invoice_no: event.target.value })}
                />
              </label>
              <label>
                發票金額
                <input
                  type="number"
                  min={1}
                  value={draft.invoice_amount}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      invoice_amount: event.target.value === "" ? "" : Number(event.target.value),
                    })
                  }
                />
              </label>
              <label>
                備註
                <textarea
                  rows={2}
                  value={draft.vendor_invoice_note}
                  onChange={(event) => setDraft({ ...draft, vendor_invoice_note: event.target.value })}
                />
              </label>
            </>
          ) : null}
        </div>
      </details>
    </ModalShell>
  );
}

export function PaymentEntryModal({
  expense,
  onClose,
  onSaved,
  onError,
}: {
  expense: BkExpenseWithPayments;
  onClose: () => void;
  onSaved: () => Promise<void>;
  onError: (message: string | null) => void;
}) {
  const [draft, setDraft] = useState({
    paid_date: todayISODate(),
    amount: expense.unpaid_balance,
    payment_method: "匯款" as BkPaymentMethod,
    reference_no: "",
    note: "",
  });

  async function savePayment() {
    onError(null);
    try {
      await bkFetch("/api/bookkeeping/payments", {
        method: "POST",
        body: JSON.stringify({ expense_id: expense.id, ...draft }),
      });
      await onSaved();
    } catch (saveError) {
      onError(saveError instanceof Error ? saveError.message : "付款失敗");
    }
  }

  async function deletePayment(payment: BkExpensePayment) {
    if (!window.confirm("確定刪除此付款紀錄？")) return;
    onError(null);
    try {
      await bkFetch(`/api/bookkeeping/payments?id=${payment.id}`, { method: "DELETE" });
      await onSaved();
    } catch (deleteError) {
      onError(deleteError instanceof Error ? deleteError.message : "刪除失敗");
    }
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal admin-form-wide" onClick={(event) => event.stopPropagation()}>
        <h2>付款紀錄 — {expense.description || expense.trade}</h2>
        <p className="admin-note">
          應付 {formatCurrency(expense.payable_amount)} · 已付 {formatCurrency(expense.paid_amount)} · 未付{" "}
          {formatCurrency(expense.unpaid_balance)}
        </p>
        <div className="admin-form admin-form-wide">
          <label>
            付款日期
            <BkDateInput
              value={draft.paid_date}
              onChange={(paid_date) => setDraft({ ...draft, paid_date })}
            />
          </label>
          <label>
            金額
            <input
              type="number"
              min={1}
              max={expense.unpaid_balance}
              value={draft.amount || ""}
              onChange={(event) => setDraft({ ...draft, amount: Number(event.target.value || 0) })}
            />
          </label>
          <label>
            方式
            <select
              value={draft.payment_method}
              onChange={(event) =>
                setDraft({ ...draft, payment_method: event.target.value as BkPaymentMethod })
              }
            >
              {BK_PAYMENT_METHODS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            參考號碼
            <input
              value={draft.reference_no}
              onChange={(event) => setDraft({ ...draft, reference_no: event.target.value })}
            />
          </label>
          <label>
            備註
            <textarea rows={2} value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} />
          </label>
        </div>
        <div className="admin-modal-actions">
          <button className="admin-button" type="button" onClick={() => void savePayment()}>
            新增付款
          </button>
          <button className="admin-button secondary" type="button" onClick={onClose}>
            關閉
          </button>
        </div>
        <div className="bk-payment-history">
          <h3>付款歷史</h3>
          {expense.payments.length ? (
            <ul>
              {expense.payments.map((payment) => (
                <li key={payment.id}>
                  <span>
                    {formatDateTW(payment.paid_date)} · {formatCurrency(payment.amount)} · {payment.payment_method}
                  </span>
                  <button
                    className="admin-button danger small"
                    type="button"
                    onClick={() => void deletePayment(payment)}
                  >
                    刪除
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="admin-note">尚無付款紀錄</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ModalShell({
  title,
  children,
  onClose,
  onSave,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal admin-form-wide" onClick={(event) => event.stopPropagation()}>
        <h2>{title}</h2>
        <div className="admin-form admin-form-wide">{children}</div>
        <div className="admin-modal-actions">
          <button className="admin-button" type="button" onClick={onSave}>
            儲存
          </button>
          <button className="admin-button secondary" type="button" onClick={onClose}>
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
