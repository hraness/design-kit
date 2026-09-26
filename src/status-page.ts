/**
 * Framework-neutral content for full-page status routes: the 404 page and the
 * recoverable error pages. React (`@hraness/design-kit/react`) and static HTML
 * (`renderStatusPageHtml`) render the same markup from these values, styled by
 * `status-page.css`; `attachStatusPage` from the browser entry adds the dot
 * field, the "Did you mean" hint, and the same-site Back link.
 */
import { assertArticleHref } from "./article.js";

export type StatusPageKind = "not-found" | "error";

export type StatusPageLink = Readonly<{
  href: string;
  label: string;
  /** One short line under the label. Next links only. */
  description?: string;
}>;

export type StatusPageContent = Readonly<{
  kind?: StatusPageKind;
  /** Product name used in the default primary action ("Go to Sponge"). */
  siteName?: string;
  /** Decorative glyph drawn by the dot field. Defaults to "404" or "!". */
  glyph?: string;
  title?: string;
  summary?: string;
  /**
   * The one action most readers should take. Point it at the product's main
   * conversion step, such as starting a library or installing the CLI.
   */
  primaryAction?: StatusPageLink;
  /** At most three places worth starting from, each with an optional line. */
  next?: readonly StatusPageLink[];
  nextHeading?: string;
  /**
   * Known internal pages. They are never listed; the browser controller
   * compares them with the missing address and offers the closest one.
   */
  routes?: readonly StatusPageLink[];
  /** A machine-readable index such as "/llms.txt", shown as one quiet line. */
  agentIndexHref?: string;
}>;

export const STATUS_PAGE_MAX_NEXT = 3;
export const STATUS_PAGE_MAX_ROUTES = 2000;
export const STATUS_PAGE_BACK_LABEL = "Go back";
export const STATUS_PAGE_HINT_PREFIX = "Did you mean";
export const STATUS_PAGE_NEXT_HEADING_ID = "hraness-status-page-next";
export const STATUS_PAGE_AGENT_PREFIX = "AI agents can start at";

export type ResolvedStatusPage = Readonly<{
  kind: StatusPageKind;
  glyph: string;
  title: string;
  summary: string;
  primaryAction: StatusPageLink;
  next: readonly StatusPageLink[];
  nextHeading: string;
  routes: readonly StatusPageLink[];
  agentIndexHref?: string;
}>;

const defaults = {
  "not-found": {
    glyph: "404",
    title: "We can’t find that page",
    summary: "The link may be out of date or mistyped.",
  },
  error: {
    glyph: "!",
    title: "This view could not load",
    summary: "Retry this view, or return home and continue from there.",
  },
} as const satisfies Record<StatusPageKind, Readonly<{ glyph: string; title: string; summary: string }>>;

function assertText(name: string, value: string, limit: number): void {
  if (value.trim() === "" || value.length > limit) {
    throw new RangeError(`Status page ${name} must be 1–${limit} characters.`);
  }
}

function assertLink(name: string, link: StatusPageLink): void {
  assertArticleHref(link.href);
  assertText(`${name} label`, link.label, 48);
  if (link.description !== undefined) assertText(`${name} description`, link.description, 90);
}

