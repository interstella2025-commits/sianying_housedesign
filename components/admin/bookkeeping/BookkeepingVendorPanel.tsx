"use client";

import { ExpenseDraftRow } from "@/components/admin/bookkeeping/BookkeepingInlineRows";
import type { ExpenseDraft } from "@/components/admin/bookkeeping/bookkeeping-draft";
import { formatCurrency } from "@/lib/bookkeeping/format";

export function BookkeepingVendorPanel({
  vendorName,
  rows,
  payable,
  paid,
  unpaid,
  vendorListId,
  tradeListId,
  onBack,
  onAddExpense,
  onUpdateExpense,
  onRemoveExpense,
  onSubmitPayment,
  onUpdatePayment,
  paymentSubmittingKey = null,
}: {
  vendorName: string;
  rows: ExpenseDraft[];
  payable: number;
  paid: number;
  unpaid: number;
  vendorListId: string;
  tradeListId: string;
  onBack: () => void;
  onAddExpense: () => void;
  onUpdateExpense: (key: string, patch: Partial<ExpenseDraft>) => void;
  onRemoveExpense: (row: ExpenseDraft) => void;
  onSubmitPayment?: (row: ExpenseDraft) => Promise<void>;
  onUpdatePayment?: (
    row: ExpenseDraft,
    paymentId: string,
    input: { paid_date: string; amount: number },
  ) => Promise<void>;
  paymentSubmittingKey?: string | null;
}) {
  return (
    <div className="bk-vendor-panel">
      <header className="bk-vendor-panel-head">
        <button className="bk-ledger-view-tab" type="button" onClick={onBack}>
          ← 返回記帳
        </button>
        <h3 className="bk-vendor-panel-title">{vendorName} · 付款明細</h3>
        <div className="bk-vendor-panel-summary">
          <span>應付 {formatCurrency(payable)}</span>
          <span>已付 {formatCurrency(paid)}</span>
          <strong>未付 {formatCurrency(unpaid)}</strong>
        </div>
      </header>

      <table className="bk-ledger-table bk-ledger-table-expense bk-ledger-table-expense-vendor">
        <colgroup>
          <col className="bk-col-date" />
          <col className="bk-col-trade" />
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
            <th>應付(未稅)</th>
            <th className="bk-ledger-pay-history-head">付款紀錄</th>
            <th>未付</th>
            <th>稅別</th>
            <th>發票</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={7} className="bk-ledger-empty">
                此廠商尚無支出紀錄
              </td>
            </tr>
          ) : null}
          {rows.map((row) => (
            <ExpenseDraftRow
              key={row.key}
              row={row}
              vendorListId={vendorListId}
              tradeListId={tradeListId}
              hideVendor
              onChange={(patch) => onUpdateExpense(row.key, patch)}
              onRemove={() => onRemoveExpense(row)}
              onSubmitPayment={onSubmitPayment}
              onUpdatePayment={onUpdatePayment}
              paymentSubmitting={paymentSubmittingKey === row.key}
            />
          ))}
        </tbody>
      </table>

      <button className="bk-ledger-add" type="button" onClick={onAddExpense}>
        ＋ 新增此廠商支出
      </button>
    </div>
  );
}
