import { access, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";

import { chromium, type Page } from "playwright-core";

import { colors } from "../src/index.js";
import { themeColorSyncActiveAttribute } from "../src/react/theme-color-sync.js";

interface LayoutEvidence {
  readonly appearanceInHeader: boolean;
  readonly appearanceIsFinalAction: boolean;
  readonly appearancePresentation: string;
  readonly appearanceRightAligned: boolean;
  readonly appearanceTriggerLabel: string;
  readonly auroraContained: boolean;
  readonly auroraPosition: string;
  readonly clientWidth: number;
  readonly copy: string;
  readonly dotsContained: boolean;
  readonly dotsPosition: string;
  readonly galleryPaddingLeft: number;
  readonly galleryPaddingRight: number;
  readonly heading: string;
  readonly headingClipped: boolean;
  readonly horizontalFaderThumbCentered: boolean;
  readonly mobileTriggerDisplay: string;
  readonly palette: readonly string[];
  readonly paletteValid: boolean;
  readonly plainLinkDecoration: string;
  readonly plainHeaderChildrenContained: boolean;
  readonly plainHeaderHeight: number;
  readonly plainHeaderOverflows: boolean;
  readonly plainHeaderWrapped: boolean;
  readonly plainThemeHeight: number;
  readonly plainThemeMinHeight: string;
  readonly proceduralAriaHidden: boolean;
  readonly proceduralCanvasCount: number;
  readonly proceduralCloudCount: number;
  readonly proceduralCoversEffect: boolean;
  readonly proceduralGridCount: number;
  readonly proceduralInert: boolean;
  readonly proceduralPointerEvents: string;
  readonly proceduralRippleCount: number;
  readonly proceduralVariant: string;
  readonly railDisplay: string;
  readonly scrollWidth: number;
  readonly verticalFaderThumbCentered: boolean;
}

interface ThemeColorEvidence {
  readonly activeContent: string;
  readonly activeHasMedia: boolean;
  readonly adaptiveMedia: readonly string[];
  readonly backgroundColor: string;
  readonly matchingColors: readonly string[];
  readonly ownedCount: number;
}

const layouts = [
  { height: 844, id: "compact", minimumEdgePadding: 20, width: 390 },
  { height: 720, id: "wide", minimumEdgePadding: 48, width: 1280 },
] as const;

const expectedHeading = "Presentation and composition reference";
const expectedCopy = "Portable controls come from @hraness/ui. This package adds application shells, charts, effects, syntax, haptics, and optional Jelly paint.";

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
    "No Chromium executable found. Set CHROMIUM_EXECUTABLE_PATH to run the gallery browser test.",
  );
}

