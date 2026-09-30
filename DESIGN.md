# Shared visual direction

The incumbent Paper palettes, Nebula Sans body and heading type, and crisp product identities remain the foundation. Lantern is an independent material option for application screens, not a replacement palette.

## Quiet marketing direction

Public product pages follow the Quiet direction, taken from the structure of algal.computer:

- A thin sticky header: the foil product lockup, three to six plain links, one primary action, and the appearance menu as the right-most control. On phones the links move to their own row, which scrolls sideways without a visible scrollbar; the brand, action, and appearance menu stay on the first row. Every control keeps a 44px target and nothing overlaps or clips.
- A sans hero: a small plain eyebrow, one large heading in Nebula Sans at weight 550 with tight tracking, a summary of two or three sentences within about 42rem, one primary button and at most one text link, and optionally one line of plain facts such as license, platforms, or price.
- Explain the product's central benefit immediately after the hero, with a terminal or code block, a static screenshot with `alt` text, or compact real output. A mockup from `@hraness/design-kit/mockups`, or a `ModeShowcase` with a few of its states, can demonstrate the result. It uses invented names on example domains and an accurate accessible description. Add visible captions only when they contribute useful context.
- Ruled sections: each has an eyebrow, a heading, one short paragraph, and one concrete element such as steps, code, a table, or a small figure. Prefer rows and lists to walls of equal cards. Keep a bounded reading width.
- A flat palette background with content on opaque surfaces and hairline edges. Mono only for code, commands, and small labels.

Retired, and no longer produced by any shared default: hero backdrops and pointer-driven light (`ProductHero` `backdrop`, `HeroBackdrop`, `attachHeroLight`, `data-hraness-hero-item`), background textures and patterns (grain, cells, weave, contour, mesh, grid tiling, gradients behind text), serif display headings, glass or blur on cards and content, heavy shadows and glowing edges, and large interactive app mockups on marketing pages. The retired component names stay exported and do nothing, so products can remove them on their own schedule. See [Hero fields](HERO_FIELDS.md) and [Marketing preset](MARKETING_PRESET.md).

Blur remains allowed only on a sticky header with real content scrolling behind it, and that header turns opaque without backdrop support, with reduced transparency, and in forced colors.

## Launch posts

An "Introducing" post reads as a column of beats: a short headline, one claim, and one visual each, anchored as `#beat-<id>`. Visuals are mockups, short clips, or diagrams in an `ArticleFigure`, with accurate accessible descriptions and optional useful captions. Depth, comparison tables, and charts go in companion posts, drawn with `ArticleTable`, `ArticleBarChart`, and `ComparisonTable`. The social kit sits in a closed disclosure after the beats. The gallery renders every mockup frame in light and dark from `gallery/mockups-fixture.tsx`.

## Application surfaces

Every filled control pairs a semantic background and foreground. Text on selected, hover and active states must meet 4.5:1 contrast in every supported palette and mode; large text and meaningful non-text marks meet their applicable 3:1 requirement. Never combine an accent fill with hardcoded white text. Customizing a fill requires reviewing its paired foreground, including nested themes and forced colors.

Borrow the architectural logic of Maison Hermès for application material: a consistent module, diffused light, a cool exterior and warm occupied spaces. Readable content sits on opaque planes. Never filter text, logos or meaningful diagrams.

Everyday application screens stay quiet. Selection receives a warm paired fill and foreground; success, warning, danger and focus retain their semantic meaning. Reserve glazing for chrome with real scrolling content behind it and for key transitions. Honor light/dark preference, nested themes, reduced transparency, reduced motion and forced colors.

Information architecture precedes decoration: bounded reading widths, meaningful groups, rows for collections, secondary details in native disclosures, critical availability visible before action, and one primary next step per section. Avoid equal-height card walls, dense technical labels in marketing and competing footer calls to action.

See [Lantern material](LANTERN_MATERIAL.md) for the application material contract.

Brand foil uses contrast-bearing neutral metal bands with a restrained rainbow reflection. Apply it to the exact existing logo silhouette and wordmark, retain the original artwork fallback, and keep it legible at rest without animation. Forced colors use the original mark and system text. Bordered emphasis surfaces — `.hraness-foil` and primary actions — keep a flat fill under one theme-aware monochrome edge (`--hraness-foil-edge`: black on light, white on dark) instead of the spectrum.

The canonical site header carries one brand lockup: a home anchor with `data-foil`, the foil-text product name, and the product mark in the foil-mark structure: a flat `__image` under a `__paint` layer masked by the mark's own alpha. React sites emit it through `MarketingSiteHeader` `brandMark` or `FoilMark` directly; hand-authored sites emit the same three-node markup and keep `--hraness-foil-size`/`--hraness-foil-mask` in the stylesheet, never inline, so strict style CSPs hold. `attachFoil` from `@hraness/design-kit/browser` eases the pointer inputs while `--hraness-foil-glow` stays CSS-owned. A site keeps the lockup uniform with a gate that asserts the wrapper, paint layer, and mask on every page's home anchor.
