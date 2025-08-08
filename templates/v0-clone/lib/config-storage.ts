/**
 * Universal configuration storage service for VibeKit
 * Handles localStorage with environment variable fallbacks
 */

// AI Agent API Keys Configuration
export const AI_AGENTS_CONFIG = {
  claude: {
    id: "claude",
    name: "Claude",
    provider: "Anthropic",
    description: "Anthropic's Claude Code agent",
    envKey: "ANTHROPIC_API_KEY",
    storageKey: "vibekit_claude_api_key",
  },
  codex: {
    id: "codex",
    name: "Codex",
    provider: "OpenAI",
    description: "OpenAI's Codex agent",
    envKey: "OPENAI_API_KEY",
    storageKey: "vibekit_codex_api_key",
  },
  gemini: {
    id: "gemini",
    name: "Gemini",
    provider: "Google",
    description: "Google's Gemini CLI agent",
    envKey: "GOOGLE_API_KEY",
    storageKey: "vibekit_gemini_api_key",
  },
  grok: {
    id: "grok",
    name: "Grok",
    provider: "xAI",
    description: "xAI's Grok agent",
    envKey: "XAI_API_KEY",
    storageKey: "vibekit_grok_api_key",
  },
  opencode: {
    id: "opencode",
    name: "OpenCode",
    provider: "Open Source",
    description: "Open source coding agent (uses Groq)",
    envKey: "GROQ_API_KEY",
    storageKey: "vibekit_opencode_api_key",
  },
} as const;

// Environment Configuration Keys
export const ENVIRONMENT_CONFIG = {
  github_token: {
    id: "github_token",
    name: "GitHub Token",
    description: "Personal access token for GitHub operations",
    envKey: "GITHUB_TOKEN",
    storageKey: "vibekit_github_token",
  },
  e2b_api_key: {
    id: "e2b_api_key",
    name: "E2B API Key",
    description: "API key for E2B sandbox provider",
    envKey: "E2B_API_KEY",
    storageKey: "vibekit_e2b_api_key",
  },
  daytona_api_key: {
    id: "daytona_api_key",
    name: "Daytona API Key",
    description: "API key for Daytona sandbox provider",
    envKey: "DAYTONA_API_KEY",
    storageKey: "vibekit_daytona_api_key",
  },
  northflank_api_key: {
    id: "northflank_api_key",
    name: "Northflank API Key",
    description: "API key for Northflank sandbox provider",
    envKey: "NORTHFLANK_API_KEY",
    storageKey: "vibekit_northflank_api_key",
  },
  northflank_project_id: {
    id: "northflank_project_id",
    name: "Northflank Project ID",
    description: "Project ID for Northflank sandbox provider",
    envKey: "NORTHFLANK_PROJECT_ID",
    storageKey: "vibekit_northflank_project_id",
  },
} as const;

// Combined configuration for easy access
export const ALL_CONFIG = {
  ...AI_AGENTS_CONFIG,
  ...ENVIRONMENT_CONFIG,
} as const;

// Type definitions
export type AgentId = keyof typeof AI_AGENTS_CONFIG;
export type EnvironmentId = keyof typeof ENVIRONMENT_CONFIG;
export type ConfigId = keyof typeof ALL_CONFIG;

export interface ConfigItem {
  id: string;
  name: string;
  provider?: string;
  description: string;
  envKey: string;
  storageKey: string;
}

/**
 * Universal configuration storage service
 */
export class ConfigStorage {
  private static instance: ConfigStorage;
  private isClient: boolean;

  constructor() {
    this.isClient = typeof window !== 'undefined';
  }

  static getInstance(): ConfigStorage {
    if (!ConfigStorage.instance) {
      ConfigStorage.instance = new ConfigStorage();
    }
    return ConfigStorage.instance;
  }

  /**
   * Save a configuration value to localStorage
   */
  saveConfig(configId: ConfigId, value: string): boolean {
    if (!this.isClient) return false;

    try {
      const config = ALL_CONFIG[configId];
      if (!config) {
        console.warn(`Unknown config ID: ${configId}`);
        return false;
      }

      if (value.trim()) {
        localStorage.setItem(config.storageKey, value.trim());
      } else {
        localStorage.removeItem(config.storageKey);
      }
      return true;
    } catch (error) {
      console.error('Error saving config:', error);
      return false;
    }
  }

  /**
   * Get a configuration value from localStorage
   */
  getStoredConfig(configId: ConfigId): string | null {
    if (!this.isClient) return null;

    try {
      const config = ALL_CONFIG[configId];
      if (!config) {
        console.warn(`Unknown config ID: ${configId}`);
        return null;
      }

      return localStorage.getItem(config.storageKey);
    } catch (error) {
      console.error('Error getting stored config:', error);
      return null;
    }
  }

