"use client";

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import {
  detectPlatform,
  isKnownPlatformId,
  isPlatformId,
  matchDetectedPlatform,
  platformLabel,
  platformMark,
  type PlatformId,
} from "../platforms.js";
import { SyntaxCode } from "./syntax-code.js";
import { platformInstallClassName as cx } from "./platform-install.stylex.js";

/** Another way to install on the same platform, such as npm or Homebrew. */
export interface PlatformInstallAlternative {
  /** Names the route, such as "npm" or "Homebrew". */
  readonly label: string;
  readonly command: string;
  /** Where the command runs, such as "Terminal" or "PowerShell". */
  readonly shell?: string;
}

interface PlatformInstallTargetBase {
  readonly id: PlatformId;
  /** Required for ids other than `macos`, `linux`, and `windows`, which default to their display names. */
  readonly label?: string;
  /** Where the command runs, such as "Terminal" or "PowerShell". */
  readonly shell?: string;
  /** A short qualifier under the command, such as "Apple silicon" or "x86_64 and ARM64, glibc 2.34+". */
  readonly note?: ReactNode;
  readonly alternatives?: readonly PlatformInstallAlternative[];
}

/** A platform with a native install command. */
export interface AvailablePlatformInstallTarget extends PlatformInstallTargetBase {
  readonly command: string;
  readonly unavailable?: false;
  readonly unavailableNote?: never;
}

/**
 * A platform without a native build. The note says what to do instead
 * ("Build from source", "Runs in WSL2"); a command, when given, is the route
 * that note describes.
 */
export interface UnavailablePlatformInstallTarget extends PlatformInstallTargetBase {
  readonly unavailable: true;
  readonly unavailableNote: ReactNode;
  readonly command?: string;
}

export type PlatformInstallTarget = AvailablePlatformInstallTarget | UnavailablePlatformInstallTarget;

export interface PlatformInstallProps {
  /** One entry per platform tab, in display order. */
  readonly platforms: readonly PlatformInstallTarget[];
  readonly className?: string;
  /**
   * The platform selected in the server render and before detection.
   * Defaults to the first platform.
   */
  readonly defaultPlatform?: PlatformId;
  /** Select the visitor's operating system after hydration when it is listed. Defaults to true. */
  readonly detect?: boolean;
  readonly id?: string;
  /** Accessible name for the platform tabs. Defaults to "Platform". */
  readonly label?: string;
}

type CopyStatus = Readonly<{ key: string; ok: boolean; subject: string }>;
type SelectionSource = "default" | "detected" | "chosen";

const copyResetMilliseconds = 2000;

function assertTargets(platforms: readonly PlatformInstallTarget[], defaultPlatform: PlatformId | undefined): void {
  if (platforms.length === 0) throw new RangeError("PlatformInstall needs at least one platform.");
  const seen = new Set<string>();
  for (const target of platforms) {
    if (!isPlatformId(target.id)) throw new RangeError(`Platform ids are lowercase slugs; received ${JSON.stringify(target.id)}.`);
    if (seen.has(target.id)) throw new RangeError(`Duplicate platform id: ${target.id}.`);
    seen.add(target.id);
    if (target.label !== undefined ? target.label.trim() === "" : !isKnownPlatformId(target.id)) {
      throw new RangeError(`Platform ${target.id} needs a label.`);
    }
    if (target.unavailable === true) {
      if (target.unavailableNote === undefined || target.unavailableNote === null || target.unavailableNote === "") {
        throw new RangeError(`Unavailable platform ${target.id} needs an unavailableNote.`);
      }
      if (target.command !== undefined && target.command.trim() === "") throw new RangeError(`Platform ${target.id} has a blank command.`);
    } else {
      if (typeof target.command !== "string" || target.command.trim() === "") throw new RangeError(`Platform ${target.id} needs a command.`);
    }
    for (const alternative of target.alternatives ?? []) {
      if (alternative.label.trim() === "" || alternative.command.trim() === "") {
        throw new RangeError(`Platform ${target.id} has an alternative without a label or command.`);
      }
    }
  }
  if (defaultPlatform !== undefined && !seen.has(defaultPlatform)) {
    throw new RangeError(`defaultPlatform ${JSON.stringify(defaultPlatform)} is not one of the listed platforms.`);
  }
}

function labelOf(target: PlatformInstallTarget): string {
  return target.label ?? platformLabel(target.id);
}

function selectContents(element: HTMLElement | null): void {
  if (element === null) return;
  try {
    const selection = element.ownerDocument.defaultView?.getSelection();
    if (selection === null || selection === undefined) return;
    const range = element.ownerDocument.createRange();
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
  } catch {
    // Selection is a convenience; the failure is still announced.
  }
}

