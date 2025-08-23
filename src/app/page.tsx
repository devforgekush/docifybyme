'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Loader2, Sparkles, AlertCircle } from 'lucide-react'

// Loading component with better accessibility
function LoadingSpinner() {
  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center"
      role="status"
      aria-label="Loading DocifyByMe"
    >
      <motion.div 
        className="text-white text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="relative w-16 h-16 mx-auto mb-6"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin"></div>
          <div className="absolute inset-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </motion.div>
        
        <motion.h1
          className="text-2xl font-bold mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          DocifyByMe
        </motion.h1>
        
        <motion.p
          className="text-gray-300 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Loading your workspace...
        </motion.p>
        
        <motion.div
          className="mt-4 flex justify-center space-x-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-white/60 rounded-full"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}

// Error boundary component
function ErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div 
        className="text-white text-center max-w-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        
        <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
        <p className="text-gray-300 text-sm mb-6">
          {error.message || 'An unexpected error occurred'}
        </p>
        
        <button
          onClick={resetError}
          className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors focus-ring"
        >
          Try again
        </button>
      </motion.div>
    </div>
  )
}

// Main component with error boundary
function HomeContent() {
  const router = useRouter()
  const { status } = useSession()
  const [isClient, setIsClient] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const handleNavigation = async () => {
      try {
        if (status === 'authenticated') {
          await router.push('/dashboard')
        } else if (status === 'unauthenticated') {
          await router.push('/login')
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Navigation failed'))
      }
    }

    handleNavigation()
  }, [status, router, isClient])

  // Show error if one occurred
  if (error) {
    return <ErrorFallback error={error} resetError={() => setError(null)} />
  }

  // Show loading state on server-side rendering or while checking auth
  if (!isClient || status === 'loading') {
    return <LoadingSpinner />
  }

  // Show redirecting state
  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center"
      role="status"
      aria-label="Redirecting to application"
    >
      <motion.div 
        className="text-white text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-16 h-16 mx-auto mb-6"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-full h-full rounded-full border-4 border-white/20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        </motion.div>
        
        <h1 className="text-2xl font-bold mb-2">Redirecting...</h1>
        <p className="text-gray-300 text-sm">
          {status === 'authenticated' ? 'Taking you to your dashboard' : 'Taking you to login'}
        </p>
      </motion.div>
    </div>
  )
}

// Main export with Suspense boundary
export default function Home() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HomeContent />
    </Suspense>
  )
}
