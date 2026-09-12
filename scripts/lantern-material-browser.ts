import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type Browser, type Locator, type Page } from "playwright-core";
import { transform } from "lightningcss";
import { readStylexPackageManifest, serializeStylexRuleUnionV1 } from "@hraness/ui/stylex-build";
import type * as PublicDesignKit from "../src/index.js";

import { bundleBrowserStylesheet } from "./browser-stylesheet.js";
import { withTransparencyPreference } from "./browser-transparency.js";

const root = resolve(import.meta.dir, "..");
const output = await mkdtemp(join(tmpdir(), "lantern-material-browser-"));
const hash = (bytes: string | Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const failures: string[] = [];
const cases: unknown[] = [];
const started = Date.now();
let browser: Browser | undefined;
let server: ReturnType<typeof Bun.serve> | undefined;

// Exercise the shipped compiled gallery and the public primitive adapter seam.
// Each reference control has the same primitive, props, content and palette;
// only the material host and its explicit controlXstyle adapter differ.
const clientSource = `
import { createElement as h, useEffect, useState } from ${JSON.stringify(fileURLToPath(import.meta.resolve("react")))};
import { createRoot } from ${JSON.stringify(fileURLToPath(import.meta.resolve("react-dom/client")))};
import { Button, TextField } from ${JSON.stringify(fileURLToPath(import.meta.resolve("@hraness/ui")))};
import { LanternMaterialGallery, lanternControlStyles } from ${JSON.stringify(join(root, "dist/react/index.js"))};
import { getDesignPaletteTheme } from ${JSON.stringify(join(root, "dist/index.js"))};
function Pair({ material, theme }) {
  const [pressed, setPressed] = useState(0);
  const id = material ? "material" : "reference";
  return h("section", { id, className: "fixture-pair " + getDesignPaletteTheme("paper", theme).className, "data-theme": theme, "data-palette": "paper", "data-hraness-theme": "paper",
    ...(material ? { "data-hraness-material": "lantern" } : {}) },
    h(Button, { id: id + "-button", controlXstyle: material ? lanternControlStyles.edge : undefined, onPress: () => setPressed(pressed + 1) }, "Test action"),
    h("output", { id: id + "-count" }, String(pressed)),
    h(TextField, { label: "Test field", defaultValue: "A readable value", inputProps: { id: id + "-input" }, controlXstyle: material ? lanternControlStyles.inset : undefined }),
    h(TextField, { label: "Invalid field", isInvalid: true, errorMessage: "A name is required.", inputProps: { id: id + "-invalid" }, controlXstyle: material ? lanternControlStyles.inset : undefined }),
    h(TextField, { label: "Disabled field", isDisabled: true, defaultValue: "Unavailable", inputProps: { id: id + "-disabled-input" }, controlXstyle: material ? lanternControlStyles.inset : undefined }),
    h(Button, { id: id + "-disabled", isDisabled: true, controlXstyle: material ? lanternControlStyles.edge : undefined, onPress: () => setPressed(pressed + 100) }, "Unavailable action"),
    h(Button, { id: id + "-pending", isPending: true, controlXstyle: material ? lanternControlStyles.edge : undefined, onPress: () => setPressed(pressed + 100) }, "Saving changes"));
}
function App() {
  const theme = document.documentElement.dataset.theme;
  useEffect(() => { document.documentElement.dataset.lanternReady = "true"; }, []);
  return h("main", null,
    h("div", { id: "same-pane", className: "hraness-material-pane fixture-plane", "data-hraness-material": "lantern" }, "Same-element reading plane"),
    h("div", { id: "same-chrome", className: "hraness-material-chrome fixture-plane", "data-hraness-material": "lantern" }, "Same-element chrome"),
    h("div", { id: "outer-island", className: getDesignPaletteTheme("paper", "dark").className, "data-theme": "dark", "data-palette": "paper", "data-hraness-theme": "paper", "data-hraness-material": "lantern" },
      h("div", { id: "nested-island", "data-theme": "light", "data-palette": "paper", "data-hraness-theme": "paper", "data-hraness-material": "lantern", className: "hraness-material-pane fixture-plane " + getDesignPaletteTheme("paper", "light").className }, "Nested daylight")),
    h(LanternMaterialGallery),
    h("div", { className: "fixture-pairs" }, h(Pair, { theme, material: false }), h(Pair, { theme, material: true })));
}
createRoot(document.getElementById("root")).render(h(App));
`;

async function settle(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await document.fonts.ready;
    // Compare completed native transitions, not different points along the
    // same focus animation. Pending spinners are intentionally continuous.
    const transitions = document.getAnimations().filter((animation) => {
      const end = animation.effect?.getComputedTiming().endTime;
      return typeof end === "number" && Number.isFinite(end);
    });
    await Promise.race([
      Promise.all(transitions.map((animation) => animation.finished.catch(() => undefined))),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Finite material transitions did not settle")), 2_000)),
    ]);
    await new Promise<void>((done) => requestAnimationFrame(() => requestAnimationFrame(() => done())));
  });
}

