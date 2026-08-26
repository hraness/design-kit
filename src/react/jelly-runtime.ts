"use client";

import type { ThemeMode } from "../../vendor/jelly-ui/jelly.js";

interface JellyThemeRuntime {
  setThemeMode(mode?: ThemeMode): void;
}

type JellyRuntimeLoader = () => Promise<JellyThemeRuntime>;

/** Cache successful loads while allowing a transient chunk/CSP failure to retry. */
export function createRetryableJellyRuntimeLoader(
  loader: JellyRuntimeLoader,
): JellyRuntimeLoader {
  let runtime: Promise<JellyThemeRuntime> | undefined;

  return () => {
    runtime ??= loader().catch((error: unknown) => {
      runtime = undefined;
      throw error;
    });
    return runtime;
  };
}

const loadBrowserJellyRuntime = createRetryableJellyRuntimeLoader(
  () => import("../../vendor/jelly-ui/jelly.js"),
);
let themeRequest = 0;

export function shouldLoadJellyRuntime(
  documentRoot: Pick<Document, "querySelector">,
): boolean {
  return documentRoot.querySelector(".hraness-design-jelly-surface") !== null;
}

export function applyJellyRootMode(
  root: Pick<HTMLElement, "removeAttribute" | "setAttribute">,
  mode: ThemeMode,
): void {
  if (mode === "auto") root.removeAttribute("data-jelly-mode");
  else root.setAttribute("data-jelly-mode", mode);
}

export function readJellyRootMode(
  root: Pick<HTMLElement, "getAttribute">,
): ThemeMode {
  const mode = root.getAttribute("data-jelly-mode");
  return mode === "light" || mode === "dark" ? mode : "auto";
}

export async function loadJellyRuntimeForRoot(
  loader: JellyRuntimeLoader,
  root: Pick<HTMLElement, "getAttribute">,
): Promise<boolean> {
  try {
    const runtime = await loader();
    applyJellyThemeMode(runtime, readJellyRootMode(root));
    return true;
  } catch {
    return false;
  }
}

export async function synchronizeJellyThemeMode(
  documentRoot: Pick<Document, "documentElement" | "querySelector">,
  mode: ThemeMode,
  loader: JellyRuntimeLoader,
  isCurrent: () => boolean = () => true,
): Promise<boolean> {
  applyJellyRootMode(documentRoot.documentElement, mode);
  if (!shouldLoadJellyRuntime(documentRoot)) return true;

  let runtime: JellyThemeRuntime;
  try {
    runtime = await loader();
  } catch {
    return false;
  }
  if (!isCurrent()) return false;

  applyJellyThemeMode(runtime, mode);
  return true;
}

/** Register the pinned Jelly custom elements once, and only in a browser. */
export async function ensureJellyRuntime(): Promise<void> {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  // A surface mounted after the theme effect still receives the root's already
  // selected mode as soon as its browser-only runtime upgrades the element.
  await loadJellyRuntimeForRoot(loadBrowserJellyRuntime, document.documentElement);
}

/** Use Jelly's public theme API so every upgraded canvas receives its repaint event. */
export function applyJellyThemeMode(runtime: JellyThemeRuntime, mode: ThemeMode): void {
  runtime.setThemeMode(mode);
}

/**
 * Apply the root mode immediately, then notify all upgraded Jelly canvases once
 * the browser-only runtime is ready. The newest request wins across async load.
 */
export async function setJellyThemeMode(mode: ThemeMode): Promise<boolean> {
  if (typeof window === "undefined" || typeof document === "undefined") return false;

  const request = ++themeRequest;
  return synchronizeJellyThemeMode(
    document,
    mode,
    loadBrowserJellyRuntime,
    () => request === themeRequest,
  );
}