async function writeClipboard(text: string, fallback: HTMLElement | null): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard !== undefined) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the selection route below.
  }
  // Clipboard access is blocked or unavailable: select the command so the
  // visitor can copy it by hand, and try the legacy copy command once.
  selectContents(fallback);
  try {
    return fallback?.ownerDocument.execCommand("copy") === true;
  } catch {
    return false;
  }
}

/**
 * Each listed platform's mark is defined once per component as a `<symbol>`
 * and drawn by reference, so the tab and the no-script panel label do not
 * repeat the full path (the Tux mark alone is several kilobytes).
 */
function PlatformMarkSymbols({ ids, symbolId }: Readonly<{ ids: readonly PlatformId[]; symbolId: (id: PlatformId) => string }>) {
  return (
    <svg aria-hidden="true" className={cx(["markSymbols"])} focusable="false" xmlns="http://www.w3.org/2000/svg">
      {ids.map((id) => {
        const mark = platformMark(id);
        return <symbol id={symbolId(id)} key={id} viewBox={mark.viewBox}><path d={mark.path} /></symbol>;
      })}
    </svg>
  );
}

/** The decorative PlatformIcon, drawn from the component's shared symbol. */
function PlatformMarkUse({ platform, symbolId }: Readonly<{ platform: PlatformId; symbolId: string }>) {
  return (
    <svg aria-hidden="true" className={cx(["icon"])} data-platform={platform} fill="currentColor" focusable="false"
      viewBox={platformMark(platform).viewBox} xmlns="http://www.w3.org/2000/svg">
      <use href={`#${symbolId}`} />
    </svg>
  );
}

function CopyGlyph({ copied }: Readonly<{ copied: boolean }>) {
  return (
    <svg aria-hidden="true" className={cx(["copyIcon"])} fill="none" focusable="false" stroke="currentColor"
      strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
      {copied
        ? <path d="M5 12.5l4.5 4.5L19 7.5" />
        : <><rect height="12" rx="2" width="12" x="8" y="8" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>}
    </svg>
  );
}

function CommandBlock({
  caption,
  command,
  copyKey,
  onCopy,
  status,
  subject,
}: Readonly<{
  caption: string | undefined;
  command: string;
  copyKey: string;
  onCopy: (key: string, command: string, subject: string, pre: HTMLElement | null) => void;
  status: CopyStatus | null;
  subject: string;
}>) {
  const preRef = useRef<HTMLPreElement>(null);
  const state = status?.key === copyKey ? (status.ok ? "copied" : "failed") : "idle";
  return (
    <div className={cx(["command"])} data-copy-state={state}>
      <div className={cx(["commandBar", (caption === undefined || caption === "") && "commandBarEmpty"])}>
        <span className={cx(["shell"])}>{caption}</span>
        <button
          className={cx(["copy"])}
          data-copy-state={state}
          onClick={() => onCopy(copyKey, command, subject, preRef.current)}
          type="button"
        >
          <CopyGlyph copied={state === "copied"} />
          <span>{state === "copied" ? "Copied" : state === "failed" ? "Select to copy" : "Copy"}</span>
          <span className={cx(["status"])}> {subject}</span>
        </button>
      </div>
      {/* Focusable so keyboard users can scroll a long command sideways. */}
      <pre aria-label={subject} className={cx(["pre"])} ref={preRef} tabIndex={0}>
        <SyntaxCode className={cx(["code"])} code={command} language="shell" styles="classes" />
      </pre>
    </div>
  );
}

/**
 * Install commands for each supported platform behind one tab row with
 * platform icons. The server render selects `defaultPlatform` (or the first
 * platform); after hydration the visitor's operating system is selected when
 * it is listed. Each command has a copy button that announces the result.
 * Without JavaScript the tabs and copy buttons hide and every platform's
 * commands show in sequence.
 */
