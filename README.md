# hraness/design-kit

Opinionated application compositions, charts, effects, and syntax presentation built on `@hraness/ui`.

`@hraness/design-kit` is the presentation layer above the portable React Aria core. It owns application shells, route states, appearance persistence, charts, instrument controls, haptics, decorative effects, server syntax highlighting, quiet-site CSS, and an executable gallery. Forms, actions, overlays, collections, navigation primitives, and low-level surfaces remain in `@hraness/ui`.

## Install

Pin the immutable GitHub release:

```json
{
  "dependencies": {
    "@hraness/design-kit": "github:hraness/design-kit#v0.2.1",
    "@hraness/ui": "github:hraness/ui#v0.4.7"
  }
}
```

`@hraness/ui` is an explicit peer dependency with the supported range
`>=0.4.7 <0.5.0`; consumers should pin an immutable compatible release such as
`v0.4.7` when using the stylesheet or React entries. The peer is optional at
installation so the framework-neutral root and syntax highlighter can be used
on their own. React 18 or 19 and React DOM 18 or 19 are also peer dependencies.

## Load the presentation layer

Import the complete stylesheet once after Tailwind, if the application uses it:

```css
@import "tailwindcss";
@import "@hraness/design-kit/styles.css";
```

The complete stylesheet composes the token, reset, legacy component, and extracted StyleX layers from `@hraness/ui` before applying design-kit presentation. It keeps `base` below `components`, then freezes UI legacy, priority1, priority2, and priority3 before design-kit legacy, priority1, priority2, priority3, and priority4. Migrated declarations therefore win according to package ownership and StyleX priority without relying on import timing. Nebula Sans is the default proportional text and heading face, while explicit code and mono roles keep the system monospace stack. Package-owned atomic component presentation is authored in colocated `*.stylex.ts` files and compiled into deterministic `dist/stylex.css` with runtime injection disabled. `styles.css` reaches that local artifact once through `components.css`, so the public narrow component entry and the complete entry carry the same component recipes. Generated atomic class names are declaration hashes that may repeat across package layers; they are internal and do not identify package ownership. Use documented stable classes only when a composition exposes one. StyleX 0.19 physicalizes the notice's block-axis inset and border into `top` and `border-bottom` rules. The notice preserves horizontal LTR and RTL behavior; this compiler canary does not claim vertical-writing-mode parity.

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

`AnimatedRailStage` keeps the surrounding shell mounted while one keyed route stage enters and exits through `AnimatePresence` in wait mode. The public `stageKey`, stable class, `data-stage-key`, and caller-last `className` contracts remain unchanged. Its logical minimum and reduced-motion fallback are delivered through extracted StyleX classes. Reduced motion keeps content visible, removes translation and duration from the motion recipe, and forces any Motion-authored transform and transition off in CSS.

`ChatMessage` keeps its article, finite `data-role`, optional avatar, header, and action slots, and caller-last root class while its grid, logical minimum, and metadata-row presentation are delivered through extracted StyleX classes. `ChatComposer` remains a controlled native form composition with a multiline field and submit button. It always prevents native navigation, calls its callback only for an enabled, non-pending, nonblank value, and keeps native form attributes and inline styles caller-controlled. Its two-column layout collapses to one column at the existing compact breakpoint. Neither component exposes a public `xstyle` or ref seam.

`TopBar`, `BottomBar`, `PageCanvas`, and `DockedFooter` keep their native header, footer, main, or div semantics while their product-neutral layout recipes are delivered through extracted StyleX classes. Their stable classes and data attributes remain available for semantic inspection, and native `className` and `style` props remain caller-controlled. `DockedFooter` continues to forward its root footer ref. Its `surface` value remains a stable data hook; only `TopBar` gives `glass` a visual treatment.

`DitherSurface` composes its product-neutral texture through the typed `ThemedSurface` seam from `@hraness/ui`. Its `density` is one of `coarse`, `fine`, or `medium`; the default medium texture uses `4px`, while coarse and fine set the literal public `--hraness-design-dither-size` property to `7px` and `3px`. A caller `xstyle` recipe is applied after the shared texture, and native `style` remains last for deliberate per-instance overrides. Forced-colors mode removes the decorative image without changing the surface's content, native element, tone, shape, or border.

`PlaybackTransport` keeps one large primary command through idle, pending, and playing states. Give the toolbar exactly one of `aria-label` or `aria-labelledby`; the command changes its accessible label, glyph, busy state, and play or stop callback without changing its stable button hook. Its wrapping toolbar recipe and exact `1.5rem` logical glyph and spinner dimensions are delivered through extracted StyleX classes. The existing root `className`, button id, keyboard-shortcut, button-ref, and trailing-control seams remain available.