async function evidence(page: Page): Promise<LayoutEvidence> {
  return page.evaluate(() => {
    const gallery = document.querySelector(".design-gallery");
    const heading = document.querySelector(".design-gallery__intro h1");
    const copy = document.querySelector(".design-gallery__intro > p");
    const rail = document.querySelector(".hraness-design-app-shell__rail");
    const mobileTrigger = document.querySelector(".hraness-design-app-shell__mobile-trigger");
    const effect = document.querySelector(".design-gallery__effect");
    const aurora = effect?.querySelector(".hraness-design-aurora-background");
    const dots = effect?.querySelector(".hraness-design-aurora-dots");
    const plainLink = document.querySelector(".design-gallery__plain-link-example a");
    const plainHeader = document.querySelector(".plain-header__inner");
    const plainNav = plainHeader?.querySelector(".plain-nav");
    const plainTheme = document.querySelector(".design-gallery__plain-theme");
    const plainWordmark = plainHeader?.querySelector(".plain-wordmark");
    const procedural = effect?.querySelector(".hraness-design-procedural-backdrop");
    const horizontalFaderTrack = document.querySelector(
      ".design-gallery__horizontal-fader .hraness-design-fader__track",
    );
    const horizontalFaderThumb = horizontalFaderTrack?.querySelector(
      ".hraness-design-fader__thumb",
    );
    const verticalFaderTrack = document.querySelector(
      ".design-gallery__vertical-fader .hraness-design-fader__track",
    );
    const verticalFaderThumb = verticalFaderTrack?.querySelector(
      ".hraness-design-fader__thumb",
    );
    const appearance = document.querySelector(".hraness-design-theme-toggle");
    const appearanceTrigger = appearance?.querySelector("button");
    const appearanceHeader = appearance?.closest("header");
    const appearanceActions = appearance?.parentElement;
    if (
      !(gallery instanceof HTMLElement)
      || !(heading instanceof HTMLElement)
      || !(copy instanceof HTMLElement)
      || !(rail instanceof HTMLElement)
      || !(mobileTrigger instanceof HTMLElement)
      || !(effect instanceof HTMLElement)
      || !(aurora instanceof HTMLElement)
      || !(dots instanceof HTMLElement)
      || !(plainLink instanceof HTMLAnchorElement)
      || !(plainHeader instanceof HTMLElement)
      || !(plainNav instanceof HTMLElement)
      || !(plainTheme instanceof HTMLElement)
      || !(plainWordmark instanceof HTMLAnchorElement)
      || !(procedural instanceof HTMLElement)
      || !(horizontalFaderTrack instanceof HTMLElement)
      || !(horizontalFaderThumb instanceof HTMLElement)
      || !(verticalFaderTrack instanceof HTMLElement)
      || !(verticalFaderThumb instanceof HTMLElement)
      || !(appearance instanceof HTMLElement)
      || !(appearanceTrigger instanceof HTMLButtonElement)
      || !(appearanceHeader instanceof HTMLElement)
      || !(appearanceActions instanceof HTMLElement)
    ) {
      throw new Error("The public gallery structure is incomplete.");
    }

    const galleryStyle = getComputedStyle(gallery);
    const proceduralStyle = getComputedStyle(procedural);
    const effectBox = effect.getBoundingClientRect();
    const auroraBox = aurora.getBoundingClientRect();
    const dotsBox = dots.getBoundingClientRect();
    const plainHeaderBox = plainHeader.getBoundingClientRect();
    const plainNavBox = plainNav.getBoundingClientRect();
    const plainWordmarkBox = plainWordmark.getBoundingClientRect();
    const proceduralBox = procedural.getBoundingClientRect();
    const horizontalFaderTrackBox = horizontalFaderTrack.getBoundingClientRect();
    const horizontalFaderThumbBox = horizontalFaderThumb.getBoundingClientRect();
    const verticalFaderTrackBox = verticalFaderTrack.getBoundingClientRect();
    const verticalFaderThumbBox = verticalFaderThumb.getBoundingClientRect();
    const paletteNames = [
      "--hraness-design-procedural-highlight",
      "--hraness-design-procedural-key",
      "--hraness-design-procedural-shadow",
      "--hraness-design-procedural-support",
    ];

    const palette = paletteNames.map((name) => proceduralStyle.getPropertyValue(name).trim());

    return {
      appearanceInHeader: appearanceHeader.tagName === "HEADER",
      appearanceIsFinalAction: appearanceActions.lastElementChild === appearance,
      appearancePresentation: appearance.dataset.presentation ?? "",
      appearanceRightAligned:
        Math.abs(
          appearance.getBoundingClientRect().right
          - appearanceActions.getBoundingClientRect().right,
        ) <= 1,
      appearanceTriggerLabel: appearanceTrigger.getAttribute("aria-label") ?? "",
      auroraContained:
        Math.abs(auroraBox.left - effectBox.left) <= 1
        && Math.abs(auroraBox.right - effectBox.right) <= 1
        && Math.abs(auroraBox.top - effectBox.top) <= 1
        && Math.abs(auroraBox.bottom - effectBox.bottom) <= 1,
      auroraPosition: getComputedStyle(aurora).position,
      clientWidth: document.documentElement.clientWidth,
      copy: copy.textContent?.replace(/\s+/gu, " ").trim() ?? "",
      dotsContained:
        Math.abs(dotsBox.left - effectBox.left) <= 1
        && Math.abs(dotsBox.right - effectBox.right) <= 1
        && Math.abs(dotsBox.top - effectBox.top) <= 1
        && Math.abs(dotsBox.bottom - effectBox.bottom) <= 1,
      dotsPosition: getComputedStyle(dots).position,
      galleryPaddingLeft: Number.parseFloat(galleryStyle.paddingLeft),
      galleryPaddingRight: Number.parseFloat(galleryStyle.paddingRight),
      heading: heading.textContent?.trim() ?? "",
      headingClipped: heading.scrollWidth > heading.clientWidth + 1,
      horizontalFaderThumbCentered:
        Math.abs(
          (horizontalFaderThumbBox.top + horizontalFaderThumbBox.bottom) / 2
          - (horizontalFaderTrackBox.top + horizontalFaderTrackBox.bottom) / 2,
        ) <= 1,
      mobileTriggerDisplay: getComputedStyle(mobileTrigger).display,
      palette,
      paletteValid: palette.every((value) => value !== "" && CSS.supports("color", value)),
      plainLinkDecoration: getComputedStyle(plainLink).textDecorationLine,
      plainHeaderChildrenContained:
        plainWordmarkBox.left >= plainHeaderBox.left - 1
        && plainWordmarkBox.right <= plainHeaderBox.right + 1
        && plainNavBox.left >= plainHeaderBox.left - 1
        && plainNavBox.right <= plainHeaderBox.right + 1,
      plainHeaderHeight: plainHeaderBox.height,
      plainHeaderOverflows: plainHeader.scrollWidth > plainHeader.clientWidth + 1,
      plainHeaderWrapped: Math.abs(plainWordmarkBox.top - plainNavBox.top) > 2,
      plainThemeHeight: plainTheme.getBoundingClientRect().height,
      plainThemeMinHeight: getComputedStyle(plainTheme).minHeight,
      proceduralAriaHidden: procedural.getAttribute("aria-hidden") === "true",
      proceduralCanvasCount: procedural.querySelectorAll("canvas").length,
      proceduralCloudCount: procedural.querySelectorAll(
        ".hraness-design-procedural-backdrop__cloud",
      ).length,
      proceduralCoversEffect:
        Math.abs(proceduralBox.left - effectBox.left) <= 1
        && Math.abs(proceduralBox.right - effectBox.right) <= 1
        && Math.abs(proceduralBox.top - effectBox.top) <= 1
        && Math.abs(proceduralBox.bottom - effectBox.bottom) <= 1,
      proceduralGridCount: procedural.querySelectorAll(
        ".hraness-design-procedural-backdrop__grid",
      ).length,
      proceduralInert: procedural.inert,
      proceduralPointerEvents: proceduralStyle.pointerEvents,
      proceduralRippleCount: procedural.querySelectorAll(
        ".hraness-design-procedural-backdrop__ripple",
      ).length,
      proceduralVariant: procedural.dataset.variant ?? "",
      railDisplay: getComputedStyle(rail).display,
      scrollWidth: document.documentElement.scrollWidth,
      verticalFaderThumbCentered:
        Math.abs(
          (verticalFaderThumbBox.left + verticalFaderThumbBox.right) / 2
          - (verticalFaderTrackBox.left + verticalFaderTrackBox.right) / 2,
        ) <= 1,
    };
  });
}

