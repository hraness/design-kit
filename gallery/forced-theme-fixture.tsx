import { useState } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "next-themes";

import { builtDesignKitReact } from "./built-react.js";

const { DesignPortalThemeProvider, DesignThemeProvider, JellySurface, ThemeColorSync,
  useDesignPortalClassName, useDesignPortalTheme } = builtDesignKitReact;

function PortalProbe({ nested = false }: Readonly<{ nested?: boolean }>) {
  const theme = useDesignPortalTheme();
  const className = useDesignPortalClassName();
  return createPortal(
    <div className={className} data-forced-theme-portal={nested ? "nested" : "root"}
      data-theme={theme} style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      {nested ? "Explicit portal" : "Inherited portal"}
    </div>, document.body,
  );
}

function PreferenceProbe() {
  const { forcedTheme, resolvedTheme, theme } = useTheme();
  return <output data-forced-preference={forcedTheme ?? "none"}
    data-resolved-preference={resolvedTheme} data-saved-preference={theme}>Appearance state</output>;
}

/** Isolated native fixture exercises the compiled public runtime and real storage. */
export function ForcedThemeFixture() {
  const initial = new URL(location.href).searchParams.get("forced-theme");
  if (initial !== "light" && initial !== "dark") throw new Error("A concrete forced theme is required.");
  const [forced, setForced] = useState<"dark" | "light" | undefined>(initial);
  const nestedTheme = initial === "dark" ? "light" : "dark";
  return <main>
    <h1>Forced appearance regression</h1>
    <button type="button" onClick={() => setForced(undefined)}>Use saved appearance</button>
    <button type="button" onClick={() => setForced(initial)}>Restore forced appearance</button>
    <DesignThemeProvider {...(forced === undefined ? {} : { forcedTheme: forced })}>
      <ThemeColorSync />
      <PreferenceProbe />
      <PortalProbe />
      <DesignPortalThemeProvider portalClassName="forced-theme-explicit-portal" theme={nestedTheme}>
        <PortalProbe nested />
      </DesignPortalThemeProvider>
      <JellySurface>Native Jelly appearance</JellySurface>
    </DesignThemeProvider>
  </main>;
}