/** Apply defaults and reject content the page cannot show well. */
export function resolveStatusPage(content: StatusPageContent = {}): ResolvedStatusPage {
  const kind = content.kind ?? "not-found";
  const base = defaults[kind];
  const siteName = content.siteName?.trim();
  if (siteName !== undefined) assertText("siteName", siteName, 40);
  const glyph = content.glyph ?? base.glyph;
  assertText("glyph", glyph, 4);
  const title = content.title ?? base.title;
  assertText("title", title, 60);
  const summary = content.summary ?? base.summary;
  assertText("summary", summary, 160);
  const primaryAction = content.primaryAction ?? {
    href: "/",
    label: siteName ? `Go to ${siteName}` : "Go to the homepage",
  };
  assertLink("primaryAction", primaryAction);
  const next = content.next ?? [];
  if (next.length > STATUS_PAGE_MAX_NEXT) {
    throw new RangeError(`A status page lists at most ${STATUS_PAGE_MAX_NEXT} next links; pick the ones that lead to your product.`);
  }
  next.forEach((link) => assertLink("next", link));
  const nextHeading = content.nextHeading ?? "Or start here";
  assertText("nextHeading", nextHeading, 40);
  const routes = (content.routes ?? []).slice(0, STATUS_PAGE_MAX_ROUTES);
  routes.forEach((link) => assertLink("route", link));
  if (content.agentIndexHref !== undefined) assertArticleHref(content.agentIndexHref);
  return {
    kind,
    glyph,
    title,
    summary,
    primaryAction,
    next,
    nextHeading,
    routes: routes.filter((route) => isSitePath(route.href)),
    ...(content.agentIndexHref === undefined ? {} : { agentIndexHref: content.agentIndexHref }),
  };
}

/** A path on this site: one leading slash, not followed by a slash or backslash. */
function isSitePath(href: string): boolean {
  return /^\/(?![/\\])/u.test(href);
}

/** Serialized for the browser controller; the only route data in the markup. */
export function statusPageRoutesAttribute(routes: readonly StatusPageLink[]): string | undefined {
  if (routes.length === 0) return undefined;
  return JSON.stringify(routes.map(({ href, label }) => [href, label]));
}

/** Parse the attribute written by `statusPageRoutesAttribute`, ignoring anything malformed. */
export function parseStatusPageRoutes(value: string | null | undefined): readonly StatusPageLink[] {
  if (!value) return [];
  let parsed: unknown;
  try { parsed = JSON.parse(value); } catch { return []; }
  if (!Array.isArray(parsed)) return [];
  const routes: StatusPageLink[] = [];
  for (const entry of parsed.slice(0, STATUS_PAGE_MAX_ROUTES)) {
    if (!Array.isArray(entry)) continue;
    const [href, label] = entry as unknown[];
    if (typeof href !== "string" || typeof label !== "string") continue;
    if (!isSitePath(href) || label.trim() === "") continue;
    routes.push({ href, label });
  }
  return routes;
}

const MAX_PATH = 160;

