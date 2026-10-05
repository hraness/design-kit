# Product landscape

A product landscape is one detailed drawing of the product's world, drawn
behind its marketing, documentation, and blog pages. It is the one sanctioned
exception to the Quiet direction's flat page background. The drawing stays in
the margins, takes its colour from the page's own text and background, and
tiles down the page, so it never competes with the copy and never runs out on
a long page.

## Supply the drawing

Give each product its own drawing. Prepare it as a grayscale luminance mask:
the drawing in light lines on black, with a quiet centre column where the copy
sits and both ends fading to black so the tiles meet without a seam. Export
WebP at three widths and name each file by its SHA-256 digest:

| Image | Width | Use |
| --- | --- | --- |
| Wide | 1920px | Desktop, 1x |
| Wide 2x | 2880px | Desktop, high-density screens |
| Narrow | 1170px | Phones up to 48rem |

Do not put text, logos, or colour in the drawing. The kit tints it for every
palette and appearance.

## Turn it on

Import the stylesheet once. `styles.css` and `compiler-foundation.css` already
include it.

```css
@import "@hraness/design-kit/product-landscape.css";

:root {
  --hraness-landscape-image: image-set(
    url("/landscape/landscape-<wide-digest>.webp") 1x,
    url("/landscape/landscape-<wide-2x-digest>.webp") 2x
  );
  --hraness-landscape-image-narrow: url("/landscape/landscape-<narrow-digest>.webp");
}
```

Use root-relative or absolute URLs: custom properties resolve relative URLs
differently across browsers.

Then mark every public page that should show it. `data-hraness-landscape="page"`
on `<body>` or on any element inside the page draws the drawing behind the whole
document, so a marketing page, a documentation shell, and a blog layout can
each opt in from their own markup:

```tsx
<MarketingPage landscape="page">…</MarketingPage>
```

`MarketingPage` emits the attribute from its `landscape` prop; any other
element takes the attribute directly.

Put `data-hraness-landscape="off"` anywhere on an application route that
shares the layout. Use `data-hraness-landscape="contained"` to draw it behind one
element instead, such as a section below a full-screen application.

| Property | Default | Meaning |
| --- | --- | --- |
| `--hraness-landscape-image` | none (draws nothing) | Wide mask, usually an `image-set()` |
| `--hraness-landscape-image-narrow` | the wide image | Mask at 48rem and below |
| `--hraness-landscape-opacity` | `0.5` | Layer opacity on wide screens |
| `--hraness-landscape-opacity-narrow` | `0.36` | Layer opacity on phones, where copy spans the drawing |
| `--hraness-landscape-strength` | `30%` | Share of the text colour mixed into the background for the ink |
| `--hraness-landscape-ink` | the mix above | Replace the ink entirely |
| `--hraness-landscape-radius` | `0.75rem` | Radius for solid and glass surfaces |

Forced colours and print never draw the layer.

## Keep panels over the drawing soft

A hard-edged slab over a detailed drawing reads as a mistake. Under a
landscape, the kit adjusts its own surfaces:

- Page wrappers that repaint the page colour (`.hraness-marketing-page`, a
  nested `.plain-site`, `.plain-footer`) become transparent, so the identical
  body colour and the drawing show through.
- Reading surfaces stay opaque and get rounded edges: article code blocks and
  tables.
- Small cards and callouts (marketing cards, quotes, plans, trust items,
  interfaces, primitives, article callouts, and social kit items) become
  frosted panels using the sticky header's material: 82% surface tint with
  `blur(14px) saturate(1.4)`. Without backdrop support, under reduced
  transparency, and in forced colours they keep their opaque surface.

Product-owned elements opt in with one attribute:

| Attribute | Use for |
| --- | --- |
| `data-hraness-landscape-surface="clear"` | A full-width wrapper or band painted in the page colour |
| `data-hraness-landscape-surface="solid"` | Code, tables, documentation sidebars, forms: opaque, rounded |
| `data-hraness-landscape-surface="glass"` | Small cards, callouts, and badges: frosted, rounded |

Set `--hraness-landscape-solid` or `--hraness-landscape-glass` on an element to
choose its base colour. Leave a deliberately coloured full-width band as it
is; it simply covers the drawing.
