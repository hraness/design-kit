# hraness/design-kit

React components and CSS for Hraness apps and product sites: application shells, marketing sections, charts, themes, effects, and syntax highlighting. Built on `@hraness/ui`.

`@hraness/ui` supplies the accessible React Aria primitives: actions, form fields, overlays, collections, navigation, and basic surfaces. This package builds on them with application shells, loading and error pages, saved light and dark appearance, charts and instrument controls, haptics, decorative effects, server-side syntax highlighting, plain-site CSS, and a gallery you can run.

## Install

Pin a GitHub release tag:

```json
{
  "dependencies": {
    "@hraness/design-kit": "github:hraness/design-kit#v0.15.0",
    "@hraness/ui": "github:hraness/ui#v0.5.16"
  }
}
```

`@hraness/ui` is an explicit peer dependency with the supported range
`>=0.5.16 <0.6.0`; consumers should pin an immutable compatible release such as
`v0.5.16` when using the stylesheet, React, or compiler-adopter entries. The peer is optional at
installation so the framework-neutral root and syntax highlighter can be used
on their own. React 18 or 19 and React DOM 18 or 19 are also peer dependencies.

### Metallic brand marks

`FoilMark` is available from both React entry points, including the server-safe
`@hraness/design-kit/react/server`. Give it a transparent same-origin SVG (or a
data URL); the exact artwork alpha carries the material and the original image
remains underneath as a fallback. An optional `fallback` accepts the original
inline vector for currentColor behavior. The mark is decorative unless `label`
is supplied. Name its enclosing link once.

React consumers load `@hraness/design-kit/components.css` or the complete
`styles.css` entry. The raw marketing stylesheet alone styles authored HTML
hooks; it does not contain the compiled React atoms.

```tsx
<MarketingSiteHeader brand="Relay" brandMark="/marks/relay.svg" links={[]} />
<FoilMark src="/marks/relay.svg" size={44} />
```

Wordmarks and marks use contrast-bearing metal bands with a faint rainbow
reflection, including before hydration and on touch devices. The existing
`attachFoil` controller adds bounded pointer movement only when motion and
forced-color preferences permit it. `--hraness-foil-reflection` defaults to
`14%`; `--hraness-foil-image` can replace the shared text/mark paint. Existing
spectrum tokens and primary-action surfaces remain compatible. A blocked inline
mask style or unsupported masks retain the original image. Cross-origin masks
require the asset server's CORS permission; prefer local assets. Forced colors
remove the overlay entirely.


## Load the presentation layer

Import the complete stylesheet once after Tailwind, if the application uses it:

```css
@import "tailwindcss";
@import "@hraness/design-kit/styles.css";
```

The complete stylesheet composes the token, reset, legacy component, and extracted StyleX layers from `@hraness/ui` before applying design-kit presentation. It keeps `base` below `components`, then freezes UI `legacy.base`, legacy, and priority1 through priority7 before the design-kit legacy and priority1-through-priority8 inventory. The design-kit manifest currently maps eight raw-priority buckets to those eight serialized ranks. Rank 1 begins with generated raw-priority-0 keyframes, so its keyframes and custom-property atoms are unlayered and `priority1` is reserved in the prelude; the remaining atomic output occupies the exact `priority2` through `priority8` blocks. Migrated declarations therefore win according to package ownership and StyleX priority without relying on import timing. Nebula Sans is the default proportional text and heading face, while explicit code and mono roles keep the system monospace stack. Package-owned atomic component presentation is authored in colocated `*.stylex.ts` files and compiled into deterministic `dist/stylex.css` with runtime injection disabled. `styles.css` reaches that local artifact once through `components.css`, so the public narrow component entry and the complete entry carry the same component recipes. Generated atomic class names are declaration hashes that may repeat across package layers; they are internal and do not identify package ownership. Use documented stable classes only when a composition exposes one. The notice retains logical block-axis inset and border declarations through canonical dashed StyleX properties. Its minimum height remains physical; the horizontal LTR and RTL compiler canary does not establish complete vertical-writing-mode parity.

