import { expect, test } from "bun:test";
import * as stylex from "@stylexjs/stylex";
import {
  Children,
  createRef,
  isValidElement,
  type ReactNode,
} from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SliderFill, SliderThumb, SliderTrack } from "react-aria-components";

import { Fader } from "./fader";
import { faderStyles } from "./fader.stylex";

function tagWithClass(html: string, stableClass: string): string {
  const markerIndex = html.indexOf(stableClass);
  if (markerIndex < 0) throw new Error(`Rendered markup has no ${stableClass} class`);
  const start = html.lastIndexOf("<", markerIndex);
  const end = html.indexOf(">", markerIndex);
  if (start < 0 || end < 0) throw new Error(`Rendered ${stableClass} tag is incomplete`);
  return html.slice(start, end + 1);
}

function classesFor(html: string, stableClass: string): string[] {
  const className = tagWithClass(html, stableClass).match(/class="([^"]+)"/u)?.[1];
  if (className === undefined) throw new Error(`Rendered ${stableClass} has no class`);
  return className.split(" ").filter(Boolean);
}

test("Fader preserves slider semantics, public hooks, and native caller props", () => {
  const html = renderToStaticMarkup(
    <Fader
      aria-label="Gain control"
      className="consumer-fader"
      data-consumer="mixer"
      density="compact"
      id="gain"
      label="Gain"
      maxValue={100}
      minValue={0}
      orientation="vertical"
      showLabel
      showOutput
      style={{ color: "red" }}
      value={64}
    />,
  );
  const root = tagWithClass(html, "hraness-design-fader");
  const rootClasses = classesFor(html, "hraness-design-fader");
  const track = tagWithClass(html, "hraness-design-fader__track");
  const thumb = tagWithClass(html, "hraness-design-fader__thumb");

  expect(root).toStartWith("<div");
  expect(root).toContain('aria-label="Gain control"');
  expect(root).toContain('data-consumer="mixer"');
  expect(root).toContain('data-density="compact"');
  expect(root).toContain('data-orientation="vertical"');
  expect(root).toContain('id="gain"');
  expect(root).toContain('role="group"');
  expect(root).toContain('style="color:red"');
  expect(rootClasses[0]).toBe("hraness-design-fader");
  expect(rootClasses.at(-1)).toBe("consumer-fader");
  expect(rootClasses.length).toBeGreaterThan(6);
  expect(track).toContain('data-orientation="vertical"');
  expect(track).toContain("style=");
  expect(thumb).toContain("style=");
  expect(html).toContain('class="hraness-design-fader__label ');
  expect(html).toContain('class="hraness-design-fader__output ');
  expect(html).toContain('type="range"');
  expect(html).toContain('aria-orientation="vertical"');
  expect(html).toContain('value="64"');
  expect(html).toContain(
    'aria-hidden="true" class="hraness-design-fader__track-rail ',
  );
  expect(html).toContain(
    'aria-hidden="true" class="hraness-design-fader__fill-rail ',
  );
  expect(classesFor(html, "hraness-design-fader__track-rail").length)
    .toBeGreaterThan(5);
  expect(classesFor(html, "hraness-design-fader__fill-rail").length)
    .toBeGreaterThan(6);
});

test("Fader keeps its finite density, orientation, label, and output variants", () => {
  const variants = (["compact", "default"] as const).flatMap((density) =>
    (["horizontal", "vertical"] as const).map((orientation) => {
      const html = renderToStaticMarkup(
        <Fader
          className="consumer-fader"
          density={density}
          label={`${density} ${orientation}`}
          orientation={orientation}
          value={50}
        />,
      );
      const root = tagWithClass(html, "hraness-design-fader");
      const rootClasses = classesFor(html, "hraness-design-fader");
      const trackClasses = classesFor(html, "hraness-design-fader__track");

      expect(root).toContain(`data-density="${density}"`);
      expect(root).toContain(`data-orientation="${orientation}"`);
      expect(rootClasses[0]).toBe("hraness-design-fader");
      expect(rootClasses.at(-1)).toBe("consumer-fader");
      expect(trackClasses[0]).toBe("hraness-design-fader__track");
      expect(html).toContain("hraness-design-visually-hidden");
      expect(html).not.toContain("hraness-design-fader__output");
      return { density, orientation, rootClasses, trackClasses };
    })
  );

  const compactVertical = variants.find(
    ({ density, orientation }) => density === "compact" && orientation === "vertical",
  );
  const defaultVertical = variants.find(
    ({ density, orientation }) => density === "default" && orientation === "vertical",
  );
  const defaultHorizontal = variants.find(
    ({ density, orientation }) => density === "default" && orientation === "horizontal",
  );
  if (
    compactVertical === undefined
    || defaultVertical === undefined
    || defaultHorizontal === undefined
  ) {
    throw new Error("The Fader variant matrix is incomplete");
  }

  expect(compactVertical.rootClasses).not.toEqual(defaultVertical.rootClasses);
  expect(defaultHorizontal.rootClasses).not.toEqual(defaultVertical.rootClasses);
  expect(defaultHorizontal.trackClasses).not.toEqual(defaultVertical.trackClasses);
});

