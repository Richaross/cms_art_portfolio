-- 1. Create the 'sections' table
create table public.sections (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  img_url text,
  bg_color text,
  description text,
  title text,
  order_rank integer default 0
);

-- 2. Create the 'inventory' table
create table public.inventory (
  section_id uuid references public.sections(id) on delete cascade primary key,
  stock_qty integer default 0,
  price numeric,
  stripe_link text,
  is_sale_active boolean default false
);

-- 3. Enable Grid/Scroll Toggle for the whole site? 
-- (Actually, the plan says "Auto-Detect" + "Toggle", so this might be local state, 
-- but if we want it global or user-configurable per visit, local storage is enough.
-- No DB needed for the toggle itself.)

-- 4. Row Level Security (RLS) - "The Security Guards"
-- Enable RLS
alter table public.sections enable row level security;
alter table public.inventory enable row level security;

-- Policy 1: Everyone can SEE (Select) the art.
create policy "Allow Public Read Access"
on public.sections for select
to anon
using (true);

create policy "Allow Public Read Access Inventory"
on public.inventory for select
to anon
using (true);

-- Policy 2: Only YOU (authenticated users) can EDIT (Insert/Update/Delete).
-- Since you are using simple email/password auth for yourself, we check for 'authenticated' role.
create policy "Allow Authenticated Full Access Sections"
on public.sections for all
to authenticated
using (true)
with check (true);

create policy "Allow Authenticated Full Access Inventory"
on public.inventory for all
to authenticated
using (true)
with check (true);

-- 5. Storage Buckets (for Cloudinary we might not need this, but if using Supabase Storage:)
-- insert into storage.buckets (id, name, public) values ('images', 'images', true);