async function focusPaint(page: Page, input: Locator, surface: Locator) {
  await page.keyboard.press("Tab");
  await input.focus();
  await settle(page);
  assert(await input.evaluate((node) => node === document.activeElement && node.matches(":focus-visible")), "Keyboard focus must remain visible on the actual control");
  return surface.evaluate((node) => {
    const style = getComputedStyle(node);
    return { outline: style.outline, offset: style.outlineOffset, shadow: style.boxShadow,
      height: node.getBoundingClientRect().height, radius: style.borderRadius };
  });
}

async function verifyFocus(page: Page) {
  const proof: unknown[] = [];
  for (const suffix of ["button", "input"] as const) {
    const reference = page.locator(`#reference-${suffix}`), material = page.locator(`#material-${suffix}`);
    const surface = (control: Locator) => suffix === "input" ? control.locator("..") : control;
    const before = await focusPaint(page, reference, surface(reference));
    const after = await focusPaint(page, material, surface(material));
    assert.notEqual(before.outline, "none", "The focus reference must have an actual outline");
    assert.match(before.outline, /(?:^| )2px(?: |$)/u, "The primitive focus ring must remain explicit");
    assert.deepEqual(after, before, `Lantern changed ${suffix} focus paint or geometry`);
    proof.push({ control: suffix, ...after });
  }
  return proof;
}

async function verifyStates(page: Page) {
  const evidence = await page.evaluate(() => {
    const required = (id: string) => { const node = document.getElementById(id); if (!(node instanceof HTMLElement)) throw new Error(`Missing ${id}`); return node; };
    const state = (prefix: string) => {
      const invalid = required(`${prefix}-invalid`), field = invalid.parentElement;
      if (!(invalid instanceof HTMLInputElement) || field === null) throw new Error("Missing invalid input surface");
      const disabledInput = required(`${prefix}-disabled-input`), disabled = required(`${prefix}-disabled`), pending = required(`${prefix}-pending`);
      const errors = (invalid.getAttribute("aria-describedby") ?? "").split(/\s+/u).map((id) => document.getElementById(id)?.textContent ?? "").join(" ");
      const paint = getComputedStyle(field);
      return { invalid: invalid.getAttribute("aria-invalid"), errors, invalidBorder: [paint.borderTopColor, paint.borderTopWidth, paint.borderTopStyle],
        disabledInput: disabledInput instanceof HTMLInputElement && disabledInput.disabled,
        disabledButton: disabled instanceof HTMLButtonElement && disabled.disabled,
        disabledImage: getComputedStyle(disabled).backgroundImage,
        disabledFieldImage: disabledInput.parentElement === null ? "missing" : getComputedStyle(disabledInput.parentElement).backgroundImage,
        pending: pending.closest(".hraness-button")?.getAttribute("aria-busy") ?? null,
        pendingControl: pending instanceof HTMLButtonElement && pending.getAttribute("data-pending") === "true",
        pendingDisabled: pending.getAttribute("aria-disabled") };
    };
    return { reference: state("reference"), material: state("material") };
  });
  assert.equal(evidence.material.invalid, "true");
  assert.match(evidence.material.errors, /A name is required\./u);
  assert.equal(evidence.material.disabledInput, true);
  assert.equal(evidence.material.disabledButton, true);
  assert.equal(evidence.material.disabledImage, "none");
  assert.equal(evidence.material.disabledFieldImage, "none");
  assert.equal(evidence.material.pending, "true");
  assert.equal(evidence.material.pendingControl, true);
  assert.equal(evidence.material.pendingDisabled, "true");
  assert.deepEqual(evidence.material, evidence.reference, "Material must preserve invalid, disabled and pending semantics/paint");
  for (const id of ["reference", "material"]) {
    await page.locator(`#${id}-pending`).focus();
    await page.keyboard.press("Enter");
    assert.equal(await page.locator(`#${id}-count`).textContent(), "0", "Pending action must not dispatch");
    await page.locator(`#${id}-button`).click();
    assert.equal(await page.locator(`#${id}-count`).textContent(), "1", "Available primitive must dispatch exactly once");
  }
  return evidence;
}

