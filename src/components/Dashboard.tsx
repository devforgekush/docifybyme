'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Star, 
  GitFork, 
  BookOpen, 
  RefreshCw, 
  LogOut,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
  Menu,
  X,
  Copy,
  Check,
  FileText,
  Calendar,
  Eye
} from 'lucide-react'

import { GitHubRepository } from '@/lib/github-service'

interface Repository extends GitHubRepository {
  documentation_status?: 'pending' | 'generating' | 'completed' | 'failed'
  documentation_content?: string | null
  last_generated?: string | null
}

// Custom hooks for better performance
// Debounce helper removed: search filtering uses immediate `searchTerm` now.

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue] as const
}

// Loading component
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-16 h-16 mx-auto mb-6"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-full h-full rounded-full border-4 border-blue-200 border-t-blue-500"></div>
        </motion.div>
        <p className="text-gray-600 font-medium">Loading your repositories...</p>
      </motion.div>
    </div>
  )
}

// Error component
function ErrorDisplay({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center space-x-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
        <button
          onClick={onRetry}
          className="text-red-600 hover:text-red-800 font-medium text-sm focus-ring"
        >
          Try again
        </button>
      </div>
    </motion.div>
  )
}

// Repository card component
function RepositoryCard({ 
  repo, 
  onGenerate, 
  onShowDocs, 
  isGenerating 
}: { 
  repo: Repository
  onGenerate: (repo: Repository) => void
  onShowDocs: (repo: Repository) => void
  isGenerating: boolean
}) {
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'generating':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 group"
    >
      <div className="p-6">
        {/* Repository Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {repo.name}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {repo.full_name}
            </p>
          </div>
          <div className="flex items-center space-x-1 ml-2">
            {getStatusIcon(repo.documentation_status)}
          </div>
        </div>

        {/* Description */}
        {repo.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {repo.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4" />
            <span>{repo.stargazers_count.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <GitFork className="w-4 h-4" />
            <span>{repo.forks_count.toLocaleString()}</span>
          </div>
          {repo.language && (
            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium">
              {repo.language}
            </span>
          )}
        </div>

        {/* Last updated */}
        <div className="flex items-center space-x-1 text-xs text-gray-400 mb-4">
          <Calendar className="w-3 h-3" />
          <span>Updated {formatDate(repo.updated_at)}</span>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={() => onGenerate(repo)}
            disabled={isGenerating}
            className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 focus-ring"
            aria-label={isGenerating ? "Generating documentation..." : "Generate documentation"}
          >
            {isGenerating ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Generate Docs</span>
              </>
            )}
          </button>

          {repo.documentation_content && (
            <button
              onClick={() => onShowDocs(repo)}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors focus-ring"
              aria-label="View documentation"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Main Dashboard component
export default function Dashboard() {
  const { data: session } = useSession()
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [languageFilter, setLanguageFilter] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'updated' | 'stars'>('name')
  const [generatingRepos, setGeneratingRepos] = useState<Set<number>>(new Set())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [documentationModal, setDocumentationModal] = useState<{
    isOpen: boolean
    content: string
    repositoryName: string
    provider?: string
  }>({
    isOpen: false,
    content: '',
    repositoryName: '',
    provider: ''
  })
  const [copied, setCopied] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Use localStorage for user preferences
  const [userPreferences, setUserPreferences] = useLocalStorage('dashboard-preferences', {
    sortBy: 'name' as 'name' | 'updated' | 'stars',
    languageFilter: '',
    searchTerm: ''
  })

  // (debounce removed) use immediate searchTerm for instant filtering

  const fetchRepositories = useCallback(async () => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    try {
      setError(null)
      setLoading(true)
      const response = await fetch('/api/repositories', {
        signal: abortControllerRef.current.signal
      })
      
      if (response.ok) {
        const data = await response.json()
        setRepositories(data)
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.error || 'Failed to fetch repositories')
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return // Request was cancelled
      }
      console.error('Error fetching repositories:', error)
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRepositories()
    
    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchRepositories])

  // Save preferences when they change
  useEffect(() => {
    setUserPreferences(prev => ({
      ...prev,
      sortBy,
      languageFilter,
      searchTerm
    }))
  }, [sortBy, languageFilter, searchTerm, setUserPreferences])

  // Load preferences on mount
  useEffect(() => {
    setSortBy(userPreferences.sortBy)
    setLanguageFilter(userPreferences.languageFilter)
    setSearchTerm(userPreferences.searchTerm)
  }, [userPreferences])

  const generateDocumentation = useCallback(async (repo: Repository, retryCount = 0) => {
    if (generatingRepos.has(repo.id)) return // Prevent duplicate requests
    
    setGeneratingRepos(prev => new Set(prev).add(repo.id))
    
    try {
      const response = await fetch('/api/generate-docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          repositoryId: repo.id,
          owner: repo.full_name.split('/')[0],
          name: repo.name
        }),
        signal: AbortSignal.timeout(45000) // 45 second timeout
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // Update the repository with new documentation
        setRepositories(prev => prev.map(r => 
          r.id === repo.id 
            ? { 
                ...r, 
                documentation_status: 'completed',
                documentation_content: result.content,
                last_generated: new Date().toISOString()
              }
            : r
        ))

        setDocumentationModal({
          isOpen: true,
          content: result.content,
          repositoryName: repo.name,
          provider: result.provider
        })
      } else {
        throw new Error(result.error || 'Failed to generate documentation')
      }
    } catch (error) {
      console.error('Error generating documentation:', error)
      
      // Retry logic
      if (retryCount < 2) {
        setTimeout(() => generateDocumentation(repo, retryCount + 1), 2000)
        return
      }

      // Update repository status to failed
      setRepositories(prev => prev.map(r => 
        r.id === repo.id 
          ? { ...r, documentation_status: 'failed' }
          : r
      ))

      setError(error instanceof Error ? error.message : 'Failed to generate documentation')
    } finally {
      setGeneratingRepos(prev => {
        const newSet = new Set(prev)
        newSet.delete(repo.id)
        return newSet
      })
    }
  }, [generatingRepos])

  const showDocumentation = useCallback((repo: Repository) => {
    if (repo.documentation_content) {
      setDocumentationModal({
        isOpen: true,
        content: repo.documentation_content,
        repositoryName: repo.name,
        provider: 'Previously Generated'
      })
    }
  }, [])

  const filteredRepositories = useMemo(() => {
  // Use immediate searchTerm so filtering is reactive when typing
  const q = (searchTerm || '').trim().toLowerCase()
    const filtered = repositories.filter(repo => {
      if (!q) return !languageFilter || repo.language === languageFilter

      const name = (repo.name || '').toLowerCase()
      const full = (repo.full_name || '').toLowerCase()
      const desc = (repo.description || '').toLowerCase()

      const matchesSearch = name.includes(q) || full.includes(q) || desc.includes(q)
      const matchesLanguage = !languageFilter || repo.language === languageFilter
      return matchesSearch && matchesLanguage
    })

    // Sort repositories
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'updated':
          return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
        case 'stars':
          return b.stargazers_count - a.stargazers_count
        case 'name':
        default:
          return a.name.localeCompare(b.name)
      }
    })

    return filtered
  }, [repositories, languageFilter, sortBy, searchTerm])

  const languages = useMemo(() => 
    Array.from(new Set(repositories.map(r => r.language).filter(Boolean))) as string[],
    [repositories]
  )

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                <BookOpen className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">DocifyByMe</h1>
                <p className="text-xs sm:text-sm text-gray-500 truncate hidden sm:block">
                  Welcome back, {session?.user?.name}
                </p>
              </div>
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center space-x-3">
              <button
                onClick={fetchRepositories}
                disabled={loading}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 focus-ring"
                aria-label="Refresh repositories"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden md:inline">Refresh</span>
              </button>
              
              <button
                onClick={async () => {
                  // Revoke token on server, clear storage, then sign out
                  try {
                    await fetch('/api/auth/revoke', { method: 'POST' })
                  } catch {
                    // ignore
                  }
                  // Clear local caches and storages that may remember account
                  try { window.localStorage.clear() } catch {}
                  try { window.sessionStorage.clear() } catch {}
                  // Sign out and redirect to sign-in so GitHub account picker appears
                  await signOut({ callbackUrl: '/api/auth/signin' })
                }}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors focus-ring"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors focus-ring"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="sm:hidden mt-4 space-y-2"
              >
                <button
                  onClick={fetchRepositories}
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 focus-ring"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors focus-ring"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Display */}
        {error && (
          <ErrorDisplay error={error} onRetry={fetchRepositories} />
        )}

             {/* Filters */}
        <div className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search repositories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(String(e.target.value || ''))}
                className="relative z-20 w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                aria-label="Search repositories"
              />
            </div>

            {/* Language Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="relative z-20 pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-colors"
                aria-label="Filter by language"
              >
                <option value="">All Languages</option>
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'updated' | 'stars')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              aria-label="Sort repositories"
            >
              <option value="name">Sort by Name</option>
              <option value="updated">Sort by Updated</option>
              <option value="stars">Sort by Stars</option>
            </select>
          </div>

          <div className="text-sm text-gray-500">
            {filteredRepositories.length} of {repositories.length} repositories
          </div>
        </div>

        {/* DEBUG: runtime state inspector - remove after debugging */}
        <div className="mb-4 p-3 bg-white/5 rounded-md text-sm text-gray-300">
          <div><strong>debug.searchTerm:</strong> {String(searchTerm)}</div>
          <div><strong>debug.languageFilter:</strong> {String(languageFilter)}</div>
          <div><strong>debug.languages:</strong> {JSON.stringify(languages)}</div>
          <div><strong>debug.filteredCount:</strong> {filteredRepositories.length}</div>
        </div>

        {/* Repository Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredRepositories.map((repo) => (
              <RepositoryCard
                key={repo.id}
                repo={repo}
                onGenerate={generateDocumentation}
                onShowDocs={showDocumentation}
                isGenerating={generatingRepos.has(repo.id)}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredRepositories.length === 0 && !loading && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No repositories found</h3>
            <p className="text-gray-500">
              {searchTerm || languageFilter 
                ? 'Try adjusting your search or filters.'
                : 'You don\'t have any repositories yet.'
              }
            </p>
          </motion.div>
        )}
      </main>

      {/* Documentation Modal */}
      <AnimatePresence>
        {documentationModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setDocumentationModal(prev => ({ ...prev, isOpen: false }))}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Documentation for {documentationModal.repositoryName}
                  </h2>
                  {documentationModal.provider && (
                    <p className="text-sm text-gray-500">
                      Generated by {documentationModal.provider}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyToClipboard(documentationModal.content)}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors focus-ring rounded-lg"
                    aria-label="Copy documentation to clipboard"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => setDocumentationModal(prev => ({ ...prev, isOpen: false }))}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors focus-ring rounded-lg"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono bg-gray-50 p-4 rounded-lg">
                  {documentationModal.content}
                </pre>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
