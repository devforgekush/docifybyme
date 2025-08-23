# DocifyByMe

DocifyByMe automates the creation of high-quality documentation for GitHub repositories using advanced AI models. It helps teams onboard faster and maintain clear, accurate project docs.

## 🚀 Features

- **GitHub Integration**: Connect your GitHub account and access all your repositories
- **AI-Powered Documentation**: Generate comprehensive documentation using OpenRouter (Gemini 2.5 Pro) and Mistral AI
- **Beautiful 3D Interface**: Immersive 3D login experience with Three.js
- **Real-time Generation**: Watch as AI creates documentation in real-time
- **Multiple AI Providers**: Fallback between different AI services for reliability
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Caching System**: Intelligent caching for faster performance

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **3D Graphics**: Three.js, React Three Fiber
- **Authentication**: NextAuth.js with GitHub OAuth
- **AI Services**: OpenRouter API (Gemini 2.5 Pro), Mistral AI API
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Netlify

## 📋 Prerequisites

- Node.js 18+ 
- GitHub account
- OpenRouter API key (for Gemini 2.5 Pro)
- Mistral AI API key
- Supabase project

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/docifybyme.git
   cd docifybyme
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret

   # GitHub OAuth
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret

   # AI APIs
   OPENROUTER_API_KEY=your_openrouter_api_key
   MISTRAL_API_KEY=your_mistral_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Live demo

A live demo is available at: https://docifybyme.example.com  
(Replace with the actual URL when the demo is deployed)

## 🔧 Configuration

### GitHub OAuth Setup
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set the callback URL to `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and Client Secret to your environment variables

### AI API Keys
- **OpenRouter**: Get your API key from [OpenRouter](https://openrouter.ai/) for access to Gemini 2.5 Pro
- **Mistral AI**: Get your API key from [Mistral Console](https://console.mistral.ai/)

### Supabase Setup
1. Create a new project at [Supabase](https://supabase.com/)
2. Run the database schema (see `supabase-schema.sql`)
3. Copy your project URL and keys to environment variables

## 📁 Project Structure

```
docifybyme/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── api/            # API routes
│   │   ├── dashboard/      # Dashboard page
│   │   └── login/         # Login page
│   ├── components/         # React components
│   ├── lib/               # Business logic & services
│   └── types/             # TypeScript definitions
├── public/                # Static assets
└── docs/                  # Documentation
```

## 🚀 Deployment

### Netlify Deployment
1. Connect your GitHub repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Three.js](https://threejs.org/) for 3D graphics
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Framer Motion](https://www.framer.com/motion/) for animations
- [NextAuth.js](https://next-auth.js.org/) for authentication
- [OpenRouter](https://openrouter.ai/) for AI model access

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

---

**Made with ❤️ by devforgekush**