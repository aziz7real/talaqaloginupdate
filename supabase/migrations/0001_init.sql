-- Talaqa · initial schema
-- Run once: Supabase dashboard → SQL Editor → paste this file → Run.
--
-- Multi-tenant by design. A business is the tenant; every row carries its
-- business_id, and composite foreign keys make it impossible to link a row to
-- another business's branch, customer or conversation.
--
-- Access: a signed-in member may READ rows of their own business, and only of
-- the branches they are assigned to (branch_ids null = every branch).
-- Nobody can write from the browser: there are no insert/update/delete
-- policies. Phase 3 webhooks (Voiceflow, WhatsApp) write on the server with the
-- service-role key, which never reaches the browser.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.businesses (
  id                 uuid primary key default gen_random_uuid(),
  name_ar            text not null,
  name_en            text not null,
  category_ar        text not null default '',
  category_en        text not null default '',
  timezone           text not null default 'Asia/Riyadh',
  whatsapp_number    text,
  whatsapp_connected boolean not null default false,
  created_at         timestamptz not null default now()
);

create table public.branches (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name_ar     text not null,
  name_en     text not null,
  -- [{ "days": [6,0,1,2,3,4], "opens": "10:00", "closes": "23:00" }]  (0 = Sunday)
  hours       jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  unique (business_id, id)
);

create type public.member_role as enum ('owner', 'manager', 'staff');

create table public.members (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  -- The person's sign-in account. Null for staff who never sign in (e.g. a barber who only takes appointments).
  user_id     uuid references auth.users (id) on delete set null,
  name_ar     text not null,
  name_en     text not null,
  role        public.member_role not null,
  branch_ids  uuid[],
  bookable    boolean not null default false,
  days_off    smallint[] not null default '{}',
  created_at  timestamptz not null default now(),
  unique (business_id, id),
  unique (business_id, user_id)
);
create index members_user_id_idx on public.members (user_id);

create table public.services (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references public.businesses (id) on delete cascade,
  name_ar      text not null,
  name_en      text not null,
  duration_min integer not null check (duration_min > 0),
  price_sar    numeric(10, 2) not null default 0,
  created_at   timestamptz not null default now(),
  unique (business_id, id)
);

create table public.customers (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name        text not null,
  phone       text not null,
  -- The dashboard only ever shows the last four digits.
  phone_last4 text generated always as (right(phone, 4)) stored,
  created_at  timestamptz not null default now(),
  unique (business_id, id),
  unique (business_id, phone)
);

create type public.conversation_status as enum ('handover', 'team', 'talaqa', 'resolved');

create table public.conversations (
  id                 uuid primary key default gen_random_uuid(),
  business_id        uuid not null references public.businesses (id) on delete cascade,
  branch_id          uuid not null,
  customer_id        uuid not null,
  channel            text not null default 'whatsapp' check (channel in ('whatsapp', 'web')),
  status             public.conversation_status not null default 'talaqa',
  topic              text not null default 'other'
                     check (topic in ('booking', 'reschedule', 'cancel', 'prices', 'hours', 'complaint', 'other')),
  -- How it ended; null while the conversation is still open.
  outcome            text check (outcome in ('booked', 'answered', 'handover', 'no_reply')),
  handover_reason_ar text,
  handover_reason_en text,
  unread             integer not null default 0,
  appointment_id     uuid,
  started_at         timestamptz not null default now(),
  first_reply_at     timestamptz,
  last_message_at    timestamptz not null default now(),
  unique (business_id, id),
  foreign key (business_id, branch_id) references public.branches (business_id, id),
  foreign key (business_id, customer_id) references public.customers (business_id, id)
);
create index conversations_recent_idx on public.conversations (business_id, last_message_at desc);
create index conversations_started_idx on public.conversations (business_id, started_at);

