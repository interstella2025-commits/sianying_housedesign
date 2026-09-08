-- 翔胤室內設計 tenant resources in the shared howie_housedesign Supabase project.
-- Requires the shared_tenant_isolation migration to have been applied first.

begin;

insert into public.design_tenants (id, display_name, table_prefix, upload_bucket, active)
values ('sianying', '翔胤室內設計', 'sianying_', 'sianying-uploads', true)
on conflict (id) do update set
  display_name = excluded.display_name,
  table_prefix = excluded.table_prefix,
  upload_bucket = excluded.upload_bucket,
  active = true;

create table if not exists public.sianying_inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  form_type text not null check (form_type in ('consultation', 'reservation')),
  name text not null check (char_length(name) between 1 and 80),
  phone text not null check (char_length(phone) between 8 and 20),
  email text check (email is null or char_length(email) <= 120),
  house_age text check (house_age is null or char_length(house_age) <= 40),
  location text check (location is null or char_length(location) <= 100),
  budget text check (budget is null or char_length(budget) <= 60),
  project_type text check (project_type is null or char_length(project_type) <= 40),
  message text check (message is null or char_length(message) <= 1200),
  line_id text check (line_id is null or char_length(line_id) <= 80),
  source_path text not null default '/',
  visitor_hash text not null check (char_length(visitor_hash) = 64),
  status text not null default 'new' check (status in ('new', 'contacted', 'closed'))
);

create index if not exists sianying_inquiries_created_at_idx
  on public.sianying_inquiries (created_at desc);
create index if not exists sianying_inquiries_visitor_rate_idx
  on public.sianying_inquiries (visitor_hash, created_at desc);

alter table public.sianying_inquiries enable row level security;
revoke all on table public.sianying_inquiries from public, anon, authenticated;
grant select, insert on table public.sianying_inquiries to authenticated;
grant select, insert, update, delete on table public.sianying_inquiries to service_role;

drop policy if exists sianying_inquiries_select on public.sianying_inquiries;
create policy sianying_inquiries_select
on public.sianying_inquiries
for select to authenticated
using ((select private.is_design_tenant_member('sianying')));

drop policy if exists sianying_inquiries_insert on public.sianying_inquiries;
create policy sianying_inquiries_insert
on public.sianying_inquiries
for insert to authenticated
with check ((select private.is_design_tenant_member('sianying')));

insert into storage.buckets (id, name, public)
values ('sianying-uploads', 'sianying-uploads', true)
on conflict (id) do update set public = excluded.public;

grant select, insert, update, delete on table storage.objects to authenticated, service_role;

drop policy if exists sianying_storage_select on storage.objects;
create policy sianying_storage_select
on storage.objects for select to authenticated
using (
  bucket_id = 'sianying-uploads'
  and (select private.is_design_tenant_member('sianying'))
);

drop policy if exists sianying_storage_insert on storage.objects;
create policy sianying_storage_insert
on storage.objects for insert to authenticated
with check (
  bucket_id = 'sianying-uploads'
  and (select private.is_design_tenant_member('sianying'))
);

drop policy if exists sianying_storage_update on storage.objects;
create policy sianying_storage_update
on storage.objects for update to authenticated
using (
  bucket_id = 'sianying-uploads'
  and (select private.is_design_tenant_member('sianying'))
)
with check (
  bucket_id = 'sianying-uploads'
  and (select private.is_design_tenant_member('sianying'))
);

drop policy if exists sianying_storage_delete on storage.objects;
create policy sianying_storage_delete
on storage.objects for delete to authenticated
using (
  bucket_id = 'sianying-uploads'
  and (select private.is_design_tenant_member('sianying'))
);

commit;
