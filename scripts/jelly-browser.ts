import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium, type Browser, type Page } from "playwright-core";
import { createElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { builtDesignKitReact } from "../gallery/built-react.js";

const repository = process.cwd();
const { JellySurface } = builtDesignKitReact;

type JellyFixtureProps = ComponentProps<typeof JellySurface> & Readonly<{
  "data-jelly-fixture": SurfaceId;
}>;

type SurfaceId =
  | "caller"
  | "danger"
  | "disabled"
  | "field"
  | "neutral"
  | "overlay"
  | "pending"
  | "primary"
  | "quiet";

interface SurfaceContract {
  readonly fill: string;
  readonly interaction: "field" | "passive" | "press";
  readonly label: string;
  readonly radius: string;
  readonly tone: "danger" | "field" | "neutral" | "overlay" | "primary" | "quiet";
}

interface SurfaceEvidence {
  readonly backgroundColor: string;
  readonly borderRadius: string;
  readonly boxShadow: string;
  readonly classNames: readonly string[];
  readonly color: string;
  readonly cursor: string;
  readonly dataDisabled: string | null;
  readonly dataHovered: string | null;
  readonly dataInteraction: string | null;
  readonly dataPending: string | null;
  readonly dataTone: string | null;
  readonly defined: boolean;
  readonly expectedFillColor: string;
  readonly expectedLabelColor: string;
  readonly expectedRadius: string;
  readonly fillColor: string;
  readonly fillVariable: string;
  readonly fontFamily: string;
  readonly fontSize: string;
  readonly fontStyle: string;
  readonly fontWeight: string;
  readonly labelVariable: string;
  readonly lineHeight: string;
  readonly opacity: string;
  readonly parentFontFamily: string;
  readonly parentFontSize: string;
  readonly parentFontStyle: string;
  readonly parentFontWeight: string;
  readonly parentLineHeight: string;
  readonly radiusVariable: string;
  readonly shadowCard: boolean;
  readonly shadowCardRole: string | null;
  readonly shadowCardTabIndex: string | null;
  readonly shadowCanvas: boolean;
  readonly tagName: string;
}

interface FallbackEvidence {
  readonly backgroundColor: string;
  readonly borderColor: string;
  readonly borderStyle: string;
  readonly borderWidth: string;
  readonly boxShadow: string;
  readonly classNames: readonly string[];
  readonly customElementRegistered: boolean;
  readonly defined: boolean;
  readonly expectedBorderColor: string;
  readonly expectedFillColor: string;
  readonly expectedShadow: string;
  readonly nativeButtonCount: number;
  readonly shadowRoot: boolean;
}

const expectedSurfaces: Readonly<Record<SurfaceId, SurfaceContract>> = {
  caller: {
    fill: "var(--surface-raised)",
    interaction: "passive",
    label: "var(--foreground)",
    radius: "var(--jelly-radius-card)",
    tone: "neutral",
  },
  danger: {
    fill: "var(--danger)",
    interaction: "passive",
    label: "var(--background)",
    radius: "var(--jelly-radius-card)",
    tone: "danger",
  },
  disabled: {
    fill: "color-mix(in oklch, var(--surface-raised) 86%, var(--background))",
    interaction: "press",
    label: "var(--disabled-foreground)",
    radius: "var(--jelly-radius-card)",
    tone: "neutral",
  },
  field: {
    fill: "color-mix(in oklch, var(--surface-raised) 88%, var(--background))",
    interaction: "field",
    label: "var(--foreground)",
    radius: "var(--jelly-radius-control)",
    tone: "field",
  },
  neutral: {
    fill: "var(--surface-raised)",
    interaction: "press",
    label: "var(--foreground)",
    radius: "var(--jelly-radius-card)",
    tone: "neutral",
  },
  overlay: {
    fill: "var(--popover)",
    interaction: "passive",
    label: "var(--popover-foreground)",
    radius: "var(--jelly-radius-overlay)",
    tone: "overlay",
  },
  pending: {
    fill: "color-mix(in oklch, var(--surface-raised) 86%, var(--background))",
    interaction: "press",
    label: "var(--disabled-foreground)",
    radius: "var(--jelly-radius-card)",
    tone: "primary",
  },
  primary: {
    fill: "var(--primary)",
    interaction: "press",
    label: "var(--primary-foreground)",
    radius: "var(--jelly-radius-card)",
    tone: "primary",
  },
  quiet: {
    fill: "color-mix(in oklch, var(--surface) 64%, transparent)",
    interaction: "passive",
    label: "var(--muted)",
    radius: "var(--jelly-radius-card)",
    tone: "quiet",
  },
};

const surfaceIds = [
  "neutral",
  "primary",
  "quiet",
  "danger",
  "field",
  "overlay",
  "disabled",
  "pending",
  "caller",
] as const satisfies readonly SurfaceId[];

const clientSurfaces = [
  { id: "neutral", interaction: "press", tone: "neutral" },
  { id: "primary", interaction: "press", tone: "primary" },
  { id: "quiet", interaction: "passive", tone: "quiet" },
  { id: "danger", interaction: "passive", tone: "danger" },
  { id: "field", interaction: "field", tone: "field" },
  { id: "overlay", interaction: "passive", tone: "overlay" },
  { disabled: true, id: "disabled", interaction: "press", tone: "neutral" },
  { id: "pending", interaction: "press", pending: true, tone: "primary" },
  { caller: true, id: "caller", interaction: "passive", tone: "neutral" },
] as const;

const fixtureStyle = `
html[data-jelly-browser] {
  --background: rgb(249 247 245);
  --surface: rgb(239 233 227);
  --surface-raised: rgb(223 211 201);
  --surface-hover: rgb(197 224 219);
  --foreground: rgb(35 29 27);
  --muted: rgb(92 81 76);
  --primary: rgb(25 110 125);
  --primary-foreground: rgb(250 251 251);
  --danger: rgb(174 48 58);
  --popover: rgb(230 220 250);
  --popover-foreground: rgb(47 34 73);
  --disabled-foreground: rgb(115 111 108);
  --line: rgb(131 115 105);
  --focus: rgb(20 91 117);
  --grid: rgb(215 207 199);
  --warning: rgb(185 118 22);
  --info: rgb(35 102 178);
  --success: rgb(39 122 75);
  --font-text: system-ui, sans-serif;
  --font-mono: ui-monospace, monospace;
  --jelly-color-background-surface: rgb(7 8 9);
  --jelly-color-foreground-default: rgb(10 11 12);
  --jelly-radius-control: 17px;
  --jelly-radius-card: 23px;
  --jelly-radius-overlay: 29px;
  --jelly-shadow-raised: 0 7px 19px -3px rgb(1 2 3 / 55%);
  color-scheme: light;
}

body {
  margin: 24px;
  background: var(--background);
  color: var(--foreground);
  font: italic 537 17px/1.4 var(--font-text);
}

.jelly-browser-matrix {
  display: grid;
  grid-template-columns: repeat(3, minmax(12rem, 1fr));
  gap: 18px;
}

.jelly-browser-matrix > jelly-card {
  min-block-size: 64px;
  min-inline-size: 160px;
}

.jelly-browser-content,
.jelly-browser-native {
  box-sizing: border-box;
  display: block;
  inline-size: 100%;
  min-block-size: 64px;
  padding: 18px;
}

#jelly-browser-outside {
  inline-size: 24px;
  block-size: 24px;
}
`;

function invariant(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message);
}

