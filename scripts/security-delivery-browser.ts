import { access, mkdtemp, readdir, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";

import { chromium, type Browser, type Page } from "playwright-core";
import { createElement } from "react";
import { renderToReadableStream } from "react-dom/server";

import {
  createHeldSecurityDeliveryResource,
  SecurityDeliveryApplication,
  securityDeliveryFallback,
  securityDeliveryStorageKey,
  securityDeliveryTerminal,
} from "../gallery/security-delivery-fixture.js";

const repository = process.cwd();

interface ObservedSecurityElement {
  readonly hydration: boolean;
  readonly kind: "script" | "style";
  readonly nonce: string;
  readonly src: string;
  readonly text: string;
}

interface SecurityPolicyViolationEvidence {
  readonly blockedUri: string;
  readonly directive: string;
}

declare global {
  interface Window {
    __hranessSecurityDeliveryElements?: ObservedSecurityElement[];
    __hranessSecurityDeliveryViolations?: SecurityPolicyViolationEvidence[];
  }
}

const nonce = "hraness-security-delivery-nonce-2026";
const reactAriaPressableStyleId = "react-aria-pressable-style";
const contentSecurityPolicy = [
  "default-src 'none'",
  "base-uri 'none'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'none'",
  `script-src 'nonce-${nonce}' 'strict-dynamic'`,
  "script-src-attr 'none'",
  `style-src 'self' 'nonce-${nonce}'`,
  `style-src-elem 'self' 'nonce-${nonce}'`,
  "style-src-attr 'unsafe-inline'",
  "child-src 'none'",
  "connect-src 'none'",
  "font-src 'none'",
  "frame-src 'none'",
  "img-src 'none'",
  "manifest-src 'none'",
  "media-src 'none'",
  "worker-src 'none'",
].join("; ");

function invariant(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message);
}

