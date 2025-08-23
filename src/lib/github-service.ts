import { Octokit } from '@octokit/rest'
import { cache } from './cache'

export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  description: string | null
  private: boolean
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  updated_at: string | null
  default_branch: string
}

export interface RepositoryFile {
  name: string
  path: string
  type: 'file' | 'dir'
  size?: number
  content?: string
}

export class GitHubService {
  private octokit: Octokit
  private readonly cacheTTL = 10 * 60 * 1000 // 10 minutes for repositories
  private readonly fileCacheTTL = 5 * 60 * 1000 // 5 minutes for files

  constructor(accessToken: string) {
    this.octokit = new Octokit({
      auth: accessToken,
      timeZone: 'UTC'
    })
  }

  async getUserRepositories(): Promise<GitHubRepository[]> {
    const cacheKey = `repos:${this.octokit.auth}`
    const cached = cache.get<GitHubRepository[]>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const { data } = await this.octokit.rest.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 100,
        type: 'all'
      })

      const repositories = data.map(repo => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        private: repo.private,
        html_url: repo.html_url,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        updated_at: repo.updated_at,
        default_branch: repo.default_branch
      }))

      cache.set(cacheKey, repositories, this.cacheTTL)
      return repositories
    } catch (error) {
      console.error('Error fetching repositories:', error)
      throw new Error('Failed to fetch repositories')
    }
  }

  async getRepositoryStructure(owner: string, repo: string, path: string = ''): Promise<RepositoryFile[]> {
    const cacheKey = `structure:${owner}:${repo}:${path}`
    const cached = cache.get<RepositoryFile[]>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path
      })

      const structure = Array.isArray(data) 
        ? data.map(item => ({
            name: item.name,
            path: item.path,
            type: item.type as 'file' | 'dir',
            size: item.size
          }))
        : [{
            name: data.name,
            path: data.path,
            type: data.type as 'file' | 'dir',
            size: data.size
          }]

      cache.set(cacheKey, structure, this.fileCacheTTL)
      return structure
    } catch (error) {
      console.error('Error fetching repository structure:', error)
      return []
    }
  }

  async getFileContent(owner: string, repo: string, path: string): Promise<string | null> {
    const cacheKey = `file:${owner}:${repo}:${path}`
    const cached = cache.get<string>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path
      })

      if ('content' in data && data.content) {
        const content = Buffer.from(data.content, 'base64').toString('utf-8')
        cache.set(cacheKey, content, this.fileCacheTTL)
        return content
      }

      return null
    } catch (error) {
      console.error('Error fetching file content:', error)
      return null
    }
  }

  async getRepositoryReadme(owner: string, repo: string): Promise<string | null> {
    const cacheKey = `readme:${owner}:${repo}`
    const cached = cache.get<string>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const { data } = await this.octokit.rest.repos.getReadme({
        owner,
        repo
      })

      if (data.content) {
        const content = Buffer.from(data.content, 'base64').toString('utf-8')
        cache.set(cacheKey, content, this.fileCacheTTL)
        return content
      }

      return null
    } catch (error) {
      console.error('Error fetching README:', error)
      return null
    }
  }

  async getRepositoryData(owner: string, repo: string) {
    const cacheKey = `repoData:${owner}:${repo}`
    const cached = cache.get<Record<string, unknown>>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      // Get repository details
      const { data: repoData } = await this.octokit.rest.repos.get({
        owner,
        repo
      })

      // Get file structure (limit to root level and important directories)
      const structure = await this.getRepositoryStructure(owner, repo)
      
      // Get README content
      const readme = await this.getRepositoryReadme(owner, repo)

      // Get package.json or other important files
      const importantFiles = ['package.json', 'requirements.txt', 'Cargo.toml', 'pom.xml', 'composer.json']
      const fileContents: Record<string, string> = {}

      // Fetch important files in parallel for better performance
      const filePromises = importantFiles.map(async (filename) => {
        const content = await this.getFileContent(owner, repo, filename)
        if (content) {
          fileContents[filename] = content
        }
      })

      await Promise.all(filePromises)

      const result = {
        ...repoData,
        files: structure,
        readme,
        importantFiles: fileContents
      }

      cache.set(cacheKey, result, this.cacheTTL)
      return result
    } catch (error) {
      console.error('Error fetching repository data:', error)
      throw new Error('Failed to fetch repository data')
    }
  }

  // Clear cache for a specific repository
  clearRepositoryCache(owner: string, repo: string): void {
    const patterns = [
      `repos:${this.octokit.auth}`,
      `structure:${owner}:${repo}:`,
      `file:${owner}:${repo}:`,
      `readme:${owner}:${repo}`,
      `repoData:${owner}:${repo}`
    ]
    
    for (const pattern of patterns) {
      for (const key of cache.keys()) {
        if (key.startsWith(pattern)) {
          cache.delete(key)
        }
      }
    }
  }
}
