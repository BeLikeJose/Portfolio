-- Be like José — proposals
-- Run once in Supabase → SQL editor. Replace the admin email below with yours.

create extension if not exists pgcrypto;

create table if not exists public.proposals (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null default encode(gen_random_bytes(9), 'hex'),
  client        text not null,
  title         text,
  diagnosis     text,
  concept       text,
  cover_url     text,
  deliverables  jsonb not null default '[]'::jsonb,   -- [{ "item": "...", "when": "mes 1" }]
  pricing       jsonb not null default '[]'::jsonb,   -- [{ "name": "...", "price": "$...", "note": "..." }]
  media         jsonb not null default '[]'::jsonb,   -- [{ "type": "video|image|pdf", "url": "..." }]
  calendly_url  text,
  status        text not null default 'draft' check (status in ('draft', 'sent', 'viewed')),
  views         int  not null default 0,
  last_viewed_at timestamptz,
  expires_at    timestamptz,
  created_at    timestamptz not null default now()
);

alter table public.proposals enable row level security;

-- Only the site owner (signed in with this email) can list, create, edit or delete proposals.
create or replace function public.is_admin() returns boolean
language sql stable as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'TU_EMAIL_DE_ADMIN@ejemplo.com'
$$;

drop policy if exists "admin full access" on public.proposals;
create policy "admin full access" on public.proposals
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Clients never touch the table. They can only fetch ONE proposal by its secret slug,
-- through this function, which also counts the view. Nothing can be listed.
create or replace function public.get_proposal(p_slug text)
returns setof public.proposals
language plpgsql security definer set search_path = public as $$
begin
  update public.proposals
     set views = views + 1,
         last_viewed_at = now(),
         status = case when status = 'sent' then 'viewed' else status end
   where slug = p_slug and status <> 'draft' and (expires_at is null or expires_at > now());
  return query
    select * from public.proposals
     where slug = p_slug and status <> 'draft' and (expires_at is null or expires_at > now());
end $$;

revoke all on function public.get_proposal(text) from public;
grant execute on function public.get_proposal(text) to anon, authenticated;

-- Private bucket for proposal files (PDFs, videos, images).
insert into storage.buckets (id, name, public) values ('proposals', 'proposals', false)
  on conflict (id) do nothing;
drop policy if exists "admin manages proposal files" on storage.objects;
create policy "admin manages proposal files" on storage.objects
  for all to authenticated using (bucket_id = 'proposals' and public.is_admin())
  with check (bucket_id = 'proposals' and public.is_admin());
