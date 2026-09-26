/**
 * Static HTML for the shared 404 page. Static-site builders that do not run
 * React write this into their `404.html`, load `status-page.css` (or
 * styles.css), and call `attachStatusPage` from the browser entry. For a
 * missing page the markup matches `StatusPage` in `@hraness/design-kit/react`
 * byte for byte; tests bind the two. React error pages add the focus and
 * live-region attributes a runtime error needs. Text arguments are escaped.
 * The next-links heading has a fixed id, so render one page per document.
 */
import { escapeArticleHtml as escape } from "./article-html.js";
import {
  STATUS_PAGE_AGENT_PREFIX,
  STATUS_PAGE_BACK_LABEL,
  STATUS_PAGE_HINT_PREFIX,
  STATUS_PAGE_NEXT_HEADING_ID,
  resolveStatusPage,
  statusPageRoutesAttribute,
  type StatusPageContent,
} from "./status-page.js";

export type StatusPageHtmlOptions = StatusPageContent & Readonly<{
  /** Heading level of the title; the next-links heading is one level lower. */
  titleLevel?: 1 | 2 | 3 | 4 | 5;
  /** Root element. Use "div" when the site layout already provides `main`. */
  rootElement?: "main" | "div";
}>;

export function renderStatusPageHtml(options: StatusPageHtmlOptions = {}): string {
  const page = resolveStatusPage(options);
  const level = options.titleLevel ?? 1;
  const root = options.rootElement ?? "main";
  const notFound = page.kind === "not-found";
  const routes = notFound ? statusPageRoutesAttribute(page.routes) : undefined;
  const next = page.next.length === 0 ? "" : [
    `<nav aria-labelledby="${STATUS_PAGE_NEXT_HEADING_ID}" class="hraness-status-page__next">`,
    `<h${level + 1} class="hraness-status-page__next-heading" id="${STATUS_PAGE_NEXT_HEADING_ID}">${escape(page.nextHeading)}</h${level + 1}>`,
    '<ul class="hraness-status-page__next-list">',
    ...page.next.map((link) => [
      `<li><a class="hraness-status-page__next-link" href="${escape(link.href)}">`,
      `<span class="hraness-status-page__next-label">${escape(link.label)}</span>`,
      link.description === undefined ? "" : `<span class="hraness-status-page__next-description">${escape(link.description)}</span>`,
      "</a></li>",
    ].join("")),
    "</ul></nav>",
  ].join("");
  const agent = page.agentIndexHref === undefined ? "" : `<p class="hraness-status-page__agent">${STATUS_PAGE_AGENT_PREFIX} <a href="${escape(page.agentIndexHref)}">${escape(page.agentIndexHref)}</a></p>`;
  return [
    `<${root} class="hraness-status-page"${routes === undefined ? "" : ` data-hraness-status-routes="${escape(routes)}"`} data-kind="${page.kind}">`,
    '<div class="hraness-status-page__inner">',
    `<div aria-hidden="true" class="hraness-status-page__code"><span class="hraness-status-page__glyph">${escape(page.glyph)}</span><canvas class="hraness-status-page__field"></canvas></div>`,
    `<h${level} class="hraness-status-page__title">${escape(page.title)}</h${level}>`,
    `<p class="hraness-status-page__summary">${escape(page.summary)}</p>`,
    notFound ? `<p class="hraness-status-page__hint" hidden="">${STATUS_PAGE_HINT_PREFIX} <a class="hraness-status-page__hint-link" href="/"></a>?</p>` : "",
    '<div class="hraness-status-page__actions">',
    `<a class="hraness-status-page__action hraness-foil" data-emphasis="primary" data-foil="" href="${escape(page.primaryAction.href)}">${escape(page.primaryAction.label)}</a>`,
    `<a class="hraness-status-page__back" hidden="" href="/">${STATUS_PAGE_BACK_LABEL}</a>`,
    "</div>",
    next,
    agent,
    "</div>",
    `</${root}>`,
  ].join("");
}
