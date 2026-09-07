import { expect, test } from "bun:test";
import * as stylex from "@stylexjs/stylex";
import { isValidElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  NavigationRail,
  RailItem,
  type RailItemProps,
  RailSection,
} from "./navigation-rail";
import { navigationRailStyles } from "./navigation-rail.stylex";

const consumerStyles = stylex.create({
  item: {
    backgroundColor: "purple",
    color: "white",
  },
});

const validItemProps: RailItemProps = {
  href: "/library",
  label: "Library",
};
const itemWithTypedXstyle: RailItemProps = {
  ...validItemProps,
  xstyle: consumerStyles.item,
};
const itemWithRawXstyle: RailItemProps = {
  ...validItemProps,
  // @ts-expect-error RailItem accepts compiled StyleX recipes rather than raw CSS objects.
  xstyle: { color: "red" },
};
void [itemWithRawXstyle, itemWithTypedXstyle];

type RailItemElementProps = Readonly<{
  "aria-current"?: unknown;
  className?: unknown;
  href?: unknown;
  style?: unknown;
  xstyle?: unknown;
}>;

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

function railItemElement(props: RailItemProps) {
  const element = RailItem(props);
  if (!isValidElement<RailItemElementProps>(element)) {
    throw new Error("RailItem did not return its shared Link boundary.");
  }
  return element;
}

test("NavigationRail and RailSection preserve semantic landmarks, slots, and atomic presentation", () => {
  const html = renderToStaticMarkup(
    <NavigationRail
      aria-label="Workspace"
      className="consumer-rail"
      footer={<span>Footer</span>}
      header={<span>Header</span>}
    >
      <RailSection className="consumer-section" title="Browse" titleAs="h3">
        <RailItem href="/library" label="Library" />
      </RailSection>
    </NavigationRail>,
  );

  expect(classTokens(html, "hraness-design-navigation-rail")).toEqual([
    "hraness-design-navigation-rail",
    ...atomicTokens(navigationRailStyles.rail),
    "consumer-rail",
  ]);
  expect(classTokens(html, "hraness-design-navigation-rail__header")).toEqual([
    "hraness-design-navigation-rail__header",
    ...atomicTokens(navigationRailStyles.railEdge),
  ]);
  expect(classTokens(html, "hraness-design-navigation-rail__navigation")).toEqual([
    "hraness-design-navigation-rail__navigation",
    ...atomicTokens(navigationRailStyles.navigation),
  ]);
  expect(classTokens(html, "hraness-design-navigation-rail__footer")).toEqual([
    "hraness-design-navigation-rail__footer",
    ...atomicTokens(navigationRailStyles.railEdge),
  ]);
  expect(classTokens(html, "hraness-design-rail-section")).toEqual([
    "hraness-design-rail-section",
    ...atomicTokens(navigationRailStyles.section),
    "consumer-section",
  ]);
  expect(classTokens(html, "hraness-design-rail-section__title")).toEqual([
    "hraness-design-rail-section__title",
    ...atomicTokens(navigationRailStyles.sectionTitle),
  ]);
  expect(classTokens(html, "hraness-design-rail-section__items")).toEqual([
    "hraness-design-rail-section__items",
    ...atomicTokens(navigationRailStyles.sectionItems),
  ]);
  expect(html).toMatch(/^<aside[^>]*aria-label="Workspace"/u);
  expect(html).toMatch(/<nav[^>]*aria-label="Workspace"/u);
  expect(html).toContain("<h3");
  expect(html).toContain(">Browse</h3>");
  expect(html.indexOf("Header")).toBeLessThan(html.indexOf("Browse"));
  expect(html.indexOf("Browse")).toBeLessThan(html.indexOf("Footer"));
});