test("Fader keeps refs and applies focus presentation from React Aria state", () => {
  const faderRef = createRef<HTMLDivElement>();
  const inputRef = createRef<HTMLInputElement>();
  const root = Fader({
    className: "consumer-fader",
    density: "compact",
    faderRef,
    inputRef,
    label: "Gain",
    orientation: "horizontal",
    style: { color: "red" },
  });
  if (!isValidElement<Record<string, unknown> & { readonly children?: ReactNode }>(root)) {
    throw new Error("Fader did not return its React Aria slider root");
  }
  const rootClasses = String(root.props.className).split(" ").filter(Boolean);
  const expectedRootClasses = stylex.props(
    faderStyles.root,
    faderStyles.compact,
    faderStyles.horizontalRoot,
  ).className?.split(" ").filter(Boolean) ?? [];
  expect(root.props.ref).toBe(faderRef);
  expect(root.props.orientation).toBe("horizontal");
  expect(root.props["data-density"]).toBe("compact");
  expect(root.props.style).toEqual({ color: "red" });
  expect(rootClasses).toEqual([
    "hraness-design-fader",
    ...expectedRootClasses,
    "consumer-fader",
  ]);

  const track = Children.toArray(root.props.children).find(
    (child) => isValidElement(child) && child.type === SliderTrack,
  );
  if (!isValidElement<{ readonly children?: ReactNode }>(track)) {
    throw new Error("Fader did not return its React Aria track");
  }
  const trackChildren = Children.toArray(track.props.children);
  const fill = trackChildren.find(
    (child) => isValidElement(child) && child.type === SliderFill,
  );
  const thumb = trackChildren.find(
    (child) => isValidElement(child) && child.type === SliderThumb,
  );
  if (!isValidElement<Record<string, unknown>>(fill)) {
    throw new Error("Fader did not return its React Aria fill");
  }
  if (!isValidElement<Record<string, unknown>>(thumb)) {
    throw new Error("Fader did not return its React Aria thumb");
  }
  expect(thumb.props.inputRef).toBe(inputRef);
  expect(fill.props.className).toBe("hraness-design-fader__fill");

  const thumbClassName = thumb.props.className;
  if (typeof thumbClassName !== "function") {
    throw new Error("Fader thumb presentation is not driven by React Aria state");
  }
  const unfocused = thumbClassName({ isFocusVisible: false });
  const focused = thumbClassName({ isFocusVisible: true });
  const expectedUnfocused = stylex.props(faderStyles.thumb).className;
  const expectedFocused = stylex.props(
    faderStyles.thumb,
    faderStyles.focusVisible,
  ).className;

  expect(unfocused).toBe(`hraness-design-fader__thumb ${expectedUnfocused}`);
  expect(focused).toBe(`hraness-design-fader__thumb ${expectedFocused}`);
  expect(focused).not.toBe(unfocused);
});

test("Fader owns extracted logical presentation with no legacy or pseudo selector", async () => {
  const [components, source, compiled] = await Promise.all([
    Bun.file(new URL("../components.css", import.meta.url)).text(),
    Bun.file(new URL("./fader.stylex.ts", import.meta.url)).text(),
    Bun.file(new URL("../../dist/stylex.css", import.meta.url)).text(),
  ]);

  expect(components).not.toContain(".hraness-design-fader");
  expect(source).not.toContain("::before");
  expect(source).not.toContain("::after");
  expect(source).toContain('"inline-size": 4');
  expect(source).toContain('"inset-inline": "calc(50% - 2px)"');
  expect(source).toContain('"block-size": "100%"');
  expect(source).toContain('"inset-block-end": 0');
  expect(source).toContain('left: "50%"');
  expect(source).toContain('top: "50%"');
  expect(compiled).not.toMatch(
    /@layer components\.hraness-design-kit\.priority(?:5|6|7|8|9|[1-9][0-9]+)/u,
  );
});
