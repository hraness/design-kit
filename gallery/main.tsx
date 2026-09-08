import { useState } from "react";
import { createRoot } from "react-dom/client";

import "../src/styles.css";
import "./gallery.css";
import { builtDesignKitReact } from "./built-react.js";

const {
  AppShell,
  BarListChart,
  DesignPortalThemeProvider,
  DesignPaletteProvider,
  DesignSystemGallery,
  DesignThemeProvider,
  JellySurface,
  ProceduralBackdrop,
  RadarProfileChart,
  RangePlotChart,
  ThemeColorSync,
  ThemeMenuButton,
  ThemeToggle,
  TopBar,
} = builtDesignKitReact;

function ParityCharts() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <>
      <BarListChart
        aria-label="Parity bar values"
        data={[{ id: "first", label: "First", value: 25 }, { id: "second", label: "Second", value: 75 }]}
        domain={[0, 100]}
        onSelectionChange={setSelected}
        selectedId={selected}
      />
      <RangePlotChart
        aria-label="Parity range values"
        data={[{ id: "first", label: "First range", maximum: 80, median: 40, minimum: 20 }]}
        domain={[0, 100]}
        onSelectionChange={setSelected}
        selectedId={selected}
      />
      <RadarProfileChart
        aria-label="Parity radar values"
        axes={[{ id: "a", label: "Alpha" }, { id: "b", label: "Beta" }, { id: "c", label: "Gamma" }]}
        onSelectionChange={setSelected}
        selectedId={selected}
        series={[{ color: "#3177aa", id: "first", label: "First series", values: { a: 30, b: 60, c: 90 } }]}
      />
    </>
  );
}

// Isolated native fixtures use the built public components. The browser verifier
// removes only chart recipe atoms from the second instance to apply the old CSS oracle.
function MigrationParityFixture() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  return (
    <main data-migration-parity="">
      <section data-parity-live=""><ParityCharts /></section>
      <section data-parity-raw=""><ParityCharts /></section>
      <aside data-parity-controls="">
        <div data-parity-segmented-inline="">
          <ThemeToggle className="parity-segmented-caller" display="labels" onChange={setTheme} presentation="segmented" value={theme} />
        </div>
        <div data-parity-shell=""><AppShell rail="Rail border canary">Page</AppShell></div>
        <div data-parity-rail-control="">Rail border negative control</div>
        <div data-parity-system-color="">System text color reference</div>
        <ThemeMenuButton aria-label="Parity appearance" onChange={setTheme} value={theme} />
        <JellySurface>Native border canary</JellySurface>
        <div style={{ height: 120, position: "relative", width: 240 }}>
          <ProceduralBackdrop seed="migration-border-parity" variant="ripple" />
        </div>
        <div data-parity-border-control="">Lower-layer border-image control</div>
      </aside>
    </main>
  );
}

const root = document.querySelector("#root");
if (!(root instanceof HTMLElement)) {
  throw new Error("Gallery root is missing.");
}

createRoot(root).render(new URL(location.href).searchParams.has("palettes") ? (
  <DesignPaletteProvider>
    <TopBar actions={<ThemeMenuButton />} position="sticky" title="Design kit" />
    <DesignSystemGallery />
  </DesignPaletteProvider>
) : (
  <DesignThemeProvider>
    <ThemeColorSync />
    {new URL(location.href).searchParams.has("migration-parity") ? (
      <MigrationParityFixture />
    ) : (
      <>
        <TopBar
          actions={(
            <DesignPortalThemeProvider
              portalClassName="design-gallery-appearance-portal-canary"
              theme={undefined}
            >
              <ThemeMenuButton />
            </DesignPortalThemeProvider>
          )}
          position="sticky"
          title="Design kit"
        />
        <DesignSystemGallery />
      </>
    )}
  </DesignThemeProvider>
));
