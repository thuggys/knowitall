'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Bookmark, Heart, Hash, Search, Plus, TrendingUp, Clock, Filter } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
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
    views: number;
    likes: number;
    bookmarks: number;
  };
}

interface User {
  id: string;
  email?: string;
  user_metadata: {
    avatar_url?: string;
    full_name?: string;
    user_name?: string;
  };
}

export default function BlogPage() {
  const supabase = createClientComponentClient();
  const [posts, setPosts] = React.useState<BlogPost[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedTag, setSelectedTag] = React.useState<string | null>(null);
  const [sortBy, setSortBy] = React.useState<'latest' | 'popular'>('latest');
  const [user, setUser] = React.useState<User | null>(null);

  // Fetch user and posts
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get current user
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        setUser(currentUser);

        // Fetch posts with author info and counts
        let query = supabase
          .from('blogs')
          .select(`
            *,
            author:profiles!blogs_author_id_fkey (
              id,
              username,
              avatar_url
            ),
            views (count),
            likes (count),
            bookmarks (count)
          `)
          .order(sortBy === 'latest' ? 'created_at' : 'views.count', { ascending: false });

        // Apply search filter if exists
        if (searchQuery) {
          query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
        }

        // Apply tag filter if exists
        if (selectedTag) {
          query = query.contains('tags', [selectedTag]);
        }

        const { data, error: postsError } = await query;
        
        if (postsError) {
          console.error('Posts fetch error:', postsError);
          throw postsError;
        }

        if (!data) {
          console.log('No posts found');
          setPosts([]);
          return;
        }

        // Transform the data to match our BlogPost interface
        const transformedPosts: BlogPost[] = data.map(post => ({
          id: post.id,
          title: post.title,
          excerpt: post.excerpt || '',
          cover_image: post.cover_image || '',
          author_id: post.author_id,
          tags: post.tags || [],
          created_at: post.created_at,
          author: {
            id: post.author?.id || post.author_id,
            username: post.author?.username || 'Unknown',
            avatar_url: post.author?.avatar_url || '/default-avatar.png',
          },
          _count: {
            views: post.views?.[0]?.count || 0,
            likes: post.likes?.[0]?.count || 0,
            bookmarks: post.bookmarks?.[0]?.count || 0
          }
        }));

        setPosts(transformedPosts);
      } catch (error) {
        console.error('Error details:', error);
        setError(error instanceof Error ? error.message : 'Failed to load blog posts');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase, searchQuery, selectedTag, sortBy]);

  // Get unique tags from all posts
  const allTags = React.useMemo(() => {
    const tags = new Set<string>();
    posts.forEach(post => post.tags?.forEach(tag => tags.add(tag)));
    return Array.from(tags);
  }, [posts]);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Blog Posts</h1>
            <p className="text-zinc-400">Share your thoughts and ideas with the community</p>
          </div>
          {user && (
            <Link
              href="/blog/new"
              className="inline-flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Write a Post</span>
            </Link>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-zinc-400" />
            <select
              value={selectedTag || ''}
              onChange={(e) => setSelectedTag(e.target.value || null)}
              className="bg-zinc-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Filter posts by tag"
            >
              <option value="">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSortBy('latest')}
              className={`inline-flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                sortBy === 'latest' 
                  ? 'bg-purple-500 text-white' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Latest</span>
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`inline-flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                sortBy === 'popular' 
                  ? 'bg-purple-500 text-white' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Popular</span>
            </button>
          </div>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-zinc-900 rounded-xl p-6 space-y-4 animate-pulse"
              >
                <div className="h-4 bg-zinc-800 rounded w-3/4" />
                <div className="h-4 bg-zinc-800 rounded w-1/2" />
                <div className="h-4 bg-zinc-800 rounded w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-zinc-400">
            <p>No blog posts found</p>
            {user && (
              <Link
                href="/blog/new"
                className="inline-flex items-center space-x-2 text-purple-500 hover:text-purple-400 mt-4"
              >
                <Plus className="w-4 h-4" />
                <span>Write your first post</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900 rounded-xl overflow-hidden group"
              >
                <Link href={`/blog/${post.id}`}>
                  {post.cover_image && (
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={post.cover_image}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  )}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="relative w-6 h-6">
                        <Image
                          src={post.author.avatar_url || '/default-avatar.png'}
                          alt={post.author.username}
                          fill
                          className="rounded-full object-cover"
                        />
                      </div>
                      <span className="text-sm text-zinc-400">{post.author.username}</span>
                    </div>
                    <h2 className="text-xl font-semibold group-hover:text-purple-500 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-zinc-400 line-clamp-2">{post.excerpt}</p>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center space-x-1 px-2 py-1 bg-zinc-800 rounded-full text-xs text-zinc-400"
                        >
                          <Hash className="w-3 h-3" />
                          <span>{tag}</span>
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-zinc-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Heart className="w-4 h-4" />
                          <span>{post._count.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Bookmark className="w-4 h-4" />
                          <span>{post._count.bookmarks}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}