import { Octokit } from '@octokit/rest'

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

  constructor(accessToken: string) {
    this.octokit = new Octokit({
      auth: accessToken
    })
  }

  async getUserRepositories(): Promise<GitHubRepository[]> {
    try {
      const { data } = await this.octokit.rest.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 100
      })

      return data.map(repo => ({
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
    } catch (error) {
      console.error('Error fetching repositories:', error)
      throw new Error('Failed to fetch repositories')
    }
  }

  async getRepositoryStructure(owner: string, repo: string, path: string = ''): Promise<RepositoryFile[]> {
    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path
      })

      if (Array.isArray(data)) {
        return data.map(item => ({
          name: item.name,
          path: item.path,
          type: item.type as 'file' | 'dir',
          size: item.size
        }))
      } else {
        return [{
          name: data.name,
          path: data.path,
          type: data.type as 'file' | 'dir',
          size: data.size
        }]
      }
    } catch (error) {
      console.error('Error fetching repository structure:', error)
      return []
    }
  }

  async getFileContent(owner: string, repo: string, path: string): Promise<string | null> {
    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path
      })

      if ('content' in data && data.content) {
        return Buffer.from(data.content, 'base64').toString('utf-8')
      }

      return null
    } catch (error) {
      console.error('Error fetching file content:', error)
      return null
    }
  }

  async getRepositoryReadme(owner: string, repo: string): Promise<string | null> {
    try {
      const { data } = await this.octokit.rest.repos.getReadme({
        owner,
        repo
      })

      if (data.content) {
        return Buffer.from(data.content, 'base64').toString('utf-8')
      }

      return null
    } catch (error) {
      console.error('Error fetching README:', error)
      return null
    }
  }

  async getRepositoryData(owner: string, repo: string) {
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

      for (const filename of importantFiles) {
        const content = await this.getFileContent(owner, repo, filename)
        if (content) {
          fileContents[filename] = content
        }
      }

      return {
        ...repoData,
        files: structure,
        readme,
        importantFiles: fileContents
      }
    } catch (error) {
      console.error('Error fetching repository data:', error)
      throw new Error('Failed to fetch repository data')
    }
  }
}
