'use client'

import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Github, Sparkles } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import the 3D component with no SSR
const Login3D = dynamic(() => import('@/components/Login3D'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p>Loading 3D Experience...</p>
      </div>
    </div>
  )
})

export default function LoginPage() {
  const { status } = useSession()
  const router = useRouter()
  const [use3D, setUse3D] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  const handleGitHubSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn('github', { 
        callbackUrl: '/dashboard',
        redirect: true 
      })
    } catch (error) {
      console.error('Sign in error:', error)
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (status === 'authenticated') {
    return null // Will redirect
  }

  // Simple 2D fallback if 3D fails to load
  if (!use3D) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-slate-700 max-w-md w-full">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="text-purple-400 mr-2" size={32} />
              <h1 className="text-3xl font-bold text-white">DocifyByMe</h1>
            </div>
            
            <p className="text-slate-300 mb-8">
              Generate beautiful documentation for your GitHub repositories using AI
            </p>

            <button
              onClick={handleGitHubSignIn}
              disabled={isLoading}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Github size={20} />
                  <span>Continue with GitHub</span>
                </>
              )}
            </button>
            
            <button
              onClick={() => setUse3D(!use3D)}
              className="mt-4 text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              Switch to 3D Experience
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Login3D />
      <button
        onClick={() => setUse3D(false)}
        className="fixed top-4 right-4 z-50 bg-slate-800/80 text-white px-3 py-2 rounded-lg text-sm hover:bg-slate-700 transition-colors"
      >
        Use Simple Login
      </button>
    </div>
  )
}
