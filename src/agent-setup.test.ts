import { describe, expect, test } from "bun:test";
import fc from "fast-check";

import { agentSetupTargets, MAX_AGENT_SETUP_URL } from "./agent-setup.js";
import { providerMark } from "./provider-marks.js";

describe("computer-agent setup destinations", () => {
  test("only documented composer links carry a prompt and none submits it", () => {
    const prompt = "Set up a vault: a & b + c #d. 日本語 🚀\nKeep the final line.";
    const targets = agentSetupTargets(prompt);
    expect(targets.map(({ id }) => id)).toEqual(["dot", "grok-bot", "muse", "cursor", "codex-app", "devin"]);
    expect(new Set(targets.map(({ id }) => id)).size).toBe(targets.length);
    for (const target of targets) {
      expect(providerMark(target.mark)).toBeDefined();
      const url = new URL(target.href);
      expect(url.username).toBe("");
      expect(url.password).toBe("");
      if (target.mode === "prefill") {
        expect(url.searchParams.get(target.id === "cursor" ? "text" : "prompt")).toBe(prompt);
        expect([...url.searchParams.keys()]).toHaveLength(1);
      } else {
        expect(url.protocol).toBe("https:");
        expect(url.search).toBe("");
      }
    }
    expect(targets.filter(({ host }) => host === "local").map(({ id }) => id)).toEqual(["cursor", "codex-app"]);
    expect(targets.find(({ id }) => id === "grok-bot")?.href).toBe("https://cursor.com/dashboard/bot");
    expect(targets.find(({ id }) => id === "muse")?.href).toBe("https://applink.muse.ai/");
  });

  test("arbitrary valid text round-trips through composer URLs", () => {
    fc.assert(fc.property(fc.string({ minLength: 1, maxLength: 400 }).filter((prompt) => prompt.trim() !== ""), (prompt) => {
      for (const target of agentSetupTargets(prompt).filter(({ mode }) => mode === "prefill")) {
        expect(new URL(target.href).searchParams.get(target.id === "cursor" ? "text" : "prompt")).toBe(prompt);
      }
    }));
  });

  test("oversized encoded prompts retain full source and use copy-and-open entries", () => {
    const targets = agentSetupTargets("🚀".repeat(MAX_AGENT_SETUP_URL));
    expect(targets.every(({ mode, href }) => mode === "copy-and-open" && href.length <= MAX_AGENT_SETUP_URL)).toBe(true);
    expect(targets.find(({ id }) => id === "cursor")?.href).toBe("https://cursor.com/");
    expect(targets.find(({ id }) => id === "codex-app")?.href).toBe("https://chatgpt.com/codex");
    expect(agentSetupTargets("short").filter(({ mode }) => mode === "prefill")).toHaveLength(2);
  });

  test("rejects empty prompts rather than creating unusable handoffs", () => {
    expect(() => agentSetupTargets("")).toThrow(RangeError);
    expect(() => agentSetupTargets(" \n ")).toThrow(RangeError);
  });
});
