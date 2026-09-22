# Marketing preset contract 1

The separately imported `@hraness/design-kit/product-marketing-preset.css` export adds the approved editorial marketing treatment to the existing product-marketing grammar. It shares Paper's `light-dark()` browser baseline: Chrome 123+, Firefox 120+, and Safari 17.5+. It does not replace Paper contract 1, reset the document, or change default component presentation. Import it after `styles.css` for standalone components, or beside `compiler-foundation.css` in a registered compiler graph. The published manifest binds the stylesheet; CSS URL assets are part of the final consumer's captured asset closure.

```tsx
import "@hraness/design-kit/product-marketing-preset.css";
import { MarketingPage, MarketingField, ProductHero, MarketingSection } from "@hraness/design-kit/react/server";

<MarketingPage preset="editorial">
  <MarketingField>
    <ProductHero name="Relay" heading="One clear product promise." headingId="title"
      summary="A short account of what the product makes possible." />
  </MarketingField>
  <MarketingSection heading="A concrete next step." headingId="next">
    <p>Product-owned explanation and evidence.</p>
  </MarketingSection>
</MarketingPage>
```

Raw HTML and older components use `data-hraness-marketing-preset="editorial"` on their marketing ancestor and `.hraness-marketing-field` on the opening container. Existing semantic `hraness-marketing-*` hooks receive the same typography, spacing, and action tokens. A field may also be the hero itself. The field is a static background in document flow, with no content overlay or filter. Product imagery and logos stay clean and full color; `.hraness-marketing-brand-mark` is an optional image hook. Existing product accent variables remain authoritative.

`minimal` uses the existing `--font-text` sans face, a compact heading scale and 45px header token, with no textured field. Both presets inherit the existing body face (normally Nebula Sans); the snapshot adds only Instrument Serif 400, not a second body-font system. Nested scopes reset their own display and field tokens. Prefer independent header and main scopes when their presets differ.

For a custom or older component header, add `class="hraness-marketing-header-surface"` to the header itself. This class explicitly opts in to paint without requiring a preset ancestor. Add `data-hraness-marketing-preset="minimal"` on the same element only when you also need its compact role tokens. This paint-only hook adds supported backdrop blur and opaque accessibility fallbacks without setting position, dimensions, or navigation layout. No wrapper is required around a sticky header. Unsupported filtering, reduced transparency, and forced colors retain opaque surfaces. Coarse pointers retain 48px action targets.

## Sticky clearance and equal-height card rows

A sticky `.hraness-marketing-header` or `.hraness-marketing-header-surface` publishes `--hraness-sticky-offset` on `html` and on `.hraness-marketing-page`. The token height is the fallback; `StickyOffsetSync` from `@hraness/design-kit/react` or `syncStickyOffset` from `@hraness/design-kit/browser` replaces it with the measured header border box when the chrome wraps. Attach the site header as a direct child of the page, then put the main landmark immediately after it:

```tsx
import { MarketingMain, MarketingPage, MarketingSiteHeader, StickyOffsetSync } from "@hraness/design-kit/react";

<MarketingPage>
  <MarketingSiteHeader brand="Relay" links={[{ href: "#work", label: "Work" }]} />
  <StickyOffsetSync />
  <MarketingMain>
    <div className="hraness-sticky-below-chrome" data-hraness-sticky>Index</div>
    {children}
  </MarketingMain>
</MarketingPage>
```

Skip links should target `#main-content`. Hash targets and the main landmark use the offset as `scroll-margin`. Do not add a second padding gap while the header stays in flow. Use `clearance="pad"` or `data-hraness-clearance="pad"` only when the header is `data-position="fixed"`. The next sticky sibling must use `.hraness-sticky-below-chrome` or `data-hraness-sticky` (`inset-block-start: var(--hraness-sticky-offset)`), not `top: 0`. This is the same publish-on-ancestor pattern as `@hraness/ui` next-adopter sticky-offset sync, under the kit-owned `--hraness-sticky-offset` name.

