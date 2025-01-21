'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get('error')

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-6 text-center"
      >
        <div className="flex justify-center">
          <div className="p-3 bg-red-500/10 rounded-full">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Authentication Error</h1>
          <p className="text-zinc-400">
            {error || 'An error occurred during authentication'}
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/')}
          className="flex items-center justify-center space-x-2 mx-auto px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </motion.button>
      </motion.div>
    </div>
  )
} 