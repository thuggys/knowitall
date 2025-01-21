-- Create function to increment view count
create or replace function increment_view_count(post_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update blogs
  set view_count = coalesce(view_count, 0) + 1
  where id = post_id;
end;
$$; 