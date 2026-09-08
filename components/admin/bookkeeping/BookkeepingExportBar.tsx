"use client";

export function BookkeepingExportBar({
  onExportCsv,
  disabled = false,
}: {
  onExportCsv: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="bk-export-bar bk-no-print">
      <button className="admin-button secondary" type="button" onClick={() => window.print()}>
        列印
      </button>
      <button
        className="admin-button secondary"
        type="button"
        disabled={disabled}
        onClick={onExportCsv}
      >
        匯出 Excel
      </button>
    </div>
  );
}