function escapeRegularExpression(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function atomicClasses(classNames: readonly string[]): string[] {
  return classNames.filter((className) => /^x[a-z0-9]+$/u.test(className));
}

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
    "No Chromium executable found. Set CHROMIUM_EXECUTABLE_PATH to run the Jelly browser test.",
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
    "The Jelly port probe did not receive a network address.",
  );
  await new Promise<void>((resolve, reject) => {
    probe.close((error) => error === undefined ? resolve() : reject(error));
  });
  return address.port;
}

function stylesheetLinks(): string {
  return [
    '<link rel="stylesheet" href="/jelly.css">',
    '<link rel="stylesheet" href="/stylex.css">',
    `<style>${fixtureStyle}</style>`,
  ].join("");
}

function documentShell(markup: string, script?: string): string {
  const client = script === undefined
    ? ""
    : `<script type="module" src="/${script}"></script>`;
  return [
    "<!doctype html>",
    '<html data-jelly-browser lang="en">',
    `<head><meta charset="utf-8"><meta name="viewport" content="width=device-width">${stylesheetLinks()}</head>`,
    `<body>${markup}${client}</body></html>`,
  ].join("");
}

function renderFallbackSurface(): string {
  const props = {
    children: createElement(
      "button",
      { className: "jelly-browser-native", type: "button" },
      "Static native action",
    ),
    className: "jelly-browser-caller-neutral",
    "data-jelly-fixture": "neutral",
    id: "jelly-static-neutral",
    interaction: "press",
    tone: "neutral",
  } satisfies JellyFixtureProps;
  return renderToStaticMarkup(createElement(JellySurface, props));
}

