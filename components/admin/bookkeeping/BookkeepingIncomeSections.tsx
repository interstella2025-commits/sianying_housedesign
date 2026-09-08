"use client";

import { IncomeDraftRow } from "@/components/admin/bookkeeping/BookkeepingInlineRows";
import type { IncomeDraft } from "@/components/admin/bookkeeping/bookkeeping-draft";
import { formatCurrency } from "@/lib/bookkeeping/format";
import { incomeTaxBreakdown } from "@/lib/bookkeeping/income-tax";
import { BK_INVOICE_TAX_MODES } from "@/lib/bookkeeping/types";
import type { BkIncomeCategory, BkInvoiceTaxMode } from "@/lib/bookkeeping/types";

type SectionProps = {
  category: BkIncomeCategory;
  title: string;
  total: number;
  rows: IncomeDraft[];
  clientInvoiceTaxMode: BkInvoiceTaxMode;
  onAddIncome: (category: BkIncomeCategory) => void;
  onUpdateIncome: (key: string, patch: Partial<IncomeDraft>) => void;
  onRemoveIncome: (row: IncomeDraft) => void;
  extraHead?: React.ReactNode;
};

function IncomeSectionBlock({
  category,
  title,
  total,
  rows,
  clientInvoiceTaxMode,
  onAddIncome,
  onUpdateIncome,
  onRemoveIncome,
  extraHead,
}: SectionProps) {
  const sectionRows = rows.filter((row) => row.income_category === category);

  return (
    <section className="bk-income-section">
      <header className="bk-income-section-head">
        <div className="bk-income-section-title-row">
          <h3 className="bk-income-section-title">{title}</h3>
          {extraHead}
          <div className="bk-income-section-meta bk-income-section-meta-end">
            <span>合計 {formatCurrency(total)}</span>
          </div>
        </div>
      </header>
      <table className="bk-ledger-table bk-ledger-table-income">
        <colgroup>
          <col className="bk-col-date" />
          <col className="bk-col-amount" />
          <col className="bk-col-method" />
        </colgroup>
        <thead>
          <tr>
            <th>日期</th>
            <th>金額</th>
            <th>方式</th>
          </tr>
        </thead>
        <tbody>
          {sectionRows.length === 0 ? (
            <tr>
              <td colSpan={3} className="bk-ledger-empty">
                尚無收款紀錄，請先新增明細
              </td>
            </tr>
          ) : null}
          {sectionRows.map((row) => (
            <IncomeDraftRow
              key={row.key}
              row={row}
              clientInvoiceTaxMode={clientInvoiceTaxMode}
              onChange={(patch) => onUpdateIncome(row.key, patch)}
              onRemove={() => onRemoveIncome(row)}
            />
          ))}
        </tbody>
      </table>
      <button className="bk-ledger-add" type="button" onClick={() => onAddIncome(category)}>
        ＋ 新增{category}收款
      </button>
    </section>
  );
}

function categoryTaxSummary(
  rows: IncomeDraft[],
  category: BkIncomeCategory,
  taxMode: BkInvoiceTaxMode,
) {
  const activeRows = rows.filter((row) => !row.markedDelete && row.income_category === category);
  if (taxMode === "不開" || activeRows.length === 0) return null;

  let received = 0;
  let net = 0;
  let tax = 0;
  for (const row of activeRows) {
    const amount = Number(row.amount || 0);
    if (amount <= 0) continue;
    const breakdown = incomeTaxBreakdown({ amount, invoice_tax_mode: taxMode });
    received += breakdown.received;
    net += breakdown.net;
    tax += breakdown.tax;
  }

  if (received <= 0) return null;
  return { received, net, tax };
}