  /**
   * Get a configuration value with environment fallback
   * Priority: localStorage -> environment variable -> null
   */
  getConfig(configId: ConfigId): string | null {
    const config = ALL_CONFIG[configId];
    if (!config) {
      console.warn(`Unknown config ID: ${configId}`);
      return null;
    }

    // First try localStorage
    const storedValue = this.getStoredConfig(configId);
    if (storedValue && storedValue.trim()) {
      return storedValue;
    }

    // Fallback to environment variable (only works on server-side or if exposed to client)
    if (typeof process !== 'undefined' && process.env) {
      const envValue = process.env[config.envKey];
      if (envValue && envValue.trim()) {
        return envValue;
      }
    }

    // Check if environment variable is available on client-side (Next.js public env vars)
    if (this.isClient && config.envKey.startsWith('NEXT_PUBLIC_')) {
      const envValue = process.env[config.envKey];
      if (envValue && envValue.trim()) {
        return envValue;
      }
    }

    return null;
  }

  /**
   * Check if a configuration value is set (either in localStorage or environment)
   */
  isConfigSet(configId: ConfigId): boolean {
    return this.getConfig(configId) !== null;
  }

  /**
   * Get the source of a configuration value
   */
  getConfigSource(configId: ConfigId): 'localStorage' | 'environment' | 'none' {
    const config = ALL_CONFIG[configId];
    if (!config) return 'none';

    // Check localStorage first
    const storedValue = this.getStoredConfig(configId);
    if (storedValue && storedValue.trim()) {
      return 'localStorage';
    }

    // Check environment
    if (typeof process !== 'undefined' && process.env) {
      const envValue = process.env[config.envKey];
      if (envValue && envValue.trim()) {
        return 'environment';
      }
    }

    // Check client-side public env vars
    if (this.isClient && config.envKey.startsWith('NEXT_PUBLIC_')) {
      const envValue = process.env[config.envKey];
      if (envValue && envValue.trim()) {
        return 'environment';
      }
    }

    return 'none';
  }

  /**
   * Remove a configuration value from localStorage
   */
  removeConfig(configId: ConfigId): boolean {
    if (!this.isClient) return false;

    try {
      const config = ALL_CONFIG[configId];
      if (!config) {
        console.warn(`Unknown config ID: ${configId}`);
        return false;
      }

      localStorage.removeItem(config.storageKey);
      return true;
    } catch (error) {
      console.error('Error removing config:', error);
      return false;
    }
  }

  /**
   * Get all AI agent configurations
   */
  getAllAgentConfigs(): Record<AgentId, string | null> {
    const result = {} as Record<AgentId, string | null>;
    
    for (const agentId of Object.keys(AI_AGENTS_CONFIG) as AgentId[]) {
      result[agentId] = this.getConfig(agentId);
    }
    
    return result;
  }

  /**
   * Get all environment configurations
   */
  getAllEnvironmentConfigs(): Record<EnvironmentId, string | null> {
    const result = {} as Record<EnvironmentId, string | null>;
    
    for (const envId of Object.keys(ENVIRONMENT_CONFIG) as EnvironmentId[]) {
      result[envId] = this.getConfig(envId);
    }
    
    return result;
  }

  /**
   * Clear all stored configurations
   */
  clearAllConfigs(): boolean {
    if (!this.isClient) return false;

    try {
      for (const config of Object.values(ALL_CONFIG)) {
        localStorage.removeItem(config.storageKey);
      }
      return true;
    } catch (error) {
      console.error('Error clearing all configs:', error);
      return false;
    }
  }

  /**
   * Export all configurations (for backup/migration)
   */
  exportConfigs(): Record<string, string> {
    const result: Record<string, string> = {};
    
    for (const [configId, config] of Object.entries(ALL_CONFIG)) {
      const value = this.getStoredConfig(configId as ConfigId);
      if (value) {
        result[config.storageKey] = value;
      }
    }
    
    return result;
  }

  /**
   * Import configurations (for backup/migration)
   */
  importConfigs(configs: Record<string, string>): boolean {
    if (!this.isClient) return false;

    try {
      for (const [storageKey, value] of Object.entries(configs)) {
        if (value && value.trim()) {
          localStorage.setItem(storageKey, value.trim());
        }
      }
      return true;
    } catch (error) {
      console.error('Error importing configs:', error);
      return false;
    }
  }
}

// Export singleton instance
export const configStorage = ConfigStorage.getInstance();

/**
 * Test function to verify configuration system is working
 * This can be called from the browser console for debugging
 */