function clientSource(): string {
  const react = fileURLToPath(import.meta.resolve("react"));
  const reactDomClient = fileURLToPath(import.meta.resolve("react-dom/client"));
  const builtReact = join(repository, "dist/react/index.js");
  return `
import { createElement } from ${JSON.stringify(react)};
import { createRoot } from ${JSON.stringify(reactDomClient)};
import { JellySurface } from ${JSON.stringify(builtReact)};

const surfaces = ${JSON.stringify(clientSurfaces)};
const root = document.querySelector("#jelly-browser-root");
if (!(root instanceof HTMLElement)) throw new Error("The Jelly fixture root is unavailable.");

function content(surface) {
  if (surface.id === "neutral") {
    return createElement(
      "button",
      { className: "jelly-browser-native", id: "jelly-native-command", type: "button" },
      "Native Jelly action",
    );
  }
  if (surface.id === "field") {
    return createElement("input", {
      "aria-label": "Native Jelly field",
      className: "jelly-browser-native",
      defaultValue: "Native field value",
    });
  }
  return createElement(
    "span",
    { className: "jelly-browser-content" },
    surface.id + " surface",
  );
}

createRoot(root).render(createElement(
  "main",
  { className: "jelly-browser-matrix" },
  surfaces.map((surface) => createElement(JellySurface, {
    ...(surface.caller ? {
      style: { backgroundColor: "rgb(17, 34, 51)", opacity: 0.73 },
    } : {}),
    children: content(surface),
    className: "jelly-browser-caller-" + surface.id,
    "data-jelly-fixture": surface.id,
    id: "jelly-" + surface.id,
    interaction: surface.interaction,
    isDisabled: surface.disabled === true,
    isPending: surface.pending === true,
    key: surface.id,
    tone: surface.tone,
  })),
));
`;
}

