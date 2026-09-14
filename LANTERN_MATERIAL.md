# Lantern material

Lantern adds luminous edges, warm selection states and restrained depth to the shared component system. It is independent of the selected palette, the Paper theme and editorial typography. The default application treatment is quiet. Glazing belongs at key transitions and on chrome with real content behind it.

The complete `styles.css` and `compiler-foundation.css` entries include the material. For a selective import, load `@hraness/design-kit/lantern-material.css` after the existing foundation and palette styles, then set `data-hraness-material="lantern"` on the document or an explicit theme island. The stylesheet has no JavaScript, font, remote URL or inline-style dependency. Its CSS-only shaded faces work independently; the marketing preset supplies original grain and individually shaded SVG cells through optional background tokens. Existing controls continue to own their semantics, dimensions, state and accessible names.

| Hook | Purpose |
| --- | --- |
| `.hraness-material-pane` | Opaque, readable content plane. Optional `data-depth="raised"` or `"inset"` describes actual depth. |
| `.hraness-material-chrome` | Diffused header or floating enclosure. It becomes opaque without backdrop support or when reduced transparency is requested. |
| `.hraness-material-wall` | Decorative shaded square faces and transmitted light behind an expressive area. It never filters or overlays descendants. |
| `.hraness-material-control` | Plain HTML action adapter. A narrow edge leaves the established foreground/background pair and focus shadow intact. |
| `.hraness-material-input` | Plain HTML field adapter: inset edge paint and a semantic caret. |
| `.hraness-material-choice` | Plain HTML selection with a matched fill/text pair, driven by `aria-pressed`, `aria-selected` or React Aria's `data-selected`. |
| `.hraness-material-terminal` | A quiet window enclosure; its `__bar` is decorative title chrome. |
| `.hraness-material-code` | A theme-aware `pre` with intact source lines and horizontal overflow. Use `SyntaxCode` or framework-neutral `highlightCode` for syntax; give an overflowing example a keyboard focus target. |
| `.hraness-material-rows` | An unruled readable collection. The product owns grouping, separators, and responsive structure. |
| `.hraness-material-disclosure` | Native disclosure with a touch-sized summary and visible keyboard focus. |

Material tokens resolve inside each marked island. Mark a nested theme island separately. A portalled overlay must carry the complete palette class/attributes, resolved light/dark mode and `data-hraness-material="lantern"` on its actual host (or inherit them from a corresponding wrapper). The marker and material hook can live on the same element. A material class alone cannot transport context across a portal.

For `@hraness/ui` primitives, use the compiled `lanternControlStyles` exported from `@hraness/design-kit/react` through their existing `controlXstyle` prop. Use `edge` on actions, `inset` on a text field's control, and conditionally append `selected` for a real selected state. Do not apply the plain HTML classes to primitive wrappers or controls. The compiled recipes leave the primitive's focus outline, focus shadow, dimensions, error and disabled behavior intact. They work through either the standalone package stylesheet or the final compiler union.

```tsx
<Button
  aria-pressed={selected}
  controlXstyle={[lanternControlStyles.edge, selected && lanternControlStyles.selected]}
  onPress={() => setSelected(!selected)}
>
  Personal only
</Button>
<TextField label="Find a note" controlXstyle={lanternControlStyles.inset} />
```

`TopBar` accepts the chrome class with `surface="glass"`; the material binds its existing public background/backdrop tokens. The same class also supports a native header. Use sticky chrome only where content actually scrolls behind it.

Older applications can vendor a five-file snapshot without upgrading their primitive peer graph:

```sh
bun scripts/lantern-material-snapshot.ts --write DEST --source-commit FULL_SHA
node DEST/check.mjs DEST
```

Run the installer from an immutable design-kit checkout and supply its full commit. The snapshot contains CSS, license, a Node checker and declaration, and provenance. It has no fonts or bitmap dependencies. Keep its checker in the consuming application's normal validation gate.

Keep body text on opaque planes. Use square modules for alignment and proportion without forcing content into square cards. Collections need a bounded readable measure, a clear grouping rule and progressive disclosure of secondary details. Availability, errors and consequential limits remain visible before a user acts. One section should have one clear primary next step.

Warm material states do not replace success, warning, danger or keyboard-focus meaning. Reduced motion removes material transitions. Reduced transparency removes glazing. Forced colors replaces material paint with system colors and keeps selected states explicit.

The architectural reference is Maison Hermès in Tokyo. RPBW describes textured translucent glass, curved corner blocks and a façade that shifts from cool daylight to warm interior illumination. Hermès describes a repeated square module extending into the flooring and shelving. These are principles of material and organization, not a license to cover every control with a façade image.

Sources: [RPBW project](https://www.rpbw.com/project/maison-hermes), [Hermès: The magic of the squares](https://lanterne.hermes.com/en/secrets/secret2412/).
