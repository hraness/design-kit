import { access, mkdtemp, readdir, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";

import { chromium, type Browser, type Page } from "playwright-core";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  globalErrorFixtureColors,
  globalErrorFixtureMessage,
} from "../gallery/global-error-fixture.js";
import { GlobalErrorDocument } from "../src/react/route-state.js";
import {
  themeColorSyncActiveAttribute,
  themeColorSyncDisabledAttribute,
} from "../src/react/theme-color-sync.js";
import type { DesignTheme } from "../src/react/theme.js";

interface ThemeColorEvidence {
  readonly activeColor: string | null;
  readonly activeCount: number;
  readonly colorScheme: string | null;
  readonly menuCount: number;
  readonly storedTheme: string | null;
  readonly theme: string | null;
  readonly themeColors: readonly Readonly<{
    color: string;
    disabled: boolean;
    media: string | null;
  }>[];
}

const storageKey = "hraness-design-theme-v1";

function invariant(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message);
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
    "No Chromium executable found. Set CHROMIUM_EXECUTABLE_PATH to run the global-error browser test.",
  );
}

function renderGlobalError(theme: DesignTheme = "system"): string {
  return renderToStaticMarkup(
    createElement(GlobalErrorDocument, {
      darkColor: globalErrorFixtureColors.dark,
      error: new Error(globalErrorFixtureMessage),
      lightColor: globalErrorFixtureColors.light,
      reset: () => undefined,
      theme,
    }),
  );
}

function withClientScript(documentMarkup: string, script: string): string {
  return `<!doctype html>${documentMarkup.replace(
    "</body>",
    `<script type="module" src="/${basename(script)}"></script></body>`,
  )}`;
}

function lifecycleDocument(systemMarkup: string, script: string): string {
  const head = /<head>([\s\S]*?)<\/head>/u.exec(systemMarkup)?.[1];
  invariant(head !== undefined, "The System global-error fixture has no static head.");
  return [
    "<!doctype html>",
    '<html data-theme="light" lang="en"><head>',
    head,
    "</head><body>",
    '<div id="root"></div>',
    `<script type="module" src="/${basename(script)}"></script>`,
    "</body></html>",
  ].join("");
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
    "The global-error port probe did not receive a network address.",
  );
  await new Promise<void>((resolve, reject) => {
    probe.close((error) => error === undefined ? resolve() : reject(error));
  });
  return address.port;
}

async function startServer(
  directory: string,
  script: string,
  documents: Readonly<Record<DesignTheme, string>>,
) {
  const systemMarkup = documents.system;
  const hydratedSystem = withClientScript(systemMarkup, script);
  const lifecycle = lifecycleDocument(systemMarkup, script);
  return Bun.serve({
    hostname: "127.0.0.1",
    port: await availablePort(),
    async fetch(request) {
      const url = new URL(request.url);
      if (url.pathname === "/favicon.ico") return new Response(null, { status: 204 });
      if (url.pathname === `/${basename(script)}`) {
        return new Response(Bun.file(join(directory, basename(script))), {
          headers: { "content-type": "text/javascript" },
        });
      }
      if (url.pathname === "/lifecycle") {
        return new Response(lifecycle, { headers: { "content-type": "text/html" } });
      }
      if (url.pathname === "/hydrate") {
        return new Response(hydratedSystem, { headers: { "content-type": "text/html" } });
      }
      if (url.pathname === "/static") {
        const candidate = url.searchParams.get("theme");
        const theme: DesignTheme = candidate === "light" || candidate === "dark"
          ? candidate
          : "system";
        return new Response(`<!doctype html>${documents[theme]}`, {
          headers: { "content-type": "text/html" },
        });
      }
      return new Response("Not found", { status: 404 });
    },
  });
}

async function evidence(page: Page): Promise<ThemeColorEvidence> {
  return page.evaluate((attributes) => {
    const metas = Array.from(
      document.head.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'),
    );
    const active = metas.find((meta) => meta.hasAttribute(attributes.active));
    return {
      activeColor: active?.content ?? null,
      activeCount: metas.filter((meta) => meta.hasAttribute(attributes.active)).length,
      colorScheme:
        document.head.querySelector<HTMLMetaElement>('meta[name="color-scheme"]')?.content
        ?? null,
      menuCount: document.querySelectorAll("[data-hraness-appearance-menu]").length,
      storedTheme: localStorage.getItem(attributes.storageKey),
      theme: document.documentElement.getAttribute("data-theme"),
      themeColors: metas
        .filter((meta) => !meta.hasAttribute(attributes.active))
        .map((meta) => ({
          color: meta.content,
          disabled: meta.hasAttribute(attributes.disabled),
          media: meta.getAttribute("media"),
        })),
    };
  }, {
    active: themeColorSyncActiveAttribute,
    disabled: themeColorSyncDisabledAttribute,
    storageKey,
  });
}