async function surfaceEvidence(
  page: Page,
  id: SurfaceId,
  contract: SurfaceContract,
): Promise<SurfaceEvidence> {
  return page.evaluate(({ contract, id }) => {
    const element = document.querySelector(`[data-jelly-fixture="${id}"]`);
    if (!(element instanceof HTMLElement)) {
      throw new Error(`The ${id} Jelly surface is unavailable.`);
    }
    const expectedFill = document.createElement("span");
    const actualFill = document.createElement("span");
    const expectedLabel = document.createElement("span");
    const expectedRadius = document.createElement("span");
    expectedFill.style.backgroundColor = contract.fill;
    actualFill.style.backgroundColor = "var(--jelly-fill)";
    expectedLabel.style.color = contract.label;
    expectedRadius.style.borderRadius = contract.radius;
    document.body.append(expectedFill, expectedLabel, expectedRadius);
    element.append(actualFill);
    const style = getComputedStyle(element);
    const parentStyle = getComputedStyle(document.body);
    const evidence = {
      backgroundColor: style.backgroundColor,
      borderRadius: style.borderRadius,
      boxShadow: style.boxShadow,
      classNames: [...element.classList],
      color: style.color,
      cursor: style.cursor,
      dataDisabled: element.getAttribute("data-disabled"),
      dataHovered: element.getAttribute("data-hovered"),
      dataInteraction: element.getAttribute("data-interaction"),
      dataPending: element.getAttribute("data-pending"),
      dataTone: element.getAttribute("data-tone"),
      defined: element.matches(":defined"),
      expectedFillColor: getComputedStyle(expectedFill).backgroundColor,
      expectedLabelColor: getComputedStyle(expectedLabel).color,
      expectedRadius: getComputedStyle(expectedRadius).borderRadius,
      fillColor: getComputedStyle(actualFill).backgroundColor,
      fillVariable: style.getPropertyValue("--jelly-fill").trim(),
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontStyle: style.fontStyle,
      fontWeight: style.fontWeight,
      labelVariable: style.getPropertyValue("--jelly-label").trim(),
      lineHeight: style.lineHeight,
      opacity: style.opacity,
      parentFontFamily: parentStyle.fontFamily,
      parentFontSize: parentStyle.fontSize,
      parentFontStyle: parentStyle.fontStyle,
      parentFontWeight: parentStyle.fontWeight,
      parentLineHeight: parentStyle.lineHeight,
      radiusVariable: style.getPropertyValue("--jelly-radius").trim(),
      shadowCard: element.shadowRoot?.querySelector(".card") instanceof HTMLElement,
      shadowCardRole: element.shadowRoot?.querySelector(".card")?.getAttribute("role") ?? null,
      shadowCardTabIndex: element.shadowRoot?.querySelector(".card")?.getAttribute("tabindex") ?? null,
      shadowCanvas: element.shadowRoot?.querySelector(".jelly-canvas") instanceof HTMLCanvasElement,
      tagName: element.tagName.toLowerCase(),
    } satisfies SurfaceEvidence;
    expectedFill.remove();
    actualFill.remove();
    expectedLabel.remove();
    expectedRadius.remove();
    return evidence;
  }, { contract, id });
}

