"use client";

import React from "react";
import { ApiKeysSection } from "./_components/api-keys-section";
import { EnvironmentConfigSection } from "./_components/environment-config-section";
import { ConfigurationStatusSection } from "./_components/configuration-status-section";

export default function SettingsClientPage() {
  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and preferences.
          </p>
        </div>
        
        <div className="space-y-6">
          <ConfigurationStatusSection />
          <ApiKeysSection onExpand={() => {}} />
          <EnvironmentConfigSection onExpand={() => {}} />
        </div>
      </div>
    </div>
  );
}