"use client";

import {
  AppearanceIcon,
  IconButton,
  Menu,
  MenuItem,
  MenuTrigger,
  SegmentedControl,
  cn,
  type SegmentedItem,
} from "@hraness/ui";
import { ThemeProvider as NextThemeProvider, useTheme } from "next-themes";
import {
  type ReactNode,
  useEffect,
  useSyncExternalStore,
} from "react";

import { colors } from "../index.js";
import { DesignPortalThemeProvider } from "./design-theme-context.js";
import { setJellyThemeMode } from "./jelly-runtime.js";

export const designThemes = ["light", "dark", "system"] as const;
export type DesignTheme = (typeof designThemes)[number];
export type ConcreteDesignTheme = Exclude<DesignTheme, "system">;
export const defaultDesignTheme: DesignTheme = "system";

const concreteThemes = ["light", "dark"] as const;
const emptySubscribe = (): (() => void) => () => undefined;

export function isDesignTheme(value: unknown): value is DesignTheme {
  return typeof value === "string" && designThemes.some((theme) => theme === value);
}

/** Invalid or unavailable persisted values resolve to the shared first-visit preference. */
export function normalizeDesignTheme(value: unknown): DesignTheme {
  return isDesignTheme(value) ? value : defaultDesignTheme;
}

function useHydrated(): boolean {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

function themeStorageGuardScript(storageKey: string): string {
  const serializedKey = JSON.stringify(storageKey)
    .replaceAll("<", "\\u003c")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
  return `(()=>{try{const key=${serializedKey};const value=localStorage.getItem(key);if(value!==null&&value!=="light"&&value!=="dark"&&value!=="system")localStorage.setItem(key,"${defaultDesignTheme}")}catch{}})();`;
}

function PersistedThemeNormalizer() {
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    if (theme !== undefined && !isDesignTheme(theme)) setTheme(defaultDesignTheme);
  }, [setTheme, theme]);

  return null;
}

function JellyThemeSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (resolvedTheme === "light" || resolvedTheme === "dark") {
      void setJellyThemeMode(resolvedTheme);
    }
  }, [resolvedTheme]);

  return null;
}

function PortalThemeBridge({
  children,
  forcedTheme,
}: Readonly<{
  children: ReactNode;
  forcedTheme: ConcreteDesignTheme | undefined;
}>) {
  const { resolvedTheme } = useTheme();
  const portalTheme = resolvedTheme === "light" || resolvedTheme === "dark"
    ? resolvedTheme
    : forcedTheme;

  return (
    <DesignPortalThemeProvider theme={portalTheme}>
      {children}
    </DesignPortalThemeProvider>
  );
}

export interface DesignThemeProviderProps {
  readonly children: ReactNode;
  /** Locks products with an explicit single-theme identity to one concrete theme. */
  readonly forcedTheme?: ConcreteDesignTheme;
  /** Applied to next-themes' blocking bootstrap script for strict CSPs. */
  readonly nonce?: string;
  /** Defaults to the shared, versioned browser preference key. */
  readonly storageKey?: string;
}

/**
 * Shared appearance boundary for browser products. System is the first-visit
 * preference, while explicit Light, Dark, and System choices persist.
 */
export function DesignThemeProvider({
  children,
  forcedTheme,
  nonce,
  storageKey = "hraness-design-theme-v1",
}: DesignThemeProviderProps) {
  return (
    <>
      {forcedTheme === undefined ? (
        <script
          {...(nonce === undefined ? {} : { nonce })}
          data-hraness-design-theme-guard=""
          dangerouslySetInnerHTML={{ __html: themeStorageGuardScript(storageKey) }}
          suppressHydrationWarning
        />
      ) : null}
      <NextThemeProvider
        {...(nonce === undefined ? {} : { nonce })}
        attribute="data-theme"
        defaultTheme={forcedTheme ?? defaultDesignTheme}
        disableTransitionOnChange
        enableSystem={forcedTheme === undefined}
        forcedTheme={forcedTheme}
        storageKey={storageKey}
        themes={[...concreteThemes]}
      >
        {forcedTheme === undefined ? <PersistedThemeNormalizer /> : null}
        <JellyThemeSync />
        <PortalThemeBridge forcedTheme={forcedTheme}>{children}</PortalThemeBridge>
      </NextThemeProvider>
    </>
  );
}

export type ThemeToggleLabels = Readonly<Partial<Record<DesignTheme, string>>>;
export type ThemeToggleDisplay = "icons" | "labels";
export type ThemeTogglePresentation = "menu" | "segmented";

function themeToggleLabel(id: DesignTheme, labels?: ThemeToggleLabels): string {
  return labels?.[id] ?? `${id[0]?.toUpperCase() ?? ""}${id.slice(1)}`;
}

export function themeToggleItems(
  labels?: ThemeToggleLabels,
): readonly [SegmentedItem<DesignTheme>, ...SegmentedItem<DesignTheme>[]] {
  return [
    { id: "light", label: themeToggleLabel("light", labels) },
    { id: "dark", label: themeToggleLabel("dark", labels) },
    { id: "system", label: themeToggleLabel("system", labels) },
  ];
}

