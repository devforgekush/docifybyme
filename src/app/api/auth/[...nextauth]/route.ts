import NextAuth, { NextAuthOptions } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'

const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email repo'
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === 'github' && profile) {
        try {
          // Skip database operations for now to avoid access denied errors
          console.log('GitHub user signed in:', profile.login)
          return true
          
          // TODO: Re-enable database operations after confirming table structure
          /*
          if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')) {
            console.log('Skipping database operations - Supabase not configured')
            return true
          }
          
          const supabase = await createRouteClient()
          
          // Upsert user in Supabase
          const { error } = await supabase
            .from('users')
            .upsert({
              github_id: profile.id,
              username: profile.login,
              name: profile.name || profile.login,
              email: profile.email,
              avatar_url: profile.avatar_url,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'github_id'
            })

          if (error) {
            console.error('Error upserting user:', error)
            return false
          }
          */

          return true
        } catch (error) {
          console.error('Error in signIn callback:', error)
          // Return true instead of false to allow sign in even if database fails
          return true
        }
      }
      return true
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === 'github' && profile) {
        token.githubId = profile.id
        token.username = profile.login
        token.accessToken = account.access_token || ''
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.githubId = token.githubId as number
        session.user.username = token.username as string
        session.accessToken = token.accessToken as string
        
        // Skip database lookup for now to avoid session issues
        console.log('Session created for user:', token.username)
        return session
        
        // TODO: Re-enable database lookup after confirming table structure
        /*
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')) {
          console.log('Skipping database lookup - Supabase not configured')
          return session
        }

        try {
          const supabase = await createRouteClient()
          
          // Get user data from Supabase
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('github_id', token.githubId)
            .single()

          if (userData && !error) {
            session.user.name = userData.name
            session.user.email = userData.email
            session.user.image = userData.avatar_url
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
        */
      }
      return session
    }
  },
  pages: {
    signIn: '/login'
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
