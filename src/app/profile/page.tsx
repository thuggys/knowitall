'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Loader2, Camera, LogOut, Github, Mail, User as UserIcon, Calendar, Globe } from 'lucide-react';
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

interface SupabaseLike {
  blogs: {
    id: string;
    title: string;
    created_at: string;
    profiles: {
      username: string;
      avatar_url: string;
    } | null;
  }
}

export default function ProfilePage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [likedPosts, setLikedPosts] = React.useState<LikedPost[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [updating, setUpdating] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

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

  // Add this new useEffect to fetch liked posts
  React.useEffect(() => {
    const fetchLikedPosts = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('likes')
          .select(`
            blogs (
              id,
              title,
              created_at,
              profiles!blogs_author_id_fkey (
                username,
                avatar_url
              )
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Use type assertion through unknown first
        const rawData = data as unknown as SupabaseLike[];
        const transformedPosts: LikedPost[] = rawData
          .filter(item => item.blogs) // Filter out any null blogs
          .map(item => ({
            id: item.blogs.id,
            title: item.blogs.title,
            created_at: item.blogs.created_at,
            author: {
              username: item.blogs.profiles?.username || 'Unknown',
              avatar_url: item.blogs.profiles?.avatar_url || '/default-avatar.png'
            }
          }));

        setLikedPosts(transformedPosts);
      } catch (error) {
        console.error('Error fetching liked posts:', error);
      }
    };

    fetchLikedPosts();
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
      const filePath = `profile-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
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
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
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

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <Image 
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    fill
                    sizes="80px"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-8 h-8 text-purple-500" />
                )}
              </div>
              <label 
                className="absolute bottom-0 right-0 p-1.5 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-colors cursor-pointer"
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
              <h1 className="text-2xl font-semibold">{profile?.full_name || user.email}</h1>
              <p className="text-zinc-400">@{profile?.username || 'username'}</p>
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
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-zinc-400 hover:text-white transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {editMode ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-4 py-2 bg-zinc-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Username"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full px-4 py-2 bg-zinc-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full px-4 py-2 bg-zinc-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"
                    placeholder="Tell us about yourself"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full px-4 py-2 bg-zinc-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {profile?.bio && (
                  <p className="text-zinc-300">{profile.bio}</p>
                )}
                <div className="space-y-2">
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
                    <Github className="w-4 h-4" />
                    <span>GitHub Account Connected</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-zinc-400">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-zinc-400">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Activity or Stats Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Liked Posts</h2>
            <div className="space-y-4">
              {likedPosts.length === 0 ? (
                <p className="text-zinc-400">No liked posts yet</p>
              ) : (
                likedPosts.map(post => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-zinc-900 rounded-lg space-y-2"
                  >
                    <Link
                      href={`/blog/${post.id}`}
                      className="text-lg font-medium hover:text-purple-500 transition-colors"
                    >
                      {post.title}
                    </Link>
                    <div className="flex items-center space-x-2 text-sm text-zinc-400">
                      <div className="relative w-5 h-5">
                        <Image
                          src={post.author.avatar_url}
                          alt={post.author.username}
                          fill
                          sizes="20px"
                          className="rounded-full object-cover"
                        />
                      </div>
                      <span>{post.author.username}</span>
                      <span>•</span>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 