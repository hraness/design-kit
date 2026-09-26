import { expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { readdir } from "node:fs/promises";

const vendorRoot = new URL("../vendor/provider-marks/", import.meta.url);
const licenseHash = "add9d7531d1b21646317a8958e38fc727506fa39d24bdecb44154d943c82753a";

const FILE_HASHES: Readonly<Record<string, string>> = {
  "aider.svg": "a65ba8794103b4dd1a103a996d651f43a0dc72def1e117a15c873aab7734c68a",
  "crush-heartbit.svg": "895c00a12ff691e14d021ca5c7a54049ba008f2b1386c82915596487136e3c60",
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
  "lobehub/goose.svg": "8779d9a61c5b0be78a3d36cab6843ba5af86218ba2ff1b18eb918c7a8d25bb99",
  "lobehub/meta-color.svg": "adf9f2c1a646ccd3a37ca8c2e7e5985d64630cd633f4b95fba393d1d44e0578c",
  "lobehub/meta.svg": "805ef9a35305393eb5a89be46b0708c9b119b3308ca44aaedd1457ff04857060",
  "lobehub/mistral-color.svg": "722f74b289d95486b43662fe24fa883b333701296f618406cd0ed502299170b6",
  "lobehub/mistral.svg": "a06cfa54e7deff7f7544175b006b7f8a03fbc5624c44f7d553a44d07ea96e629",
  "lobehub/moonshot.svg": "435f41b74e6a87639b6bf860e9628f20cbe7d6229bece412d548f4cea3081852",
  "lobehub/nvidia-color.svg": "8c941e4eb8b782eccaaea1240c059d20be33ab8eda28d7c9ed9b53ac802fe683",
  "lobehub/nvidia.svg": "5a419b99e0ffdbfbe8caa7ec25581054eae03024da59cb860c54ea55ac8e7e73",
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
