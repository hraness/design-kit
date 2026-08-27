import { access, mkdtemp, readdir, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";

import { chromium, type Browser, type Page } from "playwright-core";
import { createElement } from "react";
import { renderToReadableStream, renderToStaticMarkup } from "react-dom/server";

import {
  createHeldSecurityDeliveryResource,
  SecurityDeliveryApplication,
  securityDeliveryFallback,
  securityDeliveryStorageKey,
  securityDeliveryTerminal,
  VerticalWritingLayoutSurfaceMatrix,
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
  "font-src 'self'",
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

const faderDeclarationPatterns: readonly (readonly [RegExp, string])[] = [
  [
    /--hraness-design-fader-thumb-block-size:\s*1\.125rem/u,
    "default thumb block-size variable",
  ],
  [
    /--hraness-design-fader-thumb-block-size:\s*0?\.75rem/u,
    "compact thumb block-size variable",
  ],
  [
    /--hraness-design-fader-thumb-inline-size:\s*1\.75rem/u,
    "default thumb inline-size variable",
  ],
  [
    /--hraness-design-fader-thumb-inline-size:\s*1\.5rem/u,
    "compact thumb inline-size variable",
  ],
  [/--hraness-design-fader-track-length:\s*6rem/u, "default track length"],
  [
    /--hraness-design-fader-track-length:\s*var\(--interactive-target-min\)/u,
    "compact track length",
  ],
  [/inline-size:\s*4px/u, "logical rail thickness"],
  [/inset-inline:\s*calc\(50%\s*-\s*2px\)/u, "logical rail centering"],
  [/background-color:\s*var\(--grid\)/u, "track rail color"],
  [/background-color:\s*var\(--primary\)/u, "fill and thumb color"],
  [/left:\s*50%/u, "thumb cross-axis left"],
  [/top:\s*50%/u, "thumb cross-axis top"],
  [/outline-offset:\s*3px/u, "focus outline offset"],
  [/outline-width:\s*3px/u, "focus outline width"],
];

const playbackTransportDeclarationPatterns: readonly (readonly [RegExp, string])[] = [
  [
    /@layer components\.hraness-design-kit\.priority2\s*\{[\s\S]*?gap:\s*var\(--space-2\)/u,
    "priority2 gap",
  ],
  [
    /@layer components\.hraness-design-kit\.priority3\s*\{[\s\S]*?align-items:\s*center/u,
    "priority3 alignment",
  ],
  [
    /@layer components\.hraness-design-kit\.priority3\s*\{[\s\S]*?display:\s*flex/u,
    "priority3 flex display",
  ],
  [
    /@layer components\.hraness-design-kit\.priority3\s*\{[\s\S]*?flex-wrap:\s*wrap/u,
    "priority3 wrapping",
  ],
  [
    /@layer components\.hraness-design-kit\.priority3\s*\{[\s\S]*?inline-size:\s*1\.5rem/u,
    "priority3 logical inline glyph size",
  ],
  [
    /@layer components\.hraness-design-kit\.priority3\s*\{[\s\S]*?block-size:\s*1\.5rem/u,
    "priority3 logical block glyph size",
  ],
];

const layoutSurfaceDeclarationPatterns: readonly (readonly [RegExp, string])[] = [
  [/background-color:\s*var\(--background\)/u, "solid surface background"],
  [
    /background-color:\s*color-mix\(in oklch,\s*var\(--background\)\s*90%,\s*transparent\)/u,
    "glass TopBar background",
  ],
  [/backdrop-filter:\s*blur\(18px\)\s*saturate\(1\.08\)/u, "glass TopBar filter"],
  [/border-block-end-color:\s*var\(--line\)/u, "TopBar logical block-end border"],
  [/border-block-start-color:\s*var\(--line\)/u, "footer logical block-start border"],
  [/min-inline-size:\s*0/u, "logical inline minimum"],
  [/min-block-size:\s*var\(--top-bar-height\)/u, "TopBar logical block minimum"],
  [/min-block-size:\s*var\(--bottom-bar-height\)/u, "BottomBar logical block minimum"],
  [/inline-size:\s*min\(100%,\s*var\(--page-canvas-width\)\)/u, "PageCanvas logical inline size"],
  [/max-inline-size:\s*none/u, "full logical inline cap"],
  [/max-inline-size:\s*var\(--page-canvas-wide\)/u, "wide logical inline cap"],
  [
    /padding-block:\s*var\(--space-1\)\s*max\(var\(--space-1\),\s*env\(safe-area-inset-bottom\)\)/u,
    "compact DockedFooter safe-area inset",
  ],
  [/position:\s*absolute/u, "absolute DockedFooter position"],
  [/position:\s*fixed/u, "fixed DockedFooter position"],
  [/background-color:\s*canvas/u, "forced-colors surface background"],
  [/border-block-end-color:\s*canvastext/u, "forced-colors TopBar logical border"],
  [/border-block-start-color:\s*canvastext/u, "forced-colors footer logical borders"],
  [/border-inline-end-color:\s*canvastext/u, "forced-colors inline-end borders"],
  [/border-inline-start-color:\s*canvastext/u, "forced-colors inline-start borders"],
];

const layoutSurfaceIsolatedDeclarationPatterns: readonly (readonly [RegExp, string])[] = [
  [/inset-block-end:\s*0/u, "DockedFooter logical block-end inset"],
  [/inset-block-start:\s*0/u, "sticky TopBar logical block-start inset"],
  [/inset-inline:\s*0/u, "DockedFooter logical inline insets"],
];

const layoutSurfaceTokenPhysicalSubstitutions: readonly (readonly [RegExp, string])[] = [
  [/border-bottom-color:\s*var\(--line\)/u, "physical block-end border color substitution"],
  [/border-top-color:\s*var\(--line\)/u, "physical block-start border color substitution"],
  [/min-height:\s*var\(--top-bar-height\)/u, "physical TopBar min-height substitution"],
  [/min-height:\s*var\(--bottom-bar-height\)/u, "physical BottomBar min-height substitution"],
  [/width:\s*min\(100%,\s*var\(--page-canvas-width\)\)/u, "physical width substitution"],
  [/max-width:\s*var\(--page-canvas-wide\)/u, "physical wide max-width substitution"],
];

const layoutSurfaceIsolatedPhysicalSubstitutions: readonly (readonly [RegExp, string])[] = [
  [/border-bottom-width:\s*1px/u, "physical block-end border width substitution"],
  [/border-top-width:\s*1px/u, "physical block-start border width substitution"],
  [/(?:^|\s)bottom:\s*0/u, "physical bottom inset substitution"],
  [/min-width:\s*0/u, "physical min-width substitution"],
  [/max-width:\s*none/u, "physical full-size max-width substitution"],
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

function verticalWritingDocument(): string {
  const markup = renderToStaticMarkup(
    createElement(VerticalWritingLayoutSurfaceMatrix),
  );
  return [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta content="width=device-width,initial-scale=1" name="viewport">',
    "<title>Vertical writing layout oracle</title>",
    `<link href="/security-delivery-vertical.css" nonce="${nonce}" rel="stylesheet">`,
    "</head>",
    `<body>${markup}</body>`,
    "</html>",
  ].join("");
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
    external: ["*.woff2"],
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
    /@layer\s+components\.hraness-design-kit\.priority2\s*\{[\s\S]*?\[data-design-kit-stylex-layout-conflict=(?:"true"|true)\]\.hraness-design-top-bar\s*\{(?=[^}]*--design-kit-stylex-layout-conflict:\s*design-kit-priority2)(?=[^}]*top:\s*99px)[^}]*\}/u.test(combinedCss),
    "The combined CSS artifact lost the gallery-only design-kit priority2 TopBar conflict.",
  );
  invariant(
    /@layer\s+components\.hraness-ui\.legacy\s*\{[\s\S]*?\[data-design-kit-stylex-playback-conflict=(?:"true"|true)\]\s+\.hraness-design-playback-transport\s*\{(?=[^}]*--design-kit-stylex-playback-conflict:\s*ui-legacy)(?=[^}]*gap:\s*99px)[^}]*\}/u.test(combinedCss),
    "The combined CSS artifact lost the matched gallery-only UI legacy PlaybackTransport conflict.",
  );
  invariant(
    /@layer\s+components\.hraness-ui\.legacy\s*\{[\s\S]*?\[data-design-kit-stylex-fader-conflict=(?:"true"|true)\]\.hraness-design-fader\s*\{(?=[^}]*--design-kit-stylex-fader-conflict:\s*ui-legacy)(?=[^}]*min-inline-size:\s*99px)[^}]*\}/u.test(combinedCss),
    "The combined CSS artifact lost the matched gallery-only UI legacy Fader conflict.",
  );
  invariant(
    /@layer\s+components\s*\{[^}]*\[data-design-kit-stylex-old-parent=(?:"true"|true)\]\.hraness-button\s*\{[^}]*display:\s*inline-flex/u.test(combinedCss),
    "The combined CSS artifact lost the gallery-only old direct-parent negative control.",
  );
  invariant(
    /@layer\s+components\s*\{[\s\S]*?\[data-design-kit-stylex-dither-old-parent=(?:"true"|true)\]\.hraness-design-dither-surface\s*\{[^}]*background-size:\s*88px\s+88px/u.test(combinedCss),
    "The combined CSS artifact lost the gallery-only DitherSurface old direct-parent negative control.",
  );
  invariant(
    /@layer\s+components\s*\{[\s\S]*?\[data-design-kit-stylex-layout-old-parent=(?:"true"|true)\]\.hraness-design-top-bar\s*\{[^}]*top:\s*88px/u.test(combinedCss),
    "The combined CSS artifact lost the gallery-only TopBar old direct-parent negative control.",
  );
  invariant(
    /@layer\s+components\s*\{[\s\S]*?\[data-design-kit-stylex-playback-old-parent=(?:"true"|true)\]\s+\.hraness-design-playback-transport\s*\{[^}]*gap:\s*88px/u.test(combinedCss),
    "The combined CSS artifact lost the gallery-only PlaybackTransport old direct-parent negative control.",
  );
  invariant(
    /@layer\s+components\s*\{[\s\S]*?\[data-design-kit-stylex-fader-old-parent=(?:"true"|true)\]\.hraness-design-fader\s*\{[^}]*min-inline-size:\s*88px/u.test(combinedCss),
    "The combined CSS artifact lost the gallery-only Fader old direct-parent negative control.",
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
  for (const [pattern, declaration] of faderDeclarationPatterns) {
    invariant(
      pattern.test(designStylexCss),
      `The packed StyleX artifact lost the migrated Fader ${declaration} declaration.`,
    );
  }
  invariant(
    !designLegacyCss.includes(".hraness-design-fader")
      && !/\.hraness-design-fader[^{]*::?before/u.test(combinedCss)
      && !/@layer\s+components\.hraness-design-kit\.priority(?:5|6)/u.test(
        designStylexCss,
      ),
    "Fader retained legacy or pseudo presentation or leaked priority5/priority6 output.",
  );
  invariant(
    !/\.hraness-design-dither-surface\s*(?:\{|\[|:)/u.test(designLegacyCss),
    "Legacy design-kit CSS can still satisfy the migrated DitherSurface selector.",
  );
  for (const [pattern, declaration] of layoutSurfaceDeclarationPatterns) {
    invariant(
      pattern.test(designStylexCss) && pattern.test(combinedCss),
      `The packed or combined CSS artifact lost the migrated layout-surface ${declaration} declaration.`,
    );
  }
  for (const [pattern, declaration] of layoutSurfaceIsolatedDeclarationPatterns) {
    invariant(
      pattern.test(designStylexCss),
      `The packed StyleX artifact lost the migrated layout-surface ${declaration} declaration.`,
    );
  }
  for (const [pattern, substitution] of layoutSurfaceTokenPhysicalSubstitutions) {
    invariant(
      !pattern.test(designStylexCss) && !pattern.test(combinedCss),
      `The packed or combined CSS artifact contains a migrated layout-surface ${substitution}.`,
    );
  }
  for (const [pattern, substitution] of layoutSurfaceIsolatedPhysicalSubstitutions) {
    invariant(
      !pattern.test(designStylexCss),
      `The packed design-kit StyleX artifact contains a migrated layout-surface ${substitution}.`,
    );
  }
  invariant(
    !/\.hraness-design-(?:top-bar|bottom-bar|page-canvas|docked-footer)(?:__[\w-]+)?\s*(?:\{|\[|,|:)/u.test(designLegacyCss),
    "Legacy design-kit CSS can still satisfy a migrated layout-surface selector.",
  );
  for (const [pattern, declaration] of playbackTransportDeclarationPatterns) {
    invariant(
      pattern.test(designStylexCss) && pattern.test(combinedCss),
      `The packed or combined CSS artifact lost the migrated PlaybackTransport ${declaration} declaration.`,
    );
  }
  invariant(
    !designLegacyCss.includes(".hraness-design-playback-transport {")
      && !designLegacyCss.includes(
        '.hraness-design-playback-transport__button :is(svg, [data-slot="spinner"])',
      )
      && !/@layer\s+components\.hraness-design-kit\.priority5/u.test(designStylexCss),
    "PlaybackTransport retained a legacy visual selector or leaked priority5 output.",
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
  const verticalDocument = verticalWritingDocument();
  const requestPaths: string[] = [];
  const clientJavaScriptRequests: string[] = [];
  const fontRequests: string[] = [];
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
      if (pathname === "/security-delivery-vertical.css") {
        return new Response(
          Bun.file(join(repository, "gallery/security-delivery-vertical.css")),
          { headers: { "content-type": "text/css" } },
        );
      }
      if (pathname === "/dist/stylex.css") {
        return new Response(Bun.file(join(repository, "dist/stylex.css")), {
          headers: { "content-type": "text/css" },
        });
      }
      if (pathname.endsWith(".woff2")) {
        fontRequests.push(pathname);
        const fontDirectory = pathname.includes("/fonts/nebula-sans/")
          ? "nebula-sans"
          : pathname.includes("/fonts/geist-mono/")
            ? "geist-mono"
            : undefined;
        if (fontDirectory === undefined) {
          return new Response("Not found", { status: 404 });
        }
        const candidate = join(repository, "src/fonts", fontDirectory, basename(pathname));
        if (!(await Bun.file(candidate).exists())) {
          return new Response("Not found", { status: 404 });
        }
        return new Response(Bun.file(candidate), {
          headers: { "content-type": "font/woff2" },
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
      if (pathname === "/vertical-writing") {
        return new Response(verticalDocument, {
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
  await page.evaluate(async () => {
    await document.fonts.ready;
  });

  invariant(
    fontRequests.length > 0
      && fontRequests.every((pathname) => pathname.includes("NebulaSans-")),
    `The page requested unexpected font assets: ${JSON.stringify(fontRequests)}.`,
  );

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
    noticeEvidence.fontFamily.startsWith('"Nebula Sans", ui-sans-serif, system-ui, -apple-system, ')
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
  const securityPolicyViolations = await page.evaluate(
    () => window.__hranessSecurityDeliveryViolations ?? [],
  );
  invariant(
    securityPolicyViolations.length === 0,
    `The page observed CSP violations: ${JSON.stringify(securityPolicyViolations)}.`,
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
  const faderEvidence = await page.evaluate(() => {
    const matrix = document.querySelector("[data-security-fader-matrix]");
    const root = matrix?.querySelector(".hraness-design-fader");
    const label = root?.querySelector(".hraness-design-fader__label");
    const accessory = root?.querySelector("[data-security-fader-accessory]");
    const output = root?.querySelector(".hraness-design-fader__output");
    const track = root?.querySelector(".hraness-design-fader__track");
    const trackRail = root?.querySelector(".hraness-design-fader__track-rail");
    const fill = root?.querySelector(".hraness-design-fader__fill");
    const fillRail = root?.querySelector(".hraness-design-fader__fill-rail");
    const thumb = root?.querySelector(".hraness-design-fader__thumb");
    const input = thumb?.querySelector('input[type="range"]');
    if (!(matrix instanceof HTMLElement)
      || !(root instanceof HTMLElement)
      || !(label instanceof HTMLElement)
      || !(accessory instanceof HTMLElement)
      || !(output instanceof HTMLOutputElement)
      || !(track instanceof HTMLElement)
      || !(trackRail instanceof HTMLElement)
      || !(fill instanceof HTMLElement)
      || !(fillRail instanceof HTMLElement)
      || !(thumb instanceof HTMLElement)
      || !(input instanceof HTMLInputElement)) {
      throw new Error("The Fader delivery matrix is incomplete.");
    }
    const normalizedMinInlineSize = getComputedStyle(root).minInlineSize;
    root.setAttribute("data-design-kit-stylex-fader-old-parent", "true");
    const oldDirectParentMinInlineSize = getComputedStyle(root).minInlineSize;
    root.removeAttribute("data-design-kit-stylex-fader-old-parent");
    const rootStyle = getComputedStyle(root);
    const trackStyle = getComputedStyle(track);
    const trackRailStyle = getComputedStyle(trackRail);
    const fillRailStyle = getComputedStyle(fillRail);
    const thumbStyle = getComputedStyle(thumb);
    const generatedClasses = (element: HTMLElement, stableClass: string) =>
      [...element.classList].filter((className) =>
        className !== stableClass
        && className !== "security-caller-fader");
    return {
      accessory: accessory.textContent?.trim(),
      callerLastClass: root.classList.item(root.classList.length - 1),
      density: root.dataset.density,
      fillHasReactAriaGeometry: fill.hasAttribute("style"),
      fillRailBackground: fillRailStyle.backgroundColor,
      fillRailClasses: generatedClasses(
        fillRail,
        "hraness-design-fader__fill-rail",
      ),
      fillRailInlineSize: fillRailStyle.inlineSize,
      fillRailIsInert: fillRail.getAttribute("aria-hidden") === "true"
        && fillRail.tabIndex === -1,
      inputOrientation: input.getAttribute("aria-orientation"),
      inputRef: input.dataset.securityFaderInputRef,
      inputValue: input.value,
      labelClasses: generatedClasses(label, "hraness-design-fader__label"),
      labelHasInlineStyle: label.hasAttribute("style"),
      labelText: label.textContent?.replace(/\s+/gu, " ").trim(),
      normalizedMinInlineSize,
      oldDirectParentMinInlineSize,
      orientation: root.dataset.orientation,
      outputClasses: generatedClasses(output, "hraness-design-fader__output"),
      outputHasInlineStyle: output.hasAttribute("style"),
      outputText: output.textContent?.trim(),
      ref: root.dataset.securityFaderRef,
      role: root.getAttribute("role"),
      rootClasses: generatedClasses(root, "hraness-design-fader"),
      rootHasCallerStyle: root.hasAttribute("style"),
      rootLabel: root.getAttribute("aria-label"),
      sentinel: rootStyle
        .getPropertyValue("--design-kit-stylex-fader-conflict")
        .trim(),
      thumbBlockSize: thumbStyle.blockSize,
      thumbClasses: generatedClasses(thumb, "hraness-design-fader__thumb"),
      thumbHasReactAriaGeometry: thumb.hasAttribute("style"),
      thumbInlineSize: thumbStyle.inlineSize,
      thumbVariableBlockSize: rootStyle
        .getPropertyValue("--hraness-design-fader-thumb-block-size")
        .trim(),
      thumbVariableInlineSize: rootStyle
        .getPropertyValue("--hraness-design-fader-thumb-inline-size")
        .trim(),
      trackBlockSize: trackStyle.blockSize,
      trackClasses: generatedClasses(track, "hraness-design-fader__track"),
      trackHasReactAriaGeometry: track.hasAttribute("style"),
      trackInlineSize: trackStyle.inlineSize,
      trackLengthVariable: rootStyle
        .getPropertyValue("--hraness-design-fader-track-length")
        .trim(),
      trackRailBackground: trackRailStyle.backgroundColor,
      trackRailBlockSize: trackRailStyle.blockSize,
      trackRailClasses: generatedClasses(
        trackRail,
        "hraness-design-fader__track-rail",
      ),
      trackRailInlineSize: trackRailStyle.inlineSize,
      trackRailIsInert: trackRail.getAttribute("aria-hidden") === "true"
        && trackRail.tabIndex === -1,
    };
  });
  invariant(
    faderEvidence.normalizedMinInlineSize === "48px"
      && faderEvidence.oldDirectParentMinInlineSize === "88px"
      && faderEvidence.sentinel === "ui-legacy",
    `The real Fader did not distinguish normalized package layers from the matched UI legacy conflict and old direct-parent counterfactual: ${JSON.stringify(faderEvidence)}.`,
  );
  invariant(
    faderEvidence.thumbVariableBlockSize === "20px"
      && faderEvidence.thumbVariableInlineSize === "30px"
      && faderEvidence.trackLengthVariable === "7rem"
      && faderEvidence.thumbBlockSize === "20px"
      && faderEvidence.thumbInlineSize === "30px"
      && faderEvidence.trackBlockSize === "112px"
      && faderEvidence.trackInlineSize === "48px"
      && faderEvidence.trackRailInlineSize === "4px"
      && faderEvidence.trackRailBlockSize === "112px"
      && faderEvidence.fillRailInlineSize === "4px"
      && faderEvidence.trackRailBackground !== "rgba(0, 0, 0, 0)"
      && faderEvidence.fillRailBackground !== "rgba(0, 0, 0, 0)"
      && faderEvidence.trackRailBackground !== faderEvidence.fillRailBackground,
    `The real Fader lost caller-last variables, logical dimensions, or rail presentation: ${JSON.stringify(faderEvidence)}.`,
  );
  invariant(
    faderEvidence.role === "group"
      && faderEvidence.rootLabel === "Security level"
      && faderEvidence.density === "default"
      && faderEvidence.orientation === "vertical"
      && faderEvidence.inputOrientation === "vertical"
      && faderEvidence.inputValue === "40"
      && faderEvidence.outputText === "40"
      && faderEvidence.labelText === "Security gain"
      && faderEvidence.accessory === "dB"
      && faderEvidence.ref === "ready"
      && faderEvidence.inputRef === "ready"
      && faderEvidence.callerLastClass === "security-caller-fader"
      && faderEvidence.rootHasCallerStyle
      && !faderEvidence.labelHasInlineStyle
      && !faderEvidence.outputHasInlineStyle
      && faderEvidence.trackHasReactAriaGeometry
      && faderEvidence.fillHasReactAriaGeometry
      && faderEvidence.thumbHasReactAriaGeometry
      && faderEvidence.trackRailIsInert
      && faderEvidence.fillRailIsInert,
    `The real Fader lost a semantic, ref, stable-hook, caller, or React Aria geometry contract: ${JSON.stringify(faderEvidence)}.`,
  );
  invariant(
    faderEvidence.rootClasses.length === 7
      && faderEvidence.labelClasses.length === 1
      && faderEvidence.outputClasses.length === 1
      && faderEvidence.trackClasses.length === 3
      && faderEvidence.trackRailClasses.length === 6
      && faderEvidence.fillRailClasses.length === 7
      && faderEvidence.thumbClasses.length === 10,
    `The real Fader exposes the wrong atomic class counts: ${JSON.stringify(faderEvidence)}.`,
  );
  const renderedFaderClasses = new Set([
    ...faderEvidence.rootClasses,
    ...faderEvidence.labelClasses,
    ...faderEvidence.outputClasses,
    ...faderEvidence.trackClasses,
    ...faderEvidence.trackRailClasses,
    ...faderEvidence.fillRailClasses,
    ...faderEvidence.thumbClasses,
  ]);
  for (const className of renderedFaderClasses) {
    invariant(
      classSelectorCount(designStylexCss, className) === 1
        && classSelectorCount(combinedCss, className) >= 1,
      `The served Fader class ${className} is missing or duplicated.`,
    );
  }
  const faderInput = page.locator(
    '[data-security-fader-matrix] input[type="range"]',
  );
  const faderThumb = page.locator(
    "[data-security-fader-matrix] .hraness-design-fader__thumb",
  );
  await faderInput.focus();
  await page.keyboard.press("ArrowUp");
  await page.waitForFunction(() =>
    document.querySelector(
      "[data-security-fader-matrix] .hraness-design-fader__thumb",
    )?.hasAttribute("data-focus-visible"));
  const focusedFaderEvidence = await faderThumb.evaluate((thumb) => {
    const style = getComputedStyle(thumb);
    return {
      classes: [...thumb.classList].filter(
        (className) => className !== "hraness-design-fader__thumb",
      ),
      offset: style.outlineOffset,
      style: style.outlineStyle,
      visible: thumb.hasAttribute("data-focus-visible"),
      width: style.outlineWidth,
    };
  });
  invariant(
    Number(await faderInput.inputValue()) === 41
      && await page.locator(
        "[data-security-fader-matrix] .hraness-design-fader__output",
      ).textContent() === "41"
      && focusedFaderEvidence.visible
      && focusedFaderEvidence.width === "3px"
      && focusedFaderEvidence.offset === "3px"
      && focusedFaderEvidence.style === "solid"
      && focusedFaderEvidence.classes.length === 14,
    `The real Fader lost keyboard value or focus-visible behavior: ${JSON.stringify(focusedFaderEvidence)}.`,
  );
  for (const className of focusedFaderEvidence.classes) {
    invariant(
      classSelectorCount(designStylexCss, className) === 1
        && classSelectorCount(combinedCss, className) >= 1,
      `The served focused Fader class ${className} is missing or duplicated.`,
    );
  }
  const playbackTransportEvidence = await page.evaluate(() => {
    const matrix = document.querySelector("[data-security-playback-matrix]");
    const root = matrix?.querySelector(".hraness-design-playback-transport");
    const command = matrix?.querySelector("#security-playback-command");
    const commandHost = command?.closest(
      ".hraness-design-playback-transport__button",
    );
    const glyph = command?.querySelector('[data-slot="spinner"]');
    const trailing = matrix?.querySelector("[data-security-playback-trailing]");
    if (!(matrix instanceof HTMLElement)
      || !(root instanceof HTMLElement)
      || !(command instanceof HTMLButtonElement)
      || !(commandHost instanceof HTMLElement)
      || !(glyph instanceof HTMLElement)
      || !(trailing instanceof HTMLElement)) {
      throw new Error("The PlaybackTransport delivery matrix is incomplete.");
    }
    const normalizedStyle = getComputedStyle(root);
    const normalizedGap = normalizedStyle.gap;
    matrix.setAttribute("data-design-kit-stylex-playback-old-parent", "true");
    const oldDirectParentGap = getComputedStyle(root).gap;
    matrix.removeAttribute("data-design-kit-stylex-playback-old-parent");
    const restoredStyle = getComputedStyle(root);
    const glyphStyle = getComputedStyle(glyph);
    return {
      alignItems: restoredStyle.alignItems,
      ariaBusy: command.getAttribute("aria-busy"),
      ariaLabel: command.getAttribute("aria-label"),
      callerLastClass: root.classList.item(root.classList.length - 1),
      command: command.dataset.playbackCommand,
      commandHostBusy: commandHost.getAttribute("aria-busy"),
      commandHostSize: commandHost.dataset.size,
      commandHostVariant: commandHost.dataset.variant,
      commandId: command.id,
      display: restoredStyle.display,
      flexWrap: restoredStyle.flexWrap,
      glyphBlockSize: glyphStyle.blockSize,
      glyphClasses: [...glyph.classList].filter(
        (className) => className !== "hraness-spinner",
      ),
      glyphHeight: glyphStyle.height,
      glyphInlineSize: glyphStyle.inlineSize,
      glyphSlot: glyph.dataset.slot,
      glyphWidth: glyphStyle.width,
      hasInlineStyle: root.hasAttribute("style"),
      labelledBy: root.getAttribute("aria-labelledby"),
      normalizedGap,
      oldDirectParentGap,
      ref: command.dataset.securityPlaybackRef,
      restoredGap: restoredStyle.gap,
      rootClasses: [...root.classList].filter(
        (className) => ![
          "hraness-toolbar",
          "hraness-design-playback-transport",
          "security-caller-playback-transport",
        ].includes(className),
      ),
      rootHasStableClass: root.classList.contains(
        "hraness-design-playback-transport",
      ),
      rootSlot: root.dataset.slot,
      sentinel: restoredStyle
        .getPropertyValue("--design-kit-stylex-playback-conflict")
        .trim(),
      status: root.dataset.playbackStatus,
      trailingAfterCommand: commandHost.nextElementSibling === trailing,
    };
  });
  invariant(
    playbackTransportEvidence.normalizedGap === "8px"
      && playbackTransportEvidence.oldDirectParentGap === "88px"
      && playbackTransportEvidence.restoredGap === "8px"
      && playbackTransportEvidence.sentinel === "ui-legacy",
    `The real PlaybackTransport did not distinguish normalized package layers from the matched UI legacy conflict and old direct-parent counterfactual: ${JSON.stringify(playbackTransportEvidence)}.`,
  );
  invariant(
    playbackTransportEvidence.display === "flex"
      && playbackTransportEvidence.flexWrap === "wrap"
      && playbackTransportEvidence.alignItems === "center"
      && playbackTransportEvidence.glyphInlineSize === "24px"
      && playbackTransportEvidence.glyphBlockSize === "24px"
      && playbackTransportEvidence.glyphWidth === "24px"
      && playbackTransportEvidence.glyphHeight === "24px"
      && !playbackTransportEvidence.hasInlineStyle,
    `The real PlaybackTransport lost its extracted flex or logical glyph presentation: ${JSON.stringify(playbackTransportEvidence)}.`,
  );
  invariant(
    playbackTransportEvidence.rootHasStableClass
      && playbackTransportEvidence.rootSlot === "toolbar"
      && playbackTransportEvidence.callerLastClass === "security-caller-playback-transport"
      && playbackTransportEvidence.labelledBy === "security-playback-title"
      && playbackTransportEvidence.status === "pending"
      && playbackTransportEvidence.commandId === "security-playback-command"
      && playbackTransportEvidence.command === "stop"
      && playbackTransportEvidence.ariaLabel === "Cancel playback start"
      && playbackTransportEvidence.ariaBusy === null
      && playbackTransportEvidence.commandHostBusy === "true"
      && playbackTransportEvidence.commandHostSize === "large"
      && playbackTransportEvidence.commandHostVariant === "primary"
      && playbackTransportEvidence.glyphSlot === "spinner"
      && playbackTransportEvidence.ref === "ready"
      && playbackTransportEvidence.trailingAfterCommand,
    `The real PlaybackTransport lost a semantic, pending, ref, stable-hook, or trailing-order contract: ${JSON.stringify(playbackTransportEvidence)}.`,
  );
  invariant(
    playbackTransportEvidence.rootClasses.length === 4,
    `The real PlaybackTransport exposes the wrong root atomic class count: ${JSON.stringify(playbackTransportEvidence)}.`,
  );
  for (const className of playbackTransportEvidence.rootClasses) {
    invariant(
      classSelectorCount(designStylexCss, className) === 1
        && classSelectorCount(combinedCss, className) >= 1,
      `The served PlaybackTransport root class ${className} is missing or duplicated.`,
    );
  }
  const renderedPlaybackGlyphClasses = playbackTransportEvidence.glyphClasses.filter(
    (className) => {
      const escaped = escapeRegularExpression(className);
      return new RegExp(
        `\\.${escaped}\\s*\\{[^}]*(?:block-size|inline-size):\\s*1\\.5rem`,
        "u",
      ).test(designStylexCss);
    },
  );
  invariant(
    renderedPlaybackGlyphClasses.length === 2,
    `The real PlaybackTransport exposes the wrong logical glyph atomic classes: ${JSON.stringify(playbackTransportEvidence)}.`,
  );
  for (const className of renderedPlaybackGlyphClasses) {
    invariant(
      classSelectorCount(designStylexCss, className) === 1
        && classSelectorCount(combinedCss, className) >= 1,
      `The served PlaybackTransport glyph class ${className} is missing or duplicated.`,
    );
  }
  const layoutSurfaceEvidence = await page.evaluate(() => {
    const top = document.querySelector('[data-security-layout="top"]');
    const bottom = document.querySelector('[data-security-layout="bottom"]');
    const pageCanvas = document.querySelector('[data-security-layout="page"]');
    const docked = document.querySelector('[data-security-layout="docked"]');
    const dockedContent = docked?.querySelector(
      ".hraness-design-docked-footer__content",
    );
    const dockFrame = docked?.parentElement;
    if (!(top instanceof HTMLElement)
      || !(bottom instanceof HTMLElement)
      || !(pageCanvas instanceof HTMLElement)
      || !(docked instanceof HTMLElement)
      || !(dockedContent instanceof HTMLElement)
      || !(dockFrame instanceof HTMLElement)) {
      throw new Error("The layout-surface delivery matrix is incomplete.");
    }

    const atomicClasses = (element: HTMLElement, excluded: readonly string[]) =>
      [...element.classList].filter((className) => !excluded.includes(className));
    const normalizedTop = getComputedStyle(top).top;
    top.setAttribute("data-design-kit-stylex-layout-old-parent", "true");
    const oldDirectParentTop = getComputedStyle(top).top;
    top.removeAttribute("data-design-kit-stylex-layout-old-parent");
    const restoredTopStyle = getComputedStyle(top);
    const bottomStyle = getComputedStyle(bottom);
    const pageStyle = getComputedStyle(pageCanvas);
    const dockedStyle = getComputedStyle(docked);
    const dockedContentStyle = getComputedStyle(dockedContent);
    const dockedBox = docked.getBoundingClientRect();
    const dockFrameBox = dockFrame.getBoundingClientRect();

    return {
      bottomBackground: bottomStyle.backgroundColor,
      bottomBorderTopWidth: bottomStyle.borderTopWidth,
      bottomClasses: atomicClasses(bottom, [
        "hraness-design-bottom-bar",
        "security-caller-bottom-bar",
      ]),
      bottomDisplay: bottomStyle.display,
      bottomTag: bottom.tagName,
      dockedBackground: dockedStyle.backgroundColor,
      dockedBottom: dockedStyle.bottom,
      dockedClasses: atomicClasses(docked, [
        "hraness-design-docked-footer",
        "security-caller-docked-footer",
      ]),
      dockedContained:
        dockedBox.left >= dockFrameBox.left - 1
        && dockedBox.right <= dockFrameBox.right + 1
        && dockedBox.top >= dockFrameBox.top - 1
        && dockedBox.bottom <= dockFrameBox.bottom + 1,
      dockedContentClasses: atomicClasses(dockedContent, [
        "hraness-design-docked-footer__content",
        "security-caller-docked-content",
      ]),
      dockedContentLastClass: dockedContent.classList.item(
        dockedContent.classList.length - 1,
      ),
      dockedContentPaddingTop: dockedContentStyle.paddingTop,
      dockedDensity: dockedContent.dataset.density,
      dockedInset: dockedContent.dataset.inset,
      dockedLastClass: docked.classList.item(docked.classList.length - 1),
      dockedPosition: dockedStyle.position,
      dockedRef: docked.dataset.securityDockedRef,
      dockedSize: dockedContent.dataset.size,
      dockedSurface: docked.dataset.surface,
      dockedTag: docked.tagName,
      normalizedTop,
      oldDirectParentTop,
      pageClasses: atomicClasses(pageCanvas, [
        "hraness-design-page-canvas",
        "security-caller-page-canvas",
      ]),
      pageInset: pageCanvas.dataset.inset,
      pageLastClass: pageCanvas.classList.item(pageCanvas.classList.length - 1),
      pagePaddingLeft: pageStyle.paddingLeft,
      pageSize: pageCanvas.dataset.size,
      pageTag: pageCanvas.tagName,
      pageWidth: pageCanvas.getBoundingClientRect().width,
      restoredTop: restoredTopStyle.top,
      topBackdropFilter: restoredTopStyle.backdropFilter,
      topBackgroundImage: restoredTopStyle.backgroundImage,
      topBackgroundSize: restoredTopStyle.backgroundSize,
      topClasses: atomicClasses(top, [
        "hraness-design-top-bar",
        "security-caller-top-bar",
      ]),
      topConflictSentinel: restoredTopStyle
        .getPropertyValue("--design-kit-stylex-layout-conflict")
        .trim(),
      topDisplay: restoredTopStyle.display,
      topLastClass: top.classList.item(top.classList.length - 1),
      topPosition: restoredTopStyle.position,
      topPositionHook: top.dataset.position,
      topSurface: top.dataset.surface,
      topTag: top.tagName,
      topZIndex: restoredTopStyle.zIndex,
    };
  });
  invariant(
    layoutSurfaceEvidence.normalizedTop === "0px"
      && layoutSurfaceEvidence.oldDirectParentTop === "88px"
      && layoutSurfaceEvidence.restoredTop === "0px"
      && layoutSurfaceEvidence.topConflictSentinel === "design-kit-priority2",
    `The real TopBar did not distinguish priority4 output from the priority2 match and old direct-parent negative control: ${JSON.stringify(layoutSurfaceEvidence)}.`,
  );
  invariant(
    layoutSurfaceEvidence.topTag === "HEADER"
      && layoutSurfaceEvidence.topPositionHook === "sticky"
      && layoutSurfaceEvidence.topSurface === "glass"
      && layoutSurfaceEvidence.topDisplay === "flex"
      && layoutSurfaceEvidence.topPosition === "sticky"
      && layoutSurfaceEvidence.topBackdropFilter.includes("blur")
      && layoutSurfaceEvidence.topBackgroundImage === "none"
      && layoutSurfaceEvidence.topBackgroundSize === "auto"
      && layoutSurfaceEvidence.topZIndex === "321"
      && layoutSurfaceEvidence.topLastClass === "security-caller-top-bar",
    `The real TopBar lost native semantics, variants, glass presentation, or caller-last behavior: ${JSON.stringify(layoutSurfaceEvidence)}.`,
  );
  invariant(
    layoutSurfaceEvidence.bottomTag === "FOOTER"
      && layoutSurfaceEvidence.bottomDisplay === "flex"
      && layoutSurfaceEvidence.bottomBorderTopWidth === "1px"
      && layoutSurfaceEvidence.dockedTag === "FOOTER"
      && layoutSurfaceEvidence.dockedPosition === "absolute"
      && layoutSurfaceEvidence.dockedBottom === "0px"
      && layoutSurfaceEvidence.dockedSurface === "glass"
      && layoutSurfaceEvidence.dockedDensity === "compact"
      && layoutSurfaceEvidence.dockedInset === "none"
      && layoutSurfaceEvidence.dockedSize === "wide"
      && layoutSurfaceEvidence.dockedRef === "ready"
      && layoutSurfaceEvidence.dockedContained
      && layoutSurfaceEvidence.dockedContentPaddingTop === "4px"
      && layoutSurfaceEvidence.dockedBackground === layoutSurfaceEvidence.bottomBackground
      && layoutSurfaceEvidence.dockedLastClass === "security-caller-docked-footer"
      && layoutSurfaceEvidence.dockedContentLastClass === "security-caller-docked-content",
    `The real BottomBar or DockedFooter lost presentation, inert glass hook, containment, or ref/caller behavior: ${JSON.stringify(layoutSurfaceEvidence)}.`,
  );
  invariant(
    layoutSurfaceEvidence.pageTag === "DIV"
      && layoutSurfaceEvidence.pageInset === "none"
      && layoutSurfaceEvidence.pageSize === "wide"
      && layoutSurfaceEvidence.pagePaddingLeft === "0px"
      && layoutSurfaceEvidence.pageWidth > 0
      && layoutSurfaceEvidence.pageLastClass === "security-caller-page-canvas",
    `The real PageCanvas lost native, finite-variant, or caller-last behavior: ${JSON.stringify(layoutSurfaceEvidence)}.`,
  );
  const verticalPage = await browser.newPage();
  const verticalNavigation = await verticalPage.goto(`${origin}/vertical-writing`, {
    waitUntil: "load",
  });
  invariant(verticalNavigation !== null, "The vertical-writing navigation returned no response.");
  invariant(
    verticalNavigation.headers()["content-security-policy"] === contentSecurityPolicy,
    "The vertical-writing response did not carry the exact CSP.",
  );
  const verticalWritingEvidence = await verticalPage.evaluate(() => {
    const top = document.querySelector('[data-security-vertical-layout="top"]');
    const bottom = document.querySelector('[data-security-vertical-layout="bottom"]');
    const pageWide = document.querySelector('[data-security-vertical-layout="page-wide"]');
    const pageFull = document.querySelector('[data-security-vertical-layout="page-full"]');
    const docked = document.querySelector('[data-security-vertical-layout="docked"]');
    const dockedContent = docked?.querySelector(
      ".hraness-design-docked-footer__content",
    );
    const dockFrame = docked?.parentElement;
    if (!(top instanceof HTMLElement)
      || !(bottom instanceof HTMLElement)
      || !(pageWide instanceof HTMLElement)
      || !(pageFull instanceof HTMLElement)
      || !(docked instanceof HTMLElement)
      || !(dockedContent instanceof HTMLElement)
      || !(dockFrame instanceof HTMLElement)) {
      throw new Error("The vertical-writing layout-surface matrix is incomplete.");
    }

    const topStyle = getComputedStyle(top);
    const bottomStyle = getComputedStyle(bottom);
    const pageWideStyle = getComputedStyle(pageWide);
    const pageFullStyle = getComputedStyle(pageFull);
    const dockedStyle = getComputedStyle(docked);
    const dockedContentStyle = getComputedStyle(dockedContent);
    const topBox = top.getBoundingClientRect();
    const bottomBox = bottom.getBoundingClientRect();
    const pageWideBox = pageWide.getBoundingClientRect();
    const pageFullBox = pageFull.getBoundingClientRect();
    const dockedBox = docked.getBoundingClientRect();
    const dockedContentBox = dockedContent.getBoundingClientRect();
    const dockFrameBox = dockFrame.getBoundingClientRect();

    return {
      bottomHeight: bottomBox.height,
      bottomMinBlockSize: bottomStyle.getPropertyValue("min-block-size"),
      bottomMinHeight: bottomStyle.minHeight,
      bottomMinInlineSize: bottomStyle.getPropertyValue("min-inline-size"),
      bottomMinWidth: bottomStyle.minWidth,
      bottomWidth: bottomBox.width,
      dockedBottom: dockedStyle.bottom,
      dockedContentHeight: dockedContentBox.height,
      dockedContentInlineSize: dockedContentStyle.getPropertyValue("inline-size"),
      dockedContentMaxInlineSize: dockedContentStyle.getPropertyValue("max-inline-size"),
      dockedContentPaddingBlockEnd: dockedContentStyle.getPropertyValue("padding-block-end"),
      dockedContentPaddingBlockStart: dockedContentStyle.getPropertyValue("padding-block-start"),
      dockedContentPaddingBottom: dockedContentStyle.paddingBottom,
      dockedContentPaddingInlineEnd: dockedContentStyle.getPropertyValue("padding-inline-end"),
      dockedContentPaddingInlineStart: dockedContentStyle.getPropertyValue("padding-inline-start"),
      dockedContentPaddingLeft: dockedContentStyle.paddingLeft,
      dockedContentPaddingRight: dockedContentStyle.paddingRight,
      dockedContentPaddingTop: dockedContentStyle.paddingTop,
      dockedContentWidth: dockedContentBox.width,
      dockedFrameHeight: dockFrameBox.height,
      dockedHeight: dockedBox.height,
      dockedInsetInlineEnd: dockedStyle.getPropertyValue("inset-inline-end"),
      dockedInsetInlineStart: dockedStyle.getPropertyValue("inset-inline-start"),
      dockedTop: dockedStyle.top,
      pageFullHeight: pageFullBox.height,
      pageFullInlineSize: pageFullStyle.getPropertyValue("inline-size"),
      pageFullMaxInlineSize: pageFullStyle.getPropertyValue("max-inline-size"),
      pageFullPaddingBottom: pageFullStyle.paddingBottom,
      pageFullPaddingTop: pageFullStyle.paddingTop,
      pageFullWidth: pageFullBox.width,
      pageWideHeight: pageWideBox.height,
      pageWideInlineSize: pageWideStyle.getPropertyValue("inline-size"),
      pageWideMaxInlineSize: pageWideStyle.getPropertyValue("max-inline-size"),
      pageWidePaddingBottom: pageWideStyle.paddingBottom,
      pageWidePaddingInlineEnd: pageWideStyle.getPropertyValue("padding-inline-end"),
      pageWidePaddingInlineStart: pageWideStyle.getPropertyValue("padding-inline-start"),
      pageWidePaddingTop: pageWideStyle.paddingTop,
      pageWideWidth: pageWideBox.width,
      topHeight: topBox.height,
      topMinBlockSize: topStyle.getPropertyValue("min-block-size"),
      topMinHeight: topStyle.minHeight,
      topMinInlineSize: topStyle.getPropertyValue("min-inline-size"),
      topMinWidth: topStyle.minWidth,
      topWidth: topBox.width,
      writingMode: topStyle.writingMode,
    };
  });
  const approximately = (actual: number, expected: number) =>
    Math.abs(actual - expected) < 0.75;
  invariant(
    verticalWritingEvidence.writingMode === "vertical-rl"
      && verticalWritingEvidence.topMinBlockSize === "31px"
      && verticalWritingEvidence.topMinInlineSize === "0px"
      && verticalWritingEvidence.topMinWidth === "31px"
      && verticalWritingEvidence.topMinHeight === "0px"
      && verticalWritingEvidence.topWidth >= 31
      && verticalWritingEvidence.topHeight > verticalWritingEvidence.topWidth
      && verticalWritingEvidence.bottomMinBlockSize === "29px"
      && verticalWritingEvidence.bottomMinInlineSize === "0px"
      && verticalWritingEvidence.bottomMinWidth === "29px"
      && verticalWritingEvidence.bottomMinHeight === "0px"
      && verticalWritingEvidence.bottomWidth >= 29
      && verticalWritingEvidence.bottomHeight > verticalWritingEvidence.bottomWidth,
    `Vertical writing did not preserve the TopBar and BottomBar logical minimum axes: ${JSON.stringify(verticalWritingEvidence)}.`,
  );
  invariant(
    verticalWritingEvidence.pageWideInlineSize === "144px"
      && verticalWritingEvidence.pageWideMaxInlineSize === "144px"
      && approximately(verticalWritingEvidence.pageWideHeight, 144)
      && !approximately(verticalWritingEvidence.pageWideWidth, 144)
      && verticalWritingEvidence.pageWidePaddingInlineStart === "13px"
      && verticalWritingEvidence.pageWidePaddingInlineEnd === "13px"
      && verticalWritingEvidence.pageWidePaddingTop === "13px"
      && verticalWritingEvidence.pageWidePaddingBottom === "13px"
      && verticalWritingEvidence.pageFullInlineSize === "192px"
      && verticalWritingEvidence.pageFullMaxInlineSize === "none"
      && approximately(verticalWritingEvidence.pageFullHeight, 192)
      && !approximately(verticalWritingEvidence.pageFullWidth, 192)
      && verticalWritingEvidence.pageFullPaddingTop === "0px"
      && verticalWritingEvidence.pageFullPaddingBottom === "0px",
    `Vertical writing did not preserve PageCanvas logical inline sizing, caps, and insets: ${JSON.stringify(verticalWritingEvidence)}.`,
  );
  invariant(
    verticalWritingEvidence.dockedContentInlineSize === "144px"
      && verticalWritingEvidence.dockedContentMaxInlineSize === "144px"
      && approximately(verticalWritingEvidence.dockedContentHeight, 144)
      && !approximately(verticalWritingEvidence.dockedContentWidth, 144)
      && verticalWritingEvidence.dockedContentPaddingInlineStart === "13px"
      && verticalWritingEvidence.dockedContentPaddingInlineEnd === "13px"
      && verticalWritingEvidence.dockedContentPaddingBlockStart === "7px"
      && verticalWritingEvidence.dockedContentPaddingBlockEnd === "7px"
      && verticalWritingEvidence.dockedContentPaddingTop === "13px"
      && verticalWritingEvidence.dockedContentPaddingBottom === "13px"
      && verticalWritingEvidence.dockedContentPaddingRight === "7px"
      && verticalWritingEvidence.dockedContentPaddingLeft === "7px"
      && verticalWritingEvidence.dockedInsetInlineStart === "0px"
      && verticalWritingEvidence.dockedInsetInlineEnd === "0px"
      && verticalWritingEvidence.dockedTop === "0px"
      && verticalWritingEvidence.dockedBottom === "0px"
      && approximately(
        verticalWritingEvidence.dockedHeight,
        verticalWritingEvidence.dockedFrameHeight,
      ),
    `Vertical writing did not preserve DockedFooter logical inline sizing, cap, or distinct block/inline padding axes: ${JSON.stringify(verticalWritingEvidence)}.`,
  );
  await verticalPage.close();
  const renderedLayoutClasses = [
    ...layoutSurfaceEvidence.topClasses,
    ...layoutSurfaceEvidence.bottomClasses,
    ...layoutSurfaceEvidence.pageClasses,
    ...layoutSurfaceEvidence.dockedClasses,
    ...layoutSurfaceEvidence.dockedContentClasses,
  ].filter((className) => classSelectorCount(designStylexCss, className) === 1);
  invariant(
    new Set(renderedLayoutClasses).size >= 12,
    `The real layout surfaces expose too few design-kit atomic classes: ${JSON.stringify(layoutSurfaceEvidence)}.`,
  );
  for (const className of new Set(renderedLayoutClasses)) {
    invariant(
      classSelectorCount(designStylexCss, className) === 1,
      `The design-kit StyleX artifact contains the wrong selector count for rendered layout-surface class ${className}.`,
    );
    invariant(
      classSelectorCount(combinedCss, className) >= 1,
      `The served aggregate CSS does not contain rendered layout-surface class ${className}.`,
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
  const forcedColorFaderEvidence = await page.evaluate(() => {
    const root = document.querySelector(
      "[data-security-fader-matrix] .hraness-design-fader",
    );
    const label = root?.querySelector(".hraness-design-fader__label");
    const output = root?.querySelector(".hraness-design-fader__output");
    const input = root?.querySelector('input[type="range"]');
    const rails = root?.querySelectorAll(
      ".hraness-design-fader__track-rail, .hraness-design-fader__fill-rail",
    );
    if (!(root instanceof HTMLElement)
      || !(label instanceof HTMLElement)
      || !(output instanceof HTMLOutputElement)
      || !(input instanceof HTMLInputElement)
      || rails === undefined) {
      throw new Error("The forced-colors Fader matrix is incomplete.");
    }
    return {
      inputOrientation: input.getAttribute("aria-orientation"),
      inputValue: input.value,
      label: label.textContent?.replace(/\s+/gu, " ").trim(),
      output: output.textContent?.trim(),
      railCount: rails.length,
      railsHidden: [...rails].every(
        (rail) => rail.getAttribute("aria-hidden") === "true",
      ),
      role: root.getAttribute("role"),
      rootLabel: root.getAttribute("aria-label"),
    };
  });
  invariant(
    forcedColorFaderEvidence.role === "group"
      && forcedColorFaderEvidence.rootLabel === "Security level"
      && forcedColorFaderEvidence.inputOrientation === "vertical"
      && forcedColorFaderEvidence.inputValue === "41"
      && forcedColorFaderEvidence.output === "41"
      && forcedColorFaderEvidence.label === "Security gain"
      && forcedColorFaderEvidence.railCount === 2
      && forcedColorFaderEvidence.railsHidden,
    `Forced-colors mode did not preserve Fader semantics and value content: ${JSON.stringify(forcedColorFaderEvidence)}.`,
  );
  const forcedColorLayoutEvidence = await page.evaluate(() => {
    const top = document.querySelector('[data-security-layout="top"]');
    const bottom = document.querySelector('[data-security-layout="bottom"]');
    const docked = document.querySelector('[data-security-layout="docked"]');
    if (!(top instanceof HTMLElement)
      || !(bottom instanceof HTMLElement)
      || !(docked instanceof HTMLElement)) {
      throw new Error("The forced-colors layout-surface matrix is incomplete.");
    }
    const probe = document.createElement("span");
    probe.style.backgroundColor = "Canvas";
    probe.style.color = "CanvasText";
    document.body.append(probe);
    const probeStyle = getComputedStyle(probe);
    const canvas = probeStyle.backgroundColor;
    const canvasText = probeStyle.color;
    probe.remove();
    const topStyle = getComputedStyle(top);
    const bottomStyle = getComputedStyle(bottom);
    const dockedStyle = getComputedStyle(docked);
    return {
      backgrounds: [
        topStyle.backgroundColor,
        bottomStyle.backgroundColor,
        dockedStyle.backgroundColor,
      ],
      backgroundImages: [
        topStyle.backgroundImage,
        bottomStyle.backgroundImage,
        dockedStyle.backgroundImage,
      ],
      bottomBorder: bottomStyle.borderTopColor,
      canvas,
      canvasText,
      dockedBorder: dockedStyle.borderTopColor,
      inlineBorders: [
        topStyle.borderLeftColor,
        topStyle.borderRightColor,
        bottomStyle.borderLeftColor,
        bottomStyle.borderRightColor,
        dockedStyle.borderLeftColor,
        dockedStyle.borderRightColor,
      ],
      text: [top.textContent, bottom.textContent, docked.textContent],
      topBackdropFilter: topStyle.backdropFilter,
      topBorder: topStyle.borderBottomColor,
    };
  });
  invariant(
    forcedColorLayoutEvidence.backgrounds.every(
      (background) => background === forcedColorLayoutEvidence.canvas,
    )
      && forcedColorLayoutEvidence.backgroundImages.every(
        (backgroundImage) => backgroundImage === "none",
      )
      && forcedColorLayoutEvidence.topBorder === forcedColorLayoutEvidence.canvasText
      && forcedColorLayoutEvidence.bottomBorder === forcedColorLayoutEvidence.canvasText
      && forcedColorLayoutEvidence.dockedBorder === forcedColorLayoutEvidence.canvasText
      && forcedColorLayoutEvidence.inlineBorders.every(
        (border) => border === forcedColorLayoutEvidence.canvasText,
      )
      && forcedColorLayoutEvidence.topBackdropFilter === "none"
      && forcedColorLayoutEvidence.text.every(
        (content) => content !== null && content.trim().length > 0,
      ),
    `Forced-colors mode did not preserve layout content while normalizing chrome: ${JSON.stringify(forcedColorLayoutEvidence)}.`,
  );
  const forcedColorPlaybackEvidence = await page.evaluate(() => {
    const root = document.querySelector(".security-caller-playback-transport");
    const command = document.querySelector("#security-playback-command");
    const glyph = command?.querySelector('[data-slot="spinner"]');
    const trailing = document.querySelector("[data-security-playback-trailing]");
    if (!(root instanceof HTMLElement)
      || !(command instanceof HTMLButtonElement)
      || !(glyph instanceof HTMLElement)
      || !(trailing instanceof HTMLElement)) {
      throw new Error("The forced-colors PlaybackTransport matrix is incomplete.");
    }
    const probe = document.createElement("span");
    probe.style.backgroundColor = "ButtonFace";
    probe.style.color = "ButtonText";
    probe.style.borderColor = "CanvasText";
    probe.style.borderStyle = "solid";
    document.body.append(probe);
    const probeStyle = getComputedStyle(probe);
    const buttonFace = probeStyle.backgroundColor;
    const buttonText = probeStyle.color;
    const canvasText = probeStyle.borderColor;
    probe.remove();
    const commandStyle = getComputedStyle(command);
    const glyphStyle = getComputedStyle(glyph);
    return {
      buttonFace,
      buttonText,
      canvasText,
      commandBackground: commandStyle.backgroundColor,
      commandBorder: commandStyle.borderColor,
      commandColor: commandStyle.color,
      commandForcedColorAdjust: commandStyle.forcedColorAdjust,
      glyphBlockSize: glyphStyle.blockSize,
      glyphBorderBlockStartColor: glyphStyle.borderBlockStartColor,
      glyphInlineSize: glyphStyle.inlineSize,
      glyphVisible: glyph.getBoundingClientRect().width > 0
        && glyph.getBoundingClientRect().height > 0,
      rootText: root.textContent?.trim(),
      trailingText: trailing.textContent?.trim(),
    };
  });
  invariant(
    forcedColorPlaybackEvidence.commandBackground
      === forcedColorPlaybackEvidence.buttonFace
      && forcedColorPlaybackEvidence.commandColor
        === forcedColorPlaybackEvidence.buttonText
      && forcedColorPlaybackEvidence.commandBorder
        === forcedColorPlaybackEvidence.canvasText
      && forcedColorPlaybackEvidence.commandForcedColorAdjust === "auto"
      && forcedColorPlaybackEvidence.glyphBorderBlockStartColor
        === forcedColorPlaybackEvidence.commandColor
      && forcedColorPlaybackEvidence.glyphInlineSize === "24px"
      && forcedColorPlaybackEvidence.glyphBlockSize === "24px"
      && forcedColorPlaybackEvidence.glyphVisible
      && forcedColorPlaybackEvidence.rootText?.includes("Trailing control") === true
      && forcedColorPlaybackEvidence.trailingText === "Trailing control",
    `Forced-colors mode did not preserve PlaybackTransport command, spinner, or trailing content: ${JSON.stringify(forcedColorPlaybackEvidence)}.`,
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
    requestPaths.every((path) => path.startsWith("/fonts/nebula-sans/NebulaSans-")
      || [
        "/",
        "/dist/stylex.css",
        "/favicon.ico",
        "/security-delivery.css",
        "/security-delivery-vertical.css",
        "/vertical-writing",
        `/${hydrationFileName}`,
      ].includes(path)),
    `The fixture requested an unexpected resource: ${JSON.stringify(requestPaths)}.`,
  );

  console.log(
    "Security delivery canary passed classic React SSR streaming, nonce-strict scripts and style elements with style attributes permitted, packed cross-package StyleX layers, DitherSurface evidence, Fader semantic/ref/caller/cascade/keyboard/focus/forced-color evidence, layout-surface native/ref/caller/cascade/forced-color/vertical-writing evidence, PlaybackTransport semantic/ref/cascade/logical-size/forced-color evidence, hydration, and real portal checks. It intentionally externalizes React Aria's permanent pressable rule through a bounded style-id bridge. The fixture excludes Jelly surfaces; Jelly's vendor-owned permanent style still needs a separate nonce solution or broader style policy.",
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
