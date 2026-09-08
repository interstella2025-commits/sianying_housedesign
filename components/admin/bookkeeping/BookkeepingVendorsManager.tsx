"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BkTypeaheadInput } from "@/components/admin/bookkeeping/BkTypeaheadInput";
import { BookkeepingExportBar } from "@/components/admin/bookkeeping/BookkeepingExportBar";
import { BookkeepingNav, bkFetch } from "@/components/admin/bookkeeping/BookkeepingNav";
import { VendorPaymentModal } from "@/components/admin/bookkeeping/VendorPaymentModal";
import { exportVendorsCsv } from "@/lib/bookkeeping/csv-export";
import { formatCurrency } from "@/lib/bookkeeping/format";
import type { BkExpenseWithPayments, BkVendorListItem } from "@/lib/bookkeeping/types";

type VendorsResponse = { vendors: BkVendorListItem[] };
type SuggestionsResponse = { vendors: string[]; trades: string[] };
type VendorDetailResponse = { expenses: BkExpenseWithPayments[] };

export function BookkeepingVendorsManager() {
  const [vendors, setVendors] = useState<BkVendorListItem[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionsResponse>({ vendors: [], trades: [] });
  const [q, setQ] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [paymentVendor, setPaymentVendor] = useState<BkVendorListItem | null>(null);
  const [paymentExpenses, setPaymentExpenses] = useState<BkExpenseWithPayments[]>([]);
  const [paymentLoadingId, setPaymentLoadingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: "", trade: "", phone: "", note: "" });
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const paymentButtonRef = useRef<HTMLButtonElement | null>(null);

  const query = useMemo(() => (q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""), [q]);

  const loadVendors = useCallback(async () => {
    setError(null);
    try {
      const [vendorPayload, suggestionPayload] = await Promise.all([
        bkFetch<VendorsResponse>(`/api/bookkeeping/vendors${query}`),
        bkFetch<SuggestionsResponse>("/api/bookkeeping/suggestions"),
      ]);
      setVendors(vendorPayload.vendors);
      setSuggestions(suggestionPayload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "載入失敗");
    }
  }, [query]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- admin list fetch
    void loadVendors();
  }, [loadVendors]);

  async function createVendor() {
    setError(null);
    try {
      await bkFetch("/api/bookkeeping/vendors", {
        method: "POST",
        body: JSON.stringify(draft),
      });
      setModalOpen(false);
      setDraft({ name: "", trade: "", phone: "", note: "" });
      setStatusMessage("已新增廠商");
      await loadVendors();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "新增失敗");
    }
  }

  const closePaymentModal = useCallback(() => {
    setPaymentVendor(null);
    setPaymentExpenses([]);
    window.requestAnimationFrame(() => paymentButtonRef.current?.focus());
  }, []);

  async function openPaymentModal(vendor: BkVendorListItem, button: HTMLButtonElement) {
    paymentButtonRef.current = button;
    setPaymentLoadingId(vendor.id);
    setError(null);
    setStatusMessage(null);
    try {
      const detail = await bkFetch<VendorDetailResponse>(`/api/bookkeeping/vendors/${vendor.id}`);
      const unpaidExpenses = detail.expenses.filter((expense) => expense.unpaid_balance > 0);
      if (!unpaidExpenses.length) {
        setError("這個廠商目前沒有未付款項。");
        await loadVendors();
        return;
      }
      setPaymentExpenses(unpaidExpenses);
      setPaymentVendor(vendor);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "未付款項載入失敗");
    } finally {
      setPaymentLoadingId(null);
    }
  }

  return (
    <>
      <BookkeepingNav />

      <div className="admin-toolbar bk-toolbar bk-no-print">
        <input
          className="bk-search"
          type="search"
          placeholder="搜尋廠商或工種"
          value={q}
          onChange={(event) => setQ(event.target.value)}
        />
        <button className="admin-button" type="button" onClick={() => setModalOpen(true)}>
          新增廠商
        </button>
        <BookkeepingExportBar
          onExportCsv={() => exportVendorsCsv(vendors)}
          disabled={!vendors.length}
        />
      </div>

      {statusMessage ? <p className="admin-inline-status">{statusMessage}</p> : null}
      {error ? <p className="admin-inline-status is-error">{error}</p> : null}

      <div className="admin-table-wrap bk-table-wrap bk-print-area">
        <table className="admin-table bk-table bk-vendor-list-table">
          <thead>
            <tr>
              <th>廠商</th>
              <th>主要工種</th>
              <th>案件數</th>
              <th>總應付</th>
              <th>總已付</th>
              <th>目前應付</th>
              <th className="bk-vendor-payment-column bk-no-print">操作</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor) => (
              <tr key={vendor.id}>
                <td data-label="廠商">
                  <Link className="bk-link" href={`/admin/bookkeeping/vendors/${vendor.id}`}>
                    {vendor.name}
                  </Link>
                </td>
                <td data-label="主要工種">{vendor.trade || "—"}</td>
                <td data-label="案件數">{vendor.project_count}</td>
                <td data-label="總應付">{formatCurrency(vendor.payable_total)}</td>
                <td data-label="總已付">{formatCurrency(vendor.paid_total)}</td>
                <td data-label="目前應付">{formatCurrency(vendor.payable_now)}</td>
                <td className="bk-vendor-payment-cell bk-no-print" data-label="操作">
                  {vendor.payable_now > 0 ? (
                    <button
                      className="admin-button small bk-vendor-payment-list-button"
                      type="button"
                      disabled={paymentLoadingId !== null}
                      aria-label={`登記付款 ${vendor.name}`}
                      onClick={(event) => void openPaymentModal(vendor, event.currentTarget)}
                    >
                      {paymentLoadingId === vendor.id ? "載入中…" : "登記付款"}
                    </button>
                  ) : (
                    <span className="bk-vendor-payment-unavailable" aria-label="目前沒有應付款項">
                      —
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!vendors.length ? <p className="admin-note">目前沒有廠商。</p> : null}
      </div>

      {modalOpen
        ? createPortal(
            <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
              <div className="admin-modal admin-form-wide" onClick={(event) => event.stopPropagation()}>
                <h2>新增廠商</h2>
                <div className="admin-form admin-form-wide">
                  <BkTypeaheadInput
                    label="廠商名稱"
                    placeholder="自由輸入，會提示歷史廠商"
                    value={draft.name}
                    suggestions={suggestions.vendors}
                    onChange={(name) => setDraft({ ...draft, name })}
                  />
                  <BkTypeaheadInput
                    label="主要工種"
                    placeholder="自由輸入，會提示用過的工種"
                    value={draft.trade}
                    suggestions={suggestions.trades}
                    onChange={(trade) => setDraft({ ...draft, trade })}
                  />
                  <label>
                    電話
                    <input value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} />
                  </label>
                  <label>
                    備註
                    <textarea rows={3} value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} />
                  </label>
                </div>
                <div className="admin-modal-actions">
                  <button className="admin-button" type="button" onClick={() => void createVendor()}>
                    儲存
                  </button>
                  <button className="admin-button secondary" type="button" onClick={() => setModalOpen(false)}>
                    取消
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
      {paymentVendor
        ? createPortal(
            <VendorPaymentModal
              vendorName={paymentVendor.name}
              expenses={paymentExpenses}
              onClose={closePaymentModal}
              onSaved={async () => {
                const vendorName = paymentVendor.name;
                closePaymentModal();
                setStatusMessage(`已登記「${vendorName}」付款`);
                await loadVendors();
              }}
            />,
            document.body,
          )
        : null}
    </>
  );
}
