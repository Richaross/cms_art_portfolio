-- 1. Create 'about_info' table (Single Row)
create table public.about_info (
  id integer primary key default 1, -- Force single row
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  description text,
  portrait_url text,
  constraint single_row check (id = 1)
);

-- 2. Create 'news_posts' table
create table public.news_posts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  content text,
  image_url text,
  is_published boolean default true,
  published_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Enable RLS
alter table public.about_info enable row level security;
alter table public.news_posts enable row level security;

-- 4. Policies

-- Public Read Access
create policy "Allow Public Read Access About"
on public.about_info for select
to anon
using (true);

create policy "Allow Public Read Access News"
on public.news_posts for select
to anon
using (true);

-- Authenticated Full Access (Insert/Update/Delete)
create policy "Allow Auth Full Access About"
on public.about_info for all
to authenticated
using (true)
with check (true);

create policy "Allow Auth Full Access News"
on public.news_posts for all
to authenticated
using (true)
with check (true);

-- 5. Insert initial empty row for About (so Update works immediately)
insert into public.about_info (id, description, portrait_url)
values (1, 'Welcome to the world of JoyArt.', null)
on conflict (id) do nothing;
