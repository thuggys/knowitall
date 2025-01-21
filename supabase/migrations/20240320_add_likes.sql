-- Create likes table
create table if not exists likes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  blog_id uuid references blogs(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, blog_id)
);

-- Create function to toggle like
create or replace function toggle_like(blog_id_input uuid, user_id_input uuid)
returns boolean
language plpgsql
security definer
as $$
declare
  like_exists boolean;
begin
  select exists(
    select 1 from likes
    where blog_id = blog_id_input and user_id = user_id_input
  ) into like_exists;

  if like_exists then
    delete from likes
    where blog_id = blog_id_input and user_id = user_id_input;
    return false;
  else
    insert into likes (blog_id, user_id)
    values (blog_id_input, user_id_input);
    return true;
  end if;
end;
$$;

-- Add RLS policies
alter table likes enable row level security;

-- Like policies
create policy "Users can view all likes"
  on likes for select
  to authenticated, anon
  using (true);

create policy "Users can manage their own likes"
  on likes for all
  to authenticated
  using (user_id = auth.uid()); 