export function PlatformInstall({
  className,
  defaultPlatform,
  detect = true,
  id,
  label = "Platform",
  platforms,
}: PlatformInstallProps) {
  assertTargets(platforms, defaultPlatform);
  const [firstTarget] = platforms;
  if (firstTarget === undefined) throw new RangeError("PlatformInstall needs at least one platform.");
  const generatedId = useId();
  const baseId = id ?? `hraness-platform-install${generatedId.replaceAll(/[^A-Za-z0-9_-]/gu, "")}`;
  const initial = defaultPlatform ?? firstTarget.id;
  const [selected, setSelected] = useState<PlatformId>(initial);
  const [source, setSource] = useState<SelectionSource>("default");
  const [status, setStatus] = useState<CopyStatus | null>(null);
  const chosen = useRef(false);
  const tabs = useRef(new Map<string, HTMLButtonElement>());
  const ids = platforms.map((target) => target.id);
  const idKey = ids.join("\n");
  const symbolId = (platform: PlatformId) => `${baseId}-mark-${platform}`;

  // A removed platform falls back to the first listed one.
  const current = ids.includes(selected) ? selected : initial;

  useEffect(() => {
    if (!detect || chosen.current) return;
    const match = matchDetectedPlatform(detectPlatform(globalThis.navigator), idKey.split("\n"));
    if (match === null) return;
    setSelected(match);
    setSource("detected");
  }, [detect, idKey]);

  useEffect(() => {
    if (status === null) return;
    const timer = setTimeout(() => setStatus(null), copyResetMilliseconds);
    return () => clearTimeout(timer);
  }, [status]);

  const choose = useCallback((next: PlatformId, focus: boolean) => {
    chosen.current = true;
    setSelected(next);
    setSource("chosen");
    if (focus) tabs.current.get(next)?.focus();
  }, []);

  const copy = useCallback((key: string, command: string, subject: string, pre: HTMLElement | null) => {
    void writeClipboard(command, pre).then((ok) => setStatus({ key, ok, subject }));
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = ids.indexOf(current);
    let next: number;
    switch (event.key) {
      case "ArrowRight": next = (index + 1) % ids.length; break;
      case "ArrowLeft": next = (index - 1 + ids.length) % ids.length; break;
      case "Home": next = 0; break;
      case "End": next = ids.length - 1; break;
      default: return;
    }
    const target = ids[next];
    if (target === undefined) return;
    event.preventDefault();
    choose(target, true);
  };

  return (
    <div
      className={cx(["root"], className)}
      data-hraness-platform-install=""
      data-selected-platform={current}
      data-selection-source={source}
      id={id}
    >
      <PlatformMarkSymbols ids={ids} symbolId={symbolId} />
      <div aria-label={label} className={cx(["tablist"])} onKeyDown={onKeyDown} role="tablist">
        {platforms.map((target) => {
          const isSelected = target.id === current;
          return (
            <button
              aria-controls={`${baseId}-panel-${target.id}`}
              aria-selected={isSelected}
              className={cx(["tab", isSelected && "tabSelected"])}
              data-availability={target.unavailable === true ? "unavailable" : "available"}
              data-platform={target.id}
              id={`${baseId}-tab-${target.id}`}
              key={target.id}
              onClick={() => choose(target.id, false)}
              ref={(element) => {
                if (element === null) tabs.current.delete(target.id);
                else tabs.current.set(target.id, element);
              }}
              role="tab"
              tabIndex={isSelected ? 0 : -1}
              type="button"
            >
              <PlatformMarkUse platform={target.id} symbolId={symbolId(target.id)} />
              <span className={cx(["tabLabel"])}>{labelOf(target)}</span>
            </button>
          );
        })}
      </div>
      {platforms.map((target) => {
        const name = labelOf(target);
        const alternatives = target.alternatives ?? [];
        return (
          <div
            aria-labelledby={`${baseId}-tab-${target.id}`}
            className={cx(["panel"])}
            data-availability={target.unavailable === true ? "unavailable" : "available"}
            data-platform={target.id}
            hidden={target.id !== current}
            id={`${baseId}-panel-${target.id}`}
            key={target.id}
            role="tabpanel"
          >
            <div className={cx(["panelBody"])}>
              <p className={cx(["panelLabel"])}>
                <PlatformMarkUse platform={target.id} symbolId={symbolId(target.id)} />
                <span>{name}</span>
              </p>
              {target.unavailable === true
                ? <div className={cx(["unavailable"])}>{target.unavailableNote}</div>
                : null}
              {target.command === undefined ? null : (
                <CommandBlock
                  caption={target.shell}
                  command={target.command}
                  copyKey={`${target.id}:primary`}
                  onCopy={copy}
                  status={status}
                  subject={`${name} install command`}
                />
              )}
              {alternatives.length === 0 ? null : (
                <ul aria-label={`Other ways to install on ${name}`} className={cx(["alternatives"])}>
                  {alternatives.map((alternative, index) => (
                    <li key={`${alternative.label}-${index}`}>
                      <CommandBlock
                        caption={[alternative.label, alternative.shell].filter(Boolean).join(" · ")}
                        command={alternative.command}
                        copyKey={`${target.id}:${index}`}
                        onCopy={copy}
                        status={status}
                        subject={`${name} ${alternative.label} command`}
                      />
                    </li>
                  ))}
                </ul>
              )}
              {target.note === undefined ? null : <div className={cx(["note"])}>{target.note}</div>}
            </div>
          </div>
        );
      })}
      <p aria-live="polite" className={cx(["status"])} role="status">
        {status === null ? "" : status.ok ? `Copied the ${status.subject}.` : `Copying failed. The ${status.subject} is selected; copy it with your keyboard.`}
      </p>
    </div>
  );
}
