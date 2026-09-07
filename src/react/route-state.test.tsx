import { expect, test } from "bun:test";
import * as stylex from "@stylexjs/stylex";
import { renderToStaticMarkup } from "react-dom/server";

import {
  RouteErrorPage,
  RouteLoadingPage,
  RouteNotFoundPage,
  type RouteNotFoundPageProps,
} from "./route-state";
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

test("RouteNotFoundPage preserves its main landmark and opt-in header composition", () => {
  const defaultHtml = renderToStaticMarkup(<RouteNotFoundPage />);
  const optedInHtml = renderToStaticMarkup(
    <RouteNotFoundPage canvasAs="div" showThemeToggle titleAs="h2" />,
  );

  expect(defaultHtml).toStartWith("<main ");
  expect(defaultHtml).not.toContain("hraness-design-route-state__header");
  expect(defaultHtml).toContain("Page not found");
  expect(defaultHtml).toContain('href="/"');
  expectRecipeSuffix(
    defaultHtml,
    "hraness-design-route-state",
    routeStateStyles.root,
  );
  expectRecipeSuffix(
    defaultHtml,
    "hraness-design-route-state__content",
    routeStateStyles.content,
  );

  expect(optedInHtml).toStartWith("<div ");
  expect(optedInHtml).toContain("<h2");
  expect(optedInHtml).toContain('data-presentation="menu"');
  expectRecipeSuffix(
    optedInHtml,
    "hraness-design-route-state__header",
    routeStateStyles.header,
  );
});

test("RouteErrorPage preserves announcement, focus, actions, and StyleX slots", () => {
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
    />,
  );

  expect(html).toContain('aria-label="This view could not load"');
  expect(html).toContain('aria-live="assertive"');
  expect(html).toContain('tabindex="-1"');
  expect(html).toContain("Try again");
  expect(html).toContain("Return home");
  expectRecipeSuffix(
    html,
    "hraness-design-route-state",
    routeStateStyles.root,
  );
  expectRecipeSuffix(
    html,
    "hraness-design-route-state__header",
    routeStateStyles.header,
  );
  expectRecipeSuffix(
    html,
    "hraness-design-route-state__content",
    routeStateStyles.content,
  );
  expectRecipeSuffix(
    html,
    "hraness-design-route-state__actions",
    routeStateStyles.row,
  );
  expect(inertHtml).not.toContain('aria-live="assertive"');
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

test("Route states own logical presentation in StyleX rather than legacy CSS", async () => {
  const [components, recipe] = await Promise.all([
    Bun.file(new URL("../components.css", import.meta.url)).text(),
    Bun.file(new URL("./route-state.stylex.ts", import.meta.url)).text(),
  ]);

  expect(components).not.toContain(".hraness-design-route-state");
  expect(recipe).toContain('"min-block-size": "100%"');
  expect(recipe).toContain('"min-inline-size": 0');
  expect(recipe).toContain('"inline-size": "min(100%, 36rem)"');
  expect(recipe).not.toMatch(/\b(?:height|minHeight|minWidth|width)\b/u);
});
