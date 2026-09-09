-- Keep the vendor payable worklists responsive as the expense ledger grows.
create index if not exists sianying_bk_project_expenses_date_idx
  on public.sianying_bk_project_expenses (expense_date desc);
