# Vibe0 (v0-clone)

A Next.js app template powered by VibeKit SDK, Inngest, Convex, and Anthropic Claude. This application enables collaborative AI-driven development with real-time updates, GitHub integration, and sandboxed code execution using multiple providers (Northflank, E2B, Daytona).

## ✨ Features

- 🤖 AI-powered code generation using multiple agents (Claude, Codex, Gemini, Grok, OpenCode)
- 🔄 Real-time task updates with Inngest
- 🐙 GitHub integration for repository management
- 🏗️ Sandboxed environment execution with multiple providers
- 📦 State management with Convex
- 🎨 Modern UI with Tailwind CSS and shadcn/ui
- 🗃️ TypeScript-first, modular architecture

## 🚀 Prerequisites

Before you begin, make sure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Inngest CLI** (for local development)
- **Convex account** (for state management)
- **AI Provider API keys** (Anthropic, OpenAI, Google, xAI, Groq)
- **Sandbox Provider API keys** (Northflank, E2B, Daytona)
- **GitHub OAuth app** (for GitHub integration)

## 📦 Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Inngest CLI

The Inngest CLI is required for running background functions locally:

```bash
# Install globally
npm install -g inngest

# Or using npx (recommended)
npx inngest-cli@latest
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# AI Provider API Keys
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
XAI_API_KEY=your_xai_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# Sandbox Provider Configuration
# Northflank
NORTHFLANK_API_KEY=your_northflank_api_key_here
NORTHFLANK_PROJECT_ID=your_northflank_project_id_here

# E2B
E2B_API_KEY=your_e2b_api_key_here

# Daytona
DAYTONA_API_KEY=your_daytona_api_key_here

# GitHub Configuration
GITHUB_TOKEN=your_github_token_here

# Convex Configuration
NEXT_PUBLIC_CONVEX_URL=your_convex_url_here

# GitHub OAuth Configuration
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_client_secret
```

#### Getting API Keys:

- **Anthropic API Key**: Get it from [Anthropic Console](https://console.anthropic.com/)
- **OpenAI API Key**: Get it from [OpenAI Platform](https://platform.openai.com/)
- **Google API Key**: Get it from [Google AI Studio](https://aistudio.google.com/)
- **xAI API Key**: Get it from [xAI Console](https://console.x.ai/)
- **Groq API Key**: Get it from [Groq Console](https://console.groq.com/)
- **Northflank API Key/Project ID**: [Northflank Dashboard](https://northflank.com/)
- **E2B API Key**: [E2B Dashboard](https://e2b.dev/)
- **Daytona API Key**: [Daytona Dashboard](https://daytona.io/)
- **Convex URL**: [Convex Console](https://dashboard.convex.dev/)

## 🔧 Configuration

### Agent Types

The template supports multiple AI agents:

- **Claude** (Anthropic) - Default agent for code generation
- **Codex** (OpenAI) - Alternative code generation agent
- **Gemini** (Google) - Google's AI model
- **Grok** (xAI) - xAI's conversational AI
- **OpenCode** (Groq) - Fast code generation with Groq

### Sandbox Providers

The template supports multiple sandbox providers:

- **Northflank** - Cloud-native development environments
- **E2B** - Ephemeral development environments
- **Daytona** - Container-based development environments

### Switching Providers

You can easily switch between different agents and sandbox providers by modifying the configuration in:

- `lib/inngest.ts` - For background functions
- `app/actions/vibekit.ts` - For direct API calls
- `lib/vibekit-config.ts` - For configuration management

## 🚀 Development

### 1. Start Development Server

```bash
npm run dev
```

### 2. Start Inngest Dev Server (in another terminal)

```bash
npm run dev:inngest
```

### 3. Start Both Servers Together

```bash
npm run dev:full
```

## 📁 Project Structure

```
templates/v0-clone/
├── app/                    # Next.js app directory
│   ├── actions/           # Server actions
│   ├── api/              # API routes
│   └── (routes)/         # App routes
├── components/            # React components
├── convex/               # Convex database
├── lib/                  # Utility libraries
│   ├── inngest.ts       # Background functions
│   ├── vibekit-config.ts # VibeKit configuration
│   └── config-storage.ts # Configuration storage
└── public/              # Static assets
```

## 🔄 API Changes

This template has been updated to use the latest VibeKit SDK (v0.0.59) with the new fluent API:

### Old API (v0.0.39)
```typescript
const vibekit = new VibeKit(config);
```

### New API (v0.0.59)
```typescript
const vibekit = new VibeKit()
  .withAgent({
    type: "claude",
    provider: "anthropic",
    apiKey: process.env.ANTHROPIC_API_KEY!,
    model: "claude-3-5-sonnet-20241022",
  })
  .withSandbox(sandboxProvider)
  .withGithub({
    token: process.env.GITHUB_TOKEN!,
    repository: "your-org/your-repo",
  });
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
