# Agent setup

`AgentSetupPrompt` and `AgentCommandTabs` are client compositions from
`@hraness/design-kit/react`. Load `components.css` or `styles.css` for their
compiled presentation. Product repositories own the prompt, commands,
configuration paths, supported machines, and install versions.

```tsx
import { agentSetupTargets } from "@hraness/design-kit";
import { AgentCommandTabs, AgentSetupPrompt } from "@hraness/design-kit/react";

<AgentSetupPrompt
  label="Set up Relay with your agent"
  prompt={setupPrompt}
  targets={agentSetupTargets(setupPrompt)}
  targetsPlacement="below"
/>
<AgentCommandTabs commands={[
  { id: "terminal", label: "Codex", mark: "codex", command: "relay init" },
  { id: "config", label: "Cursor", mark: "cursor", command: configJson, filename: ".cursor/mcp.json" },
]} />
```

The prompt preview clips long text with a bottom fade. Copy sits at the
bottom right and copies the complete source. A native disclosure reveals
the complete prompt without JavaScript. Provider actions move beside the
preview when the containing block is wide enough; narrower blocks stack.
Set `targetsPlacement="below"` to keep actions under the prompt in a compact
grid with up to three columns. Prompt, command-tab, and platform-install copy
buttons share the same 44-pixel minimum height and visual treatment.
The optional `onCopied` callback runs after a successful copy. Its errors
cannot change clipboard feedback.

Command tabs use provider marks, arrow-key navigation, and a copy action at
the top right of each panel. `filename` identifies file content rather than
a shell command. All panels remain available without JavaScript. Copy
failures reveal and select the full source for keyboard copying.

## Destinations

`agentSetupTargets(prompt)` is framework-neutral. Its results contain `id`,
`label`, `mark`, `href`, `mode`, and `host`. Filter on `host === "local"`
when a product needs the user's local computer. A cloud computer's durable
storage still needs a product-specific workflow; a temporary coding session
does not guarantee permanent memory. Codex's desktop deep link is local;
its web entry fallback is marked cloud. Targets do not submit prompts.

Public documentation checked on September 30, 2026:

| Agent | Action | Source |
| --- | --- | --- |
| OpenAI Dot | Copy and open ChatGPT's entry page. A Dot-specific composer URL has not been verified. | [ChatGPT](https://chatgpt.com/) |
| Grok Bot | Copy and open its dashboard. Uses a persistent cloud computer and a Cursor account. | [Grok Bot](https://cursor.com/docs/grok-bot), [Getting started](https://cursor.com/docs/grok-bot/get-started) |
| Muse | Copy and open the official launch entry. Uses an isolated Linux computer. | [Muse](https://ai.meta.com/muse/) |
| Cursor | Fill the prompt composer through `https://cursor.com/link/prompt?text=…`. | [Deep links](https://cursor.com/docs/reference/deeplinks) |
| Codex | Fill a local desktop composer through `codex://new?prompt=…`. | [Desktop deep links](https://learn.chatgpt.com/docs/reference/commands#deep-links) |
| Devin | Copy and open the app. The product owns session and repository persistence requirements. | [Devin documentation](https://docs.devin.ai/), [App](https://app.devin.ai/) |

Composer links carry the complete encoded prompt. If a URL exceeds 10,000
characters, the helper returns a normal entry link with `copy-and-open`.
This avoids truncating a prompt at Cursor's documented URL limit.

For products that keep prompts out of URLs, call
`agentSetupTargets(prompt, { prefill: false })`. Every destination then uses
its documented entry page with `copy-and-open`, including Cursor and Codex.

Callers may supply other valid HTTP, HTTPS, or Codex destinations and
provider identities directly. Use `mode: "copy-and-open"` for products
without a documented prompt deep link. Enhanced handoffs open the provider
after the complete current prompt has copied successfully. A failed copy
keeps the full prompt visible and stays on the setup page. Destination links
retain their native browser and no-JavaScript behavior.

## Product requirements

Choose the agent list by installation support and the user's machine.
Personal agents may have Linux computers but cannot configure a Mac-only
product on the user's Mac. Skills can use temporary files while doing work;
only products that retain memory or local state require durable storage.
Check each product's actual installer and skill requirements.

Stack Overflow's [April 2026 pulse survey](https://stackoverflow.blog/2026/05/27/agents-on-a-leash-agentic-ai-remains-mostly-monitored-at-work/)
surveyed 1,100 developers and working professionals. Its code-assistant
usage figures were GitHub Copilot 61%, Claude Code 51%, Codex 20%, and
Cursor 20%. These overlapping respondent shares support covering those
clients; they are not exclusive market shares or a product quality ranking.
Personal-agent destinations above follow the caller's audience and machine
requirements rather than that survey's order.

Use command tabs for concrete supported commands or configurations. Check
the current client documentation, including [Gemini CLI](https://geminicli.com/docs/tools/mcp-server/)
and [VS Code MCP](https://code.visualstudio.com/docs/agent-customization/mcp-servers).
Do not invent market-share rankings or handoff URLs from general chat URLs.
