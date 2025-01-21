'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Bookmark, Hash, ArrowLeft, Heart } from 'lucide-react';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';

interface Database {
  public: {
    Tables: {
      blogs: {
        Row: {
          id: string;
          title: string;
          content: string;
          cover_image: string | null;
          author_id: string;
          tags: string[];
          created_at: string;
          author: {
            id: string;
            username: string;
            avatar_url: string;
          };
          likes: { count: number }[];
          bookmarks: { count: number }[];
          is_bookmarked?: boolean;
          is_liked?: boolean;
        };
      };
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string;
        };
      };
    };
  };
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
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

  // Fetch user
  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!error && user) {
        setUser(user);
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
          .select(`
            *,
            author:profiles!blogs_author_id_fkey (
              id,
              username,
              avatar_url
            ),
            bookmarks (count)
          `)
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

        postData = basicPost;

        // If user is logged in, check if they've bookmarked and liked the post
        if (userData.user) {
          // Check bookmarks
          const { data: bookmarkData } = await supabase
            .from('bookmarks')
            .select('id')
            .eq('blog_id', params.id)
            .eq('user_id', userData.user.id)
            .single();

          // Check likes - handle case where table might not exist yet
          let likeData = null;
          try {
            const { data } = await supabase
              .from('likes')
              .select('id')
              .eq('blog_id', params.id)
              .eq('user_id', userData.user.id)
              .single();
            likeData = data;
          } catch (error) {
            console.log('Error checking likes (table might not exist yet):', error);
          }

          postData = {
            ...basicPost,
            is_bookmarked: !!bookmarkData,
            is_liked: !!likeData
          };
        }

        // Get likes count - handle case where table might not exist yet
        let likesCount = 0;
        try {
          const { count } = await supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('blog_id', params.id);
          likesCount = count || 0;
        } catch (error) {
          console.log('Error getting likes count (table might not exist yet):', error);
        }

        console.log('Post data:', postData);

        // Transform the data
        const rawPost = postData as unknown as Database['public']['Tables']['blogs']['Row'];
        const transformedPost: BlogPost = {
          id: rawPost.id,
          title: rawPost.title,
          content: rawPost.content,
          cover_image: rawPost.cover_image || '',
          author_id: rawPost.author_id,
          tags: rawPost.tags || [],
          created_at: rawPost.created_at,
          author: {
            id: rawPost.author?.id || rawPost.author_id,
            username: rawPost.author?.username || 'Unknown',
            avatar_url: rawPost.author?.avatar_url || '/default-avatar.png'
          },
          _count: {
            likes: likesCount,
            bookmarks: rawPost.bookmarks?.[0]?.count || 0
          },
          is_bookmarked: !!rawPost.is_bookmarked,
          is_liked: !!rawPost.is_liked
        };

        console.log('Transformed post:', transformedPost);
        setPost(transformedPost);
      } catch (error) {
        console.error('Error details:', error);
        if (error instanceof Error) {
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
          if (typeof error === 'object' && error !== null) {
            const err = error as { code?: string; details?: string; hint?: string };
            if (err.code) {
              console.error('Error code:', err.code);
            }
            if (err.details) {
              console.error('Error details:', err.details);
            }
            if (err.hint) {
              console.error('Error hint:', err.hint);
            }
          }
        }
        setError(error instanceof Error ? error.message : 'Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [supabase, params.id, router]);

  const handleToggleBookmark = async () => {
    if (!user || !post) return;

    try {
      const { data: isBookmarked, error } = await supabase.rpc('toggle_bookmark', {
        blog_id_input: post.id,
        user_id_input: user.id
      });

      if (error) throw error;

      setPost(prev => {
        if (!prev) return null;
        return {
          ...prev,
          is_bookmarked: isBookmarked,
          _count: {
            ...prev._count,
            bookmarks: prev._count.bookmarks + (isBookmarked ? 1 : -1)
          }
        };
      });
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleToggleLike = async () => {
    if (!user || !post) return;

    try {
      const { data: isLiked, error } = await supabase.rpc('toggle_like', {
        blog_id_input: post.id,
        user_id_input: user.id
      });

      if (error) throw error;

      setPost(prev => {
        if (!prev) return null;
        return {
          ...prev,
          is_liked: isLiked,
          _count: {
            ...prev._count,
            likes: prev._count.likes + (isLiked ? 1 : -1)
          }
        };
      });
    } catch (error) {
      console.error('Error toggling like:', error);
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
                    onClick={handleToggleLike}
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
                    onClick={handleToggleBookmark}
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