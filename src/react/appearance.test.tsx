import { expect, test } from "bun:test";
import * as stylex from "@stylexjs/stylex";
import { parseHTML } from "linkedom";
import { runInNewContext } from "node:vm";
import { renderToStaticMarkup } from "react-dom/server";

import { colors } from "../index";
import { useDesignPortalTheme } from "./design-theme-context";
import { GlobalErrorDocument, RouteErrorPage, RouteNotFoundPage } from "./route-state";
import {
  defaultDesignTheme,
  DesignThemeProvider,
  normalizeDesignTheme,
  themeColorFor,
  themeToggleItems,
  ThemeMenuButton,
  ThemeToggle,
} from "./theme";
import { themeStyles } from "./theme.stylex";

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

function PortalThemeProbe() {
  const theme = useDesignPortalTheme();
  return <span data-portal-theme={theme}>Portal theme</span>;
}

test("appearance choices are complete, ordered, and labelable", () => {
  expect(themeToggleItems()).toEqual([
    { id: "light", label: "Light" },
    { id: "dark", label: "Dark" },
    { id: "system", label: "System" },
  ]);
  expect(themeToggleItems({ system: "Device" })).toEqual([
    { id: "light", label: "Light" },
    { id: "dark", label: "Dark" },
    { id: "system", label: "Device" },
  ]);
});

test("missing and invalid persisted appearance values fall back to system", () => {
  expect(defaultDesignTheme).toBe("system");
  expect(normalizeDesignTheme(undefined)).toBe("system");
  expect(normalizeDesignTheme(null)).toBe("system");
  expect(normalizeDesignTheme("sepia")).toBe("system");
  expect(normalizeDesignTheme({ theme: "dark" })).toBe("system");
  expect(normalizeDesignTheme("light")).toBe("light");
  expect(normalizeDesignTheme("dark")).toBe("dark");
  expect(normalizeDesignTheme("system")).toBe("system");
});

test("theme color resolution is dark only for a resolved dark appearance", () => {
  const values = { dark: "#111111", light: "#fafafa" } as const;
  expect(themeColorFor("dark", values)).toBe(values.dark);
  expect(themeColorFor("light", values)).toBe(values.light);
  expect(themeColorFor("system", values)).toBe(values.light);
  expect(themeColorFor(undefined, values)).toBe(values.light);
});

test("the provider and default toggle server-render the canonical system-first menu button", () => {
  const html = renderToStaticMarkup(
    <DesignThemeProvider>
      <ThemeToggle />
    </DesignThemeProvider>,
  );

  expect(html).toContain("hraness-design-theme-v1");
  expect(html).toContain('data-ready="false"');
  expect(html).toContain('data-display="icons"');
  expect(html).toContain('data-presentation="menu"');
  expect(html).toContain('data-hraness-theme-toggle-stylex=""');
  expect(html).toContain('data-theme-value="system"');
  expect(html).toContain('aria-label="Appearance: System"');
  expect(html.match(/data-slot="appearance-icon"/gu)).toHaveLength(1);
  expect(html).not.toContain('input type="radio"');
  expect(html).toContain('disabled=""');
  expect(classTokens(html, "hraness-design-theme-toggle")).toEqual([
    "hraness-design-theme-toggle",
    ...atomicTokens(
      themeStyles.root,
      themeStyles.menuRoot,
      themeStyles.notReady,
    ),
  ]);
  for (const token of atomicTokens(themeStyles.trigger)) {
    expect(classTokens(html, "hraness-design-theme-toggle__trigger"))
      .toContain(token);
  }
});

test("appearance labels remain available for explicit teaching surfaces", () => {
  const html = renderToStaticMarkup(
    <ThemeToggle
      display="labels"
      onChange={() => undefined}
      presentation="segmented"
      value="light"
    />,
  );

  expect(html).toContain('data-display="labels"');
  expect(html).toContain(">Light<");
  expect(html).toContain(">Dark<");
  expect(html).toContain(">System<");
});

