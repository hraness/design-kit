import { expect, test } from "bun:test";
import * as stylex from "@stylexjs/stylex";
import { renderToStaticMarkup } from "react-dom/server";

import {
  RouteErrorPage,
  RouteLoadingPage,
  RouteNotFoundPage,
  StatusPage,
  type RouteNotFoundPageProps,
} from "./route-state";
import { renderStatusPageHtml } from "../status-page-html";
import { routeStateStyles } from "./route-state.stylex";

const validNotFoundProps: RouteNotFoundPageProps = {};
const notFoundWithXstyle: RouteNotFoundPageProps = {
  ...validNotFoundProps,
  // @ts-expect-error RouteNotFoundPage intentionally exposes no public xstyle seam.
  xstyle: {},
};
void notFoundWithXstyle;

function classTokens(markup: string, stableClass: string): readonly string[] {
  const classValue = [...markup.matchAll(/class="([^"]+)"/gu)]
    .map((match) => match[1] ?? "")
    .find((value) => value.split(" ").includes(stableClass));
  if (classValue === undefined) throw new Error(`Missing ${stableClass} class hook.`);
  return classValue.split(" ").filter(Boolean);
}

function atomicTokens(...styles: readonly stylex.CompiledStyles[]): readonly string[] {
  return stylex.props(...styles).className?.split(" ").filter(Boolean) ?? [];
}

function expectRecipeSuffix(
  markup: string,
  stableClass: string,
  recipe: stylex.CompiledStyles,
) {
  const tokens = classTokens(markup, stableClass);
  const stableIndex = tokens.indexOf(stableClass);
  expect(tokens.slice(stableIndex)).toEqual([
    stableClass,
    ...atomicTokens(recipe),
  ]);
}

test("RouteNotFoundPage renders the shared status page with its opt-in header", () => {
  const defaultHtml = renderToStaticMarkup(<RouteNotFoundPage />);
  const optedInHtml = renderToStaticMarkup(
    <RouteNotFoundPage canvasAs="div" showThemeToggle titleAs="h2" />,
  );

  expect(defaultHtml).toBe(renderStatusPageHtml());
  expect(defaultHtml).toContain("We can’t find that page");
  expect(defaultHtml).toContain('href="/"');

  expect(optedInHtml).toStartWith('<div class="hraness-status-page"');
  expect(optedInHtml).toContain('<h2 class="hraness-status-page__title">');
  expect(optedInHtml).toContain('data-presentation="menu"');
  expectRecipeSuffix(
    optedInHtml,
    "hraness-design-route-state__header",
    routeStateStyles.header,
  );
});

test("StatusPage and the static renderer emit the same markup", () => {
  const content = {
    agentIndexHref: "/llms.txt",
    next: [
      { description: "Save pages & cite them.", href: "/product", label: "How it works" },
      { href: "/docs", label: "Docs" },
    ],
    nextHeading: "Start with",
    primaryAction: { href: "/start", label: "Start your library" },
    routes: [{ href: "/docs/getting-started", label: "Getting <started>" }],
    siteName: "Sponge",
  } as const;
  expect(renderToStaticMarkup(<StatusPage {...content} titleAs="h3" />))
    .toBe(renderStatusPageHtml({ ...content, titleLevel: 3 }));
  expect(renderToStaticMarkup(<StatusPage {...content} canvasAs="div" />))
    .toBe(renderStatusPageHtml({ ...content, rootElement: "div" }));
});

test("RouteErrorPage preserves announcement, focus, and retry actions", () => {
  const html = renderToStaticMarkup(
    <RouteErrorPage
      error={new Error("Boom")}
      reset={() => undefined}
      showThemeToggle
    />,
  );
  const inertHtml = renderToStaticMarkup(
    <RouteErrorPage
      announce={false}
      autoFocus={false}
      error={new Error("Preview")}
      reset={() => undefined}
      siteName="Sponge"
    />,
  );

  expect(html).toContain('aria-label="This view could not load"');
  expect(html).toContain('aria-live="assertive"');
  expect(html).toContain('tabindex="-1"');
  expect(html).toContain('data-kind="error"');
  expect(html).toMatch(/<button class="hraness-status-page__action hraness-foil" data-emphasis="primary" data-foil="" type="button">Try again<\/button>/u);
  expect(html).toContain("Return home");
  expect(html).not.toContain("hraness-status-page__hint");
  expectRecipeSuffix(
    html,
    "hraness-design-route-state__header",
    routeStateStyles.header,
  );
  expect(inertHtml).not.toContain('aria-live="assertive"');
  expect(inertHtml).toContain("Go to Sponge");
});

test("RouteLoadingPage preserves busy and inert semantics with atomic loading slots", () => {
  const html = renderToStaticMarkup(<RouteLoadingPage />);
  const inertHtml = renderToStaticMarkup(
    <RouteLoadingPage announce={false} canvasAs="div" />,
  );

  expect(html).toContain('aria-busy="true"');
  expect(html).toContain('role="status"');
  expect(html).toContain("Loading page");
  expectRecipeSuffix(
    html,
    "hraness-design-route-state",
    routeStateStyles.root,
  );
  expectRecipeSuffix(
    html,
    "hraness-design-route-state__loading",
    routeStateStyles.loading,
  );
  expectRecipeSuffix(
    html,
    "hraness-design-route-state__loading-title",
    routeStateStyles.row,
  );
  expectRecipeSuffix(
    html,
    "hraness-design-route-state__skeletons",
    routeStateStyles.skeletons,
  );
  expect(inertHtml).toStartWith("<div ");
  expect(inertHtml).not.toContain('aria-busy="true"');
  expect(inertHtml).not.toContain('role="status"');
});

test("Route states keep the loading layout in StyleX and status pages in the shared stylesheet", async () => {
  const [components, recipe, statusCss] = await Promise.all([
    Bun.file(new URL("../components.css", import.meta.url)).text(),
    Bun.file(new URL("./route-state.stylex.ts", import.meta.url)).text(),
    Bun.file(new URL("../status-page.css", import.meta.url)).text(),
  ]);

  expect(components).not.toContain(".hraness-design-route-state");
  expect(recipe).toContain('"min-inline-size": 0');
  expect(recipe).toContain('"inline-size": "min(100%, 36rem)"');
  expect(recipe).not.toMatch(/\b(?:height|minHeight|minWidth|width)\b/u);
  expect(statusCss.trimStart()).toMatch(/^\/\*\*[\s\S]*?\*\/\s*@layer components\.hraness-design-kit\.legacy \{/u);
  expect(statusCss).toContain("@media (forced-colors: active)");
  expect(statusCss).toContain("@media (prefers-reduced-motion: reduce)");
});
