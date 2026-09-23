# Semantic palettes

Applications can opt into Paper, Catppuccin, Gruvbox, Rosé Pine, or Tokyo Night, with light, dark, and system appearance. Catppuccin dark is the default. Existing `DesignThemeProvider` consumers keep their existing appearance behavior until they opt in.

## Install and render

Install the explicit UI peer and import `@hraness/design-kit/styles.css` once for the full design system. Applications with their own fonts and reset can import `@hraness/design-kit/palettes.css` for the palette CSS and compiled compositions alone. Do not import both entries.

Render the initial document with `data-palette="catppuccin"`, `data-theme="dark"`, and the class returned by `getDesignPaletteTheme("catppuccin", "dark")`. This gives the page a complete palette before JavaScript runs.

Bundle an application-owned browser entry that calls `initDesignPalette()` from `@hraness/design-kit/browser`. Load that bundle as a same-origin, synchronous external script in the document head. It applies the saved preference before the page paints. It does not require inline scripts, inline styles, or a weaker content security policy.

Wrap React content in `DesignPaletteProvider` and retain one `ThemeMenuButton` as the final header action. The provider adopts the document's existing controller. The menu exposes separate Theme and Appearance radio groups. `useDesignPalette()` provides the preference and its resolved light or dark mode.

A product can use the browser controller without React. Its snapshot, subscription, and `setPreference` methods support native controls. Initialization is explicit; importing the browser package does not change the document or register listeners.

## Product defaults and static pages

Choose a default for the product family, then pass the same `defaultPreference`
to the head bootstrap and `DesignPaletteProvider`. For example,
`{ palette: "gruvbox", mode: "system" }` gives a writing suite a warm default
while preserving a visitor's saved choice. Keep browser theme-color metadata
aligned with the chosen palette and use `ThemeColorSync` for later changes.

For a system-first document, render `data-palette="gruvbox"` without a
`data-theme` attribute. The generated CSS uses `light-dark()` before JavaScript,
including when scripting is disabled. A concrete `data-theme="light"` or
`data-theme="dark"` takes precedence. Static palette islands use the same two
attributes; React portals retain their complete generated class.

The full and minimal foundations include this behavior. Static sites with an
existing stylesheet can import `@hraness/design-kit/palette-bridge.css`; it
includes `palette-system.css` and maps the raw values onto the semantic roles.
The narrower `palette-system.css` export contains only raw palette values and
color-scheme, for build pipelines that already supply their own role mapping.
Neither stylesheet needs a browser script or an animation runtime.

## Preferences and embedded views

The controller stores only `{ "palette": "catppuccin", "mode": "dark" }` under `hraness-design-palette-v1` in the current origin's local storage. It supports all five palette identifiers and `light`, `dark`, or `system`. Invalid or inaccessible storage falls back to Catppuccin dark. Storage events synchronize other tabs, and system mode follows operating-system appearance changes.

Use `forcedPreference` for an embedded example or fixed preview in its own document. A document has one palette controller; conflicting nested providers are rejected. Forced providers do not persist preferences or adopt the parent document's controller. Each document still needs its initial attributes and compiled palette class. The host owns any propagation between iframe documents.

Portalled controls receive the resolved palette class through the shared portal theme context. Keep explicit palette islands complete: each needs its palette class and concrete `data-theme` value. Color selection never changes typography, layout, or application data.

## StyleX and semantic roles

`src/palettes.ts` owns the source colors and their application adaptations. `bun run generate:palettes` writes the static system palette sheet and ten complete `stylex.createTheme` recipes against one `stylex.defineVars` contract in `src/palette-tokens.stylex.ts`. The build verifies that the generated source is current, then compiles the recipes with runtime CSS injection disabled.

The global CSS boundary maps existing `--primary`, `--danger`, `--warning`, `--success`, surface, text, focus, and `--ui-*` roles to the compiled `--hraness-palette-*` properties. Product CSS and shared controls consume the same values. Use semantic roles for meaning; keep text or an icon with each status so color is not its only cue.

Compiler adopters that own their typography import `@hraness/design-kit/compiler-palettes.css`. It includes the portable UI foundation and semantic palette bridge, without webfonts, marketing styles, or standalone atomic recipes. It supports the palette controller, `DesignPaletteMenuButton`, and portable UI primitives. Full design-kit compositions use `compiler-foundation.css`, which includes that minimal foundation plus the package's typography and presentation styles.

Both routes register the UI and design-kit manifests and link one finalized cross-package stylesheet after the foundation. The manifest binds `compiler-palettes.css`; the full foundation imports it once. Do not also load the standalone `palettes.css`, `styles.css`, or `stylex.css` entries.

This uses StyleX's documented [variable contract](https://stylexjs.com/docs/api/javascript/defineVars/) and [compiled theme classes](https://stylexjs.com/docs/learn/theming/creating-themes/). Applications consuming the precompiled package do not need another StyleX compiler configuration.

## Sources and contrast

| Theme | Light source | Dark source |
| --- | --- | --- |
| [Catppuccin](https://catppuccin.com/palette/) | Latte | Mocha |
| [Gruvbox](https://github.com/morhetz/gruvbox/blob/master/colors/gruvbox.vim) | Light | Dark |
| [Rosé Pine](https://rosepinetheme.com/palette/) | Dawn | Rosé Pine |
| [Tokyo Night](https://github.com/folke/tokyonight.nvim/tree/main/extras/lua) | Day | Night |

These are interface adaptations of the upstream palettes. Backgrounds retain their source values. Text and control colors move toward black or white when necessary for readability across the background, surface, raised surface, and hover surface. Body text reaches 7:1, secondary text and semantic text reach at least 4.5:1, and control boundaries reach at least 3:1. Filled semantic actions also have a tested foreground pair. Subtle separators are decorative and do not serve as the sole boundary of an interactive control.

The recipe tests cover every supported color pair. Browser coverage checks actual inheritance, theme switching, storage, and overlays. Forced-colors mode uses system colors. Components remain responsible for appropriate labels, keyboard behavior, and focus visibility.

## Paper as a product default

Paper uses warm neutral backgrounds and one blue action color. Its source
backgrounds and typography follow the shared studio visual reference;
foreground, status, and control colors use the same readability adaptation
as the other palettes. Use `defaultPreference={{ palette: "paper", mode: "system" }}`
on both the bootstrap and `DesignPaletteProvider`. Existing saved palette
preferences win; `legacyStorageKey` migrates an existing light, dark, or system
choice. The package default remains Catppuccin dark.

The [portable Paper stylesheet](PAPER_THEME.md) is generated from these same
palette values. It supplies typography and marketing tokens to named-palette
consumers while a non-Paper palette retains its selected colors.
