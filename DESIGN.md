# Shared visual direction

The incumbent Paper palettes, Nebula Sans body type, editorial Instrument Serif headings and crisp product identities remain the foundation. Lantern is an independent material option, not a replacement palette.

Borrow the architectural logic of Maison Hermès: a consistent module, diffused light, a cool exterior and warm occupied spaces. Use a 4rem square module only on selected expressive backgrounds. Soft perimeter light and restrained depth suggest form; readable content sits on opaque planes. Never filter text, logos or meaningful diagrams.

Everyday application screens stay quiet. Selection receives a warm paired fill and foreground; success, warning, danger and focus retain their semantic meaning. Reserve glazing for chrome with real scrolling content behind it and for key transitions. Honor light/dark preference, nested themes, reduced transparency, reduced motion and forced colors.

Information architecture precedes texture: bounded reading widths, meaningful groups, rows for collections, secondary details in native disclosures, critical availability visible before action, and one primary next step per section. Avoid equal-height card walls, dense technical labels in marketing and competing footer calls to action.

See [Lantern material](LANTERN_MATERIAL.md) for the implementation contract and architectural sources, and [Marketing preset](MARKETING_PRESET.md) for the existing editorial/minimal roles.

Brand foil uses contrast-bearing neutral metal bands with a restrained rainbow reflection. Apply it to the exact existing logo silhouette and wordmark, retain the original artwork fallback, and keep it legible at rest without animation. Forced colors use the original mark and system text.

The canonical site header carries one brand lockup: a home anchor with `data-foil`, the foil-text product name, and the product mark in the foil-mark structure: a flat `__image` under a `__paint` layer masked by the mark's own alpha. React sites emit it through `MarketingSiteHeader` `brandMark` or `FoilMark` directly; hand-authored sites emit the same three-node markup and keep `--hraness-foil-size`/`--hraness-foil-mask` in the stylesheet, never inline, so strict style CSPs hold. `attachFoil` from `@hraness/design-kit/browser` eases the pointer inputs while `--hraness-foil-glow` stays CSS-owned. A site keeps the lockup uniform with a gate that asserts the wrapper, paint layer, and mask on every page's home anchor.
