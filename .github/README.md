# DocifyByMe

## Overview

DocifyByMe is a cutting-edge web application designed to automate the generation of high-quality documentation for GitHub repositories using advanced AI models. Built for modern development teams, it streamlines onboarding, knowledge sharing, and project maintenance.

## Features

- **Seamless GitHub Integration**: Securely connect and manage your repositories.
- **AI-Driven Documentation**: Leverage OpenRouter (Gemini 2.5 Pro) and Mistral AI for detailed, reliable docs.
- **Immersive 3D Login**: Engaging authentication experience powered by Three.js.
- **Live Generation**: Real-time documentation creation and updates.
- **Multi-Provider AI**: Automatic fallback between AI services for maximum uptime.
- **Responsive UI**: Optimized for all devices.
- **Intelligent Caching**: Accelerated performance with smart cache management.

## Technology Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **3D Graphics**: Three.js, React Three Fiber
- **Authentication**: NextAuth.js (GitHub OAuth)
- **AI Services**: OpenRouter API (Gemini 2.5 Pro), Mistral AI API
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Netlify

## Prerequisites

- Node.js 18+
- GitHub account
- API keys for OpenRouter and Mistral AI
- Supabase project credentials

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/devforgekush/docifybyme.git
   cd docifybyme
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   OPENROUTER_API_KEY=your_openrouter_api_key
   MISTRAL_API_KEY=your_mistral_api_key
   ```
4. **Run the development server**
   ```bash
   npm run dev
   ```
5. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

### GitHub OAuth
- Register a new OAuth App in GitHub Developer Settings.
- Set the callback URL: `http://localhost:3000/api/auth/callback/github`
- Add Client ID and Secret to `.env.local`.

### AI API Keys
- Obtain keys from [OpenRouter](https://openrouter.ai/) and [Mistral Console](https://console.mistral.ai/).

### Supabase
- Create a project at [Supabase](https://supabase.com/).
- Apply schema from `supabase-schema.sql`.
- Add credentials to `.env.local`.

## Project Structure

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

## Deployment

### Netlify
- Connect your GitHub repository to Netlify.
- Set environment variables in the Netlify dashboard.
- Deploy automatically on push to the `main` branch.

### Manual
```bash
npm run build
npm start
```

## Contributing

We welcome contributions! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Describe your feature'`)
4. Push to your branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Three.js](https://threejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [NextAuth.js](https://next-auth.js.org/)
- [OpenRouter](https://openrouter.ai/)

## Support

For questions or support, please open an issue on GitHub.

---

**Made with ❤️ by devforgekush**
