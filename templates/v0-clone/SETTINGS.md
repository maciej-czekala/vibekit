# VibeKit Settings System

This document explains the settings system implemented in the v0-clone template.

## Overview

The settings system provides a comprehensive way to manage API keys and environment variables for VibeKit operations. It supports both localStorage (for user-configured settings) and environment variables (for server-side configuration) with proper fallback mechanisms.

## 🎯 Operational Status

### ✅ **FULLY OPERATIONAL** - All Configuration Keys

| Category | Key | Status | Usage | Integration |
|----------|-----|--------|-------|-------------|
| **AI Agents** | `claude` | ✅ Operational | VibeKit operations, Inngest jobs | `vibekit.ts`, `inngest.ts` |
| **AI Agents** | `codex` | ✅ Operational | VibeKit operations, Inngest jobs | `vibekit.ts`, `inngest.ts` |
| **AI Agents** | `gemini` | ✅ Operational | VibeKit operations, Inngest jobs | `vibekit.ts`, `inngest.ts` |
| **AI Agents** | `grok` | ✅ Operational | VibeKit operations, Inngest jobs | `vibekit.ts`, `inngest.ts` |
| **AI Agents** | `opencode` | ✅ Operational | VibeKit operations, Inngest jobs | `vibekit.ts`, `inngest.ts` |
| **Environment** | `github_token` | ✅ Operational | GitHub operations, fallback | `github.ts`, `vibekit.ts`, `inngest.ts` |
| **Environment** | `e2b_api_key` | ✅ Operational | Sandbox provider | `vibekit.ts`, `inngest.ts` |
| **Environment** | `daytona_api_key` | ✅ Operational | Sandbox provider | `vibekit.ts`, `inngest.ts` |
| **Environment** | `northflank_api_key` | ✅ Operational | Sandbox provider | `vibekit.ts`, `inngest.ts` |
| **Environment** | `northflank_project_id` | ✅ Operational | Sandbox provider | `vibekit.ts`, `inngest.ts` |

### 🔧 **Integration Points Verified**

1. **✅ Server Actions** (`app/actions/vibekit.ts`)
   - All AI agent keys used with config storage
   - All environment keys used with config storage
   - Configuration validation before operations

2. **✅ Background Jobs** (`lib/inngest.ts`)
   - All AI agent keys used with config storage
   - All environment keys used with config storage
   - Proper fallback to environment variables

3. **✅ GitHub Operations** (`app/actions/github.ts`)
   - GitHub token used as fallback when session token unavailable
   - Proper error handling and user guidance

4. **✅ Settings UI** (`app/settings/`)
   - Complete configuration management interface
   - Real-time status updates
   - Configuration validation

5. **✅ Client Components** (`app/client-page.tsx`)
   - Configuration warnings for missing settings
   - Direct links to settings page
   - Pre-operation validation

### 🧪 **Testing**

You can test the entire configuration system in the browser console:

```javascript
// Test individual config
import { testConfigStorage } from '@/lib/config-storage';
testConfigStorage();

// Test ALL configuration keys
import { testAllConfigKeys } from '@/lib/config-storage';
testAllConfigKeys();
```

## Features

### ✅ Implemented Features

1. **Settings UI** - Complete settings page with API keys and environment config sections
2. **Config Storage** - localStorage + environment variable fallback system
3. **React Hooks** - `useConfig`, `useAgentConfigs`, `useEnvironmentConfigs` hooks
4. **Configuration Validation** - Pre-operation validation to ensure required configs are available
5. **Status Dashboard** - Visual overview of what's configured and what's missing
6. **Integration** - All VibeKit operations now use the settings system

### 🔧 Configuration Keys

#### AI Agent API Keys
- `claude` - Anthropic Claude API key
- `codex` - OpenAI Codex API key  
- `gemini` - Google Gemini API key
- `grok` - xAI Grok API key
- `opencode` - Groq OpenCode API key

#### Environment Configuration
- `github_token` - GitHub personal access token
- `e2b_api_key` - E2B sandbox provider API key
- `daytona_api_key` - Daytona sandbox provider API key
- `northflank_api_key` - Northflank sandbox provider API key
- `northflank_project_id` - Northflank project ID

## Usage

### Settings Page

Navigate to `/settings` to configure your API keys and environment variables. The page includes:

1. **Configuration Status** - Overview of what's configured
2. **API Keys Section** - Manage AI agent API keys
3. **Environment Config Section** - Manage environment variables

### Programmatic Usage

```typescript
import { configStorage } from '@/lib/config-storage';
import { validateConfiguration } from '@/lib/vibekit-config';

// Save a configuration
configStorage.saveConfig('claude', 'your-api-key');

// Get a configuration (with env fallback)
const apiKey = configStorage.getConfig('claude');

// Validate before operations
const validation = validateConfiguration('claude', 'northflank_api_key');
if (!validation.isValid) {
  console.error('Configuration errors:', validation.errors);
}
```

### React Hooks

```typescript
import { useAgentConfigs, useEnvironmentConfigs } from '@/hooks/use-config';

function MyComponent() {
  const { configs, saveAgentConfig } = useAgentConfigs();
  const { configs: envConfigs, saveEnvironmentConfig } = useEnvironmentConfigs();
  
  // Use the hooks to manage configurations
}
```

## Integration Points

### Server Actions

The following files have been updated to use the settings system:

1. **`app/actions/vibekit.ts`** - VibeKit operations now use stored configs
2. **`app/actions/github.ts`** - GitHub operations use stored token as fallback
3. **`lib/inngest.ts`** - Background jobs use stored configs

### Client Components

1. **`app/client-page.tsx`** - Shows configuration warnings
2. **`app/settings/`** - Complete settings management UI

## Configuration Priority

The system follows this priority order:

1. **localStorage** - User-configured settings (highest priority)
2. **Environment Variables** - Server-side configuration (fallback)
3. **null** - Not configured (lowest priority)

## Validation

The system validates configurations before operations:

- **Required**: GitHub token for repository operations
- **Required**: At least one sandbox provider for code execution
- **Recommended**: At least one AI agent API key
- **Required**: Northflank project ID if using Northflank

## Testing

You can test the configuration system in the browser console:

```javascript
import { testConfigStorage } from '@/lib/config-storage';
testConfigStorage();
```

## Environment Variables

For server-side configuration, set these environment variables:

```bash
# AI Agents
ANTHROPIC_API_KEY=your-claude-key
OPENAI_API_KEY=your-openai-key
GOOGLE_API_KEY=your-gemini-key
XAI_API_KEY=your-grok-key
GROQ_API_KEY=your-groq-key

# Environment
GITHUB_TOKEN=your-github-token
E2B_API_KEY=your-e2b-key
DAYTONA_API_KEY=your-daytona-key
NORTHFLANK_API_KEY=your-northflank-key
NORTHFLANK_PROJECT_ID=your-project-id
```

## Security

- API keys are stored in localStorage (client-side)
- Environment variables are only accessible server-side
- Keys are masked in the UI for security
- No keys are logged or exposed in error messages

## Migration

If you have existing environment variables, they will continue to work as fallbacks. The settings system will use localStorage values when available, falling back to environment variables when needed.
