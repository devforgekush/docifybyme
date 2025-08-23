import { Mistral } from '@mistralai/mistralai'
import { cache } from './cache'

export interface AIProvider {
  name: 'openrouter-gemini' | 'mistral'
  generateDocumentation: (repositoryData: Record<string, unknown>) => Promise<string>
}

class OpenRouterGeminiProvider implements AIProvider {
  name = 'openrouter-gemini' as const
  private readonly apiKey: string
  private readonly baseUrl = 'https://openrouter.ai/api/v1'
  private readonly maxRetries = 3
  private readonly retryDelay = 1000 // 1 second

  constructor() {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY environment variable is required')
    }
    this.apiKey = apiKey
  }

  async generateDocumentation(repositoryData: Record<string, unknown>): Promise<string> {
    const cacheKey = `openrouter-gemini:${JSON.stringify(repositoryData.name)}:${JSON.stringify(repositoryData.updated_at)}`
    const cached = cache.get<string>(cacheKey)
    if (cached) {
      return cached
    }

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const prompt = this.buildPrompt(repositoryData)

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://docifybyme.netlify.app',
            'X-Title': 'DocifyByMe - AI Documentation Generator'
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-pro',
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 8192,
            temperature: 0.7,
            top_p: 0.95,
            frequency_penalty: 0,
            presence_penalty: 0
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
        }

        const data = await response.json()
        const content = data.choices?.[0]?.message?.content
        
        if (content && typeof content === 'string' && content.trim()) {
          cache.set(cacheKey, content, 30 * 60 * 1000) // Cache for 30 minutes
          return content
        }
        
        throw new Error('Empty response from OpenRouter Gemini')
      } catch (error) {
        console.error(`OpenRouter Gemini API attempt ${attempt} failed:`, error)
        
        if (attempt === this.maxRetries) {
          throw new Error(`Failed to generate documentation with OpenRouter Gemini after ${this.maxRetries} attempts`)
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt))
      }
    }
    
    throw new Error('Failed to generate documentation with OpenRouter Gemini')
  }

  private buildPrompt(repositoryData: Record<string, unknown>): string {
    return `
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

Format the response in Markdown with proper headings, code blocks, and formatting.
`
  }
}

class MistralProvider implements AIProvider {
  name = 'mistral' as const
  private client: Mistral
  private readonly maxRetries = 3
  private readonly retryDelay = 1000 // 1 second

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
    const cacheKey = `mistral:${JSON.stringify(repositoryData.name)}:${JSON.stringify(repositoryData.updated_at)}`
    const cached = cache.get<string>(cacheKey)
    if (cached) {
      return cached
    }

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const prompt = this.buildPrompt(repositoryData)

        const result = await this.client.chat.complete({
          model: 'mistral-large-latest',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          maxTokens: 8192,
          temperature: 0.7
        })

        const content = result.choices?.[0]?.message?.content
        
        if (content && typeof content === 'string' && content.trim()) {
          cache.set(cacheKey, content, 30 * 60 * 1000) // Cache for 30 minutes
          return content
        }
        
        throw new Error('Empty response from Mistral')
      } catch (error) {
        console.error(`Mistral API attempt ${attempt} failed:`, error)
        
        if (attempt === this.maxRetries) {
          throw new Error(`Failed to generate documentation with Mistral after ${this.maxRetries} attempts`)
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt))
      }
    }
    
    throw new Error('Failed to generate documentation with Mistral')
  }

  private buildPrompt(repositoryData: Record<string, unknown>): string {
    return `
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

Format the response in Markdown with proper headings, code blocks, and formatting.
`
  }
}

export class AIService {
  private providers: AIProvider[]
  private currentProviderIndex: number = 0
  private readonly maxProviderAttempts: number = 2

  constructor() {
    this.providers = []
    
    // Only add providers if their API keys are available
    try {
      if (process.env.OPENROUTER_API_KEY) {
        this.providers.push(new OpenRouterGeminiProvider())
        console.log('OpenRouter Gemini provider initialized')
      }
    } catch (error) {
      console.warn('Failed to initialize OpenRouter Gemini provider:', error)
    }

    try {
      if (process.env.MISTRAL_API_KEY) {
        this.providers.push(new MistralProvider())
        console.log('Mistral provider initialized')
      }
    } catch (error) {
      console.warn('Failed to initialize Mistral provider:', error)
    }

    if (this.providers.length === 0) {
      console.error('No AI providers available! Please check your environment variables (OPENROUTER_API_KEY, MISTRAL_API_KEY).')
    }
  }

  async generateDocumentation(repositoryData: Record<string, unknown>): Promise<{ content: string; provider: string }> {
    if (this.providers.length === 0) {
      throw new Error('No AI providers are configured. Please check your environment variables (OPENROUTER_API_KEY, MISTRAL_API_KEY).')
    }

    let lastError: Error | null = null
    const attemptedProviders = new Set<string>()

    // Try each provider with fallback
    for (let attempt = 0; attempt < this.providers.length * this.maxProviderAttempts; attempt++) {
      const provider = this.providers[this.currentProviderIndex]
      
      if (attemptedProviders.has(provider.name) && attemptedProviders.size >= this.providers.length) {
        break // All providers have been tried
      }

      try {
        console.log(`Attempting documentation generation with ${provider.name}...`)
        const content = await provider.generateDocumentation(repositoryData)
        console.log(`Successfully generated documentation with ${provider.name}`)
        return { content, provider: provider.name }
      } catch (error) {
        console.error(`${provider.name} failed:`, error)
        lastError = error as Error
        attemptedProviders.add(provider.name)
        
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

  // Clear AI cache for a specific repository
  clearAICache(repositoryName: string): void {
    const patterns = [`openrouter-gemini:${repositoryName}:`, `mistral:${repositoryName}:`]
    
    for (const pattern of patterns) {
      for (const key of cache.keys()) {
        if (key.startsWith(pattern)) {
          cache.delete(key)
        }
      }
    }
  }
}

export const aiService = new AIService()
