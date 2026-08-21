export const designThemes = ["light", "dark", "system"] as const;

export type DesignTheme = (typeof designThemes)[number];
export type ConcreteDesignTheme = Exclude<DesignTheme, "system">;

export const defaultDesignTheme: DesignTheme = "system";
export const designThemeStorageKey = "hraness-design-theme-v1";

export type DesignThemeLabels = Readonly<Partial<Record<DesignTheme, string>>>;

export function isDesignTheme(value: unknown): value is DesignTheme {
  return typeof value === "string" && designThemes.some((theme) => theme === value);
}

/** Missing and invalid foreign values resolve to the shared first-visit preference. */
export function normalizeDesignTheme(value: unknown): DesignTheme {
  return isDesignTheme(value) ? value : defaultDesignTheme;
}

export function designThemeLabel(
  theme: DesignTheme,
  labels?: DesignThemeLabels,
): string {
  return labels?.[theme] ?? `${theme.charAt(0).toUpperCase()}${theme.slice(1)}`;
}

export function resolveDesignTheme(
  theme: DesignTheme,
  systemPrefersDark: boolean,
): ConcreteDesignTheme {
  return theme === "system" ? (systemPrefersDark ? "dark" : "light") : theme;
}
