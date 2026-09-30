# Provider mark sources

Marks in `lobehub/` are vendored from `@lobehub/icons-static-svg` **1.95.1**
(upstream: `lobehub/lobe-icons`, MIT — see `LICENSE`, pinned in
`src/provider-marks-vendor.test.ts`). Two variants are kept per mark when
published: the plain glyph uses `fill="currentColor"` so surfaces can retint
it, and the `-color` artwork carries the vendor's brand fills.

- `crush-heartbit.svg`: the Crush "HeartBit" mark from
  `charmbracelet/crush`, FSL-1.1-MIT. The source is
  [`internal/cmd/stats/heartbit.svg`](https://github.com/charmbracelet/crush/blob/0eee0616609b2c890ccc69f6a4ab3aba0b8a8630/internal/cmd/stats/heartbit.svg)
  at commit `0eee0616609b2c890ccc69f6a4ab3aba0b8a8630`.
  The polygon and rectangles are retained with class colors converted to
  inline fills; the overlaid paths and editor metadata are omitted.
  `CRUSH-LICENSE.md` copies the complete upstream
  [`LICENSE.md`](https://github.com/charmbracelet/crush/blob/0eee0616609b2c890ccc69f6a4ab3aba0b8a8630/LICENSE.md)
  verbatim, including the Charmbracelet copyright and additional MIT notice.
  These terms apply to the vendored SVG and its generated source and compiled
  artwork. The LobeHub `LICENSE` in this directory covers the LobeHub marks.
- `aider.svg`: original pixel-terminal "a" drawn for this package in Aider's
  published wordmark color `#14b014`. Aider ships no standalone icon; this is
  a nominative mark, not their artwork. Covered by the package MIT license.
- Everything else: LobeHub `icons/<name>[-color].svg`, unmodified.

File SHA-256 digests are pinned by `src/provider-marks-vendor.test.ts`; update
the test when marks change. `scripts/generate-provider-marks.ts` compiles this
directory into `src/provider-marks.generated.ts`.
