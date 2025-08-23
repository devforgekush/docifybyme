import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { GitHubService } from '@/lib/github-service'
import { aiService } from '@/lib/ai-service'
import { authOptions } from '@/lib/auth-config'

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

    // Add timeout protection (30 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Documentation generation timeout after 30 seconds')), 30000)
    })

    try {
      // Generate documentation with timeout protection
      const result = await Promise.race([
        generateDocumentationSync(session.accessToken, owner, name, repositoryId, session.user.githubId),
        timeoutPromise
      ])

      return NextResponse.json(result)
    } catch (timeoutError) {
      console.error('Timeout or generation error:', timeoutError)
      
      // Return a fallback response for timeout
      return NextResponse.json({
        success: false,
        error: 'Documentation generation timed out. This may be due to high server load or API limits. Please try again later.',
        repositoryId: repositoryId,
        timestamp: new Date().toISOString()
      }, { status: 408 }) // Request Timeout
    }

  } catch (error) {
    console.error('Error generating documentation:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate documentation', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
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
