-- STOK RUMAH - setup realtime multi-user
-- Jalankan SEKALI di Supabase SQL Editor pada project yang sama dengan Dapur Ibu.

create table if not exists public.stokrumah_entities (
  entity_type text not null,
  entity_id text not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid null references auth.users(id) on delete set null,
  primary key (entity_type, entity_id)
);

alter table public.stokrumah_entities enable row level security;

drop policy if exists "stokrumah_authenticated_select" on public.stokrumah_entities;
drop policy if exists "stokrumah_authenticated_insert" on public.stokrumah_entities;
drop policy if exists "stokrumah_authenticated_update" on public.stokrumah_entities;
drop policy if exists "stokrumah_authenticated_delete" on public.stokrumah_entities;

create policy "stokrumah_authenticated_select"
on public.stokrumah_entities for select
to authenticated
using (true);

create policy "stokrumah_authenticated_insert"
on public.stokrumah_entities for insert
to authenticated
with check (true);

create policy "stokrumah_authenticated_update"
on public.stokrumah_entities for update
to authenticated
using (true)
with check (true);

create policy "stokrumah_authenticated_delete"
on public.stokrumah_entities for delete
to authenticated
using (true);

create index if not exists stokrumah_entities_updated_at_idx
on public.stokrumah_entities(updated_at desc);
