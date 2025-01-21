-- Drop existing realtime publication memberships
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.blogs;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.comments;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.views;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.bookmarks;

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS handle_blogs_updated_at ON public.blogs;
DROP TRIGGER IF EXISTS handle_comments_updated_at ON public.comments;
DROP TRIGGER IF EXISTS handle_view_count ON public.views;
DROP FUNCTION IF EXISTS public.handle_updated_at();
DROP FUNCTION IF EXISTS public.increment_blog_view_count();

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Blogs are viewable by everyone" ON public.blogs;
DROP POLICY IF EXISTS "Users can insert their own blogs" ON public.blogs;
DROP POLICY IF EXISTS "Users can update their own blogs" ON public.blogs;
DROP POLICY IF EXISTS "Users can delete their own blogs" ON public.blogs;
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;
DROP POLICY IF EXISTS "Views are viewable by everyone" ON public.views;
DROP POLICY IF EXISTS "Authenticated users can insert views" ON public.views;
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can insert their own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Authenticated users can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Blog images are publicly accessible" ON storage.objects;


-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('blog-images', 'blog-images', true),
  ('blog-covers', 'blog-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create storage policy to allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload blog images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id IN ('blog-images', 'blog-covers') AND
  auth.uid() = owner
);

-- Create storage policy to allow public access to blog images
CREATE POLICY "Blog images are publicly accessible"
ON storage.objects FOR SELECT TO public
USING (bucket_id IN ('blog-images', 'blog-covers'));

-- Create blogs table
CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    cover_image TEXT,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tags TEXT[] DEFAULT '{}',
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    blog_id UUID NOT NULL REFERENCES public.blogs(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE, -- For nested comments
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create views table
CREATE TABLE IF NOT EXISTS public.views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    blog_id UUID NOT NULL REFERENCES public.blogs(id) ON DELETE CASCADE,
    viewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(blog_id, viewer_id) -- Ensure unique views per user per blog
);

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    blog_id UUID NOT NULL REFERENCES public.blogs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(blog_id, user_id) -- Ensure unique bookmarks per user per blog
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Blogs policies
CREATE POLICY "Blogs are viewable by everyone" ON public.blogs
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own blogs" ON public.blogs
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own blogs" ON public.blogs
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own blogs" ON public.blogs
    FOR DELETE USING (auth.uid() = author_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON public.comments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert comments" ON public.comments
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own comments" ON public.comments
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments" ON public.comments
    FOR DELETE USING (auth.uid() = author_id);

-- Views policies
CREATE POLICY "Views are viewable by everyone" ON public.views
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert views" ON public.views
    FOR INSERT WITH CHECK (auth.uid() = viewer_id);

-- Bookmarks policies
CREATE POLICY "Users can view their own bookmarks" ON public.bookmarks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks" ON public.bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" ON public.bookmarks
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER handle_blogs_updated_at
    BEFORE UPDATE ON public.blogs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_comments_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create function to increment view count
CREATE OR REPLACE FUNCTION public.increment_blog_view_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.blogs
    SET view_count = view_count + 1
    WHERE id = NEW.blog_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for view count
CREATE TRIGGER handle_view_count
    AFTER INSERT ON public.views
    FOR EACH ROW
    EXECUTE FUNCTION public.increment_blog_view_count();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS blogs_author_id_idx ON public.blogs(author_id);
CREATE INDEX IF NOT EXISTS blogs_created_at_idx ON public.blogs(created_at);
CREATE INDEX IF NOT EXISTS blogs_tags_idx ON public.blogs USING GIN(tags);
CREATE INDEX IF NOT EXISTS comments_blog_id_idx ON public.comments(blog_id);
CREATE INDEX IF NOT EXISTS comments_author_id_idx ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS views_blog_id_idx ON public.views(blog_id);
CREATE INDEX IF NOT EXISTS bookmarks_user_id_idx ON public.bookmarks(user_id);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.blogs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.views;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookmarks; 