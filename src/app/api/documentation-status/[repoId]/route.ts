import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ repoId: string }> }
) {
  try {
    const { repoId } = await params

    // For now, return a mock status since we're not using database
    // In a real implementation, this would check the database
    console.log(`Checking documentation status for repository ${repoId}`)

    // Mock response - in reality this would check the database
    const mockStatus = {
      status: 'completed',
      documentation_content: 'Mock documentation content - check server logs for actual generated content',
      last_generated: new Date().toISOString()
    }

    return NextResponse.json(mockStatus)
  } catch (error) {
    console.error('Error checking documentation status:', error)
    return NextResponse.json(
      { error: 'Failed to check documentation status' },
      { status: 500 }
    )
  }
}
