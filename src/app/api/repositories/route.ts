import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { GitHubService } from '@/lib/github-service'

// Import authOptions from NextAuth route
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
