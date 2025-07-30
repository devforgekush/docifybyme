import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { createRouteClient } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get session without auth options for now - will work with proper setup
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: repositoryId } = await params
    const supabase = await createRouteClient()

    // Get repository documentation status
    const { data, error } = await supabase
      .from('repositories')
      .select('documentation_status, documentation_content, last_generated')
      .eq('github_repo_id', repositoryId)
      .eq('user_id', session.user.id)
      .single()

    if (error) {
      throw new Error('Repository not found')
    }

    return NextResponse.json({
      status: data.documentation_status,
      documentation_content: data.documentation_content,
      last_generated: data.last_generated
    })
  } catch (error) {
    console.error('Error fetching documentation status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documentation status' },
      { status: 500 }
    )
  }
}