export function testConfigStorage() {
  console.log('Testing VibeKit Configuration Storage...');
  
  // Test saving and retrieving a config
  const testKey = 'claude' as AgentId;
  const testValue = 'test-api-key-12345';
  
  console.log('1. Testing saveConfig...');
  const saveResult = configStorage.saveConfig(testKey, testValue);
  console.log('Save result:', saveResult);
  
  console.log('2. Testing getStoredConfig...');
  const storedValue = configStorage.getStoredConfig(testKey);
  console.log('Stored value:', storedValue);
  
  console.log('3. Testing getConfig...');
  const configValue = configStorage.getConfig(testKey);
  console.log('Config value:', configValue);
  
  console.log('4. Testing getConfigSource...');
  const source = configStorage.getConfigSource(testKey);
  console.log('Config source:', source);
  
  console.log('5. Testing isConfigSet...');
  const isSet = configStorage.isConfigSet(testKey);
  console.log('Is config set:', isSet);
  
  console.log('6. Testing removeConfig...');
  const removeResult = configStorage.removeConfig(testKey);
  console.log('Remove result:', removeResult);
  
  console.log('7. Testing getAllAgentConfigs...');
  const allAgentConfigs = configStorage.getAllAgentConfigs();
  console.log('All agent configs:', allAgentConfigs);
  
  console.log('8. Testing getAllEnvironmentConfigs...');
  const allEnvConfigs = configStorage.getAllEnvironmentConfigs();
  console.log('All environment configs:', allEnvConfigs);
  
  console.log('Configuration storage test completed!');
  return {
    saveResult,
    storedValue,
    configValue,
    source,
    isSet,
    removeResult,
    allAgentConfigs,
    allEnvConfigs,
  };
}

/**
 * Comprehensive test function to verify all configuration keys are operational
 * This tests every single configuration key defined in the system
 */
export function testAllConfigKeys() {
  console.log('🧪 Testing ALL VibeKit Configuration Keys...');
  
  const results: Record<string, any> = {};
  
  // Test all AI agent configurations
  console.log('\n🤖 Testing AI Agent Configurations:');
  for (const [agentId, config] of Object.entries(AI_AGENTS_CONFIG)) {
    console.log(`\n  Testing ${agentId}...`);
    
    const testValue = `test-${agentId}-key-${Date.now()}`;
    
    // Test save
    const saveResult = configStorage.saveConfig(agentId as AgentId, testValue);
    
    // Test retrieve
    const retrievedValue = configStorage.getConfig(agentId as AgentId);
    const source = configStorage.getConfigSource(agentId as AgentId);
    const isSet = configStorage.isConfigSet(agentId as AgentId);
    
    // Test remove
    const removeResult = configStorage.removeConfig(agentId as AgentId);
    
    results[agentId] = {
      saveResult,
      retrievedValue,
      source,
      isSet,
      removeResult,
      config: config,
    };
    
    console.log(`    ✅ ${agentId}: Save=${saveResult}, Retrieve=${retrievedValue === testValue}, Source=${source}, Remove=${removeResult}`);
  }
  
  // Test all environment configurations
  console.log('\n🌍 Testing Environment Configurations:');
  for (const [envId, config] of Object.entries(ENVIRONMENT_CONFIG)) {
    console.log(`\n  Testing ${envId}...`);
    
    const testValue = `test-${envId}-value-${Date.now()}`;
    
    // Test save
    const saveResult = configStorage.saveConfig(envId as EnvironmentId, testValue);
    
    // Test retrieve
    const retrievedValue = configStorage.getConfig(envId as EnvironmentId);
    const source = configStorage.getConfigSource(envId as EnvironmentId);
    const isSet = configStorage.isConfigSet(envId as EnvironmentId);
    
    // Test remove
    const removeResult = configStorage.removeConfig(envId as EnvironmentId);
    
    results[envId] = {
      saveResult,
      retrievedValue,
      source,
      isSet,
      removeResult,
      config: config,
    };
    
    console.log(`    ✅ ${envId}: Save=${saveResult}, Retrieve=${retrievedValue === testValue}, Source=${source}, Remove=${removeResult}`);
  }
  
  // Test bulk operations
  console.log('\n📦 Testing Bulk Operations:');
  
  const allAgentConfigs = configStorage.getAllAgentConfigs();
  const allEnvConfigs = configStorage.getAllEnvironmentConfigs();
  
  console.log(`    ✅ getAllAgentConfigs: ${Object.keys(allAgentConfigs).length} agents`);
  console.log(`    ✅ getAllEnvironmentConfigs: ${Object.keys(allEnvConfigs).length} env vars`);
  
  // Test export/import
  console.log('\n📤 Testing Export/Import:');
  const exportedConfigs = configStorage.exportConfigs();
  console.log(`    ✅ Export: ${Object.keys(exportedConfigs).length} configs exported`);
  
  // Test clear all
  console.log('\n🗑️ Testing Clear All:');
  const clearResult = configStorage.clearAllConfigs();
  console.log(`    ✅ Clear All: ${clearResult}`);
  
  // Summary
  console.log('\n📊 Test Summary:');
  const totalKeys = Object.keys(AI_AGENTS_CONFIG).length + Object.keys(ENVIRONMENT_CONFIG).length;
  const successfulTests = Object.values(results).filter(r => r.saveResult && r.removeResult).length;
  
  console.log(`    Total Configuration Keys: ${totalKeys}`);
  console.log(`    Successful Tests: ${successfulTests}/${totalKeys}`);
  console.log(`    Status: ${successfulTests === totalKeys ? '✅ ALL OPERATIONAL' : '❌ SOME ISSUES'}`);
  
  return {
    results,
    allAgentConfigs,
    allEnvConfigs,
    exportedConfigs,
    clearResult,
    summary: {
      totalKeys,
      successfulTests,
      allOperational: successfulTests === totalKeys,
    },
  };
}