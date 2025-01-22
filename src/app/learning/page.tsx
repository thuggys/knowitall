'use client'

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Book, Code, Video, Lightbulb, Star, Clock, Bookmark, Loader2 } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

// RSS feed URLs for different course platforms
const RSS_FEEDS = [
  {
    url: 'https://www.freecodecamp.org/news/rss/',
    category: 'Programming',
    type: 'Tutorial Platform'
  },
  {
    url: 'https://dev.to/feed/tag/tutorial',
    category: 'Development',
    type: 'Tutorial Platform'
  },
  {
    url: 'https://dev.to/feed/tag/beginners',
    category: 'Programming Basics',
    type: 'Tutorial Platform'
  },
  {
    url: 'https://dev.to/feed/tag/webdev',
    category: 'Web Development',
    type: 'Tutorial Platform'
  }
];

interface RSSItem {
  title: string;
  description: string;
  link: string;
  categories?: string[];
  pubDate: string;
}

interface Course {
  title: string;
  category: string;
  type: string;
  icon: typeof Book | typeof Code | typeof Video | typeof Lightbulb;
  description: string;
  duration?: string;
  difficulty?: string;
  rating?: number;
  url: string;
  tags: string[];
  pubDate?: string;
}

const LearningHub = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [bookmarkedUrls, setBookmarkedUrls] = useState<Set<string>>(new Set());
  const supabase = createClientComponentClient();

  const fetchRSSFeeds = useCallback(async () => {
    try {
      const RSS2JSON_API_KEY = process.env.NEXT_PUBLIC_RSS2JSON_API_KEY;
      const fetchPromises = RSS_FEEDS.map(async (feed) => {
        const response = await fetch(
          `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
            feed.url
          )}&api_key=${RSS2JSON_API_KEY}`
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch ${feed.url}`);
        }

        const data = await response.json();
        
        return data.items.map((item: RSSItem) => ({
          title: item.title,
          category: feed.category,
          type: feed.type,
          icon: determineIcon(item.categories?.[0] || feed.category),
          description: item.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
          url: item.link,
          tags: item.categories || [feed.category],
          pubDate: item.pubDate,
          rating: 4.5, // Default rating since RSS feeds don't typically include ratings
        }));
      });

      const allCourses = (await Promise.all(fetchPromises)).flat();
      setCourses(allCourses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  }, []);

  const determineIcon = (category: string) => {
    category = category.toLowerCase();
    if (category.includes('programming') || category.includes('development')) {
      return Code;
    } else if (category.includes('video') || category.includes('lecture')) {
      return Video;
    } else if (category.includes('ai') || category.includes('machine learning')) {
      return Lightbulb;
    }
    return Book;
  };

  // Add function to handle bookmarking
  const handleBookmark = async (course: Course) => {
    if (!user) {
      toast.error('Please sign in to bookmark resources');
      return;
    }

    try {
      const isBookmarked = bookmarkedUrls.has(course.url);
      
      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('url', course.url);

        if (error) throw error;

        setBookmarkedUrls(prev => {
          const next = new Set(prev);
          next.delete(course.url);
          return next;
        });
        toast.success('Bookmark removed');
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert([{
            user_id: user.id,
            title: course.title,
            description: course.description,
            url: course.url,
            category: course.category,
            type: course.type,
            tags: course.tags
          }]);

        if (error) throw error;

        setBookmarkedUrls(prev => new Set([...prev, course.url]));
        toast.success('Resource bookmarked');
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      toast.error('Failed to update bookmark');
    }
  };

  // Add function to fetch user's bookmarks
  const fetchBookmarks = useCallback(async (userId: string) => {
    try {
      const { data: bookmarks, error } = await supabase
        .from('bookmarks')
        .select('url')
        .eq('user_id', userId);

      if (error) throw error;

      setBookmarkedUrls(new Set(bookmarks.map(b => b.url)));
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
    }
  }, [supabase]);

  // Add effect to get user and their bookmarks
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        setUser(user);
        if (user) {
          fetchBookmarks(user.id);
        }
      } catch (err) {
        console.error('Error getting user:', err);
      }
    };

    getUser();
  }, [supabase, fetchBookmarks]);

  useEffect(() => {
    fetchRSSFeeds();
  }, [fetchRSSFeeds]);

  return (
    <div className="min-h-screen p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header Section */}
        <div className="flex items-center space-x-2 mb-6">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <Book className="w-5 h-5 text-purple-500" />
          </motion.div>
          <span className="text-sm">Your Tech Learning Journey</span>
        </div>

        <motion.h1 
          className="text-4xl lg:text-6xl font-light leading-tight mb-8"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5 }}
        >
          Learn and Grow
          <div className="text-purple-500">With Expert Resources</div>
        </motion.h1>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-red-500 text-center p-4">
            {error}
          </div>
        )}

        {/* Learning Resources Grid */}
        {!loading && !error && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            initial="hidden"
            animate="show"
          >
            {courses.map((course, index) => {
              const Icon = course.icon;
              const isBookmarked = bookmarkedUrls.has(course.url);
              
              return (
                <motion.div
                  key={`${course.title}-${index}`}
                  whileHover={{ scale: 1.02 }}
                  className="bg-zinc-900 rounded-xl p-6 space-y-4 block cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Icon className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <span className="text-purple-500 text-sm">{course.category}</span>
                        <h3 className="text-xl font-semibold mt-1">{course.title}</h3>
                      </div>
                    </div>
                    {course.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-gray-500">{course.rating}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-500 text-sm">{course.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {course.tags.map((tag, tagIndex) => (
                      <span
                        key={`${tag}-${tagIndex}`}
                        className="text-xs bg-purple-500/10 text-purple-500 px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center space-x-4">
                      {course.pubDate && (
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(course.pubDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {course.difficulty && (
                        <span className="text-sm text-gray-500">{course.difficulty}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <a
                        href={course.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-500 hover:text-purple-400 text-sm"
                      >
                        Read More →
                      </a>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.preventDefault();
                          handleBookmark(course);
                        }}
                        className={`text-purple-500 hover:text-purple-400 ${isBookmarked ? 'text-purple-500' : 'text-gray-500'}`}
                      >
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Stats Section */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
        >
          {[
            { label: "Available Courses", value: `${courses.length}+`, icon: Book },
            { label: "Learning Platforms", value: `${RSS_FEEDS.length}`, icon: Video },
            { label: "Updated Daily", value: "24/7", icon: Lightbulb }
          ].map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.05 }}
              className="bg-zinc-900 rounded-xl p-6 text-center"
            >
              <stat.icon className="w-6 h-6 text-purple-500 mx-auto mb-4" />
              <div className="text-2xl font-bold mb-2">{stat.value}</div>
              <div className="text-gray-500 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LearningHub; 