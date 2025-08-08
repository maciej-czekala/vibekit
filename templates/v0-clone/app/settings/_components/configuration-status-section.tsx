"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, AlertCircle, Settings, ArrowRight } from "lucide-react";
import { getConfigurationStatus } from "@/lib/vibekit-config";

export function ConfigurationStatusSection() {
  const [status, setStatus] = React.useState<{
    agents: Record<string, { configured: boolean; source: string }>;
    environment: Record<string, { configured: boolean; source: string }>;
    summary: {
      totalAgentsConfigured: number;
      totalEnvironmentConfigured: number;
      isReady: boolean;
    };
  } | null>(null);
  const [mounted, setMounted] = React.useState(false);

  const refreshStatus = React.useCallback(() => {
    const configStatus = getConfigurationStatus();
    setStatus(configStatus);
  }, []);

  React.useEffect(() => {
    setMounted(true);
    refreshStatus();
  }, [refreshStatus]);

  // Listen for configuration changes
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleConfigChange = () => {
        refreshStatus();
      };
      
      window.addEventListener('vibekit-config-changed', handleConfigChange);
      
      return () => {
        window.removeEventListener('vibekit-config-changed', handleConfigChange);
      };
    }
  }, [refreshStatus]);

  if (!mounted || !status) {
    return null;
  }

  const getStatusIcon = (configured: boolean) => {
    return configured ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };



  // Check minimum requirements
  const hasGitHubToken = status.environment.githubToken?.configured || false;
  const hasGitHubOAuthId = status.environment.githubOAuthClientId?.configured || false;
  const hasAtLeastOneAgent = status.summary.totalAgentsConfigured > 0;
  const hasAtLeastOneDeployment = status.environment.e2bApiKey?.configured || 
                                  status.environment.daytonaApiKey?.configured || 
                                  status.environment.northflankApiKey?.configured;

  const scrollToSectionAndExpand = (sectionId: string) => {
    // First expand the section if needed
    if (sectionId === 'api-keys-section' && typeof window !== 'undefined' && (window as any).expandApiKeysSection) {
      (window as any).expandApiKeysSection();
    } else if (sectionId === 'environment-config-section' && typeof window !== 'undefined' && (window as any).expandEnvironmentConfigSection) {
      (window as any).expandEnvironmentConfigSection();
    }
    
    // Then scroll to the section
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100); // Small delay to ensure expansion happens first
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Required Configuration
        </CardTitle>
        <CardDescription>
          Minimum requirements to get started with VibeKit.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <AlertCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <span className="font-semibold text-blue-900">System Status</span>
              <p className="text-sm text-blue-700">Configuration overview</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className={`text-3xl font-bold transition-colors duration-300 ${hasAtLeastOneAgent ? 'text-green-600' : 'text-red-600'}`}>
                {hasAtLeastOneAgent ? '✓' : '✗'}
              </div>
              <div className="text-sm font-medium text-blue-800">AI Agent</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold transition-colors duration-300 ${hasGitHubToken ? 'text-green-600' : 'text-red-600'}`}>
                {hasGitHubToken ? '✓' : '✗'}
              </div>
              <div className="text-sm font-medium text-blue-800">GitHub</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold transition-colors duration-300 ${hasAtLeastOneDeployment ? 'text-green-600' : 'text-red-600'}`}>
                {hasAtLeastOneDeployment ? '✓' : '✗'}
              </div>
              <div className="text-sm font-medium text-blue-800">Deployment</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Required Elements */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Required Configuration</h3>
          
          {/* Only show incomplete configurations */}
          {!hasGitHubToken && (
            <div className="flex items-center justify-between p-4 border-2 border-red-200 bg-red-50 rounded-lg transition-all duration-300 hover:bg-red-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-100">
                  {getStatusIcon(false)}
                </div>
                <div>
                  <span className="font-semibold text-gray-900">GitHub Token</span>
                  <p className="text-sm text-gray-600">Required for repository operations</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => scrollToSectionAndExpand('environment-config-section')}
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Configure
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {!hasGitHubOAuthId && (
            <div className="flex items-center justify-between p-4 border-2 border-red-200 bg-red-50 rounded-lg transition-all duration-300 hover:bg-red-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-100">
                  {getStatusIcon(false)}
                </div>
                <div>
                  <span className="font-semibold text-gray-900">GitHub OAuth Client ID</span>
                  <p className="text-sm text-gray-600">Required for GitHub authentication</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => scrollToSectionAndExpand('environment-config-section')}
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Configure
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {!hasAtLeastOneAgent && (
            <div className="flex items-center justify-between p-4 border-2 border-red-200 bg-red-50 rounded-lg transition-all duration-300 hover:bg-red-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-100">
                  {getStatusIcon(false)}
                </div>
                <div>
                  <span className="font-semibold text-gray-900">AI Agent</span>
                  <p className="text-sm text-gray-600">At least one AI agent required</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => scrollToSectionAndExpand('api-keys-section')}
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Configure
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {!hasAtLeastOneDeployment && (
            <div className="flex items-center justify-between p-4 border-2 border-red-200 bg-red-50 rounded-lg transition-all duration-300 hover:bg-red-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-100">
                  {getStatusIcon(false)}
                </div>
                <div>
                  <span className="font-semibold text-gray-900">Deployment Environment</span>
                  <p className="text-sm text-gray-600">At least one sandbox provider required</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => scrollToSectionAndExpand('environment-config-section')}
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Configure
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Show message when all configurations are complete */}
          {hasGitHubToken && hasGitHubOAuthId && hasAtLeastOneAgent && hasAtLeastOneDeployment && (
            <div className="flex items-center justify-center p-6 border-2 border-green-200 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-100">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-center">
                  <span className="font-semibold text-green-800">All Required Configurations Complete!</span>
                  <p className="text-sm text-green-700">You can now use VibeKit.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* System Ready Status - Only show when all configurations are complete */}
        {hasGitHubToken && hasGitHubOAuthId && hasAtLeastOneAgent && hasAtLeastOneDeployment && (
          <div className="p-6 rounded-lg border-2 bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-lg transition-all duration-500">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <span className="text-lg font-bold text-green-800">
                  System Ready
                </span>
                <p className="text-sm mt-1 text-green-700">
                  All required configurations are complete. You can now use VibeKit.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
