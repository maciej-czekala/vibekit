/**
 * VibeKit Configuration Utility
 * Easy access to API keys and environment variables with localStorage/environment fallback
 */

import { configStorage, AgentId, EnvironmentId } from './config-storage';

/**
 * Validate configuration before using VibeKit
 */
export function validateConfiguration(agentId?: AgentId, sandboxProvider?: EnvironmentId) {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check if GitHub token is available (required for git operations)
  if (!configStorage.isConfigSet('github_token')) {
    errors.push('GitHub token is required but not configured');
  }
  
  // If specific agent is requested, check if it's configured
  if (agentId && !configStorage.isConfigSet(agentId)) {
    errors.push(`${agentId} API key is required but not configured`);
  }
  
  // Check if at least one sandbox provider is configured
  const sandboxProviders = ['e2b_api_key', 'daytona_api_key', 'northflank_api_key'] as EnvironmentId[];
  const hasSandboxProvider = sandboxProviders.some(provider => configStorage.isConfigSet(provider));
  
  if (!hasSandboxProvider) {
    errors.push('At least one sandbox provider (E2B, Daytona, or Northflank) API key is required');
  }
  
  // If specific sandbox provider is requested, check if it's configured
  if (sandboxProvider && !configStorage.isConfigSet(sandboxProvider)) {
    errors.push(`${sandboxProvider} API key is required but not configured`);
  }
  
  // Check for Northflank project ID if Northflank is configured
  if (configStorage.isConfigSet('northflank_api_key') && !configStorage.isConfigSet('northflank_project_id')) {
    warnings.push('Northflank API key is configured but project ID is missing');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get VibeKit configuration for initializing the SDK
 * This function provides a complete configuration object for VibeKit
 */
export function getVibeKitConfig() {
  // Get all agent configurations
  const agentConfigs = configStorage.getAllAgentConfigs();
  
  // Get all environment configurations  
  const environmentConfigs = configStorage.getAllEnvironmentConfigs();

  return {
    // AI Agent API Keys
    agents: {
      claude: {
        apiKey: agentConfigs.claude,
        provider: 'anthropic' as const,
        model: 'claude-3-5-sonnet-20241022',
      },
      codex: {
        apiKey: agentConfigs.codex,
        provider: 'openai' as const,
        model: 'gpt-4o',
      },
      gemini: {
        apiKey: agentConfigs.gemini,
        provider: 'google' as const,
        model: 'gemini-1.5-pro',
      },
      grok: {
        apiKey: agentConfigs.grok,
        provider: 'xai' as const,
        model: 'grok-beta',
      },
      opencode: {
        apiKey: agentConfigs.opencode,
        provider: 'groq' as const,
        model: 'llama-3.1-70b-versatile',
      },
    },
    
    // Environment configurations
    environment: {
      githubToken: environmentConfigs.github_token,
      e2bApiKey: environmentConfigs.e2b_api_key,
      daytonaApiKey: environmentConfigs.daytona_api_key,
      northflankApiKey: environmentConfigs.northflank_api_key,
      northflankProjectId: environmentConfigs.northflank_project_id,
    },
  };
}

/**
 * Get agent configuration by type
 */
export function getAgentConfig(agentType: AgentId) {
  const config = getVibeKitConfig();
  return config.agents[agentType];
}

/**
 * Get environment configuration
 */
export function getEnvironmentConfig() {
  const config = getVibeKitConfig();
  return config.environment;
}

/**
 * Get GitHub configuration
 */
export function getGithubConfig() {
  const config = getVibeKitConfig();
  return {
    token: config.environment.githubToken,
  };
}

/**
 * Get sandbox provider configuration
 */
export function getSandboxConfig(provider: EnvironmentId) {
  const config = getVibeKitConfig();
  
  switch (provider) {
    case 'e2b':
      return {
        apiKey: config.environment.e2bApiKey,
        templateId: 'vibekit-claude',
      };
    case 'daytona':
      return {
        apiKey: config.environment.daytonaApiKey,
        image: 'superagentai/vibekit-claude:1.0',
      };
    case 'northflank':
      return {
        apiKey: config.environment.northflankApiKey,
        projectId: config.environment.northflankProjectId,
        image: 'superagentai/vibekit-claude:1.0',
      };
    default:
      throw new Error(`Unsupported sandbox provider: ${provider}`);
  }
}

/**
 * Initialize VibeKit with stored configuration using new fluent API
 * Example usage for integrating with VibeKit SDK
 */
export function createVibeKitInstance(agentType: AgentId = 'claude', sandboxProvider: EnvironmentId = 'northflank') {
  const config = getVibeKitConfig();
  const agentConfig = getAgentConfig(agentType);
  const sandboxConfig = getSandboxConfig(sandboxProvider);
  const githubConfig = getGithubConfig();
  
  // Example: This would be used with the actual VibeKit SDK
  // import { VibeKit } from '@vibe-kit/sdk';
  // import { createNorthflankProvider } from '@vibe-kit/northflank';
  // import { createE2BProvider } from '@vibe-kit/e2b';
  // import { createDaytonaProvider } from '@vibe-kit/daytona';
  
  /*
  let sandboxProviderInstance;
  
  switch (sandboxProvider) {
    case 'northflank':
      sandboxProviderInstance = createNorthflankProvider(sandboxConfig);
      break;
    case 'e2b':
      sandboxProviderInstance = createE2BProvider(sandboxConfig);
      break;
    case 'daytona':
      sandboxProviderInstance = createDaytonaProvider(sandboxConfig);
      break;
    default:
      throw new Error(`Unsupported sandbox provider: ${sandboxProvider}`);
  }

  const vibeKit = new VibeKit()
    .withAgent({
      type: agentType,
      provider: agentConfig.provider,
      apiKey: agentConfig.apiKey,
      model: agentConfig.model,
    })
    .withSandbox(sandboxProviderInstance);

  if (githubConfig.token) {
    vibeKit.withGithub({
      token: githubConfig.token,
      repository: 'your-org/your-repo', // This should be passed as parameter
    });
  }

  return vibeKit;
  */
  
  return {
    agentConfig,
    sandboxConfig,
    githubConfig,
    agentType,
    sandboxProvider,
  };
}

/**
 * Check if a specific agent is configured (has API key)
 */
export function isAgentConfigured(agentId: AgentId): boolean {
  return configStorage.isConfigSet(agentId);
}

/**
 * Check if environment is properly configured for VibeKit
 */
export function isEnvironmentConfigured(): boolean {
  // At minimum, we need GitHub token for git operations
  return configStorage.isConfigSet('github_token');
}

/**
 * Get configuration status for all components
 */
export function getConfigurationStatus() {
  const agentConfigs = configStorage.getAllAgentConfigs();
  const environmentConfigs = configStorage.getAllEnvironmentConfigs();
  
  return {
    agents: {
      claude: { configured: !!agentConfigs.claude, source: configStorage.getConfigSource('claude') },
      codex: { configured: !!agentConfigs.codex, source: configStorage.getConfigSource('codex') },
      gemini: { configured: !!agentConfigs.gemini, source: configStorage.getConfigSource('gemini') },
      grok: { configured: !!agentConfigs.grok, source: configStorage.getConfigSource('grok') },
      opencode: { configured: !!agentConfigs.opencode, source: configStorage.getConfigSource('opencode') },
    },
    environment: {
      githubToken: { configured: !!environmentConfigs.github_token, source: configStorage.getConfigSource('github_token') },
      e2bApiKey: { configured: !!environmentConfigs.e2b_api_key, source: configStorage.getConfigSource('e2b_api_key') },
      daytonaApiKey: { configured: !!environmentConfigs.daytona_api_key, source: configStorage.getConfigSource('daytona_api_key') },
      northflankApiKey: { configured: !!environmentConfigs.northflank_api_key, source: configStorage.getConfigSource('northflank_api_key') },
      northflankProjectId: { configured: !!environmentConfigs.northflank_project_id, source: configStorage.getConfigSource('northflank_project_id') },
    },
    summary: {
      totalAgentsConfigured: Object.values(agentConfigs).filter(Boolean).length,
      totalEnvironmentConfigured: Object.values(environmentConfigs).filter(Boolean).length,
      isReady: !!environmentConfigs.github_token, // Minimum requirement
    },
  };
}

/**
 * Export the configuration storage instance for direct access
 */
export { configStorage };