test("RailItem composes its recipe before caller StyleX and preserves Link props", () => {
  const style = { opacity: 0.5 } as const;
  const element = railItemElement({
    ...validItemProps,
    className: "consumer-item",
    isActive: true,
    style,
    xstyle: consumerStyles.item,
  });

  expect(element.props.href).toBe("/library");
  expect(element.props["aria-current"]).toBe("page");
  expect(element.props.className).toBe(
    "hraness-design-rail-item consumer-item",
  );
  expect(element.props.style).toBe(style);
  expect(element.props.xstyle).toEqual([
    navigationRailStyles.item,
    navigationRailStyles.itemNativeInteractionFallbacks,
    navigationRailStyles.itemActive,
    consumerStyles.item,
  ]);
});

test("RailItem retains data-state and native interaction fallbacks while active hover wins", async () => {
  const [component, components, recipe] = await Promise.all([
    Bun.file(new URL("./navigation-rail.tsx", import.meta.url)).text(),
    Bun.file(new URL("../components.css", import.meta.url)).text(),
    Bun.file(new URL("./navigation-rail.stylex.ts", import.meta.url)).text(),
  ]);
  const resolvedActive = atomicTokens(
    navigationRailStyles.item,
    navigationRailStyles.itemNativeInteractionFallbacks,
    navigationRailStyles.itemActive,
  );
  const activeRecipe = atomicTokens(navigationRailStyles.itemActive);

  expect(recipe).toContain(
    'const hovered = ":is([data-hovered], :hover)";',
  );
  expect(recipe).toContain(
    'const focusVisible = ":is([data-focus-visible], :focus-visible)";',
  );
  expect(recipe.match(/\[hovered\]/gu)).toHaveLength(18);
  expect(recipe.match(/\[focusVisible\]/gu)).toHaveLength(4);
  expect(recipe).toContain('backgroundColor: "var(--surface)"');
  for (const property of [
    "backgroundAttachment", "backgroundClip", "backgroundImage",
    "backgroundOrigin", "backgroundPosition", "backgroundRepeat", "backgroundSize",
  ]) {
    expect(recipe).toContain(property + ': { default: null, [hovered]:');
    expect(recipe).toMatch(new RegExp(property + ': "[^"]+"', "u"));
  }
  expect(recipe).not.toMatch(/\bbackground\s*:/u);
  expect(components).not.toContain(".hraness-design-navigation-rail");
  expect(components).not.toContain(".hraness-design-rail-section");
  expect(components).not.toContain(".hraness-design-rail-item");
  expect(component.indexOf("navigationRailStyles.itemNativeInteractionFallbacks"))
    .toBeLessThan(component.indexOf("isActive && navigationRailStyles.itemActive"));
  for (const token of activeRecipe) expect(resolvedActive).toContain(token);
  expect(
    stylex.props(
      navigationRailStyles.itemActive,
      navigationRailStyles.itemNativeInteractionFallbacks,
    ).className,
  ).not.toBe(stylex.props(
    navigationRailStyles.itemNativeInteractionFallbacks,
    navigationRailStyles.itemActive,
  ).className);
});

test("RailItem keeps stable child hooks and active destination semantics", () => {
  const html = renderToStaticMarkup(
    <RailItem
      badge="3"
      description="Saved references"
      href="/library"
      icon="L"
      isActive
      label="Library"
    />,
  );

  expect(html).toContain("hraness-design-rail-item");
  expect(html).toContain('aria-current="page"');
  for (const stableClass of [
    "hraness-design-rail-item__icon",
    "hraness-design-rail-item__copy",
    "hraness-design-rail-item__label",
    "hraness-design-rail-item__description",
    "hraness-design-rail-item__badge",
  ]) {
    expect(html).toContain(stableClass);
  }
  expect(html.indexOf("hraness-design-rail-item__icon"))
    .toBeLessThan(html.indexOf("hraness-design-rail-item__copy"));
  expect(html.indexOf("hraness-design-rail-item__copy"))
    .toBeLessThan(html.indexOf("hraness-design-rail-item__badge"));
  expect(html).not.toContain("style=");
});
