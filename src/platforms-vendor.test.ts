import { expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { readdir } from "node:fs/promises";

import { platformMark } from "./platforms";

const vendorRoot = new URL("../vendor/platform-marks/", import.meta.url);

const FILE_HASHES: Readonly<Record<string, string>> = {
  "LICENSE": "9046848b63a5c92bff14e4accca80bd987e0623b74adf9226ce5198d312b79d5",
  "apple.svg": "2a1509dccd25e6d2bc7a11a8e52941077e1a48555e192ce638699b9f083c2a7c",
  "linux.svg": "7e55f2779ae11a83c9dad2d0414a65d8ca7867d0716ce58bfe41ed299ae1447f",
};

test("vendored platform marks match their pinned digests", async () => {
  const names = (await readdir(vendorRoot)).sort();
  expect(names).toEqual([...Object.keys(FILE_HASHES), "UPSTREAM.md"].sort());
  for (const [name, digest] of Object.entries(FILE_HASHES)) {
    const bytes = await Bun.file(new URL(name, vendorRoot)).arrayBuffer();
    expect(`${name}:${createHash("sha256").update(new Uint8Array(bytes)).digest("hex")}`).toBe(`${name}:${digest}`);
  }
  expect(await Bun.file(new URL("LICENSE", vendorRoot)).text()).toContain("CC0 1.0 Universal");
});

test("the macOS and Linux marks are the vendored paths, verbatim", async () => {
  for (const [id, file] of [["macos", "apple.svg"], ["linux", "linux.svg"]] as const) {
    const svg = await Bun.file(new URL(file, vendorRoot)).text();
    const match = /<path d="([^"]+)"\/>/u.exec(svg);
    expect(match?.[1]).toBe(platformMark(id).path);
    expect(svg).toContain('viewBox="0 0 24 24"');
  }
});
