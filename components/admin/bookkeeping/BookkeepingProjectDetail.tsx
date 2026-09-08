import { BookkeepingLedgerSheet } from "@/components/admin/bookkeeping/BookkeepingLedgerSheet";

export { BookkeepingLedgerSheet } from "@/components/admin/bookkeeping/BookkeepingLedgerSheet";

export function BookkeepingProjectDetail({ projectId }: { projectId: string }) {
  return <BookkeepingLedgerSheet projectId={projectId} />;
}
