import { expect, test } from "bun:test";

const readme = await Bun.file(new URL("../README.md", import.meta.url)).text();
const manifest = await Bun.file(new URL("../package.json", import.meta.url)).json() as {
  version: string;
  files: string[];
  devDependencies: Record<string, string>;
};

test("README install pins match the package release and its UI pair", () => {
  expect(readme).toContain(`"@hraness/design-kit": "github:hraness/design-kit#v${manifest.version}"`);
  expect(readme).toContain(`"@hraness/ui": "${manifest.devDependencies["@hraness/ui"]}"`);
  expect(readme).toContain(`\`@hraness/design-kit\` \`v${manifest.version}\``);
});

test("the package ships the copy guides that the README and STYLE.md link to", () => {
  for (const guide of ["MARKETING_COPY.md", "MARKETING_PRESET.md", "STYLE.md"]) {
    expect(readme).toContain(`](${guide})`);
  }
  for (const guide of ["MARKETING_COPY.md", "MARKETING_PRESET.md", "STYLE.md", "WRITING.md"]) {
    expect(manifest.files).toContain(guide);
  }
});
