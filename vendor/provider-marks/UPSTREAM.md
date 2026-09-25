# Provider mark sources

Marks in `lobehub/` are vendored from `@lobehub/icons-static-svg` **1.95.1**
(upstream: `lobehub/lobe-icons`, MIT — see `LICENSE`, pinned in
`src/provider-marks-vendor.test.ts`). Two variants are kept per mark when
published: the plain glyph uses `fill="currentColor"` so surfaces can retint
it, and the `-color` artwork carries the vendor's brand fills.

- `crush-heartbit.svg`: the Crush "HeartBit" mark from
  `charmbracelet/crush` (`internal/cmd/stats/heartbit.svg`), FSL-1.1-MIT.
  Normalized from class styles to inline fills; geometry unchanged.
- `aider.svg`: original pixel-terminal "a" drawn for this package in Aider's
  published wordmark color `#14b014`. Aider ships no standalone icon; this is
  a nominative mark, not their artwork. Covered by the package MIT license.
- Everything else: LobeHub `icons/<name>[-color].svg`, unmodified.

File SHA-256 digests are pinned by `src/provider-marks-vendor.test.ts`; update
the test when marks change. `scripts/generate-provider-marks.ts` compiles this
directory into `src/provider-marks.generated.ts`.
