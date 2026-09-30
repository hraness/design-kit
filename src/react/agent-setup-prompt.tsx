"use client";

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";

import type { ProviderMarkDescriptor } from "../provider-marks.js";
import { agentSetupClassName as cx } from "./agent-setup-prompt.stylex.js";
import { ProviderMark } from "./provider-mark.js";
import { SyntaxCode } from "./syntax-code.js";

export interface AgentSetupTarget {
  readonly id: string;
  readonly label: string;
  readonly mark: ProviderMarkDescriptor | string;
  /** The complete destination, including any caller-authored prompt prefill. */
  readonly href: string;
  readonly mode?: "prefill" | "copy-and-open";
}

export interface AgentSetupPromptProps {
  readonly prompt: string;
  readonly label?: string;
  readonly targets?: readonly AgentSetupTarget[];
  readonly className?: string;
  /** Runs once after a successful copy; callback failures do not change copy feedback. */
  readonly onCopied?: () => void;
}

export interface AgentCommand {
  readonly id: string;
  readonly label: string;
  readonly mark: ProviderMarkDescriptor | string;
  readonly command: string;
  /** A configuration path when the source is file content instead of a shell command. */
  readonly filename?: string;
}

export interface AgentCommandTabsProps {
  readonly commands: readonly AgentCommand[];
  readonly label?: string;
  readonly initial?: string;
  readonly className?: string;
}

type CopyState = "idle" | "copying" | "copied" | "failed";
type CopyResult = Readonly<{ ok: boolean; selected: boolean }>;

function commandSubject(entry: AgentCommand): string {
  return `${entry.label} ${entry.filename === undefined ? "command" : "configuration"}`;
}

function assertText(value: string, name: string): void {
  if (typeof value !== "string" || value.trim() === "") throw new RangeError(`${name} must contain text.`);
}

function assertEntries(entries: readonly { id: string; label: string }[], name: string): void {
  const ids = new Set<string>();
  for (const entry of entries) {
    if (typeof entry.id !== "string" || !/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/u.test(entry.id) || ids.has(entry.id)) throw new RangeError(`${name} ids must be unique and use letters, numbers, underscores, or hyphens.`);
    assertText(entry.label, `${name} label`);
    ids.add(entry.id);
  }
}

function assertHref(href: string): void {
  if (typeof href !== "string" || /\s/u.test(href) || [...href].some((character) => character.charCodeAt(0) < 0x20 || character.charCodeAt(0) === 0x7f)) throw new RangeError("Agent setup destinations must be valid links.");
  try {
    const url = new URL(href, "https://example.invalid");
    if (!["https:", "http:", "codex:"].includes(url.protocol)) throw new Error("Unsupported protocol.");
    if (href === "" || url.username !== "" || url.password !== "") throw new Error("Invalid destination.");
  } catch {
    throw new RangeError("Agent setup destinations must be HTTP, HTTPS, or Codex links without credentials.");
  }
}

/** The source node contains the complete string, even while its preview is clipped. */
async function copyText(text: string, fallback: () => HTMLElement | null): Promise<CopyResult> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard !== undefined) {
      await navigator.clipboard.writeText(text);
      return { ok: true, selected: false };
    }
  } catch {
    // A rendered source remains available when clipboard permission is denied.
  }
  const source = fallback();
  if (source === null) return { ok: false, selected: false };
  const documentValue = source.ownerDocument;
  const focused = documentValue.activeElement as HTMLElement | null;
  let buffer: HTMLTextAreaElement | null = null;
  let copied = false;
  let exactEvent = false;
  const copyExact = (event: ClipboardEvent) => {
    if (documentValue.activeElement !== buffer || event.clipboardData === null) return;
    try {
      event.clipboardData.setData("text/plain", text);
      event.preventDefault();
      exactEvent = event.defaultPrevented;
    } catch { /* A matching textarea value can still use native copying. */ }
  };
  try {
    buffer = documentValue.createElement("textarea");
    buffer.value = text;
    buffer.readOnly = true;
    buffer.tabIndex = -1;
    buffer.setAttribute("data-hraness-copy-buffer", "");
    buffer.style.cssText = "position:fixed;left:0;top:0;width:1px;height:1px;padding:0;border:0;opacity:0;overflow:hidden;resize:none;pointer-events:none";
    documentValue.body.append(buffer);
    buffer.focus({ preventScroll: true });
    buffer.select();
    buffer.setSelectionRange(0, buffer.value.length);
    documentValue.addEventListener("copy", copyExact);
    copied = documentValue.execCommand("copy") === true && (buffer.value === text || exactEvent);
  } catch {
    copied = false;
  } finally {
    documentValue.removeEventListener("copy", copyExact);
    buffer?.remove();
    if (copied && focused?.isConnected === true && typeof focused.focus === "function") {
      try { focused.focus({ preventScroll: true }); } catch { /* Copy success does not depend on focus restoration. */ }
    }
  }
  if (copied) return { ok: true, selected: false };
  let selected = false;
  try {
    const selection = documentValue.defaultView?.getSelection();
    if (selection !== null && selection !== undefined) {
      const range = documentValue.createRange();
      range.selectNodeContents(source);
      selection.removeAllRanges();
      selection.addRange(range);
      source.focus();
      selected = true;
    }
    return { ok: false, selected };
  } catch {
    return { ok: false, selected };
  }
}