`.hraness-marketing-card-row` / `MarketingCardRow` stretches every direct child to the tallest item in the row. Meta sits in a reserved two-line block (`--hraness-marketing-card-meta-lines`, default 2). Titles wrap and are not clamped. Product-owned flex rows that `align-items: start` should switch to this hook so a longer blurb cannot stagger the row.

## Tokens for custom compositions

| Role | Public tokens |
| --- | --- |
| Display | `--hraness-marketing-display-font`, `--hraness-marketing-display-weight` |
| Hero heading | `--hraness-marketing-h1-size`, `--hraness-marketing-h1-leading`, `--hraness-marketing-h1-tracking` |
| Section heading | `--hraness-marketing-h2-size`, `--hraness-marketing-h2-leading`, `--hraness-marketing-h2-tracking` |
| Layout | `--hraness-marketing-content-measure`, `--hraness-marketing-header-measure`, `--hraness-marketing-header-height`, `--hraness-marketing-gutter`, `--hraness-marketing-hero-space`, `--hraness-marketing-story-space` |
| Field | `--hraness-marketing-field-ink`, `--hraness-marketing-field-muted`, `--hraness-marketing-link`, `--hraness-marketing-field-images`, `--hraness-marketing-field-size` |
| Terminal proof | `--hraness-marketing-terminal-background`, `--hraness-marketing-terminal-ink`, `--hraness-marketing-terminal-muted`, `--hraness-marketing-terminal-command`, `--hraness-marketing-terminal-chrome`, `--hraness-marketing-terminal-shadow` |

Map only owned marketing headings to these tokens. Do not restyle every descendant h2 inside product previews or authentication forms. Remove obsolete unlayered font, size, and role-token overrides when adopting the preset; unlayered author rules otherwise outrank the legacy component layer. Custom compiled recipes must read these variables rather than pin old values. The preset uses the existing marketing grammar for layout; importing only this preset does not supply every base component recipe.

`MarketingSection.label` and collection labels are optional in current components. For older versions that require strings, pass an empty string only when the slot is redundant. The preset removes spacing for empty label/name/eyebrow elements; nonempty facts remain visible. Preserve factual positioning in an appropriate product-owned body or example slot.

## Immutable snapshots for existing sites

Keep the current component/UI versions when upgrading them would create unrelated migration work. Use the installer from a reviewed design-kit checkout at an exact full commit containing the preset:

```sh
bun scripts/product-marketing-snapshot.ts --write /path/to/site/vendor/hraness-marketing --source-commit FULL_40_CHARACTER_COMMIT
node /path/to/site/vendor/hraness-marketing/check.mjs
```

Import `vendor/hraness-marketing/product-marketing-preset.css`. Keep the entire directory: CSS URLs resolve to `fonts/instrument-serif/instrument-serif-latin-400.woff2`, `marketing-assets/grain.svg`, and `marketing-assets/cells.svg`. The finite bundle also includes their licenses/provenance, a dependency-free Node/Bun `check.mjs` validator, and `provenance.json`, which binds every file to SHA-256 and a source commit. Check that manifest in the consumer gate. Installation reads Git object bytes, never a dirty working copy, and refuses changed, unowned, or symlinked destinations. An upgrade replaces only a previously verified snapshot. Run from a released immutable commit for production delivery; local candidate commits are for pre-release verification.

The source texture generator is `scripts/marketing-textures.ts`; its check verifies byte-identical deterministic SVGs. Instrument Serif retains its OFL license and upstream provenance. The existing Paper CSS snapshot remains separate and unchanged. Neither snapshot executes code at runtime or upgrades UI/compiler dependencies.

For a build graph, import `checkMarketingSnapshot` from the vendored `check.mjs` and await it with the snapshot directory (default: the checker's directory). It returns the validated source identity and finite `files` record; each entry contains its source path and SHA-256. The included `check.d.mts` provides TypeScript declarations. Bind those admitted CSS/font/SVG bytes into the final graph; validation does not copy or modify files.
