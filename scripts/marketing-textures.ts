/** Original Hraness textures, retained byte-for-byte from the approved design. */
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

export function marketingTextures(): Readonly<Record<"grain.svg" | "cells.svg", string>> {
let seed = 4652026;
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 4294967296;
}
const stipple = ["", ""];
for (let y = 0; y < 128; y++) {
  for (let x = 0; x < 128; x++) {
    const value = random();
    if (value < .65) stipple[value < .325 ? 0 : 1] += `M${x} ${y}h1v1h-1z`;
  }
}
const grain = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><g opacity=".03"><path fill="#000" d="${stipple[0]}"/><path fill="#fff" d="${stipple[1]}"/></g></svg>\n`;
const seams: string[] = [];
for (let x = 0; x < 1280; x += 80) seams.push(`M${x} 0v400`);
for (let y = 0; y < 400; y += 25) seams.push(`M0 ${y}h1280`);
const cells = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 400"><path d="${seams.join("")}" fill="none" stroke="#808080" stroke-width=".5" opacity=".14"/></svg>\n`;

return { "grain.svg": grain, "cells.svg": cells };
}

if (import.meta.main) {
  const writing = process.argv.slice(2).join(" ") === "--write";
  for (const [name, contents] of Object.entries(marketingTextures())) {
    const path = resolve(import.meta.dir, "../src/marketing-assets", name);
    if (writing) await writeFile(path, contents);
    else assert.equal(await readFile(path, "utf8"), contents, `${name} differs from its checked source.`);
  }
}