test("the canonical menu button keeps persistent chrome to one named trigger", () => {
  const html = renderToStaticMarkup(
    <ThemeMenuButton
      aria-label="Site appearance"
      onChange={() => undefined}
      value="system"
    />,
  );

  expect(html).toContain('data-presentation="menu"');
  expect(html).toContain('data-display="icons"');
  expect(html).toContain('data-theme-value="system"');
  expect(html).toContain('aria-label="Site appearance: System"');
  expect(html.match(/data-slot="appearance-icon"/gu)).toHaveLength(1);
  expect(html).not.toContain('input type="radio"');
  expect(html).not.toContain('class="hraness-design-segmented-control');
});

test("a controlled theme toggle is hydration-stable and immediately operable", () => {
  const html = renderToStaticMarkup(
    <ThemeMenuButton
      className="consumer-theme-toggle"
      onChange={() => undefined}
      value="system"
    />,
  );

  expect(html).toContain('data-ready="true"');
  expect(html).toContain('data-theme-value="system"');
  expect(html).not.toContain('aria-busy="true"');
  expect(html).not.toContain('disabled=""');
  expect(html).toContain('aria-label="Appearance: System"');
  expect(classTokens(html, "hraness-design-theme-toggle")).toEqual([
    "hraness-design-theme-toggle",
    ...atomicTokens(themeStyles.root, themeStyles.menuRoot),
    "consumer-theme-toggle",
  ]);
});

