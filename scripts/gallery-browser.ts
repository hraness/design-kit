import { access, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";

import { chromium, type Page } from "playwright-core";

interface LayoutEvidence {
  readonly appearanceNames: readonly string[];
  readonly auroraContained: boolean;
  readonly auroraPosition: string;
  readonly checkedAppearance: readonly string[];
  readonly clientWidth: number;
  readonly copy: string;
  readonly dotsContained: boolean;
  readonly dotsPosition: string;
  readonly galleryPaddingLeft: number;
  readonly galleryPaddingRight: number;
  readonly heading: string;
  readonly headingClipped: boolean;
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
    const appearance = [...document.querySelectorAll<HTMLInputElement>(
      '.hraness-design-theme-toggle input[type="radio"]',
    )];
    const paletteNames = [
      "--hraness-design-procedural-highlight",
      "--hraness-design-procedural-key",
      "--hraness-design-procedural-shadow",
      "--hraness-design-procedural-support",
    ];

    const palette = paletteNames.map((name) => proceduralStyle.getPropertyValue(name).trim());

    return {
      appearanceNames: appearance.map((item) => item.getAttribute("aria-label") ?? ""),
      auroraContained:
        Math.abs(auroraBox.left - effectBox.left) <= 1
        && Math.abs(auroraBox.right - effectBox.right) <= 1
        && Math.abs(auroraBox.top - effectBox.top) <= 1
        && Math.abs(auroraBox.bottom - effectBox.bottom) <= 1,
      auroraPosition: getComputedStyle(aurora).position,
      checkedAppearance: appearance
        .filter((item) => item.checked)
        .map((item) => item.value),
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
    };
  });
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
  await writeFile(
    join(work, "index.html"),
    [
      "<!doctype html>",
      '<html lang="en"><head><meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1">',
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
        invariant(
          state.appearanceNames.join("\0") === "Light\0Dark\0System",
          `${layout.id}: appearance choices are ${JSON.stringify(state.appearanceNames)}`,
        );
        invariant(state.checkedAppearance.length === 1, `${layout.id}: appearance selection is ambiguous`);
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

        const light = page.getByRole("radio", { name: "Light" });
        await light.focus();
        await page.keyboard.press("ArrowRight");
        await page.locator('html[data-theme="dark"]').waitFor();
        invariant(
          await page.getByRole("radio", { checked: true, name: "Dark" }).count() === 1,
          `${layout.id}: keyboard appearance change did not select Dark`,
        );
        invariant(failures.length === 0, `${layout.id}: ${failures.join("; ")}`);
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
