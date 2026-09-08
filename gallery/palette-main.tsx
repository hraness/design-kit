import { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";
import { useState } from "react";
import { builtDesignKitReact } from "./built-react.js";
import "../src/palettes.css";
import "./palette.css";

const { DesignPaletteProvider, ThemeMenuButton, ThemeColorSync, useDesignPalette, useDesignPortalClassName, useDesignPortalTheme } = builtDesignKitReact;

function PalettePreview() {
  const [requestedMode, setRequestedMode] = useState("");
  const controlled = new URL(location.href).searchParams.has("controlled");
  const palette = useDesignPalette();
  const portalClassName = useDesignPortalClassName();
  const mode = useDesignPortalTheme();
  return <>
    <header><strong>Design kit palettes</strong>{controlled
      ? <ThemeMenuButton onChange={setRequestedMode} size="default" value="light" />
      : <ThemeMenuButton size="default" />}</header>
    <main>
      <h1>Appearance</h1>
      <p data-palette-state>{palette?.preference.palette} / {palette?.preference.mode} / {palette?.resolvedMode}</p>
      {controlled ? <p data-palette-controlled-request>{requestedMode}</p> : null}
      <div data-palette-surface>Surface and text use semantic colors.</div>
      <button id="outside" type="button">Outside menu</button>
    </main>
    {createPortal(<div className={portalClassName} data-palette-portal data-theme={mode}>Body portal</div>, document.body)}
  </>;
}

const root = document.querySelector("#root");
if (root === null) throw new Error("Palette gallery root is missing.");
createRoot(root).render(<DesignPaletteProvider legacyStorageKey={null}>
  <ThemeColorSync />
  <PalettePreview />
</DesignPaletteProvider>);