Applications that compile local StyleX declarations register both `@hraness/ui/stylex-manifest.json` and `@hraness/design-kit/stylex-manifest.json` with the build tools from `@hraness/ui/stylex-build`. Import `@hraness/design-kit/compiler-foundation.css` for full design-kit compositions, or `@hraness/design-kit/compiler-palettes.css` for palettes, the appearance menu, and portable controls with application-owned typography. The minimal entry supplies the UI foundation and palette bridge without webfonts or marketing styles; the full entry includes it transitively. Neither route imports precompiled StyleX recipes. The finalizer unions the raw UI, design-kit, and application rules and serializes them once into `components.hraness-stylex`, after every package's legacy layers. Generation plans and completion records use schema 2 and bind the exact union policy; package manifests remain schema 1 and bind the minimal foundation. Start a fresh generation when upgrading the union policy. Every HTML or SSR entry links that finalized stylesheet after its foundation stylesheet. Do not combine this route with either package's `styles.css` or `stylex.css`.

Package authors use `createStylexTransformCollector` and `serializeStylexPackageRules` from `@hraness/ui/stylex-build` to publish externalized JavaScript, independently usable package CSS under a distinct `components.*` namespace, and a manifest that binds the raw rules, runtime files, standalone CSS, and compiler foundation. Final applications consume those manifests rather than concatenating independently serialized package stylesheets.

Import narrower layers when the application does not need the full presentation system:

```css
@import "@hraness/design-kit/tokens.css";
@import "@hraness/design-kit/charts.css";
@import "@hraness/design-kit/effects.css";
@import "@hraness/design-kit/syntax-highlighting.css";
```

`plain-site.css` provides a compact site shell. `plain-publication.css` adds sourced article, citation, table, callout, and related-reading structure.

## Share the Paper theme

`paper-theme.css` is a separate, zero-import CSS contract for warm neutral light
and dark surfaces, Nebula Sans font roles, and compact marketing typography.
Opt in with `data-hraness-theme="paper"` after the existing stylesheets. It can
be adopted from an immutable package release or as a verified CSS snapshot
without upgrading UI, React, or a StyleX compiler. Existing layouts and
appearance choices remain product-owned. See [Paper theme](PAPER_THEME.md) for
installation, compatibility, snapshot verification, and preference migration.

## Add Lantern material

Lantern gives opaque reading surfaces a luminous perimeter and selected controls a warm, matched fill and text color. Glass is reserved for chrome with scrolling content behind it. The selected palette, existing focus indicators and product layout remain authoritative.

Set `data-hraness-material="lantern"` on a themed host and apply the documented surface hooks. Complete stylesheets include the material; selective and older consumers can import a verified CSS snapshot. React primitives use the compiled `lanternControlStyles` through their existing `controlXstyle` prop.

See the [material contract and examples](LANTERN_MATERIAL.md) for palette islands, portal hosts, accessibility fallbacks and the immutable installer. The gallery demonstrates light and dark workspaces with working search, selection and disclosures.

## Explain a technical product

`product-marketing.css` is an opt-in narrative grammar for technical product
sites. It gives every Hraness product one typeface, one measured type scale,
sentence-case labels, hairline chrome, soft radii, and one accent color, so the
portfolio reads as one studio's work. The roles are a sticky site header, a main landmark that clears that header,
equal-height product card rows, an outcome-led hero with an optional product
frame, a row of pillars, an install panel, an ordered flow, fact and stat strips,
narrative sections, numbered primitives, interface and trust cards, attributed
quotes, pricing, native questions, a maker section, a closing call to action,
and an in-flow site footer. The classes own
responsive structure and semantics-facing presentation. Products bind the
`--hraness-marketing-*` roles to their own content and set one accent:

```css
@import "@hraness/design-kit/styles.css";

.hraness-marketing-page {
  --hraness-site-accent: oklch(0.55 0.21 262);
  --hraness-site-accent-ink: #ffffff;
}
```

Static sites may render the documented classes directly. React sites can use
the server-safe compositions from either React entry:

