import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import {
  DesignPortalThemeProvider,
  useDesignPortalClassName,
  useDesignPortalTheme,
} from "./design-theme-context";

function ThemeProbe() {
  const portalClassName = useDesignPortalClassName();
  const theme = useDesignPortalTheme();
  return <div className={portalClassName} data-theme={theme}>Overlay</div>;
}

test("an explicit subtree theme remains available across React portal boundaries", () => {
  const html = renderToStaticMarkup(
    <DesignPortalThemeProvider portalClassName="product-theme" theme="dark">
      <ThemeProbe />
    </DesignPortalThemeProvider>,
  );

  expect(html).toBe('<div class="product-theme" data-theme="dark">Overlay</div>');
});

test("the shared theme provider bridges its resolved theme into product-owned portals", async () => {
  const source = await Bun.file(new URL("./theme.tsx", import.meta.url)).text();

  expect(source).toContain("<DesignPortalThemeProvider theme={portalTheme}>");
  expect(source).toContain("<PortalThemeBridge forcedTheme={forcedTheme}>");
});
