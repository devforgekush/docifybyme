import { createClient } from '@supabase/supabase-js'
import { createServerClient, createBrowserClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side clients
export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies()
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })
}

export const createSupabaseBrowserClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

export const createRouteClient = async () => {
  const cookieStore = await cookies()
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: Record<string, unknown>) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
      remove(name: string, options: Record<string, unknown>) {
        try {
          cookieStore.set({ name, value: '', ...options })
        } catch {
          // The `delete` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

// Database types
export interface User {
  id: string
  github_id: number
  username: string
  name: string
  email: string
  avatar_url: string
  created_at: string
  updated_at: string
}

export interface Repository {
  id: string
  user_id: string
  github_id: number
  name: string
  full_name: string
  description: string | null
  private: boolean
  html_url: string
  language: string | null
  stars: number
  forks: number
  documentation_status: 'pending' | 'generating' | 'completed' | 'failed'
  documentation_content: string | null
  last_generated: string | null
  created_at: string
  updated_at: string
}

export interface DocumentationJob {
  id: string
  user_id: string
  repository_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  ai_provider: 'gemini' | 'mistral'
  error_message: string | null
  created_at: string
  completed_at: string | null
}
