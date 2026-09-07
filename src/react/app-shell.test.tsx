import { expect, test } from "bun:test";
import * as stylex from "@stylexjs/stylex";
import { renderToStaticMarkup } from "react-dom/server";

import { AppShell, type AppShellProps } from "./app-shell";
import { appShellStyles } from "./app-shell.stylex";

const validProps: AppShellProps = {
  children: "Page",
  rail: "Rail",
};

// @ts-expect-error AppShell intentionally exposes no public xstyle seam.
const propsWithXstyle: AppShellProps = { ...validProps, xstyle: {} };
void propsWithXstyle;

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

test("AppShell preserves its stable slots and composes atomic presentation before the caller class", () => {
  const html = renderToStaticMarkup(
    <AppShell
      bottomBar={<span>Bottom</span>}
      className="consumer-shell"
      mobileNavigationLabel="Workspace navigation"
      openNavigationLabel="Open workspace navigation"
      rail={<nav>Rail</nav>}
      topBar={<header>Top</header>}
    >
      <main>Page</main>
    </AppShell>,
  );

  expect(classTokens(html, "hraness-design-app-shell")).toEqual([
    "hraness-design-app-shell",
    ...atomicTokens(appShellStyles.root),
    "consumer-shell",
  ]);
  for (const [stableClass, recipe] of [
    ["hraness-design-app-shell__top", appShellStyles.top],
    ["hraness-design-app-shell__rail", appShellStyles.rail],
    ["hraness-design-app-shell__mobile-trigger", appShellStyles.mobileTrigger],
    ["hraness-design-app-shell__page", appShellStyles.page],
    ["hraness-design-app-shell__bottom", appShellStyles.bottom],
  ] as const) {
    expect(classTokens(html, stableClass)).toEqual([
      stableClass,
      ...atomicTokens(recipe),
    ]);
  }
  expect(html).toContain("Top");
  expect(html).toContain("Rail");
  expect(html).toContain("Page");
  expect(html).toContain("Bottom");
  expect(html).toContain('aria-label="Open workspace navigation"');
  expect(html).not.toContain("style=");
});

test("AppShell keeps undefined-only bottom-slot omission", () => {
  const omitted = renderToStaticMarkup(<AppShell {...validProps} />);
  const explicitNull = renderToStaticMarkup(
    <AppShell {...validProps} bottomBar={null} />,
  );

  expect(omitted).not.toContain("hraness-design-app-shell__bottom");
  expect(explicitNull).toContain("hraness-design-app-shell__bottom");
  expect(omitted).toContain("hraness-design-app-shell__top");
  expect(omitted).toContain("hraness-design-app-shell__rail");
  expect(omitted).toContain("hraness-design-app-shell__page");
});

test("AppShell keeps compact and forced-color presentation in its logical StyleX recipe", async () => {
  const [components, recipe] = await Promise.all([
    Bun.file(new URL("../components.css", import.meta.url)).text(),
    Bun.file(new URL("./app-shell.stylex.ts", import.meta.url)).text(),
  ]);

  expect(components).not.toContain(".hraness-design-app-shell");
  expect(recipe).toContain('const compactViewport = "@media (max-width: 48rem)";');
  expect(recipe).toContain('const forcedColors = "@media (forced-colors: active)";');
  expect(recipe).toContain('backgroundColor: "var(--background)"');
  for (const property of [
    "backgroundAttachment", "backgroundClip", "backgroundImage",
    "backgroundOrigin", "backgroundPosition", "backgroundRepeat", "backgroundSize",
  ]) {
    expect(recipe).toContain(property + ': { default: null, [forcedColors]:');
    expect(recipe).toMatch(new RegExp(property + ': "[^"]+"', "u"));
  }
  expect(recipe).toContain('"border-inline-end-color"');
  expect(recipe).toContain('"min-inline-size"');
  expect(recipe).toContain('"min-block-size"');
  expect(recipe).not.toMatch(/\b(?:background|borderRight|minHeight|minWidth)\s*:/u);
});
