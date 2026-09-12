import type { ConcreteDesignTheme } from "../appearance.js";

/** next-themes keeps the saved/resolved preference separate from a forced mode. */
export function resolveEffectiveTheme(
  forcedTheme: unknown,
  resolvedTheme: unknown,
): ConcreteDesignTheme | undefined {
  if (forcedTheme === "light" || forcedTheme === "dark") return forcedTheme;
  if (resolvedTheme === "light" || resolvedTheme === "dark") return resolvedTheme;
  return undefined;
}
