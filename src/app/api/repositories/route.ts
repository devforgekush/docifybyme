import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { GitHubService } from '@/lib/github-service'
import { authOptions } from '@/lib/auth-config'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken || !session?.user?.githubId) {
      console.log('No valid session found:', { 
        hasSession: !!session, 
        hasAccessToken: !!session?.accessToken,
        hasGithubId: !!session?.user?.githubId 
      })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Fetching repositories for user:', session.user.username)

    // Get repositories from GitHub
    const githubService = new GitHubService(session.accessToken)
    const repositories = await githubService.getUserRepositories()

    console.log(`Found ${repositories.length} repositories from GitHub`)

    // For now, return repositories without database integration
    // TODO: Re-enable database integration after setting up tables
    const reposWithStatus = repositories.map(repo => ({
      ...repo,
      documentation_status: 'pending' as const,
      documentation_content: null,
      last_generated: null
    }))

    return NextResponse.json(reposWithStatus)
  } catch (error) {
    console.error('Error fetching repositories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch repositories', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
