"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Eye, EyeOff, Edit3, Save, X, Settings, Check } from "lucide-react";
import { useEnvironmentConfigs } from "@/hooks/use-config";
import { ENVIRONMENT_CONFIG, EnvironmentId } from "@/lib/config-storage";

interface EnvironmentUIState {
  isEditing: boolean;
  showValue: boolean;
  inputValue: string;
}

type EnvironmentUIStates = Record<EnvironmentId, EnvironmentUIState>;

interface EnvironmentConfigSectionProps {
  onExpand?: () => void;
}

export function EnvironmentConfigSection({ onExpand }: EnvironmentConfigSectionProps) {
  const { mounted, saveEnvironmentConfig, getEnvironmentConfigInfo } = useEnvironmentConfigs();
  const [isOpen, setIsOpen] = useState(false);
  const [uiStates, setUiStates] = useState<EnvironmentUIStates>({} as EnvironmentUIStates);
  const [savedEnvId, setSavedEnvId] = useState<string | null>(null);

  // Initialize UI states
  React.useEffect(() => {
    if (mounted) {
      const initialStates: EnvironmentUIStates = {} as EnvironmentUIStates;
      
      for (const envId of Object.keys(ENVIRONMENT_CONFIG) as EnvironmentId[]) {
        initialStates[envId] = {
          isEditing: false,
          showValue: false,
          inputValue: "",
        };
      }
      
      setUiStates(initialStates);
    }
  }, [mounted]);

  const maskKey = (key: string): string => {
    if (key.length <= 8) return key;
    return `${key.substring(0, 6)}${"*".repeat(Math.max(key.length - 12, 4))}${key.substring(key.length - 6)}`;
  };

  const handleEdit = (envId: EnvironmentId) => {
    const configInfo = getEnvironmentConfigInfo();
    const currentValue = configInfo[envId]?.value || "";
    
    setUiStates(prev => ({
      ...prev,
      [envId]: {
        ...prev[envId],
        isEditing: true,
        showValue: false,
        inputValue: configInfo[envId]?.source === 'localStorage' ? currentValue : "",
      }
    }));
  };

  const handleSave = (envId: EnvironmentId) => {
    const currentUIState = uiStates[envId];
    if (currentUIState) {
      const success = saveEnvironmentConfig(envId, currentUIState.inputValue);
      if (success) {
        setUiStates(prev => ({
          ...prev,
          [envId]: {
            ...prev[envId],
            isEditing: false,
            showValue: false,
            inputValue: "",
          }
        }));
        
        // Show success animation
        setSavedEnvId(envId);
        setTimeout(() => setSavedEnvId(null), 2000);
        
        // Dispatch event to notify other components
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('vibekit-config-changed'));
        }
      }
    }
  };

  const handleCancel = (envId: EnvironmentId) => {
    setUiStates(prev => ({
      ...prev,
      [envId]: {
        ...prev[envId],
        isEditing: false,
        showValue: false,
        inputValue: "",
      }
    }));
  };

  const handleInputChange = (envId: EnvironmentId, value: string) => {
    setUiStates(prev => ({
      ...prev,
      [envId]: {
        ...prev[envId],
        inputValue: value,
      }
    }));
  };

  const toggleShowValue = (envId: EnvironmentId) => {
    setUiStates(prev => ({
      ...prev,
      [envId]: {
        ...prev[envId],
        showValue: !prev[envId]?.showValue,
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
      (window as any).expandEnvironmentConfigSection = expandSection;
    }
  }, [isOpen, expandSection]);

  if (!mounted) {
    return (
      <div className="bg-card rounded-lg border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div id="environment-config-section" className="bg-card rounded-lg border">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full p-6 hover:bg-muted/50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <div className="text-left">
                <h2 className="text-xl font-semibold">Environment Configuration</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure environment keys for sandbox providers and integrations
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
            {Object.entries(ENVIRONMENT_CONFIG).map(([envId, config], index) => {
              const configInfo = getEnvironmentConfigInfo();
              const info = configInfo[envId as EnvironmentId];
              const uiState = uiStates[envId as EnvironmentId];
              
              if (!info || !uiState) return null;

                          return (
              <div key={envId} className={`transition-all duration-300 ${
                savedEnvId === envId ? 'bg-green-50 border border-green-200 rounded-lg p-4' : ''
              }`}>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{config.name}</h3>
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
                          {config.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`${envId}-key`} className="text-sm">
                        {config.envKey}
                      </Label>
                      
                      {uiState.isEditing ? (
                        <div className="flex gap-2">
                          <Input
                            id={`${envId}-key`}
                            type="password"
                            placeholder={`Enter your ${config.name.toLowerCase()}`}
                            value={uiState.inputValue}
                            onChange={(e) => handleInputChange(envId as EnvironmentId, e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSave(envId as EnvironmentId)}
                            disabled={!uiState.inputValue.trim()}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancel(envId as EnvironmentId)}
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
                                  {uiState.showValue ? info.value : maskKey(info.value || "")}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => toggleShowValue(envId as EnvironmentId)}
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
                                  onClick={() => handleEdit(envId as EnvironmentId)}
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
                                onClick={() => handleEdit(envId as EnvironmentId)}
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
                  
                  {index < Object.keys(ENVIRONMENT_CONFIG).length - 1 && (
                    <Separator className="mt-6" />
                  )}
                </div>
              );
            })}

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> Environment keys are stored locally in your browser&apos;s localStorage. 
                If no key is configured here, VibeKit will use the corresponding environment variable from .env.local.
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}