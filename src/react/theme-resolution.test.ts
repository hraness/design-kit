import { expect, test } from "bun:test";
import fc from "fast-check";

import { resolveEffectiveTheme } from "./theme-resolution";

test("forced appearance wins without replacing the saved preference", () => {
  for (const [saved, forced] of [["light", "dark"], ["dark", "light"]] as const) {
    expect(resolveEffectiveTheme(forced, saved)).toBe(forced);
    expect(resolveEffectiveTheme(forced, undefined)).toBe(forced);
    expect(resolveEffectiveTheme(undefined, saved)).toBe(saved);
  }
});

test("unresolved system and foreign values never become a concrete appearance", () => {
  for (const value of [undefined, null, "system", "sepia", "", {}, 0, true]) {
    expect(resolveEffectiveTheme(value, undefined)).toBeUndefined();
    expect(resolveEffectiveTheme(undefined, value)).toBeUndefined();
    expect(resolveEffectiveTheme(value, "light")).toBe("light");
  }
});

test("forced precedence and concrete-only output hold for arbitrary foreign inputs", () => {
  fc.assert(fc.property(fc.anything(), fc.anything(), (forced, resolved) => {
    const expected = forced === "light" || forced === "dark" ? forced
      : resolved === "light" || resolved === "dark" ? resolved : undefined;
    expect(resolveEffectiveTheme(forced, resolved)).toBe(expected);
    expect(resolveEffectiveTheme("light", resolved)).toBe("light");
    expect(resolveEffectiveTheme("dark", resolved)).toBe("dark");
  }), { numRuns: 200 });
});
