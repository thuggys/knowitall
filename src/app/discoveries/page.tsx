'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Clock, Search, Filter } from 'lucide-react';
import Link from 'next/link';

interface Article {
  id: string;
  title: string;
  brief: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
    image: string;
  };
  readTime: number;
  tags: string[];
}

interface RSSItem {
  guid: string;
  title: string;
  description: string;
  link: string;
  thumbnail?: string;
  enclosure?: {
    link: string;
  };
  pubDate: string;
  author?: string;
  categories?: string[];
}

interface RSSResponse {
  items: RSSItem[];
  status: string;
}

export default function DiscoveriesPage() {
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [category, setCategory] = React.useState('technology');

  const fetchArticles = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        'https://api.rss2json.com/v1/api.json?' + 
        new URLSearchParams({
          rss_url: 'https://dev.to/feed',
          api_key: process.env.NEXT_PUBLIC_RSS2JSON_API_KEY || '',
          count: '20'
        })
      );

      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }

      const data = await response.json() as RSSResponse;
      
      if (data.status !== 'ok') {
        throw new Error('Failed to parse RSS feed');
      }

      const articles = data.items
        .filter(item => item.thumbnail) // Only show articles with images
        .map((item: RSSItem) => ({
          id: item.guid,
          title: item.title,
          brief: item.description.replace(/<[^>]*>/g, '').slice(0, 200) + '...',
          url: item.link,
          image: item.thumbnail || 'https://dev.to/social.png', // Provide default image
          publishedAt: item.pubDate,
          source: {
            name: item.author || 'DEV Community',
            image: 'https://dev.to/favicon.ico'
          },
          readTime: Math.ceil(item.description.split(' ').length / 200),
          tags: item.categories || []
        }));

      // Filter articles based on search query and category
      const filteredArticles = articles.filter(article => {
        const matchesSearch = !searchQuery || 
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.brief.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesCategory = category === 'all' || 
          article.tags.some(tag => tag.toLowerCase().includes(category.toLowerCase()));
        
        return matchesSearch && matchesCategory;
      });
      
      setArticles(filteredArticles);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  }, [category, searchQuery]);

  React.useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h1 className="text-2xl font-semibold">Tech Discoveries</h1>
          </div>
          <p className="text-zinc-400 max-w-2xl">
            Stay updated with the latest tech news, innovations, and breakthroughs from around the world.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search discoveries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-zinc-400" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-zinc-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Filter articles by category"
            >
              <option value="all">All Categories</option>
              <option value="technology">Technology</option>
              <option value="programming">Programming</option>
              <option value="webdev">Web Development</option>
              <option value="ai">AI & ML</option>
              <option value="blockchain">Blockchain</option>
              <option value="devops">DevOps</option>
            </select>
          </div>
        </div>

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
                <Link href={`/discoveries/${encodeURIComponent(article.url)}`}>
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center space-x-2">
                      <img
                        src={article.source.image}
                        alt={article.source.name}
                        className="w-5 h-5 rounded-full"
                      />
                      <p className="text-sm text-white/80">{article.source.name}</p>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <h2 className="text-lg font-semibold line-clamp-2 group-hover:text-purple-500 transition-colors">
                      {article.title}
                    </h2>
                    <p className="text-zinc-400 text-sm line-clamp-2">
                      {article.brief}
                    </p>
                    <div className="flex items-center justify-between text-sm text-zinc-500">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{article.readTime} min read</span>
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
      </motion.div>
    </div>
  );
} 