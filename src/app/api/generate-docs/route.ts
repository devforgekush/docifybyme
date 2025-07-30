import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { GitHubService } from '@/lib/github-service'
import { aiService } from '@/lib/ai-service'
import { createRouteClient } from '@/lib/supabase'

// Import authOptions for proper session handling
import { NextAuthOptions } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'

const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || 'demo-client-id',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'demo-client-secret',
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

    const { repositoryId, owner, name } = await request.json()

    if (!repositoryId || !owner || !name) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    console.log(`Starting documentation generation for ${owner}/${name}`)

    // Start documentation generation in background
    generateDocumentationAsync(session.accessToken, owner, name, repositoryId, session.user.githubId)

    return NextResponse.json({ 
      message: 'Documentation generation started',
      repositoryId: repositoryId
    })
  } catch (error) {
    console.error('Error starting documentation generation:', error)
    return NextResponse.json(
      { error: 'Failed to start documentation generation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function generateDocumentationAsync(
  accessToken: string,
  owner: string,
  name: string,
  repositoryId: number,
  githubUserId: number
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

    // For now, log the documentation instead of saving to database
    console.log(`Documentation generated successfully for ${owner}/${name}:`)
    console.log(`Provider: ${provider}`)
    console.log(`Content length: ${content.length} characters`)
    
    // TODO: Save to database when tables are ready
    /*
    const supabase = await createRouteClient()
    
    // Update repository with generated documentation
    await supabase
      .from('repositories')
      .update({
        documentation_status: 'completed',
        documentation_content: content,
        last_generated: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('github_repo_id', repositoryId)
      .eq('github_user_id', githubUserId)
    */

  } catch (error) {
    console.error('Error generating documentation:', error)
    console.error(`Failed to generate documentation for ${owner}/${name}:`, error instanceof Error ? error.message : 'Unknown error')
    
    // TODO: Update database status when tables are ready
    /*
    const supabase = await createRouteClient()
    
    // Update repository status to failed
    await supabase
      .from('repositories')
      .update({
        documentation_status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('github_repo_id', repositoryId)
      .eq('github_user_id', githubUserId)
    */
  }
}
