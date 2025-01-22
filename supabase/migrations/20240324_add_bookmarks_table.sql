-- Create bookmarks table for general resources
create table public.bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  url text not null,
  category text,
  type text,
  tags text[] default array[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_user_bookmark unique (user_id, url)
);

-- Enable Row Level Security
alter table public.bookmarks enable row level security;

-- Bookmarks policies
create policy "Users can view own bookmarks"
  on bookmarks for select
  using ( auth.uid() = user_id );

create policy "Users can insert own bookmarks"
  on bookmarks for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete own bookmarks"
  on bookmarks for delete
  using ( auth.uid() = user_id );

-- Create indexes
create index bookmarks_user_id_idx on bookmarks(user_id);
create index bookmarks_url_idx on bookmarks(url); 