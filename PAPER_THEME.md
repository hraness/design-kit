# Paper theme

Paper shares warm neutral surfaces, Nebula Sans typography, a compact heading
scale, and blue actions across marketing sites and application defaults.
The CSS is generated from the same source as the `paper` semantic palette.
Products retain their content, layout, functionality, and saved appearance.

## Portable CSS contract 1

Load `@hraness/design-kit/paper-theme.css` after existing theme styles, then set
`data-hraness-theme="paper"` on the document root or a complete subtree:

```html
<html data-hraness-theme="paper" data-theme="light">
```

The export has no imports, font requests, reset, JavaScript, component recipes,
or dependency on React, UI, or a StyleX compiler. It uses standard CSS
`light-dark()`, supported by Chrome 123+, Firefox 120+, and Safari 17.5+.
Use the compiled palette route for applications whose existing CSS pipeline
does not preserve this function. A root without `data-theme`, or with
`data-theme="system"`, follows the operating system. Explicit `light` or
`dark` wins; a nested boundary without a mode inherits its ancestor's
`color-scheme`. Existing appearance controllers continue to own preferences.

The stylesheet declares semantic product roles (`--background`, `--foreground`,
`--surface`, `--surface-raised`, `--muted`, `--line`, `--control-border`,
`--primary`, status and inverse pairs), the corresponding `--ui-*` roles,
`--plain-*` publication aliases, and `--hraness-site-accent` with its foreground.
Control boundaries and secondary text are contrast adapted; subtle grid lines
remain decorative. Forced colors use system surface, text, and action colors. The `--plain-link`
alias uses `LinkText`; primary actions and focus retain `Highlight`.
Product CSS still decides where to paint these roles.

`--font-text`, `--font-heading`, and `--font-sans` use Nebula Sans with system
fallbacks. Code remains system monospace. Load the existing licensed font
assets separately, or keep an application's own font through later overrides.
The snapshot has no hidden font download.

Marketing roles inherit an 80rem measure, responsive gutter, restrained radii,
and shared rhythm. The optional size tokens are:

| Token | Default |
| --- | --- |
| `--hraness-paper-heading-size` | `clamp(1.75rem, 3vw, 2.375rem)` |
| `--hraness-paper-section-heading-size` | `clamp(1.25rem, 2.2vw, 1.75rem)` |
| `--hraness-paper-summary-size` | `1rem` |
| `--hraness-paper-heading-leading` | `1.15` |
| `--hraness-paper-heading-tracking` | `-.035em` |

Current `ProductHero` and narrative section recipes read the size tokens with
their existing sizes as fallbacks. `ProductHero.eyebrow` is optional, so compact
pages can omit the extra label. Older pinned component versions can bind their
documented heading classes to these tokens in a small product-owned adapter.
The theme does not rewrite grids, navigation, mobile breakpoints, or app state.
If a publication stylesheet redeclares variables on a descendant, explicitly
opt that boundary in as well. Keep local exceptions in a separate stylesheet
after the snapshot.

## Palette-aware applications

The existing palette catalog now includes `paper`; its global default remains
Catppuccin dark. A product may choose Paper and System as its own default:

```tsx
<DesignPaletteProvider
  defaultPreference={{ palette: "paper", mode: "system" }}
  legacyStorageKey="product-appearance"
>
  {children}
</DesignPaletteProvider>
```

Use the same options in `initDesignPalette` before the first paint and render
the initial Paper class from `getDesignPaletteTheme("paper", "light")` with
the corresponding initial attributes. A saved named palette takes precedence;
a valid legacy Light, Dark, or System preference migrates without changing its
mode. Do not use `forcedPreference` for an application's default.

When the Paper CSS boundary also has a non-Paper `data-palette`, the portable
stylesheet leaves its colors to the selected palette. Typography and rhythm
remain shared. Complete nested palette islands and portalled controls still
follow the existing [palette contract](PALETTES.md).

## Independent snapshots

Products may keep their current UI and compiler releases and vendor the exact
CSS file under `vendor/hraness-paper`. From a reviewed design-kit checkout:

```sh
bun scripts/paper-theme-snapshot.ts --write /path/to/product/vendor/hraness-paper --source-commit FULL_40_CHARACTER_COMMIT
bun scripts/paper-theme-snapshot.ts --check /path/to/product/vendor/hraness-paper
```

The installer reads `src/paper-theme.css` and `LICENSE` from that Git commit,
not from the working tree. It writes `paper-theme.css`, `LICENSE`, and
`provenance.json`, recording the repository, full source commit, public export,
contract version, source paths, and SHA-256 hashes of both artifacts. A missing
commit or unowned destination file fails. Existing snapshots must verify before
an intentional upgrade. The checker reads only the three local files and
detects edits to either artifact; it does not contact a service or update them.
Consumer checks can implement that small hash contract in their own runtime.

Contract 1 keeps existing semantic meanings and selectors stable. Additive
tokens do not require a coordinated upgrade. A breaking token or selector
change requires a new contract and an explicit migration. Pin the package or
source commit independently in every product; upgrade and validate each on its
own schedule. Do not use sibling paths, mutable branches, or runtime CSS CDNs.

## Evidence

`src/palettes.test.ts` verifies every Paper text, control, and status contrast
pair. `src/browser/design-palette.test.ts` covers saved choices and legacy
appearance migration. `scripts/paper-theme-browser.ts` renders the standalone
gallery at desktop and phone sizes, checks light/dark islands, system mode,
palette isolation, marketing token inheritance, real native controls, and
forced colors. `src/paper-theme.test.ts` verifies generated CSS and snapshot
integrity. The public `DesignSystemGallery` includes Paper specimens; load
`paper-theme.css` alongside the gallery stylesheet to display them.
