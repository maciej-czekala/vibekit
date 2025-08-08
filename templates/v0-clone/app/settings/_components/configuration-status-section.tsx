"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, AlertCircle, Settings } from "lucide-react";
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

  React.useEffect(() => {
    setMounted(true);
    const configStatus = getConfigurationStatus();
    setStatus(configStatus);
  }, []);

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

  const getSourceBadge = (source: string) => {
    const color = source === 'localStorage' ? 'bg-blue-100 text-blue-800' : 
                  source === 'environment' ? 'bg-green-100 text-green-800' : 
                  'bg-gray-100 text-gray-800';
    
    return (
      <Badge variant="secondary" className={color}>
        {source}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuration Status
        </CardTitle>
        <CardDescription>
          Overview of your VibeKit configuration and what&apos;s needed to get started.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <span className="font-medium">System Status</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {status.summary.totalAgentsConfigured}
              </div>
              <div className="text-sm text-muted-foreground">AI Agents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {status.summary.totalEnvironmentConfigured}
              </div>
              <div className="text-sm text-muted-foreground">Environment</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${status.summary.isReady ? 'text-green-600' : 'text-red-600'}`}>
                {status.summary.isReady ? 'Ready' : 'Not Ready'}
              </div>
              <div className="text-sm text-muted-foreground">System</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* AI Agents */}
        <div>
          <h3 className="text-lg font-semibold mb-3">AI Agents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(status.agents).map(([agent, config]: [string, { configured: boolean; source: string }]) => (
              <div key={agent} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(config.configured)}
                  <span className="font-medium capitalize">{agent}</span>
                </div>
                {getSourceBadge(config.source)}
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Environment Configuration */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Environment Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(status.environment).map(([env, config]: [string, { configured: boolean; source: string }]) => (
              <div key={env} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(config.configured)}
                  <span className="font-medium">{env.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                </div>
                {getSourceBadge(config.source)}
              </div>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="font-semibold text-amber-800 mb-2">Requirements</h4>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• GitHub token is required for repository operations</li>
            <li>• At least one AI agent API key is recommended</li>
            <li>• At least one sandbox provider is required for code execution</li>
            <li>• Northflank requires both API key and Project ID</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
