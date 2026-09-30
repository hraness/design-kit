import { providerMarkFallback } from "../src/provider-marks.js";
import type * as AgentSetup from "../src/react/agent-setup-prompt.js";
import type * as ProviderMarks from "../src/react/provider-mark.js";

export type AgentSetupFixtureApi = Pick<typeof AgentSetup, "AgentSetupPrompt" | "AgentCommandTabs"> & Pick<typeof ProviderMarks, "ProviderMark">;

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

const solidMarks = [
  { id: "nvidia", label: "NVIDIA", mark: "nvidia" },
  { id: "claude", label: "Claude Code", mark: "claudecode" },
  { id: "gemini", label: "Gemini", mark: "gemini" },
  { id: "neutral", label: "Neutral agent", mark: { ...providerMarkFallback("Neutral agent"), accent: "#777777" } },
] as const;

export function AgentSetupFixture({ api, prompt = agentSetupFixturePrompt }: Readonly<{ api: AgentSetupFixtureApi; prompt?: string }>) {
  const { AgentSetupPrompt, AgentCommandTabs, ProviderMark } = api;
  return (
    <main>
      <div id="prompt"><AgentSetupPrompt label="Set up Sample" prompt={prompt} targets={agentSetupFixtureTargets} /></div>
      <div id="commands"><AgentCommandTabs commands={agentSetupFixtureCommands} /></div>
      <div className="fixture-narrow" id="narrow"><AgentSetupPrompt prompt={prompt} targets={agentSetupFixtureTargets} /></div>
      <div className="fixture-accent" id="accent"><AgentCommandTabs commands={agentSetupFixtureCommands} label="Commands in an accent section" /></div>
      <div id="mark-inheritance"><AgentCommandTabs commands={markInheritanceCommands} label="Inherited provider ink" /></div>
      <div className="fixture-solid" id="solid-marks" role="group" aria-label="Solid provider marks">
        {solidMarks.map(({ id, label, mark }) => <span data-solid-mark={id} key={id}><ProviderMark label={label} mark={mark} size={48} tone="solid" /></span>)}
      </div>
    </main>
  );
}