function requireSurface(
  id: SurfaceId,
  contract: SurfaceContract,
  evidence: SurfaceEvidence,
): void {
  invariant(evidence.tagName === "jelly-card", `${id}: the painted host is ${evidence.tagName}.`);
  invariant(evidence.defined, `${id}: the pinned Jelly runtime did not upgrade the host.`);
  invariant(evidence.shadowCard && evidence.shadowCanvas, `${id}: the Jelly shadow surface is incomplete.`);
  invariant(
    evidence.shadowCardRole === null && evidence.shadowCardTabIndex === null,
    `${id}: passive Jelly paint acquired duplicate interactive semantics.`,
  );
  invariant(evidence.dataTone === contract.tone, `${id}: tone is ${String(evidence.dataTone)}.`);
  invariant(
    evidence.dataInteraction === contract.interaction,
    `${id}: interaction is ${String(evidence.dataInteraction)}.`,
  );
  invariant(
    evidence.fillColor === evidence.expectedFillColor,
    `${id}: fill is ${evidence.fillColor}, expected ${evidence.expectedFillColor} from ${contract.fill}.`,
  );
  invariant(
    evidence.color === evidence.expectedLabelColor,
    `${id}: label is ${evidence.color}, expected ${evidence.expectedLabelColor} from ${contract.label}.`,
  );
  invariant(
    evidence.borderRadius === evidence.expectedRadius,
    `${id}: radius is ${evidence.borderRadius}, expected ${evidence.expectedRadius} from ${contract.radius}.`,
  );
  invariant(evidence.fillVariable.length > 0, `${id}: --jelly-fill is empty.`);
  invariant(evidence.labelVariable.length > 0, `${id}: --jelly-label is empty.`);
  invariant(evidence.radiusVariable.length > 0, `${id}: --jelly-radius is empty.`);
  invariant(
    evidence.fontFamily === evidence.parentFontFamily
      && evidence.fontSize === evidence.parentFontSize
      && evidence.fontStyle === evidence.parentFontStyle
      && evidence.fontWeight === evidence.parentFontWeight
      && evidence.lineHeight === evidence.parentLineHeight,
    `${id}: vendor font shorthand escaped the inherited host contract: ${JSON.stringify({
      actual: {
        family: evidence.fontFamily,
        lineHeight: evidence.lineHeight,
        size: evidence.fontSize,
        style: evidence.fontStyle,
        weight: evidence.fontWeight,
      },
      expected: {
        family: evidence.parentFontFamily,
        lineHeight: evidence.parentLineHeight,
        size: evidence.parentFontSize,
        style: evidence.parentFontStyle,
        weight: evidence.parentFontWeight,
      },
    })}.`,
  );
  invariant(
    evidence.classNames[0] === "hraness-design-jelly-surface"
      && evidence.classNames.at(-1) === `jelly-browser-caller-${id}`,
    `${id}: stable and caller class composition changed: ${JSON.stringify(evidence.classNames)}.`,
  );
  invariant(
    atomicClasses(evidence.classNames).length > 12,
    `${id}: too few compiled StyleX classes reached the host: ${JSON.stringify(evidence.classNames)}.`,
  );
  if (id === "disabled") {
    invariant(evidence.dataDisabled === "true", "The disabled surface lost data-disabled.");
    invariant(evidence.dataPending === null, "The disabled surface acquired data-pending.");
    invariant(evidence.dataHovered === "true", "The disabled stale-hover canary was removed.");
    invariant(evidence.cursor === "not-allowed", "The disabled cursor is not fail-closed.");
  } else if (id === "pending") {
    invariant(evidence.dataPending === "true", "The pending surface lost data-pending.");
    invariant(evidence.dataDisabled === null, "The pending surface acquired data-disabled.");
    invariant(evidence.dataHovered === "true", "The pending stale-hover canary was removed.");
    invariant(evidence.cursor === "not-allowed", "The pending cursor is not fail-closed.");
  } else {
    invariant(
      evidence.dataDisabled === null && evidence.dataPending === null,
      `${id}: an enabled surface acquired a disabled state.`,
    );
  }
  if (id === "caller") {
    invariant(evidence.opacity === "0.73", `Caller opacity is ${evidence.opacity}.`);
    invariant(
      evidence.backgroundColor === "rgb(17, 34, 51)",
      `Caller background is ${evidence.backgroundColor}.`,
    );
  } else {
    invariant(
      evidence.backgroundColor === "rgba(0, 0, 0, 0)" && evidence.boxShadow === "none",
      `${id}: the upgraded host did not retire legacy paint (${evidence.backgroundColor}; ${evidence.boxShadow}).`,
    );
  }
}

async function fallbackEvidence(page: Page): Promise<FallbackEvidence> {
  return page.evaluate(() => {
    const element = document.querySelector("#jelly-static-neutral");
    if (!(element instanceof HTMLElement)) throw new Error("The static Jelly host is unavailable.");
    const expectedFill = document.createElement("span");
    const expectedBorder = document.createElement("span");
    const expectedShadow = document.createElement("span");
    expectedFill.style.backgroundColor = "var(--surface-raised)";
    expectedBorder.style.border = "1px solid var(--line)";
    expectedShadow.style.boxShadow = "var(--jelly-shadow-raised)";
    document.body.append(expectedFill, expectedBorder, expectedShadow);
    const style = getComputedStyle(element);
    const evidence = {
      backgroundColor: style.backgroundColor,
      borderColor: style.borderColor,
      borderStyle: style.borderStyle,
      borderWidth: style.borderWidth,
      boxShadow: style.boxShadow,
      classNames: [...element.classList],
      customElementRegistered: customElements.get("jelly-card") !== undefined,
      defined: element.matches(":defined"),
      expectedBorderColor: getComputedStyle(expectedBorder).borderColor,
      expectedFillColor: getComputedStyle(expectedFill).backgroundColor,
      expectedShadow: getComputedStyle(expectedShadow).boxShadow,
      nativeButtonCount: element.querySelectorAll('button[type="button"]').length,
      shadowRoot: element.shadowRoot !== null,
    } satisfies FallbackEvidence;
    expectedFill.remove();
    expectedBorder.remove();
    expectedShadow.remove();
    return evidence;
  });
}

