import { formatDateTW } from "@/lib/bookkeeping/format";

export function isDateWithinRange(value: string, dateFrom?: string, dateTo?: string) {
  return (!dateFrom || value >= dateFrom) && (!dateTo || value <= dateTo);
}

export function formatDateRangeLabel(dateFrom: string, dateTo: string) {
  if (dateFrom && dateTo) return `${formatDateTW(dateFrom)}～${formatDateTW(dateTo)}`;
  if (dateFrom) return `${formatDateTW(dateFrom)} 起`;
  if (dateTo) return `截至 ${formatDateTW(dateTo)}`;
  return "不限期間";
}
