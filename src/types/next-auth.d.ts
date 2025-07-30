import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      githubId: number
      username: string
    }
    accessToken: string
  }

  interface Profile {
    id: number
    login: string
    name?: string
    email?: string
    avatar_url: string
    [key: string]: unknown
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    githubId: number
    username: string
    accessToken: string
  }
}
