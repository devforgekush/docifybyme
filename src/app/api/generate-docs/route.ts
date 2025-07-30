import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { GitHubService } from '@/lib/github-service'
import { aiService } from '@/lib/ai-service'
import { createRouteClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.accessToken || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { repositoryId, owner, name } = await request.json()

    if (!repositoryId || !owner || !name) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const supabase = await createRouteClient()

    // Update repository status to generating
    await supabase
      .from('repositories')
      .update({
        documentation_status: 'generating',
        updated_at: new Date().toISOString()
      })
      .eq('github_repo_id', repositoryId)
      .eq('user_id', session.user.id)

    // Create documentation job
    const { data: jobData, error: jobError } = await supabase
      .from('documentation_jobs')
      .insert({
        user_id: session.user.id,
        repository_id: repositoryId,
        status: 'processing',
        ai_provider: aiService.getCurrentProvider()
      })
      .select()
      .single()

    if (jobError) {
      throw new Error('Failed to create documentation job')
    }

    // Start documentation generation in background
    generateDocumentationAsync(session.accessToken, owner, name, repositoryId, session.user.id, jobData.id)

    return NextResponse.json({ 
      message: 'Documentation generation started',
      jobId: jobData.id
    })
  } catch (error) {
    console.error('Error starting documentation generation:', error)
    return NextResponse.json(
      { error: 'Failed to start documentation generation' },
      { status: 500 }
    )
  }
}

async function generateDocumentationAsync(
  accessToken: string,
  owner: string,
  name: string,
  repositoryId: number,
  userId: string,
  jobId: string
) {
  const supabase = await createRouteClient()

  try {
    // Fetch repository data from GitHub
    const githubService = new GitHubService(accessToken)
    const repositoryData = await githubService.getRepositoryData(owner, name)

    // Generate documentation using AI
    const { content, provider } = await aiService.generateDocumentation(repositoryData)

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
      .eq('user_id', userId)

    // Update job status
    await supabase
      .from('documentation_jobs')
      .update({
        status: 'completed',
        ai_provider: provider,
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId)

  } catch (error) {
    console.error('Error generating documentation:', error)

    // Update repository status to failed
    await supabase
      .from('repositories')
      .update({
        documentation_status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('github_repo_id', repositoryId)
      .eq('user_id', userId)

    // Update job status
    await supabase
      .from('documentation_jobs')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId)
  }
}
