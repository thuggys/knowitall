-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  bio text,
  website text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create blogs table
create table public.blogs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  excerpt text,
  cover_image text,
  author_id uuid not null references auth.users(id) on delete cascade,
  tags text[] default array[]::text[],
  status text default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create blog views table
create table public.blog_views (
  id uuid default gen_random_uuid() primary key,
  blog_id uuid not null references public.blogs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_blog_view unique (blog_id, user_id)
);

-- Create blog likes table
create table public.blog_likes (
  id uuid default gen_random_uuid() primary key,
  blog_id uuid not null references public.blogs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_blog_like unique (blog_id, user_id)
);

-- Create blog bookmarks table
create table public.blog_bookmarks (
  id uuid default gen_random_uuid() primary key,
  blog_id uuid not null references public.blogs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_blog_bookmark unique (blog_id, user_id)
);

-- Create blog comments table
create table public.blog_comments (
  id uuid default gen_random_uuid() primary key,
  blog_id uuid not null references public.blogs(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  parent_id uuid references public.blog_comments(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create learning resources table (for your courses)
create table public.learning_resources (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  content text not null,
  cover_image text,
  author_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('course', 'tutorial', 'guide')),
  status text default 'draft' check (status in ('draft', 'published', 'archived')),
  tags text[] default array[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create learning bookmarks table
create table public.learning_bookmarks (
  id uuid default gen_random_uuid() primary key,
  resource_id uuid not null references public.learning_resources(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_learning_bookmark unique (resource_id, user_id)
);

-- Create learning progress table
create table public.learning_progress (
  id uuid default gen_random_uuid() primary key,
  resource_id uuid not null references public.learning_resources(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  progress float default 0 check (progress >= 0 and progress <= 100),
  last_position text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_learning_progress unique (resource_id, user_id)
);

-- Create notifications table
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('blog_like', 'blog_comment', 'blog_bookmark', 'learning_update')),
  title text not null,
  content text not null,
  link text,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.blogs enable row level security;
alter table public.blog_views enable row level security;
alter table public.blog_likes enable row level security;
alter table public.blog_bookmarks enable row level security;
alter table public.blog_comments enable row level security;
alter table public.learning_resources enable row level security;
alter table public.learning_bookmarks enable row level security;
alter table public.learning_progress enable row level security;
alter table public.notifications enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Blogs policies
create policy "Published blogs are viewable by everyone"
  on blogs for select
  using ( status = 'published' or auth.uid() = author_id );

create policy "Users can create blogs"
  on blogs for insert
  with check ( auth.uid() = author_id );

create policy "Users can update own blogs"
  on blogs for update
  using ( auth.uid() = author_id );

create policy "Users can delete own blogs"
  on blogs for delete
  using ( auth.uid() = author_id );

-- Blog views policies
create policy "Users can view all blog views"
  on blog_views for select
  using ( true );

create policy "Users can insert own views"
  on blog_views for insert
  with check ( auth.uid() = user_id );

-- Blog likes policies
create policy "Users can view all blog likes"
  on blog_likes for select
  using ( true );

create policy "Users can insert own likes"
  on blog_likes for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete own likes"
  on blog_likes for delete
  using ( auth.uid() = user_id );

-- Blog bookmarks policies
create policy "Users can view own bookmarks"
  on blog_bookmarks for select
  using ( auth.uid() = user_id );

create policy "Users can insert own bookmarks"
  on blog_bookmarks for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete own bookmarks"
  on blog_bookmarks for delete
  using ( auth.uid() = user_id );

-- Blog comments policies
create policy "Comments are viewable by everyone"
  on blog_comments for select
  using ( true );

create policy "Users can insert own comments"
  on blog_comments for insert
  with check ( auth.uid() = author_id );

create policy "Users can update own comments"
  on blog_comments for update
  using ( auth.uid() = author_id );

create policy "Users can delete own comments"
  on blog_comments for delete
  using ( auth.uid() = author_id );

-- Learning resources policies
create policy "Published learning resources are viewable by everyone"
  on learning_resources for select
  using ( status = 'published' or auth.uid() = author_id );

create policy "Only admins can create learning resources"
  on learning_resources for insert
  with check ( auth.uid() = author_id );

create policy "Only admins can update learning resources"
  on learning_resources for update
  using ( auth.uid() = author_id );

-- Learning bookmarks policies
create policy "Users can view own learning bookmarks"
  on learning_bookmarks for select
  using ( auth.uid() = user_id );

create policy "Users can insert own learning bookmarks"
  on learning_bookmarks for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete own learning bookmarks"
  on learning_bookmarks for delete
  using ( auth.uid() = user_id );

-- Learning progress policies
create policy "Users can view own learning progress"
  on learning_progress for select
  using ( auth.uid() = user_id );

create policy "Users can insert own learning progress"
  on learning_progress for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own learning progress"
  on learning_progress for update
  using ( auth.uid() = user_id );

-- Notifications policies
create policy "Users can view own notifications"
  on notifications for select
  using ( auth.uid() = user_id );

create policy "System can create notifications"
  on notifications for insert
  with check ( true );

create policy "Users can update own notifications"
  on notifications for update
  using ( auth.uid() = user_id );

-- Create indexes
create index blogs_author_id_idx on blogs(author_id);
create index blogs_created_at_idx on blogs(created_at);
create index blogs_status_idx on blogs(status);
create index blog_views_blog_id_idx on blog_views(blog_id);
create index blog_likes_blog_id_idx on blog_likes(blog_id);
create index blog_bookmarks_blog_id_idx on blog_bookmarks(blog_id);
create index blog_bookmarks_user_id_idx on blog_bookmarks(user_id);
create index blog_comments_blog_id_idx on blog_comments(blog_id);
create index blog_comments_author_id_idx on blog_comments(author_id);
create index learning_resources_author_id_idx on learning_resources(author_id);
create index learning_resources_status_idx on learning_resources(status);
create index learning_bookmarks_resource_id_idx on learning_bookmarks(resource_id);
create index learning_bookmarks_user_id_idx on learning_bookmarks(user_id);
create index learning_progress_resource_id_idx on learning_progress(resource_id);
create index learning_progress_user_id_idx on learning_progress(user_id);
create index notifications_user_id_idx on notifications(user_id);
create index notifications_created_at_idx on notifications(created_at);

-- Create helper functions
create or replace function get_blog_view_count(blog_id uuid)
returns bigint
language sql
security definer
as $$
  select count(*) from blog_views where blog_views.blog_id = $1;
$$;

create or replace function get_blog_like_count(blog_id uuid)
returns bigint
language sql
security definer
as $$
  select count(*) from blog_likes where blog_likes.blog_id = $1;
$$;

create or replace function get_blog_bookmark_count(blog_id uuid)
returns bigint
language sql
security definer
as $$
  select count(*) from blog_bookmarks where blog_bookmarks.blog_id = $1;
$$;

create or replace function get_blog_comment_count(blog_id uuid)
returns bigint
language sql
security definer
as $$
  select count(*) from blog_comments where blog_comments.blog_id = $1;
$$;

-- Create notification triggers
create or replace function handle_new_blog_like()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into notifications (user_id, type, title, content, link)
  select 
    blogs.author_id,
    'blog_like',
    'New Like on Your Blog',
    format('%s liked your blog post "%s"', (select username from profiles where id = new.user_id), blogs.title),
    format('/blog/%s', blogs.id)
  from blogs
  where blogs.id = new.blog_id
  and blogs.author_id != new.user_id;
  
  return new;
end;
$$;

create trigger on_blog_like
  after insert on blog_likes
  for each row
  execute function handle_new_blog_like();

create or replace function handle_new_blog_comment()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into notifications (user_id, type, title, content, link)
  select 
    blogs.author_id,
    'blog_comment',
    'New Comment on Your Blog',
    format('%s commented on your blog post "%s"', (select username from profiles where id = new.author_id), blogs.title),
    format('/blog/%s', blogs.id)
  from blogs
  where blogs.id = new.blog_id
  and blogs.author_id != new.author_id;
  
  return new;
end;
$$;

create trigger on_blog_comment
  after insert on blog_comments
  for each row
  execute function handle_new_blog_comment(); 