create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null,
  conversation_id uuid not null,
  at              timestamptz not null default now(),
  kind            text not null check (kind in ('customer', 'talaqa', 'staff', 'event')),
  body            text,
  lang            text check (lang in ('ar', 'en')),
  member_id       uuid,
  -- Something Talaqa (or the team) did, shown apart from what was said.
  event           text check (event in ('found', 'checked', 'answered', 'rule', 'booked', 'rescheduled', 'cancelled', 'handover', 'takeover')),
  event_text_ar   text,
  event_text_en   text,
  foreign key (business_id, conversation_id) references public.conversations (business_id, id) on delete cascade,
  foreign key (business_id, member_id) references public.members (business_id, id),
  check ((kind = 'event') = (event is not null)),
  check (kind = 'event' or (body is not null and lang is not null)),
  check ((kind = 'staff') = (member_id is not null))
);
create index messages_conversation_idx on public.messages (conversation_id, at);

create type public.appointment_status as enum ('confirmed', 'completed', 'cancelled', 'no_show');

create table public.appointments (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references public.businesses (id) on delete cascade,
  branch_id       uuid not null,
  customer_id     uuid not null,
  service_id      uuid not null,
  staff_id        uuid not null,
  starts_at       timestamptz not null,
  duration_min    integer not null check (duration_min > 0),
  status          public.appointment_status not null default 'confirmed',
  booked_by       text not null default 'team' check (booked_by in ('talaqa', 'team')),
  conversation_id uuid,
  created_at      timestamptz not null default now(),
  unique (business_id, id),
  foreign key (business_id, branch_id) references public.branches (business_id, id),
  foreign key (business_id, customer_id) references public.customers (business_id, id),
  foreign key (business_id, service_id) references public.services (business_id, id),
  foreign key (business_id, staff_id) references public.members (business_id, id),
  foreign key (business_id, conversation_id) references public.conversations (business_id, id) on delete set null (conversation_id)
);
create index appointments_time_idx on public.appointments (business_id, starts_at);

alter table public.conversations
  add foreign key (business_id, appointment_id) references public.appointments (business_id, id) on delete set null (appointment_id);

-- ---------------------------------------------------------------------------
-- Who may see what
-- ---------------------------------------------------------------------------

create schema if not exists private;

-- The businesses the signed-in user belongs to.
create function private.member_business_ids()
returns setof uuid
language sql stable security definer set search_path = ''
as $$
  select business_id from public.members where user_id = (select auth.uid())
$$;

-- Whether the signed-in user may see a branch of a business.
create function private.can_see_branch(p_business uuid, p_branch uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.members m
    where m.user_id = (select auth.uid())
      and m.business_id = p_business
      and (m.branch_ids is null or p_branch = any (m.branch_ids))
  )
$$;

revoke all on all functions in schema private from public;
grant usage on schema private to authenticated;
grant execute on all functions in schema private to authenticated;

-- Signed-out visitors (the anon role) get nothing at all.
revoke all on all tables in schema public from anon;

alter table public.businesses    enable row level security;
alter table public.branches      enable row level security;
alter table public.members       enable row level security;
alter table public.services      enable row level security;
alter table public.customers     enable row level security;
alter table public.conversations enable row level security;
alter table public.messages      enable row level security;
alter table public.appointments  enable row level security;

create policy "members read their business" on public.businesses
  for select to authenticated using (id in (select private.member_business_ids()));

create policy "members read their branches" on public.branches
  for select to authenticated using (private.can_see_branch(business_id, id));

create policy "members read their team" on public.members
  for select to authenticated using (business_id in (select private.member_business_ids()));

create policy "members read services" on public.services
  for select to authenticated using (business_id in (select private.member_business_ids()));

create policy "members read customers" on public.customers
  for select to authenticated using (business_id in (select private.member_business_ids()));

create policy "members read conversations of their branches" on public.conversations
  for select to authenticated using (private.can_see_branch(business_id, branch_id));

-- A message is visible when its conversation is (the conversations policy applies inside this check).
create policy "members read messages of visible conversations" on public.messages
  for select to authenticated using (exists (select 1 from public.conversations c where c.id = conversation_id));

create policy "members read appointments of their branches" on public.appointments
  for select to authenticated using (private.can_see_branch(business_id, branch_id));