/** Lowercased pathname without query, fragment, index files, or trailing slash. */
export function normalizeStatusPath(value: string): string {
  // Bound the input first; every step below is linear in its length.
  let path = value.slice(0, MAX_PATH * 4);
  const end = path.search(/[?#]/u);
  if (end !== -1) path = path.slice(0, end);
  try { path = decodeURIComponent(path); } catch { /* keep the raw path */ }
  path = path.toLowerCase().split("/").filter((part, index) => index === 0 || part !== "").join("/");
  path = path.replace(/(?:\/index)?\.html?$/u, "");
  while (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  if (!path.startsWith("/")) path = `/${path}`;
  return path.slice(0, MAX_PATH);
}

/** The most edits a typo may carry; more than this is a different page. */
const MAX_EDITS = 3;
const BEYOND = MAX_EDITS + 1;

/**
 * Optimal string alignment distance, computed only in the diagonal band the
 * limit allows, so each comparison costs O(length × limit). Returns
 * `limit + 1` once the distance is known to exceed the limit.
 */
function editDistance(a: string, b: string, limit: number): number {
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  const columns = b.length + 1;
  let before = new Int32Array(columns).fill(BEYOND);
  let previous = Int32Array.from({ length: columns }, (_, index) => Math.min(index, BEYOND));
  let current = new Int32Array(columns).fill(BEYOND);
  for (let i = 1; i <= a.length; i++) {
    const low = Math.max(1, i - limit);
    const high = Math.min(b.length, i + limit);
    current[low - 1] = low === 1 ? Math.min(i, BEYOND) : BEYOND;
    if (high < b.length) current[high + 1] = BEYOND;
    let rowMin = BEYOND;
    for (let j = low; j <= high; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let value = Math.min((previous[j] ?? BEYOND) + 1, (current[j - 1] ?? BEYOND) + 1, (previous[j - 1] ?? BEYOND) + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        value = Math.min(value, (before[j - 2] ?? BEYOND) + 1);
      }
      current[j] = Math.min(value, BEYOND);
      rowMin = Math.min(rowMin, value);
    }
    if (rowMin > limit) return limit + 1;
    [before, previous, current] = [previous, current, before];
  }
  return Math.min(previous[b.length] ?? BEYOND, limit + 1);
}

function words(path: string): readonly string[] {
  return path.split(/[/\-_.]+/u).filter((word) => word.length > 0);
}

/** Edits a single word may carry and still be the same word misspelled. */
function wordAllowance(word: string): number {
  if (word.length < 4) return 0;
  return word.length < 8 ? 1 : 2;
}

/**
 * Every word of the address is a word of the page, or that word misspelled.
 * A different short word (v1/v2, oh/ai) or a different product name in the
 * same slug template is a different page, not a typo.
 */
function wordsMatch(missing: readonly string[], candidate: readonly string[]): boolean {
  return missing.every((word) => {
    const allowance = wordAllowance(word);
    return candidate.some((other) => other === word
      || (allowance > 0 && editDistance(word, other, allowance) <= allowance));
  });
}

type Candidate = Readonly<{ path: string; words: readonly string[]; joined: string; last: string }>;

function candidate(path: string): Candidate {
  const parts = words(path);
  return { path, words: parts, joined: parts.join(""), last: path.slice(path.lastIndexOf("/") + 1) };
}

function score(missing: Candidate, page: Candidate): number | undefined {
  if (page.path === missing.path) return 0;
  // Same words with different separators: /gettingstarted, /getting_started.
  if (missing.joined.length >= 6 && missing.joined === page.joined) return 0.1;
  const longest = Math.max(missing.path.length, page.path.length);
  const limit = Math.min(MAX_EDITS, Math.floor(longest / 4));
  if (limit > 0 && wordsMatch(missing.words, page.words)) {
    const distance = editDistance(missing.path, page.path, limit);
    if (distance <= limit) return distance / longest;
  }
  // A page that kept its slug but moved section: /blog/x -> /writing/x.
  if (missing.last.length >= 6 && missing.last === page.last) return 0.5;
  // A shortened slug: every longer word of the address appears in the page.
  const longer = missing.words.filter((word) => word.length >= 3);
  if (longer.length >= 2 && longer.length === missing.words.length
    && longer.every((word) => page.words.includes(word))) return 0.6;
  return undefined;
}

/**
 * The known internal page closest to a missing address, or nothing when no
 * page is close enough to be a likely typo, move, or shortened link. The home
 * page is never suggested; the primary action already leads there.
 */
export function suggestStatusRoute(
  pathname: string,
  routes: readonly StatusPageLink[],
): StatusPageLink | undefined {
  const normalized = normalizeStatusPath(pathname);
  if (normalized === "/") return undefined;
  // Too short to tell a typo from a different page (/a, /do, /api), so a
  // short address only matches a page that differs in case or slashes.
  const exactOnly = normalized.length < 5;
  const missing = candidate(normalized);
  let best: { route: StatusPageLink; score: number; path: string } | undefined;
  for (const route of routes.slice(0, STATUS_PAGE_MAX_ROUTES)) {
    if (!isSitePath(route.href)) continue;
    const path = normalizeStatusPath(route.href);
    if (path === "/" || (exactOnly && path !== normalized)) continue;
    const value = score(missing, candidate(path));
    if (value === undefined) continue;
    if (best === undefined
      || value < best.score
      || (value === best.score && (path.length < best.path.length
        || (path.length === best.path.length && path < best.path)))) {
      best = { route, score: value, path };
    }
  }
  return best?.route;
}
