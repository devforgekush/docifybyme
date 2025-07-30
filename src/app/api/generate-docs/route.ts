import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { GitHubService } from '@/lib/github-service'
import { aiService } from '@/lib/ai-service'

// Import authOptions for proper session handling
import { NextAuthOptions } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'

const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email repo'
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === 'github' && profile) {
        token.githubId = profile.id
        token.username = profile.login
        token.accessToken = account.access_token || ''
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.githubId = token.githubId as number
        session.user.username = token.username as string
        session.accessToken = token.accessToken as string
      }
      return session
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken || !session?.user?.githubId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { repositoryId, owner, name } = body

    // Validate required parameters
    if (!repositoryId || !owner || !name) {
      return NextResponse.json(
        { error: 'Missing required parameters: repositoryId, owner, and name are required' },
        { status: 400 }
      )
    }

    // Validate parameter types and format
    if (typeof repositoryId !== 'number' || typeof owner !== 'string' || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Invalid parameter types' },
        { status: 400 }
      )
    }

    // Validate parameter lengths to prevent abuse
    if (owner.length > 100 || name.length > 100 || owner.trim() === '' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid parameter values' },
        { status: 400 }
      )
    }

    console.log(`Starting documentation generation for ${owner}/${name}`)

    // Generate documentation synchronously to return it immediately
    const result = await generateDocumentationSync(session.accessToken, owner, name, repositoryId, session.user.githubId)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error generating documentation:', error)
    return NextResponse.json(
      { error: 'Failed to generate documentation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function generateDocumentationSync(
  accessToken: string,
  owner: string,
  name: string,
  _repositoryId: number,
  _githubUserId: number // eslint-disable-line @typescript-eslint/no-unused-vars
) {
  try {
    console.log(`Generating documentation for ${owner}/${name}...`)

    // Fetch repository data from GitHub
    const githubService = new GitHubService(accessToken)
    const repositoryData = await githubService.getRepositoryData(owner, name)

    console.log(`Fetched repository data for ${owner}/${name}`)

    // Generate documentation using AI
    const { content, provider } = await aiService.generateDocumentation(repositoryData)

    console.log(`Generated documentation using ${provider} for ${owner}/${name}`)
    console.log(`Content length: ${content.length} characters`)
    
    return {
      success: true,
      content: content,
      provider: provider,
      repositoryId: _repositoryId,
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('Error generating documentation:', error)
    console.error(`Failed to generate documentation for ${owner}/${name}:`, error instanceof Error ? error.message : 'Unknown error')
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      repositoryId: _repositoryId,
      timestamp: new Date().toISOString()
    }
  }
}
