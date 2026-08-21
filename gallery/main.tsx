import { createRoot } from "react-dom/client";

import "../src/styles.css";
import {
  DesignSystemGallery,
  DesignThemeProvider,
  ThemeMenuButton,
  ThemeColorSync,
  TopBar,
} from "../src/react";

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
