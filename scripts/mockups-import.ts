/**
 * Imports the built `./mockups`, `./launch`, and `./testing` entries straight
 * from dist, with no bundler, CSS loader, or StyleX transform, and renders
 * every fixture on the server. A leaked "use client", StyleX call, or
 * react-aria import fails here before it reaches a consumer.
 *
 * Run after `bun run build`: `bun run ./scripts/mockups-import.ts`.
 */
import { readFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { mockupFixtures } from "../gallery/mockups-fixture.js";
import type * as LaunchModule from "../src/launch.js";
import type * as MockupsModule from "../src/mockups/index.js";
import type * as TestingModule from "../src/testing.js";

const root = new URL("../dist/", import.meta.url);
const serverEntries = ["mockups/index.js", "launch.js", "testing.js"] as const;

for (const entry of serverEntries) {
  const source = await readFile(new URL(entry, root), "utf8");
  if (/^\s*["']use client["']/mu.test(source)) throw new Error(`dist/${entry} must stay server-safe; it starts with "use client".`);
  for (const forbidden of ["@stylexjs", "react-aria", "stylex.create", "@hraness/ui"]) {
    if (source.includes(forbidden)) throw new Error(`dist/${entry} must not reference ${forbidden}.`);
  }
}
const launchSource = await readFile(new URL("launch.js", root), "utf8");
if (/from\s*["']react/u.test(launchSource)) throw new Error("dist/launch.js must not import React.");

const clientSource = await readFile(new URL("mockups/client.js", root), "utf8");
if (!clientSource.startsWith('"use client"')) throw new Error("dist/mockups/client.js must start with \"use client\".");

const mockups = (await import(new URL("mockups/index.js", root).href)) as typeof MockupsModule;
const testing = (await import(new URL("testing.js", root).href)) as typeof TestingModule;
const launch = (await import(new URL("launch.js", root).href)) as typeof LaunchModule;
if (typeof launch.buildSocialKit !== "function" || typeof launch.assertLaunchKit !== "function") {
  throw new Error("dist/launch.js lost buildSocialKit or assertLaunchKit.");
}

let rendered = 0;
for (const fixture of mockupFixtures(mockups)) {
  for (const theme of ["light", "dark"] as const) {
    const html = renderToStaticMarkup(createElement(() => fixture.render(theme)));
    testing.assertRoleImgWithLabel(html, `${fixture.name} (${theme})`);
    testing.assertNoHeadings(html, `${fixture.name} (${theme})`);
    rendered += 1;
  }
}
console.log(`Imported mockups, launch, and testing without a bundler; rendered ${String(rendered)} mockups.`);
