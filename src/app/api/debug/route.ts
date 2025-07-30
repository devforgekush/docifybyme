import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  try {
    // Check environment variables
    const envCheck = {
      GOOGLE_GEMINI_API_KEY: !!process.env.GOOGLE_GEMINI_API_KEY,
      MISTRAL_API_KEY: !!process.env.MISTRAL_API_KEY,
      GITHUB_CLIENT_ID: !!process.env.GITHUB_CLIENT_ID,
      GITHUB_CLIENT_SECRET: !!process.env.GITHUB_CLIENT_SECRET,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NODE_ENV: process.env.NODE_ENV
    }

    // Try to initialize AI service
    let aiServiceStatus = 'unknown'
    try {
      const { aiService } = await import('@/lib/ai-service')
      const availableProviders = aiService.getAvailableProviders()
      aiServiceStatus = `Available providers: ${availableProviders.join(', ')}`
    } catch (error) {
      aiServiceStatus = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }

    return NextResponse.json({
      status: 'API is running',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      aiService: aiServiceStatus,
      deployment: {
        platform: 'Netlify',
        region: process.env.AWS_REGION || 'unknown'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Debug endpoint failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
