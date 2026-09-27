# Icons

`@hraness/design-kit/icons` is the shared vetted illustration and mark library
for hraness.com surfaces. Every icon is generated as a member of a measured
family — never alone — by Slopcamera, then admitted to the package by hash and
metric bounds.

## Using icons

Two distributions ship from the same canonical artwork:

```ts
import { hranessIconMarkup, hranessIcons } from "@hraness/design-kit/icons";

const html = hranessIconMarkup("shared/research"); // complete inline <svg>
```

or the raw file, for `<img>` sources and static builds:

```ts
import researchUrl from "@hraness/design-kit/icons/shared/research.svg";
```

Each asset carries `viewBox`, sanitized inner `body`, `ink`, `context`
(`card` | `hero` | `inline`), `purpose` (`illustration` | `mark`), `set`, and
`subject`.

## Adding or regenerating a set

Sets are authored in `src/icons/sets/<name>.json` and are also the exact input
Slopcamera consumes:

```sh
slopcamera image icon --set src/icons/sets/sponge.json \
  --output-dir artifacts/icons/sponge --candidates 2 --set-rounds 3
```

Copy the reviewed SVGs into `src/icons/<set>/` and the set receipt into
`src/icons/receipts/`, then run:

```sh
bun run generate:icons   # measures artwork and rewrites manifest + module
bun run check:icons      # CI form: verifies instead of writing
bun test src/icons.test.ts
```

Admission is fail-closed: single ink, bounded bytes and vector detail,
context-shaped density and stroke bands, and per-set family coherence
(each illustration within ±45% coverage and ±50% stroke of its set median;
marks are excluded from family coherence since they are product-authored).
A manifest member without artwork is listed under `pending`, never silently
omitted.

Product marks are declared on a set's `marks` field: they are vetted and
distributed through the same registry but are product-authored content that
a `--set` regeneration run never rewrites.
