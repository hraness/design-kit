import { describe, expect, test } from "bun:test";
import { readdir, readFile } from "node:fs/promises";
import { provisionedBrowserExecutable, verificationBrowserArguments } from "../scripts/browser-executable.js";

const managedPath = "/cache/chromium-1234/chrome";
const base = {
  environment: {},
  managedPath,
  resolveExecutable: async (path: string) => path,
  readVersion: async () => "Chromium 152.0.7977.83",
  report: () => undefined,
};

describe("provisioned verification browser", () => {
  test("merges required launch flags with caller features and switches", () => {
    expect(verificationBrowserArguments(["--no-sandbox", "--disable-features=Existing,PaintHolding", "--mute-audio", "--disable-features=Other"]))
      .toEqual(["--no-sandbox", "--mute-audio", "--disable-features=PaintHolding,MacAppCodeSignClone,Existing,Other"]);
    expect(verificationBrowserArguments()).toEqual(["--mute-audio", "--disable-features=PaintHolding,MacAppCodeSignClone"]);
  });

  test("uses the pinned managed executable and reports its identity", async () => {
    const reports: string[] = [];
    expect(await provisionedBrowserExecutable({ ...base, report: (message) => { reports.push(message); } })).toBe(managedPath);
    expect(reports[0]).toContain("Chromium 152.0.7977.83");
    expect(reports[0]).toContain(managedPath);
  });

  test("accepts explicit Chrome for Testing and the managed executable", async () => {
    expect(await provisionedBrowserExecutable({ ...base, environment: { CHROME_PATH: "/cache/cft/152/chrome" }, readVersion: async () => "Google Chrome for Testing 152.0.7977.83" })).toBe("/cache/cft/152/chrome");
    expect(await provisionedBrowserExecutable({ ...base, environment: { CHROMIUM_EXECUTABLE_PATH: managedPath } })).toBe(managedPath);
  });

  test("does not fall back when the chosen override is missing", async () => {
    const resolved: string[] = [];
    await expect(provisionedBrowserExecutable({ ...base, environment: { CHROMIUM_EXECUTABLE_PATH: "/missing", CHROME_PATH: managedPath }, resolveExecutable: async (path) => { resolved.push(path); throw new Error("absent"); } })).rejects.toThrow("browser:install");
    expect(resolved).toEqual(["/missing"]);
  });

  test("fails with provisioning guidance when the managed browser is absent", async () => {
    await expect(provisionedBrowserExecutable({ ...base, resolveExecutable: async () => { throw new Error("absent"); } })).rejects.toThrow("browser:install");
  });

  test("rejects system Chrome directly and through a symlink before executing it", async () => {
    for (const path of ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary", "/usr/bin/google-chrome"]) {
      for (const candidate of [path, "/tmp/browser-link"]) {
        await expect(provisionedBrowserExecutable({ ...base, environment: { CHROME_PATH: candidate }, resolveExecutable: async () => path, readVersion: async () => { throw new Error("must not execute"); } })).rejects.toThrow("System browser");
      }
    }
  });

  test("rejects relative paths and arbitrary explicit Chromium or regular Chrome", async () => {
    await expect(provisionedBrowserExecutable({ ...base, environment: { CHROME_PATH: "chrome" } })).rejects.toThrow("absolute path");
    for (const version of ["Google Chrome 152.0.7977.83", "Chromium 152.0.7977.83", "Google Chrome for Testing unknown"]) {
      await expect(provisionedBrowserExecutable({ ...base, environment: { CHROME_PATH: "/other/chrome" }, readVersion: async () => version })).rejects.toThrow("explicitly provisioned Chrome for Testing");
    }
  });

  test("every browser launcher uses the shared selection policy", async () => {
    const directory = new URL("../scripts/", import.meta.url);
    const files = (await readdir(directory)).filter((name) => name.endsWith("-browser.ts"));
    let launches = 0;
    for (const name of files) {
      const source = await readFile(new URL(name, directory), "utf8");
      if (!source.includes("chromium.launch(")) continue;
      launches += 1;
      expect(source).toContain('from "./browser-executable.js"');
      expect(source).toContain("args: verificationBrowserArguments(");
      expect(source).not.toContain("chromium.executablePath()");
      expect(source).not.toContain("/Applications/Google Chrome.app");
      expect(source).not.toContain("process.env.CHROME_PATH");
      expect(source).not.toContain("process.env.CHROMIUM_EXECUTABLE_PATH");
    }
    expect(launches).toBe(14);
  });
});
