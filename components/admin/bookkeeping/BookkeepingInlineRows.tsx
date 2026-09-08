"use client";

import { useRef, useState } from "react";
import {
  BK_PAYMENT_METHODS,
} from "@/lib/bookkeeping/types";
import type { BkInvoiceTaxMode, BkPaymentMethod, BkVendorTaxMode } from "@/lib/bookkeeping/types";
import { normalizeVendorExpenseTax, syncExpenseDraftPayable } from "@/lib/bookkeeping/vendor-tax";
import type { ExpenseDraft, IncomeDraft } from "@/components/admin/bookkeeping/bookkeeping-draft";
import { BkDateInput } from "@/components/admin/bookkeeping/BkDateInput";
import { expenseDraftBalances } from "@/components/admin/bookkeeping/bookkeeping-draft";
import { formatCurrency, formatDateTW } from "@/lib/bookkeeping/format";
import { incomeAmountPlaceholder } from "@/lib/bookkeeping/income-tax";

export function IncomeDraftRow({
  row,
  clientInvoiceTaxMode,
  onChange,
  onRemove,
}: {
  row: IncomeDraft;
  clientInvoiceTaxMode: BkInvoiceTaxMode;
  onChange: (patch: Partial<IncomeDraft>) => void;
  onRemove: () => void;
}) {
  if (row.markedDelete) return null;

  return (
    <tr className="bk-ledger-draft-row">
      <td>
        <BkDateInput
          className="bk-ledger-cell-input"
          value={row.received_date}
          aria-label="收款日期"
          onChange={(received_date) => onChange({ received_date })}
        />
      </td>
      <td>
        <input
          className="bk-ledger-cell-input bk-ledger-cell-num"
          type="number"
          min={1}
          placeholder={incomeAmountPlaceholder(clientInvoiceTaxMode)}
          value={row.amount}
          onChange={(event) =>
            onChange({ amount: event.target.value === "" ? "" : Number(event.target.value) })
          }
        />
      </td>
      <td className="bk-ledger-method-cell">
        <div className="bk-ledger-method-row">
          <select
            className="bk-ledger-cell-input"
            value={row.payment_method}
            onChange={(event) => onChange({ payment_method: event.target.value as BkPaymentMethod })}
          >
            {BK_PAYMENT_METHODS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <button
            className="bk-row-remove"
            type="button"
            onClick={onRemove}
            aria-label="移除此筆收款"
            title="移除"
          >
            ×
          </button>
        </div>
      </td>
    </tr>
  );
}

export function ExpenseDraftRow({
  row,
  vendorListId,
  tradeListId,
  onChange,
  onRemove,
  onVendorClick,
  onSubmitPayment,
  onUpdatePayment,
  paymentSubmitting = false,
  hideVendor = false,
  vendorSuggestions = [],
}: {
  row: ExpenseDraft;
  vendorListId: string;
  tradeListId: string;
  onChange: (patch: Partial<ExpenseDraft>) => void;
  onRemove: () => void;
  onVendorClick?: (vendorName: string) => void;
  onSubmitPayment?: (row: ExpenseDraft) => Promise<void>;
  onUpdatePayment?: (
    row: ExpenseDraft,
    paymentId: string,
    input: { paid_date: string; amount: number },
  ) => Promise<void>;
  paymentSubmitting?: boolean;
  hideVendor?: boolean;
  vendorSuggestions?: string[];
}) {
  const submittingRef = useRef(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [editPaymentDate, setEditPaymentDate] = useState("");
  const [editPaymentAmount, setEditPaymentAmount] = useState<number | "">("");

  if (row.markedDelete) return null;

  const { paid, unpaid, unpaidAfterPending, remainingPayable, remainingAfterPending, payable } =
    expenseDraftBalances(row);
  const displayUnpaid = row.payment_amount === "" ? unpaid : unpaidAfterPending;
  const paymentHistory = row.payments
    .slice()
    .sort(
      (a, b) =>
        a.paid_date.localeCompare(b.paid_date) || a.created_at.localeCompare(b.created_at),
    );

  async function trySubmitPayment() {
    if (!onSubmitPayment || paymentSubmitting || submittingRef.current) return;
    if (row.payment_amount === "" || Number(row.payment_amount) <= 0) return;
    if (!row.payment_date) return;

    submittingRef.current = true;
    try {
      await onSubmitPayment(row);
    } finally {
      submittingRef.current = false;
    }
  }

  function startEditPayment(payment: (typeof paymentHistory)[number]) {
    if (paymentSubmitting || !onUpdatePayment) return;
    setEditingPaymentId(payment.id);
    setEditPaymentDate(payment.paid_date);
    setEditPaymentAmount(payment.amount);
  }

  function cancelEditPayment() {
    setEditingPaymentId(null);
    setEditPaymentDate("");
    setEditPaymentAmount("");
  }

  async function trySubmitPaymentEdit(paymentId: string) {
    if (!onUpdatePayment || paymentSubmitting || submittingRef.current) return;
    if (editPaymentAmount === "" || Number(editPaymentAmount) <= 0) return;
    if (!editPaymentDate) return;

    submittingRef.current = true;
    try {
      await onUpdatePayment(row, paymentId, {
        paid_date: editPaymentDate,
        amount: Number(editPaymentAmount),
      });
      cancelEditPayment();
    } finally {
      submittingRef.current = false;
    }
  }

  function editPaymentMaxAmount(paymentId: string): number {
    const otherPaid = row.payments
      .filter((payment) => payment.id !== paymentId)
      .reduce((total, payment) => total + payment.amount, 0);
    return Math.max(payable - otherPaid, 0);
  }

  return (
    <tr className="bk-ledger-draft-row">
      <td className="bk-ledger-date-cell">
        <BkDateInput
          className="bk-ledger-cell-input"
          value={row.expense_date}
          aria-label="支出日期"
          onChange={(expense_date) => onChange({ expense_date })}
        />
      </td>
      <td className="bk-ledger-trade-cell">
        <input
          className="bk-ledger-cell-input"
          value={row.trade}
          placeholder="工種"
          list={tradeListId}
          onChange={(event) => onChange({ trade: event.target.value })}
        />
      </td>
      {!hideVendor ? (
        <td className="bk-ledger-vendor-cell">
          <div className="bk-vendor-cell">
            <input
              className="bk-ledger-cell-input"
              value={row.vendor_name}
              placeholder="廠商"
              list={vendorListId}
              onChange={(event) => onChange({ vendor_name: event.target.value })}
            />
            {onVendorClick && row.vendor_name.trim() ? (
              <button
                className="bk-vendor-open"
                type="button"
                title="查看廠商付款明細"
                onClick={() => onVendorClick(row.vendor_name.trim())}
              >
                明細
              </button>
            ) : null}
            {!row.vendor_name.trim() && row.trade.trim() && vendorSuggestions.length > 0 ? (
              <div className="bk-vendor-history" aria-label={`${row.trade.trim()}過去使用的廠商`}>
                <span className="bk-vendor-history-label">過去使用</span>
                {vendorSuggestions.map((vendor) => (
                  <button
                    key={vendor}
                    type="button"
                    className="bk-vendor-history-option"
                    title={`選擇廠商：${vendor}`}
                    onClick={() => onChange({ vendor_name: vendor })}
                  >
                    {vendor}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </td>
      ) : null}
      <td className="bk-ledger-payable-cell">
        <input
          className="bk-ledger-cell-input bk-ledger-cell-num"
          type="number"
          min={1}
          placeholder={row.vendor_tax_mode === "應稅" ? "未稅" : "金額"}
          value={row.payable_net_amount}
          aria-label={row.vendor_tax_mode === "應稅" ? "未稅金額" : "應付金額"}
          onChange={(event) =>
            onChange(
              syncExpenseDraftPayable({
                payable_net_amount: event.target.value === "" ? "" : Number(event.target.value),
                vendor_tax_mode: row.vendor_tax_mode,
              }),
            )
          }
        />
        {row.vendor_tax_mode === "應稅" && row.payable_amount !== "" ? (
          <div className="bk-ledger-payable-gross">
            <span className="bk-ledger-payable-gross-amount">
              {formatCurrency(Number(row.payable_amount))}
            </span>
            <span className="bk-ledger-payable-gross-label">（含稅）</span>
          </div>
        ) : null}
      </td>
      <td className="bk-expense-payments-cell">
        {paymentHistory.length > 0 ? (
          <ul className="bk-expense-payments-list">
            {paymentHistory.map((payment) => {
              const isEditing = editingPaymentId === payment.id;
              const maxAmount = editPaymentMaxAmount(payment.id);

              if (isEditing) {
                return (
                  <li
                    key={payment.id}
                    className="bk-expense-payment-item bk-expense-payment-item--editing"
                  >
                    <BkDateInput
                      className="bk-ledger-cell-input bk-ledger-pay-input"
                      value={editPaymentDate}
                      aria-label="付款日期"
                      onChange={setEditPaymentDate}
                    />
                    <input
                      className="bk-ledger-cell-input bk-ledger-cell-num bk-ledger-pay-input"
                      type="number"
                      min={1}
                      max={maxAmount > 0 ? maxAmount : undefined}
                      value={editPaymentAmount}
                      aria-label="付款金額"
                      disabled={paymentSubmitting}
                      autoFocus
                      onChange={(event) =>
                        setEditPaymentAmount(
                          event.target.value === "" ? "" : Number(event.target.value),
                        )
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          void trySubmitPaymentEdit(payment.id);
                        }
                        if (event.key === "Escape") {
                          event.preventDefault();
                          cancelEditPayment();
                        }
                      }}
                    />
                    <div className="bk-expense-payment-edit-actions">
                      <button
                        type="button"
                        className="bk-expense-payment-edit-save"
                        disabled={
                          paymentSubmitting ||
                          editPaymentAmount === "" ||
                          Number(editPaymentAmount) <= 0 ||
                          !editPaymentDate
                        }
                        onClick={() => void trySubmitPaymentEdit(payment.id)}
                      >
                        儲存
                      </button>
                      <button
                        type="button"
                        className="bk-expense-payment-edit-cancel"
                        disabled={paymentSubmitting}
                        onClick={cancelEditPayment}
                      >
                        取消
                      </button>
                    </div>
                  </li>
                );
              }

              return (
                <li key={payment.id} className="bk-expense-payment-item bk-expense-payment-item--saved">
                  <button
                    type="button"
                    className="bk-expense-payment-trigger"
                    title="點擊編輯"
                    disabled={paymentSubmitting || !onUpdatePayment}
                    onClick={() => startEditPayment(payment)}
                  >
                    <span className="bk-expense-payment-date">{formatDateTW(payment.paid_date)}</span>
                    <span className="bk-expense-payment-amount">{formatCurrency(payment.amount)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
        {remainingPayable > 0 ? (
          <div className="bk-ledger-inline-pay">
            <BkDateInput
              className="bk-ledger-cell-input bk-ledger-pay-input"
              value={row.payment_date}
              aria-label="付款日期"
              onChange={(payment_date) => onChange({ payment_date })}
            />
            <input
              className="bk-ledger-cell-input bk-ledger-cell-num bk-ledger-pay-input"
              type="number"
              min={1}
              max={remainingAfterPending > 0 ? remainingAfterPending : undefined}
              placeholder={`最多 ${remainingPayable}`}
              value={row.payment_amount}
              aria-label="本次付款金額"
              disabled={paymentSubmitting}
              onChange={(event) =>
                onChange({
                  payment_amount: event.target.value === "" ? "" : Number(event.target.value),
                })
              }
              onBlur={() => void trySubmitPayment()}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void trySubmitPayment();
                }
              }}
            />
          </div>
        ) : paymentHistory.length === 0 ? (
          <span className="bk-ledger-muted">—</span>
        ) : null}
      </td>
      <td
        className={`bk-ledger-num bk-ledger-unpaid-cell${displayUnpaid < 0 ? " bk-ledger-balance-overpaid" : ""}`}
      >
        {payable > 0 || paid > 0 ? formatCurrency(displayUnpaid) : "—"}
      </td>
      <td className="bk-ledger-tax-cell">
        <label className="bk-invoice-check" title="勾選表示應稅計算">
          <input
            type="checkbox"
            checked={row.vendor_tax_mode === "應稅"}
            aria-label="應稅"
            onChange={(event) => {
              const nextMode: BkVendorTaxMode = event.target.checked ? "應稅" : "免稅";
              onChange({
                ...normalizeVendorExpenseTax({
                  vendor_tax_mode: nextMode,
                  vendor_invoice_status: row.vendor_invoice_status,
                }),
                ...syncExpenseDraftPayable({
                  payable_net_amount: row.payable_net_amount,
                  vendor_tax_mode: nextMode,
                }),
              });
            }}
          />
          <span>應稅</span>
        </label>
      </td>
      <td className="bk-ledger-invoice-cell">
        {row.vendor_tax_mode === "應稅" ? (
          <label className="bk-invoice-check" title="發票已開">
            <input
              type="checkbox"
              checked={row.vendor_invoice_status === "已收到"}
              aria-label="發票已開"
              onChange={(event) =>
                onChange({
                  vendor_tax_mode: "應稅",
                  vendor_invoice_status: event.target.checked ? "已收到" : "待收",
                })
              }
            />
            <span>已開</span>
          </label>
        ) : (
          <span className="bk-ledger-muted">—</span>
        )}
        <button
          className="bk-row-remove bk-row-remove-outside"
          type="button"
          onClick={onRemove}
          aria-label="移除此筆支出"
          title="移除"
        >
          ×
        </button>
      </td>
    </tr>
  );
}

export function BookkeepingDatalists({
  vendorListId,
  tradeListId,
  vendors,
  trades,
}: {
  vendorListId: string;
  tradeListId: string;
  vendors: string[];
  trades: string[];
}) {
  return (
    <>
      <datalist id={vendorListId}>
        {vendors.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>
      <datalist id={tradeListId}>
        {trades.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>
    </>
  );
}