function useCopy(text: string, subject: string, fallback: () => HTMLElement | null, onCopied?: () => void) {
  const [state, setState] = useState<CopyState>("idle");
  const [message, setMessage] = useState("");
  const generation = useRef(0);
  const busy = useRef(false);
  const latestText = useRef(text);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  latestText.current = text;

  useEffect(() => {
    generation.current += 1;
    busy.current = false;
    setState("idle");
    setMessage("");
    return () => {
      generation.current += 1;
      busy.current = false;
      if (timer.current !== null) clearTimeout(timer.current);
    };
  }, [text, subject]);

  const copy = useCallback(async () => {
    if (busy.current) return false;
    if (timer.current !== null) clearTimeout(timer.current);
    busy.current = true;
    const request = ++generation.current;
    setState("copying");
    setMessage(`Copying ${subject}.`);
    const result = await copyText(text, () => generation.current === request && latestText.current === text ? fallback() : null);
    if (generation.current !== request || latestText.current !== text) return false;
    busy.current = false;
    setState(result.ok ? "copied" : "failed");
    setMessage(result.ok ? `Copied ${subject}.` : result.selected
      ? `Copy failed. The ${subject} is selected; copy it with your keyboard.`
      : `Copy failed. Select the ${subject} and copy it with your keyboard.`);
    if (result.ok && onCopied !== undefined) {
      try { onCopied(); } catch { /* Copy succeeded independently of the caller's hook. */ }
    }
    timer.current = setTimeout(() => {
      if (generation.current !== request) return;
      setState("idle");
      setMessage("");
    }, 2000);
    return result.ok && generation.current === request && latestText.current === text;
  }, [fallback, onCopied, subject, text]);

  return { state, message, copy };
}

function CopyGlyph({ copied }: Readonly<{ copied: boolean }>) {
  return (
    <svg aria-hidden="true" className={cx(["copyIcon"])} fill="none" focusable="false" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
      {copied ? <path d="M5 12.5l4.5 4.5L19 7.5" /> : <><rect height="12" rx="2" width="12" x="8" y="8" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>}
    </svg>
  );
}

function CopyButton({ copy, overlay = false, state, subject }: Readonly<{ copy: () => Promise<boolean>; overlay?: boolean; state: CopyState; subject: string }>) {
  return (
    <button aria-busy={state === "copying" || undefined} aria-label={`${state === "copied" ? "Copied" : "Copy"} ${subject}`} className={cx(["copy", overlay && "copyOverlay"])} data-copy-state={state} disabled={state === "copying"} onClick={() => { void copy(); }} type="button">
      <CopyGlyph copied={state === "copied"} />
      <span>{state === "copied" ? "Copied" : state === "copying" ? "Copying" : state === "failed" ? "Copy failed" : "Copy"}</span>
    </button>
  );
}

function CopyStatus({ children }: Readonly<{ children: ReactNode }>) {
  return <p aria-atomic="true" aria-live="polite" className={cx(["status"])} role="status">{children}</p>;
}

function closeReservedTab(tab: Window | null): void {
  try { if (tab !== null && !tab.closed) tab.close(); } catch { /* An already closed reservation needs no cleanup. */ }
}

function reserveTargetTab(owner: Window | null): Window | null {
  let tab: Window | null = null;
  try {
    // Reserve during activation; async clipboard work can outlive popup permission.
    tab = owner?.open("about:blank", "_blank") ?? null;
    if (tab !== null) {
      tab.opener = null;
      const policy = tab.document.createElement("meta");
      policy.name = "referrer";
      policy.content = "no-referrer";
      tab.document.head.append(policy);
    }
    return tab;
  } catch {
    closeReservedTab(tab);
    return null;
  }
}

