-- 翔胤 CMS、作品媒體索引與裝修記帳。所有資料均受 sianying 租戶 RLS 隔離。
begin;

create table if not exists public.sianying_cms_documents (
  key text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.sianying_bk_projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client_name text,
  client_phone text,
  client_tax_id text,
  client_invoice_tax_mode text not null default '不開' check (client_invoice_tax_mode in ('內含', '外加', '不開')),
  client_invoice_no text,
  design_invoice_tax_mode text not null default '不開' check (design_invoice_tax_mode in ('內含', '外加', '不開')),
  design_invoice_no text,
  prepayment_invoice_tax_mode text not null default '不開' check (prepayment_invoice_tax_mode in ('內含', '外加', '不開')),
  prepayment_invoice_no text,
  address text,
  design_fee_amount bigint not null default 0 check (design_fee_amount >= 0),
  prepayment_amount bigint not null default 0 check (prepayment_amount >= 0),
  contract_amount bigint not null default 0 check (contract_amount >= 0),
  status text not null default '進行中' check (status in ('進行中', '已完工', '已結案')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sianying_bk_vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  trade text,
  contact_name text,
  phone text,
  tax_id text,
  bank_info text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sianying_bk_project_incomes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.sianying_bk_projects(id) on delete cascade,
  received_date date not null,
  income_category text not null default '工程款' check (income_category in ('設計費', '工程款', '預付款')),
  amount bigint not null check (amount > 0),
  payment_method text not null default '匯款' check (payment_method in ('現金', '匯款', '支票', '其他')),
  reference_no text,
  invoice_tax_mode text not null default '不開' check (invoice_tax_mode in ('內含', '外加', '不開')),
  client_invoice_status text not null default '不需' check (client_invoice_status in ('不需', '待開', '已開')),
  client_invoice_no text,
  tax_status text not null default '不適用' check (tax_status in ('不適用', '待繳', '已繳')),
  tax_amount bigint check (tax_amount is null or tax_amount >= 0),
  tax_paid_date date,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.sianying_bk_project_expenses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.sianying_bk_projects(id) on delete cascade,
  vendor_id uuid not null references public.sianying_bk_vendors(id) on delete restrict,
  expense_date date not null,
  trade text not null,
  description text,
  payable_amount bigint not null check (payable_amount > 0),
  payable_net_amount bigint check (payable_net_amount is null or payable_net_amount >= 0),
  due_date date,
  payment_stage text check (payment_stage is null or payment_stage in ('訂金', '期中款', '尾款', '追加款', '保留款', '其他')),
  invoice_no text,
  invoice_amount bigint check (invoice_amount is null or invoice_amount > 0),
  vendor_tax_mode text not null default '應稅' check (vendor_tax_mode in ('應稅', '免稅')),
  vendor_invoice_status text not null default '待收' check (vendor_invoice_status in ('不需', '待收', '已收到')),
  vendor_invoice_note text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sianying_bk_expense_payments (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.sianying_bk_project_expenses(id) on delete cascade,
  paid_date date not null,
  amount bigint not null check (amount > 0),
  payment_method text not null default '匯款' check (payment_method in ('現金', '匯款', '支票', '其他')),
  reference_no text,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists sianying_bk_projects_status_idx on public.sianying_bk_projects(status);
create index if not exists sianying_bk_projects_name_idx on public.sianying_bk_projects(name);
create index if not exists sianying_bk_vendors_name_idx on public.sianying_bk_vendors(name);
create index if not exists sianying_bk_project_incomes_project_idx on public.sianying_bk_project_incomes(project_id);
create index if not exists sianying_bk_project_expenses_project_idx on public.sianying_bk_project_expenses(project_id);
create index if not exists sianying_bk_project_expenses_vendor_idx on public.sianying_bk_project_expenses(vendor_id);
create index if not exists sianying_bk_expense_payments_expense_idx on public.sianying_bk_expense_payments(expense_id);

alter table public.sianying_cms_documents enable row level security;
alter table public.sianying_bk_projects enable row level security;
alter table public.sianying_bk_vendors enable row level security;
alter table public.sianying_bk_project_incomes enable row level security;
alter table public.sianying_bk_project_expenses enable row level security;
alter table public.sianying_bk_expense_payments enable row level security;

revoke all on table
  public.sianying_cms_documents,
  public.sianying_bk_projects,
  public.sianying_bk_vendors,
  public.sianying_bk_project_incomes,
  public.sianying_bk_project_expenses,
  public.sianying_bk_expense_payments
from public, anon, authenticated;

grant select, insert, update, delete on table
  public.sianying_cms_documents,
  public.sianying_bk_projects,
  public.sianying_bk_vendors,
  public.sianying_bk_project_incomes,
  public.sianying_bk_project_expenses,
  public.sianying_bk_expense_payments
to authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'sianying_cms_documents',
    'sianying_bk_projects',
    'sianying_bk_vendors',
    'sianying_bk_project_incomes',
    'sianying_bk_project_expenses',
    'sianying_bk_expense_payments'
  ] loop
    execute format('drop policy if exists %I on public.%I', table_name || '_tenant_all', table_name);
    execute format(
      'create policy %I on public.%I for all to authenticated using ((select private.is_design_tenant_member(''sianying''))) with check ((select private.is_design_tenant_member(''sianying'')))',
      table_name || '_tenant_all',
      table_name
    );
  end loop;
end $$;

grant update, delete on table public.sianying_inquiries to authenticated;
drop policy if exists sianying_inquiries_update on public.sianying_inquiries;
create policy sianying_inquiries_update on public.sianying_inquiries
for update to authenticated
using ((select private.is_design_tenant_member('sianying')))
with check ((select private.is_design_tenant_member('sianying')));
drop policy if exists sianying_inquiries_delete on public.sianying_inquiries;
create policy sianying_inquiries_delete on public.sianying_inquiries
for delete to authenticated
using ((select private.is_design_tenant_member('sianying')));

commit;