```tsx
import {
  MarketingCallToAction,
  MarketingMain,
  MarketingPage,
  MarketingPillars,
  MarketingProofFrame,
  MarketingSiteHeader,
  ProductHero,
} from "@hraness/design-kit/react/server";

<MarketingPage>
  <MarketingSiteHeader
    action={{ href: "#install", label: "Install Relay" }}
    brand="Relay"
    links={[{ href: "#how", label: "How it works" }, { href: "#pricing", label: "Pricing" }]}
  />
  <MarketingMain>
  <ProductHero
    actions={[
      { href: "#install", label: "Install Relay" },
      { href: "#how", label: "See how it works" },
    ]}
    boundary="Free for local use on macOS and Linux · version 1.2.3"
    example="Ask your agent to run the nightly job and show you the log."
    eyebrow="A reference developer tool"
    frame={(
      <MarketingProofFrame caption="The log written by the example job." credit="Captured 5 September 2026" title="relay run job-01">
        <img alt="Relay printing a run log in a terminal" src="/relay-log.png" />
      </MarketingProofFrame>
    )}
    heading="Run a job from your terminal, your code, or your agent"
    headingId="relay-title"
    name="Relay"
    summary="Relay runs the same job wherever you start it and writes a log you can read afterward: inputs, outputs, and how long it took."
  />
  <MarketingPillars
    ariaLabel="Relay in three points"
    columns={3}
    pillars={[
      { label: "No hosted service", summary: "Jobs run on your machine and never wait on a server." },
      { label: "A log for every run", summary: "Open it to see what went in, what came out, and when." },
      { label: "Your files stay put", summary: "Source files and credentials never leave your machine." },
    ]}
  />
  <MarketingCallToAction
    actions={[{ href: "#install", label: "Install Relay" }]}
    footnote="Free for local use on macOS and Linux."
    heading="Start with one job"
    headingId="cta-title"
  />
  </MarketingMain>
</MarketingPage>
```

A sticky `MarketingSiteHeader` publishes `--hraness-sticky-offset` on the
page and on `html`, so siblings inherit it. Wrap page content in
`MarketingMain` (`id="main-content"`) so skip links and hash targets use that
offset as scroll-margin. Do not add extra padding when the header stays in
flow; pass `clearance="pad"` only for a `data-position="fixed"` header. The
next sticky strip should use `.hraness-sticky-below-chrome` or
`data-hraness-sticky` instead of `top: 0`. When the header wraps, render
`StickyOffsetSync` once from `@hraness/design-kit/react` or call
`syncStickyOffset` from `@hraness/design-kit/browser` to replace the token
fallback with the measured border box. `MarketingCardRow` stretches every
direct child to the tallest item in the row and reserves a two-line meta
block; titles wrap and are not clamped. `MarketingCardArt` /
`.hraness-marketing-card__art` clips each card's logo or media well so
background paint cannot bleed through the gutter.

`tone="accent"` on the hero or the call to action paints that role edge to
edge in the product accent. `layout="split"` or `"split-reverse"` on a
section places its heading group beside its body. `MarketingQuoteGrid` and
`MarketingPillars` render nothing for an empty list, so a site adds quotes
only when it has real, attributed ones.

For a policy with `style-src-attr 'none'`, set `columns` to `1`, `2`, `3`, or
`4` on `MarketingFacts`, `MarketingPillars`, and `MarketingStatStrip`. Set
`factsColumns` on `ProductHero` for its nested facts. These finite choices use
compiled recipes and emit no inline column style. Below 48rem, facts and stats
still use two columns and pillars use one. Omitting the prop preserves the
existing item-count custom property, including its inline style and arbitrary
collection length. Use the compiled standalone stylesheet or the finalized
compiler-adopter stylesheet with the finite choices.

`ProductHero.notice` renders product-owned content after the boundary text in
the hero's copy group. `MarketingInstallPanel.note` renders after its heading,
before the separate command group. Both accept React nodes without adding a
wrapper. Omit them to preserve the existing markup. `MarketingMaker.linkClassName`
adds a caller class to its listed links only; it does not style biography links.

Use `MarketingSectionLabel` for a native paragraph with the same label recipe
as `MarketingSection`. Its default preserves the existing label presentation;
`size="body"` selects the compiled 1rem variant. Override
`--hraness-marketing-example-measure` in a product stylesheet to change only
the hero example's maximum inline size. When absent, it uses
`--hraness-marketing-copy-measure`; the summary's measure is unchanged.

