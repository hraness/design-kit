# Marketing preset contract 1 (Quiet)

The separately imported `@hraness/design-kit/product-marketing-preset.css` export adds the Quiet marketing treatment to the existing product-marketing grammar: a sans display heading, a flat palette background, hairline rules, and a thin header. It shares Paper's `light-dark()` browser baseline: Chrome 123+, Firefox 120+, and Safari 17.5+. It does not replace Paper contract 1, reset the document, or change default component presentation. Import it after `styles.css` for standalone components, or beside `compiler-foundation.css` in a registered compiler graph. The published manifest binds the stylesheet. Bundle the font its CSS URL references along with it; the browser downloads it only for a product that opts in to it.

```tsx
import "@hraness/design-kit/product-marketing-preset.css";
import { MarketingPage, MarketingField, ProductHero, MarketingSection } from "@hraness/design-kit/react/server";

<MarketingPage preset="editorial">
  <MarketingField>
    <ProductHero name="Relay" heading="Run a job from your terminal, your code, or your agent" headingId="title"
      summary="Relay runs the same job wherever you start it and writes a log you can read afterward." />
  </MarketingField>
  <MarketingSection heading="Install Relay and run your first job." headingId="next">
    <p>Run <code>relay init</code>, then <code>relay run job-01</code> to write your first log.</p>
  </MarketingSection>
</MarketingPage>
```

Raw HTML and older components use `data-hraness-marketing-preset="editorial"` on their marketing ancestor and `.hraness-marketing-field` on the opening container. Existing semantic `hraness-marketing-*` hooks receive the same typography, spacing, and action tokens. A field may also be the hero itself. The field paints the flat palette background in document flow, with no texture, gradient, overlay, or filter, whatever the retired field tokens say. Product imagery and logos stay clean and full color; `.hraness-marketing-brand-mark` is an optional image hook. Existing product accent variables remain authoritative.

`editorial` sets the display role to the `--font-text` face (normally Nebula Sans) at weight 550 with tight tracking and a fluid heading that opens at 2.375rem on phones. `minimal` uses the same face at weight 500, a compact heading scale, and a 40px header token. Neither preset uses a serif. The snapshot still vendors Instrument Serif 400 for a product that opts in explicitly with `--hraness-marketing-display-font: "Instrument Serif", Georgia, serif`; the browser downloads it only then. Nested scopes reset their own display and field tokens. Prefer independent header and main scopes when their presets differ.

For a custom or older component header, add `class="hraness-marketing-header-surface"` to the header itself. This class explicitly opts in to paint without requiring a preset ancestor. Add `data-hraness-marketing-preset="minimal"` on the same element only when you also need its compact role tokens. This paint-only hook adds supported backdrop blur and opaque accessibility fallbacks without setting position, dimensions, or navigation layout. No wrapper is required around a sticky header. Unsupported filtering, reduced transparency, and forced colors retain opaque surfaces. Blur is allowed only here, on a sticky header with content scrolling behind it; cards and content never use blur or glass. Coarse pointers retain 48px action targets.

## Phone header

At 48rem and narrower, `MarketingSiteHeader` and the raw `.hraness-marketing-header__*` hooks use two rows. The first row holds the brand, the primary action, and the `trailing` appearance menu. The navigation takes the whole second row, reaches the screen edges, and scrolls sideways without a visible scrollbar. The brand, links, and header actions keep 44px targets (48px for coarse pointers in the preset). The navigation row never widens the header's intrinsic size, so the page does not overflow at 360px. Keep three to six short link labels; the header wraps to its measured height, so use `StickyOffsetSync` or `syncStickyOffset` when the header is sticky.

## Palette and patterns

The opening field and terminal proof inherit the active palette's foreground, muted, primary, background and surface colors. Existing product accent overrides remain available for actions.

Patterns are retired. `MarketingPage` and `MarketingField` still accept the `pattern` prop, and `data-hraness-pattern` still accepts the same finite values in React markup, raw HTML, and immutable CSS snapshots, so existing markup keeps working. Every value paints the flat palette background:

| Value | Since 0.23.0 |
| --- | --- |
| `cells`, `weave`, `contour`, `mesh` | Retired; renders exactly like `none` |
| `none` and omission | The flat palette background |

The grain and cell textures, the field gradient, the accent band's grid, and the terminal chrome gradient no longer paint. `--hraness-marketing-field-images` and `--hraness-marketing-field-size` remain defined for compatibility, but the field ignores them. The hero light inputs are no longer read.

Editorial marketing uses the Nebula Sans display role at weight 550 with a fluid 2.375rem to 4.5rem opening heading and a 52-character summary measure. Minimal marketing uses the same face at weight 500 and a smaller fluid hierarchy. Application and embedded preview headings retain their own roles. Marketing cards, proof frames, and header chrome use hairline edges (`0 0 0 1px` of `--hraness-marketing-line`) instead of lifted shadows. Forced colors restores explicit system-color edges.

## Sticky clearance and equal-height card rows

A sticky `.hraness-marketing-header` or `.hraness-marketing-header-surface` publishes `--hraness-sticky-offset` on `html` and on `.hraness-marketing-page`. The token height is the fallback; `StickyOffsetSync` from `@hraness/design-kit/react` or `syncStickyOffset` from `@hraness/design-kit/browser` replaces it with the measured header border box when the chrome wraps. Attach the site header as a direct child of the page, then put the main landmark immediately after it:

```tsx
import { MarketingMain, MarketingPage, MarketingSiteHeader, StickyOffsetSync } from "@hraness/design-kit/react";

<MarketingPage>
  <MarketingSiteHeader brand="Relay" brandMark="/marks/relay.svg" links={[{ href: "#work", label: "Work" }]} />
  <StickyOffsetSync />
  <MarketingMain>
    <div className="hraness-sticky-below-chrome" data-hraness-sticky>Index</div>
    {children}
  </MarketingMain>
</MarketingPage>
```

Skip links should target `#main-content`. Hash targets and the main landmark use the offset as `scroll-margin`. Do not add a second padding gap while the header stays in flow. Use `clearance="pad"` or `data-hraness-clearance="pad"` only when the header is `data-position="fixed"`. The next sticky sibling must use `.hraness-sticky-below-chrome` or `data-hraness-sticky` (`inset-block-start: var(--hraness-sticky-offset)`), not `top: 0`. This is the same publish-on-ancestor pattern as `@hraness/ui` next-adopter sticky-offset sync, under the kit-owned `--hraness-sticky-offset` name.

`.hraness-marketing-card-row` / `MarketingCardRow` stretches every direct child to the tallest item in the row. Meta sits in a reserved two-line block (`--hraness-marketing-card-meta-lines`, default 2). Titles wrap and are not clamped. Product-owned flex rows that `align-items: start` should switch to this hook so a longer blurb cannot stagger the row.

`.hraness-marketing-card__art` / `MarketingCardArt` is the per-card media well. It clips overflow, isolates paint, and keeps backgrounds attached and originated on the well so a logo or art surface cannot run through the gutter as one bar. Pass `art` on `MarketingCard` or `MarketingCardItem`, or put the class on a well inside a `.hraness-marketing-card`. Each card is a containing block (`position: relative; isolation: isolate`). Do not place the well as a row sibling or give it `background-attachment: fixed`.

## Tokens for custom compositions

