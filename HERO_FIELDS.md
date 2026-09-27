# Hero fields

Hero backdrops are retired. Since 0.23.0, marketing heroes follow the Quiet
direction: a flat palette background, a sans heading, a short summary, one next
step, and one real proof of the product right after the copy. Nothing moves,
glows, or blurs behind the text.

```tsx
<ProductHero
  eyebrow="Job runner"
  heading="Run a job from your terminal, your code, or your agent"
  headingId="title"
  name="Relay"
  summary="Relay runs the same job wherever you start it and writes a log you can read afterward."
  actions={[{ href: "#install", label: "Install Relay" }]}
  boundary="MIT license · macOS and Linux"
  frame={<MarketingProofFrame title="relay run job-01">{terminalOutput}</MarketingProofFrame>}
/>
```

Put real proof in `frame`: a terminal or code block, a static screenshot with
`alt` text, or compact real output. It stays available to readers and
assistive technology. Do not put a large interactive copy of the application in
the hero.

## Retired features

These names stay exported so existing code compiles. They do nothing visible,
and their types are marked deprecated. Remove them when convenient.

| Feature | Behavior since 0.23.0 |
| --- | --- |
| `ProductHero` `backdrop` prop | Ignored. `backdrop={false}`, artwork, and omission all render the same hero with no decorative layer. |
| `HeroBackdrop` from `@hraness/design-kit/react` or `@hraness/design-kit/react/hero-backdrop` | Renders nothing, including its children. |
| `attachHeroLight` from `@hraness/design-kit/browser` | Attaches no listeners, writes no styles, schedules no frames, and returns a disposer you can call any number of times. |
| `--hraness-hero-light-x`, `--hraness-hero-light-y`, `--hraness-hero-drift-x`, `--hraness-hero-drift-y`, `--hraness-hero-proximity` | No longer written or read by any shared style. |
| `data-hraness-hero-item` | No proximity effect. Product artwork marked with it no longer renders inside the hero. |
| `.hraness-marketing-hero-backdrop` and its `__atmosphere` and `__light` children in hand-written HTML | Hidden with `display: none` by `product-marketing.css` and the compiler foundation, so old markup paints nothing and takes no space. |
| `data-hraness-pattern="cells"`, `"weave"`, `"contour"`, `"mesh"` | Still valid; each renders exactly like `"none"`. See [Marketing preset](MARKETING_PRESET.md). |

A product that still passes decorative artwork should delete it rather than
recreate it in product CSS. Floating or blurred elements behind the heading make
it harder to read, especially on phones.

`ProductHero` stays available from the server entry and no longer crosses a
client boundary. The `@hraness/design-kit/react/hero-backdrop` export remains a
client module for compatibility.