function verifyAtomicClasses(
  stylexCss: string,
  renderedClassLists: readonly (readonly string[])[],
): number {
  const classes = new Set(renderedClassLists.flatMap(atomicClasses));
  invariant(classes.size > 20, `The Jelly matrix exposes only ${String(classes.size)} atomic classes.`);
  for (const className of classes) {
    invariant(
      new RegExp(`\\.${escapeRegularExpression(className)}(?![a-zA-Z0-9_-])`, "u").test(stylexCss),
      `Rendered Jelly class ${className} is absent from dist/stylex.css.`,
    );
  }
  return classes.size;
}

const work = await mkdtemp(join(tmpdir(), "hraness-jelly-browser-"));
const clientEntry = join(work, "jelly-browser-main.ts");
const clientDirectory = join(work, "client");
let browser: Browser | undefined;
let server: ReturnType<typeof Bun.serve> | undefined;

try {
  await writeFile(clientEntry, clientSource(), "utf8");
  const build = await Bun.build({
    conditions: ["production", "browser", "module"],
    define: { "process.env.NODE_ENV": JSON.stringify("production") },
    entrypoints: [clientEntry],
    format: "esm",
    minify: true,
    naming: {
      asset: "jelly-browser-asset-[hash].[ext]",
      chunk: "jelly-browser-chunk-[hash].[ext]",
      entry: "jelly-browser-main.[ext]",
    },
    outdir: clientDirectory,
    splitting: true,
    target: "browser",
  });
  if (!build.success) throw new Error(build.logs.map((log) => log.message).join("\n"));

  const javaScriptOutputs = build.outputs.filter((output) => output.path.endsWith(".js"));
  const entryOutput = javaScriptOutputs.find(
    (output) => basename(output.path) === "jelly-browser-main.js",
  );
  invariant(entryOutput !== undefined, "The Jelly browser fixture emitted no JavaScript entry.");
  const servedScripts = new Map(
    javaScriptOutputs.map((output) => [basename(output.path), output.path] as const),
  );
  invariant(
    servedScripts.size === javaScriptOutputs.length,
    "The Jelly browser build emitted colliding JavaScript basenames.",
  );

  const stylexCssPath = join(repository, "dist/stylex.css");
  const jellyCssPath = join(repository, "src/jelly.css");
  const stylexCss = await readFile(stylexCssPath, "utf8");
  const staticDocument = documentShell(
    `<main class="jelly-browser-matrix">${renderFallbackSurface()}</main>`,
  );
  const clientDocument = documentShell(
    '<div id="jelly-browser-outside" aria-hidden="true"></div><div id="jelly-browser-root"></div>',
    basename(entryOutput.path),
  );
  server = Bun.serve({
    hostname: "127.0.0.1",
    port: await availablePort(),
    fetch(request) {
      const url = new URL(request.url);
      if (url.pathname === "/favicon.ico") return new Response(null, { status: 204 });
      if (url.pathname === "/") {
        return new Response(clientDocument, { headers: { "content-type": "text/html" } });
      }
      if (url.pathname === "/static") {
        return new Response(staticDocument, { headers: { "content-type": "text/html" } });
      }
      if (url.pathname === "/jelly.css") {
        return new Response(Bun.file(jellyCssPath), { headers: { "content-type": "text/css" } });
      }
      if (url.pathname === "/stylex.css") {
        return new Response(Bun.file(stylexCssPath), { headers: { "content-type": "text/css" } });
      }
      const script = servedScripts.get(url.pathname.slice(1));
      if (script !== undefined) {
        return new Response(Bun.file(script), { headers: { "content-type": "text/javascript" } });
      }
      return new Response("Not found", { status: 404 });
    },
  });
  const origin = `http://${server.hostname}:${String(server.port)}`;
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
  browser = await chromium.launch({ args: ["--no-sandbox"], executablePath, headless: true });

  const staticPage = await browser.newPage();
  staticPage.setDefaultNavigationTimeout(10_000);
  staticPage.setDefaultTimeout(10_000);
  const staticFailures: string[] = [];
  staticPage.on("console", (message) => {
    if (message.type() === "error") staticFailures.push(`console: ${message.text()}`);
  });
  staticPage.on("pageerror", (error) => staticFailures.push(`page: ${error.message}`));
  staticPage.on("requestfailed", (request) => {
    staticFailures.push(`request: ${request.url()} ${request.failure()?.errorText ?? "failed"}`);
  });
  staticPage.on("response", (response) => {
    if (response.status() >= 400) {
      staticFailures.push(`resource: ${String(response.status())} ${response.url()}`);
    }
  });
  await staticPage.goto(`${origin}/static`, { waitUntil: "networkidle" });
  const fallback = await fallbackEvidence(staticPage);
  invariant(
    !fallback.customElementRegistered && !fallback.defined && !fallback.shadowRoot,
    `The static fallback upgraded unexpectedly: ${JSON.stringify(fallback)}.`,
  );
  invariant(fallback.nativeButtonCount === 1, "The static fallback lost its native button.");
  invariant(
    fallback.backgroundColor === fallback.expectedFillColor
      && fallback.borderColor === fallback.expectedBorderColor
      && fallback.borderStyle === "solid"
      && fallback.borderWidth === "1px"
      && fallback.boxShadow === fallback.expectedShadow,
    `The unupgraded Jelly fallback lost its complete paint contract: ${JSON.stringify(fallback)}.`,
  );
  invariant(staticFailures.length === 0, `Static Jelly fixture errors: ${staticFailures.join("; ")}`);
  await staticPage.close();

  const page = await browser.newPage();
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
  await page.goto(origin, { waitUntil: "networkidle" });
  await page.locator('[data-jelly-fixture="neutral"]').waitFor();
  await page.waitForFunction(() => customElements.get("jelly-card") !== undefined);
  await page.locator("jelly-card:defined").first().waitFor();
  invariant(
    await page.locator('style[data-jelly-tokens]').count() === 1,
    "The pinned Jelly runtime did not install exactly one token owner.",
  );
  invariant(
    await page.locator("jelly-card:defined").count() === surfaceIds.length,
    "Not every Jelly fixture upgraded.",
  );

  await page.evaluate(() => {
    for (const id of ["disabled", "pending"] as const) {
      const surface = document.querySelector(`[data-jelly-fixture="${id}"]`);
      if (!(surface instanceof HTMLElement)) throw new Error(`The ${id} canary is missing.`);
      surface.setAttribute("data-hovered", "true");
    }
  });

  const classLists: string[][] = [];
  for (const id of surfaceIds) {
    const contract = expectedSurfaces[id];
    const evidence = await surfaceEvidence(page, id, contract);
    requireSurface(id, contract, evidence);
    classLists.push([...evidence.classNames]);
  }
  invariant(
    JSON.stringify(fallback.classNames) === JSON.stringify(classLists[0]),
    "The unupgraded and upgraded neutral hosts do not share the same built class contract.",
  );

  const nativeCommand = page.getByRole("button", { exact: true, name: "Native Jelly action" });
  const nativeField = page.getByRole("textbox", { exact: true, name: "Native Jelly field" });
  invariant(await nativeCommand.count() === 1, "JellySurface lost or duplicated its native button child.");
  invariant(await nativeField.count() === 1, "JellySurface lost or duplicated its native field child.");
  const semanticEvidence = await page.locator('[data-jelly-fixture="neutral"]').evaluate((element) => ({
    hostRole: element.getAttribute("role"),
    hostTabIndex: element.getAttribute("tabindex"),
    nativeText: element.querySelector("button")?.textContent?.trim() ?? null,
    nativeType: element.querySelector("button")?.getAttribute("type") ?? null,
  }));
  invariant(
    semanticEvidence.hostRole === null
      && semanticEvidence.hostTabIndex === null
      && semanticEvidence.nativeText === "Native Jelly action"
      && semanticEvidence.nativeType === "button",
    `JellySurface changed native descendant ownership: ${JSON.stringify(semanticEvidence)}.`,
  );

  await page.locator('[data-jelly-fixture="neutral"]').hover();
  await page.locator('[data-jelly-fixture="neutral"][data-hovered="true"]').waitFor();
  const neutralHover = await surfaceEvidence(page, "neutral", {
    ...expectedSurfaces.neutral,
    fill: "var(--surface-hover)",
  });
  invariant(
    neutralHover.fillColor === neutralHover.expectedFillColor,
    `Neutral hover fill is ${neutralHover.fillColor}, expected ${neutralHover.expectedFillColor}.`,
  );

  await page.locator('[data-jelly-fixture="primary"]').hover();
  await page.locator('[data-jelly-fixture="primary"][data-hovered="true"]').waitFor();
  invariant(
    await page.locator('[data-jelly-fixture="neutral"][data-hovered]').count() === 0,
    "Neutral hover ownership survived pointer exit.",
  );
  const primaryHover = await surfaceEvidence(page, "primary", {
    ...expectedSurfaces.primary,
    fill: "color-mix(in oklch, var(--primary) 88%, var(--background))",
  });
  invariant(
    primaryHover.fillColor === primaryHover.expectedFillColor,
    `Primary hover fill is ${primaryHover.fillColor}, expected ${primaryHover.expectedFillColor}.`,
  );
  await page.locator("#jelly-browser-outside").hover();
  invariant(
    await page.locator('[data-jelly-fixture="primary"][data-hovered]').count() === 0,
    "Primary hover ownership survived pointer exit.",
  );

  const transitionBefore = await page.locator('[data-jelly-fixture="neutral"]').evaluate(
    (element) => getComputedStyle(element).transitionProperty,
  );
  invariant(transitionBefore !== "none", "Normal motion unexpectedly disables every transition.");
  await page.emulateMedia({ reducedMotion: "reduce" });
  const reducedTransition = await page.locator('[data-jelly-fixture="neutral"]').evaluate(
    (element) => getComputedStyle(element).transitionProperty,
  );
  invariant(reducedTransition === "none", `Reduced motion leaves ${reducedTransition} transitions.`);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  invariant(
    await page.locator('[data-jelly-fixture="neutral"]').evaluate(
      (element) => getComputedStyle(element).transitionProperty,
    ) === transitionBefore,
    "Leaving reduced motion did not restore the normal transition contract.",
  );

  await page.emulateMedia({ forcedColors: "active" });
  const forcedColors = await page.locator('[data-jelly-fixture="neutral"]').evaluate((element) => {
    if (!(element instanceof HTMLElement)) throw new Error("The forced-color Jelly host is missing.");
    const probe = document.createElement("span");
    probe.style.backgroundColor = "Canvas";
    probe.style.border = "1px solid CanvasText";
    probe.style.color = "CanvasText";
    document.body.append(probe);
    const probeStyle = getComputedStyle(probe);
    const style = getComputedStyle(element);
    const evidence = {
      backgroundColor: style.backgroundColor,
      borderColor: style.borderColor,
      borderStyle: style.borderStyle,
      borderWidth: style.borderWidth,
      boxShadow: style.boxShadow,
      canvas: probeStyle.backgroundColor,
      canvasText: probeStyle.color,
      color: style.color,
      nativeButtonCount: element.querySelectorAll('button[type="button"]').length,
    };
    probe.remove();
    return evidence;
  });
  invariant(
    forcedColors.backgroundColor === forcedColors.canvas
      && forcedColors.color === forcedColors.canvasText
      && forcedColors.borderColor === forcedColors.canvasText
      && forcedColors.borderStyle === "solid"
      && forcedColors.borderWidth === "1px"
      && forcedColors.boxShadow === "none"
      && forcedColors.nativeButtonCount === 1,
    `Forced colors lost the Jelly paint or semantics contract: ${JSON.stringify(forcedColors)}.`,
  );
  await page.emulateMedia({ forcedColors: "none" });

  const atomicClassCount = verifyAtomicClasses(stylexCss, [fallback.classNames, ...classLists]);
  invariant(failures.length === 0, `Jelly page, console, or resource errors: ${failures.join("; ")}`);
  await page.close();
  console.log(
    `Jelly browser contract passed: ${String(surfaceIds.length)} upgraded surfaces, `
      + `${String(atomicClassCount)} compiled atomic classes, static fallback, native semantics, `
      + "hover/state precedence, caller style, reduced motion, and forced colors.",
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
