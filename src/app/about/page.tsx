'use client'

import { ArrowLeft, Github, Heart, Code, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link 
              href="/dashboard"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border p-8 sm:p-12">
          {/* App Logo and Title */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">DocifyByMe</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              AI-powered documentation generator for your GitHub repositories
            </p>
          </div>

          {/* About Section */}
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Code className="w-6 h-6 mr-2 text-blue-500" />
                About the Project
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed">
                  DocifyByMe is an innovative web application that leverages the power of artificial intelligence 
                  to automatically generate comprehensive documentation for your GitHub repositories. Built with 
                  modern technologies and designed with developers in mind, it streamlines the documentation 
                  process and helps you maintain better project documentation.
                </p>
              </div>
            </section>

            {/* Features */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Key Features</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">🤖 AI-Powered Generation</h3>
                  <p className="text-gray-600 text-sm">Uses Google Gemini AI and Mistral AI for intelligent content generation</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">🔗 GitHub Integration</h3>
                  <p className="text-gray-600 text-sm">Seamless OAuth integration with your GitHub repositories</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">🎨 Beautiful Interface</h3>
                  <p className="text-gray-600 text-sm">Modern, responsive design with 3D interactive elements</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">⚡ Fast & Reliable</h3>
                  <p className="text-gray-600 text-sm">Built with Next.js 15 and deployed on Netlify for optimal performance</p>
                </div>
              </div>
            </section>

            {/* Tech Stack */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Technology Stack</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  'Next.js 15', 'TypeScript', 'Tailwind CSS', 'Supabase',
                  'NextAuth.js', 'Google Gemini AI', 'Mistral AI', 'Three.js',
                  'Framer Motion', 'Netlify', 'GitHub API', 'React'
                ].map((tech) => (
                  <div key={tech} className="bg-blue-50 text-blue-800 px-3 py-2 rounded-lg text-sm font-medium text-center">
                    {tech}
                  </div>
                ))}
              </div>
            </section>

            {/* Developer Credits */}
            <section className="border-t pt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <Heart className="w-6 h-6 mr-2 text-red-500" />
                Developer Credits
              </h2>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">K</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Kushagra</h3>
                <p className="text-gray-600 mb-4">Full-Stack Developer & AI Enthusiast</p>
                <div className="flex justify-center space-x-4">
                  <a 
                    href="https://github.com/devforgekush" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    <span>GitHub</span>
                  </a>
                </div>
                <div className="mt-6 text-sm text-gray-500">
                  <p>&ldquo;Passionate about creating innovative solutions that make developers&rsquo; lives easier.&rdquo;</p>
                </div>
              </div>
            </section>

            {/* Copyright */}
            <section className="text-center pt-8 border-t">
              <p className="text-gray-500">
                &copy; {new Date().getFullYear()} DocifyByMe. Created with ❤️ by Kushagra.
              </p>
              <p className="text-sm text-gray-400 mt-2">
                This project is open source and available on{' '}
                <a 
                  href="https://github.com/devforgekush/docifybyme" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 underline"
                >
                  GitHub
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
