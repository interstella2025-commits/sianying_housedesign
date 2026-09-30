-- First-party traffic and Google Ads attribution for 翔胤室內設計.
begin;

create table if not exists public.sianying_web_sessions (
  id uuid primary key,
  visitor_id uuid not null,
  visitor_key text not null,
  ip_hash text not null,
  started_at timestamptz not null,
  last_seen_at timestamptz not null,
  landing_path text not null,
  landing_url text not null,
  last_page_path text not null,
  referrer text,
  device_type text not null check (device_type in ('mobile', 'tablet', 'desktop', 'unknown')),
  viewport_width integer,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  campaign_id text,
  ad_group_id text,
  ad_id text,
  gclid text,
  max_scroll_depth integer not null default 0 check (max_scroll_depth between 0 and 100),
  last_stage text,
  converted_inquiry_id uuid references public.sianying_inquiries(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sianying_web_events (
  id bigint generated always as identity primary key,
  session_id uuid not null references public.sianying_web_sessions(id) on delete cascade,
  visitor_id uuid not null,
  event_name text not null check (char_length(event_name) between 1 and 80),
  page_path text not null,
  section_id text,
  event_data jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.sianying_inquiries
  add column if not exists analytics_session_id uuid references public.sianying_web_sessions(id) on delete set null,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text,
  add column if not exists utm_term text,
  add column if not exists campaign_id text,
  add column if not exists ad_group_id text,
  add column if not exists ad_id text,
  add column if not exists gclid text;

create index if not exists sianying_web_sessions_started_at_idx on public.sianying_web_sessions(started_at desc);
create index if not exists sianying_web_sessions_visitor_idx on public.sianying_web_sessions(visitor_id, started_at desc);
create index if not exists sianying_web_sessions_campaign_idx on public.sianying_web_sessions(utm_campaign, started_at desc);
create index if not exists sianying_web_sessions_gclid_idx on public.sianying_web_sessions(gclid) where gclid is not null;
create index if not exists sianying_web_events_session_idx on public.sianying_web_events(session_id, occurred_at asc);
create index if not exists sianying_web_events_name_idx on public.sianying_web_events(event_name, occurred_at desc);
create unique index if not exists sianying_web_events_one_form_success_idx
  on public.sianying_web_events(session_id, event_name)
  where event_name = 'form_success';

alter table public.sianying_web_sessions enable row level security;
alter table public.sianying_web_events enable row level security;

revoke all on table public.sianying_web_sessions, public.sianying_web_events from public, anon, authenticated;
grant select, insert, update on table public.sianying_web_sessions to authenticated;
grant select, insert on table public.sianying_web_events to authenticated;
grant usage, select on sequence public.sianying_web_events_id_seq to authenticated;
grant all on table public.sianying_web_sessions, public.sianying_web_events to service_role;

drop policy if exists sianying_web_sessions_tenant on public.sianying_web_sessions;
create policy sianying_web_sessions_tenant on public.sianying_web_sessions
for all to authenticated
using ((select private.is_design_tenant_member('sianying')))
with check ((select private.is_design_tenant_member('sianying')));

drop policy if exists sianying_web_events_tenant on public.sianying_web_events;
create policy sianying_web_events_tenant on public.sianying_web_events
for all to authenticated
using ((select private.is_design_tenant_member('sianying')))
with check ((select private.is_design_tenant_member('sianying')));

comment on table public.sianying_web_sessions is 'Anonymous first-party traffic sessions. Raw IP addresses are never stored.';
comment on column public.sianying_web_sessions.ip_hash is 'HMAC-SHA256 of request IP, used only for anonymous correlation.';

commit;