function escapeRegularExpression(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function classSelectorCount(css: string, className: string): number {
  return css.match(
    new RegExp(`\\.${escapeRegularExpression(className)}(?=\\s*[{,:])`, "gu"),
  )?.length ?? 0;
}

function layerBlockCount(css: string, layerName: string): number {
  const escaped = escapeRegularExpression(layerName);
  return css.match(new RegExp(`@layer\\s+${escaped}\\s*\\{`, "gu"))?.length ?? 0;
}

const noticeDeclarationPatterns: readonly (readonly [RegExp, string])[] = [
  [/align-items:\s*center/u, "align-items"],
  [/background-color:\s*(?:#ffcc33|#fc3)/u, "background-color"],
  [/border-bottom-color:\s*#5c1906/u, "border-block-end color"],
  [/border-bottom-style:\s*solid/u, "border-block-end style"],
  [/border-bottom-width:\s*2px/u, "border-block-end width"],
  [/box-shadow:\s*0\s+3px\s+12px\s+#24140059/u, "box-shadow"],
  [/color:\s*#241400/u, "color"],
  [/display:\s*flex/u, "display"],
  [/flex-wrap:\s*wrap/u, "flex-wrap"],
  [/font-family:\s*var\(--font-text,\s*system-ui,\s*sans-serif\)/u, "font-family"],
  [/font-size:\s*var\(--text-label,\s*0?\.875rem\)/u, "font-size"],
  [/gap:\s*var\(--space-1,\s*0?\.25rem\)\s*var\(--space-3,\s*0?\.75rem\)/u, "gap"],
  [/top:\s*0/u, "logical block-start inset"],
  [/justify-content:\s*center/u, "justify-content"],
  [/line-height:\s*1\.35/u, "line-height"],
  [/min-height:\s*3rem/u, "min-height"],
  [/padding-block:\s*max\(var\(--space-2,\s*0?\.5rem\),\s*env\(safe-area-inset-top\)\)/u, "padding-block"],
  [/padding-inline:\s*max\(var\(--space-4,\s*1rem\),\s*env\(safe-area-inset-left\)\)\s*max\(var\(--space-4,\s*1rem\),\s*env\(safe-area-inset-right\)\)/u, "padding-inline"],
  [/position:\s*sticky/u, "position"],
  [/text-align:\s*center/u, "text-align"],
  [/width:\s*100%/u, "width"],
  [/z-index:\s*calc\(var\(--z-tooltip,\s*3000\)\s*\+\s*1\)/u, "z-index"],
  [/font-weight:\s*var\(--font-weight-bold,\s*700\)/u, "emphasis font-weight"],
  [/letter-spacing:\s*0?\.04em/u, "emphasis letter-spacing"],
  [/text-transform:\s*uppercase/u, "emphasis text-transform"],
];

const ditherDeclarationPatterns: readonly (readonly [RegExp, string])[] = [
  [/--hraness-design-dither-size:\s*3px/u, "fine density variable"],
  [/--hraness-design-dither-size:\s*7px/u, "coarse density variable"],
  [
    /background-image:\s*radial-gradient\(color-mix\(in oklch,\s*currentColor 18%,\s*transparent\)\s*0?\.75px,\s*transparent\s*0?\.75px\)/u,
    "radial texture",
  ],
  [
    /background-size:\s*var\(--hraness-design-dither-size,\s*4px\)\s*var\(--hraness-design-dither-size,\s*4px\)/u,
    "public density-variable texture size",
  ],
  [/@media\s*\(forced-colors:\s*active\)/u, "forced-colors override"],
];

async function firstExecutable(paths: readonly string[]): Promise<string> {
  for (const path of paths) {
    try {
      await access(path);
      return path;
    } catch {
      // Continue through known Chromium and Chrome installations.
    }
  }
  throw new Error(
    "No Chromium executable found. Set CHROMIUM_EXECUTABLE_PATH to run the security delivery browser test.",
  );
}

async function availablePort(): Promise<number> {
  const probe = createServer();
  await new Promise<void>((resolve, reject) => {
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", resolve);
  });
  const address = probe.address();
  invariant(
    typeof address === "object" && address !== null,
    "The security delivery port probe received no network address.",
  );
  await new Promise<void>((resolve, reject) => {
    probe.close((error) => error === undefined ? resolve() : reject(error));
  });
  return address.port;
}

async function waitForCondition(
  check: () => boolean,
  message: string,
  timeout = 10_000,
): Promise<void> {
  const deadline = Date.now() + timeout;
  while (!check()) {
    if (Date.now() >= deadline) throw new Error(message);
    await Bun.sleep(25);
  }
}

function streamedDocument(
  application: ReadableStream<Uint8Array>,
  hydrationFileName: string,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const reader = application.getReader();
  const prefix = [
    "<!doctype html>",
    '<html data-theme="light" lang="en">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta content="width=device-width,initial-scale=1" name="viewport">',
    `<meta content="${nonce}" nonce="${nonce}" property="csp-nonce">`,
    "<title>Security delivery canary</title>",
    `<link data-security-delivery-stylesheet href="/security-delivery.css" id="${reactAriaPressableStyleId}" nonce="${nonce}" rel="stylesheet">`,
    "</head>",
    '<body><div id="app">',
  ].join("");
  const suffix = [
    "</div>",
    `<script data-security-delivery-hydration="" nonce="${nonce}" src="/${hydrationFileName}" type="module"></script>`,
    "</body></html>",
  ].join("");
  let prefixPending = true;
  let suffixPending = true;

  return new ReadableStream<Uint8Array>({
    async cancel(reason) {
      await reader.cancel(reason);
    },
    async pull(controller) {
      if (prefixPending) {
        prefixPending = false;
        controller.enqueue(encoder.encode(prefix));
        return;
      }
      const result = await reader.read();
      if (!result.done) {
        controller.enqueue(result.value);
        return;
      }
      if (suffixPending) {
        suffixPending = false;
        controller.enqueue(encoder.encode(suffix));
      }
      controller.close();
    },
  });
}

async function openBrowser(executablePath: string): Promise<Browser> {
  return chromium.launch({
    args: ["--no-sandbox"],
    executablePath,
    headless: true,
  });
}

async function installPageObservers(page: Page): Promise<void> {
  await page.addInitScript((expectedNonce) => {
    const elements: ObservedSecurityElement[] = [];
    const violations: SecurityPolicyViolationEvidence[] = [];
    window.__hranessSecurityDeliveryElements = elements;
    window.__hranessSecurityDeliveryViolations = violations;
    const record = (node: Node): void => {
      if (node instanceof HTMLScriptElement) {
        elements.push({
          hydration: node.hasAttribute("data-security-delivery-hydration"),
          kind: "script",
          nonce: node.nonce,
          src: node.src,
          text: node.textContent ?? "",
        });
      } else if (node instanceof HTMLStyleElement) {
        elements.push({
          hydration: false,
          kind: "style",
          nonce: node.nonce,
          src: "",
          text: node.textContent ?? "",
        });
      }
    };
    new MutationObserver((records) => {
      for (const mutation of records) {
        for (const node of mutation.addedNodes) record(node);
      }
    }).observe(document, { childList: true, subtree: true });
    document.addEventListener("securitypolicyviolation", (event) => {
      violations.push({
        blockedUri: event.blockedURI,
        directive: event.effectiveDirective,
      });
    });
    Object.defineProperty(window, "__hranessSecurityDeliveryExpectedNonce", {
      configurable: false,
      enumerable: false,
      value: expectedNonce,
      writable: false,
    });
  }, nonce);
}

const work = await mkdtemp(join(tmpdir(), "hraness-security-delivery-browser-"));
const clientDirectory = join(work, "client");
const cssDirectory = join(work, "css");
let browser: Browser | undefined;
let server: ReturnType<typeof Bun.serve> | undefined;

try {
  const clientBuild = await Bun.build({
    conditions: ["production", "browser", "module"],
    define: {
      "process.env.NODE_ENV": JSON.stringify("production"),
    },
    entrypoints: [join(repository, "gallery/security-delivery-main.tsx")],
    format: "esm",
    minify: true,
    naming: {
      asset: "[name]-[hash].[ext]",
      chunk: "security-delivery-chunk-[hash].[ext]",
      entry: "security-delivery-main.[ext]",
    },
    outdir: clientDirectory,
    splitting: false,
    target: "browser",
  });
  if (!clientBuild.success) {
    throw new Error(clientBuild.logs.map((log) => log.message).join("\n"));
  }
  const hydrationOutput = clientBuild.outputs.find(
    (output) => basename(output.path) === "security-delivery-main.js",
  );
  invariant(hydrationOutput !== undefined, "The security delivery fixture emitted no hydration entry.");
  invariant(
    clientBuild.outputs.filter((output) => output.path.endsWith(".js")).length === 1,
    "The security delivery fixture emitted more than one hydration JavaScript artifact.",
  );
  const hydrationFileName = basename(hydrationOutput.path);

  const cssBuild = await Bun.build({
    entrypoints: [join(repository, "gallery/security-delivery.css")],
    minify: true,
    naming: "security-delivery.[ext]",
    outdir: cssDirectory,
    target: "browser",
  });
  if (!cssBuild.success) {
    throw new Error(cssBuild.logs.map((log) => log.message).join("\n"));
  }
  const cssOutputs = cssBuild.outputs.filter((output) => output.path.endsWith(".css"));
  invariant(cssOutputs.length === 1, `Expected one combined CSS artifact, received ${String(cssOutputs.length)}.`);
  const cssOutput = cssOutputs[0];
  invariant(cssOutput !== undefined, "The combined CSS artifact is unavailable.");
  const [combinedCss, designLegacyCss, designStylexCss, uiStylexCss] = await Promise.all([
    Bun.file(cssOutput.path).text(),
    Bun.file(join(repository, "src/components.css")).text(),
    Bun.file(join(repository, "dist/stylex.css")).text(),
    Bun.file(join(repository, "node_modules/@hraness/ui/dist/stylex.css")).text(),
  ]);
  const uiPriority3Marker = "@layer components.hraness-ui.priority3";
  const uiPriority3Index = uiStylexCss.indexOf(uiPriority3Marker);
  invariant(uiPriority3Index >= 0, "The pinned UI artifact has no emitted priority3 layer.");
  const uiPriority3Css = uiStylexCss.slice(uiPriority3Index);
  invariant(
    /padding-top:\s*var\(--space-5,\s*1\.25rem\)/u.test(uiPriority3Css),
    "The pinned UI priority3 layer lost the QuietSite footer padding canary.",
  );
  invariant(combinedCss.trim().length > 0, "The combined CSS artifact is empty.");
  invariant(
    combinedCss.includes("@layer components.hraness-design-kit.priority"),
    "The combined CSS artifact lost the package-owned StyleX layer.",
  );
  for (const layerName of [
    "components.hraness-ui.priority1",
    "components.hraness-ui.priority2",
    "components.hraness-ui.priority3",
    "components.hraness-design-kit.priority1",
    "components.hraness-design-kit.priority3",
    "components.hraness-design-kit.priority4",
  ]) {
    invariant(
      layerBlockCount(combinedCss, layerName) === 1,
      `The combined CSS artifact contains ${String(layerBlockCount(combinedCss, layerName))} ${layerName} blocks instead of one.`,
    );
  }
  invariant(
    layerBlockCount(combinedCss, "components.hraness-design-kit.priority2") === 2,
    `The combined CSS artifact must contain one compiled and one gallery-only design-kit priority2 block, received ${String(layerBlockCount(combinedCss, "components.hraness-design-kit.priority2"))}.`,
  );
  invariant(
    /@layer\s+components\.hraness-ui\.legacy\s*,\s*components\.hraness-ui\.priority1\s*,\s*components\.hraness-ui\.priority2\s*,\s*components\.hraness-ui\.priority3\s*,\s*components\.hraness-design-kit\.legacy\s*,\s*components\.hraness-design-kit\.priority1\s*,\s*components\.hraness-design-kit\.priority2\s*,\s*components\.hraness-design-kit\.priority3\s*,\s*components\.hraness-design-kit\.priority4/u.test(combinedCss),
    "The combined CSS artifact lost the frozen cross-package layer prelude.",
  );
  invariant(
    /@layer\s+components\.hraness-design-kit\.priority2\s*\{[^}]*\[data-design-kit-stylex-layer-conflict=(?:"true"|true)\]\.hraness-button\s*\{(?=[^}]*--design-kit-stylex-layer-conflict:\s*design-kit-priority2)(?=[^}]*display:\s*grid)[^}]*\}/u.test(combinedCss),
    "The combined CSS artifact lost the gallery-only design-kit priority2 Button conflict.",
  );
  invariant(
    /@layer\s+components\.hraness-design-kit\.priority2\s*\{[\s\S]*?\[data-design-kit-stylex-dither-conflict=(?:"true"|true)\]\.hraness-design-dither-surface\s*\{(?=[^}]*--design-kit-stylex-dither-conflict:\s*design-kit-priority2)(?=[^}]*background-size:\s*99px\s+99px)[^}]*\}/u.test(combinedCss),
    "The combined CSS artifact lost the gallery-only design-kit priority2 DitherSurface conflict.",
  );
  invariant(
    /@layer\s+components\s*\{[^}]*\[data-design-kit-stylex-old-parent=(?:"true"|true)\]\.hraness-button\s*\{[^}]*display:\s*inline-flex/u.test(combinedCss),
    "The combined CSS artifact lost the gallery-only old direct-parent negative control.",
  );
  invariant(
    /@layer\s+components\s*\{[\s\S]*?\[data-design-kit-stylex-dither-old-parent=(?:"true"|true)\]\.hraness-design-dither-surface\s*\{[^}]*background-size:\s*88px\s+88px/u.test(combinedCss),
    "The combined CSS artifact lost the gallery-only DitherSurface old direct-parent negative control.",
  );
  for (const [pattern, declaration] of noticeDeclarationPatterns) {
    invariant(
      pattern.test(combinedCss),
      `The combined CSS artifact lost the migrated notice ${declaration} declaration.`,
    );
  }
  invariant(
    !combinedCss.includes(".hraness-design-production-data-preview-notice{"),
    "Legacy CSS can still satisfy the migrated notice selector.",
  );
  for (const [pattern, declaration] of ditherDeclarationPatterns) {
    invariant(
      pattern.test(designStylexCss) && pattern.test(combinedCss),
      `The packed or combined CSS artifact lost the migrated DitherSurface ${declaration} declaration.`,
    );
  }
  invariant(
    !/\.hraness-design-dither-surface\s*(?:\{|\[|:)/u.test(designLegacyCss),
    "Legacy design-kit CSS can still satisfy the migrated DitherSurface selector.",
  );
  const reactAriaPressableRules = combinedCss.match(
    /\[data-react-aria-pressable\]\s*\{\s*touch-action:\s*pan-x pan-y pinch-zoom;?\s*\}/gu,
  ) ?? [];
  invariant(
    reactAriaPressableRules.length === 1,
    `The bounded React Aria press-style bridge emitted ${String(reactAriaPressableRules.length)} rules.`,
  );

  const clientFiles = await readdir(clientDirectory);
  const clientJavaScript = (await Promise.all(
    clientFiles
      .filter((file) => file.endsWith(".js"))
      .map(async (file) => Bun.file(join(clientDirectory, file)).text()),
  )).join("\n");
  invariant(
    !/stylex\.create|stylexCreate|Unexpected ["']stylex\.create/u.test(clientJavaScript),
    "The security delivery browser artifact contains uncompiled StyleX authoring.",
  );
  invariant(
    !/stylex-inject|stylexInject|data-stylex|stylesheet-group/u.test(clientJavaScript),
    "The security delivery browser artifact contains StyleX runtime injection.",
  );

  const held = createHeldSecurityDeliveryResource();
  const streamErrors: string[] = [];
  const applicationStream = await renderToReadableStream(
    createElement(SecurityDeliveryApplication, {
      nonce,
      resource: held.resource,
    }),
    {
      nonce,
      onError(error: unknown) {
        streamErrors.push(error instanceof Error ? error.message : String(error));
      },
    },
  );
  let allReadyState: "fulfilled" | "pending" | "rejected" = "pending";
  void applicationStream.allReady.then(
    () => {
      allReadyState = "fulfilled";
    },
    (error: unknown) => {
      allReadyState = "rejected";
      streamErrors.push(error instanceof Error ? error.message : String(error));
    },
  );
  const documentStream = streamedDocument(applicationStream, hydrationFileName);
  const requestPaths: string[] = [];
  const clientJavaScriptRequests: string[] = [];
  const clientJavaScriptRequestCount = (): number => clientJavaScriptRequests.length;
  const currentAllReadyState = (): typeof allReadyState => allReadyState;
  let negativeControlRequests = 0;
  let rootServed = false;

  server = Bun.serve({
    hostname: "127.0.0.1",
    idleTimeout: 30,
    port: await availablePort(),
    async fetch(request) {
      const pathname = new URL(request.url).pathname;
      if (request.headers.get("x-security-delivery-negative-control") === "missing") {
        negativeControlRequests += 1;
        return new Response("Not found", { status: 404 });
      }
      requestPaths.push(pathname);
      if (pathname === "/favicon.ico") return new Response(null, { status: 204 });
      if (pathname === "/security-delivery.css") {
        return new Response(Bun.file(cssOutput.path), {
          headers: { "content-type": "text/css" },
        });
      }
      if (pathname.endsWith(".js")) {
        clientJavaScriptRequests.push(pathname);
        const candidate = join(clientDirectory, basename(pathname));
        if (!(await Bun.file(candidate).exists())) {
          return new Response("Not found", { status: 404 });
        }
        return new Response(Bun.file(candidate), {
          headers: { "content-type": "text/javascript" },
        });
      }
      if (pathname === "/") {
        if (rootServed) return new Response("Fixture already consumed", { status: 409 });
        rootServed = true;
        return new Response(documentStream, {
          headers: {
            "cache-control": "no-store",
            "content-security-policy": contentSecurityPolicy,
            "content-type": "text/html; charset=utf-8",
            "x-content-type-options": "nosniff",
          },
        });
      }
      return new Response("Not found", { status: 404 });
    },
  });

  const origin = `http://${server.hostname}:${String(server.port)}`;
  const negativeControlResponse = await fetch(`${origin}/security-delivery-missing`, {
    headers: { "x-security-delivery-negative-control": "missing" },
  });
  const negativeControlBody = await negativeControlResponse.text();
  invariant(
    negativeControlResponse.status === 404
      && negativeControlBody === "Not found"
      && negativeControlRequests === 1,
    "The server did not reject the missing-resource negative control.",
  );
  const stylesheetResponse = await fetch(`${origin}/security-delivery.css`);
  invariant(stylesheetResponse.status === 200, "The combined stylesheet did not return 200.");
  invariant(
    stylesheetResponse.headers.get("content-type") === "text/css",
    `The combined stylesheet MIME type is ${String(stylesheetResponse.headers.get("content-type"))}.`,
  );
  invariant(
    (await stylesheetResponse.text()) === combinedCss,
    "The server changed the combined stylesheet bytes.",
  );

  const executablePath = await firstExecutable([
    ...(process.env.CHROMIUM_EXECUTABLE_PATH === undefined
      ? []
      : [process.env.CHROMIUM_EXECUTABLE_PATH]),
    chromium.executablePath(),
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ]);
  browser = await openBrowser(executablePath);
  const page = await browser.newPage({ colorScheme: "dark" });
  page.setDefaultNavigationTimeout(10_000);
  page.setDefaultTimeout(10_000);
  const failures: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") failures.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => failures.push(`page: ${error.message}`));
  page.on("requestfailed", (request) => {
    failures.push(`request: ${request.url()} ${request.failure()?.errorText ?? "failed"}`);
  });
  page.on("response", (response) => {
    if (response.status() >= 400) {
      failures.push(`resource: ${String(response.status())} ${response.url()}`);
    }
  });
  await installPageObservers(page);
  await page.addInitScript(({ key }) => {
    localStorage.setItem(key, "sepia");
  }, { key: securityDeliveryStorageKey });

  const linkedStylesheet = page.waitForResponse(
    (response) => response.url() === `${origin}/security-delivery.css`,
  );
  const navigation = await page.goto(origin, { waitUntil: "commit" });
  invariant(navigation !== null, "The security delivery navigation returned no response.");
  invariant(
    navigation.headers()["content-security-policy"] === contentSecurityPolicy,
    "The security delivery response did not carry the exact CSP.",
  );
  await page.getByText(securityDeliveryFallback, { exact: true }).waitFor();
  await page.locator("html[data-theme=\"dark\"]").waitFor();
  await page.locator("link[data-security-delivery-stylesheet]").waitFor({
    state: "attached",
  });
  const browserStylesheetResponse = await linkedStylesheet;
  invariant(
    browserStylesheetResponse.status() === 200
      && browserStylesheetResponse.headers()["content-type"] === "text/css",
    "The browser did not receive the combined stylesheet as 200 text/css.",
  );
  await page.waitForTimeout(150);

  invariant(currentAllReadyState() === "pending", "The held SSR stream reached allReady before release.");
  invariant(clientJavaScriptRequestCount() === 0, "Client JavaScript was requested before release.");
  invariant(
    await page.locator("[data-security-delivery-terminal]").count() === 0,
    "Terminal content appeared before release.",
  );
  invariant(
    await page.evaluate((key) => localStorage.getItem(key), securityDeliveryStorageKey) === "system",
    "Invalid stored sepia was not repaired to system before client JavaScript.",
  );
  invariant(
    await page.evaluate(() => document.documentElement.getAttribute("data-theme")) === "dark",
    "The dark OS preference was not resolved before client JavaScript.",
  );
  invariant(
    await page.locator("link[data-security-delivery-stylesheet]").count() === 1,
    "The document does not expose exactly one combined stylesheet link.",
  );
  invariant(
    await page.locator(`link#${reactAriaPressableStyleId}`).count() === 1,
    "The combined stylesheet lost the bounded React Aria suppression sentinel.",
  );
  invariant(
    await page.evaluate(() => document.styleSheets.length) === 1,
    `The browser registered the wrong stylesheet count: ${String(await page.evaluate(() => document.styleSheets.length))}; ${failures.join("; ")}.`,
  );
  invariant(
    await page.locator("style").count() === 0,
    "A style element exists before hydration.",
  );
  invariant(
    await page.locator(".hraness-design-jelly-surface").count() === 0,
    "The nonce-strict canary unexpectedly contains a Jelly surface.",
  );

  const noticeEvidence = await page.evaluate(() => {
    const notice = document.querySelector(".hraness-design-production-data-preview-notice");
    const emphasis = notice?.querySelector("strong");
    if (!(notice instanceof HTMLElement) || !(emphasis instanceof HTMLElement)) {
      throw new Error("The streamed notice is missing.");
    }
    const noticeStyle = getComputedStyle(notice);
    const emphasisStyle = getComputedStyle(emphasis);
    const noticeBounds = notice.getBoundingClientRect();
    const parentBounds = notice.parentElement?.getBoundingClientRect();
    return {
      alignItems: noticeStyle.alignItems,
      backgroundColor: noticeStyle.backgroundColor,
      borderBlockEndColor: noticeStyle.borderBlockEndColor,
      borderBlockEndStyle: noticeStyle.borderBlockEndStyle,
      borderBlockEndWidth: noticeStyle.borderBlockEndWidth,
      boxShadow: noticeStyle.boxShadow,
      color: noticeStyle.color,
      columnGap: noticeStyle.columnGap,
      display: noticeStyle.display,
      emphasisClasses: [...emphasis.classList],
      emphasisFontWeight: emphasisStyle.fontWeight,
      emphasisHasStyle: emphasis.hasAttribute("style"),
      emphasisLetterSpacing: emphasisStyle.letterSpacing,
      flexWrap: noticeStyle.flexWrap,
      fontFamily: noticeStyle.fontFamily,
      fontSize: noticeStyle.fontSize,
      insetBlockStart: noticeStyle.insetBlockStart,
      justifyContent: noticeStyle.justifyContent,
      lineHeight: noticeStyle.lineHeight,
      minHeight: noticeStyle.minHeight,
      noticeClasses: [...notice.classList],
      noticeHasStyle: notice.hasAttribute("style"),
      noticeWidth: noticeBounds.width,
      paddingBlockEnd: noticeStyle.paddingBlockEnd,
      paddingBlockStart: noticeStyle.paddingBlockStart,
      paddingInlineEnd: noticeStyle.paddingInlineEnd,
      paddingInlineStart: noticeStyle.paddingInlineStart,
      parentWidth: parentBounds?.width,
      position: noticeStyle.position,
      rowGap: noticeStyle.rowGap,
      textAlign: noticeStyle.textAlign,
      textTransform: emphasisStyle.textTransform,
      top: noticeStyle.top,
      zIndex: noticeStyle.zIndex,
    };
  });
  invariant(noticeEvidence.position === "sticky", "The notice lost its computed sticky position.");
  invariant(noticeEvidence.display === "flex", "The notice lost its computed flex presentation.");
  invariant(
    noticeEvidence.alignItems === "center" && noticeEvidence.justifyContent === "center",
    `The notice alignment is ${noticeEvidence.alignItems}/${noticeEvidence.justifyContent}.`,
  );
  invariant(noticeEvidence.flexWrap === "wrap", `The notice flex-wrap is ${noticeEvidence.flexWrap}.`);
  invariant(
    noticeEvidence.backgroundColor === "rgb(255, 204, 51)",
    `The notice warning fill is ${noticeEvidence.backgroundColor}.`,
  );
  invariant(
    noticeEvidence.borderBlockEndColor === "rgb(92, 25, 6)"
      && noticeEvidence.borderBlockEndStyle === "solid"
      && noticeEvidence.borderBlockEndWidth === "2px",
    `The notice warning border is ${noticeEvidence.borderBlockEndWidth} ${noticeEvidence.borderBlockEndStyle} ${noticeEvidence.borderBlockEndColor}.`,
  );
  invariant(
    noticeEvidence.boxShadow === "rgba(36, 20, 0, 0.35) 0px 3px 12px 0px",
    `The notice box-shadow is ${noticeEvidence.boxShadow}.`,
  );
  invariant(noticeEvidence.color === "rgb(36, 20, 0)", `The notice color is ${noticeEvidence.color}.`);
  invariant(
    noticeEvidence.fontFamily.startsWith("ui-sans-serif, system-ui, -apple-system, ")
      && noticeEvidence.fontFamily.includes('"Segoe UI"')
      && noticeEvidence.fontFamily.endsWith(", sans-serif"),
    `The notice font-family is ${noticeEvidence.fontFamily}.`,
  );
  invariant(noticeEvidence.fontSize === "14px", `The notice font-size is ${noticeEvidence.fontSize}.`);
  invariant(
    noticeEvidence.rowGap === "4px" && noticeEvidence.columnGap === "12px",
    `The notice row/column gap is ${noticeEvidence.rowGap}/${noticeEvidence.columnGap}.`,
  );
  invariant(
    noticeEvidence.insetBlockStart === "0px" && noticeEvidence.top === "0px",
    `The notice block-start inset is ${noticeEvidence.insetBlockStart}/${noticeEvidence.top}.`,
  );
  invariant(noticeEvidence.lineHeight === "18.9px", `The notice line-height is ${noticeEvidence.lineHeight}.`);
  invariant(noticeEvidence.minHeight === "48px", `The notice min-height is ${noticeEvidence.minHeight}.`);
  invariant(
    noticeEvidence.paddingBlockStart === "8px" && noticeEvidence.paddingBlockEnd === "8px",
    `The notice block padding is ${noticeEvidence.paddingBlockStart}/${noticeEvidence.paddingBlockEnd}.`,
  );
  invariant(
    noticeEvidence.paddingInlineStart === "16px" && noticeEvidence.paddingInlineEnd === "16px",
    `The notice inline padding is ${noticeEvidence.paddingInlineStart}/${noticeEvidence.paddingInlineEnd}.`,
  );
  invariant(noticeEvidence.textAlign === "center", `The notice text-align is ${noticeEvidence.textAlign}.`);
  invariant(
    noticeEvidence.parentWidth !== undefined
      && Math.abs(noticeEvidence.noticeWidth - noticeEvidence.parentWidth) < 0.01,
    `The notice width ${String(noticeEvidence.noticeWidth)} does not fill its parent ${String(noticeEvidence.parentWidth)}.`,
  );
  invariant(noticeEvidence.zIndex === "3001", `The notice z-index is ${noticeEvidence.zIndex}.`);
  invariant(
    noticeEvidence.emphasisFontWeight === "700",
    `The notice emphasis font-weight is ${noticeEvidence.emphasisFontWeight}.`,
  );
  invariant(
    noticeEvidence.emphasisLetterSpacing === "0.56px",
    `The notice emphasis letter-spacing is ${noticeEvidence.emphasisLetterSpacing}.`,
  );
  invariant(noticeEvidence.textTransform === "uppercase", "The notice emphasis is not uppercase.");
  invariant(!noticeEvidence.noticeHasStyle && !noticeEvidence.emphasisHasStyle, "The notice emitted inline styles.");
  const noticeAtomicClasses = noticeEvidence.noticeClasses.filter(
    (className) => className !== "hraness-design-production-data-preview-notice",
  );
  invariant(noticeAtomicClasses.length > 0, "The notice has no rendered atomic classes.");
  invariant(noticeEvidence.emphasisClasses.length > 0, "The notice emphasis has no rendered atomic classes.");
  for (const className of [...noticeAtomicClasses, ...noticeEvidence.emphasisClasses]) {
    invariant(
      classSelectorCount(combinedCss, className) >= 1,
      `The served combined CSS does not contain rendered notice atomic class ${className}.`,
    );
  }

  const beforeReleaseElements = await page.evaluate(
    () => window.__hranessSecurityDeliveryElements ?? [],
  );
  const beforeReleaseScripts = beforeReleaseElements.filter(
    (element) => element.kind === "script",
  );
  invariant(beforeReleaseScripts.length >= 2, "The streamed theme bootstraps were not observed.");
  invariant(
    beforeReleaseScripts.every((script) => script.nonce === nonce),
    "A pre-release streamed script has the wrong nonce.",
  );

  held.release();
  await page.getByText(securityDeliveryTerminal, { exact: true }).waitFor();
  await page.locator("html[data-security-delivery-hydrated]").waitFor();
  await waitForCondition(
    () => clientJavaScriptRequestCount() >= 1,
    "The hydration bundle was not requested after release.",
  );
  await waitForCondition(
    () => currentAllReadyState() !== "pending",
    "The SSR stream did not settle after release.",
  );
  await page.waitForTimeout(250);
  const transitionObservation = await page.evaluate(() => ({
    elements: window.__hranessSecurityDeliveryElements ?? [],
    liveStyles: document.querySelectorAll("style").length,
    violations: window.__hranessSecurityDeliveryViolations ?? [],
  }));
  invariant(
    transitionObservation.elements.some((element) => element.kind === "style"),
    `The next-themes transition style was not observed: ${JSON.stringify(transitionObservation)}.`,
  );
  invariant(
    transitionObservation.liveStyles === 0,
    `A dynamic style remained after hydration: ${JSON.stringify(transitionObservation)}.`,
  );

  invariant(
    currentAllReadyState() === "fulfilled",
    `The SSR stream settled as ${currentAllReadyState()}.`,
  );
  invariant(streamErrors.length === 0, `SSR stream errors: ${streamErrors.join("; ")}`);
  invariant(
    clientJavaScriptRequestCount() === 1
      && clientJavaScriptRequests[0] === `/${hydrationFileName}`,
    `Hydration JavaScript requests changed: ${JSON.stringify(clientJavaScriptRequests)}.`,
  );
  invariant(
    await page.evaluate(() => window.__hranessSecurityDeliveryHydrationCount) === 1,
    "The hydration application did not commit exactly once.",
  );
  invariant(
    (await page.evaluate(() => window.__hranessSecurityDeliveryRecoverableErrors ?? [])).length === 0,
    "React reported a recoverable hydration error.",
  );

  const observedElements = await page.evaluate(
    () => window.__hranessSecurityDeliveryElements ?? [],
  );
  const observedScripts = observedElements.filter((element) => element.kind === "script");
  const observedStyles = observedElements.filter((element) => element.kind === "style");
  invariant(observedScripts.length > beforeReleaseScripts.length, "No streamed completion or hydration script was observed.");
  invariant(
    observedScripts.every((script) => script.nonce === nonce),
    "A dynamically observed script has the wrong nonce.",
  );
  const liveScriptNonces = await page.locator("script").evaluateAll(
    (scripts) => scripts.map((script) => (script as HTMLScriptElement).nonce),
  );
  invariant(
    liveScriptNonces.length > 0
      && liveScriptNonces.every((scriptNonce) => scriptNonce === nonce),
    `A live streamed script has the wrong nonce: ${JSON.stringify(liveScriptNonces)}.`,
  );
  const releasedScripts = observedScripts.slice(beforeReleaseScripts.length);
  invariant(
    releasedScripts.some((script) => script.src === ""),
    "No nonce-bearing streamed React completion script was observed.",
  );
  invariant(
    releasedScripts.filter((script) => script.hydration).length === 1,
    "The nonce-bearing hydration module was not observed exactly once.",
  );
  invariant(observedStyles.length > 0, "The next-themes transition style was not observed.");
  invariant(
    observedStyles.every(
      (style) => style.nonce === nonce
        && style.text.includes("transition:none!important"),
    ),
    `An observed dynamic style was not nonce-bearing next-themes transition suppression: ${JSON.stringify(observedStyles)}.`,
  );
  invariant(await page.locator("style").count() === 0, "The transient transition style was not removed.");
  invariant(
    await page.locator(`style#${reactAriaPressableStyleId}`).count() === 0,
    "React Aria injected a duplicate permanent pressable style.",
  );
  invariant(
    (await page.evaluate(() => window.__hranessSecurityDeliveryViolations ?? [])).length === 0,
    "The page observed a CSP violation.",
  );

  const trigger = page.locator("#security-canary-dialog-trigger");
  const crossPackageEvidence = await page.evaluate(() => {
    const control = document.querySelector("#security-canary-dialog-trigger");
    const button = control?.closest(".hraness-button");
    const icon = control?.querySelector('[data-slot="icon"]');
    const quietSiteFooter = document.querySelector('[data-security-ui-priority3]');
    const mediumDither = document.querySelector('[data-security-dither="medium"]');
    const coarseDither = document.querySelector('[data-security-dither="coarse"]');
    const fineDither = document.querySelector('[data-security-dither="fine"]');
    const callerDither = document.querySelector('[data-security-dither="caller"]');
    if (!(control instanceof HTMLButtonElement)
      || !(button instanceof HTMLElement)
      || !(icon instanceof SVGElement)
      || !(quietSiteFooter instanceof HTMLElement)
      || !(mediumDither instanceof HTMLElement)
      || !(coarseDither instanceof HTMLElement)
      || !(fineDither instanceof HTMLElement)
      || !(callerDither instanceof HTMLElement)) {
      throw new Error("The cross-package Button, Icon, UI priority3, or DitherSurface canary is missing.");
    }
    button.setAttribute("data-design-kit-stylex-layer-conflict", "true");
    const buttonStyle = getComputedStyle(button);
    const normalizedDisplay = buttonStyle.display;
    button.setAttribute("data-design-kit-stylex-old-parent", "true");
    const oldDirectParentDisplay = getComputedStyle(button).display;
    button.removeAttribute("data-design-kit-stylex-old-parent");
    const iconStyle = getComputedStyle(icon);
    const quietSiteFooterStyle = getComputedStyle(quietSiteFooter);
    const mediumStyle = getComputedStyle(mediumDither);
    const normalizedDitherSize = mediumStyle.backgroundSize;
    mediumDither.setAttribute("data-design-kit-stylex-dither-old-parent", "true");
    const oldDirectParentDitherSize = getComputedStyle(mediumDither).backgroundSize;
    mediumDither.removeAttribute("data-design-kit-stylex-dither-old-parent");
    const restoredDitherStyle = getComputedStyle(mediumDither);
    const coarseDitherStyle = getComputedStyle(coarseDither);
    const fineDitherStyle = getComputedStyle(fineDither);
    const callerDitherStyle = getComputedStyle(callerDither);
    return {
      normalizedDisplay,
      oldDirectParentDisplay,
      restoredDisplay: getComputedStyle(button).display,
      buttonSentinel: buttonStyle
        .getPropertyValue("--design-kit-stylex-layer-conflict")
        .trim(),
      iconClasses: [...icon.classList].filter((className) => className !== "hraness-icon"),
      iconDisplay: iconStyle.display,
      iconFlex: iconStyle.flex,
      iconHasInlineStyle: icon.hasAttribute("style"),
      uiPriority3Classes: [...quietSiteFooter.classList].filter(
        (className) => className !== "hraness-quiet-site-footer",
      ),
      uiPriority3HasInlineStyle: quietSiteFooter.hasAttribute("style"),
      uiPriority3PaddingTop: quietSiteFooterStyle.paddingTop,
      callerDitherBackgroundImage: callerDitherStyle.backgroundImage,
      callerDitherHasInlineStyle: callerDither.hasAttribute("style"),
      callerDitherSize: callerDitherStyle.backgroundSize,
      callerDitherVariable: callerDitherStyle
        .getPropertyValue("--hraness-design-dither-size")
        .trim(),
      coarseDitherSize: coarseDitherStyle.backgroundSize,
      coarseDitherVariable: coarseDitherStyle
        .getPropertyValue("--hraness-design-dither-size")
        .trim(),
      ditherClasses: [...mediumDither.classList].filter(
        (className) => className !== "hraness-themed-surface"
          && className !== "hraness-design-dither-surface",
      ),
      ditherConflictSentinel: restoredDitherStyle
        .getPropertyValue("--design-kit-stylex-dither-conflict")
        .trim(),
      ditherDensity: mediumDither.dataset.density,
      ditherHasInlineStyle: mediumDither.hasAttribute("style"),
      ditherImage: restoredDitherStyle.backgroundImage,
      fineDitherSize: fineDitherStyle.backgroundSize,
      fineDitherVariable: fineDitherStyle
        .getPropertyValue("--hraness-design-dither-size")
        .trim(),
      normalizedDitherSize,
      oldDirectParentDitherSize,
      restoredDitherSize: restoredDitherStyle.backgroundSize,
    };
  });
  invariant(
    crossPackageEvidence.normalizedDisplay === "grid"
      && crossPackageEvidence.oldDirectParentDisplay === "inline-flex"
      && crossPackageEvidence.restoredDisplay === "grid"
      && crossPackageEvidence.buttonSentinel === "design-kit-priority2",
    `The real Button did not distinguish normalized UI legacy from the old direct-parent negative control: ${JSON.stringify(crossPackageEvidence)}.`,
  );
  invariant(
    crossPackageEvidence.iconClasses.length > 0
      && crossPackageEvidence.iconDisplay === "block"
      && crossPackageEvidence.iconFlex === "0 0 auto"
      && !crossPackageEvidence.iconHasInlineStyle,
    `The real UI Icon lost its extracted StyleX presentation: ${JSON.stringify(crossPackageEvidence)}.`,
  );
  for (const className of crossPackageEvidence.iconClasses) {
    invariant(
      classSelectorCount(uiStylexCss, className) === 1,
      `The pinned UI StyleX artifact contains ${String(classSelectorCount(uiStylexCss, className))} selectors for the rendered Icon class ${className}.`,
    );
    invariant(
      classSelectorCount(combinedCss, className) >= 1,
      `The served aggregate CSS does not contain the rendered UI Icon class ${className}.`,
    );
  }
  const renderedUiPriority3Classes = crossPackageEvidence.uiPriority3Classes.filter(
    (className) => classSelectorCount(uiPriority3Css, className) === 1,
  );
  invariant(
    renderedUiPriority3Classes.length > 0
      && crossPackageEvidence.uiPriority3PaddingTop === "20px"
      && !crossPackageEvidence.uiPriority3HasInlineStyle,
    `The real UI QuietSiteFooter lost its extracted priority3 presentation: ${JSON.stringify(crossPackageEvidence)}.`,
  );
  for (const className of renderedUiPriority3Classes) {
    invariant(
      classSelectorCount(uiStylexCss, className) === 1,
      `The pinned UI StyleX artifact contains ${String(classSelectorCount(uiStylexCss, className))} selectors for rendered priority3 class ${className}.`,
    );
    invariant(
      classSelectorCount(combinedCss, className) >= 1,
      `The served aggregate CSS does not contain the rendered UI priority3 class ${className}.`,
    );
  }
  invariant(
    crossPackageEvidence.ditherDensity === "medium"
      && crossPackageEvidence.normalizedDitherSize === "4px 4px"
      && crossPackageEvidence.oldDirectParentDitherSize === "88px 88px"
      && crossPackageEvidence.restoredDitherSize === "4px 4px"
      && crossPackageEvidence.ditherConflictSentinel === "design-kit-priority2",
    `The real DitherSurface did not distinguish normalized priority3 output from the priority2 match and old direct-parent negative control: ${JSON.stringify(crossPackageEvidence)}.`,
  );
  invariant(
    crossPackageEvidence.ditherImage.includes("radial-gradient")
      && crossPackageEvidence.coarseDitherSize === "7px 7px"
      && crossPackageEvidence.coarseDitherVariable === "7px"
      && crossPackageEvidence.fineDitherSize === "3px 3px"
      && crossPackageEvidence.fineDitherVariable === "3px"
      && !crossPackageEvidence.ditherHasInlineStyle,
    `The real DitherSurface lost its extracted texture or finite density contract: ${JSON.stringify(crossPackageEvidence)}.`,
  );
  invariant(
    crossPackageEvidence.callerDitherSize === "11px 11px"
      && crossPackageEvidence.callerDitherVariable === "11px"
      && crossPackageEvidence.callerDitherBackgroundImage.includes("radial-gradient")
      && crossPackageEvidence.callerDitherHasInlineStyle,
    `The real DitherSurface lost caller-last native density override behavior: ${JSON.stringify(crossPackageEvidence)}.`,
  );
  const renderedDitherClasses = crossPackageEvidence.ditherClasses.filter(
    (className) => classSelectorCount(designStylexCss, className) === 1,
  );
  invariant(
    renderedDitherClasses.length >= 2,
    `The real medium DitherSurface exposes fewer than two design-kit atomic classes: ${JSON.stringify(crossPackageEvidence)}.`,
  );
  for (const className of renderedDitherClasses) {
    invariant(
      classSelectorCount(designStylexCss, className) === 1,
      `The design-kit StyleX artifact contains the wrong selector count for rendered DitherSurface class ${className}.`,
    );
    invariant(
      classSelectorCount(combinedCss, className) >= 1,
      `The served aggregate CSS does not contain rendered DitherSurface class ${className}.`,
    );
  }
  await page.emulateMedia({ forcedColors: "active" });
  const forcedColorDitherEvidence = await page.evaluate(() => (
    [...document.querySelectorAll<HTMLElement>("[data-security-dither]")]
      .map((element) => ({
        backgroundImage: getComputedStyle(element).backgroundImage,
        density: element.dataset.density,
        text: element.textContent?.trim(),
      }))
  ));
  invariant(
    forcedColorDitherEvidence.length === 4
      && forcedColorDitherEvidence.every(
        ({ backgroundImage, density, text }) => backgroundImage === "none"
          && density !== undefined
          && text !== undefined
          && text.length > 0,
      ),
    `Forced-colors mode did not remove only the decorative DitherSurface image: ${JSON.stringify(forcedColorDitherEvidence)}.`,
  );
  await page.emulateMedia({ forcedColors: "none" });
  const pressableEvidence = await page.evaluate((styleId) => {
    const element = document.querySelector("#security-canary-dialog-trigger");
    const link = document.querySelector(`#${styleId}`);
    if (!(element instanceof HTMLElement) || !(link instanceof HTMLLinkElement)) {
      throw new Error("The React Aria pressable bridge target is missing.");
    }
    const matchingDeclarations: string[] = [];
    const visit = (rules: CSSRuleList): void => {
      for (const rule of rules) {
        if (rule instanceof CSSStyleRule
          && rule.selectorText === "[data-react-aria-pressable]") {
          matchingDeclarations.push(rule.style.getPropertyValue("touch-action").trim());
        }
        if ("cssRules" in rule) {
          visit((rule as CSSRule & { readonly cssRules: CSSRuleList }).cssRules);
        }
      }
    };
    if (link.sheet !== null) visit(link.sheet.cssRules);
    return {
      matchingDeclarations,
      pressable: element.getAttribute("data-react-aria-pressable"),
    };
  }, reactAriaPressableStyleId);
  invariant(
    pressableEvidence.pressable === "true"
      && pressableEvidence.matchingDeclarations.length === 1
      && pressableEvidence.matchingDeclarations[0] === "pan-x pan-y pinch-zoom",
    `The bounded React Aria press-style bridge is not active on the dialog trigger: ${JSON.stringify(pressableEvidence)}.`,
  );
  await trigger.click();
  const overlay = page.locator('[data-slot="dialog-overlay"]');
  await overlay.waitFor();
  const portalEvidence = await page.evaluate(() => {
    const application = document.querySelector("#app");
    const overlayElement = document.querySelector('[data-slot="dialog-overlay"]');
    const dialog = overlayElement?.querySelector('[data-slot="dialog"]');
    if (
      !(application instanceof HTMLElement)
      || !(overlayElement instanceof HTMLElement)
      || !(dialog instanceof HTMLElement)
    ) {
      throw new Error("The portalled dialog is missing.");
    }
    const overlayStyle = getComputedStyle(overlayElement);
    const rootStyle = getComputedStyle(document.documentElement);
    const dialogStyle = getComputedStyle(dialog);
    return {
      background: overlayStyle.getPropertyValue("--background").trim(),
      classNames: [...overlayElement.classList],
      dialogBackground: dialogStyle.backgroundColor,
      dialogColor: dialogStyle.color,
      outsideApplication: !application.contains(overlayElement),
      rootBackground: rootStyle.getPropertyValue("--background").trim(),
    };
  });
  invariant(portalEvidence.outsideApplication, "The dialog overlay did not portal outside #app.");
  invariant(
    portalEvidence.classNames.includes("security-canary-theme-light"),
    "The portalled overlay lost the product-owned Light theme mapping.",
  );
  invariant(
    portalEvidence.classNames.includes("security-canary-palette"),
    "The portalled overlay lost its product palette class.",
  );
  invariant(
    portalEvidence.rootBackground === "#000"
      || portalEvidence.rootBackground === "#000000",
    `The document root is not using Dark tokens: ${JSON.stringify(portalEvidence)}.`,
  );
  invariant(portalEvidence.background === "#fbf6f2", "The portalled overlay is not using Light tokens.");
  invariant(
    portalEvidence.dialogBackground === "rgb(255, 255, 255)"
      && portalEvidence.dialogColor === "rgb(32, 27, 25)",
    `The portalled dialog computed the wrong Light presentation: ${JSON.stringify(portalEvidence)}.`,
  );

  await page.getByRole("button", { name: "Close security delivery dialog" }).click();
  await overlay.waitFor({ state: "detached" });
  invariant(
    await page.evaluate(() => document.activeElement?.id) === "security-canary-dialog-trigger",
    "Closing the portalled dialog did not restore trigger focus.",
  );
  invariant(await page.locator("style").count() === 0, "A stable style element remained after dialog interaction.");
  invariant(
    await page.locator(".hraness-design-jelly-surface").count() === 0,
    "A Jelly surface entered the nonce-strict canary after hydration.",
  );
  invariant(
    failures.length === 0,
    `Security delivery page, console, or resource errors: ${failures.join("; ")}`,
  );
  invariant(
    requestPaths.every((path) => [
      "/",
      "/favicon.ico",
      "/security-delivery.css",
      `/${hydrationFileName}`,
    ].includes(path)),
    `The fixture requested an unexpected resource: ${JSON.stringify(requestPaths)}.`,
  );

  console.log(
    "Security delivery canary passed classic React SSR streaming, nonce-strict scripts and style elements with style attributes permitted, packed cross-package StyleX layers, DitherSurface density/override/forced-color cascade evidence, hydration, and real portal checks. It intentionally externalizes React Aria's permanent pressable rule through a bounded style-id bridge. The fixture excludes Jelly surfaces; Jelly's vendor-owned permanent style still needs a separate nonce solution or broader style policy.",
  );
} finally {
  try {
    if (browser !== undefined) await browser.close();
  } finally {
    try {
      server?.stop(true);
    } finally {
      await rm(work, { force: true, recursive: true });
    }
  }
}
