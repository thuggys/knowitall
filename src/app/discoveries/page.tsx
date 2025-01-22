'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Story {
  id: string;
  title: string;
  url: string;
  score: number;
  by: string;
  time: number;
  descendants: number;
}

interface Article {
  id: string;
  title: string;
  brief: string;
  url: string;
  score: number;
  author: string;
  publishedAt: number;
  commentCount: number;
  image: string;
}

const DEFAULT_IMAGE = 'https://picsum.photos/seed/tech/800/400'; // Fallback image

export default function DiscoveriesPage() {
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  const getImageUrl = async (url: string): Promise<string> => {
    try {
      // Using a free API to fetch Open Graph data
      const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      return data.data?.image?.url || DEFAULT_IMAGE;
    } catch (error) {
      console.error('Error fetching image:', error);
      return DEFAULT_IMAGE;
    }
  };

  const fetchArticles = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch top stories from Hacker News
      const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
      if (!response.ok) {
        throw new Error('Failed to fetch stories');
      }
      
      const storyIds = await response.json();
      const top30StoryIds = storyIds.slice(0, 30);
      
      // Fetch details for each story
      const storyPromises = top30StoryIds.map(async (id: number) => {
        const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        return storyResponse.json();
      });
      
      const stories = await Promise.all(storyPromises);
      
      // Filter and map stories, then fetch images
      const articlesWithoutImages = stories
        .filter((story: Story) => story && story.url)
        .map((story: Story) => ({
          id: story.id.toString(),
          title: story.title,
          brief: `A popular discussion on Hacker News with ${story.descendants || 0} comments and ${story.score} points.`,
          url: story.url,
          score: story.score,
          author: story.by,
          publishedAt: story.time * 1000,
          commentCount: story.descendants || 0,
          image: DEFAULT_IMAGE
        }));

      // Fetch images in parallel
      const articlesWithImages = await Promise.all(
        articlesWithoutImages.map(async (article) => ({
          ...article,
          image: await getImageUrl(article.url)
        }))
      );

      // Filter articles based on search query
      const filteredArticles = articlesWithImages.filter(article => 
        !searchQuery || 
        article.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setArticles(filteredArticles);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  React.useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-purple-900/20 to-zinc-900/20 border-b border-purple-900/20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
          <div className="absolute h-full w-full bg-gradient-to-b from-purple-500/10 to-transparent" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-20 md:py-28">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center space-y-8"
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-6 h-6 text-purple-500" />
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
                    Tech Discoveries
                  </h1>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto"
                >
                  Explore groundbreaking tech discussions, innovations, and insights from the Hacker News community.
                </motion.p>
              </div>

              {/* Search Bar in Hero */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="max-w-xl mx-auto"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search discoveries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-900/50 backdrop-blur-sm border border-purple-500/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex justify-center space-x-8 md:space-x-16 text-zinc-400"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-500">30+</div>
                  <div className="text-sm">Daily Stories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-500">Real-time</div>
                  <div className="text-sm">Updates</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-500">Global</div>
                  <div className="text-sm">Community</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Articles Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-zinc-900 rounded-xl overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-zinc-800" />
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-zinc-800 rounded w-3/4" />
                  <div className="h-4 bg-zinc-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <button
              onClick={fetchArticles}
              className="mt-4 px-6 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-zinc-900 rounded-xl overflow-hidden group"
              >
                <Link href={article.url} target="_blank" rel="noopener noreferrer">
                  <div className="relative h-48">
                    <Image
                      src={article.image}
                      alt={`Featured image for article: ${article.title}`}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6 space-y-4">
                    <h2 className="text-lg font-semibold group-hover:text-purple-500 transition-colors">
                      {article.title}
                    </h2>
                    <div className="flex items-center space-x-4 text-sm text-zinc-400">
                      <span>{article.score} points</span>
                      <span>by {article.author}</span>
                      <span>{article.commentCount} comments</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-zinc-500">
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center space-x-1 text-purple-500">
                        <span>Read more</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 