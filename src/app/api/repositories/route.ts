import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { GitHubService, GitHubRepository } from '@/lib/github-service'
import { createRouteClient } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await getServerSession()
    
    if (!session?.accessToken || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get repositories from GitHub
    const githubService = new GitHubService(session.accessToken)
    const repositories = await githubService.getUserRepositories()

    // Get documentation status from Supabase
    const supabase = await createRouteClient()
    const { data: dbRepos } = await supabase
      .from('repositories')
      .select('github_repo_id, documentation_status, documentation_content, last_generated')
      .eq('user_id', session.user.id)

    // Merge GitHub data with database status
    const reposWithStatus = repositories.map(repo => {
      const dbRepo = dbRepos?.find((db: { github_repo_id: number }) => db.github_repo_id === repo.id)
      return {
        ...repo,
        documentation_status: dbRepo?.documentation_status || 'pending',
        documentation_content: dbRepo?.documentation_content,
        last_generated: dbRepo?.last_generated
      }
    })

    // Sync repositories to database
    await syncRepositoriesToDatabase(repositories, session.user.id)

    return NextResponse.json(reposWithStatus)
  } catch (error) {
    console.error('Error fetching repositories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch repositories' },
      { status: 500 }
    )
  }
}

async function syncRepositoriesToDatabase(repositories: GitHubRepository[], userId: string) {
  const supabase = await createRouteClient()

  for (const repo of repositories) {
    await supabase
      .from('repositories')
      .upsert({
        user_id: userId,
        github_repo_id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        html_url: repo.html_url,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'github_repo_id'
      })
  }
}
