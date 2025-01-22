'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Share2, ExternalLink, Tag } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

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

export default function ArticlePage() {
  const router = useRouter();
  const params = useParams();
  const [article, setArticle] = React.useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = React.useState<Article[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const decodedUrl = decodeURIComponent(params.url as string);

  const fetchArticle = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        'https://api.rss2json.com/v1/api.json?' + 
        new URLSearchParams({
          rss_url: 'https://dev.to/feed',
          api_key: process.env.NEXT_PUBLIC_RSS2JSON_API_KEY || '',
          count: '50'
        })
      );

      if (!response.ok) {
        throw new Error('Failed to fetch article');
      }

      const data = await response.json() as RSSResponse;
      
      if (data.status !== 'ok') {
        throw new Error('Failed to parse RSS feed');
      }

      const articles = data.items
        .filter(item => item.thumbnail)
        .map((item: RSSItem) => ({
          id: item.guid,
          title: item.title,
          brief: item.description.replace(/<[^>]*>/g, '').slice(0, 200) + '...',
          url: item.link,
          image: item.thumbnail || 'https://dev.to/social.png',
          publishedAt: item.pubDate,
          source: {
            name: item.author || 'DEV Community',
            image: 'https://dev.to/favicon.ico'
          },
          readTime: Math.ceil(item.description.split(' ').length / 200),
          tags: item.categories || []
        }));

      const currentArticle = articles.find(a => a.url === decodedUrl);
      
      if (!currentArticle) {
        throw new Error('Article not found');
      }

      setArticle(currentArticle);

      // Find related articles based on common tags
      const related = articles
        .filter(a => 
          a.url !== decodedUrl && 
          a.tags.some(tag => currentArticle.tags.includes(tag))
        )
        .slice(0, 3);

      setRelatedArticles(related);
    } catch (error) {
      console.error('Error fetching article:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch article');
    } finally {
      setLoading(false);
    }
  }, [decodedUrl]);

  React.useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: article?.title,
        text: article?.brief,
        url: window.location.href
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8 animate-pulse">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="h-8 bg-zinc-800 rounded w-1/4" />
          <div className="h-12 bg-zinc-800 rounded w-3/4" />
          <div className="h-64 bg-zinc-800 rounded" />
          <div className="space-y-4">
            <div className="h-4 bg-zinc-800 rounded w-full" />
            <div className="h-4 bg-zinc-800 rounded w-5/6" />
            <div className="h-4 bg-zinc-800 rounded w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center space-x-2 text-purple-500 hover:text-purple-400"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go back</span>
          </button>
        </div>
      </div>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        {/* Navigation */}
        <nav className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center space-x-2 text-purple-500 hover:text-purple-400"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to discoveries</span>
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center space-x-2 text-zinc-400 hover:text-zinc-300"
            aria-label="Share article"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </nav>

        {/* Article Header */}
        <header className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="relative w-6 h-6">
                <Image
                  src={article.source.image}
                  alt={`${article.source.name} logo`}
                  fill
                  className="rounded-full object-cover"
                  sizes="24px"
                />
              </div>
              <span className="text-sm text-zinc-400">{article.source.name}</span>
            </div>
            <span className="text-zinc-600">•</span>
            <div className="flex items-center space-x-1 text-sm text-zinc-400">
              <Clock className="w-4 h-4" />
              <span>{article.readTime} min read</span>
            </div>
            <span className="text-zinc-600">•</span>
            <span className="text-sm text-zinc-400">{formatDate(article.publishedAt)}</span>
          </div>
          <h1 className="text-3xl font-semibold">{article.title}</h1>
          <p className="text-lg text-zinc-400">{article.brief}</p>
          <div className="flex flex-wrap gap-2">
            {article.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center space-x-1 px-3 py-1 bg-purple-500/10 text-purple-500 rounded-full text-sm"
              >
                <Tag className="w-3 h-3" />
                <span>{tag}</span>
              </span>
            ))}
          </div>
        </header>

        {/* Article Image */}
        {article.image && (
          <div className="relative aspect-video rounded-xl overflow-hidden">
            <Image
              src={article.image}
              alt={`Featured image for ${article.title}`}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Article Content */}
        <article className="prose prose-invert prose-purple max-w-none">
          <div className="space-y-6">
            <p className="text-lg leading-relaxed">{article.brief}</p>
          </div>
          <div className="mt-12 flex items-center space-x-2 text-purple-500">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 hover:text-purple-400"
            >
              <span>Continue reading on {article.source.name}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="border-t border-zinc-800 pt-8">
            <h2 className="text-xl font-semibold mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((related) => (
                <Link
                  key={related.id}
                  href={`/discoveries/${encodeURIComponent(related.url)}`}
                  className="group"
                >
                  <div className="relative h-40 rounded-lg overflow-hidden mb-4">
                    <Image
                      src={related.image}
                      alt={`Featured image for ${related.title}`}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center space-x-2">
                      <div className="relative w-5 h-5">
                        <Image
                          src={related.source.image}
                          alt={`${related.source.name} logo`}
                          fill
                          className="rounded-full object-cover"
                          sizes="20px"
                        />
                      </div>
                      <span className="text-sm text-white/80">{related.source.name}</span>
                    </div>
                  </div>
                  <h3 className="font-medium line-clamp-2 group-hover:text-purple-500 transition-colors">
                    {related.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}
      </motion.div>
    </div>
  );
} 