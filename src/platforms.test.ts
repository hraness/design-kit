import { expect, test } from "bun:test";
import * as fc from "fast-check";

import {
  detectPlatform,
  isPlatformId,
  knownPlatformIds,
  matchDetectedPlatform,
  platformLabel,
  platformMark,
} from "./index";

const agents = {
  android: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36",
  chromeos: "Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36",
  ipad: "Mozilla/5.0 (iPad; CPU OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1",
  iphone: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  linux: "Mozilla/5.0 (X11; Linux x86_64; rv:131.0) Gecko/20100101 Firefox/131.0",
  macos: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
  windows: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36",
} as const;

test("user-agent strings map to their operating system", () => {
  expect(detectPlatform({ userAgent: agents.macos })).toBe("macos");
  expect(detectPlatform({ userAgent: agents.windows })).toBe("windows");
  expect(detectPlatform({ userAgent: agents.linux })).toBe("linux");
  expect(detectPlatform({ userAgent: agents.android })).toBe("android");
  expect(detectPlatform({ userAgent: agents.iphone })).toBe("ios");
  expect(detectPlatform({ userAgent: agents.ipad })).toBe("ios");
  expect(detectPlatform({ userAgent: agents.chromeos })).toBe("chromeos");
  expect(detectPlatform({ userAgent: "curl/8.7.1" })).toBeNull();
});

test("client hints win over the user-agent string, and the legacy platform field is a last resort", () => {
  expect(detectPlatform({ userAgent: agents.windows, userAgentData: { platform: "macOS" } })).toBe("macos");
  expect(detectPlatform({ userAgent: agents.macos, userAgentData: { platform: "Windows" } })).toBe("windows");
  expect(detectPlatform({ userAgent: agents.linux, userAgentData: { platform: "Chrome OS" } })).toBe("chromeos");
  expect(detectPlatform({ userAgent: agents.linux, userAgentData: { platform: "" } })).toBe("linux");
  expect(detectPlatform({ userAgent: "", platform: "MacIntel" })).toBe("macos");
  expect(detectPlatform({ platform: "Win32" })).toBe("windows");
  expect(detectPlatform({ platform: "Linux x86_64" })).toBe("linux");
});

test("foreign navigator values never throw", () => {
  for (const value of [undefined, null, 0, "macOS", [], {}, { userAgent: 7 }, { userAgentData: "x" }]) {
    expect(detectPlatform(value)).toBeNull();
  }
  const hostile = new Proxy({}, { get() { throw new Error("blocked"); } });
  expect(detectPlatform(hostile)).toBeNull();
  expect(detectPlatform({ get userAgentData() { throw new Error("blocked"); }, userAgent: agents.linux })).toBe("linux");
});

test("detected platforms resolve against the listed platforms", () => {
  const listed = ["macos", "linux", "windows"];
  expect(matchDetectedPlatform("windows", listed)).toBe("windows");
  expect(matchDetectedPlatform("chromeos", listed)).toBe("linux");
  expect(matchDetectedPlatform("chromeos", ["macos"])).toBeNull();
  expect(matchDetectedPlatform("ios", listed)).toBeNull();
  expect(matchDetectedPlatform(null, listed)).toBeNull();
  expect(matchDetectedPlatform("windows", ["macos", "linux"])).toBeNull();
});

test("known platforms carry labels and 24-unit marks; other ids fall back", () => {
  expect(knownPlatformIds.map(platformLabel)).toEqual(["macOS", "Linux", "Windows"]);
  for (const id of knownPlatformIds) expect(platformMark(id).viewBox).toBe("0 0 24 24");
  expect(new Set(knownPlatformIds.map((id) => platformMark(id).path)).size).toBe(3);
  expect(platformMark("freebsd")).toEqual(platformMark("docker"));
  expect(platformLabel("freebsd")).toBe("freebsd");
  expect(isPlatformId("macos")).toBe(true);
  expect(isPlatformId("linux-arm64")).toBe(true);
  for (const bad of ["", "MacOS", "-x", "x-", "a b", "a_b", 3, null]) expect(isPlatformId(bad)).toBe(false);
});

test("property: detection is total and only reports known outcomes", () => {
  const outcomes = new Set([null, "macos", "linux", "windows", "ios", "android", "chromeos"]);
  fc.assert(fc.property(fc.anything(), (value) => {
    expect(outcomes.has(detectPlatform(value))).toBe(true);
  }));
  fc.assert(fc.property(fc.string(), fc.option(fc.string(), { nil: undefined }), (userAgent, hint) => {
    const navigatorLike = hint === undefined ? { userAgent } : { userAgent, userAgentData: { platform: hint } };
    expect(outcomes.has(detectPlatform(navigatorLike))).toBe(true);
  }));
});

test("property: a match is always one of the listed ids", () => {
  const detected = fc.constantFrom(null, "macos", "linux", "windows", "ios", "android", "chromeos" as const);
  const listed = fc.uniqueArray(fc.constantFrom("macos", "linux", "windows", "freebsd"), { maxLength: 4 });
  fc.assert(fc.property(detected, listed, (value, ids) => {
    const match = matchDetectedPlatform(value, ids);
    if (match !== null) expect((ids as readonly string[]).includes(match)).toBe(true);
  }));
});
