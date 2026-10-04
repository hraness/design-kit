import { provisionedBrowserExecutable, verificationBrowserLaunchOptions } from "./browser-executable.js";
// Browser proof for the provider marquee. The static renderer from dist is
// served with the complete, compiler-foundation, and standalone marquee
// stylesheets and checked for motion direction, a seamless loop, pausing by
// hover, pointer, and keyboard, one accessible copy, reduced motion, print,
// forced colors, right-to-left documents, phone overflow, and text contrast in
// every palette and mode.
import assert from "node:assert/strict";
import { join, resolve } from "node:path";
import { chromium, type Page } from "playwright-core";

import { bundleBrowserStylesheet } from "./browser-stylesheet.js";
import { paletteContrast } from "../src/palette-color.js";
import { designPalettes } from "../src/palettes.js";
import type * as Root from "../src/index.js";

const repository = resolve(import.meta.dir, "..");
const { renderMarketingMarqueeHtml } = await import(join(repository, "dist/index.js")) as typeof Root;

const services = [
  "X", "LinkedIn", "Gmail", "YouTube", "GitHub", "Beeper", "WhatsApp", "iMessage", "Instagram", "Reddit", "Bluesky", "Threads",
  "TikTok", "Substack", "Hacker News", "Facebook", "Microsoft Graph", "Twitch", "Facebook Pages", "Facebook Groups",
  "Facebook Marketplace", "WebMCP Registry", "ClasificadosOnline",
] as const;
const marks: Readonly<Record<string, string>> = {
  "Facebook Groups": "facebook",
  "Facebook Marketplace": "facebook",
  "Facebook Pages": "facebook",
  "WebMCP Registry": "website",
  ClasificadosOnline: "storefront",
};
const markup = renderMarketingMarqueeHtml({
  action: { href: "#providers", label: "See every provider" },
  id: "providers-band",
  items: services.map((name) => ({ mark: marks[name] ?? name, name })),
  label: "Works with {count} services",
});
const shortMarkup = renderMarketingMarqueeHtml({
  align: "center",
  id: "short-band",
  items: ["Apple Contacts", "iMessage", "Google Contacts", "LinkedIn", "Contact CSV", "vCard contacts"].map((name) => ({
    mark: { "Apple Contacts": "apple", "Google Contacts": "google", "Contact CSV": "csv", "vCard contacts": "vcard" }[name] ?? name,
    name,
  })),
  label: "Imports from {count} sources",
});

