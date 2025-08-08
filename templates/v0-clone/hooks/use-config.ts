"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  configStorage, 
  ConfigId, 
  AgentId, 
  EnvironmentId, 
  AI_AGENTS_CONFIG,
  ENVIRONMENT_CONFIG,
  ALL_CONFIG 
} from '@/lib/config-storage';

/**
 * Hook for managing a single configuration value
 */
export function useConfig(configId: ConfigId) {
  const [value, setValue] = useState<string | null>(null);
  const [isSet, setIsSet] = useState(false);
  const [source, setSource] = useState<'localStorage' | 'environment' | 'none'>('none');
  const [mounted, setMounted] = useState(false);

  // Load initial value
  useEffect(() => {
    const currentValue = configStorage.getConfig(configId);
    const currentSource = configStorage.getConfigSource(configId);
    
    setValue(currentValue);
    setIsSet(currentValue !== null);
    setSource(currentSource);
    setMounted(true);
  }, [configId]);

  // Save configuration
  const saveConfig = useCallback((newValue: string) => {
    const success = configStorage.saveConfig(configId, newValue);
    if (success) {
      const updatedValue = configStorage.getConfig(configId);
      const updatedSource = configStorage.getConfigSource(configId);
      
      setValue(updatedValue);
      setIsSet(updatedValue !== null);
      setSource(updatedSource);
    }
    return success;
  }, [configId]);

  // Remove configuration
  const removeConfig = useCallback(() => {
    const success = configStorage.removeConfig(configId);
    if (success) {
      const updatedValue = configStorage.getConfig(configId);
      const updatedSource = configStorage.getConfigSource(configId);
      
      setValue(updatedValue);
      setIsSet(updatedValue !== null);
      setSource(updatedSource);
    }
    return success;
  }, [configId]);

  // Get stored value (localStorage only, no env fallback)
  const getStoredValue = useCallback(() => {
    return configStorage.getStoredConfig(configId);
  }, [configId]);

  return {
    value,
    isSet,
    source,
    mounted,
    saveConfig,
    removeConfig,
    getStoredValue,
    config: ALL_CONFIG[configId],
  };
}

/**
 * Hook for managing all AI agent configurations
 */
export function useAgentConfigs() {
  const [configs, setConfigs] = useState<Record<AgentId, string | null>>({} as Record<AgentId, string | null>);
  const [mounted, setMounted] = useState(false);

  // Load initial values
  useEffect(() => {
    const allConfigs = configStorage.getAllAgentConfigs();
    setConfigs(allConfigs);
    setMounted(true);
  }, []);

  // Save a specific agent config
  const saveAgentConfig = useCallback((agentId: AgentId, value: string) => {
    const success = configStorage.saveConfig(agentId, value);
    if (success) {
      setConfigs(prev => ({
        ...prev,
        [agentId]: configStorage.getConfig(agentId),
      }));
    }
    return success;
  }, []);

  // Remove a specific agent config
  const removeAgentConfig = useCallback((agentId: AgentId) => {
    const success = configStorage.removeConfig(agentId);
    if (success) {
      setConfigs(prev => ({
        ...prev,
        [agentId]: configStorage.getConfig(agentId),
      }));
    }
    return success;
  }, []);

  // Get configuration info for all agents
  const getAgentConfigInfo = useCallback(() => {
    const info: Record<AgentId, {
      value: string | null;
      isSet: boolean;
      source: 'localStorage' | 'environment' | 'none';
      config: typeof AI_AGENTS_CONFIG[AgentId];
    }> = {} as any;

    for (const agentId of Object.keys(AI_AGENTS_CONFIG) as AgentId[]) {
      info[agentId] = {
        value: configStorage.getConfig(agentId),
        isSet: configStorage.isConfigSet(agentId),
        source: configStorage.getConfigSource(agentId),
        config: AI_AGENTS_CONFIG[agentId],
      };
    }

    return info;
  }, []);

  return {
    configs,
    mounted,
    saveAgentConfig,
    removeAgentConfig,
    getAgentConfigInfo,
  };
}

/**
 * Hook for managing all environment configurations
 */
export function useEnvironmentConfigs() {
  const [configs, setConfigs] = useState<Record<EnvironmentId, string | null>>({} as Record<EnvironmentId, string | null>);
  const [mounted, setMounted] = useState(false);

  // Load initial values
  useEffect(() => {
    const allConfigs = configStorage.getAllEnvironmentConfigs();
    setConfigs(allConfigs);
    setMounted(true);
  }, []);

  // Save a specific environment config
  const saveEnvironmentConfig = useCallback((envId: EnvironmentId, value: string) => {
    const success = configStorage.saveConfig(envId, value);
    if (success) {
      setConfigs(prev => ({
        ...prev,
        [envId]: configStorage.getConfig(envId),
      }));
    }
    return success;
  }, []);

  // Remove a specific environment config
  const removeEnvironmentConfig = useCallback((envId: EnvironmentId) => {
    const success = configStorage.removeConfig(envId);
    if (success) {
      setConfigs(prev => ({
        ...prev,
        [envId]: configStorage.getConfig(envId),
      }));
    }
    return success;
  }, []);

  // Get configuration info for all environment variables
  const getEnvironmentConfigInfo = useCallback(() => {
    const info: Record<EnvironmentId, {
      value: string | null;
      isSet: boolean;
      source: 'localStorage' | 'environment' | 'none';
      config: typeof ENVIRONMENT_CONFIG[EnvironmentId];
    }> = {} as any;

    for (const envId of Object.keys(ENVIRONMENT_CONFIG) as EnvironmentId[]) {
      info[envId] = {
        value: configStorage.getConfig(envId),
        isSet: configStorage.isConfigSet(envId),
        source: configStorage.getConfigSource(envId),
        config: ENVIRONMENT_CONFIG[envId],
      };
    }

    return info;
  }, []);

  return {
    configs,
    mounted,
    saveEnvironmentConfig,
    removeEnvironmentConfig,
    getEnvironmentConfigInfo,
  };
}

/**
 * Hook for managing all configurations
 */
export function useAllConfigs() {
  const agentHook = useAgentConfigs();
  const environmentHook = useEnvironmentConfigs();

  const clearAllConfigs = useCallback(() => {
    return configStorage.clearAllConfigs();
  }, []);

  const exportConfigs = useCallback(() => {
    return configStorage.exportConfigs();
  }, []);

  const importConfigs = useCallback((configs: Record<string, string>) => {
    const success = configStorage.importConfigs(configs);
    if (success) {
      // Refresh both hooks
      window.location.reload(); // Simple way to refresh all hooks
    }
    return success;
  }, []);

  return {
    ...agentHook,
    ...environmentHook,
    clearAllConfigs,
    exportConfigs,
    importConfigs,
    mounted: agentHook.mounted && environmentHook.mounted,
  };
}

/**
 * Utility hook to get a specific config value with real-time updates
 */
export function useConfigValue(configId: ConfigId) {
  const { value, isSet, source, mounted } = useConfig(configId);
  
  return {
    value,
    isSet,
    source,
    mounted,
    // Convenience methods
    isFromLocalStorage: source === 'localStorage',
    isFromEnvironment: source === 'environment',
    isEmpty: !isSet,
  };
}