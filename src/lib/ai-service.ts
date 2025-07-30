import { GoogleGenerativeAI } from '@google/generative-ai'
import { Mistral } from '@mistralai/mistralai'

export interface AIProvider {
  name: 'gemini' | 'mistral'
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

export class AIService {
  private providers: AIProvider[]
  private currentProviderIndex: number = 0

  constructor() {
    this.providers = [
      new GeminiProvider(),
      new MistralProvider()
    ]
  }

  async generateDocumentation(repositoryData: Record<string, unknown>): Promise<{ content: string; provider: string }> {
    let lastError: Error | null = null

    // Try each provider in order
    for (let i = 0; i < this.providers.length; i++) {
      const provider = this.providers[this.currentProviderIndex]
      
      try {
        const content = await provider.generateDocumentation(repositoryData)
        return { content, provider: provider.name }
      } catch (error) {
        console.error(`${provider.name} failed:`, error)
        lastError = error as Error
        
        // Move to next provider
        this.currentProviderIndex = (this.currentProviderIndex + 1) % this.providers.length
      }
    }

    throw new Error(`All AI providers failed. Last error: ${lastError?.message}`)
  }

  getCurrentProvider(): string {
    return this.providers[this.currentProviderIndex].name
  }
}

export const aiService = new AIService()