test("the React menu owns every component recipe with portal-safe StyleX classes", async () => {
  const [component, recipe, staticFallback] = await Promise.all([
    Bun.file(new URL("./theme.tsx", import.meta.url)).text(),
    Bun.file(new URL("./theme.stylex.ts", import.meta.url)).text(),
    Bun.file(new URL("../appearance-menu.css", import.meta.url)).text(),
  ]);

  for (const ownedRecipe of [
    themeStyles.item,
    themeStyles.itemSelected,
    themeStyles.menu,
    themeStyles.menuRoot,
    themeStyles.notReady,
    themeStyles.popover,
    themeStyles.root,
    themeStyles.trigger,
  ]) {
    expect(atomicTokens(ownedRecipe).length).toBeGreaterThan(0);
  }
  expect(component).toContain('data-hraness-theme-toggle-stylex=""');
  expect(component).toContain("controlXstyle={themeStyles.trigger}");
  expect(component).toContain("popoverXstyle={themeStyles.popover}");
  expect(component).toContain("xstyle={themeStyles.menu}");
  expect(component).toContain("id === value && themeStyles.itemSelected");
  expect(recipe).toContain('const coarsePointer = "@media (pointer: coarse)";');
  expect(recipe).toContain('const forcedColors = "@media (forced-colors: active)";');
  expect(recipe).toContain('const reducedMotion = "@media (prefers-reduced-motion: reduce)";');
  for (const [property, value] of [
    ["backgroundAttachment", "scroll"], ["backgroundClip", "border-box"],
    ["backgroundImage", "none"], ["backgroundOrigin", "padding-box"],
    ["backgroundPosition", "0% 0%"], ["backgroundRepeat", "repeat"],
    ["backgroundSize", "auto auto"],
  ]) {
    expect(recipe).toContain(property + ': { default: "' + value + '", [hovered]: "' + value + '" }');
  }
  expect(recipe).not.toMatch(
    /\b(?:background|border|font|outline|padding|transition)\s*:/u,
  );
  expect(staticFallback).toContain("Framework-neutral fallback");
  expect(staticFallback).toStartWith(
    "@layer components.hraness-design-kit.legacy {",
  );
  expect(staticFallback).toContain("[data-hraness-appearance-menu]");
  expect(staticFallback).toContain(":not([data-hraness-theme-toggle-stylex])");
  expect(staticFallback).not.toMatch(
    /(?:^|\n)\.hraness-design-theme-toggle__(?:item|menu|popover|trigger)[^{]*\{/u,
  );
});

test("the appearance menu reapplies a scoped palette class at its portal boundary", async () => {
  const component = await Bun.file(
    new URL("./theme.tsx", import.meta.url),
  ).text();

  expect(component).toContain("useDesignPortalClassName,");
  expect(component).toContain("const portalClassName = useDesignPortalClassName();");
  expect(component).toMatch(
    /popoverClassName=\{cn\(\s*"hraness-design-theme-toggle__popover",\s*portalClassName,\s*\)\}/u,
  );
});

test("a selected appearance item retains its hover and focus recipe before forced-color overrides", async () => {
  const recipe = await Bun.file(
    new URL("./theme.stylex.ts", import.meta.url),
  ).text();
  const interactiveTokens = atomicTokens(themeStyles.item);
  const selectedInteractiveTokens = atomicTokens(
    themeStyles.item,
    themeStyles.itemSelected,
  );

  const item = recipe.slice(recipe.indexOf("  item: {"), recipe.indexOf("  itemSelected: {"));
  const selected = recipe.slice(recipe.indexOf("  itemSelected: {"), recipe.indexOf("  menu: {"));
  for (const block of [item, selected]) {
    expect(block.match(/\[itemFocusedOrHovered\]/gu)).toHaveLength(9);
    for (const [property, value] of [
      ["backgroundAttachment", "scroll"], ["backgroundClip", "border-box"],
      ["backgroundImage", "none"], ["backgroundOrigin", "padding-box"],
      ["backgroundPosition", "0% 0%"], ["backgroundRepeat", "repeat"],
      ["backgroundSize", "auto auto"],
    ]) {
      expect(block).toContain(`${property}: { default: null, [itemFocusedOrHovered]: "${value}"`);
      expect(selected).toContain(`[forcedColors]: "${value}"`);
    }
  }
  for (const token of interactiveTokens) {
    expect(selectedInteractiveTokens).toContain(token);
  }
});

test("route states defer to the product header and keep any opt-in menu inside a header", () => {
  const notFound = renderToStaticMarkup(<RouteNotFoundPage />);
  const error = renderToStaticMarkup(
    <RouteErrorPage
      announce={false}
      autoFocus={false}
      error={new Error("Boom")}
      reset={() => undefined}
    />,
  );
  const optedIn = renderToStaticMarkup(<RouteNotFoundPage showThemeToggle />);

  expect(notFound).not.toContain("hraness-design-theme-toggle");
  expect(error).not.toContain("hraness-design-theme-toggle");
  expect(optedIn).toContain("hraness-design-route-state__header");
  expect(optedIn).toContain('data-presentation="menu"');
});

test("a forced provider omits preference repair and system selection", () => {
  const html = renderToStaticMarkup(
    <DesignThemeProvider forcedTheme="dark">
      <PortalThemeProbe />
    </DesignThemeProvider>,
  );

  expect(html).toContain('data-portal-theme="dark"');
  expect(html).not.toContain('data-hraness-design-theme-guard=""');
  expect(html).not.toContain("hraness-design-theme-toggle");
});

test("the provider owns the Jelly repaint bridge for runtime appearance changes", async () => {
  const source = await Bun.file(new URL("./theme.tsx", import.meta.url)).text();

  expect(source).toContain('import { setJellyThemeMode } from "./jelly-runtime.js";');
  expect(source).toContain("void setJellyThemeMode(resolvedTheme);");
  expect(source).not.toContain('new CustomEvent("jelly-theme-change")');
  expect(source).toContain("<JellyThemeSync />");
});

test("the provider repairs invalid persisted values before next-themes resolves first paint", () => {
  const html = renderToStaticMarkup(
    <DesignThemeProvider storageKey="appearance-test-key">
      <span>Content</span>
    </DesignThemeProvider>,
  );
  const guard = /<script[^>]*data-hraness-design-theme-guard=""[^>]*>([\s\S]*?)<\/script>/u.exec(html)?.[1];
  expect(guard).toBeDefined();

  let value: string | null = "sepia";
  const localStorage = {
    getItem: (key: string) => key === "appearance-test-key" ? value : null,
    setItem: (key: string, next: string) => {
      if (key === "appearance-test-key") value = next;
    },
  };
  runInNewContext(guard ?? "", { localStorage });
  expect(value).toBe("system");

  for (const persisted of ["light", "dark", "system"] as const) {
    value = persisted;
    runInNewContext(guard ?? "", { localStorage });
    expect(value).toBe(persisted);
  }
});

test("the global error document is System-first with adaptive static browser metadata", () => {
  const html = renderToStaticMarkup(
    <GlobalErrorDocument
      diagnostics={<span>Diagnostic details</span>}
      error={new Error("Boom")}
      reset={() => undefined}
    />,
  );
  const { document } = parseHTML(`<!doctype html>${html}`);
  const themeColors = Array.from(
    document.head.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'),
  );

  expect(html).toContain('<html data-theme="light" lang="en">');
  expect(document.head.querySelector<HTMLMetaElement>('meta[name="color-scheme"]')?.content)
    .toBe("light dark");
  expect(themeColors.map((meta) => ({
    color: meta.content,
    media: meta.media,
  }))).toEqual([
    { color: colors.light.background, media: "(prefers-color-scheme: light)" },
    { color: colors.dark.background, media: "(prefers-color-scheme: dark)" },
  ]);
  expect(html.indexOf('name="theme-color"')).toBeLessThan(
    html.indexOf('data-hraness-design-theme-guard=""'),
  );
  expect(html).toContain('data-hraness-design-theme-guard=""');
  expect(html).toContain("hraness-design-theme-v1");
  expect(html).toContain("Diagnostic details");
  expect(html).not.toContain("Appearance:");
  expect(html).not.toContain("data-hraness-appearance-menu");
  expect(html).not.toContain("hraness-design-theme-toggle");
});

test("the global error document repairs invalid storage and leaves a missing preference to System", () => {
  const html = renderToStaticMarkup(
    <GlobalErrorDocument error={new Error("Boom")} reset={() => undefined} />,
  );
  const guard = /<script[^>]*data-hraness-design-theme-guard=""[^>]*>([\s\S]*?)<\/script>/u
    .exec(html)?.[1];
  expect(guard).toBeDefined();

  for (const initial of [null, "sepia"] as const) {
    let value: string | null = initial;
    const localStorage = {
      getItem: () => value,
      setItem: (_key: string, next: string) => {
        value = next;
      },
    };
    runInNewContext(guard ?? "", { localStorage });
    expect(value).toBe(initial === null ? null : "system");
  }
});

test("the global error document uses one fixed matching metadata pair for explicit themes", () => {
  for (const scenario of [
    { color: "#f4efe7", theme: "light" },
    { color: "#101419", theme: "dark" },
  ] as const) {
    const html = renderToStaticMarkup(
      <GlobalErrorDocument
        darkColor="#101419"
        error={new Error("Boom")}
        lightColor="#f4efe7"
        reset={() => undefined}
        theme={scenario.theme}
      />,
    );
    const { document } = parseHTML(`<!doctype html>${html}`);
    const themeColors = Array.from(
      document.head.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'),
    );

    expect(html).toContain(`<html data-theme="${scenario.theme}" lang="en">`);
    expect(document.head.querySelector<HTMLMetaElement>('meta[name="color-scheme"]')?.content)
      .toBe(scenario.theme);
    expect(themeColors).toHaveLength(1);
    expect(themeColors[0]?.content).toBe(scenario.color);
    expect(themeColors[0]?.hasAttribute("media")).toBe(false);
    expect(html).not.toContain('data-hraness-design-theme-guard=""');
    expect(html).not.toContain("hraness-design-theme-toggle");
  }
});

test("the global error document accepts product colors for adaptive head metadata", () => {
  const html = renderToStaticMarkup(
    <GlobalErrorDocument
      darkColor="#101419"
      error={new Error("Boom")}
      lightColor="#f4efe7"
      reset={() => undefined}
    />,
  );

  expect(html).toContain('content="#f4efe7" media="(prefers-color-scheme: light)"');
  expect(html).toContain('content="#101419" media="(prefers-color-scheme: dark)"');
});

test("theme color synchronization waits for a concrete resolved appearance", async () => {
  const source = await Bun.file(new URL("./theme.tsx", import.meta.url)).text();

  expect(source).toContain(
    'resolvedTheme === "light" || resolvedTheme === "dark"',
  );
  expect(source).toContain('metaName !== "theme-color" && palette.ready ? palette.background : undefined');
  expect(source).toContain("if (!hasResolvedColor || latestColor.current === undefined) return;");
  expect(source).toContain("acquireThemeColorMeta(");
});
