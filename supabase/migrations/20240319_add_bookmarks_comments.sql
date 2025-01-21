-- Create bookmarks table
create table if not exists bookmarks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  blog_id uuid references blogs(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, blog_id)
);

-- Create comments table
create table if not exists comments (
  id uuid primary key default uuid_generate_v4(),
  content text not null,
  user_id uuid references profiles(id) on delete cascade not null,
  blog_id uuid references blogs(id) on delete cascade not null,
  parent_id uuid references comments(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create function to toggle bookmark
create or replace function toggle_bookmark(blog_id_input uuid, user_id_input uuid)
returns boolean
language plpgsql
security definer
as $$
declare
  bookmark_exists boolean;
begin
  select exists(
    select 1 from bookmarks
    where blog_id = blog_id_input and user_id = user_id_input
  ) into bookmark_exists;

  if bookmark_exists then
    delete from bookmarks
    where blog_id = blog_id_input and user_id = user_id_input;
    return false;
  else
    insert into bookmarks (blog_id, user_id)
    values (blog_id_input, user_id_input);
    return true;
  end if;
end;
$$;

-- Add RLS policies
alter table bookmarks enable row level security;
alter table comments enable row level security;

-- Bookmark policies
create policy "Users can view all bookmarks"
  on bookmarks for select
  to authenticated
  using (true);

create policy "Users can manage their own bookmarks"
  on bookmarks for all
  to authenticated
  using (user_id = auth.uid());

-- Comment policies
create policy "Anyone can view comments"
  on comments for select
  to authenticated, anon
  using (true);

create policy "Users can create comments"
  on comments for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own comments"
  on comments for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own comments"
  on comments for delete
  to authenticated
  using (auth.uid() = user_id); 