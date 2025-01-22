'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { 
  Loader2, Camera, LogOut, Mail, User as UserIcon, 
  Calendar, Globe, BookMarked, Heart, Sparkles, 
  GraduationCap, Settings, ChevronRight 
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Profile {
  id: string;
  username: string;
  full_name: string;
  bio: string;
  website: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

interface LikedPost {
  id: string;
  title: string;
  created_at: string;
  author: {
    username: string;
    avatar_url: string;
  };
}

interface Bookmark {
  id: string;
  title: string;
  excerpt: string;
  cover_image: string;
  author: {
    username: string;
    avatar_url: string;
  };
  created_at: string;
}

interface LearningBookmark {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  type: string;
  tags: string[];
  created_at: string;
}

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center py-12"
  >
    <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
      <Icon className="w-6 h-6 text-zinc-400" />
    </div>
    <h3 className="text-lg font-medium text-zinc-300 mb-2">{title}</h3>
    <p className="text-zinc-500">{description}</p>
  </motion.div>
);

export default function ProfilePage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [likedPosts, setLikedPosts] = React.useState<LikedPost[]>([]);
  const [bookmarks, setBookmarks] = React.useState<Bookmark[]>([]);
  const [learningBookmarks, setLearningBookmarks] = React.useState<LearningBookmark[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [updating, setUpdating] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'likes' | 'bookmarks' | 'learning'>('likes');

  // Form state
  const [formData, setFormData] = React.useState({
    username: '',
    full_name: '',
    bio: '',
    website: '',
  });

  React.useEffect(() => {
    const getUser = async () => {
      try {
        const { data, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          throw userError;
        }

        if (!data.user) {
          setUser(null);
          setLoading(false);
          return;
        }

        setUser(data.user);
        
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profileError) {
            if (profileError.code === 'PGRST116') {
              // Profile doesn't exist, create it
              const newProfile = {
                id: data.user.id,
                username: data.user.user_metadata?.user_name || '',
                full_name: data.user.user_metadata?.full_name || '',
                avatar_url: data.user.user_metadata?.avatar_url || '',
              };

              const { error: createError } = await supabase
                .from('profiles')
                .insert([newProfile]);

              if (createError) {
                throw createError;
              }

              setProfile(newProfile as Profile);
              setFormData({
                username: newProfile.username,
                full_name: newProfile.full_name,
                bio: '',
                website: '',
              });
            } else {
              throw profileError;
            }
          } else if (profile) {
            setProfile(profile);
            setFormData({
              username: profile.username || '',
              full_name: profile.full_name || '',
              bio: profile.bio || '',
              website: profile.website || '',
            });
          }
        } catch (error) {
          console.error('Error loading profile:', error);
          setError(error instanceof Error ? error.message : 'Failed to load profile');
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setError(error instanceof Error ? error.message : 'Failed to load user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [supabase]);

  // Update the liked posts fetch
  React.useEffect(() => {
    const fetchLikedPosts = async () => {
      if (!user) return;

      try {
        // First get the liked blog IDs
        const { data: likedBlogIds, error: likesError } = await supabase
          .from('blog_likes')
          .select('blog_id')
          .eq('user_id', user.id);

        if (likesError) throw likesError;

        if (!likedBlogIds?.length) {
          setLikedPosts([]);
          return;
        }

        // Then fetch the blog details
        const { data: blogsData, error: blogsError } = await supabase
          .from('blogs')
          .select(`
            id,
            title,
            created_at,
            author_id
          `)
          .in('id', likedBlogIds.map(like => like.blog_id));

        if (blogsError) throw blogsError;

        // Fetch author profiles
        const authorIds = [...new Set((blogsData || []).map(blog => blog.author_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', authorIds);

        const profilesMap = new Map(profilesData?.map(profile => [profile.id, profile]) || []);

        const transformedPosts: LikedPost[] = (blogsData || []).map(blog => {
          const profile = profilesMap.get(blog.author_id);
          return {
            id: blog.id,
            title: blog.title,
            created_at: blog.created_at,
            author: {
              username: profile?.username || 'Unknown',
              avatar_url: profile?.avatar_url || '/default-avatar.png'
            }
          };
        });

        setLikedPosts(transformedPosts);
      } catch (error) {
        console.error('Error fetching liked posts:', error);
        if (error instanceof Error) {
          console.error('Error details:', {
            message: error.message,
            stack: error.stack
          });
        }
      }
    };

    fetchLikedPosts();
  }, [supabase, user]);

  // Update bookmarks fetch
  React.useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user) return;

      try {
        // First get the bookmarked blog IDs
        const { data: bookmarkedBlogIds, error: bookmarksError } = await supabase
          .from('blog_bookmarks')
          .select('blog_id')
          .eq('user_id', user.id);

        if (bookmarksError) throw bookmarksError;

        if (!bookmarkedBlogIds?.length) {
          setBookmarks([]);
          return;
        }

        // Then fetch the blog details
        const { data: blogsData, error: blogsError } = await supabase
          .from('blogs')
          .select(`
            id,
            title,
            excerpt,
            cover_image,
            created_at,
            author_id
          `)
          .in('id', bookmarkedBlogIds.map(bookmark => bookmark.blog_id));

        if (blogsError) throw blogsError;

        // Fetch author profiles
        const authorIds = [...new Set((blogsData || []).map(blog => blog.author_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', authorIds);

        const profilesMap = new Map(profilesData?.map(profile => [profile.id, profile]) || []);

        const transformedBookmarks: Bookmark[] = (blogsData || []).map(blog => {
          const profile = profilesMap.get(blog.author_id);
          return {
            id: blog.id,
            title: blog.title,
            excerpt: blog.excerpt || '',
            cover_image: blog.cover_image || '',
            created_at: blog.created_at,
            author: {
              username: profile?.username || 'Unknown',
              avatar_url: profile?.avatar_url || '/default-avatar.png'
            }
          };
        });

        setBookmarks(transformedBookmarks);
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
        if (error instanceof Error) {
          console.error('Error details:', {
            message: error.message,
            stack: error.stack
          });
        }
      }
    };

    fetchBookmarks();
  }, [supabase, user]);

  // Add new effect for learning bookmarks
  React.useEffect(() => {
    const fetchLearningBookmarks = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('bookmarks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setLearningBookmarks(data || []);
      } catch (error) {
        console.error('Error fetching learning bookmarks:', error);
        if (error instanceof Error) {
          console.error('Error details:', {
            message: error.message,
            stack: error.stack
          });
        }
      }
    };

    fetchLearningBookmarks();
  }, [supabase, user]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user || !profile) return;

    try {
      setError(null);
      setSuccess(false);
      setUpdating(true);

      // Validate form data
      if (formData.username.trim() === '') {
        setError('Username is required');
        return;
      }

      const updates = {
        id: user.id,
        ...formData,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      setSuccess(true);
      setEditMode(false);

      // Refresh the page data
      router.refresh();
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError(null);
      const file = event.target.files?.[0];
      if (!file || !user) return;

      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError('Image must be less than 5MB');
        return;
      }

      setUpdating(true);

      // Upload image to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = fileName;  // Simplified path since we're in avatars bucket

      const { error: uploadError } = await supabase.storage
        .from('avatars')  // Using the avatars bucket we created
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')  // Using the avatars bucket
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update local state
      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      setSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);

      // Refresh the entire app to update all instances of the profile picture
      router.refresh();
      
      // Force a hard refresh after a short delay to ensure all components update
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 max-w-4xl mx-auto"
      >
        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 text-red-500 p-4 rounded-lg"
          >
            {error}
          </motion.div>
        )}

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/10 text-green-500 p-4 rounded-lg"
          >
            Profile updated successfully!
          </motion.div>
        )}

        {/* Profile Header */}
        <div className="bg-zinc-900 rounded-xl p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-purple-500/20 flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url ? (
                    <Image 
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <UserIcon className="w-12 h-12 text-purple-500" />
                  )}
                </div>
                <label 
                  className="absolute bottom-0 right-0 p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-colors cursor-pointer"
                  aria-label="Change profile picture"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={updating}
                  />
                  {updating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </label>
              </div>
              <div>
                <h1 className="text-2xl font-semibold">{profile?.full_name || user?.email}</h1>
                <p className="text-zinc-400">@{profile?.username || 'username'}</p>
                {profile?.bio && (
                  <p className="text-zinc-300 mt-2 max-w-md">{profile.bio}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {editMode ? (
                <>
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 text-sm text-zinc-400 hover:text-white"
                    disabled={updating}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateProfile}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center space-x-2"
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditMode(true)}
                    className="p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
                    title="Edit Profile"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
                    title="Sign Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {editMode ? (
            <div className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-4 py-2 bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Username"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full px-4 py-2 bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Full Name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full px-4 py-2 bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"
                  placeholder="Tell us about yourself"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full px-4 py-2 bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://example.com"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 mt-4">
              {user?.email && (
                <div className="flex items-center space-x-2 text-sm text-zinc-400">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
              )}
              {profile?.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-sm text-zinc-400 hover:text-purple-500"
                >
                  <Globe className="w-4 h-4" />
                  <span>{profile.website}</span>
                </a>
              )}
              <div className="flex items-center space-x-2 text-sm text-zinc-400">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(user?.created_at || '').toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-zinc-900 rounded-xl p-6 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Heart className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Liked Posts</p>
                <p className="text-2xl font-semibold">{likedPosts.length}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-600" />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-zinc-900 rounded-xl p-6 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <BookMarked className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Blog Bookmarks</p>
                <p className="text-2xl font-semibold">{bookmarks.length}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-600" />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-zinc-900 rounded-xl p-6 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <GraduationCap className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Learning Resources</p>
                <p className="text-2xl font-semibold">{learningBookmarks.length}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-600" />
          </motion.div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-zinc-800">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('likes')}
              className={`pb-4 text-sm font-medium transition-colors relative ${
                activeTab === 'likes'
                  ? 'text-purple-500'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4" />
                <span>Liked Posts</span>
              </div>
              {activeTab === 'likes' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`pb-4 text-sm font-medium transition-colors relative ${
                activeTab === 'bookmarks'
                  ? 'text-purple-500'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BookMarked className="w-4 h-4" />
                <span>Blog Bookmarks</span>
              </div>
              {activeTab === 'bookmarks' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('learning')}
              className={`pb-4 text-sm font-medium transition-colors relative ${
                activeTab === 'learning'
                  ? 'text-purple-500'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-4 h-4" />
                <span>Learning Resources</span>
              </div>
              {activeTab === 'learning' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"
                />
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === 'likes' ? (
            likedPosts.length === 0 ? (
              <EmptyState
                icon={Heart}
                title="No liked posts yet"
                description="Posts you like will appear here"
              />
            ) : (
              <div className="grid gap-4">
                {likedPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )
          ) : activeTab === 'bookmarks' ? (
            bookmarks.length === 0 ? (
              <EmptyState
                icon={BookMarked}
                title="No bookmarked posts yet"
                description="Blog posts you bookmark will appear here"
              />
            ) : (
              <div className="grid gap-4">
                {bookmarks.map(bookmark => (
                  <BookmarkCard key={bookmark.id} bookmark={bookmark} />
                ))}
              </div>
            )
          ) : (
            learningBookmarks.length === 0 ? (
              <EmptyState
                icon={GraduationCap}
                title="No learning resources saved yet"
                description="Learning resources you bookmark will appear here"
              />
            ) : (
              <div className="grid gap-4">
                {learningBookmarks.map(bookmark => (
                  <LearningCard key={bookmark.id} bookmark={bookmark} />
                ))}
              </div>
            )
          )}
        </div>
      </motion.div>
    </div>
  );
}

// Helper Components
const PostCard = ({ post }: { post: LikedPost }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    whileHover={{ scale: 1.01 }}
    className="bg-zinc-900 rounded-xl p-4 transition-colors hover:bg-zinc-800/50"
  >
    <Link href={`/blog/${post.id}`} className="block">
      <div className="flex items-center space-x-3 mb-2">
        <div className="relative w-6 h-6">
          <Image
            src={post.author.avatar_url}
            alt={post.author.username}
            fill
            sizes="24px"
            className="rounded-full object-cover"
          />
        </div>
        <span className="text-sm text-zinc-400">{post.author.username}</span>
        <span className="text-zinc-600">•</span>
        <span className="text-sm text-zinc-400">
          {new Date(post.created_at).toLocaleDateString()}
        </span>
      </div>
      <h3 className="text-lg font-medium hover:text-purple-500 transition-colors">
        {post.title}
      </h3>
    </Link>
  </motion.div>
);

const BookmarkCard = ({ bookmark }: { bookmark: Bookmark }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    whileHover={{ scale: 1.01 }}
    className="bg-zinc-900 rounded-xl overflow-hidden transition-colors hover:bg-zinc-800/50"
  >
    <Link href={`/blog/${bookmark.id}`} className="block">
      {bookmark.cover_image && (
        <div className="relative aspect-video">
          <Image
            src={bookmark.cover_image}
            alt={bookmark.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-2">
          <div className="relative w-6 h-6">
            <Image
              src={bookmark.author.avatar_url}
              alt={bookmark.author.username}
              fill
              sizes="24px"
              className="rounded-full object-cover"
            />
          </div>
          <span className="text-sm text-zinc-400">{bookmark.author.username}</span>
          <span className="text-zinc-600">•</span>
          <span className="text-sm text-zinc-400">
            {new Date(bookmark.created_at).toLocaleDateString()}
          </span>
        </div>
        <h3 className="text-lg font-medium hover:text-purple-500 transition-colors">
          {bookmark.title}
        </h3>
        {bookmark.excerpt && (
          <p className="text-zinc-400 mt-2 line-clamp-2">{bookmark.excerpt}</p>
        )}
      </div>
    </Link>
  </motion.div>
);

const LearningCard = ({ bookmark }: { bookmark: LearningBookmark }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    whileHover={{ scale: 1.01 }}
    className="bg-zinc-900 rounded-xl p-4 transition-colors hover:bg-zinc-800/50"
  >
    <a
      href={bookmark.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
          <span className="text-sm font-medium text-purple-500">{bookmark.category}</span>
        </div>
        <span className="text-sm text-zinc-500">
          {new Date(bookmark.created_at).toLocaleDateString()}
        </span>
      </div>
      <h3 className="text-lg font-medium hover:text-purple-500 transition-colors">
        {bookmark.title}
      </h3>
      {bookmark.description && (
        <p className="text-zinc-400 mt-2 line-clamp-2">{bookmark.description}</p>
      )}
      <div className="flex flex-wrap gap-2 mt-3">
        {bookmark.tags.map((tag, index) => (
          <span
            key={index}
            className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    </a>
  </motion.div>
); 