/** A quiet prompt preview with the complete source behind a native disclosure. */
export function AgentSetupPrompt({ prompt, label = "Agent setup", targets = [], className, onCopied }: AgentSetupPromptProps) {
  assertText(prompt, "Agent setup prompt");
  assertText(label, "Agent setup label");
  assertEntries(targets, "Agent setup target");
  for (const target of targets) {
    assertHref(target.href);
    if (target.mode !== undefined && target.mode !== "prefill" && target.mode !== "copy-and-open") throw new RangeError("Unsupported agent setup target mode.");
  }
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  const [handoffMessage, setHandoffMessage] = useState("");
  const details = useRef<HTMLDetailsElement>(null);
  const full = useRef<HTMLPreElement>(null);
  const destinationKey = JSON.stringify(targets.map(({ id: targetId, href, mode }) => [targetId, href, mode ?? "prefill"]));
  const latestHandoff = useRef({ prompt, destinationKey });
  latestHandoff.current = { prompt, destinationKey };
  const pendingHandoff = useRef<Readonly<{ tab: Window | null }> | null>(null);
  const fallback = useCallback(() => {
    if (details.current !== null) details.current.open = true;
    setExpanded(true);
    return full.current;
  }, []);
  const { state, message, copy } = useCopy(prompt, "setup prompt", fallback, onCopied);
  const copyPrompt = useCallback(() => {
    setHandoffMessage("");
    return copy();
  }, [copy]);

  useEffect(() => {
    setHandoffMessage("");
    return () => {
      const pending = pendingHandoff.current;
      pendingHandoff.current = null;
      closeReservedTab(pending?.tab ?? null);
    };
  }, [destinationKey, prompt]);

  const copyAndOpen = (event: MouseEvent<HTMLAnchorElement>, target: AgentSetupTarget) => {
    if (event.type === "auxclick" && event.button !== 1) return;
    event.preventDefault();
    if (pendingHandoff.current !== null || state === "copying") return;
    const href = event.currentTarget.href;
    // Begin clipboard work before a new foreground tab can blur this document.
    const copying = copyPrompt();
    const request = { tab: reserveTargetTab(event.currentTarget.ownerDocument.defaultView) };
    pendingHandoff.current = request;
    void (async () => {
      const copied = await copying;
      if (pendingHandoff.current !== request || latestHandoff.current.prompt !== prompt || latestHandoff.current.destinationKey !== destinationKey) {
        closeReservedTab(request.tab);
        return;
      }
      pendingHandoff.current = null;
      if (!copied) {
        closeReservedTab(request.tab);
        return;
      }
      if (request.tab !== null && !request.tab.closed) {
        try {
          request.tab.location.replace(href);
          return;
        } catch { closeReservedTab(request.tab); }
      }
      setHandoffMessage(`Copied setup prompt. Open ${target.label} in a new tab.`);
    })();
  };

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(forced-colors: active)");
    const apply = () => {
      if (query.matches) {
        if (details.current !== null) details.current.open = true;
        setExpanded(true);
      }
    };
    apply();
    query.addEventListener("change", apply);
    return () => { query.removeEventListener("change", apply); };
  }, []);

  return (
    <section aria-label={label} className={cx(["root"], className)} data-hraness-agent-setup-prompt="">
      <div className={cx(["layout", targets.length > 0 && "withTargets"])}>
        <div className={cx(["frame"])} data-copy-state={state}>
          <div className={cx(["preview"])} hidden={expanded}>
            <pre aria-label={`${label} preview`} className={cx(["pre", "previewText"])}>{prompt}</pre>
          </div>
          <details className={cx(["details"])} onToggle={(event) => {
            setExpanded(event.currentTarget.open);
          }} open={expanded} ref={details}>
            <summary className={cx(["summary"])}>{expanded ? "Hide full prompt" : "Show full prompt"}</summary>
            <pre aria-label={`${label} full prompt`} className={cx(["pre", "full"])} ref={full} tabIndex={0}>{prompt}</pre>
          </details>
          <CopyButton copy={copyPrompt} overlay state={state} subject="setup prompt" />
        </div>
        {targets.length === 0 ? null : (
          <aside aria-labelledby={`${id}-targets`} className={cx(["targets"])}>
            <p className={cx(["targetsLabel"])} id={`${id}-targets`}>Open in</p>
            <ul className={cx(["targetList"])}>
              {targets.map((target) => (
                <li key={target.id}>
                  <a aria-busy={target.mode === "copy-and-open" && state === "copying" || undefined} aria-disabled={target.mode === "copy-and-open" && state === "copying" || undefined} aria-label={target.mode === "copy-and-open" ? `Copy prompt and open ${target.label}` : undefined} className={cx(["target"])} data-agent-target={target.id} data-agent-target-mode={target.mode ?? "prefill"} href={target.href} onAuxClick={target.mode === "copy-and-open" ? (event) => { copyAndOpen(event, target); } : undefined} onClick={target.mode === "copy-and-open" ? (event) => { copyAndOpen(event, target); } : undefined} rel="noopener noreferrer" target="_blank">
                    <ProviderMark mark={target.mark} size={20} tone="inherit" />
                    <span>{target.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
      <CopyStatus>{handoffMessage || message}</CopyStatus>
    </section>
  );
}

/** Provider-labelled command tabs with one exact-string copy action per panel. */
export function AgentCommandTabs({ commands, label = "Agent commands", initial, className }: AgentCommandTabsProps) {
  if (commands.length === 0) throw new RangeError("AgentCommandTabs needs at least one command.");
  assertText(label, "Agent command tabs label");
  assertEntries(commands, "Agent command");
  for (const entry of commands) {
    assertText(entry.command, "Agent command");
    if (entry.filename !== undefined) assertText(entry.filename, "Agent configuration filename");
  }
  if (initial !== undefined && !commands.some((entry) => entry.id === initial)) throw new RangeError("Initial agent command must be listed.");
  const first = commands[0];
  if (first === undefined) throw new RangeError("AgentCommandTabs needs at least one command.");
  const id = useId();
  const [selected, setSelected] = useState(initial ?? first.id);
  const current = commands.find((entry) => entry.id === selected) ?? first;
  const tabs = useRef(new Map<string, HTMLButtonElement>());
  const sources = useRef(new Map<string, HTMLPreElement>());
  const fallback = useCallback(() => sources.current.get(current.id) ?? null, [current.id]);
  const { state, message, copy } = useCopy(current.command, commandSubject(current), fallback);

  const onTabKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const position = commands.findIndex((entry) => entry.id === current.id);
    let next: number;
    if (event.key === "ArrowRight") next = (position + 1) % commands.length;
    else if (event.key === "ArrowLeft") next = (position - 1 + commands.length) % commands.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = commands.length - 1;
    else return;
    event.preventDefault();
    const target = commands[next];
    if (target === undefined) return;
    setSelected(target.id);
    tabs.current.get(target.id)?.focus();
  };

  return (
    <section aria-label={label} className={cx(["root", "commandRoot"], className)} data-hraness-agent-command-tabs="" data-selected-agent={current.id}>
      <div aria-label={label} className={cx(["tablist"])} onKeyDown={onTabKey} role="tablist">
        {commands.map((entry) => (
          <button aria-controls={`${id}-panel-${entry.id}`} aria-selected={entry.id === current.id} className={cx(["tab", entry.id === current.id && "tabSelected"])} data-agent={entry.id} id={`${id}-tab-${entry.id}`} key={entry.id} onClick={() => { setSelected(entry.id); }} ref={(node) => { if (node === null) tabs.current.delete(entry.id); else tabs.current.set(entry.id, node); }} role="tab" tabIndex={entry.id === current.id ? 0 : -1} type="button">
            <ProviderMark mark={entry.mark} size={20} tone="inherit" />
            <span>{entry.label}</span>
          </button>
        ))}
      </div>
      {commands.map((entry) => (
        <div aria-labelledby={`${id}-tab-${entry.id}`} className={cx(["panel"])} data-agent={entry.id} hidden={entry.id !== current.id} id={`${id}-panel-${entry.id}`} key={entry.id} role="tabpanel">
          <div className={cx(["frame"])}>
            <div className={cx(["commandBar"])}>
              <div className={cx(["commandLabels"])}>
                <p className={cx(["panelLabel"])}><ProviderMark mark={entry.mark} size={20} tone="inherit" />{entry.label}</p>
                {entry.filename === undefined ? null : <span className={cx(["filename"])}>{entry.filename}</span>}
              </div>
              <CopyButton copy={copy} state={entry.id === current.id ? state : "idle"} subject={commandSubject(entry)} />
            </div>
            <pre aria-label={commandSubject(entry)} className={cx(["pre", "commandText"])} ref={(node) => { if (node === null) sources.current.delete(entry.id); else sources.current.set(entry.id, node); }} tabIndex={0}><SyntaxCode className={cx(["code"])} code={entry.command} styles="classes" /></pre>
          </div>
        </div>
      ))}
      <CopyStatus>{message}</CopyStatus>
    </section>
  );
}