| Role | Public tokens |
| --- | --- |
| Display | `--hraness-marketing-display-font`, `--hraness-marketing-display-weight` |
| Hero heading | `--hraness-marketing-h1-size`, `--hraness-marketing-h1-leading`, `--hraness-marketing-h1-tracking` |
| Section heading | `--hraness-marketing-h2-size`, `--hraness-marketing-h2-leading`, `--hraness-marketing-h2-tracking` |
| Tier and proof heading | `--hraness-marketing-h3-size`, `--hraness-marketing-h3-leading` |
| Layout | `--hraness-marketing-content-measure`, `--hraness-marketing-header-measure`, `--hraness-marketing-header-height`, `--hraness-marketing-gutter`, `--hraness-marketing-hero-space`, `--hraness-marketing-story-space` |
| Field | `--hraness-marketing-field-ink`, `--hraness-marketing-field-muted`, `--hraness-marketing-link`. `--hraness-marketing-field-images` and `--hraness-marketing-field-size` are retired and ignored. |
| Terminal proof | `--hraness-marketing-terminal-background`, `--hraness-marketing-terminal-ink`, `--hraness-marketing-terminal-muted`, `--hraness-marketing-terminal-command`, `--hraness-marketing-terminal-chrome`, `--hraness-marketing-terminal-shadow` |

Map only owned marketing headings to these tokens. Do not restyle every descendant h2 inside product previews or authentication forms. Remove obsolete unlayered font, size, and role-token overrides when adopting the preset; unlayered author rules otherwise outrank the legacy component layer. Custom compiled recipes must read these variables rather than pin old values. The preset uses the existing marketing grammar for layout; importing only this preset does not supply every base component recipe.

`MarketingSection.label` and collection labels are optional in current components. For older versions that require strings, pass an empty string only when the slot is redundant. The preset removes spacing for empty label/name/eyebrow elements; nonempty facts remain visible. Preserve factual positioning in an appropriate product-owned body or example slot.

## Mockups

`@hraness/design-kit/mockups` draws illustrations of chat, feeds, inboxes,
articles, terminals, browsers, desktop windows, and phones in plain React with
no StyleX. Its stylesheet, `@hraness/design-kit/mockups.css`, uses `hkm-`
classes, reads the marketing tokens with fallbacks, sizes itself with container
queries, and switches between light and dark on `[data-hkm-theme]`. Transitions
start only after the reader first changes a state, and stop under reduced
motion. `MarketingProofFrame` takes `chrome="window"`, `"browser"` with a `url`,
or `"terminal"` for real captures.

## Immutable snapshots for existing sites

Keep the current component/UI versions when upgrading them would create unrelated migration work. Use the installer from a reviewed design-kit checkout at an exact full commit containing the preset:

```sh
bun scripts/product-marketing-snapshot.ts --write /path/to/site/vendor/hraness-marketing --source-commit FULL_40_CHARACTER_COMMIT
node /path/to/site/vendor/hraness-marketing/check.mjs
```

Import `vendor/hraness-marketing/product-marketing-preset.css`. Keep the entire directory. The CSS references only `fonts/instrument-serif/instrument-serif-latin-400.woff2`, which loads only when a product opts in to that face. `marketing-assets/grain.svg` and `marketing-assets/cells.svg` stay in the inventory so an earlier snapshot upgrades in place, but the Quiet preset no longer references them. Reinstall from a 0.23.0 or later commit to get the Quiet preset; the same installer replaces a previously verified snapshot. The finite bundle also includes their licenses/provenance, a dependency-free Node/Bun `check.mjs` validator, and `provenance.json`, which binds every file to SHA-256 and a source commit. Check that manifest in the consumer gate. Installation reads Git object bytes, never a dirty working copy, and refuses changed, unowned, or symlinked destinations. An upgrade replaces only a previously verified snapshot. Run from a released immutable commit for production delivery; local candidate commits are for pre-release verification.

The retained texture files come from `scripts/marketing-textures.ts`; its check verifies byte-identical deterministic SVGs. Instrument Serif retains its OFL license and upstream provenance. The existing Paper CSS snapshot remains separate and unchanged. Neither snapshot executes code at runtime or upgrades UI/compiler dependencies.

For a build graph, import `checkMarketingSnapshot` from the vendored `check.mjs` and await it with the snapshot directory (default: the checker's directory). It returns the validated source identity and finite `files` record; each entry contains its source path and SHA-256. The included `check.d.mts` provides TypeScript declarations. Include those checked CSS, font, and SVG files in your build; validation does not copy or modify files.
