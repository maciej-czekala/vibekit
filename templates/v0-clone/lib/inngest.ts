import { Inngest } from "inngest";
import { realtimeMiddleware, channel, topic } from "@inngest/realtime";
import { VibeKit } from "@vibe-kit/sdk";
import { createNorthflankProvider } from "@vibe-kit/northflank";
import { createE2BProvider } from "@vibe-kit/e2b";
import { createDaytonaProvider } from "@vibe-kit/daytona";
import { fetchMutation } from "convex/nextjs";

import { api } from "@/convex/_generated/api";
import { runAgentAction } from "@/app/actions/vibekit";
import { generateSessionTitle } from "@/app/actions/session";
import { createRepo } from "@/app/actions/github";
import { Template } from "@/config";
import { Id } from "@/convex/_generated/dataModel";
import { configStorage } from "@/lib/config-storage";

let app: Inngest | undefined;
// Create a client to send and receive events
export const inngest = new Inngest({
  id: "vibe0",
  middleware: [realtimeMiddleware()],
});

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

export const sessionChannel = channel("sessions")
  .addTopic(
    topic("status").type<{
      status:
        | "IN_PROGRESS"
        | "CLONING_REPO"
        | "INSTALLING_DEPENDENCIES"
        | "STARTING_DEV_SERVER"
        | "CREATING_TUNNEL"
        | "RUNNING";
      sessionId: string;
      id: string;
    }>()
  )
  .addTopic(
    topic("update").type<{
      sessionId: string;
      message: Record<string, unknown>;
    }>()
  );

export const getInngestApp = () => {
  if (!app) {
    app = new Inngest({
      id: "vibe0",
      middleware: [realtimeMiddleware()],
    });
  }
  return app;
};

export const runAgent = inngest.createFunction(
  { id: "run-agent", retries: 0, concurrency: 100 },
  { event: "vibe0/run.agent" },
  async ({ event, step }) => {
    const {
      sessionId: _sessionId,
      id,
      message,
      template,
      repository,
      token: _token,
    }: {
      sessionId: string;
      id: string;
      message: string;
      template?: Template;
      repository?: string;
      token: string;
    } = event.data;

    const config = {
      agent: {
        type: "claude" as const,
        provider: "anthropic" as const,
        apiKey: configStorage.getConfig('claude') || process.env.ANTHROPIC_API_KEY!,
        model: "claude-3-5-sonnet-20241022",
      },
      environment: {
        northflank: {
          apiKey: configStorage.getConfig('northflank_api_key') || process.env.NORTHFLANK_API_KEY!,
          projectId: configStorage.getConfig('northflank_project_id') || process.env.NORTHFLANK_PROJECT_ID!,
          image: template?.image,
        },
      },
      secrets: template?.secrets,
    };

    const result = await step.run("generate code", async () => {
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
    });

    return result;
  }
);

export const createSession = inngest.createFunction(
  { id: "create-session", retries: 0, concurrency: 100 },
  { event: "vibe0/create.session" },

  async ({ event, step }) => {
    const {
      sessionId: id,
      message,
      repository,
      token,
      template,
    }: {
      sessionId: Id<"sessions">;
      message: string;
      repository: string;
      token: string;
      template: Template;
    } = event.data;

    let sandboxId: string;

    const vibekit = createVibeKitInstance("claude", "northflank", repository, template);

    const data = await step.run("get tunnel url", async () => {
      const title = await generateSessionTitle(message);

      await fetchMutation(api.sessions.update, {
        id,
        status: "CLONING_REPO",
        name: title,
      });

      if (!repository && template) {
        const repository = await createRepo({
          repoName: `vibe0-${template.repository.replace("https://github.com/", "").replace("/", "-")}-${Date.now().toString().slice(-6)}`,
          token,
        });

        // Handle both full GitHub URLs and repo paths
        const templateCloneUrl = template.repository.startsWith(
          "https://github.com/"
        )
          ? `${template.repository}.git`
          : `https://github.com/${template.repository}.git`;

        const commands = [
          // Clone the template repo directly to root
          `git clone ${templateCloneUrl} .`,
          // Configure git user for commits
          `git config --global user.email "vibe0@vibekit.sh"`,
          `git config --global user.name "Vibe0 Bot"`,
          // Remove the template's git history and set up new repo
          `rm -rf .git`,
          `git init`,
          `git checkout -b main`,
          `git remote add origin https://${token}@github.com/${repository.full_name}.git`,
          // Add, commit and push all files
          `git add . && git commit -m "Initial commit from template ${template}" && git push -u origin main`,
        ];

        for (const command of commands) {
          const { sandboxId: _sandboxId } = await vibekit.executeCommand(
            command,
            {
              callbacks: {
                onUpdate(message) {
                  console.log(message);
                },
              },
            }
          );

          sandboxId = _sandboxId;
        }

        await fetchMutation(api.sessions.update, {
          id,
          repository: repository.full_name,
        });

        for await (const command of template.startCommands) {
          await fetchMutation(api.sessions.update, {
            id,
            status: command.status,
            sessionId: sandboxId,
          });

          await vibekit.executeCommand(command.command, {
            background: command.background,
            callbacks: {
              onUpdate(message) {
                console.log(message);
              },
            },
          });
        }

        const host = await vibekit.getHost(3000);

        return {
          sandboxId: sandboxId,
          tunnelUrl: `https://${host}`,
        };
      } else {
        const { sandboxId: _sandboxId } = await vibekit.executeCommand(
          `git clone https://${token}@github.com/${repository}.git .`
        );

        sandboxId = _sandboxId;

        await fetchMutation(api.sessions.update, {
          id,
          status: "INSTALLING_DEPENDENCIES",
        });

        await vibekit.executeCommand("npm i", {
          callbacks: {
            onUpdate(message) {
              console.log(message);
            },
          },
        });

        await fetchMutation(api.sessions.update, {
          id,
          status: "STARTING_DEV_SERVER",
        });

        await vibekit.executeCommand("npm run dev", {
          background: true,
          callbacks: {
            onUpdate(message) {
              console.log(message);
            },
          },
        });

        await fetchMutation(api.sessions.update, {
          id,
          status: "CREATING_TUNNEL",
        });

        const host = await vibekit.getHost(3000);

        return {
          sandboxId: sandboxId,
          tunnelUrl: `https://${host}`,
        };
      }
    });

    await step.sleep("wait-with-ms", 2 * 1000);

    await step.run("update session", async () => {
      await fetchMutation(api.sessions.update, {
        id,
        status: "RUNNING",
        tunnelUrl: data.tunnelUrl,
      });
    });

    if (message) {
      await step.run("run agent", async () => {
        await runAgentAction({
          sessionId: data.sandboxId,
          id,
          message,
          template,
          repository,
          token,
        });
      });
    }

    return data;
  }
);
