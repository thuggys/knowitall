'use client'

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Github, Loader2 } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignInModal = ({ isOpen, onClose }: SignInModalProps) => {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleGithubSignIn = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'read:user user:email',
        }
      });

      if (error) {
        console.error('Error signing in with GitHub:', error.message);
        return;
      }

      // If we have a provider URL, redirect to it
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error signing in with GitHub:', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Close modal when user is signed in
  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        onClose();
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, onClose, router]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-zinc-900 rounded-xl p-6 sm:p-8 shadow-xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white transition-colors"
              aria-label="Close sign in modal"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Welcome Back</h2>
                <p className="text-zinc-400">Sign in to access all features and content</p>
              </div>

              {/* GitHub Sign In Button */}
              <motion.button
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                onClick={handleGithubSignIn}
                className="flex items-center justify-center space-x-3 w-full bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <Github className="w-5 h-5" />
                    <span>Continue with GitHub</span>
                  </>
                )}
              </motion.button>

              {/* Terms */}
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SignInModal; 