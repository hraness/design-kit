import type { CSSProperties, ReactNode } from "react";

import {
  MockupGlyph,
  MockupRoot,
  SampleText,
  WindowLights,
  type MockupOptOut,
  type MockupRootProps,
} from "./core.js";

/** Hosts a mockup may show in an address bar: reserved example names only (RFC 2606 and RFC 6761). */
export const MOCKUP_EXAMPLE_HOST = /(^|\.)(example(\.(com|net|org))?|test|invalid|localhost)$/u;

/** Splits a mockup address into host and path, and rejects hosts that could belong to someone. */
export function mockupAddress(url: string): Readonly<{ host: string; path: string }> {
  const trimmed = url.trim().replace(/^[a-z]+:\/\//iu, "");
  const slash = trimmed.indexOf("/");
  const host = (slash < 0 ? trimmed : trimmed.slice(0, slash)).toLowerCase();
  const path = slash < 0 ? "" : trimmed.slice(slash);
  if (!MOCKUP_EXAMPLE_HOST.test(host)) {
    throw new RangeError(`Mockup address ${JSON.stringify(url)} must use a reserved example host such as example.com or site.example.`);
  }
  return { host, path: path === "/" ? "" : path };
}

function pageStyle(height: number | undefined): CSSProperties | undefined {
  if (height === undefined) return undefined;
  if (!(height > 0)) throw new RangeError("A mockup page height must be positive.");
  return { "--hkm-page-height": `${height}px` } as CSSProperties;
}

function optOutProps(optOut: MockupOptOut | undefined): { optOut?: MockupOptOut } {
  return optOut === undefined ? {} : { optOut };
}

/**
 * A neutral browser window: window buttons, history controls, an address
 * field on a reserved example host, an optional toolbar slot, and a page area.
 * With `height`, the page area is a window onto a longer page; `fade` (on by
 * default then) says it keeps going.
 */
export function BrowserFrame({
  children,
  fade,
  height,
  toolbar,
  url,
  ...root
}: MockupRootProps & Readonly<{ url: string; toolbar?: ReactNode; height?: number; fade?: boolean; children: ReactNode }>) {
  return (
    <MockupRoot {...root} kind="browser">
      <BrowserWindow {...(fade === undefined ? {} : { fade })} {...(height === undefined ? {} : { height })} toolbar={toolbar} url={url}>
        {children}
      </BrowserWindow>
    </MockupRoot>
  );
}

/** The browser chrome without a root, for surfaces that compose it inside their own root. */
export function BrowserWindow({
  children,
  fade,
  height,
  toolbar,
  url,
}: Readonly<{ url: string; toolbar?: ReactNode; height?: number; fade?: boolean; children: ReactNode }>) {
  const { host, path } = mockupAddress(url);
  const fades = fade ?? height !== undefined;
  return (
    <div className="hkm-window">
      <div aria-hidden="true" className="hkm-browser-bar">
        <WindowLights />
        <span className="hkm-browser-nav">
          <MockupGlyph name="back" size={16} />
          <MockupGlyph name="forward" size={16} />
          <MockupGlyph name="reload" size={15} />
        </span>
        <span className="hkm-address">
          <MockupGlyph name="lock" size={12} />
          <span className="hkm-address-host">{host}</span>
          {path === "" ? null : <span className="hkm-address-path">{path}</span>}
        </span>
        <span className="hkm-browser-tools">{toolbar}</span>
      </div>
      <div className="hkm-page" data-hkm-fade={fades ? "" : undefined} style={pageStyle(height)}>
        {children}
      </div>
    </div>
  );
}

/** One line in a terminal mockup. */
export type TerminalLine = Readonly<{
  kind: "input" | "output" | "comment";
  text: string;
  tone?: "ok" | "warn" | "error" | "muted";
  /** A beat id a film or step-through can key on; rendered as `data-hkm-beat`. */
  beat?: string;
}>;

const TERMINAL_KINDS = new Set(["input", "output", "comment"]);

/**
 * A terminal window with a prompt, typed commands, output, and comments.
 * Commands and output are sample text; keep them to commands the product ships.
 */
export function TerminalFrame({
  density = "standard",
  fade,
  height,
  lines,
  prompt = "$",
  title = "Terminal",
  ...root
}: MockupRootProps & Readonly<{ title?: string; prompt?: string; lines: readonly TerminalLine[]; height?: number; fade?: boolean; density?: "standard" | "presentation" }>) {
  if (density !== "standard" && density !== "presentation") throw new RangeError("Terminal density must be standard or presentation.");
  for (const line of lines) {
    if (!TERMINAL_KINDS.has(line.kind)) throw new TypeError(`Unknown terminal line kind ${JSON.stringify(line.kind)}.`);
  }
  const fades = fade ?? height !== undefined;
  return (
    <MockupRoot {...root} kind="terminal">
      <div className="hkm-window">
        <div aria-hidden="true" className="hkm-title-bar">
          <WindowLights />
          <span className="hkm-title">{title}</span>
          <span />
        </div>
        <div className="hkm-page hkm-terminal-body" data-hkm-density={density === "presentation" ? density : undefined} data-hkm-fade={fades ? "" : undefined} style={pageStyle(height)}>
          <div className="hkm-terminal-lines">
            {lines.map((line, index) => (
              <div className="hkm-terminal-line" data-hkm-beat={line.beat} data-hkm-line={line.kind} data-hkm-tone={line.tone} key={index}>
                {line.kind === "input" ? <span className="hkm-terminal-prompt">{prompt}</span> : null}
                {line.kind === "comment" ? <span className="hkm-terminal-prompt">#</span> : null}
                <SampleText {...optOutProps(root.optOut)}>{line.text}</SampleText>
              </div>
            ))}
            <div aria-hidden="true" className="hkm-terminal-line" data-hkm-line="input">
              <span className="hkm-terminal-prompt">{prompt}</span>
              <span className="hkm-caret" />
            </div>
          </div>
        </div>
      </div>
    </MockupRoot>
  );
}

/**
 * A desktop app window: title bar, optional toolbar, optional translucent
 * sidebar, and content.
 */
export function MacWindow({
  children,
  sidebar,
  title,
  toolbar,
  ...root
}: MockupRootProps & Readonly<{ title?: string; sidebar?: ReactNode; toolbar?: ReactNode; children: ReactNode }>) {
  return (
    <MockupRoot {...root} kind="app-window">
      <div className="hkm-window" data-hkm-sidebar={sidebar === undefined ? undefined : ""}>
        {sidebar === undefined ? null : (
          <div className="hkm-app-sidebar">
            <WindowLights />
            <div className="hkm-app-sidebar-body">{sidebar}</div>
          </div>
        )}
        <div className="hkm-app-main">
          <div className="hkm-title-bar hkm-app-bar">
            {sidebar === undefined ? <WindowLights /> : <span />}
            <span className="hkm-title">{title}</span>
            <span className="hkm-app-tools">{toolbar}</span>
          </div>
          <div className="hkm-app-content">{children}</div>
        </div>
      </div>
    </MockupRoot>
  );
}

/** One row in a menu bar popover. */
export type MenuBarItem = Readonly<{ id: string; label: string; detail?: string; tone?: "ok" | "warn" | "error"; selected?: boolean }>;

/**
 * A slice of a desktop menu bar with a status item open. `mark` is the status
 * item's glyph; pass the product's own mark, or leave it for a neutral dot.
 */
export function MenuBarPopover({
  footer,
  items,
  mark,
  title,
  ...root
}: MockupRootProps & Readonly<{ items: readonly MenuBarItem[]; title?: string; mark?: ReactNode; footer?: string }>) {
  const ids = new Set<string>();
  for (const item of items) {
    if (ids.has(item.id)) throw new RangeError(`MenuBarPopover item ids must be unique: ${item.id}`);
    ids.add(item.id);
  }
  return (
    <MockupRoot {...root} kind="menubar">
      <div aria-hidden="true" className="hkm-menubar">
        <span className="hkm-menubar-spacer" />
        <MockupGlyph name="search" size={14} />
        <span className="hkm-menubar-item" data-hkm-open="">{mark ?? <span className="hkm-menubar-dot" />}</span>
        <span className="hkm-menubar-clock">9:41</span>
      </div>
      <div className="hkm-popover">
        {title === undefined ? null : <div className="hkm-popover-title">{title}</div>}
        <ul className="hkm-popover-list">
          {items.map((item) => (
            <li className="hkm-popover-item" data-hkm-selected={item.selected === true ? "" : undefined} data-hkm-tone={item.tone} key={item.id}>
              <span className="hkm-popover-dot" />
              <span className="hkm-popover-text">
                <span className="hkm-popover-label"><SampleText {...optOutProps(root.optOut)}>{item.label}</SampleText></span>
                {item.detail === undefined ? null : <span className="hkm-popover-detail"><SampleText {...optOutProps(root.optOut)}>{item.detail}</SampleText></span>}
              </span>
            </li>
          ))}
        </ul>
        {footer === undefined ? null : <div className="hkm-popover-footer">{footer}</div>}
      </div>
    </MockupRoot>
  );
}

/**
 * A generic modern phone: metal edge, bezel, side buttons, a camera island,
 * status bar, and home indicator. No logos, carrier names, or real numbers.
 * The screen is 390 by 844 points and scales with the root's width. Children
 * sit in a scrollable body that clears the status bar and home indicator.
 */
export function PhoneFrame({
  children,
  screenHeight,
  statusTime,
  width,
  ...root
}: MockupRootProps & Readonly<{ statusTime?: string; width?: number; screenHeight?: number; children: ReactNode }>) {
  return (
    <MockupRoot {...root} kind="phone" style={phoneStyle(width, screenHeight)}>
      <PhoneShell {...(statusTime === undefined ? {} : { statusTime })}>
        <div className="hkm-phone-body">{children}</div>
      </PhoneShell>
    </MockupRoot>
  );
}

/** Size variables for a phone root. */
export function phoneStyle(width: number | undefined, screenHeight: number | undefined): CSSProperties | undefined {
  const style: Record<string, string> = {};
  if (width !== undefined) {
    if (!(width > 0)) throw new RangeError("A phone mockup width must be positive.");
    style["--hkm-phone-width"] = `${width}px`;
  }
  if (screenHeight !== undefined) {
    if (!(screenHeight >= 200 && screenHeight <= 844)) throw new RangeError("A phone mockup screenHeight must be 200 to 844 points.");
    style["--hkm-phone-height"] = String(screenHeight + 22);
  }
  return Object.keys(style).length === 0 ? undefined : (style as CSSProperties);
}

/** The phone device without a root, for surfaces that compose it inside their own root. */
export function PhoneShell({ children, statusTime = "9:41" }: Readonly<{ statusTime?: string; children: ReactNode }>) {
  return (
    <div className="hkm-device">
      <span aria-hidden="true" className="hkm-device-button" data-hkm-button="action" />
      <span aria-hidden="true" className="hkm-device-button" data-hkm-button="volume-up" />
      <span aria-hidden="true" className="hkm-device-button" data-hkm-button="volume-down" />
      <span aria-hidden="true" className="hkm-device-button" data-hkm-button="power" />
      <div className="hkm-bezel">
        <div className="hkm-screen">
          <div className="hkm-screen-content">{children}</div>
          <div aria-hidden="true" className="hkm-status-bar">
            <span className="hkm-status-time">{statusTime}</span>
            <span className="hkm-status-glyphs">
              <svg className="hkm-status-cell" viewBox="0 0 19 12">
                <rect height="4.5" rx="0.9" width="3.2" x="0" y="7.5" />
                <rect height="6.8" rx="0.9" width="3.2" x="5.1" y="5.2" />
                <rect height="9.3" rx="0.9" width="3.2" x="10.2" y="2.7" />
                <rect height="12" rx="0.9" width="3.2" x="15.3" y="0" />
              </svg>
              <svg className="hkm-status-wifi" viewBox="0 0 17 12.3">
                <path d="M8.5 2.6c2.4 0 4.6.9 6.2 2.4.2.2.5.2.7 0l1.2-1.2c.2-.2.2-.5 0-.7C14.5 1.2 11.6 0 8.5 0S2.5 1.2.4 3.1c-.2.2-.2.5 0 .7L1.6 5c.2.2.5.2.7 0C3.9 3.5 6.1 2.6 8.5 2.6Z" />
                <path d="M8.5 6.4c1.3 0 2.5.5 3.5 1.3.2.2.5.2.7 0l1.2-1.2c.2-.2.2-.5 0-.7-1.4-1.3-3.3-2-5.4-2s-4 .7-5.4 2c-.2.2-.2.5 0 .7l1.2 1.2c.2.2.5.2.7 0 1-.8 2.2-1.3 3.5-1.3Z" />
                <path d="M11.1 9.4c.2-.2.2-.5 0-.7-.7-.6-1.6-1-2.6-1s-1.9.4-2.6 1c-.2.2-.2.5 0 .7l2.2 2.2c.2.2.5.2.7 0l2.3-2.2Z" />
              </svg>
              <svg className="hkm-status-battery" viewBox="0 0 27.4 13">
                <rect fill="none" height="12" rx="3.8" stroke="currentColor" strokeOpacity="0.35" width="24" x="0.5" y="0.5" />
                <rect height="9" rx="2.5" width="21" x="2" y="2" />
                <path d="M26 4.4v4.2c.8-.3 1.4-1.1 1.4-2.1S26.8 4.7 26 4.4Z" fillOpacity="0.4" />
              </svg>
            </span>
          </div>
          <span aria-hidden="true" className="hkm-island" />
          <span aria-hidden="true" className="hkm-home-indicator" />
        </div>
      </div>
    </div>
  );
}

/** One turn in a coding-agent session. */
export type AgentTurn = Readonly<{
  role: "user" | "agent" | "tool";
  text: string;
  /** For a tool turn: the tool's neutral name, such as "Run tests" or "Edit file". */
  tool?: string;
  status?: "ok" | "warn" | "error" | "running";
  beat?: string;
}>;

/**
 * A neutral coding-agent session. `generic-cli` draws a terminal agent with
 * tool-call blocks; `generic-chat` draws a chat panel with a composer. Neither
 * copies a vendor's chrome, name, or mark.
 */
export function AgentSession({
  agent,
  fade,
  height,
  title,
  turns,
  ...root
}: MockupRootProps & Readonly<{ agent: "generic-cli" | "generic-chat"; turns: readonly AgentTurn[]; title?: string; height?: number; fade?: boolean }>) {
  if (agent !== "generic-cli" && agent !== "generic-chat") throw new TypeError(`Unknown agent chrome ${JSON.stringify(agent)}.`);
  const fades = fade ?? height !== undefined;
  const sample = optOutProps(root.optOut);
  return (
    <MockupRoot {...root} kind="agent">
      <div className="hkm-window" data-hkm-agent={agent}>
        <div aria-hidden="true" className="hkm-title-bar">
          <WindowLights />
          <span className="hkm-title">{title ?? (agent === "generic-cli" ? "Coding agent" : "Assistant")}</span>
          <span />
        </div>
        <div className="hkm-page hkm-agent-body" data-hkm-fade={fades ? "" : undefined} style={pageStyle(height)}>
          <ol className="hkm-agent-turns">
            {turns.map((turn, index) => (
              <li className="hkm-agent-turn" data-hkm-beat={turn.beat} data-hkm-role={turn.role} data-hkm-tone={turn.status} key={index}>
                {turn.role === "tool" ? (
                  <span className="hkm-agent-tool">
                    <span className="hkm-agent-tool-name">
                      <span className="hkm-agent-status" />
                      {turn.tool ?? "Tool"}
                    </span>
                    <span className="hkm-agent-tool-output"><SampleText {...sample}>{turn.text}</SampleText></span>
                  </span>
                ) : (
                  <>
                    <span aria-hidden="true" className="hkm-agent-marker">{turn.role === "user" ? "›" : <MockupGlyph name="sparkle" size={14} />}</span>
                    <span className="hkm-agent-text"><SampleText {...sample}>{turn.text}</SampleText></span>
                  </>
                )}
              </li>
            ))}
          </ol>
        </div>
        {agent === "generic-chat" ? (
          <div aria-hidden="true" className="hkm-agent-composer">
            <span className="hkm-agent-composer-field">Ask for a change</span>
            <span className="hkm-agent-composer-send"><MockupGlyph name="send" size={14} /></span>
          </div>
        ) : null}
      </div>
    </MockupRoot>
  );
}
