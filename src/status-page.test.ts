import { describe, expect, test } from "bun:test";

import {
  STATUS_PAGE_MAX_NEXT,
  normalizeStatusPath,
  parseStatusPageRoutes,
  resolveStatusPage,
  statusPageRoutesAttribute,
  suggestStatusRoute,
} from "./status-page.js";
import { renderStatusPageHtml } from "./status-page-html.js";

const routes = [
  { href: "/", label: "Home" },
  { href: "/writing", label: "Writing" },
  { href: "/writing/the-thread-through-hraness", label: "The thread through Hraness" },
  { href: "/projects", label: "Projects" },
  { href: "/docs/getting-started", label: "Getting started" },
  { href: "/pricing", label: "Pricing" },
] as const;

describe("resolveStatusPage", () => {
  test("defaults to a direct 404 that leads home", () => {
    const page = resolveStatusPage();
    expect(page).toMatchObject({
      kind: "not-found",
      glyph: "404",
      title: "We can’t find that page",
      summary: "The link may be out of date or mistyped.",
      primaryAction: { href: "/", label: "Go to the homepage" },
      next: [],
      nextHeading: "Or start here",
    });
    expect(resolveStatusPage({ siteName: "Sponge" }).primaryAction.label).toBe("Go to Sponge");
    expect(resolveStatusPage({ kind: "error" })).toMatchObject({ glyph: "!", title: "This view could not load" });
  });

  test("keeps the next list short and every link safe", () => {
    const four = Array.from({ length: STATUS_PAGE_MAX_NEXT + 1 }, (_, index) => ({ href: `/p${index}`, label: `P${index}` }));
    expect(() => resolveStatusPage({ next: four })).toThrow(RangeError);
    expect(() => resolveStatusPage({ primaryAction: { href: "javascript:alert(1)", label: "Go" } })).toThrow(RangeError);
    expect(() => resolveStatusPage({ next: [{ href: "/docs", label: "" }] })).toThrow(RangeError);
    expect(() => resolveStatusPage({ glyph: "40404" })).toThrow(RangeError);
    expect(() => resolveStatusPage({ agentIndexHref: "data:text/plain,hi" })).toThrow(RangeError);
  });

  test("keeps only same-site routes for suggestions", () => {
    const page = resolveStatusPage({ routes: [...routes, { href: "https://wordcell.io", label: "Wordcell" }] });
    expect(page.routes.map((route) => route.href)).toEqual(routes.map((route) => route.href));
  });
});

describe("route data in the markup", () => {
  test("round-trips through the attribute and ignores malformed entries", () => {
    const attribute = statusPageRoutesAttribute(routes);
    expect(parseStatusPageRoutes(attribute)).toEqual(routes.map(({ href, label }) => ({ href, label })));
    expect(statusPageRoutesAttribute([])).toBeUndefined();
    expect(parseStatusPageRoutes("not json")).toEqual([]);
    expect(parseStatusPageRoutes('{"a":1}')).toEqual([]);
    expect(parseStatusPageRoutes('[["/ok","Ok"],["//evil","E"],["https://x","X"],[1,"n"],["/blank"," "],"bad"]')).toEqual([{ href: "/ok", label: "Ok" }]);
  });
});