async function openBrowser(executablePath: string): Promise<Browser> {
  return chromium.launch({ args: ["--no-sandbox"], executablePath, headless: true });
}

const repository = process.cwd();
const work = await mkdtemp(join(tmpdir(), "hraness-global-error-browser-"));

try {
  const build = await Bun.build({
    entrypoints: [join(repository, "gallery/global-error-main.tsx")],
    format: "esm",
    minify: true,
    outdir: work,
    target: "browser",
  });
  if (!build.success) throw new Error(build.logs.map((log) => log.message).join("\n"));

  const script = (await readdir(work)).find((file) => file.endsWith(".js"));
  invariant(script !== undefined, "Global-error browser fixture emitted no JavaScript.");
  const documents = {
    dark: renderGlobalError("dark"),
    light: renderGlobalError("light"),
    system: renderGlobalError(),
  } as const;
  const server = await startServer(work, script, documents);

  try {
    const staticResponse = await fetch(
      `http://${server.hostname}:${String(server.port)}/static`,
    );
    invariant(staticResponse.ok, "The static System global-error response failed.");
    const staticMarkup = await staticResponse.text();
    invariant(
      staticMarkup.includes('<html data-theme="light" lang="en">'),
      "System SSR lost its safe light serialization baseline.",
    );
    invariant(
      staticMarkup.indexOf('name="theme-color"')
        < staticMarkup.indexOf('data-hraness-design-theme-guard=""'),
      "System SSR metadata no longer precedes the appearance bootstrap.",
    );

    const executablePath = await firstExecutable([
      ...(process.env.CHROMIUM_EXECUTABLE_PATH === undefined
        ? []
        : [process.env.CHROMIUM_EXECUTABLE_PATH]),
      chromium.executablePath(),
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/usr/bin/google-chrome",
      "/usr/bin/chromium",
      "/usr/bin/chromium-browser",
    ]);
    const browser = await openBrowser(executablePath);

    try {
      const staticSystem = await browser.newPage({ colorScheme: "dark" });
      await staticSystem.goto(
        `http://${server.hostname}:${String(server.port)}/static`,
        { waitUntil: "networkidle" },
      );
      const staticSystemState = await evidence(staticSystem);
      invariant(
        staticSystemState.theme === "dark",
        "The blocking System bootstrap did not resolve the dark OS before hydration.",
      );
      invariant(staticSystemState.colorScheme === "light dark", "System SSR color-scheme is not adaptive.");
      invariant(staticSystemState.menuCount === 0, "System global-error rendered an appearance selector.");
      invariant(staticSystemState.activeCount === 0, "Static System metadata mounted a runtime owner.");
      invariant(
        JSON.stringify(staticSystemState.themeColors) === JSON.stringify([
          {
            color: globalErrorFixtureColors.light,
            disabled: false,
            media: "(prefers-color-scheme: light)",
          },
          {
            color: globalErrorFixtureColors.dark,
            disabled: false,
            media: "(prefers-color-scheme: dark)",
          },
        ]),
        `System SSR metadata changed: ${JSON.stringify(staticSystemState.themeColors)}`,
      );
      await staticSystem.close();

      for (const scenario of [
        { color: globalErrorFixtureColors.light, theme: "light" },
        { color: globalErrorFixtureColors.dark, theme: "dark" },
      ] as const) {
        const page = await browser.newPage({ colorScheme: scenario.theme === "light" ? "dark" : "light" });
        await page.goto(
          `http://${server.hostname}:${String(server.port)}/static?theme=${scenario.theme}`,
          { waitUntil: "networkidle" },
        );
        const state = await evidence(page);
        invariant(state.theme === scenario.theme, `${scenario.theme}: fixed root theme changed.`);
        invariant(state.colorScheme === scenario.theme, `${scenario.theme}: fixed color-scheme changed.`);
        invariant(state.menuCount === 0, `${scenario.theme}: global-error rendered a selector.`);
        invariant(
          state.themeColors.length === 1
          && state.themeColors[0]?.color === scenario.color
          && state.themeColors[0]?.media === null,
          `${scenario.theme}: fixed theme-color is ${JSON.stringify(state.themeColors)}`,
        );
        await page.close();
      }

      for (const scenario of [
        {
          expectedColor: globalErrorFixtureColors.dark,
          expectedStored: null,
          expectedTheme: "dark",
          initial: null,
          os: "dark",
        },
        {
          expectedColor: globalErrorFixtureColors.dark,
          expectedStored: "system",
          expectedTheme: "dark",
          initial: "sepia",
          os: "dark",
        },
        {
          expectedColor: globalErrorFixtureColors.light,
          expectedStored: "light",
          expectedTheme: "light",
          initial: "light",
          os: "dark",
        },
        {
          expectedColor: globalErrorFixtureColors.dark,
          expectedStored: "dark",
          expectedTheme: "dark",
          initial: "dark",
          os: "light",
        },
      ] as const) {
        const page = await browser.newPage({ colorScheme: scenario.os });
        const failures: string[] = [];
        page.on("console", (message) => {
          if (message.type() === "error") failures.push(`console: ${message.text()}`);
        });
        page.on("pageerror", (error) => failures.push(`page: ${error.message}`));
        await page.addInitScript(({ initial, storageKey }) => {
          if (initial === null) localStorage.removeItem(storageKey);
          else localStorage.setItem(storageKey, initial);
        }, { initial: scenario.initial, storageKey });
        await page.goto(
          `http://${server.hostname}:${String(server.port)}/hydrate`,
          { waitUntil: "networkidle" },
        );
        await page.locator(`html[data-theme="${scenario.expectedTheme}"]`).waitFor();
        await page.locator(`meta[${themeColorSyncActiveAttribute}]`).waitFor({
          state: "attached",
        });

        const state = await evidence(page);
        const label = `${scenario.os}/${String(scenario.initial)}`;
        invariant(state.activeCount === 1, `${label}: runtime metadata has ${String(state.activeCount)} owners.`);
        invariant(state.activeColor === scenario.expectedColor, `${label}: runtime color is ${String(state.activeColor)}.`);
        invariant(state.colorScheme === "light dark", `${label}: System color-scheme stopped being adaptive.`);
        invariant(state.menuCount === 0, `${label}: global-error rendered a selector.`);
        invariant(state.storedTheme === scenario.expectedStored, `${label}: storage resolved to ${String(state.storedTheme)}.`);
        invariant(
          state.themeColors.length === 2
          && state.themeColors.every((meta) => meta.disabled && meta.media === "not all"),
          `${label}: adaptive metadata was not safely suspended ${JSON.stringify(state.themeColors)}.`,
        );
        invariant(failures.length === 0, `${label}: ${failures.join("; ")}`);
        await page.close();
      }

      const lifecyclePage = await browser.newPage({ colorScheme: "dark" });
      await lifecyclePage.addInitScript((storageKey) => localStorage.removeItem(storageKey), storageKey);
      await lifecyclePage.goto(
        `http://${server.hostname}:${String(server.port)}/lifecycle`,
        { waitUntil: "networkidle" },
      );
      await lifecyclePage.locator(`meta[${themeColorSyncActiveAttribute}]`).waitFor({ state: "attached" });
      invariant((await evidence(lifecyclePage)).menuCount === 0, "Lifecycle fixture rendered a selector.");
      await lifecyclePage.evaluate(() => {
        const fixture = (window as typeof window & {
          __hranessThemeColorLifecycle?: { readonly unmount: () => void };
        }).__hranessThemeColorLifecycle;
        if (fixture === undefined) throw new Error("The lifecycle fixture is unavailable.");
        fixture.unmount();
      });
      await lifecyclePage.locator(`meta[${themeColorSyncActiveAttribute}]`).waitFor({ state: "detached" });
      const released = await evidence(lifecyclePage);
      invariant(
        released.themeColors.map((meta) => meta.media).join("\0")
          === "(prefers-color-scheme: light)\0(prefers-color-scheme: dark)",
        `Unmount did not restore adaptive metadata: ${JSON.stringify(released.themeColors)}`,
      );
      invariant(
        released.themeColors.every((meta) => !meta.disabled),
        "Unmount left adaptive metadata marked as disabled.",
      );
      await lifecyclePage.evaluate(() => {
        const fixture = (window as typeof window & {
          __hranessThemeColorLifecycle?: { readonly mount: () => void };
        }).__hranessThemeColorLifecycle;
        if (fixture === undefined) throw new Error("The lifecycle fixture is unavailable.");
        fixture.mount();
      });
      await lifecyclePage.locator(`meta[${themeColorSyncActiveAttribute}]`).waitFor({ state: "attached" });
      invariant(
        (await evidence(lifecyclePage)).activeColor === globalErrorFixtureColors.dark,
        "Remount did not reacquire the resolved custom Dark color.",
      );
      await lifecyclePage.close();
    } finally {
      await browser.close();
    }
  } finally {
    server.stop(true);
  }
} finally {
  await rm(work, { force: true, recursive: true });
}
