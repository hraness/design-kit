import type { ProviderMarkId } from "./provider-marks.js";

export type ComputerAgentId = "dot" | "grok-bot" | "muse" | "cursor" | "codex-app" | "devin";

/** A documented product entry or a link that fills a composer without sending. */
export interface AgentSetupDestination {
  readonly id: ComputerAgentId;
  readonly label: string;
  readonly mark: ProviderMarkId;
  readonly href: string;
  readonly mode: "prefill" | "copy-and-open";
  /** Filter cloud computers out when a product needs the user's local machine. */
  readonly host: "local" | "cloud";
}

/** Cursor's documented maximum; longer prompts use copy and an ordinary entry link. */
export const MAX_AGENT_SETUP_URL = 10_000;

/**
 * Product prompts stay with their callers. These destinations are shared by
 * install pages; capability and URL sources are recorded in AGENT_SETUP.md.
 * None of these actions sends a prompt or starts work automatically.
 */
export function agentSetupTargets(prompt: string): readonly AgentSetupDestination[] {
  if (typeof prompt !== "string" || prompt.trim() === "") throw new RangeError("Agent setup prompt must contain text.");
  const encoded = encodeURIComponent(prompt);
  const prefill = (href: string, entry: string) => href.length <= MAX_AGENT_SETUP_URL
    ? { href, mode: "prefill" as const }
    : { href: entry, mode: "copy-and-open" as const };
  return [
    { id: "dot", label: "OpenAI Dot", mark: "openai", href: "https://chatgpt.com/", mode: "copy-and-open", host: "cloud" },
    { id: "grok-bot", label: "Grok Bot", mark: "xai", href: "https://cursor.com/dashboard/bot", mode: "copy-and-open", host: "cloud" },
    { id: "muse", label: "Muse", mark: "meta", href: "https://applink.muse.ai/", mode: "copy-and-open", host: "cloud" },
    { id: "cursor", label: "Cursor", mark: "cursor", host: "local", ...prefill(`https://cursor.com/link/prompt?text=${encoded}`, "https://cursor.com/") },
    { id: "codex-app", label: "Codex", mark: "codex", host: "local", ...prefill(`codex://new?prompt=${encoded}`, "https://chatgpt.com/codex") },
    { id: "devin", label: "Devin", mark: "devin", href: "https://app.devin.ai/", mode: "copy-and-open", host: "cloud" },
  ];
}