function invoiceExtraHead({
  taxMode,
  invoiceNo,
  onTaxModeChange,
  onInvoiceNoChange,
  taxSummary,
}: {
  taxMode: BkInvoiceTaxMode;
  invoiceNo: string;
  onTaxModeChange: (mode: BkInvoiceTaxMode) => void;
  onInvoiceNoChange: (value: string) => void;
  taxSummary?: { received: number; net: number; tax: number } | null;
}) {
  return (
    <>
      <label className="bk-ledger-inline-field">
        <span>客戶發票</span>
        <select
          className="bk-ledger-input"
          value={taxMode}
          onChange={(event) => onTaxModeChange(event.target.value as BkInvoiceTaxMode)}
        >
          {BK_INVOICE_TAX_MODES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      {taxMode !== "不開" ? (
        <label className="bk-ledger-inline-field">
          <span>發票號碼</span>
          <input
            className="bk-ledger-input"
            value={invoiceNo}
            placeholder="已開時填寫"
            onChange={(event) => onInvoiceNoChange(event.target.value)}
          />
        </label>
      ) : null}
      {taxSummary ? (
        <div className="bk-income-section-meta bk-income-section-meta-tax">
          <span>實收 {formatCurrency(taxSummary.received)}</span>
          <span>未稅 {formatCurrency(taxSummary.net)}</span>
          <span>稅金 {formatCurrency(taxSummary.tax)}</span>
        </div>
      ) : null}
    </>
  );
}

export function BookkeepingIncomeSections({
  rows,
  designInvoiceTaxMode,
  designInvoiceNo,
  constructionInvoiceTaxMode,
  constructionInvoiceNo,
  designTotal,
  prepaymentTotal,
  constructionTotal,
  onDesignInvoiceTaxModeChange,
  onDesignInvoiceNoChange,
  onConstructionInvoiceTaxModeChange,
  onConstructionInvoiceNoChange,
  onAddIncome,
  onUpdateIncome,
  onRemoveIncome,
}: {
  rows: IncomeDraft[];
  designInvoiceTaxMode: BkInvoiceTaxMode;
  designInvoiceNo: string;
  constructionInvoiceTaxMode: BkInvoiceTaxMode;
  constructionInvoiceNo: string;
  designTotal: number;
  prepaymentTotal: number;
  constructionTotal: number;
  onDesignInvoiceTaxModeChange: (mode: BkInvoiceTaxMode) => void;
  onDesignInvoiceNoChange: (value: string) => void;
  onConstructionInvoiceTaxModeChange: (mode: BkInvoiceTaxMode) => void;
  onConstructionInvoiceNoChange: (value: string) => void;
  onAddIncome: (category: BkIncomeCategory) => void;
  onUpdateIncome: (key: string, patch: Partial<IncomeDraft>) => void;
  onRemoveIncome: (row: IncomeDraft) => void;
}) {
  const visibleRows = rows.filter((row) => !row.markedDelete);

  return (
    <div className="bk-income-sections">
      <IncomeSectionBlock
        category="設計費"
        title="設計費"
        total={designTotal}
        rows={visibleRows}
        clientInvoiceTaxMode={designInvoiceTaxMode}
        onAddIncome={onAddIncome}
        onUpdateIncome={onUpdateIncome}
        onRemoveIncome={onRemoveIncome}
        extraHead={invoiceExtraHead({
          taxMode: designInvoiceTaxMode,
          invoiceNo: designInvoiceNo,
          onTaxModeChange: onDesignInvoiceTaxModeChange,
          onInvoiceNoChange: onDesignInvoiceNoChange,
          taxSummary: categoryTaxSummary(visibleRows, "設計費", designInvoiceTaxMode),
        })}
      />

      <IncomeSectionBlock
        category="預付款"
        title="預付款"
        total={prepaymentTotal}
        rows={visibleRows}
        clientInvoiceTaxMode="不開"
        onAddIncome={onAddIncome}
        onUpdateIncome={onUpdateIncome}
        onRemoveIncome={onRemoveIncome}
      />

      <IncomeSectionBlock
        category="工程款"
        title="工程款"
        total={constructionTotal}
        rows={visibleRows}
        clientInvoiceTaxMode={constructionInvoiceTaxMode}
        onAddIncome={onAddIncome}
        onUpdateIncome={onUpdateIncome}
        onRemoveIncome={onRemoveIncome}
        extraHead={invoiceExtraHead({
          taxMode: constructionInvoiceTaxMode,
          invoiceNo: constructionInvoiceNo,
          onTaxModeChange: onConstructionInvoiceTaxModeChange,
          onInvoiceNoChange: onConstructionInvoiceNoChange,
          taxSummary: categoryTaxSummary(visibleRows, "工程款", constructionInvoiceTaxMode),
        })}
      />
    </div>
  );
}
