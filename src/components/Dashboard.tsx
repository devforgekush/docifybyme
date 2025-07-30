'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Github, 
  Star, 
  GitFork, 
  BookOpen, 
  RefreshCw, 
  Download,
  LogOut,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
  Menu,
  X
} from 'lucide-react'
import { GitHubRepository } from '@/lib/github-service'

interface Repository extends GitHubRepository {
  documentation_status?: 'pending' | 'generating' | 'completed' | 'failed'
  documentation_content?: string | null
  last_generated?: string | null
}

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

  const fetchRepositories = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch('/api/repositories')
      if (response.ok) {
        const data = await response.json()
        setRepositories(data)
      } else {
        setError('Failed to fetch repositories')
      }
    } catch (error) {
      console.error('Error fetching repositories:', error)
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRepositories()
  }, [fetchRepositories])

  const pollDocumentationStatus = useCallback(async (repoId: number) => {
    const poll = async () => {
      try {
        const response = await fetch(`/api/documentation-status/${repoId}`)
        if (response.ok) {
          const data = await response.json()
          
          setRepositories(prev => 
            prev.map(r => 
              r.id === repoId 
                ? { 
                    ...r, 
                    documentation_status: data.status,
                    documentation_content: data.documentation_content,
                    last_generated: data.last_generated
                  }
                : r
            )
          )

          if (data.status === 'completed' || data.status === 'failed') {
            setGeneratingRepos(prev => {
              const newSet = new Set(prev)
              newSet.delete(repoId)
              return newSet
            })
            return
          }

          // Continue polling
          setTimeout(poll, 3000)
        }
      } catch (error) {
        console.error('Error polling status:', error)
        setGeneratingRepos(prev => {
          const newSet = new Set(prev)
          newSet.delete(repoId)
          return newSet
        })
      }
    }

    poll()
  }, [])

  const generateDocumentation = useCallback(async (repo: Repository) => {
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
        })
      })

      if (response.ok) {
        // Update repository status
        setRepositories(prev => 
          prev.map(r => 
            r.id === repo.id 
              ? { ...r, documentation_status: 'generating' }
              : r
          )
        )
        
        // Poll for completion
        pollDocumentationStatus(repo.id)
      } else {
        throw new Error('Failed to start documentation generation')
      }
    } catch (error) {
      console.error('Error generating documentation:', error)
      setGeneratingRepos(prev => {
        const newSet = new Set(prev)
        newSet.delete(repo.id)
        return newSet
      })
    }
  }, [pollDocumentationStatus])

  const filteredRepositories = useMemo(() => {
    const filtered = repositories.filter(repo => {
      const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           repo.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [repositories, searchTerm, languageFilter, sortBy])

  const languages = useMemo(() => 
    Array.from(new Set(repositories.map(r => r.language).filter(Boolean))) as string[],
    [repositories]
  )

  const getStatusIcon = useCallback((status?: string) => {
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
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your repositories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
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
                className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden md:inline">Refresh</span>
              </button>
              
              <button
                onClick={() => signOut()}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
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
                className="sm:hidden mt-4 pt-4 border-t border-gray-200"
              >
                <div className="flex flex-col space-y-2">
                  <p className="text-sm text-gray-500 mb-2">
                    Welcome back, {session?.user?.name}
                  </p>
                  <button
                    onClick={() => {
                      fetchRepositories()
                      setMobileMenuOpen(false)
                    }}
                    disabled={loading}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>Refresh Repositories</span>
                  </button>
                  
                  <button
                    onClick={() => signOut()}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 max-w-md lg:max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Search repositories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={languageFilter}
                  onChange={(e) => setLanguageFilter(e.target.value)}
                  className="pl-9 pr-8 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm sm:text-base min-w-0 sm:min-w-[140px]"
                >
                  <option value="">All Languages</option>
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'updated' | 'stars')}
                className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base min-w-0 sm:min-w-[140px]"
              >
                <option value="name">Sort by Name</option>
                <option value="updated">Sort by Updated</option>
                <option value="stars">Sort by Stars</option>
              </select>
            </div>
          </div>
        </div>

        {/* Repository Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          <AnimatePresence>
            {filteredRepositories.map((repo) => (
              <motion.div
                key={repo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 sm:p-6 border"
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                      {repo.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">
                      {repo.description || 'No description available'}
                    </p>
                  </div>
                  
                  <div className="ml-2 sm:ml-4 flex-shrink-0">
                    {getStatusIcon(repo.documentation_status)}
                  </div>
                </div>

                <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                  {repo.language && (
                    <span className="flex items-center">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-500 mr-1" />
                      <span className="truncate">{repo.language}</span>
                    </span>
                  )}
                  <span className="flex items-center">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {repo.stargazers_count}
                  </span>
                  <span className="flex items-center">
                    <GitFork className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {repo.forks_count}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => generateDocumentation(repo)}
                    disabled={generatingRepos.has(repo.id) || repo.documentation_status === 'generating'}
                    className="flex-1 bg-blue-500 text-white py-2 px-3 sm:px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    {generatingRepos.has(repo.id) || repo.documentation_status === 'generating' ? (
                      <>
                        <Loader className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Generate Docs</span>
                        <span className="sm:hidden">Generate</span>
                      </>
                    )}
                  </button>
                  
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-100 text-gray-700 py-2 px-3 sm:px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center flex-shrink-0"
                  >
                    <Github className="w-3 h-3 sm:w-4 sm:h-4" />
                  </a>
                </div>

                {repo.documentation_status === 'completed' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t"
                  >
                    <button className="w-full bg-green-500 text-white py-2 px-3 sm:px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base">
                      <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Download Documentation</span>
                      <span className="sm:hidden">Download</span>
                    </button>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredRepositories.length === 0 && (
          <div className="text-center py-12">
            <Github className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No repositories found</h3>
            <p className="text-gray-500">
              {searchTerm || languageFilter 
                ? 'Try adjusting your search or filter criteria'
                : 'Connect your GitHub account to see your repositories'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
