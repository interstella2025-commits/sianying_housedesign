"use client";

import { useEffect, useId, useRef, useState } from "react";
import { BkDateInput } from "@/components/admin/bookkeeping/BkDateInput";
import { bkFetch } from "@/components/admin/bookkeeping/BookkeepingNav";
import { formatCurrency, todayISODate } from "@/lib/bookkeeping/format";
import { BK_PAYMENT_METHODS } from "@/lib/bookkeeping/types";
import type { BkExpenseWithPayments, BkPaymentMethod } from "@/lib/bookkeeping/types";

export function VendorPaymentModal({
  vendorName,
  expenses,
  onClose,
  onSaved,
}: {
  vendorName: string;
  expenses: BkExpenseWithPayments[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const titleId = useId();
  const expenseSelectRef = useRef<HTMLSelectElement>(null);
  const [expenseId, setExpenseId] = useState(expenses[0]?.id ?? "");
  const [paidDate, setPaidDate] = useState(todayISODate());
  const [amount, setAmount] = useState<number | "">(expenses[0]?.unpaid_balance ?? "");
  const [paymentMethod, setPaymentMethod] = useState<BkPaymentMethod>("匯款");
  const [referenceNo, setReferenceNo] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const expense = expenses.find((item) => item.id === expenseId) ?? expenses[0];

  useEffect(() => {
    const previousRootOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    expenseSelectRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.documentElement.style.overflow = previousRootOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  function selectExpense(nextExpenseId: string) {
    const nextExpense = expenses.find((item) => item.id === nextExpenseId);
    setExpenseId(nextExpenseId);
    setAmount(nextExpense?.unpaid_balance ?? "");
    setError(null);
  }

  async function savePayment() {
    if (!expense) {
      setError("找不到可付款的支出，請關閉視窗後重試。");
      return;
    }
    if (!paidDate) {
      setError("請選擇付款日期。");
      return;
    }
    if (amount === "" || amount <= 0) {
      setError("付款金額必須大於 0。");
      return;
    }
    if (amount > expense.unpaid_balance) {
      setError(`付款金額不可超過目前未付 ${formatCurrency(expense.unpaid_balance)}。`);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await bkFetch("/api/bookkeeping/payments", {
        method: "POST",
        body: JSON.stringify({
          expense_id: expense.id,
          paid_date: paidDate,
          amount,
          payment_method: paymentMethod,
          reference_no: referenceNo || null,
          note: note || null,
        }),
      });
      await onSaved();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "付款儲存失敗，請稍後再試。");
      setSaving(false);
    }
  }

  if (!expense) return null;

  return (
    <div className="admin-modal-overlay bk-vendor-payment-overlay" onClick={onClose}>
      <div
        className="admin-modal admin-modal-compact bk-vendor-payment-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="bk-vendor-payment-heading">
          <div>
            <h2 id={titleId}>登記付款</h2>
            <p>{vendorName}</p>
          </div>
          <button className="admin-button secondary small" type="button" onClick={onClose}>
            關閉
          </button>
        </div>

        <div className="admin-form admin-form-wide bk-vendor-payment-form">
          <label>
            選擇未付項目
            <select
              ref={expenseSelectRef}
              value={expense.id}
              onChange={(event) => selectExpense(event.target.value)}
            >
              {expenses.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.project_name || "未命名案件"} · {item.trade}
                  {item.description ? ` · ${item.description}` : ""}
                </option>
              ))}
            </select>
          </label>

          <dl className="bk-vendor-payment-context">
            <div>
              <dt>案件</dt>
              <dd>{expense.project_name || "—"}</dd>
            </div>
            <div>
              <dt>項目</dt>
              <dd>{expense.description || expense.trade}</dd>
            </div>
            <div>
              <dt>目前未付</dt>
              <dd>{formatCurrency(expense.unpaid_balance)}</dd>
            </div>
          </dl>

          <label>
            付款日期
            <BkDateInput value={paidDate} onChange={setPaidDate} aria-label="付款日期" />
          </label>

          <label>
            本次付款金額
            <span className="bk-vendor-payment-amount-row">
              <input
                type="number"
                min={1}
                max={expense.unpaid_balance}
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value === "" ? "" : Number(event.target.value))
                }
              />
              <button
                className="admin-button secondary small"
                type="button"
                onClick={() => setAmount(expense.unpaid_balance)}
              >
                填入未付全額
              </button>
            </span>
          </label>

          <label>
            付款方式
            <select
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value as BkPaymentMethod)}
            >
              {BK_PAYMENT_METHODS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <details className="bk-vendor-payment-optional">
            <summary>補充資料（選填）</summary>
            <div>
              <label>
                參考號碼
                <input value={referenceNo} onChange={(event) => setReferenceNo(event.target.value)} />
              </label>
              <label>
                備註
                <textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} />
              </label>
            </div>
          </details>
        </div>

        {error ? (
          <p className="admin-inline-status is-error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="admin-modal-actions bk-vendor-payment-actions">
          <button
            className="admin-button"
            type="button"
            disabled={saving}
            onClick={() => void savePayment()}
          >
            {saving ? "儲存中…" : "儲存付款"}
          </button>
          <button className="admin-button secondary" type="button" disabled={saving} onClick={onClose}>
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
