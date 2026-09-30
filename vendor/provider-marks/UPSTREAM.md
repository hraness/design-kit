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
- `supermemory.svg`: the official icon from `supermemoryai/supermemory` at
  commit `ce4facf662b278713578450f704ab2d7d11b1865`,
  [`apps/docs/images/supermemory.svg`](https://github.com/supermemoryai/supermemory/blob/ce4facf662b278713578450f704ab2d7d11b1865/apps/docs/images/supermemory.svg).
  Unmodified; MIT license retained in `SUPERMEMORY-LICENSE`.
- `mem0.svg`: the official favicon from `mem0ai/mem0` at commit
  `94c3fe9f238f3dbf29c9ce98643bd71eb13077cd`,
  [`docs/logo/favicon.svg`](https://github.com/mem0ai/mem0/blob/94c3fe9f238f3dbf29c9ce98643bd71eb13077cd/docs/logo/favicon.svg).
  Apache-2.0 license retained in `MEM0-LICENSE`. `mem0-art.svg` adds the
  missing `0 0 100 100` viewBox and prefixes the clipping identifier;
  `mem0-glyph.svg` also removes the background rectangle so its foreground
  can follow the surrounding ink. The original stays byte-exact.
- LobeHub marks, including Obsidian and GitHub Copilot: `icons/<name>[-color].svg`, unmodified.

File SHA-256 digests are pinned by `src/provider-marks-vendor.test.ts`; update
the test when marks change. `scripts/generate-provider-marks.ts` compiles this
directory into `src/provider-marks.generated.ts`.
