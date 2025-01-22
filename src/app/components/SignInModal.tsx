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

interface SignInButtonProps {
  provider: 'github' | 'google';
  onClick: () => void;
  isLoading: boolean;
}

const SignInButton = ({ provider, onClick, isLoading }: SignInButtonProps) => {
  const icons = {
    github: <Github className="w-5 h-5" />,
    google: (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    ),
  };

  const labels = {
    github: 'Continue with GitHub',
    google: 'Continue with Google',
  };

  return (
    <motion.button
      whileHover={{ scale: isLoading ? 1 : 1.02 }}
      whileTap={{ scale: isLoading ? 1 : 0.98 }}
      onClick={onClick}
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
          {icons[provider]}
          <span>{labels[provider]}</span>
        </>
      )}
    </motion.button>
  );
};

const SignInModal = ({ isOpen, onClose }: SignInModalProps) => {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeProvider, setActiveProvider] = React.useState<'github' | 'google' | null>(null);

  const handleSignIn = async (provider: 'github' | 'google') => {
    try {
      setIsLoading(true);
      setActiveProvider(provider);

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: false,
          scopes: provider === 'google' ? 'email profile' : 'read:user user:email',
        }
      });

      if (error) {
        console.error(`Error signing in with ${provider}:`, error.message);
        return;
      }

      // The redirect will happen automatically
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error signing in with ${provider}:`, error.message);
      }
    } finally {
      setIsLoading(false);
      setActiveProvider(null);
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

              {/* Sign In Buttons */}
              <div className="space-y-3">
                <SignInButton
                  provider="github"
                  onClick={() => handleSignIn('github')}
                  isLoading={isLoading && activeProvider === 'github'}
                />
                <SignInButton
                  provider="google"
                  onClick={() => handleSignIn('google')}
                  isLoading={isLoading && activeProvider === 'google'}
                />
              </div>

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