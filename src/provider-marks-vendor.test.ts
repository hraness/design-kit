import { expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { readdir } from "node:fs/promises";

const vendorRoot = new URL("../vendor/provider-marks/", import.meta.url);
const licenseHash = "add9d7531d1b21646317a8958e38fc727506fa39d24bdecb44154d943c82753a";

const FILE_HASHES: Readonly<Record<string, string>> = {
  "lobehub/ollama.svg": "3a268218fb2e6e81fa31df70f70b51331625047794db81db21d35359428fae7a",
  "lobehub/vercel.svg": "4874d52d8b2ce7c309cbd10c424fee123b2c9483e76d76ad0dca41794483eb24",
  "simple-icons/apple.svg": "2a1509dccd25e6d2bc7a11a8e52941077e1a48555e192ce638699b9f083c2a7c",
  "simple-icons/imessage.svg": "6f0701596b1b44ea9b863828b5a9363b77c30408bbb4655045378c33440de144",
  "bootstrap-icons/linkedin.svg": "ddcbb2735eea12f090ea0ee371d1b9a3462531dc11efd0e944adc2d38c71e2df",
  "simple-icons/whatsapp.svg": "8fb209a53a61618c3483594b3e070481a35575d6aaecbe00a6fe386670c8fb1c",
  "beeper.svg": "a37882b2bde6d4c547d299b4d79aca37af0ed804e051640e8ba81f84c2840b35",
  "beeper-glyph.svg": "c67bab9c667fe3aed4773e22d2d17eae1981d349d34939d42ea1b42011c2c958",
  "aider.svg": "a65ba8794103b4dd1a103a996d651f43a0dc72def1e117a15c873aab7734c68a",
  "crush-heartbit.svg": "895c00a12ff691e14d021ca5c7a54049ba008f2b1386c82915596487136e3c60",
  "mem0-art.svg": "1644c756a22b30b98bd6311b1c188e42ef9492dd248205670c712d6f4380c8f9",
  "mem0-glyph.svg": "0f19e0a998074cf50f3f88e8e7ef00fc33d5e52f3de0421b36db24c40077a3f2",
  "mem0.svg": "ff408961ad175d801b802a1f24c9d8223b1fdaa4e1db95f074286b1be881d2a7",
  "supermemory.svg": "d66d760cb5872c2fc8557ca21009db38e571c506c7000206c64437b3e6dce641",
  "lobehub/alibabacloud-color.svg": "73ea97baf919edb3d888a77cd45b21574e190a80124a59e199ea6953a28a959c",
  "lobehub/alibabacloud.svg": "7a62c43622e764c416b9069a8ce505d2560f4b4bcf71ed46bbc32d7259416c56",
  "lobehub/amp-color.svg": "6df4cced9e35703d6263d65968985e8afdff68b61358daf9cc09fa16dd9b2aad",
  "lobehub/amp.svg": "aa6d3fd2fed46e5bd3fdf0e80adab9ed22cbe48e8aa9cd6ea5f7a3ffffc606b1",
  "lobehub/anthropic.svg": "e833fdfa7e7187a86a05b870925067556a506dcd4239089aed73e1e58c9366a3",
  "lobehub/claude-color.svg": "a3101f3047a119aa11825ad9369510f0c472428c8c52d420e31bc62db44a8364",
  "lobehub/claude.svg": "365a70a7eb3956d9b9a96086058ebe04e1dbd8e291a756ad964e8a283fbd6d38",
  "lobehub/claudecode-color.svg": "670b3d8d749d0815ad8f7e62a59d51cb5e2053cb19403f3541a8aed7036a877f",
  "lobehub/claudecode.svg": "d7eb2d876b49e51cc16291a42b681d7cf4906e60e0150776dbfb353ec4ca3746",
  "lobehub/codex-color.svg": "4a2f43ce46b5b6e3722c95088f88d26ef91e6a8c2e598e70642a1c54367386e4",
  "lobehub/codex.svg": "d08b4e824cd6727e89617f59e4737273ff53e44c1da849d016dd64dfd08b33e1",
  "lobehub/cursor.svg": "0cb51bddf264ae108926fd554c063ef40fc1aac3c5c921ddb39ad184e4e5d0ef",
  "lobehub/deepseek-color.svg": "deba5f98a5c1796e20fcac3149bcd7eb8a32f0bdd04d048819400b1f28bd1439",
  "lobehub/deepseek.svg": "8f9443e351b6dacce71871790201b799d92e8bf96a45ef79aeb5e9bf4db423e2",
  "lobehub/devin-color.svg": "beb58575f94fda57a6c1f9ed5624e6407bff405f55b6258b53032b674aadd8c8",
  "lobehub/devin.svg": "8d197b0c31522517ffa896cd4a1ee65719eb73bff9eb9bbf7edf64db6b1a573d",
  "lobehub/gemini-color.svg": "8ab0a9bafec11f7e69bcb9fc4ffd8f1bc927d1ddcbbb6ff36dee5ae8b5a9d602",
  "lobehub/gemini.svg": "87d5b3c4be75a66f54c1936482a263df68185545b741129badd1b7c2449c18d3",
  "lobehub/geminicli-color.svg": "c2f54ebaa4c3b9191c6a07f7b0c66bc78e4abe486003dc564469cf650672663e",
  "lobehub/geminicli.svg": "bc9b0199cb4c5deee25d6cf49d6e7d60a891171ccbc5520f657d3047b84e5d2e",
  "lobehub/githubcopilot.svg": "bbc7fddc13448236e5edea8c399d2072dc40aa5da5bca07f7a2f412405c500a3",
  "lobehub/goose.svg": "8779d9a61c5b0be78a3d36cab6843ba5af86218ba2ff1b18eb918c7a8d25bb99",
  "lobehub/meta-color.svg": "adf9f2c1a646ccd3a37ca8c2e7e5985d64630cd633f4b95fba393d1d44e0578c",
  "lobehub/meta.svg": "805ef9a35305393eb5a89be46b0708c9b119b3308ca44aaedd1457ff04857060",
  "lobehub/mistral-color.svg": "722f74b289d95486b43662fe24fa883b333701296f618406cd0ed502299170b6",
  "lobehub/mistral.svg": "a06cfa54e7deff7f7544175b006b7f8a03fbc5624c44f7d553a44d07ea96e629",
  "lobehub/moonshot.svg": "435f41b74e6a87639b6bf860e9628f20cbe7d6229bece412d548f4cea3081852",
  "lobehub/nvidia-color.svg": "8c941e4eb8b782eccaaea1240c059d20be33ab8eda28d7c9ed9b53ac802fe683",
  "lobehub/nvidia.svg": "5a419b99e0ffdbfbe8caa7ec25581054eae03024da59cb860c54ea55ac8e7e73",
  "lobehub/obsidian-color.svg": "cb8d13afbcc2817956725f7ec4d3c2e9173c79988d178e0b7138b7595c13d261",
  "lobehub/obsidian.svg": "b7336eacc3563d3a5fa4bb9db0d8716c1abd0a293fabbb9f3a8caa1f7c866549",
  "lobehub/openai.svg": "a595df6b423920c67a7f8f73c063e4bfb72d415948097b6cac063a2366bb5186",
  "lobehub/opencode.svg": "7cfa6e9d6726f7c9fa26c7d9aef0dfec52d20a137380454340f30f12ccbfd302",
  "lobehub/perplexity-color.svg": "8353f3ab20822f1a933224b0ea32cc39f0c32d5740f4af8c254b0f418e0a3a70",
  "lobehub/perplexity.svg": "c66c64e9e3c273ef6c235f743808d67ffa7d482e8cbe4a79496a42b60333e1fe",
  "lobehub/qwen-color.svg": "77f5768c66d08ce1d3d14e73373975c1bc0454be88c81523ddd0ffd7e2974029",
  "lobehub/qwen.svg": "dcb3ba2f2b55ccbacbade0ca0bf98921fbaf8a07848972974b4a9bf8077376cf",
  "lobehub/xai.svg": "89eb7de9f0d02a41cfecd9109e253d7fd3529e27467dee4254faa67f3ac21451",
  "lobehub/zai.svg": "e748cb5108ce37b116d7a5ba97d37e0ae97eadf6849b0de11afb248e244a01e1",
};

test("the LobeHub MIT license stays pinned", async () => {
  const license = await Bun.file(new URL("LICENSE", vendorRoot)).arrayBuffer();
  const actual = createHash("sha256").update(new Uint8Array(license)).digest("hex");
  expect(actual).toBe(licenseHash);

  const provenance = await Bun.file(new URL("UPSTREAM.md", vendorRoot)).text();
  expect(provenance).toContain("@lobehub/icons-static-svg");
  expect(provenance).toContain("1.95.1");
  expect(provenance).toContain("charmbracelet/crush");
});

test("the Crush license and source commit stay pinned", async () => {
  const license = await Bun.file(new URL("CRUSH-LICENSE.md", vendorRoot)).arrayBuffer();
  expect(createHash("sha256").update(new Uint8Array(license)).digest("hex"))
    .toBe("66d255bbfd24fdd7c1f3558a6de2c2aad049d0badd2817e111cfda8198e769e5");
  const provenance = await Bun.file(new URL("UPSTREAM.md", vendorRoot)).text();
  expect(provenance).toContain("0eee0616609b2c890ccc69f6a4ab3aba0b8a8630");
  expect(provenance).toContain("CRUSH-LICENSE.md");
});

test("memory-product marks retain their upstream licenses and immutable sources", async () => {
  for (const [file, digest] of [
    ["SUPERMEMORY-LICENSE", "9ce388a89cce6a2dc109579d044f7f16e1397d8ee6fdb1f3bd3b980d365a07ae"],
    ["MEM0-LICENSE", "0bbcbe931c353293a2fafce08326181dfeea0e568c566afd4ce8337a70f5e219"],
  ] as const) {
    expect(createHash("sha256").update(new Uint8Array(await Bun.file(new URL(file, vendorRoot)).arrayBuffer())).digest("hex")).toBe(digest);
  }
  const provenance = await Bun.file(new URL("UPSTREAM.md", vendorRoot)).text();
  expect(provenance).toContain("ce4facf662b278713578450f704ab2d7d11b1865");
  expect(provenance).toContain("94c3fe9f238f3dbf29c9ce98643bd71eb13077cd");
});

test("every vendored mark file is byte-exact and accounted for", async () => {
  const onDisk = (await readdir(new URL(".", vendorRoot), { recursive: true }))
    .map((entry) => entry.toString())
    .filter((entry) => entry.endsWith(".svg"))
    .sort();
  expect(onDisk).toEqual(Object.keys(FILE_HASHES).sort());
  for (const [file, hash] of Object.entries(FILE_HASHES)) {
    const bytes = await Bun.file(new URL(file, vendorRoot)).arrayBuffer();
    expect(createHash("sha256").update(new Uint8Array(bytes)).digest("hex")).toBe(hash);
  }
});


test("messaging marks retain pinned source licenses and the separate Beeper notice", async () => {
  for (const [file, digest] of [
    ["SIMPLE-ICONS-LICENSE.md", "9046848b63a5c92bff14e4accca80bd987e0623b74adf9226ce5198d312b79d5"],
    ["BEEPER-NOTICE.md", "cee69cab0dca73a02e370cc5aa11da4cdcbe13d0661ae7b14d3a298ac237fd05"],
  ] as const) {
    expect(createHash("sha256").update(new Uint8Array(await Bun.file(new URL(file, vendorRoot)).arrayBuffer())).digest("hex")).toBe(digest);
  }
  const provenance = await Bun.file(new URL("UPSTREAM.md", vendorRoot)).text();
  expect(provenance).toContain("simple-icons");
  expect(provenance).toContain("15.20.0");
  expect(provenance).toContain("7437e04747d7acd64db81c5bf78ef82efbaf45e8");
});

test("the LinkedIn mark retains the pinned Bootstrap Icons MIT license and release", async () => {
  const license = await Bun.file(new URL("BOOTSTRAP-ICONS-LICENSE", vendorRoot)).arrayBuffer();
  expect(createHash("sha256").update(new Uint8Array(license)).digest("hex"))
    .toBe("0fb3e11bd57e896c5a512afd64864d28a37de45d19835016c87ca1ad19ead969");
  const provenance = await Bun.file(new URL("UPSTREAM.md", vendorRoot)).text();
  expect(provenance).toContain("bootstrap-icons");
  expect(provenance).toContain("1.13.1");
  expect(provenance).toContain("ce0e49dd063243118a115f17ad1fe1fe7576d552");
});
