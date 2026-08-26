import { createRoot } from "react-dom/client";

import "../src/styles.css";
import { builtDesignKitReact } from "./built-react.js";

const {
  DesignSystemGallery,
  DesignThemeProvider,
  ThemeMenuButton,
  ThemeColorSync,
  TopBar,
} = builtDesignKitReact;

const root = document.querySelector("#root");
if (!(root instanceof HTMLElement)) {
  throw new Error("Gallery root is missing.");
}

createRoot(root).render(
  <DesignThemeProvider>
    <ThemeColorSync />
    <TopBar actions={<ThemeMenuButton />} position="sticky" title="Design kit" />
    <DesignSystemGallery />
  </DesignThemeProvider>,
);
