"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Eye, EyeOff, Edit3, Save, X, Key, Check } from "lucide-react";
import { useAgentConfigs } from "@/hooks/use-config";
import { AI_AGENTS_CONFIG, AgentId } from "@/lib/config-storage";


interface AgentUIState {
  isEditing: boolean;
  showValue: boolean;
  inputValue: string;
}

type AgentUIStates = Record<AgentId, AgentUIState>;

interface ApiKeysSectionProps {
  onExpand?: () => void;
}

export function ApiKeysSection({ onExpand }: ApiKeysSectionProps) {
  const { mounted, saveAgentConfig, getAgentConfigInfo } = useAgentConfigs();
  const [isOpen, setIsOpen] = useState(false);
  const [uiStates, setUiStates] = useState<AgentUIStates>({} as AgentUIStates);
  const [savedAgentId, setSavedAgentId] = useState<string | null>(null);

  // Initialize UI states
  React.useEffect(() => {
    if (mounted) {
      const initialStates: AgentUIStates = {} as AgentUIStates;
      
      for (const agentId of Object.keys(AI_AGENTS_CONFIG) as AgentId[]) {
        initialStates[agentId] = {
          isEditing: false,
          showValue: false,
          inputValue: "",
        };
      }
      
      setUiStates(initialStates);
    }
  }, [mounted]);

  const maskApiKey = (key: string): string => {
    if (key.length <= 8) return key;
    return `${key.substring(0, 4)}${"*".repeat(key.length - 8)}${key.substring(key.length - 4)}`;
  };

  const handleEdit = (agentId: AgentId) => {
    const configInfo = getAgentConfigInfo();
    const currentValue = configInfo[agentId]?.value || "";
    
    setUiStates(prev => ({
      ...prev,
      [agentId]: {
        ...prev[agentId],
        isEditing: true,
        showValue: false,
        inputValue: configInfo[agentId]?.source === 'localStorage' ? currentValue : "",
      }
    }));
  };

  const handleSave = (agentId: AgentId) => {
    const currentUIState = uiStates[agentId];
    if (currentUIState) {
      const success = saveAgentConfig(agentId, currentUIState.inputValue);
      if (success) {
        setUiStates(prev => ({
          ...prev,
          [agentId]: {
            ...prev[agentId],
            isEditing: false,
            showValue: false,
            inputValue: "",
          }
        }));
        
        // Show success animation
        setSavedAgentId(agentId);
        setTimeout(() => setSavedAgentId(null), 2000);
        
        // Dispatch event to notify other components
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('vibekit-config-changed'));
        }
      }
    }
  };

  const handleCancel = (agentId: AgentId) => {
    setUiStates(prev => ({
      ...prev,
      [agentId]: {
        ...prev[agentId],
        isEditing: false,
        showValue: false,
        inputValue: "",
      }
    }));
  };

  const handleInputChange = (agentId: AgentId, value: string) => {
    setUiStates(prev => ({
      ...prev,
      [agentId]: {
        ...prev[agentId],
        inputValue: value,
      }
    }));
  };

  const toggleShowValue = (agentId: AgentId) => {
    setUiStates(prev => ({
      ...prev,
      [agentId]: {
        ...prev[agentId],
        showValue: !prev[agentId]?.showValue,
      }
    }));
  };

  const expandSection = useCallback(() => {
    if (!isOpen) {
      setIsOpen(true);
      onExpand?.();
    }
  }, [isOpen, onExpand]);

  // Expose expand function via useEffect for external access
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as Window & typeof globalThis & { expandApiKeysSection: () => void }).expandApiKeysSection = expandSection;
    }
  }, [isOpen, expandSection]);

  if (!mounted) {
    return (
      <div className="bg-card rounded-lg border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div id="api-keys-section">
      <div className="bg-card rounded-lg border">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="w-full p-6 hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-muted-foreground" />
                <div className="text-left">
                  <h2 className="text-xl font-semibold">AI API Keys</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Configure API keys for AI agents. Keys are stored locally in your browser.
                  </p>
                </div>
              </div>
              {isOpen ? (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="px-6 pb-6 space-y-6">
        {Object.entries(AI_AGENTS_CONFIG).map(([agentId, agent], index) => {
          const configInfo = getAgentConfigInfo();
          const info = configInfo[agentId as AgentId];
          const uiState = uiStates[agentId as AgentId];
          
          if (!info || !uiState) return null;

          return (
            <div key={agentId} className={`transition-all duration-300 ${
              savedAgentId === agentId ? 'bg-green-50 border border-green-200 rounded-lg p-4' : ''
            }`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{agent.name}</h3>
                      <span className="text-xs bg-muted px-2 py-1 rounded">
                        {agent.provider}
                      </span>
                      {info.source === 'environment' && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          From .env.local
                        </span>
                      )}
                      {info.source === 'localStorage' && (
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {agent.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${agentId}-key`} className="text-sm">
                    {agent.envKey}
                  </Label>
                  
                  {uiState.isEditing ? (
                    <div className="flex gap-2">
                      <Input
                        id={`${agentId}-key`}
                        type="password"
                        placeholder={`Enter your ${agent.name} API key`}
                        value={uiState.inputValue}
                        onChange={(e) => handleInputChange(agentId as AgentId, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSave(agentId as AgentId)}
                        disabled={!uiState.inputValue.trim()}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancel(agentId as AgentId)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {info.isSet ? (
                        <div className="space-y-2">
                          <div className="relative">
                            <div className="px-3 py-2 bg-muted rounded-md text-sm font-mono break-all min-h-[40px] flex items-center">
                              {uiState.showValue ? info.value : maskApiKey(info.value || "")}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleShowValue(agentId as AgentId)}
                              className="flex items-center gap-1"
                            >
                              {uiState.showValue ? (
                                <>
                                  <EyeOff className="h-4 w-4" />
                                  Hide
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4" />
                                  Show
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(agentId as AgentId)}
                              className="flex items-center gap-1"
                            >
                              <Edit3 className="h-4 w-4" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            Not configured - will use value from .env.local
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(agentId as AgentId)}
                            className="flex items-center gap-1"
                          >
                            <Edit3 className="h-4 w-4" />
                            Add Key
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {index < Object.keys(AI_AGENTS_CONFIG).length - 1 && (
                <Separator className="mt-6" />
              )}
            </div>
          );
        })}
            </div>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> API keys are stored locally in your browser&apos;s localStorage. 
                If no key is configured here, VibeKit will use the corresponding environment variable from .env.local.
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}