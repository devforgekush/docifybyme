import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AuthTestPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Authentication Test
          </h1>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h2 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                ✅ Authentication Successful
              </h2>
              <p className="text-green-700 dark:text-green-300">
                You are successfully authenticated with GitHub OAuth.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Session Information:
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">User:</span> {session.user?.name || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {session.user?.email || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">GitHub Username:</span> {session.user?.username || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">GitHub ID:</span> {session.user?.githubId || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Access Token:</span> 
                  <span className="text-green-600 dark:text-green-400 ml-2">
                    {session.accessToken ? '✅ Present' : '❌ Missing'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <Link
                href="/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/"
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
