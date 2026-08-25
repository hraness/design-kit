# hraness/design-kit

Opinionated application compositions, charts, effects, and syntax presentation built on `@hraness/ui`.

`@hraness/design-kit` is the presentation layer above the portable React Aria core. It owns application shells, route states, appearance persistence, charts, instrument controls, haptics, decorative effects, server syntax highlighting, quiet-site CSS, and an executable gallery. Forms, actions, overlays, collections, navigation primitives, and low-level surfaces remain in `@hraness/ui`.

## Install

Pin the immutable GitHub release:

```json
{
  "dependencies": {
    "@hraness/design-kit": "github:hraness/design-kit#v0.1.9",
    "@hraness/ui": "github:hraness/ui#v0.4.6"
  }
}
```

`@hraness/ui` is an explicit peer dependency with the supported range
`>=0.4.0 <0.5.0`; consumers should pin an immutable compatible release such as
`v0.4.6` when using the stylesheet or React entries. The peer is optional at
installation so the framework-neutral root and syntax highlighter can be used
on their own. React 18 or 19 and React DOM 18 or 19 are also peer dependencies.

## Load the presentation layer

Import the complete stylesheet once after Tailwind, if the application uses it:

```css
@import "tailwindcss";
@import "@hraness/design-kit/styles.css";
```

The complete stylesheet composes the token, reset, and component layers from `@hraness/ui` before applying design-kit presentation. It uses system font stacks by default.

Import narrower layers when the application does not need the full presentation system:

```css
@import "@hraness/design-kit/tokens.css";
@import "@hraness/design-kit/charts.css";
@import "@hraness/design-kit/effects.css";
@import "@hraness/design-kit/syntax-highlighting.css";
```

`plain-site.css` provides a compact site shell. `plain-publication.css` adds sourced article, citation, table, callout, and related-reading structure.

## Use application compositions

```tsx
import { Button, Icon, ViewportFrame } from "@hraness/ui";
import {
  AppShell,
  NavigationRail,
  PageCanvas,
  RailItem,
  RailSection,
  TopBar,
} from "@hraness/design-kit/react";
import { DashboardSquare01Icon } from "@hugeicons/core-free-icons";

export function Workspace() {
  const rail = (
    <NavigationRail>
      <RailSection title="Workspace">
        <RailItem
          href="/"
          icon={<Icon icon={DashboardSquare01Icon} />}
          isActive
          label="Overview"
        />
      </RailSection>
    </NavigationRail>
  );

  return (
    <ViewportFrame>
      <AppShell rail={rail} topBar={<TopBar title="Workspace" />}>
        <PageCanvas>
          <Button variant="primary">Create project</Button>
        </PageCanvas>
      </AppShell>
    </ViewportFrame>
  );
}
```

Connect routing with `RouterProvider` from `@hraness/ui`. Design-kit rail links use that public router context and intent-prefetch contract.

## Use charts and syntax

Charts own responsive geometry, exact-value accessibility, reduced motion, and forced-color behavior. Applications own data, labels, units, and categorical colors.

```tsx
import { BarListChart, SyntaxCode } from "@hraness/design-kit/react";

<BarListChart
  aria-label="Requests by region"
  data={[
    { id: "north", label: "North", value: 72 },
    { id: "south", label: "South", value: 48 },
  ]}
/>

<pre>
  <SyntaxCode code={'const ready = true;'} language="typescript" />
</pre>
```

The framework-neutral highlighter is also available from `@hraness/design-kit/syntax-highlighting`.
Server components can import `SyntaxCode`, deterministic procedural effects, and
static surfaces from `@hraness/design-kit/react/server` without crossing the
client boundary used by the interactive React barrel.

## Appearance and fonts

Wrap browser applications with `DesignThemeProvider` and render
`ThemeMenuButton` as the final action in the product header. It exposes one
icon-only trigger and a Light, Dark, or System menu with the same presentation
across products. The first visit defaults to System and follows the device
preference. Explicit Light, Dark, and System choices persist under a versioned
Hraness-neutral key. Server-rendered document roots may use Light as a safe
concrete baseline while the blocking appearance bootstrap resolves the stored
or System preference before paint.

`ThemeColorSync` leaves adaptive media-qualified server tags in control until a
concrete Light or Dark preference resolves. It then owns one active browser
chrome color, temporarily neutralizes competing same-name tags, and restores
their exact media conditions after the final synchronized owner unmounts.

Use `GlobalErrorDocument` for a Next root `global-error` boundary. It remains
control-free because the normal product header is unavailable. Its System
default emits adaptive Light and Dark `theme-color` metadata plus a
`light dark` `color-scheme` before hydration, then follows the same stored
preference as the application. Products with their own canvas colors pass the
same palette once:

```tsx
<GlobalErrorDocument
  darkColor="#101419"
  error={error}
  lightColor="#f4efe7"
  reset={reset}
/>
```

An explicitly fixed `theme="light"` or `theme="dark"` emits one matching,
unqualified `theme-color` and a fixed `color-scheme` without mounting the
preference provider.

Static HTML products use the same composition without a client framework:

```ts
import { installAppearanceMenus } from "@hraness/design-kit/browser";

installAppearanceMenus({
  darkThemeColor: "#09090d",
  lightThemeColor: "#f7f3ea",
  storageKey: "product-appearance",
});
```

Load `@hraness/design-kit/appearance-menu.css`, render one progressive
`[data-hraness-appearance-menu]` composition as the final header action, and
bundle the installer into a small blocking local script. The installer applies
the stored or System preference before the stylesheet loads, synchronizes
browser chrome, and supplies the same icon, menu, keyboard, focus, and storage
contract as the React control. Importing the browser module has no side effects.

All default text, heading, and code roles use system stacks. Geist Mono is shipped under the SIL Open Font License as an optional display face. Load it explicitly, then map a semantic role:

```css
@import "@hraness/design-kit/fonts.css";

:root {
  --font-heading: var(--font-geist-mono);
}
```

Applications may provide their own licensed fonts in a local stylesheet after the design-kit import. The public package contains no restricted font assets or metric overrides.

## Optional Jelly paint

`JellySurface` adds a painted host around semantic content. The child remains the only interactive control. The runtime is pinned, loaded only in a browser, and has a CSS fallback when JavaScript or the dynamic chunk is unavailable.

The audited Jelly UI artifacts and MIT license are under `vendor/jelly-ui`. The EvilCharts license and adaptation provenance are under `vendor/evilcharts`.

## Gallery

`DesignSystemGallery` is an executable, product-neutral reference for the package boundary. Mount it in a development route and import `design-gallery.css` through the complete stylesheet.

## Development

Use Bun 1.3.14:

```sh
bun install --frozen-lockfile
bun run check
```

The complete check runs linting, typechecking, production builds, an installed-package smoke test, deterministic examples, property tests, server rendering, vendor-integrity checks, and headless Chromium regressions. The browser gate verifies responsive shell ownership, keyboard-operable appearance, browser-chrome synchronization across opposing device and saved preferences, global-error static metadata and runtime lifecycle, accessible title and copy, deterministic procedural layers, viewport containment, and the absence of the excluded canvas effect. Set `CHROMIUM_EXECUTABLE_PATH` when Chromium or Chrome is installed outside the standard macOS and Linux paths.

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request. Report suspected vulnerabilities as described in [SECURITY.md](./SECURITY.md).

## License

MIT. Vendored upstream artifacts retain their own included license and provenance files.