async function verifyGallery(page: Page) {
  for (const theme of ["light", "dark"]) {
    const workspace = page.locator(`[data-gallery-lantern="${theme}"]`);
    assert.equal(await workspace.locator(".design-gallery__lantern-notes > li").count(), 3);
    const filter = workspace.locator("[data-gallery-lantern-filter]");
    await filter.click();
    assert.equal(await filter.getAttribute("aria-pressed"), "true");
    assert.equal(await workspace.locator(".design-gallery__lantern-notes > li").count(), 2);
    const input = workspace.getByLabel("Find a note");
    await input.fill("no matching example");
    assert.match(await workspace.getByRole("status").textContent() ?? "", /No notes match/u);
    await input.fill("");
    await filter.click();
    await workspace.locator("summary").first().click();
    assert.equal(await workspace.locator("details").first().getAttribute("open"), "");
    await workspace.getByRole("button", { name: "Save this view" }).click();
    assert.match(await workspace.locator(".design-gallery__lantern-save").textContent() ?? "", /View saved for this example\./u);
    // Return to the selected state for exact matched-pair contrast observations.
    await filter.click();
  }
  await page.mouse.move(0, 0);
  await settle(page);
}

async function paintEvidence(page: Page) {
  return page.evaluate(() => {
    const required = (selector: string) => { const node = document.querySelector(selector); if (!(node instanceof HTMLElement)) throw new Error(`Missing ${selector}`); return node; };
    const rgba = (value: string) => {
      if (!CSS.supports("color", value)) throw new Error(`Unsupported observed color ${value}`);
      const canvas = document.createElement("canvas"); canvas.width = canvas.height = 1;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (context === null) throw new Error("Color conversion context unavailable");
      context.fillStyle = value; context.fillRect(0, 0, 1, 1);
      return [...context.getImageData(0, 0, 1, 1).data];
    };
    const paint = (selector: string) => {
      const node = required(selector), style = getComputedStyle(node), rect = node.getBoundingClientRect();
      return { color: rgba(style.color), background: rgba(style.backgroundColor), image: style.backgroundImage,
        blur: style.backdropFilter, prefixedBlur: style.getPropertyValue("-webkit-backdrop-filter"),
        opacity: style.opacity, visibility: style.visibility, width: rect.width, height: rect.height };
    };
    const selected = [...document.querySelectorAll<HTMLElement>('[data-gallery-lantern-filter][aria-pressed="true"], .hraness-material-choice[aria-pressed="true"]')].map((control) => {
      const label = control.querySelector<HTMLElement>(".hraness-button__label") ?? control;
      for (let ancestor: HTMLElement | null = label; ancestor !== null; ancestor = ancestor.parentElement) {
        const ancestorStyle = getComputedStyle(ancestor);
        if (ancestorStyle.opacity !== "1" || ancestorStyle.visibility !== "visible" || ancestorStyle.display === "none") {
          throw new Error("Selected label is concealed or attenuated by an ancestor");
        }
      }
      const style = getComputedStyle(control), labelStyle = getComputedStyle(label);
      const rect = control.getBoundingClientRect();
      // Native forced-color Highlight can be translucent. Measure its visible
      // color over the actual opaque ancestor plane, retaining raw paint too.
      let effectiveBackground = rgba(style.backgroundColor);
      for (let ancestor = control.parentElement; effectiveBackground[3] !== 255 && ancestor !== null; ancestor = ancestor.parentElement) {
        const underneath = rgba(getComputedStyle(ancestor).backgroundColor);
        const foregroundAlpha = (effectiveBackground[3] ?? 0) / 255;
        const backgroundAlpha = (underneath[3] ?? 0) / 255;
        const alpha = foregroundAlpha + backgroundAlpha * (1 - foregroundAlpha);
        if (alpha === 0) continue;
        effectiveBackground = [0, 1, 2].map((index) => Math.round(((effectiveBackground[index] ?? 0) * foregroundAlpha
          + (underneath[index] ?? 0) * backgroundAlpha * (1 - foregroundAlpha)) / alpha));
        effectiveBackground.push(Math.round(alpha * 255));
      }
      return { foreground: rgba(labelStyle.color), fill: rgba(labelStyle.webkitTextFillColor), background: rgba(style.backgroundColor),
        effectiveBackground,
        opacity: style.opacity, labelOpacity: labelStyle.opacity, visibility: style.visibility, width: rect.width, height: rect.height,
        forcedAdjust: style.forcedColorAdjust, image: style.backgroundImage };
    });
    return { same: paint("#same-pane"), chrome: paint("#same-chrome"), nested: paint("#nested-island"),
      light: paint('[data-gallery-lantern="light"] > .hraness-material-pane'), dark: paint('[data-gallery-lantern="dark"] > .hraness-material-pane'),
      walls: ["light", "dark"].map((theme) => paint(`[data-gallery-lantern="${theme}"]`)),
      galleryChrome: ["light", "dark"].map((theme) => paint(`[data-gallery-lantern="${theme}"] .hraness-material-chrome`)),
      selected, overflow: document.documentElement.scrollWidth > innerWidth,
      prefixedSupported: CSS.supports("-webkit-backdrop-filter", "blur(1px)"),
      motion: getComputedStyle(required("#same-pane")).getPropertyValue("--hraness-material-duration").trim() };
  });
}