const [standalone, foundation] = await Promise.all([
  bundleBrowserStylesheet(join(repository, "src/styles.css"), repository),
  bundleBrowserStylesheet(join(repository, "src/compiler-foundation.css"), repository),
]);
const grammarOnly = await Bun.file(join(repository, "src/marketing-marquee.css")).text();
assert(!/@import|url\(/u.test(grammarOnly), "marketing-marquee.css must stay self-contained");

type Options = Readonly<{
  css?: string;
  dir?: "ltr" | "rtl";
  forcedColors?: "active" | "none";
  html?: string;
  media?: "screen" | "print";
  palette?: string;
  reducedMotion?: "reduce" | "no-preference";
  theme?: "light" | "dark";
  width?: number;
}>;

const browser = await chromium.launch({ executablePath: await provisionedBrowserExecutable(), ...verificationBrowserLaunchOptions() });

async function open(options: Options = {}): Promise<Page> {
  const width = options.width ?? 1280;
  const page = await browser.newPage({ viewport: { width, height: 720 } });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({
    forcedColors: options.forcedColors ?? "none",
    media: options.media ?? "screen",
    reducedMotion: options.reducedMotion ?? "no-preference",
  });
  const html = `<!doctype html><html lang="en" dir="${options.dir ?? "ltr"}" data-palette="${options.palette ?? "gruvbox"}" data-theme="${options.theme ?? "light"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Marquee</title><style>${options.css ?? standalone}
body { margin: 0; background: var(--background, Canvas); color: var(--foreground, CanvasText); }</style></head><body><main>${options.html ?? markup}</main></body></html>`;
  await page.route("**/*", (route) => new URL(route.request().url()).pathname.startsWith("/fonts/")
    ? route.fulfill({ status: 404, body: "" })
    : route.fulfill({ contentType: "text/html", body: html }));
  await page.goto("http://marquee.test/");
  await page.evaluate(() => document.fonts.ready);
  assert.deepEqual(errors, [], "The marquee must load without script errors");
  return page;
}

const firstListX = (page: Page, root = "#providers-band") => page.locator(`${root} .hraness-marketing-marquee__list`).first().evaluate((node) => node.getBoundingClientRect().x);
const playState = (page: Page, root = "#providers-band") => page.locator(`${root} .hraness-marketing-marquee__list`).first().evaluate((node) => getComputedStyle(node).animationPlayState);
const pageOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

async function moving(page: Page, direction: -1 | 1, label: string, root = "#providers-band"): Promise<void> {
  const before = await firstListX(page, root);
  await page.waitForTimeout(700);
  const after = await firstListX(page, root);
  assert(Math.sign(after - before) === direction && Math.abs(after - before) > 2, `${label}: the band moves ${direction < 0 ? "left" : "right"} (${before} -> ${after})`);
}

async function still(page: Page, label: string, root = "#providers-band"): Promise<void> {
  const before = await firstListX(page, root);
  await page.waitForTimeout(500);
  const after = await firstListX(page, root);
  assert(Math.abs(after - before) < 0.5, `${label}: the band stays in place (${before} -> ${after})`);
}

async function geometry(page: Page, root = "#providers-band") {
  return page.locator(root).evaluate((section) => {
    const viewport = section.querySelector(".hraness-marketing-marquee__viewport");
    const lists = [...section.querySelectorAll(".hraness-marketing-marquee__list")];
    if (viewport === null) throw new Error("Missing viewport.");
    return {
      lists: lists.map((list) => {
        const box = list.getBoundingClientRect();
        const style = getComputedStyle(list);
        return { animation: style.animationName, display: style.display, duration: style.animationDuration, hidden: list.getAttribute("aria-hidden"), width: box.width, x: box.x };
      }),
      viewport: viewport.getBoundingClientRect().width,
      mask: getComputedStyle(viewport).maskImage,
      control: (() => {
        const control = section.querySelector(".hraness-marketing-marquee__control");
        if (control === null) throw new Error("Missing control.");
        const box = control.getBoundingClientRect();
        return { display: getComputedStyle(control).display, height: box.height, width: box.width };
      })(),
    };
  });
}

function rgb(color: string): string {
  const values = color.match(/^rgb\((\d+), (\d+), (\d+)\)$/u);
  assert(values, `Expected an opaque sRGB color, received ${color}`);
  return `#${values.slice(1).map((channel) => Number(channel).toString(16).padStart(2, "0")).join("")}`;
}

try {
  for (const [name, css] of [["standalone", standalone], ["compiler", foundation], ["grammar", grammarOnly]] as const) {
    const page = await open({ css });
    const shape = await geometry(page);
    assert.equal(shape.lists.length, 2, `${name}: 23 services need one duplicate copy`);
    assert.deepEqual(shape.lists.map((list) => list.hidden), [null, "true"], `${name}: only the first copy is exposed`);
    assert(shape.lists.every((list) => list.display === "flex" && list.animation === "hraness-marketing-marquee"), `${name}: every copy animates`);
    assert.equal(shape.lists[0]?.duration, "75s", `${name}: 23 items take 75 seconds per loop`);
    const [first, second] = shape.lists;
    assert(first !== undefined && second !== undefined);
    assert(Math.abs(first.width - second.width) < 0.5, `${name}: copies share one width`);
    assert(Math.abs(second.x - (first.x + first.width)) < 0.5, `${name}: the duplicate starts where the first copy ends`);
    assert(first.width >= shape.viewport, `${name}: one copy covers the viewport, so the loop never shows a gap`);
    assert.notEqual(shape.mask, "none", `${name}: the edges fade`);
    assert.equal(shape.control.display, "flex", `${name}: the pause control is visible`);
    assert(shape.control.width >= 44 && shape.control.height >= 44, `${name}: the pause control keeps a 44px target`);
    assert.equal(await pageOverflow(page), 0, `${name}: the band never scrolls the page sideways`);
    await moving(page, -1, name);

    assert.equal(await page.getByRole("list").count(), 1, `${name}: assistive technology reads one list`);
    assert.equal(await page.getByRole("listitem").count(), services.length, `${name}: every service is one list item`);
    assert.equal(await page.getByRole("region", { name: "Works with 23 services" }).count(), 1, `${name}: the label names the band`);
    const toggle = page.getByRole("checkbox", { name: "Pause scrolling" });
    assert.equal(await toggle.count(), 1, `${name}: the pause control is a named checkbox`);

    await page.hover("#providers-band .hraness-marketing-marquee__viewport");
    assert.equal(await playState(page), "paused", `${name}: hovering pauses the band`);
    await still(page, `${name} hover`);
    await page.mouse.move(2, 700);
    assert.equal(await playState(page), "running", `${name}: leaving resumes the band`);

    await page.click("#providers-band .hraness-marketing-marquee__control");
    await page.mouse.move(2, 700);
    assert.equal(await toggle.isChecked(), true, `${name}: the control checks the pause box`);
    assert.equal(await playState(page), "paused", `${name}: the checked box pauses the band`);
    await still(page, `${name} paused`);
    const icons = await page.locator("#providers-band .hraness-marketing-marquee__control-icon").evaluateAll((nodes) => nodes.map((node) => `${node.getAttribute("data-icon")}:${getComputedStyle(node).display}`));
    assert.deepEqual(icons, ["pause:none", "play:block"], `${name}: a paused band offers play`);
    await page.click("#providers-band .hraness-marketing-marquee__control");
    await page.mouse.move(2, 700);
    assert.equal(await playState(page), "running", `${name}: unchecking resumes the band`);

    await page.mouse.click(2, 700);
    let focused = false;
    for (let step = 0; step < 6 && !focused; step++) {
      await page.keyboard.press("Tab");
      focused = await page.evaluate(() => document.activeElement?.classList.contains("hraness-marketing-marquee__toggle") ?? false);
    }
    assert(focused, `${name}: the keyboard reaches the pause control after the action link`);
    const ring = await page.locator("#providers-band .hraness-marketing-marquee__control").evaluate((node) => getComputedStyle(node).outlineStyle);
    assert.equal(ring, "solid", `${name}: keyboard focus draws a ring on the visible control`);
    await page.keyboard.press("Space");
    assert.equal(await toggle.isChecked(), true, `${name}: Space pauses the band`);
    assert.equal(await playState(page), "paused", `${name}: the keyboard pause holds`);
    await page.close();
  }

  const override = await open({ css: `${standalone}\n#providers-band { --hraness-marketing-marquee-duration: 40s; }` });
  assert.equal((await geometry(override)).lists[0]?.duration, "40s", "Products can set their own pace");
  await override.close();

  const short = await open({ html: shortMarkup });
  const shortShape = await geometry(short, "#short-band");
  assert.equal(shortShape.lists.length, 5, "Six items render four duplicates so the loop stays full");
  assert.equal(shortShape.lists[0]?.duration, "26s", "Short lists keep the default pace");
  assert((shortShape.lists.length - 1) * (shortShape.lists[0]?.width ?? 0) >= 1280, "Short lists still cover the viewport");
  await moving(short, -1, "short", "#short-band");
  await short.close();

  const rtl = await open({ dir: "rtl" });
  assert.equal((await geometry(rtl)).lists[0]?.animation, "hraness-marketing-marquee-rtl", "Right-to-left documents use the mirrored loop");
  await moving(rtl, 1, "rtl");
  assert.equal(await pageOverflow(rtl), 0, "rtl: the band never scrolls the page sideways");
  await rtl.close();

  for (const [label, options] of [
    ["reduced motion", { reducedMotion: "reduce" }],
    ["print", { media: "print" }],
  ] as const) {
    const page = await open(options);
    const shape = await geometry(page);
    assert.deepEqual(shape.lists.map((list) => list.display), ["flex", "none"], `${label}: duplicates disappear`);
    assert.equal(shape.lists[0]?.animation, "none", `${label}: nothing moves`);
    assert.equal(shape.control.display, "none", `${label}: there is nothing to pause`);
    assert.equal(await page.getByRole("checkbox").count(), 0, `${label}: the pause box leaves the accessibility tree`);
    const contained = await page.locator("#providers-band").evaluate((section) => {
      const bounds = section.getBoundingClientRect();
      return [...section.querySelectorAll(".hraness-marketing-marquee__list:not([aria-hidden]) .hraness-marketing-marquee__item")]
        .every((item) => {
          const box = item.getBoundingClientRect();
          return box.left >= bounds.left - 0.5 && box.right <= bounds.right + 0.5 && box.width > 0;
        });
    });
    assert(contained, `${label}: every name wraps into view`);
    assert.equal(await pageOverflow(page), 0, `${label}: no sideways scroll`);
    await page.close();
  }

  const forced = await open({ forcedColors: "active" });
  const forcedShape = await geometry(forced);
  assert.equal(forcedShape.mask, "none", "Forced colors remove the edge fade");
  const forcedInk = await forced.locator("#providers-band .hraness-marketing-marquee__item").first().evaluate((item) => {
    const mark = item.querySelector(".hraness-marketing-marquee__mark");
    if (mark === null) throw new Error("Missing mark.");
    return { color: getComputedStyle(item).color, fill: getComputedStyle(mark).fill };
  });
  assert.equal(forcedInk.fill, forcedInk.color, "Forced colors paint marks in the system text color");
  await forced.close();

  const phone = await open({ width: 375 });
  const phoneShape = await geometry(phone);
  assert.equal(await pageOverflow(phone), 0, "The phone layout has no horizontal scroll");
  assert(phoneShape.control.width >= 44 && phoneShape.control.height >= 44, "The phone keeps a 44px pause target");
  await moving(phone, -1, "phone");
  await phone.close();

  let contrastCases = 0;
  for (const palette of designPalettes) {
    for (const theme of ["light", "dark"] as const) {
      const page = await open({ palette, theme });
      const paint = await page.locator("#providers-band").evaluate((section) => {
        let painted: Element | null = section;
        while (painted !== null && getComputedStyle(painted).backgroundColor === "rgba(0, 0, 0, 0)") painted = painted.parentElement;
        if (painted === null) throw new Error("No opaque page background.");
        const color = (selector: string) => {
          const node = section.querySelector(selector);
          if (node === null) throw new Error(`Missing ${selector}.`);
          return getComputedStyle(node).color;
        };
        return {
          action: color(".hraness-marketing-marquee__action"),
          background: getComputedStyle(painted).backgroundColor,
          count: color(".hraness-marketing-marquee__count"),
          item: color(".hraness-marketing-marquee__item"),
          label: color(".hraness-marketing-marquee__label"),
        };
      });
      for (const role of ["action", "count", "item", "label"] as const) {
        const ratio = paletteContrast(rgb(paint[role]), rgb(paint.background));
        assert(ratio >= 4.5, `${palette}/${theme}/${role}: contrast ${ratio.toFixed(2)}:1 is below 4.5:1 (${paint[role]} on ${paint.background})`);
      }
      contrastCases += 1;
      await page.close();
    }
  }
  assert.equal(contrastCases, designPalettes.length * 2, "Every palette and mode must run");
  console.log(`Marketing marquee browser checks passed: three stylesheet routes move, loop without gaps, and pause by hover, pointer, and keyboard; reduced motion, print, forced colors, right-to-left, and phone layouts hold; text meets 4.5:1 in ${String(contrastCases)} palette modes.`);
} finally {
  await browser.close();
}
