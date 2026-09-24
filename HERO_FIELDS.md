# Hero fields

`ProductHero` gives marketing pages a shared decorative light field. Each product
keeps its own copy, artwork, and visual explanation. Pass decorative artwork in
`backdrop`; pass `false` for a quiet hero. Meaningful product proof belongs in
`frame`, where it remains available to readers and assistive technology.

```tsx
<ProductHero
  heading="A place for your ideas"
  headingId="ideas"
  name="Notes"
  summary="Keep the context behind your work."
  backdrop={<NoteConstellation />}
/>
```

The backdrop is inert, pointer-transparent, and behind the copy. Its own paint
is clipped without clipping the hero's focus rings. Default artwork is
deterministic from `headingId`, uses the selected palette's material roles,
and works without JavaScript or inline styles in server markup. Documentation
and application route headings should use their ordinary heading composition;
the decorative field is a marketing surface.

`HeroBackdrop` can also wrap decorative artwork in a product-owned hero whose
container sets `position: relative` and `isolation: isolate`. The component
enhances that parent with `attachHeroLight` from the browser entry. Static HTML
sites can call the same function and retain its returned disposal function.
Install one controller per hero. It does not install itself on import.

The controller owns four bounded CSS inputs: `--hraness-hero-light-x` and `-y`
range from 12% to 88%; `--hraness-hero-drift-x` and `-y` range from -8px to 8px
and -6px to 6px. Artwork can opt in to pointer proximity with
`data-hraness-hero-item`; at most 48 items receive a
`--hraness-hero-proximity` value between zero and one. Use it for a subtle
change in light or clarity. Keep text, controls, and document layout still.

Light settles and stops requesting frames. Leaving the hero, switching tabs,
moving offscreen, changing motion preferences, or disposing the controller
restores the authored static field. Touch and reduced motion retain that static
composition. Forced colors and reduced transparency hide the decorative field;
the copy and controls remain available. No global pointer listeners, storage,
provider calls, or animation libraries are needed.

Choose the palette and material pattern independently. The material's `cells`,
`weave`, `contour`, `mesh`, and `none` patterns share one lighting vocabulary.
Families can share a default palette while keeping their product artwork.
An explicit saved appearance always takes precedence over the product default.

`ProductHero` stays available from the server entry. Its decorative backdrop crosses the isolated `@hraness/design-kit/react/hero-backdrop` client boundary; package builds preserve that edge and its directive so server compositions never import React hooks directly.