async function themeColorEvidence(page: Page): Promise<ThemeColorEvidence> {
  return page.evaluate((activeAttribute) => {
    const metas = Array.from(document.head.querySelectorAll<HTMLMetaElement>(
      'meta[name="theme-color"]',
    ));
    const active = metas.find((meta) => meta.hasAttribute(activeAttribute));
    if (active === undefined) throw new Error("The synchronized theme-color meta is missing.");

    const normalizeColor = (value: string): string => {
      const probe = document.createElement("span");
      probe.style.color = value;
      document.body.append(probe);
      const normalized = getComputedStyle(probe).color;
      probe.remove();
      return normalized;
    };

    return {
      activeContent: active.content,
      activeHasMedia: active.hasAttribute("media"),
      adaptiveMedia: metas
        .filter((meta) => meta.hasAttribute("data-gallery-adaptive-theme-color"))
        .map((meta) => meta.getAttribute("media") ?? ""),
      backgroundColor: getComputedStyle(document.body).backgroundColor,
      matchingColors: metas
        .filter((meta) => !meta.hasAttribute("media") || matchMedia(meta.media).matches)
        .map((meta) => normalizeColor(meta.content)),
      ownedCount: metas.filter((meta) => meta.hasAttribute(activeAttribute)).length,
    };
  }, themeColorSyncActiveAttribute);
}

