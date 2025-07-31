import { GoogleGenerativeAI } from '@google/generative-ai'
import { Mistral } from '@mistralai/mistralai'

export interface AIProvider {
  name: 'gemini' | 'mistral' | 'openrouter'
  generateDocumentation: (repositoryData: Record<string, unknown>) => Promise<string>
}

class GeminiProvider implements AIProvider {
  name = 'gemini' as const
  private client: GoogleGenerativeAI

  constructor() {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GOOGLE_GEMINI_API_KEY environment variable is required')
    }
    this.client = new GoogleGenerativeAI(apiKey)
  }

  async generateDocumentation(repositoryData: Record<string, unknown>): Promise<string> {
    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-1.5-flash' })
      
      const prompt = `
Generate comprehensive documentation for the following GitHub repository:

Repository Name: ${repositoryData.name}
Description: ${repositoryData.description || 'No description provided'}
Language: ${repositoryData.language || 'Unknown'}
Stars: ${repositoryData.stargazers_count || 0}
Forks: ${repositoryData.forks_count || 0}

File Structure:
${JSON.stringify(repositoryData.files, null, 2)}

README Content:
${repositoryData.readme || 'No README found'}

Please generate a comprehensive documentation that includes:
1. Project Overview
2. Installation Instructions
3. Usage Guide
4. API Documentation (if applicable)
5. Contributing Guidelines
6. License Information

Format the response in Markdown.
`

      const result = await model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Gemini API error:', error)
      throw new Error('Failed to generate documentation with Gemini')
    }
  }
}

class MistralProvider implements AIProvider {
  name = 'mistral' as const
  private client: Mistral

  constructor() {
    const apiKey = process.env.MISTRAL_API_KEY
    if (!apiKey) {
      throw new Error('MISTRAL_API_KEY environment variable is required')
    }
    this.client = new Mistral({
      apiKey: apiKey
    })
  }

  async generateDocumentation(repositoryData: Record<string, unknown>): Promise<string> {
    try {
      const prompt = `
Generate comprehensive documentation for the following GitHub repository:

Repository Name: ${repositoryData.name}
Description: ${repositoryData.description || 'No description provided'}
Language: ${repositoryData.language || 'Unknown'}
Stars: ${repositoryData.stargazers_count || 0}
Forks: ${repositoryData.forks_count || 0}

File Structure:
${JSON.stringify(repositoryData.files, null, 2)}

README Content:
${repositoryData.readme || 'No README found'}

Please generate a comprehensive documentation that includes:
1. Project Overview
2. Installation Instructions
3. Usage Guide
4. API Documentation (if applicable)
5. Contributing Guidelines
6. License Information

Format the response in Markdown.
`

      const result = await this.client.chat.complete({
        model: 'mistral-large-latest',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      const content = result.choices?.[0]?.message?.content
      return typeof content === 'string' ? content : 'Failed to generate documentation'
    } catch (error) {
      console.error('Mistral API error:', error)
      throw new Error('Failed to generate documentation with Mistral')
    }
  }
}

class OpenRouterProvider implements AIProvider {
  name = 'openrouter' as const
  private apiKey: string
  private baseUrl = 'https://openrouter.ai/api/v1'

  constructor() {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY environment variable is required')
    }
    this.apiKey = apiKey
  }

  async generateDocumentation(repositoryData: Record<string, unknown>): Promise<string> {
    try {
      const prompt = `
Generate comprehensive documentation for the following GitHub repository:

Repository Name: ${repositoryData.name}
Description: ${repositoryData.description || 'No description provided'}
Language: ${repositoryData.language || 'Unknown'}
Stars: ${repositoryData.stargazers_count || 0}
Forks: ${repositoryData.forks_count || 0}

README Content:
${repositoryData.readme ? String(repositoryData.readme).substring(0, 2000) : 'No README available'}

File Structure:
${JSON.stringify(repositoryData.files, null, 2)}

Important Files:
${JSON.stringify(repositoryData.importantFiles, null, 2)}

Generate a comprehensive documentation that includes:
1. Project Overview
2. Installation Instructions
3. Usage Examples
4. API Documentation (if applicable)
5. Configuration Options
6. Contributing Guidelines
7. License Information

Format the response in Markdown.
`

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'DocifyByMe - AI Documentation Generator'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-exp:free', // Using Gemini 2.0 Flash through OpenRouter
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000,
          stream: false
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
      }

      const result = await response.json()
      const content = result.choices?.[0]?.message?.content
      
      if (!content || typeof content !== 'string') {
        throw new Error('Invalid response from OpenRouter API')
      }

      return content
    } catch (error) {
      console.error('OpenRouter API error:', error)
      if (error instanceof Error) {
        throw new Error(`Failed to generate documentation with OpenRouter: ${error.message}`)
      }
      throw new Error('Failed to generate documentation with OpenRouter')
    }
  }
}

export class AIService {
  private providers: AIProvider[]
  private currentProviderIndex: number = 0

  constructor() {
    this.providers = []
    
    // Only add providers if their API keys are available
    try {
      if (process.env.GOOGLE_GEMINI_API_KEY) {
        this.providers.push(new GeminiProvider())
        console.log('Gemini provider initialized')
      }
    } catch (error) {
      console.warn('Failed to initialize Gemini provider:', error)
    }

    try {
      if (process.env.MISTRAL_API_KEY) {
        this.providers.push(new MistralProvider())
        console.log('Mistral provider initialized')
      }
    } catch (error) {
      console.warn('Failed to initialize Mistral provider:', error)
    }

    try {
      if (process.env.OPENROUTER_API_KEY) {
        this.providers.push(new OpenRouterProvider())
        console.log('OpenRouter provider initialized')
      }
    } catch (error) {
      console.warn('Failed to initialize OpenRouter provider:', error)
    }

    if (this.providers.length === 0) {
      console.error('No AI providers available! Please check your environment variables.')
    }
  }

  async generateDocumentation(repositoryData: Record<string, unknown>): Promise<{ content: string; provider: string }> {
    if (this.providers.length === 0) {
      throw new Error('No AI providers are configured. Please check your environment variables (GOOGLE_GEMINI_API_KEY, MISTRAL_API_KEY).')
    }

    let lastError: Error | null = null

    // Try each provider in order
    for (let i = 0; i < this.providers.length; i++) {
      const provider = this.providers[this.currentProviderIndex]
      
      try {
        console.log(`Attempting documentation generation with ${provider.name}...`)
        const content = await provider.generateDocumentation(repositoryData)
        console.log(`Successfully generated documentation with ${provider.name}`)
        return { content, provider: provider.name }
      } catch (error) {
        console.error(`${provider.name} failed:`, error)
        lastError = error as Error
        
        // Move to next provider
        this.currentProviderIndex = (this.currentProviderIndex + 1) % this.providers.length
      }
    }

    // If all providers fail, provide a helpful error message
    const errorMessage = this.providers.length === 1 
      ? `AI provider (${this.providers[0].name}) failed: ${lastError?.message}`
      : `All ${this.providers.length} AI providers failed. Last error: ${lastError?.message}`
    
    throw new Error(errorMessage)
  }

  getCurrentProvider(): string {
    if (this.providers.length === 0) {
      return 'none'
    }
    return this.providers[this.currentProviderIndex].name
  }

  getAvailableProviders(): string[] {
    return this.providers.map(p => p.name)
  }
}

export const aiService = new AIService()
