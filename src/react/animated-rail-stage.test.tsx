import { expect, test } from "bun:test";
import * as stylex from "@stylexjs/stylex";
import { renderToStaticMarkup } from "react-dom/server";

import {
  AnimatedRailStage,
  type AnimatedRailStageProps,
  railStageMotion,
} from "./animated-rail-stage";
import { animatedRailStageStyles } from "./animated-rail-stage.stylex";

const validProps: AnimatedRailStageProps = {
  children: "Detail",
  className: "consumer-stage",
  stageKey: "/workspace/detail",
};

// @ts-expect-error AnimatedRailStage intentionally exposes no public xstyle seam.
const propsWithXstyle: AnimatedRailStageProps = { ...validProps, xstyle: {} };
void propsWithXstyle;

test("rail stages enter and exit in opposite directions at the shared duration", () => {
  expect(railStageMotion(false)).toEqual({
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 },
    initial: { opacity: 0, x: 14 },
    transition: { duration: 0.18, ease: "easeOut" },
  });
});

test("reduced motion removes translation and transition time without hiding content", () => {
  expect(railStageMotion(true)).toEqual({
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 0 },
    initial: { opacity: 1, x: 0 },
    transition: { duration: 0, ease: "easeOut" },
  });
});

test("AnimatedRailStage keeps its stable hook, atomic recipe, caller class, and route identity", () => {
  const html = renderToStaticMarkup(<AnimatedRailStage {...validProps} />);
  const expectedAtomicClasses = stylex.props(animatedRailStageStyles.root)
    .className?.split(" ").filter(Boolean) ?? [];
  const renderedClasses = /class="([^"]+)"/u.exec(html)?.[1]?.split(" ").filter(Boolean);

  expect(renderedClasses).toEqual([
    "hraness-design-animated-rail-stage",
    ...expectedAtomicClasses,
    "consumer-stage",
  ]);
  expect(html).toContain('data-stage-key="/workspace/detail"');
  expect(html).toContain('style="opacity:1;transform:none"');
  expect(html).toEndWith(">Detail</div>");
});

test("AnimatedRailStage keeps wait-mode keyed presence semantics", async () => {
  const source = await Bun.file(new URL("./animated-rail-stage.tsx", import.meta.url)).text();

  expect(source).toContain('<AnimatePresence initial={false} mode="wait">');
  expect(source).toContain("key={stageKey}");
  expect(source).toContain("initial={stageMotion.initial}");
  expect(source).toContain("exit={stageMotion.exit}");
});

test("AnimatedRailStage owns its logical minimum and reduced-motion fallback in StyleX", async () => {
  const [components, recipe] = await Promise.all([
    Bun.file(new URL("../components.css", import.meta.url)).text(),
    Bun.file(new URL("./animated-rail-stage.stylex.ts", import.meta.url)).text(),
  ]);

  expect(components).not.toContain(".hraness-design-animated-rail-stage");
  expect(recipe).toContain('"min-inline-size": 0');
  expect(recipe).toContain('"@media (prefers-reduced-motion: reduce)": "none !important"');
  expect(recipe.match(/"none !important"/gu)).toHaveLength(2);
});
