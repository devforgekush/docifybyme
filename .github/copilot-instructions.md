# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a GitHub documentation generator dashboard called "DocifyByMe" - similar to gitdocify.com. It's built with Next.js, TypeScript, and includes the following key features:

### Tech Stack
- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS
- **Database**: Supabase with SSR integration
- **Authentication**: GitHub OAuth via NextAuth.js
- **AI Integration**: Google Gemini API with Mistral.ai fallback
- **3D Graphics**: Three.js with React Three Fiber
- **UI**: Framer Motion for animations, Lucide React for icons
- **GitHub API**: Octokit for repository management

### Key Features
1. **3D Login Page**: Interactive 3D interface for user authentication
2. **GitHub OAuth**: Seamless login with GitHub accounts
3. **Repository Dashboard**: Display and manage user's GitHub repositories
4. **AI Documentation Generation**: Generate documentation using AI APIs with fallback system
5. **Real-time Updates**: Live preview of generated documentation

### Code Style Guidelines
- Use TypeScript for all components and utilities
- Follow Next.js App Router conventions
- Use Tailwind CSS for styling with custom components
- Implement proper error handling and loading states
- Use React hooks and modern patterns
- Ensure responsive design for all components
- Follow accessibility best practices

### API Integration Notes
- Implement fallback system between Gemini and Mistral APIs
- Use proper error boundaries and retry logic
- Store API keys in environment variables
- Handle rate limiting gracefully

### Database Schema
- Users table with GitHub profile information
- Repositories table with documentation status
- Generated documentation storage
- API usage tracking
