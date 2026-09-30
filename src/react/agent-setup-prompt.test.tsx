import { expect, test } from "bun:test";
import { parseHTML } from "linkedom";
import { renderToStaticMarkup } from "react-dom/server";

import { AgentCommandTabs, AgentSetupPrompt, type AgentCommand } from "./agent-setup-prompt.js";

const prompt = "Read the instructions first.\n\nInstall the tool and inspect ./notes.\nKeep the final newline.\n";
const commands: readonly AgentCommand[] = [
  { id: "claude", label: "Claude Code", mark: "claudecode", command: "claude mcp add sample -- sample serve" },
  { id: "codex", label: "Codex", mark: "codex", command: "codex mcp add sample -- sample serve" },
];
const documentOf = (html: string) => parseHTML(`<!doctype html><html><body>${html}</body></html>`).document;

test("the prompt keeps the complete source in its preview and native disclosure", () => {
  const document = documentOf(renderToStaticMarkup(<AgentSetupPrompt className="caller" label="Set up Sample" prompt={prompt} />));
  const root = document.querySelector("[data-hraness-agent-setup-prompt]");
  expect(root?.getAttribute("aria-label")).toBe("Set up Sample");
  expect(root?.getAttribute("class")).toEndWith("caller");
  expect([...document.querySelectorAll("pre")].map((pre) => pre.textContent)).toEqual([prompt, prompt]);
  expect(document.querySelector("details")?.hasAttribute("open")).toBe(false);
  expect(document.querySelector("summary")?.textContent).toBe("Show full prompt");
  expect(document.querySelector("button")?.getAttribute("aria-label")).toBe("Copy setup prompt");
  expect(document.querySelector("textarea")).toBeNull();
  expect(document.querySelector("aside")).toBeNull();
  expect(document.querySelector('[role="status"]')?.textContent).toBe("");
});

test("Open in shows only each target's decorative icon and name and preserves its supplied link", () => {
  const href = "https://claude.ai/new?q=use%20the%20exact%20prompt";
  const document = documentOf(renderToStaticMarkup(<AgentSetupPrompt prompt={prompt} targets={[
    { id: "claude", label: "Claude", mark: "claudecode", href, mode: "prefill" },
    { id: "chatgpt", label: "ChatGPT", mark: "codex", href: "https://chatgpt.com/", mode: "copy-and-open" },
  ]} />));
  expect(document.querySelector("aside > p")?.textContent).toBe("Open in");
  const targets = [...document.querySelectorAll("aside a")];
  expect(targets.map((target) => target.querySelector(":scope > span:last-child")?.textContent)).toEqual(["Claude", "ChatGPT"]);
  expect(targets[0]?.getAttribute("href")).toBe(href);
  expect(targets[1]?.getAttribute("data-agent-target-mode")).toBe("copy-and-open");
  expect(targets[1]?.getAttribute("aria-label")).toBe("Copy prompt and open ChatGPT");
  for (const target of targets) {
    expect(target.getAttribute("target")).toBe("_blank");
    expect(target.getAttribute("rel")).toBe("noopener noreferrer");
    expect(target.querySelectorAll("p,small")).toHaveLength(0);
    expect(target.querySelector("[aria-hidden='true']")).not.toBeNull();
  }
});

test("command tabs have complete native tab semantics and retain every exact command for no-script use", () => {
  const document = documentOf(renderToStaticMarkup(<AgentCommandTabs commands={commands} initial="codex" label="Add to your agent" />));
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const panels = [...document.querySelectorAll('[role="tabpanel"]')];
  expect(document.querySelector('[role="tablist"]')?.getAttribute("aria-label")).toBe("Add to your agent");
  expect(tabs.map((tab) => tab.getAttribute("aria-selected"))).toEqual(["false", "true"]);
  expect(tabs.map((tab) => tab.getAttribute("tabindex"))).toEqual(["-1", "0"]);
  expect(panels.map((panel) => panel.hasAttribute("hidden"))).toEqual([true, false]);
  for (const [index, tab] of tabs.entries()) {
    const panel = panels[index];
    if (panel === undefined) throw new Error("Each agent tab must have a panel.");
    expect(tab.tagName).toBe("BUTTON");
    expect(tab.getAttribute("type")).toBe("button");
    expect(tab.getAttribute("aria-controls")).toBe(panel.id);
    expect(panel.getAttribute("aria-labelledby")).toBe(tab.id);
    expect(tab.querySelector(".hraness-provider-mark__inherit")).not.toBeNull();
  }
  expect([...document.querySelectorAll("pre > code")].map((code) => code.textContent)).toEqual(commands.map((entry) => entry.command));
  for (const code of document.querySelectorAll("pre > code")) {
    expect(code.classList.contains("syntax-code")).toBe(true);
    expect(code.hasAttribute("data-language")).toBe(true);
  }
  expect(document.querySelectorAll("script,textarea")).toHaveLength(0);
});

test("configuration tabs name their file and preserve the exact JSON with shared highlighting", () => {
  const command = '{\n  "mcpServers": { "sample": { "command": "sample", "args": ["serve"] } }\n}\n';
  const document = documentOf(renderToStaticMarkup(<AgentCommandTabs commands={[{ id: "cursor", label: "Cursor", mark: "cursor", filename: "~/.cursor/mcp.json", command }]} />));
  expect(document.querySelector(".hraness-agent-setup__filename")?.textContent).toBe("~/.cursor/mcp.json");
  expect(document.querySelector("pre > code")?.textContent).toBe(command);
  expect(document.querySelector("pre > code")?.getAttribute("data-language")).toBe("json");
  expect(document.querySelector("button[aria-label]")?.getAttribute("aria-label")).toBe("Copy Cursor configuration");
});

test("a caller-provided native Codex prefill link is preserved exactly", () => {
  const href = "codex://new?prompt=configure%20the%20project";
  const document = documentOf(renderToStaticMarkup(<AgentSetupPrompt prompt={prompt} targets={[{ id: "codex", label: "Codex", mark: "codex", href }]} />));
  expect(document.querySelector("a")?.getAttribute("href")).toBe(href);
});

test("invalid sources, duplicate ids, unknown initial commands, and unsafe destinations fail before rendering", () => {
  expect(() => renderToStaticMarkup(<AgentSetupPrompt prompt=" " />)).toThrow(RangeError);
  for (const href of ["javascript:alert(1)", "data:text/html,hello", "https://name:password@example.test/", "https://example.test/ bad", ""]) {
    expect(() => renderToStaticMarkup(<AgentSetupPrompt prompt={prompt} targets={[{ id: "agent", label: "Agent", mark: "codex", href }]} />)).toThrow(RangeError);
  }
  expect(() => renderToStaticMarkup(<AgentCommandTabs commands={[]} />)).toThrow(RangeError);
  expect(() => renderToStaticMarkup(<AgentCommandTabs commands={commands} initial="missing" />)).toThrow(RangeError);
  expect(() => renderToStaticMarkup(<AgentCommandTabs commands={[commands[0] as AgentCommand, commands[0] as AgentCommand]} />)).toThrow(RangeError);
});