describe("suggestStatusRoute", () => {
  test("normalizes the parts of an address that do not identify a page", () => {
    expect(normalizeStatusPath("/Writing/?ref=x#top")).toBe("/writing");
    expect(normalizeStatusPath("/docs/index.html")).toBe("/docs");
    expect(normalizeStatusPath("//docs//getting-started/")).toBe("/docs/getting-started");
    expect(normalizeStatusPath("/%E0%A4%A")).toBe("/%e0%a4%a");
  });

  test("offers the page behind a typo, a moved section, or a shortened slug", () => {
    expect(suggestStatusRoute("/docs/getting-startd", routes)?.href).toBe("/docs/getting-started");
    expect(suggestStatusRoute("/prcing", routes)?.href).toBe("/pricing");
    expect(suggestStatusRoute("/PROJECTS/", routes)?.href).toBe("/projects");
    expect(suggestStatusRoute("/blog/the-thread-through-hraness", routes)?.href).toBe("/writing/the-thread-through-hraness");
    expect(suggestStatusRoute("/writing/thread-hraness", routes)?.href).toBe("/writing/the-thread-through-hraness");
  });

  test("rejects near-miss pages that are really different pages", () => {
    const pages = [
      { href: "/go", label: "Go" },
      { href: "/docs", label: "Docs" },
      { href: "/ai", label: "AI" },
      { href: "/writing/how-wordcell-uses-claude", label: "How Wordcell uses Claude" },
      { href: "/blog/v2-release", label: "v2" },
    ];
    expect(suggestStatusRoute("/do", pages)).toBeUndefined();
    expect(suggestStatusRoute("/a", pages)).toBeUndefined();
    expect(suggestStatusRoute("/api", pages)).toBeUndefined();
    expect(suggestStatusRoute("/AI/", pages)?.href).toBe("/ai");
    expect(suggestStatusRoute("/writing/how-sponge-uses-claude", pages)).toBeUndefined();
    expect(suggestStatusRoute("/blog/v1-release", pages)).toBeUndefined();
    expect(suggestStatusRoute("/docs/gettingstarted", routes)?.href).toBe("/docs/getting-started");
  });

  test("never offers a link that leaves the site", () => {
    expect(parseStatusPageRoutes(JSON.stringify([["/\\evil.test", "E"], ["/ok", "Ok"]]))).toEqual([{ href: "/ok", label: "Ok" }]);
    expect(suggestStatusRoute("/evil.test", [{ href: "/\\evil.test", label: "E" }])).toBeUndefined();
    expect(() => resolveStatusPage({ primaryAction: { href: "/\\evil.test", label: "Go" } })).toThrow(RangeError);
  });

  test("compares 2,000 long routes quickly", () => {
    const many = Array.from({ length: 2000 }, (_, index) => ({
      href: `/writing/${"a-long-article-slug-about-something-".repeat(4)}${String(index)}`,
      label: `Article ${String(index)}`,
    }));
    const started = performance.now();
    suggestStatusRoute(`/writing/${"a-long-article-slug-about-somethink-".repeat(4)}x`, many);
    expect(performance.now() - started).toBeLessThan(1500);
  });

  test("stays quiet when nothing is close, and never suggests the home page", () => {
    expect(suggestStatusRoute("/checkout/confirm", routes)).toBeUndefined();
    expect(suggestStatusRoute("/", routes)).toBeUndefined();
    expect(suggestStatusRoute("/h", [{ href: "/", label: "Home" }])).toBeUndefined();
    expect(suggestStatusRoute("/docs", [])).toBeUndefined();
  });
});

describe("renderStatusPageHtml", () => {
  test("escapes text and route data", () => {
    const html = renderStatusPageHtml({
      title: "<b>Gone</b>",
      next: [{ href: "/a?x=1&y=2", label: "A & B", description: "\"quoted\"" }],
      routes: [{ href: "/docs", label: "It's <docs>" }],
    });
    expect(html).toContain("&lt;b&gt;Gone&lt;/b&gt;");
    expect(html).toContain('href="/a?x=1&amp;y=2"');
    expect(html).toContain("A &amp; B");
    expect(html).toContain("&quot;quoted&quot;");
    expect(html).toContain('data-hraness-status-routes="[[&quot;/docs&quot;,&quot;It&#x27;s &lt;docs&gt;&quot;]]"');
    expect(html).not.toContain("<b>");
  });

  test("renders only what the site supplies", () => {
    const bare = renderStatusPageHtml();
    expect(bare).toStartWith('<main class="hraness-status-page" data-kind="not-found">');
    expect(bare).not.toContain("hraness-status-page__next");
    expect(bare).not.toContain("hraness-status-page__agent");
    expect(bare).not.toContain("data-hraness-status-routes");
    const error = renderStatusPageHtml({ kind: "error", rootElement: "div", titleLevel: 2, routes });
    expect(error).toStartWith('<div class="hraness-status-page" data-kind="error">');
    expect(error).toContain('<h2 class="hraness-status-page__title">');
    expect(error).not.toContain("hraness-status-page__hint");
  });
});