`Fader` keeps the full React Aria single-value slider contract while defaulting to a vertical, default-density control with a hidden accessible label and output. Its default and compact dimensions, horizontal variant, label row, rails, thumb, and focus-visible state are delivered through extracted StyleX classes. The two decorative rail nodes are inert and keep the logical geometry that the former pseudo selectors provided without expanding the package layer range. Existing root and input refs, visible label and accessory, output, caller `className`, native slider props, and native `style` overrides remain available. Native styles may override the public `--hraness-design-fader-*` properties for a deliberate per-instance size.

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

## Foil cards and decks

`FoilCardSurface` adds deterministic material paint behind semantic card
content. Use `renderMode="static"` for image capture and other motionless
surfaces. Interactive cards work on their own; a collection should be wrapped
once in `FoilCardDeck`, which delegates pointer and focus interaction through a
single controller and keeps geometry cached for the active descendant.

```tsx
import { FoilCardDeck, FoilCardSurface } from "@hraness/design-kit/react";

<FoilCardDeck aria-label="Reference cards" className="card-grid">
  {records.map((record) => (
    <FoilCardSurface
      intensity="standard"
      key={record.id}
      ornament="circuit"
      preset="aurora"
      renderMode="interactive"
      seed={record.id}
    >
      <article>{record.label}</article>
    </FoilCardSurface>
  ))}
</FoilCardDeck>
```

The optional `ornament` is one of `none`, `corners`, `rails`, `circuit`,
`radial`, or `facets`. It affects edge paint only, so product content remains
legible. Set `--foil-card-radius` on a surface or deck descendant to match a
product-owned card radius. Fine-pointer movement activates directional
diffraction; keyboard focus gets a motionless material cue. Touch, reduced
motion, and forced-colors modes keep ordinary semantic content intact, and no
inactive card receives `will-change`.

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

Nebula Sans is bundled under the SIL Open Font License and loads through `tokens.css` for ordinary text and headings. Explicit serif treatments remain product-owned, and code and mono roles keep the system monospace stack. Geist Mono remains available as an optional display face:

Content Security Policies must allow same-origin font assets with `font-src 'self'`.
Bundlers configured to inline font assets also require `data:` in that directive.

```css
@import "@hraness/design-kit/fonts.css";

:root {
  --font-heading: var(--font-geist-mono);
}
```

Applications may override semantic roles in a local stylesheet after the design-kit import. Keep deliberate serif and monospace treatments explicit so they are not absorbed into the proportional default. The public package contains no restricted font assets or metric overrides.

Generated artwork can import `nebulaSansSocialFonts` from
`@hraness/design-kit/fonts/nebula-sans/social`. It returns the official Book and
Bold OTF payloads without a remote request or runtime filesystem lookup, ready
for an `ImageResponse` `fonts` option.

## Optional Jelly paint

`JellySurface` adds a painted host around semantic content. The child remains the only interactive control. The runtime is pinned, loaded only in a browser, and has a CSS fallback when JavaScript or the dynamic chunk is unavailable.

The audited Jelly UI artifacts and MIT license are under `vendor/jelly-ui`. The EvilCharts license and adaptation provenance are under `vendor/evilcharts`.

## Gallery

`DesignSystemGallery` is an executable, product-neutral reference for the package boundary. Mount it in a development route and import `design-gallery.css` through the complete stylesheet. The gallery exercises Chat message slots, controlled composer submission, compact responsive layout, extracted class delivery, and caller-last classes alongside the other public compositions.

## Development

Use Bun 1.3.14:

```sh
bun install --frozen-lockfile
bun run check
```

The stable dependency pair for this release is `@hraness/ui` `v0.4.7` with `@hraness/design-kit` `v0.2.1`. The previous rollback pair remains `@hraness/ui` `v0.4.6` with `@hraness/design-kit` `v0.1.9`.

The complete check runs linting, typechecking, production builds, an installed-package smoke test, deterministic examples, property tests, server rendering, vendor-integrity checks, and headless Chromium regressions. The browser gate verifies responsive shell ownership, extracted AnimatedRailStage, Fader, layout-surface, and playback-transport delivery, reduced-motion stage fallback, Fader keyboard and focus behavior, forced-color behavior, keyboard-operable appearance, browser-chrome synchronization across opposing device and saved preferences, global-error static metadata and runtime lifecycle, accessible title and copy, deterministic procedural layers, viewport containment, and the absence of the excluded canvas effect. Set `CHROMIUM_EXECUTABLE_PATH` when Chromium or Chrome is installed outside the standard macOS and Linux paths.

Global CSS remains the boundary for tokens, resets, document grammar, cross-component layout, accessibility media rules, and audited vendor fallbacks. A new overlapping compiled style family from another package requires a layer-order compatibility gate against that package's released artifact before adoption.

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request. Report suspected vulnerabilities as described in [SECURITY.md](./SECURITY.md).

## License

MIT. Vendored Nebula Sans, Geist Mono, and other upstream artifacts retain their own included license and provenance files.
