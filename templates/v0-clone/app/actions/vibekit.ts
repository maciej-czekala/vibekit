"use server";
import { VibeKit } from "@vibe-kit/sdk";
import { createNorthflankProvider } from "@vibe-kit/northflank";
import { createE2BProvider } from "@vibe-kit/e2b";
import { createDaytonaProvider } from "@vibe-kit/daytona";
import { fetchMutation } from "convex/nextjs";

import { api } from "@/convex/_generated/api";
import { inngest } from "@/lib/inngest";
import { auth } from "@/lib/auth";
import { Id } from "@/convex/_generated/dataModel";
import { Template } from "@/config";
import { configStorage } from "@/lib/config-storage";
import { validateConfiguration } from "@/lib/vibekit-config";

// Helper function to create VibeKit instance with new fluent API
function createVibeKitInstance(
  agentType: "claude" | "codex" | "opencode" | "gemini" | "grok" = "claude",
  sandboxProvider: "northflank" | "e2b" | "daytona" = "northflank",
  repository?: string,
  template?: Template
) {
  // Get API keys from config storage with environment fallback
  const agentApiKey = configStorage.getConfig(agentType) || 
    (agentType === "claude" 
      ? process.env.ANTHROPIC_API_KEY!
      : agentType === "codex" 
      ? process.env.OPENAI_API_KEY!
      : agentType === "gemini"
      ? process.env.GOOGLE_API_KEY!
      : agentType === "grok"
      ? process.env.XAI_API_KEY!
      : process.env.GROQ_API_KEY!);

  const agentProvider = agentType === "claude" 
    ? "anthropic" 
    : agentType === "codex" 
    ? "openai"
    : agentType === "gemini"
    ? "google"
    : agentType === "grok"
    ? "xai"
    : "groq";

  const agentModel = agentType === "claude" 
    ? "claude-3-5-sonnet-20241022"
    : agentType === "codex"
    ? "gpt-4o"
    : agentType === "gemini"
    ? "gemini-1.5-pro"
    : agentType === "grok"
    ? "grok-beta"
    : "llama-3.1-70b-versatile";

  // Create sandbox provider with config storage fallback
  let sandboxProviderInstance;
  switch (sandboxProvider) {
    case "northflank":
      const northflankApiKey = configStorage.getConfig('northflank_api_key') || process.env.NORTHFLANK_API_KEY!;
      const northflankProjectId = configStorage.getConfig('northflank_project_id') || process.env.NORTHFLANK_PROJECT_ID!;
      sandboxProviderInstance = createNorthflankProvider({
        apiKey: northflankApiKey,
        projectId: northflankProjectId,
        image: template?.image || "superagentai/vibekit-claude:1.0",
      });
      break;
    case "e2b":
      const e2bApiKey = configStorage.getConfig('e2b_api_key') || process.env.E2B_API_KEY!;
      sandboxProviderInstance = createE2BProvider({
        apiKey: e2bApiKey,
        templateId: "vibekit-claude",
      });
      break;
    case "daytona":
      const daytonaApiKey = configStorage.getConfig('daytona_api_key') || process.env.DAYTONA_API_KEY!;
      sandboxProviderInstance = createDaytonaProvider({
        apiKey: daytonaApiKey,
        image: template?.image || "superagentai/vibekit-claude:1.0",
      });
      break;
    default:
      throw new Error(`Unsupported sandbox provider: ${sandboxProvider}`);
  }

  // Create VibeKit instance with fluent API
  const vibeKit = new VibeKit()
    .withAgent({
      type: agentType,
      provider: agentProvider,
      apiKey: agentApiKey,
      model: agentModel,
    })
    .withSandbox(sandboxProviderInstance);

  // Add GitHub configuration if repository is provided
  if (repository) {
    const githubToken = configStorage.getConfig('github_token') || process.env.GITHUB_TOKEN!;
    vibeKit.withGithub({
      token: githubToken,
      repository: repository,
    });
  }

  // Add working directory and secrets if template is provided
  if (template?.workingDirectory) {
    vibeKit.withWorkingDirectory(template.workingDirectory);
  }

  if (template?.secrets) {
    vibeKit.withSecrets(template.secrets);
  }

  return vibeKit;
}

export async function runAgentAction({
  sessionId,
  id,
  message,
  template,
  repository,
  token,
}: {
  sessionId: string;
  id: Id<"sessions">;
  message: string;
  template?: Template;
  token: string;
  repository?: string;
}) {
  // Validate configuration before proceeding
  const validation = validateConfiguration('claude', 'northflank_api_key');
  if (!validation.isValid) {
    throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
  }
  
  if (validation.warnings.length > 0) {
    console.warn('Configuration warnings:', validation.warnings);
  }

  await inngest.send({
    name: "vibe0/run.agent",
    data: {
      sessionId,
      id,
      message,
      template,
      repository,
      token,
    },
  });
}

export async function runAgentActionDirect({
  id,
  message,
  template,
  repository,
}: {
  id: Id<"sessions">;
  message: string;
  template?: Template;
  repository?: string;
}) {
  const vibekit = createVibeKitInstance("claude", "northflank", repository, template);

  await fetchMutation(api.sessions.update, {
    id,
    status: "CUSTOM",
    statusMessage: "Working on task",
  });

  const prompt =
    template?.systemPrompt ||
    "# GOAL\nYou are an helpful assistant that is tasked with helping the user build a NextJS app.\n" +
      "- The NextJS dev server is running on port 3000.\n" +
      +"Do not run tests or restart the dev server.\n" +
      `Follow the users intructions:\n\n# INSTRUCTIONS\n${message}`;

  const response = await vibekit.generateCode({
    prompt: prompt,
    mode: "code",
  });

  await fetchMutation(api.sessions.update, {
    id,
    status: "CUSTOM",
    statusMessage: "Task completed",
  });

  return response;
}

export async function createSessionAction({
  sessionId,
  message,
  repository,
  template,
}: {
  sessionId: string;
  message?: string;
  repository?: string;
  template?: Template;
}) {
  const session = await auth();
  await inngest.send({
    name: "vibe0/create.session",
    data: {
      sessionId,
      message,
      repository,
      token: session?.accessToken,
      template,
    },
  });
}

export async function deleteSessionAction(sessionId: string) {
  const vibekit = createVibeKitInstance("claude", "northflank");
  await vibekit.setSession(sessionId);
  await vibekit.kill();
}

export const createPullRequestAction = async ({
  id,
  sessionId,
  repository,
}: {
  id: Id<"sessions">;
  sessionId: string;
  repository: string;
}) => {
  const session = await auth();

  if (!session?.accessToken) {
    throw new Error("No GitHub token found. Please authenticate first.");
  }

  const vibekit = createVibeKitInstance("claude", "northflank", repository);
  await vibekit.setSession(sessionId);

  const pr = await vibekit.createPullRequest(
    {
      name: "🖖 vibe0",
      color: "42460b",
      description: "Pull request created by vibe0",
    },
    "vibe0"
  );

  await fetchMutation(api.sessions.update, {
    id,
    pullRequest: pr,
  });
};
