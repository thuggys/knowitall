'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useParams, useRouter } from 'next/navigation';
import { Bookmark, Hash, ArrowLeft, Heart } from 'lucide-react';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import SignInModal from '@/components/SignInModal';
import Image from 'next/image';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  cover_image: string;
  author_id: string;
  tags: string[];
  created_at: string;
  author: {
    id: string;
    username: string;
    avatar_url: string;
  };
  _count: {
    likes: number;
    bookmarks: number;
    views: number;
  };
  is_bookmarked?: boolean;
  is_liked?: boolean;
}

export default function BlogPostPage() {
  const supabase = createClientComponentClient();
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = React.useState<BlogPost | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<User | null>(null);
  const [isSignInModalOpen, setIsSignInModalOpen] = React.useState(false);

  // Fetch user
  React.useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        setUser(user);
      } catch (err) {
        console.error('Error getting user:', err);
      }
    };

    getUser();
  }, [supabase]);

  // Fetch post
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch post with author info, counts, and bookmark status
        const { data: userData } = await supabase.auth.getUser();
        let postData = null;

        console.log('Fetching post with ID:', params.id);
        console.log('Current user:', userData?.user?.id);

        // First, fetch the basic post data
        const { data: basicPost, error: basicPostError } = await supabase
          .from('blogs')
          .select('*')
          .eq('id', params.id)
          .single();

        console.log('Basic post query result:', { data: basicPost, error: basicPostError });

        if (basicPostError) {
          console.error('Error fetching basic post:', basicPostError);
          throw basicPostError;
        }

        if (!basicPost) {
          console.log('Post not found, redirecting to blog page');
          router.push('/blog');
          return;
        }

        // Fetch author profile
        const { data: authorProfile, error: authorError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .eq('id', basicPost.author_id)
          .single();

        if (authorError) {
          console.error('Error fetching author profile:', authorError);
          throw authorError;
        }

        // Count views, likes, and bookmarks
        const [viewsCount, likesCount, bookmarksCount] = await Promise.all([
          supabase.from('blog_views').select('id', { count: 'exact' }).eq('blog_id', params.id),
          supabase.from('blog_likes').select('id', { count: 'exact' }).eq('blog_id', params.id),
          supabase.from('blog_bookmarks').select('id', { count: 'exact' }).eq('blog_id', params.id)
        ]);

        postData = {
          ...basicPost,
          author: {
            id: authorProfile.id,
            username: authorProfile.username || 'Unknown',
            avatar_url: authorProfile.avatar_url || '/default-avatar.png'
          },
          _count: {
            views: viewsCount.count || 0,
            likes: likesCount.count || 0,
            bookmarks: bookmarksCount.count || 0
          }
        };

        // If user is logged in, check if they've bookmarked and liked the post
        if (userData.user) {
          // Check bookmarks
          const { data: bookmarkData } = await supabase
            .from('blog_bookmarks')
            .select('id')
            .eq('blog_id', params.id)
            .eq('user_id', userData.user.id)
            .single();

          // Check likes
          const { data: likeData } = await supabase
            .from('blog_likes')
            .select('id')
            .eq('blog_id', params.id)
            .eq('user_id', userData.user.id)
            .single();

          postData = {
            ...postData,
            is_bookmarked: !!bookmarkData,
            is_liked: !!likeData
          };
        }

        console.log('Post data:', postData);
        setPost(postData as BlogPost);
      } catch (error) {
        console.error('Error details:', error);
        setError(error instanceof Error ? error.message : 'Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase, params.id, router, user]);

  const handleLike = async () => {
    if (!user || !post) {
      setIsSignInModalOpen(true);
      return;
    }

    try {
      if (post.is_liked) {
        // Remove like
        await supabase
          .from('blog_likes')
          .delete()
          .eq('blog_id', post.id)
          .eq('user_id', user.id);
      } else {
        // Add like
        await supabase
          .from('blog_likes')
          .insert({
            blog_id: post.id,
            user_id: user.id
          });
      }

      // Refetch post data
      const fetchData = async () => {
        try {
          setLoading(true);
          setError(null);

          // Fetch post with author info, counts, and bookmark status
          const { data: userData } = await supabase.auth.getUser();
          let postData = null;

          console.log('Fetching post with ID:', params.id);
          console.log('Current user:', userData?.user?.id);

          // First, fetch the basic post data
          const { data: basicPost, error: basicPostError } = await supabase
            .from('blogs')
            .select('*')
            .eq('id', params.id)
            .single();

          console.log('Basic post query result:', { data: basicPost, error: basicPostError });

          if (basicPostError) {
            console.error('Error fetching basic post:', basicPostError);
            throw basicPostError;
          }

          if (!basicPost) {
            console.log('Post not found, redirecting to blog page');
            router.push('/blog');
            return;
          }

          // Fetch author profile
          const { data: authorProfile, error: authorError } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .eq('id', basicPost.author_id)
            .single();

          if (authorError) {
            console.error('Error fetching author profile:', authorError);
            throw authorError;
          }

          // Count views, likes, and bookmarks
          const [viewsCount, likesCount, bookmarksCount] = await Promise.all([
            supabase.from('blog_views').select('id', { count: 'exact' }).eq('blog_id', params.id),
            supabase.from('blog_likes').select('id', { count: 'exact' }).eq('blog_id', params.id),
            supabase.from('blog_bookmarks').select('id', { count: 'exact' }).eq('blog_id', params.id)
          ]);

          postData = {
            ...basicPost,
            author: {
              id: authorProfile.id,
              username: authorProfile.username || 'Unknown',
              avatar_url: authorProfile.avatar_url || '/default-avatar.png'
            },
            _count: {
              views: viewsCount.count || 0,
              likes: likesCount.count || 0,
              bookmarks: bookmarksCount.count || 0
            }
          };

          // If user is logged in, check if they've bookmarked and liked the post
          if (userData.user) {
            // Check bookmarks
            const { data: bookmarkData } = await supabase
              .from('blog_bookmarks')
              .select('id')
              .eq('blog_id', params.id)
              .eq('user_id', userData.user.id)
              .single();

            // Check likes
            const { data: likeData } = await supabase
              .from('blog_likes')
              .select('id')
              .eq('blog_id', params.id)
              .eq('user_id', userData.user.id)
              .single();

            postData = {
              ...postData,
              is_bookmarked: !!bookmarkData,
              is_liked: !!likeData
            };
          }

          console.log('Post data:', postData);
          setPost(postData as BlogPost);
        } catch (error) {
          console.error('Error details:', {
            error,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            name: error instanceof Error ? error.name : undefined
          });
          setError(error instanceof Error ? error.message : 'Failed to load blog post');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleBookmark = async () => {
    if (!user || !post) {
      setIsSignInModalOpen(true);
      return;
    }

    try {
      if (post.is_bookmarked) {
        // Remove bookmark
        await supabase
          .from('blog_bookmarks')
          .delete()
          .eq('blog_id', post.id)
          .eq('user_id', user.id);
      } else {
        // Add bookmark
        await supabase
          .from('blog_bookmarks')
          .insert({
            blog_id: post.id,
            user_id: user.id
          });
      }

      // Refetch post data
      const fetchData = async () => {
        try {
          setLoading(true);
          setError(null);

          // Fetch post with author info, counts, and bookmark status
          const { data: userData } = await supabase.auth.getUser();
          let postData = null;

          console.log('Fetching post with ID:', params.id);
          console.log('Current user:', userData?.user?.id);

          // First, fetch the basic post data
          const { data: basicPost, error: basicPostError } = await supabase
            .from('blogs')
            .select('*')
            .eq('id', params.id)
            .single();

          console.log('Basic post query result:', { data: basicPost, error: basicPostError });

          if (basicPostError) {
            console.error('Error fetching basic post:', basicPostError);
            throw basicPostError;
          }

          if (!basicPost) {
            console.log('Post not found, redirecting to blog page');
            router.push('/blog');
            return;
          }

          // Fetch author profile
          const { data: authorProfile, error: authorError } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .eq('id', basicPost.author_id)
            .single();

          if (authorError) {
            console.error('Error fetching author profile:', authorError);
            throw authorError;
          }

          // Count views, likes, and bookmarks
          const [viewsCount, likesCount, bookmarksCount] = await Promise.all([
            supabase.from('blog_views').select('id', { count: 'exact' }).eq('blog_id', params.id),
            supabase.from('blog_likes').select('id', { count: 'exact' }).eq('blog_id', params.id),
            supabase.from('blog_bookmarks').select('id', { count: 'exact' }).eq('blog_id', params.id)
          ]);

          postData = {
            ...basicPost,
            author: {
              id: authorProfile.id,
              username: authorProfile.username || 'Unknown',
              avatar_url: authorProfile.avatar_url || '/default-avatar.png'
            },
            _count: {
              views: viewsCount.count || 0,
              likes: likesCount.count || 0,
              bookmarks: bookmarksCount.count || 0
            }
          };

          // If user is logged in, check if they've bookmarked and liked the post
          if (userData.user) {
            // Check bookmarks
            const { data: bookmarkData } = await supabase
              .from('blog_bookmarks')
              .select('id')
              .eq('blog_id', params.id)
              .eq('user_id', userData.user.id)
              .single();

            // Check likes
            const { data: likeData } = await supabase
              .from('blog_likes')
              .select('id')
              .eq('blog_id', params.id)
              .eq('user_id', userData.user.id)
              .single();

            postData = {
              ...postData,
              is_bookmarked: !!bookmarkData,
              is_liked: !!likeData
            };
          }

          console.log('Post data:', postData);
          setPost(postData as BlogPost);
        } catch (error) {
          console.error('Error details:', {
            error,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            name: error instanceof Error ? error.name : undefined
          });
          setError(error instanceof Error ? error.message : 'Failed to load blog post');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-zinc-900 rounded-xl" />
            <div className="h-8 bg-zinc-900 rounded w-3/4" />
            <div className="h-4 bg-zinc-900 rounded w-1/4" />
            <div className="space-y-2">
              <div className="h-4 bg-zinc-900 rounded w-full" />
              <div className="h-4 bg-zinc-900 rounded w-full" />
              <div className="h-4 bg-zinc-900 rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <p className="text-red-500">{error || 'Post not found'}</p>
          <Link
            href="/blog"
            className="inline-flex items-center space-x-2 text-purple-500 hover:text-purple-400"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Blog</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <SignInModal isOpen={isSignInModalOpen} onClose={() => setIsSignInModalOpen(false)} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        {/* Back Button */}
        <Link
          href="/blog"
          className="inline-flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Blog</span>
        </Link>

        {/* Cover Image */}
        {post.cover_image && (
          <div className="relative aspect-video rounded-xl overflow-hidden">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Post Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">{post.title}</h1>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="relative w-8 h-8">
                  <Image
                    src={post.author.avatar_url}
                    alt={post.author.username}
                    fill
                    className="rounded-full object-cover"
                    sizes="32px"
                  />
                </div>
                <span className="text-zinc-400">{post.author.username}</span>
              </div>
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-400">
                {new Date(post.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            
            <div className="flex items-center space-x-4 text-zinc-400">
              {user && (
                <>
                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-1 transition-colors ${
                      post.is_liked
                        ? 'text-purple-500 hover:text-purple-400'
                        : 'hover:text-white'
                    }`}
                    title={post.is_liked ? 'Unlike' : 'Like'}
                    aria-label={post.is_liked ? 'Unlike' : 'Like'}
                  >
                    <Heart className={`w-4 h-4 ${post.is_liked ? 'fill-current' : ''}`} />
                    <span>{post._count.likes}</span>
                  </button>
                  <button
                    onClick={handleBookmark}
                    className={`flex items-center space-x-1 transition-colors ${
                      post.is_bookmarked
                        ? 'text-purple-500 hover:text-purple-400'
                        : 'hover:text-white'
                    }`}
                    title={post.is_bookmarked ? 'Remove bookmark' : 'Add bookmark'}
                    aria-label={post.is_bookmarked ? 'Remove bookmark' : 'Add bookmark'}
                  >
                    <Bookmark className={`w-4 h-4 ${post.is_bookmarked ? 'fill-current' : ''}`} />
                    <span>{post._count.bookmarks}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center space-x-1 px-3 py-1 bg-purple-500/10 text-purple-500 rounded-full text-sm"
                >
                  <Hash className="w-3 h-3" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Post Content */}
        <div 
          className="prose prose-invert prose-purple max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </motion.div>
    </div>
  );
}