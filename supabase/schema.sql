-- Lizland Cakes: run this whole file once in Supabase > SQL Editor > New query

create table if not exists public.categories (
  id bigint generated always as identity primary key,
  name text unique not null,
  sort int not null default 0
);

create table if not exists public.cakes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  description text,
  image_url text,
  published boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('order','custom','training','contact')),
  name text,
  phone text,
  message text not null,
  status text not null default 'new' check (status in ('new','contacted','confirmed','done','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = public as
$$ select exists (select 1 from public.admins where user_id = auth.uid()) $$;

alter table public.categories enable row level security;
alter table public.cakes enable row level security;
alter table public.enquiries enable row level security;
alter table public.admins enable row level security;

-- public can read categories and published cakes
create policy "categories read" on public.categories for select using (true);
create policy "categories admin write" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "cakes read" on public.cakes for select using (published or public.is_admin());
create policy "cakes admin write" on public.cakes for all using (public.is_admin()) with check (public.is_admin());
-- enquiries: ONLY admins can read or change. The server inserts them with the service key.
create policy "enquiries admin all" on public.enquiries for all using (public.is_admin()) with check (public.is_admin());
create policy "admins read own" on public.admins for select using (user_id = auth.uid());

-- photo storage
insert into storage.buckets (id, name, public) values ('cake-photos','cake-photos', true) on conflict (id) do nothing;
create policy "photos public read" on storage.objects for select using (bucket_id = 'cake-photos');
create policy "photos admin insert" on storage.objects for insert with check (bucket_id = 'cake-photos' and public.is_admin());
create policy "photos admin update" on storage.objects for update using (bucket_id = 'cake-photos' and public.is_admin());
create policy "photos admin delete" on storage.objects for delete using (bucket_id = 'cake-photos' and public.is_admin());

insert into public.categories (name, sort) values
 ('Wedding',1),('Birthday',2),('Ruracio',3),('Graduation',4),('Anniversary',5),('Baby Shower',6),('Custom',7),('Cupcakes & Pastries',8)
on conflict (name) do nothing;

-- AFTER creating the owner in Authentication > Users, run this with the owner's email:
-- insert into public.admins (user_id) select id from auth.users where email = 'OWNER-EMAIL-HERE';