function themeToggleIcon(id: DesignTheme): ReactNode {
  return <AppearanceIcon name={id} />;
}

function themeToggleIconItems(
  labels?: ThemeToggleLabels,
): readonly [SegmentedItem<DesignTheme>, ...SegmentedItem<DesignTheme>[]] {
  return [
    {
      ariaLabel: themeToggleLabel("light", labels),
      id: "light",
      label: themeToggleIcon("light"),
    },
    {
      ariaLabel: themeToggleLabel("dark", labels),
      id: "dark",
      label: themeToggleIcon("dark"),
    },
    {
      ariaLabel: themeToggleLabel("system", labels),
      id: "system",
      label: themeToggleIcon("system"),
    },
  ];
}

interface ThemeToggleBaseProps {
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly labels?: ThemeToggleLabels;
  readonly size?: "compact" | "default";
}

type ThemeTogglePresentationProps =
  | {
    /** Three visible choices for settings and other surfaces with stable inline room. */
    readonly display?: ThemeToggleDisplay;
    readonly presentation?: "segmented";
  }
  | {
    /** One bounded trigger for persistent chrome and text-enlargement reflow. */
    readonly display?: never;
    readonly presentation: "menu";
  };

type ThemeToggleControlProps =
  | {
    readonly onChange?: never;
    readonly value?: never;
  }
  | {
    readonly onChange: (theme: DesignTheme) => void;
    readonly value: DesignTheme;
  };

export type ThemeToggleProps =
  & ThemeToggleBaseProps
  & ThemeToggleControlProps
  & ThemeTogglePresentationProps;

/** A hydration-stable, persisted Light/Dark/System appearance control. */
export function ThemeToggle({
  "aria-label": ariaLabel = "Appearance",
  className,
  display = "icons",
  labels,
  onChange,
  presentation = "segmented",
  size = "compact",
  value: controlledValue,
}: ThemeToggleProps) {
  const hydrated = useHydrated();
  const { setTheme, theme } = useTheme();
  const controlled = controlledValue !== undefined;
  const ready = controlled || hydrated;
  const value = controlledValue ?? (hydrated ? normalizeDesignTheme(theme) : defaultDesignTheme);
  const items = display === "icons" ? themeToggleIconItems(labels) : themeToggleItems(labels);
  const changeTheme = (nextTheme: DesignTheme): void => {
    if (controlled) onChange?.(nextTheme);
    else setTheme(nextTheme);
  };
  const currentLabel = themeToggleLabel(value, labels);

  return (
    <div
      aria-busy={!ready || undefined}
      className={cn("hraness-design-theme-toggle", className)}
      data-display={presentation === "menu" ? "icons" : display}
      data-presentation={presentation}
      data-ready={ready ? "true" : "false"}
      data-theme-value={value}
    >
      {presentation === "menu" ? (
        <MenuTrigger>
          <IconButton
            aria-label={`${ariaLabel}: ${currentLabel}`}
            isDisabled={!ready}
            size={size}
            tooltip={`${ariaLabel}: ${currentLabel}`}
          >
            {themeToggleIcon(value)}
          </IconButton>
          <Menu
            aria-label={ariaLabel}
            className="hraness-design-theme-toggle__menu"
            disallowEmptySelection
            onAction={(key) => {
              if (isDesignTheme(key)) changeTheme(key);
            }}
            popoverClassName="hraness-design-theme-toggle__popover"
            selectedKeys={[value]}
            selectionMode="single"
          >
            {designThemes.map((id) => (
              <MenuItem
                data-theme-value={id}
                id={id}
                key={id}
                leading={themeToggleIcon(id)}
                textValue={themeToggleLabel(id, labels)}
              >
                {themeToggleLabel(id, labels)}
              </MenuItem>
            ))}
          </Menu>
        </MenuTrigger>
      ) : (
        <SegmentedControl
          aria-label={ariaLabel}
          isDisabled={!ready}
          items={items}
          onChange={changeTheme}
          size={size}
          value={value}
        />
      )}
    </div>
  );
}

export interface ThemeColorSyncProps {
  readonly darkColor?: string;
  readonly lightColor?: string;
  readonly metaName?: string;
}

export function themeColorFor(
  resolvedTheme: string | undefined,
  values: Readonly<{ dark: string; light: string }>,
): string {
  return resolvedTheme === "dark" ? values.dark : values.light;
}

/** Keeps browser and installed-app chrome aligned with the resolved theme. */
export function ThemeColorSync({
  darkColor = colors.dark.background,
  lightColor = colors.light.background,
  metaName = "theme-color",
}: ThemeColorSyncProps) {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const existing = Array.from(document.head.querySelectorAll<HTMLMetaElement>("meta[name]"))
      .find((meta) => meta.name === metaName && !meta.hasAttribute("media"));
    const meta = existing ?? document.createElement("meta");
    if (existing === undefined) {
      meta.name = metaName;
      document.head.append(meta);
    }
    meta.content = themeColorFor(resolvedTheme, { dark: darkColor, light: lightColor });
  }, [darkColor, lightColor, metaName, resolvedTheme]);

  return null;
}