function startGalleryServer(directory: string) {
  const firstPort = 43_000 + (process.pid % 1_000);
  for (let offset = 0; offset < 20; offset += 1) {
    try {
      return Bun.serve({
        hostname: "127.0.0.1",
        port: firstPort + offset,
        async fetch(request) {
          const pathname = new URL(request.url).pathname;
          if (pathname === "/favicon.ico") return new Response(null, { status: 204 });
          const name = pathname === "/" ? "index.html" : basename(pathname);
          const file = Bun.file(join(directory, name));
          if (!(await file.exists())) return new Response("Not found", { status: 404 });
          const type = name.endsWith(".css")
            ? "text/css"
            : name.endsWith(".js")
              ? "text/javascript"
              : "text/html";
          return new Response(file, { headers: { "content-type": type } });
        },
      });
    } catch (error: unknown) {
      if (offset === 19) throw error;
    }
  }
  throw new Error("No local port was available for the gallery browser test.");
}

const repository = process.cwd();
const work = await mkdtemp(join(tmpdir(), "hraness-design-gallery-browser-"));

try {
  const build = await Bun.build({
    entrypoints: [join(repository, "gallery/main.tsx")],
    format: "esm",
    minify: true,
    outdir: work,
    target: "browser",
  });
  if (!build.success) {
    throw new Error(build.logs.map((log) => log.message).join("\n"));
  }

  const files = await readdir(work);
  const script = files.find((file) => file.endsWith(".js"));
  const stylesheet = files.find((file) => file.endsWith(".css"));
  invariant(script !== undefined, "Gallery build did not emit JavaScript.");
  invariant(stylesheet !== undefined, "Gallery build did not emit CSS.");
  const [builtCss, stylexCss] = await Promise.all([
    Bun.file(join(work, stylesheet)).text(),
    Bun.file(join(repository, "dist/stylex.css")).text(),
  ]);
  const stylexClasses = [...stylexCss.matchAll(/^\s*\.([\w-]+)\s*\{/gmu)]
    .map((match) => match[1])
    .filter((className): className is string => className !== undefined);
  invariant(stylexClasses.length > 0, "Gallery build has no package StyleX selectors to verify.");
  for (const className of new Set(stylexClasses)) {
    const escaped = className.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    const matches = builtCss.match(new RegExp(`\\.${escaped}(?=[\\s,{:])`, "gu")) ?? [];
    invariant(
      matches.length === 1,
      `Gallery CSS contains the generated .${className} selector ${String(matches.length)} times.`,
    );
  }
  await writeFile(
    join(work, "index.html"),
    [
      "<!doctype html>",
      '<html lang="en"><head><meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1">',
      `<meta data-gallery-adaptive-theme-color="" name="theme-color" media="(prefers-color-scheme: light)" content="${colors.light.background}">`,
      `<meta data-gallery-adaptive-theme-color="" name="theme-color" media="(prefers-color-scheme: dark)" content="${colors.dark.background}">`,
      `<link rel="stylesheet" href="/${basename(stylesheet)}">`,
      `</head><body><div id="root"></div><script type="module" src="/${basename(script)}"></script></body></html>`,
    ].join(""),
  );

  const server = startGalleryServer(work);

  try {
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
    const browser = await chromium.launch({
      args: ["--no-sandbox"],
      executablePath,
      headless: true,
    });

    try {
      for (const layout of layouts) {
        const page = await browser.newPage({
          colorScheme: "light",
          reducedMotion: "reduce",
          viewport: { height: layout.height, width: layout.width },
        });
        const failures: string[] = [];
        page.on("console", (message) => {
          if (message.type() === "error") failures.push(`console: ${message.text()}`);
        });
        page.on("pageerror", (error) => failures.push(`page: ${error.message}`));
        await page.addInitScript(() => {
          localStorage.removeItem("hraness-design-theme-v1");
        });
        await page.goto(`http://${server.hostname}:${String(server.port)}/`, {
          waitUntil: "networkidle",
        });
        await page.locator('.hraness-design-theme-toggle[data-ready="true"]').waitFor();

        const state = await evidence(page);
        invariant(state.heading === expectedHeading, `${layout.id}: accessible title changed`);
        invariant(state.copy === expectedCopy, `${layout.id}: explanatory copy changed`);
        invariant(!state.headingClipped, `${layout.id}: title is clipped`);
        invariant(state.scrollWidth <= state.clientWidth + 1, `${layout.id}: document overflows horizontally`);
        invariant(
          state.galleryPaddingLeft + 0.5 >= layout.minimumEdgePadding
          && state.galleryPaddingRight + 0.5 >= layout.minimumEdgePadding,
          `${layout.id}: gallery edge padding is below ${String(layout.minimumEdgePadding)}px`,
        );
        invariant(state.appearanceInHeader, `${layout.id}: appearance trigger is outside the header`);
        invariant(
          state.appearanceIsFinalAction,
          `${layout.id}: appearance trigger is not the final header action`,
        );
        invariant(
          state.appearanceRightAligned,
          `${layout.id}: appearance trigger is not aligned to the header action edge`,
        );
        invariant(
          state.appearancePresentation === "menu",
          `${layout.id}: appearance presentation is ${JSON.stringify(state.appearancePresentation)}`,
        );
        invariant(
          state.appearanceTriggerLabel === "Appearance: System",
          `${layout.id}: first-visit appearance is ${JSON.stringify(state.appearanceTriggerLabel)}`,
        );
        invariant(
          layout.id === "compact"
            ? state.railDisplay === "none" && state.mobileTriggerDisplay !== "none"
            : state.railDisplay !== "none" && state.mobileTriggerDisplay === "none",
          `${layout.id}: responsive shell ownership is incorrect`,
        );
        invariant(state.proceduralVariant === "composite", `${layout.id}: procedural variant changed`);
        invariant(
          state.auroraPosition === "absolute" && state.auroraContained,
          `${layout.id}: aurora paint escaped its gallery specimen`,
        );
        invariant(
          state.dotsPosition === "absolute" && state.dotsContained,
          `${layout.id}: dot paint escaped its gallery specimen`,
        );
        invariant(
          state.plainLinkDecoration === "none",
          `${layout.id}: plain links are not quiet at rest`,
        );
        invariant(
          !state.plainHeaderOverflows && state.plainHeaderChildrenContained,
          `${layout.id}: plain header content overflows its shell`,
        );
        invariant(
          state.plainHeaderHeight <= 110,
          `${layout.id}: plain header is ${String(state.plainHeaderHeight)}px tall`,
        );
        invariant(
          layout.id === "compact" || !state.plainHeaderWrapped,
          `${layout.id}: plain header wrapped despite available inline room`,
        );
        invariant(
          state.plainThemeMinHeight === "0px" && state.plainThemeHeight < 260,
          `${layout.id}: plain shell specimen is not compact`,
        );
        invariant(state.proceduralCloudCount === 5, `${layout.id}: procedural atmosphere is incomplete`);
        invariant(state.proceduralGridCount === 1, `${layout.id}: procedural grid is incomplete`);
        invariant(state.proceduralRippleCount === 4, `${layout.id}: procedural ripples are incomplete`);
        invariant(state.proceduralCanvasCount === 0, `${layout.id}: excluded canvas effect returned`);
        invariant(state.proceduralAriaHidden && state.proceduralInert, `${layout.id}: procedural paint entered the accessibility tree`);
        invariant(state.proceduralPointerEvents === "none", `${layout.id}: procedural paint captures input`);
        invariant(state.proceduralCoversEffect, `${layout.id}: procedural paint does not cover its presentation surface`);
        invariant(
          state.horizontalFaderThumbCentered,
          `${layout.id}: horizontal fader thumb is not centered on its track`,
        );
        invariant(
          state.verticalFaderThumbCentered,
          `${layout.id}: vertical fader thumb is not centered on its track`,
        );
        invariant(
          state.palette.length === 4 && state.paletteValid,
          `${layout.id}: procedural palette is ${JSON.stringify(state.palette)}`,
        );

        const plainLink = page.locator(".design-gallery__plain-link-example a");
        await plainLink.hover();
        invariant(
          await plainLink.evaluate((link) =>
            getComputedStyle(link).textDecorationLine.includes("underline")),
          `${layout.id}: plain links do not reveal an underline on interaction`,
        );

        const appearanceTrigger = page.getByRole("button", { name: "Appearance: System" });
        await appearanceTrigger.focus();
        await page.keyboard.press("Enter");
        const appearanceMenu = page.getByRole("menu", { name: "Appearance" });
        await appearanceMenu.waitFor();
        const appearanceChoices = await appearanceMenu
          .locator('[role="menuitemradio"]')
          .allTextContents();
        invariant(
          appearanceChoices.map((choice) => choice.trim()).join("\0") === "Light\0Dark\0System",
          `${layout.id}: appearance choices are ${JSON.stringify(appearanceChoices)}`,
        );
        await page.keyboard.press("Home");
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Enter");
        await page.locator('html[data-theme="dark"]').waitFor();
        invariant(
          await page.getByRole("button", { name: "Appearance: Dark" }).count() === 1,
          `${layout.id}: keyboard appearance change did not select Dark`,
        );
        invariant(failures.length === 0, `${layout.id}: ${failures.join("; ")}`);
        await page.close();
      }

      const coarsePage = await browser.newPage({
        colorScheme: "light",
        hasTouch: true,
        viewport: { height: 844, width: 390 },
      });
      await coarsePage.addInitScript(() => {
        localStorage.removeItem("hraness-design-theme-v1");
      });
      await coarsePage.goto(`http://${server.hostname}:${String(server.port)}/`, {
        waitUntil: "networkidle",
      });
      await coarsePage.locator('.hraness-design-theme-toggle[data-ready="true"]').waitFor();
      const coarseTrigger = coarsePage.getByRole("button", { name: "Appearance: System" });
      const coarseBox = await coarseTrigger.boundingBox();
      invariant(coarseBox !== null, "coarse pointer: appearance trigger has no layout box");
      invariant(
        coarseBox.width >= 48 && coarseBox.height >= 48,
        `coarse pointer: appearance trigger is ${String(coarseBox.width)}×${String(coarseBox.height)}`,
      );
      invariant(
        await coarsePage.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        "coarse pointer: appearance header overflows horizontally",
      );
      await coarsePage.close();

      for (const scenario of [
        {
          expectedColor: colors.light.background,
          os: "dark",
          preference: "light",
        },
        {
          expectedColor: colors.dark.background,
          os: "light",
          preference: "dark",
        },
      ] as const) {
        const page = await browser.newPage({ colorScheme: scenario.os });
        const failures: string[] = [];
        page.on("console", (message) => {
          if (message.type() === "error") failures.push(`console: ${message.text()}`);
        });
        page.on("pageerror", (error) => failures.push(`page: ${error.message}`));
        await page.addInitScript((preference) => {
          localStorage.setItem("hraness-design-theme-v1", preference);
        }, scenario.preference);
        await page.goto(`http://${server.hostname}:${String(server.port)}/`, {
          waitUntil: "networkidle",
        });
        await page.locator(`html[data-theme="${scenario.preference}"]`).waitFor();
        await page.locator(`meta[${themeColorSyncActiveAttribute}]`).waitFor({
          state: "attached",
        });

        const state = await themeColorEvidence(page);
        invariant(
          state.ownedCount === 1,
          `${scenario.os}/${scenario.preference}: active meta ownership is ambiguous`,
        );
        invariant(
          !state.activeHasMedia,
          `${scenario.os}/${scenario.preference}: active meta is media-qualified`,
        );
        invariant(
          state.activeContent === scenario.expectedColor,
          `${scenario.os}/${scenario.preference}: active color is ${state.activeContent}`,
        );
        invariant(
          state.adaptiveMedia.length === 2
          && state.adaptiveMedia.every((media) => media === "not all"),
          `${scenario.os}/${scenario.preference}: adaptive tags remain active ${JSON.stringify(state.adaptiveMedia)}`,
        );
        invariant(
          state.matchingColors.length === 1
          && state.matchingColors[0] === state.backgroundColor,
          `${scenario.os}/${scenario.preference}: chrome ${JSON.stringify(state.matchingColors)} does not match ${state.backgroundColor}`,
        );
        invariant(
          failures.length === 0,
          `${scenario.os}/${scenario.preference}: ${failures.join("; ")}`,
        );
        await page.close();
      }
    } finally {
      await browser.close();
    }
  } finally {
    server.stop(true);
  }
} finally {
  await rm(work, { force: true, recursive: true });
}
