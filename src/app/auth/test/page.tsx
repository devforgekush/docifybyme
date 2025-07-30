'use client'

export default function AuthTestPage() {
  const testGitHubAuth = () => {
    // Direct GitHub OAuth URL for testing
    const clientId = 'Ov23li8WlHk08K7mzOv'
    const redirectUri = encodeURIComponent('http://localhost:3000/api/auth/callback/github')
    const scope = encodeURIComponent('read:user user:email repo')
    
    const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`
    
    window.location.href = githubUrl
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg">
        <h1 className="text-white text-2xl mb-4">GitHub OAuth Test</h1>
        <button 
          onClick={testGitHubAuth}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Test Direct GitHub OAuth
        </button>
        <div className="mt-4 text-gray-400 text-sm">
          <p>Client ID: Ov23li8WlHk08K7mzOv</p>
          <p>Callback: http://localhost:3000/api/auth/callback/github</p>
        </div>
      </div>
    </div>
  )
}
