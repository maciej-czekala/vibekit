# Migration Guide: v0.0.39 to v0.0.59

This guide helps you migrate from VibeKit SDK v0.0.39 to v0.0.59 in the v0-clone template.

## 🔄 Major Changes

### 1. API Pattern Change

**Old API (v0.0.39):**
```typescript
import { VibeKit, VibeKitConfig } from "@vibe-kit/sdk";

const config: VibeKitConfig = {
  agent: {
    type: "claude",
    model: {
      apiKey: process.env.ANTHROPIC_API_KEY!,
    },
  },
  environment: {
    northflank: {
      apiKey: process.env.NORTHFLANK_API_KEY!,
      projectId: process.env.NORTHFLANK_PROJECT_ID!,
    },
  },
  secrets: template?.secrets,
};

const vibekit = new VibeKit(config);
```

**New API (v0.0.59):**
```typescript
import { VibeKit } from "@vibe-kit/sdk";
import { createNorthflankProvider } from "@vibe-kit/northflank";

const sandboxProvider = createNorthflankProvider({
  apiKey: process.env.NORTHFLANK_API_KEY!,
  projectId: process.env.NORTHFLANK_PROJECT_ID!,
});

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

### 2. New Dependencies

Add these new packages to your `package.json`:

```json
{
  "dependencies": {
    "@vibe-kit/sdk": "^0.0.59",
    "@vibe-kit/northflank": "^0.0.3",
    "@vibe-kit/e2b": "^0.0.3",
    "@vibe-kit/daytona": "^0.0.3"
  }
}
```

### 3. Environment Variables

**New environment variables needed:**

```bash
# AI Provider API Keys
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
XAI_API_KEY=your_xai_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# Sandbox Provider Configuration
NORTHFLANK_API_KEY=your_northflank_api_key_here
NORTHFLANK_PROJECT_ID=your_northflank_project_id_here
E2B_API_KEY=your_e2b_api_key_here
DAYTONA_API_KEY=your_daytona_api_key_here

# GitHub Configuration
GITHUB_TOKEN=your_github_token_here
```

## 📝 Step-by-Step Migration

### Step 1: Update Dependencies

```bash
npm install @vibe-kit/sdk@^0.0.59 @vibe-kit/northflank@^0.0.3 @vibe-kit/e2b@^0.0.3 @vibe-kit/daytona@^0.0.3
```

### Step 2: Update Imports

Replace old imports:
```typescript
// Old
import { VibeKit, VibeKitConfig } from "@vibe-kit/sdk";

// New
import { VibeKit } from "@vibe-kit/sdk";
import { createNorthflankProvider } from "@vibe-kit/northflank";
import { createE2BProvider } from "@vibe-kit/e2b";
import { createDaytonaProvider } from "@vibe-kit/daytona";
```

### Step 3: Update Configuration

**Old configuration structure:**
```typescript
const config: VibeKitConfig = {
  agent: {
    type: "claude",
    model: {
      apiKey: process.env.ANTHROPIC_API_KEY!,
    },
  },
  environment: {
    northflank: {
      apiKey: process.env.NORTHFLANK_API_KEY!,
      projectId: process.env.NORTHFLANK_PROJECT_ID!,
    },
  },
  secrets: template?.secrets,
};
```

**New configuration approach:**
```typescript
// Create sandbox provider
const sandboxProvider = createNorthflankProvider({
  apiKey: process.env.NORTHFLANK_API_KEY!,
  projectId: process.env.NORTHFLANK_PROJECT_ID!,
});

// Create VibeKit instance with fluent API
const vibekit = new VibeKit()
  .withAgent({
    type: "claude",
    provider: "anthropic",
    apiKey: process.env.ANTHROPIC_API_KEY!,
    model: "claude-3-5-sonnet-20241022",
  })
  .withSandbox(sandboxProvider);
```

### Step 4: Update Method Calls

**Old method calls:**
```typescript
const response = await vibekit.generateCode({
  prompt: prompt,
  mode: "code",
  callbacks: {
    onUpdate(message) {
      console.log(message);
    },
  },
});
```

**New method calls:**
```typescript
const response = await vibekit.generateCode({
  prompt: prompt,
  mode: "code",
});
```

## 🔧 Configuration Files Updated

### 1. `lib/inngest.ts`
- Added helper function `createVibeKitInstance()`
- Updated to use new fluent API
- Added support for multiple sandbox providers

### 2. `app/actions/vibekit.ts`
- Updated to use new fluent API
- Added support for multiple agents and sandbox providers
- Simplified callback handling

### 3. `lib/vibekit-config.ts`
- Updated configuration structure
- Added support for multiple providers
- Improved type safety

## 🚀 New Features

### 1. Multiple Agent Support
- Claude (Anthropic)
- Codex (OpenAI)
- Gemini (Google)
- Grok (xAI)
- OpenCode (Groq)

### 2. Multiple Sandbox Providers
- Northflank
- E2B
- Daytona

### 3. Improved Type Safety
- Better TypeScript support
- More explicit configuration
- Fluent API for better developer experience

## 🐛 Breaking Changes

1. **Constructor API**: `new VibeKit(config)` → `new VibeKit().withAgent().withSandbox()`
2. **Configuration Structure**: `VibeKitConfig` interface changed
3. **Callback Handling**: Simplified callback structure
4. **Dependencies**: New sandbox provider packages required

## ✅ Migration Checklist

- [ ] Update `package.json` dependencies
- [ ] Add new environment variables
- [ ] Update imports in all files
- [ ] Replace constructor-based API with fluent API
- [ ] Update configuration structure
- [ ] Test with new sandbox providers
- [ ] Update documentation
- [ ] Test all functionality

## 🆘 Troubleshooting

### Common Issues

1. **Import Errors**: Make sure all new packages are installed
2. **Environment Variables**: Verify all new environment variables are set
3. **API Key Errors**: Check that API keys are valid and have proper permissions
4. **Sandbox Provider Issues**: Ensure sandbox provider configuration is correct

### Getting Help

- Check the [VibeKit Documentation](https://vibekit.dev/docs)
- Review the updated README.md
- Check the example configurations in the code
