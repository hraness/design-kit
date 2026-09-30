import type * as AgentSetup from "../src/react/agent-setup-prompt.js";

export const agentSetupFixturePrompt = [
  "Install Sample in this workspace.",
  "Read the project instructions before making changes.",
  "Configure the agent to use sample serve.",
  "Keep the existing files and settings.",
  ...Array.from({ length: 16 }, (_, index) => `Step ${String(index + 1)}: inspect the next configuration entry.`),
  "Show me the configured command and its output.",
  "",
].join("\n");

export const agentSetupFixtureTargets: readonly AgentSetup.AgentSetupTarget[] = [
  { id: "claude", label: "Claude", mark: "claudecode", href: `https://agent.example/claude?prompt=${encodeURIComponent(agentSetupFixturePrompt)}`, mode: "prefill" },
  { id: "chatgpt", label: "ChatGPT", mark: "openai", href: "https://agent.example/chatgpt", mode: "copy-and-open" },
  { id: "gemini", label: "Gemini", mark: "gemini", href: "https://agent.example/gemini", mode: "copy-and-open" },
];

export const agentSetupFixtureCommands: readonly AgentSetup.AgentCommand[] = [
  { id: "claude", label: "Claude Code", mark: "claudecode", command: "claude mcp add sample -- sample serve" },
  { id: "codex", label: "Codex", mark: "codex", command: "codex mcp add sample -- sample serve" },
  { id: "cursor", label: "Cursor", mark: "cursor", filename: "~/.cursor/mcp.json", command: '{\n  "mcpServers": {\n    "sample": { "command": "sample", "args": ["serve"] }\n  }\n}\n' },
  { id: "gemini", label: "Gemini CLI", mark: "gemini", command: "gemini mcp add sample -- sample serve" },
  { id: "githubcopilot", label: "GitHub Copilot", mark: "githubcopilot", filename: "~/.copilot/mcp-config.json", command: '{\n  "mcpServers": {\n    "sample": { "command": "sample", "args": ["serve"] }\n  }\n}\n' },
];

const markInheritanceCommands: readonly AgentSetup.AgentCommand[] = [
  { id: "openai", label: "OpenAI", mark: "openai", command: "sample serve" },
  { id: "other", label: "Other agent", mark: "unknown-agent", command: "sample serve" },
];

export function AgentSetupFixture({ api }: Readonly<{ api: Pick<typeof AgentSetup, "AgentSetupPrompt" | "AgentCommandTabs"> }>) {
  const { AgentSetupPrompt, AgentCommandTabs } = api;
  return (
    <main>
      <div id="prompt"><AgentSetupPrompt label="Set up Sample" prompt={agentSetupFixturePrompt} targets={agentSetupFixtureTargets} /></div>
      <div id="commands"><AgentCommandTabs commands={agentSetupFixtureCommands} /></div>
      <div className="fixture-narrow" id="narrow"><AgentSetupPrompt prompt={agentSetupFixturePrompt} targets={agentSetupFixtureTargets} /></div>
      <div className="fixture-accent" id="accent"><AgentCommandTabs commands={agentSetupFixtureCommands} label="Commands in an accent section" /></div>
      <div id="mark-inheritance"><AgentCommandTabs commands={markInheritanceCommands} label="Inherited provider ink" /></div>
    </main>
  );
}