Homepage copy on this grammar follows [`STYLE.md`](STYLE.md) and
[`MARKETING_COPY.md`](MARKETING_COPY.md), which gives each slot its job and its
length limit. The headline states what the reader can do, in sentence case with
no period. The summary says what the product is, who it is for, and the one
thing it does differently. The `example` is a concrete request a reader could
make. State the release status once, plainly, in `boundary`, and keep each other
limit beside the feature it limits. A full-sentence section heading in the
editorial preset may end with a period; other headings do not. Words such as
"bounded", "exact", "authority", "custody", "immutable", and "inspectable" stay
out of the hero and leads. Every number has a date or a source, and no quote
appears without an attributed author who agreed to it.

Import only the grammar when a site owns its reset and tokens:

```css
@import "@hraness/design-kit/product-marketing.css";
```

The components render complete server HTML and add no clipboard, animation, or
analytics runtime. A
product may enhance a command with its own accessible copy control while
keeping selectable text as the fallback.

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

`TopBar`, `BottomBar`, `PageCanvas`, and `DockedFooter` keep their native header, footer, main, or div semantics while their product-neutral layout recipes are delivered through extracted StyleX classes. Their stable classes and data attributes remain available for semantic inspection, and native `className` and `style` props remain caller-controlled. `DockedFooter` continues to forward its root footer ref. Its `surface` value remains a stable data hook; only `TopBar` gives `glass` a visual treatment. Its 90% tint and 18px blur use feature detection; unsupported filtering, reduced transparency, and forced colors use an opaque surface.

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
  <SyntaxCode code={'const ready = true;'} />
