import { expect, test } from "bun:test";

import { nebulaSansSocialFonts } from "./fonts/nebula-sans/social-fonts.generated";

const expectedHashes = {
  "LICENSE.txt": "ceab45a6fcb5cce75ffb7e2a4f49b59dd2daa6ede14fe4b07b9f8e58675f33b8",
  "NebulaSans-Black.woff2": "1d1daae5c8265da2e39a2ff7f65a96d106e0bcccc6448b9d3218579c36659a1d",
  "NebulaSans-BlackItalic.woff2": "2adaaa008693cba0d73d29be8ed16b61b2c5ae85570eefbdb73ddf2598584586",
  "NebulaSans-Bold.woff2": "0801b78a64e731db50c2a0badac7bc1e9138a8916e8f4774aeb8de6f86c6f1fd",
  "NebulaSans-Bold.otf": "91617d3e2281e8213f64f6bf359f387022d3149b35000b38365c32130a25bfa8",
  "NebulaSans-BoldItalic.woff2": "9a39e08b7fe8b5ab4a5c8ba74cf6d94b0c057b2a5d225482ff788ce0be6c5e26",
  "NebulaSans-Book.woff2": "4d396c7c7f93b3f9d8e90d5a8c5e28b29266243946d4320783abc3628d9ef8df",
  "NebulaSans-Book.otf": "4cc650f856591af1affc4add4f50e260c8239a2542bafe77909b78006023f091",
  "NebulaSans-BookItalic.woff2": "4b3449828532636a38d32c5702e4f7795f3f935bf3654e2fdeae1fb6d8c147bd",
  "NebulaSans-Light.woff2": "2e42255586dea3c69690a7ffe5c5063f8d8cc33d6003c16f5e4a7a8a77e5dc4e",
  "NebulaSans-LightItalic.woff2": "5933f3ab5bda5c11ac6cdcb47aafeb10f014b2f67594b7ae394376e94231693d",
  "NebulaSans-Medium.woff2": "5d185acda0c62e1cc156a7508a98c37c56014690e79697c071b0fd2babcb00cb",
  "NebulaSans-MediumItalic.woff2": "df585bb3b07fd2d8cf927a30c973ef2247e027cc560fb116732cac8c8a1ca978",
  "NebulaSans-Semibold.woff2": "0e7cd15b1fea9ed847b48f8d53dca88f54f016c352aaa8f895731b3d44d8fc64",
  "NebulaSans-SemiboldItalic.woff2": "5667adc772e2772d52f644462923ae8d74b21a1160101854be3ee59e743a3218",
} as const;

test("Nebula Sans assets remain byte-identical to the official archive", async () => {
  for (const [name, expectedHash] of Object.entries(expectedHashes)) {
    const asset = Bun.file(new URL(`./fonts/nebula-sans/${name}`, import.meta.url));
    const actualHash = new Bun.CryptoHasher("sha256")
      .update(new Uint8Array(await asset.arrayBuffer()))
      .digest("hex");
    expect(actualHash).toBe(expectedHash);
  }
});

test("Nebula Sans redistribution retains license and provenance", async () => {
  const license = await Bun.file(
    new URL("./fonts/nebula-sans/LICENSE.txt", import.meta.url),
  ).text();
  const provenance = await Bun.file(
    new URL("./fonts/nebula-sans/PROVENANCE.md", import.meta.url),
  ).text();

  expect(license).toContain("SIL OPEN FONT LICENSE Version 1.1");
  expect(license).toContain("Reserved Font Name 'Nebula'");
  expect(provenance).toContain("https://www.nebulasans.com/download/NebulaSans-1.010.zip");
  expect(provenance).toContain(
    "a9b56ef15e24b6e8195af7457cc75f714ecf5501fc3c20a69f546c8f589e7bdb",
  );
});

test("Nebula Sans CSS exposes every official cut without metric substitution", async () => {
  const css = await Bun.file(new URL("./fonts.css", import.meta.url)).text();

  for (const name of Object.keys(expectedHashes).filter((name) => name.endsWith(".woff2"))) {
    expect(css).toContain(`./fonts/nebula-sans/${name}`);
  }
  expect(css.match(/font-family: "Nebula Sans";/gu)).toHaveLength(12);
  expect(css).not.toContain("size-adjust:");
  expect(css).not.toContain("unicode-range:");
});

test("generated social-image payloads decode to the official OTF files", () => {
  const fonts = nebulaSansSocialFonts();

  expect(fonts.map(({ name, style, weight }) => ({ name, style, weight }))).toEqual([
    { name: "Nebula Sans", style: "normal", weight: 400 },
    { name: "Nebula Sans", style: "normal", weight: 700 },
  ]);
  expect(fonts.map(({ data }) => new Bun.CryptoHasher("sha256")
    .update(new Uint8Array(data))
    .digest("hex"))).toEqual([
    expectedHashes["NebulaSans-Book.otf"],
    expectedHashes["NebulaSans-Bold.otf"],
  ]);
  expect(fonts.reduce((total, { data }) => total + data.byteLength, 0)).toBeLessThan(500_000);
});
