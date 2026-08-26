import * as appearance from "../appearance.js";
import { installAppearanceMenus as installMenus } from "./appearance-menu.js";

export * from "./artifact-share.js";

export type {
  ConcreteDesignTheme,
  DesignTheme,
  DesignThemeLabels,
} from "../appearance.js";
export type {
  AppearanceMenuInstallation,
  AppearanceMenuOptions,
  AppearanceStorage,
} from "./appearance-menu.js";
export const defaultDesignTheme = appearance.defaultDesignTheme;
export const designThemeLabel = appearance.designThemeLabel;
export const designThemes = appearance.designThemes;
export const designThemeStorageKey = appearance.designThemeStorageKey;
export const installAppearanceMenus = installMenus;
export const isDesignTheme = appearance.isDesignTheme;
export const normalizeDesignTheme = appearance.normalizeDesignTheme;
export const resolveDesignTheme = appearance.resolveDesignTheme;