</pre>
```

`SyntaxCode` and `highlightCode(code)` choose a language for recognizable code when the language is omitted. The deterministic rules recognize JSON objects and arrays, common package and Git commands, and distinctive TypeScript, Markdown, HTML, and CSS syntax. Prose and uncertain input stay plain text. Pass a language or Markdown fence hint to keep an explicit choice; unsupported hints and `language="text"` remain plain text. Blocks longer than 131,072 characters also remain escaped plain text.

The framework-neutral highlighter is available from `@hraness/design-kit/syntax-highlighting`. For sites that disallow inline styles, call `highlightCode(code, "typescript", { styles: "classes" })` or pass `styles="classes"` to `SyntaxCode`. Import `syntax-highlighting.css` when using the highlighter alone; the complete stylesheet, compiler foundation, and narrow `product-marketing.css` entry include it. The default style mode remains unchanged; both modes share the same theme colors and preserve source line breaks. Markdown renderers should pass each literal code block and its fence hint to this shared highlighter. Stylesheets do not tokenize raw `<pre><code>` markup.
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

## Semantic palettes

Opt into Catppuccin, Gruvbox, Rosé Pine, or Tokyo Night in light or dark mode. `DesignPaletteProvider` and the existing `ThemeMenuButton` provide one appearance menu, with Catppuccin dark as the default. The shared controller supports external bootstrap scripts and strict content security policies. See [palette installation, semantic roles, and sources](./PALETTES.md).

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

## Migrating Jelly surfaces

The Jelly surface API, stylesheet export, and browser runtime have been removed.
Replace `JellySurface` wrappers with the appropriate native or `@hraness/ui`
primitive. Apply the [shared material roles](./LANTERN_MATERIAL.md) to that
semantic element when it needs a surface treatment. Keep labels, refs, disabled
and pending behavior, keyboard interaction, and portal ownership on the
primitive. Remove imports of `@hraness/design-kit/jelly.css` and any direct
Jelly runtime integration. `DesignThemeProvider` continues to manage appearance
and portal themes without loading a decorative control runtime.

The EvilCharts license and adaptation provenance remain under `vendor/evilcharts`.

## Gallery

`DesignSystemGallery` is an executable, product-neutral reference for the package boundary. Mount it in a development route and import `design-gallery.css` through the complete stylesheet. The gallery exercises Chat message slots, controlled composer submission, compact responsive layout, extracted class delivery, and caller-last classes alongside the other public compositions.

## Development

Use Bun 1.3.14:

```sh
bun install --frozen-lockfile
bun run check
```

The stable dependency pair for this release is `@hraness/ui` `v0.5.16` with `@hraness/design-kit` `v0.15.0`. Version 0.15.0 lets `MarketingRelated` present labeled tiers of sibling products: a `groups` collection renders each tier under its own heading with an accessible card-row label, while the flat `items` shape stays available for a single group. Version 0.14.0 adds `MarketingRelated`, a collection section that presents sibling products as linked cards, each framed by its relationship to the featured product. Version 0.13.0 publishes `--hraness-sticky-offset` from sticky marketing chrome, gives `MarketingMain` and the next sticky sibling a clearance contract, stretches marketing card rows to the tallest item with a reserved two-line meta block, and clips per-card art wells so a logo surface cannot paint through the gutter. Version 0.12.0 replaces pointer-driven gradient rotation with a steady material and a moving light: the spectrum and its 115deg direction stay fixed while `--hraness-foil-x`/`--hraness-foil-y` highlights travel across each lockup, and marketing footers can opt into the same icon-plus-wordmark foil as the site header with `brandMark`. Version 0.11.1 preserves visible metallic marks when another package repeats a generic hidden atom in a later CSS layer. React consumers load `components.css` or `styles.css`; the raw marketing entry supports authored HTML hooks. Version 0.11 adds server-rendered `FoilMark` artwork and metallic text with subtle rainbow reflections, including a shared header mark seam and original-artwork fallbacks. Version 0.10.1 adds conservative server syntax defaults, includes their styles in the narrow marketing entry, and pins the icon dependency to preserve fresh Linux installs. Version 0.10 adds the shared foil contract: `.hraness-foil` surfaces and `.hraness-foil-text` wordmarks render a pointer-following metallic spectrum from the `--hraness-foil-*` custom properties, applied by default to marketing header brands and primary actions. The `attachFoil` browser export drives the bounded `x`/`y`/`angle` inputs with damped easing, reduced-motion and forced-color fallbacks, and no style injection; the same spectrum feeds `@hraness/site-footer` signup controls. Dark appearances use a deeper palette so the sheen stays visible. Version 0.8 removes Jelly's optional API, stylesheet, vendor runtime and theme-provider side effect. Migrate direct Jelly surfaces to native shared primitives before upgrading. Lantern now uses softer directional depth and shaded faces; the marketing preset adds individually shaded static cells, theme-aware terminal colors and window chrome. Code blocks retain source lines and follow the active palette. Paper preferences, semantic palettes, and compiler identity stay stable. Compiler adopters must regenerate their finalized stylesheet with the new package manifest.

The complete check runs linting, typechecking, production builds, an installed-package smoke test, deterministic examples, property tests, server rendering, vendor-integrity checks, and headless Chromium regressions. The browser gate verifies responsive shell ownership, extracted AnimatedRailStage, Fader, layout-surface, and playback-transport delivery, reduced-motion stage fallback, Fader keyboard and focus behavior, forced-color behavior, keyboard-operable appearance, browser-chrome synchronization across opposing device and saved preferences, global-error static metadata and runtime lifecycle, accessible title and copy, deterministic procedural layers, viewport containment, and the absence of the excluded canvas effect. Set `CHROMIUM_EXECUTABLE_PATH` when Chromium or Chrome is installed outside the standard macOS and Linux paths.

Global CSS remains the boundary for tokens, resets, document grammar, cross-component layout, accessibility media rules, and audited vendor fallbacks. A new overlapping compiled style family from another package requires a layer-order compatibility gate against that package's released artifact before adoption.

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request. Report suspected vulnerabilities as described in [SECURITY.md](./SECURITY.md).

## License

MIT. Vendored Nebula Sans, Geist Mono, and other upstream artifacts retain their own included license and provenance files.

### Shared editorial marketing preset

Import `@hraness/design-kit/product-marketing-preset.css` after your existing marketing styles, then opt in with `<MarketingPage preset="editorial">`. Wrap the opening in `<MarketingField>` for the checked grain, seams, and gradient. `preset="minimal"` retains a compact sans hierarchy and omits the field texture. Product accents and copy remain product-owned.

[Writing for the marketing components](MARKETING_COPY.md) says what each slot is for and which copy patterns to avoid.

[Marketing preset contract](MARKETING_PRESET.md) documents the native HTML hooks, shared tokens, paint-only header hook, and immutable CSS/font/asset snapshots for consumers that retain an older component release. The preset leaves application UI outside its explicit scope untouched.
