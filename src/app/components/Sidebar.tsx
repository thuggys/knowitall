'use client'

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Code, BookOpen, Bot, Lightbulb, Users, FileText, LogOut, User as UserIcon, Menu, X, Settings, ChevronUp } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import SignInModal from './SignInModal';

const navigationItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Projects', href: '/projects', icon: Code },
  { name: 'Learning', href: '/learning', icon: BookOpen },
  { name: 'Blog', href: '/blog', icon: FileText },
  { name: 'Discoveries', href: '/discoveries', icon: Lightbulb },
  { name: 'About', href: '/about', icon: Users },
];

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [user, setUser] = React.useState<User | null>(null);
  const [isSignInModalOpen, setIsSignInModalOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [userName, setUserName] = React.useState<string | null>(null);

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Get avatar and name from user metadata
        const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;
        const name = user.user_metadata?.user_name || user.user_metadata?.name || user.user_metadata?.full_name;
        
        setAvatarUrl(avatar);
        setUserName(name);
      } else {
        setUser(null);
        setAvatarUrl(null);
        setUserName(null);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        // Update avatar and name when auth state changes
        const avatar = currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture;
        const name = currentUser.user_metadata?.user_name || currentUser.user_metadata?.name || currentUser.user_metadata?.full_name;
        
        setAvatarUrl(avatar);
        setUserName(name);
      } else {
        setAvatarUrl(null);
        setUserName(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setAvatarUrl(null);
      setUserName(null);
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSignIn = () => {
    setIsSignInModalOpen(true);
  };

  const handleProfileClick = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleNavigateToProfile = () => {
    router.push('/profile');
    setIsProfileMenuOpen(false);
  };

  // Close mobile menu when route changes
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-2">
          <Bot className="w-8 h-8 text-purple-500" />
          <span className="text-xl font-semibold">Know It All</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden text-zinc-400 hover:text-white"
          aria-label="Close menu"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="space-y-2 flex-1">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-purple-500/20 text-purple-500' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
                {isActive && (
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-purple-500 ml-auto"
                    layoutId="activeIndicator"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Profile Section */}
      <div className="border-t border-zinc-800 pt-4 mt-4">
        {user ? (
          <div className="space-y-4">
            <button
              onClick={handleProfileClick}
              className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-zinc-900 rounded-lg transition-colors relative"
            >
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <Image 
                    src={avatarUrl}
                    alt={userName || user.email || ''}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-4 h-4 text-purple-500" />
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                {userName && (
                  <p className="text-sm font-medium text-white truncate">
                    {userName}
                  </p>
                )}
                <p className="text-xs text-zinc-400 truncate">
                  {user.email}
                </p>
              </div>
              <ChevronUp 
                className={`w-4 h-4 text-zinc-400 transition-transform ${
                  isProfileMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {isProfileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="px-2"
                >
                  <button
                    onClick={handleNavigateToProfile}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <motion.button
            whileHover={{ x: 4 }}
            onClick={handleSignIn}
            className="flex items-center space-x-2 px-4 py-2 w-full text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors"
          >
            <UserIcon className="w-5 h-5" />
            <span>Sign In</span>
          </motion.button>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 text-zinc-400 hover:text-white bg-zinc-900 rounded-lg"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        />
      )}

      {/* Sidebar for Desktop */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden lg:flex h-screen w-64 bg-zinc-950 border-r border-zinc-800 fixed left-0 top-0 p-6 flex-col"
      >
        <SidebarContent />
      </motion.div>

      {/* Mobile Sidebar */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isMobileMenuOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 20 }}
        className="lg:hidden fixed inset-y-0 left-0 w-64 bg-zinc-950 border-r border-zinc-800 p-6 flex flex-col z-50"
      >
        <SidebarContent />
      </motion.div>

      <SignInModal 
        isOpen={isSignInModalOpen} 
        onClose={() => setIsSignInModalOpen(false)} 
      />
    </>
  );
};

export default Sidebar; 