function contrast(foreground: readonly number[], background: readonly number[]): number {
  const luminance = (color: readonly number[]) => color.slice(0, 3).reduce((sum, channel, index) => {
    const value = channel / 255, linear = value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    return sum + linear * ([0.2126, 0.7152, 0.0722][index] ?? 0);
  }, 0);
  assert.equal(foreground[3], 255, "Foreground must be opaque");
  assert.equal(background[3], 255, "Matched background must be opaque");
  const a = luminance(foreground), b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function requireSelected(proof: Awaited<ReturnType<typeof paintEvidence>>, forced: boolean) {
  assert.equal(proof.selected.length, 3, "Both compiled choices and the plain HTML choice must be selected");
  for (const selected of proof.selected) {
    assert.equal(selected.opacity, "1"); assert.equal(selected.labelOpacity, "1"); assert.equal(selected.visibility, "visible");
    assert(selected.width > 40 && selected.height >= 32, "Selected controls must remain visible targets");
    assert.deepEqual(selected.fill, selected.foreground, "Text fill must agree with its observed foreground");
    if (!forced) assert.equal(selected.background[3], 255, "Ordinary selected paint must be opaque");
    assert(contrast(selected.foreground, selected.effectiveBackground) >= 4.5, "Selected text needs 4.5:1 against its visible surface");
    assert.equal(selected.forcedAdjust, "auto");
    if (forced) assert.equal(selected.image, "none");
  }
}

try {
  const { getDesignPaletteTheme } = await import(join(root, "dist/index.js")) as typeof PublicDesignKit;
  assert.equal(typeof getDesignPaletteTheme, "function");
  const [standalone, foundation, kit, ui, material] = await Promise.all([
    bundleBrowserStylesheet(join(root, "src/styles.css"), root),
    bundleBrowserStylesheet(join(root, "src/compiler-foundation.css"), root),
    readStylexPackageManifest(join(root, "dist/stylex-manifest.json"), root),
    readStylexPackageManifest(join(root, "node_modules/@hraness/ui/dist/stylex-manifest.json"), join(root, "node_modules/@hraness/ui")),
    readFile(join(root, "src/lantern-material.css"), "utf8"),
  ]);
  const optimized = transform({ filename: "lantern-material.css", code: Buffer.from(material), minify: true });
  assert.equal(optimized.warnings.length, 0);
  const optimizedCss = optimized.code.toString();
  for (const property of ["-webkit-backdrop-filter", "backdrop-filter"]) {
    assert(new RegExp(`[;{]${property}:var\\(--hraness-material-chrome-blur\\)`, "u").test(optimizedCss), `Optimization lost Lantern ${property}`);
  }
  const styles = { standalone, compiler: foundation + "\n" + serializeStylexRuleUnionV1([...ui.rules, ...kit.rules], [ui.standaloneSerializer, kit.standaloneSerializer]) };
  for (const [route, css] of Object.entries(styles)) assert(css.includes("--hraness-material-module"), `${route} must import Lantern through its actual foundation`);
  const entry = join(output, "fixture.ts"); await writeFile(entry, clientSource);
  const build = await Bun.build({ entrypoints: [entry], outdir: join(output, "client"), naming: "fixture.js", format: "esm", target: "browser", minify: true,
    conditions: ["production", "browser", "module"], define: { "process.env.NODE_ENV": JSON.stringify("production") } });
  assert(build.success, build.logs.map(String).join("\n"));
  assert.equal(build.outputs.length, 1, "Fixture must emit exactly one local script");
  const script = build.outputs[0]; assert(script !== undefined && basename(script.path) === "fixture.js");
  // Use the same external permanent pressable-rule bridge as the security delivery fixture.
  const layout = "@layer{[data-react-aria-pressable]{touch-action:pan-x pan-y pinch-zoom}}body{margin:0}main{max-width:1200px;margin:auto;padding:20px}.fixture-plane{padding:16px;margin-block:12px}.fixture-pairs{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:20px}.fixture-pair{min-width:0;display:grid;gap:16px}";
  server = Bun.serve({ hostname: "127.0.0.1", port: 0, async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/fixture.js") return new Response(Bun.file(script.path), { headers: { "content-type": "text/javascript" } });
    if (url.pathname === "/layout.css") return new Response(layout, { headers: { "content-type": "text/css" } });
    if (url.pathname === "/styles.css") {
      const route = url.searchParams.get("route");
      if (route !== "standalone" && route !== "compiler") return new Response("Not found", { status: 404 });
      return new Response(styles[route], { headers: { "content-type": "text/css" } });
    }
    if (url.pathname.startsWith("/fonts/")) {
      const path = resolve(root, "src", decodeURIComponent(url.pathname.slice(1))), logical = relative(join(root, "src/fonts"), path);
      if (logical.startsWith("..") || isAbsolute(logical) || !logical.endsWith(".woff2")) return new Response("Not found", { status: 404 });
      return new Response(await readFile(path), { headers: { "content-type": "font/woff2" } });
    }
    if (url.pathname === "/favicon.ico") return new Response(null, { status: 204 });
    if (url.pathname !== "/") return new Response("Not found", { status: 404 });
    const route = url.searchParams.get("route"), theme = url.searchParams.get("theme");
    if ((route !== "standalone" && route !== "compiler") || (theme !== "light" && theme !== "dark")) return new Response("Invalid fixture", { status: 400 });
    return new Response(`<!doctype html><html lang="en" class="${getDesignPaletteTheme("paper", theme).className}" data-theme="${theme}" data-palette="paper" data-hraness-theme="paper"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Lantern material proof</title><link rel="stylesheet" href="/styles.css?route=${route}"><link id="react-aria-pressable-style" rel="stylesheet" href="/layout.css"></head><body><div id="root"></div><script type="module" src="/fixture.js"></script></body></html>`, { headers: { "content-type": "text/html", "content-security-policy": "default-src 'none'; script-src 'self'; style-src 'self'; style-src-attr 'unsafe-inline'; font-src 'self'; img-src 'self'; connect-src 'self'; base-uri 'none'" } });
  } });
  let executablePath: string | undefined;
  for (const candidate of [process.env.CHROMIUM_EXECUTABLE_PATH, process.env.CHROME_PATH, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", chromium.executablePath(), "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome"]) {
    if (candidate === undefined) continue;
    try { await access(candidate); executablePath = candidate; break; } catch { /* Next installed Chromium. */ }
  }
  assert(executablePath, "A local Chromium executable is required");
  browser = await chromium.launch({ executablePath, headless: true, args: process.platform === "linux" ? ["--no-sandbox"] : [] });
  for (const width of [390, 1280]) for (const theme of ["light", "dark"] as const) {
    let reference: unknown;
    for (const route of ["standalone", "compiler"] as const) {
      assert(Date.now() - started < 180_000, "Lantern proof exceeded its three-minute case admission bound");
      const height = width === 390 ? 844 : 900;
      const page = await browser.newPage({ viewport: { width, height }, colorScheme: theme });
      page.setDefaultTimeout(5_000); page.setDefaultNavigationTimeout(15_000);
      page.on("pageerror", (error) => failures.push(error.message));
      page.on("console", (message) => { if (message.type() === "error") failures.push(message.text()); });
      page.on("response", (response) => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
      try {
        await page.goto(`http://${server.hostname}:${server.port}/?route=${route}&theme=${theme}`, { waitUntil: "networkidle" });
        await page.locator('html[data-lantern-ready="true"]').waitFor();
        await settle(page);
        assert.equal(await page.locator('style#react-aria-pressable-style').count(), 0, "No duplicate inline pressable stylesheet");
        assert.match(await page.locator('#material-button').evaluate((node) => getComputedStyle(node).touchAction), /^(?:manipulation|pan-x pan-y pinch-zoom)$/u, "Native touch-action must retain pan and pinch zoom");
        const states = await verifyStates(page), focus = await verifyFocus(page);
        await verifyGallery(page);
        await withTransparencyPreference(page, "no-preference", async (selectTransparency) => {
          const proof = await paintEvidence(page);
          assert.equal(proof.overflow, false, "Material gallery must fit the viewport");
          assert.deepEqual(proof.nested.color, proof.light.color, "Nested light island must rebind foreground inside dark");
          assert.deepEqual(proof.nested.background, proof.light.background, "Nested light island must rebind its own plane");
          assert.notDeepEqual(proof.light.background, proof.dark.background, "Fixed gallery islands must retain independent themes");
          assert.deepEqual(proof.same.background, proof[theme].background, "Same-element material pane must receive its theme plane");
          for (const chrome of [proof.chrome, ...proof.galleryChrome]) {
            assert.equal(chrome.blur, "blur(20px) saturate(1.1)");
            if (proof.prefixedSupported) assert.equal(chrome.prefixedBlur, "blur(20px) saturate(1.1)");
            assert((chrome.background[3] ?? 0) > 0 && (chrome.background[3] ?? 255) < 255, "Chrome must remain translucent in its supported mode");
          }
          for (const wall of proof.walls) assert.match(wall.image, /repeating-linear-gradient/u);
          requireSelected(proof, false);
          const comparable = { proof, states, focus };
          if (reference === undefined) reference = comparable;
          else assert.deepEqual(comparable, reference, "Finalized compiler delivery differs from standalone material");
          await page.locator("#lantern").scrollIntoViewIfNeeded();
          await page.screenshot({ path: join(output, `${route}-${width}-${theme}.png`), fullPage: true });
          await selectTransparency("reduce"); await settle(page);
          const reduced = await paintEvidence(page);
          for (const chrome of [reduced.chrome, ...reduced.galleryChrome]) { assert.equal(chrome.blur, "none"); assert.equal(chrome.background[3], 255); }
          for (const wall of reduced.walls) assert.equal(wall.image, "none");
          await selectTransparency("no-preference"); await settle(page);
          assert.deepEqual(await paintEvidence(page), proof, "Transparency restoration must restore exact material paint");
          await selectTransparency("no-preference", { forcedColors: "active" }); await settle(page);
          const forced = await paintEvidence(page);
          for (const paint of [forced.same, forced.nested, forced.light, forced.dark, forced.chrome, ...forced.galleryChrome, ...forced.walls]) {
            assert.equal(paint.image, "none"); assert.equal(paint.blur, "none"); assert.equal(paint.background[3], 255);
          }
          requireSelected(forced, true);
          await verifyFocus(page);
          cases.push({ route, width, height, theme, ...comparable, reduced, forced });
        });
        await page.emulateMedia({ reducedMotion: "reduce" }); await settle(page);
        assert.match((await paintEvidence(page)).motion, /^0(?:ms|s)$/u, "Reduced motion must resolve to zero duration");
      } finally { await page.close(); }
    }
  }
  assert.deepEqual(failures, []);
  await writeFile(join(output, "receipt.json"), JSON.stringify({ materialSha256: hash(material), optimizedSha256: hash(optimizedCss),
    standaloneSha256: hash(styles.standalone), compilerSha256: hash(styles.compiler),
    packages: [kit, ui].map((manifest) => ({ ...manifest.package, rulesSha256: manifest.rulesSha256, compilerSha256: manifest.compilerSha256 })), cases }, null, 2));
  console.log(`Lantern material verified: ${cases.length} standalone/compiler cases; ${output}`);
} catch (error) {
  await writeFile(join(output, "failure.json"), JSON.stringify({ message: error instanceof Error ? error.message : String(error), failures, completedCases: cases.length }, null, 2));
  throw error;
} finally {
  try { await browser?.close(); } finally { server?.stop(true); }
}
