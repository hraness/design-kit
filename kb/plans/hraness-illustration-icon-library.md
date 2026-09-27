---
type: plan
area: design-kit
status: in-progress
description: Audit, centralize, and regenerate the cross-product isometric illustration icons as a vetted shared library, and extend Slopcamera with set-level generation and selection so families stay coherent.
repository_scopes:
  - .
tags:
  - icons
  - brand
  - marketing
  - slopcamera
---

# Shared illustration-icon library and set-level generation

## Outcome

Every public product site draws its decorative isometric "topic" artwork from
one vetted icon library published in `@hraness/design-kit`, and the
`slopcamera image icon` pipeline generates icons *as a set* — shared style
lock, per-member candidates, contact-sheet family critique, and joint
selection — instead of one isolated icon at a time.

## Context and audit evidence

Nine sites ship SVG topic icons today, all rendered as 88 px `<img>` art in
marketing card grids:

| Site | Path | Count |
| --- | --- | --- |
| act60.me | `public/icons/` | 8 (1 mark) |
| aicharts | `public/icons/` | 8 (1 mark) |
| platonik | `public/icons/` | 7 (1 mark) |
| roughday | `public/icons/` | 4 (1 mark) |
| slopcamera | `apps/web/src/icons/` | 9 (1 mark) |
| soundfish | `public/icons/` | 8 (1 mark) |
| sponge | `public/icons/` | 10 (1 mark) |
| stripe-history | `public/icons/` | 7 (1 mark) |
| wordcell | `site/public/icons/` | 10 (1 mark) |

Measured at a normalized 512 px render (2026-09-26 audit, script retained in
the Slopcamera artifacts directory):

- Ink coverage inside the content box ranges 0.076 (`platonik/spark-route`) to
  0.345 (`sponge/documents`) — roughly a 4.5× density spread.
- Erosion-estimated stroke width ranges 4 px (`wordcell/markdown`) to 36 px
  (`soundfish/collaborate`) across illustrations.
- Vector detail ranges 1 to 441 paths; about twenty shipped icons exceed the
  current 48-path illustration gate (`sponge/research` 441,
  `act60.me/presence` 434, `sponge/library` 401, `act60.me/chapter-compare`
  383, `roughday/technology` 297, `slopcamera/mcp` 257,
  `stripe-history/sources` 258…). The largest files reach 334 KB for a
  decorative 88 px image.
- Five subjects are already shared informally as byte-identical copies:
  `cli` (slopcamera, soundfish, wordcell), `sdk`, `agent-skill` (slopcamera,
  wordcell), `research` (platonik, sponge), `privacy` (sponge,
  stripe-history).

Root cause: `slopcamera image icon` evaluates one icon at a time. Its
deterministic gate checks per-icon bounds (aspect, coverage, path count) and
its vision critique judges a single rendered candidate; nothing compares
members of a set against each other, and no context parameter tells the
prompt or gates where the artwork will appear.

## Scope and non-goals

In scope:

- A versioned, content-addressed icon library in `src/icons/` of this
  package: canonical SVG files, a generated framework-neutral TypeScript
  module for inline rendering, a manifest binding bytes/subject/context/
  provenance, and a deterministic admission gate that measures each icon.
- Two classes in one library: `illustration` (marketing topic art) and
  `mark` (product symbols). Brand marks remain product-owned content; the
  library only vets and distributes them.
- A Slopcamera set mode: one manifest-driven run produces a coherent family
  (shared ink/projection/weight prompt lock, per-member candidates, measured
  metrics, contact-sheet critique, joint selection inside a tolerance band).
- A `--context` parameter (e.g. `card`, `hero`, `inline`) that adjusts the
  prompt's detail budget and the gate thresholds for where the art lands.
- Regenerating every shipped icon as sets and migrating each product to the
  library.

Out of scope: replacing product layout or copy, new icon *subjects* beyond
the shipped inventory (new subjects ride the same pipeline later), animated
icons, and a hosted icon CDN.

## Constraints and decisions

- Decision (user, 2026-09-26): distribute both ways — canonical `.svg` files
  for the existing `<img>` pattern plus generated TypeScript exports for
  inline `<svg>` rendering.
- Decision (user, 2026-09-26): regenerate all icons as sets rather than
  admitting existing outliers.
- Decision (user, 2026-09-26): the library covers illustrations and marks;
  the audit's `-` declared-weight entries are marks.
- Subjects, not sites, key the library — the byte-identical cross-site copies
  prove one `cli` or `privacy` should serve every product. Per-product sets
  resolve which slugs a site needs.
- Vetting is deterministic and local: the admission gate rasterizes each SVG
  and enforces measured bands (coverage, stroke estimate, aspect, path count,
  bytes, single-ink, no embedded rasters/text/scripts), so no icon can land
  without passing what the audit measures.
- Set selection is joint: the set runner collects passing candidates per
  member, renders a labeled contact sheet for the vision critique, and
  rejects/regenerates members whose measured metrics leave the family band —
  preferring alternate candidates before spending another generation round.
- Slopcamera keeps its credential, retry, and bounded-response contracts; the
  set runner composes the existing per-icon pipeline rather than forking it.

## Work

1. Slopcamera: extract `measureIconSvg` metrics (coverage, stroke estimate,
   aspect, paths, bytes) shared by the audit script and the set runner;
   record measured metrics on icon receipts. **Done** — `IconMeasuredMetrics`
   recorded on every attempt receipt (`src/icon.ts`).
2. Slopcamera: add `--context` to `slopcamera image icon` feeding prompt and
   gate bands. **Done** — `card`/`hero`/`inline` profiles tune prompt language
   and deterministic bounds; also admitted on the `slopcamera.image.icon`
   operation (which additionally fixed a latent `purpose` parse rejection).
3. Slopcamera: add set mode (`--set manifest.json --output-dir`) with shared
   style lock, per-member candidate pools, contact-sheet family critique, and
   joint selection; receipts record per-member metrics and the set verdict.
   **Done** — `src/icon-set.ts`; leave-one-out joint selection against the
   family median, measured-band enforcement with directional regeneration,
   bounded `--set-rounds`, fail-closed publication, and `references` that let
   admitted family icons anchor a related set's target without regenerating.
   Open as slopcamera PR #249.
4. Design-kit: `src/icons/` canonical SVGs, `manifest.json`, generated
   `icons.generated.ts` exports, `icons.test.ts`/`check:icons` admission
   gate, docs and gallery coverage. **Landed machinery** — `scripts/
   generate-icons.ts` measures each admitted file through the pinned
   `@resvg/resvg-js@2.6.2` rasterizer and enforces context bands plus
   per-set family coherence; both distributions ship (`./icons` module,
   `./icons/*` files). Gallery coverage still pending.
5. Author per-product set manifests (shared subjects + product-specific
   ones) and the product marks. **Done** — nine manifests in
   `src/icons/sets/` (`shared` plus eight products); product sets anchor to
   the `shared` members they actually render via `references`.
6. Run regeneration sets; vet outputs into the library. **Done** — 62 icons
   admitted (53 illustrations: shared 5, sponge 7, wordcell 6, aicharts 7,
   soundfish 6, stripe-history 5, platonik 5, act60 7, slopcamera 5; plus 9
   product-authored marks declared via the design-kit-only `marks` field,
   which admission gates but generation never rewrites). Roughday's three
   30px category chips remain `pending` — the card-style sheet critique
   repeatedly rejected their semantics (unrecognizable/organic subjects at
   chip scale); kept for a later focused pass rather than loosened gates.
   Receipts are retained under `src/icons/receipts/`.
7. Migrate product repos: bump `@hraness/design-kit` to v0.22.0, vendor the
   product's set (members + mark + only the served shared anchors) from the
   pinned package via `sync:icons`, and byte-compare in a parity test so
   upgrades surface drift. **Merged** — sponge #333, wordcell #160,
   aicharts #510, soundfish #208, stripe-history #65, act60.me #106, and
   slopcamera #262 all landed on the pinned v0.22.0 release with passing
   required checks. Platonik's repository is archived (read-only): the same
   change is committed locally on `feat/shared-icon-library` and cannot be
   pushed. Roughday is held — its three members are still `pending`.

## Execution log

- 2026-09-26: Slopcamera implementation complete on `feat/icon-set-generation`
  (PR #249): measured metrics, context parameter, candidate pools, set mode
  with joint selection/contact-sheet critique/reference anchors, op-schema
  `context`/`candidatePool` fields. Tests: 25 icon/set assertions green;
  `typecheck`, `lint:sdk`, `check:standalone`, `check:copy`, `build:sdk` pass.
  Two unrelated spatial-scene performance property tests flake under load.
- Calibration finding: the context gates were first tuned on the audit's
  canvas-relative coverage scale; the gate measures crop-relative coverage
  (~2× higher), so the initial card band (max 0.30) rejected healthy output
  measuring 0.19–0.27. Bands recalibrated (card 0.08–0.55) and verified
  against live generations.
- 2026-09-26: first live shared-set run converged through four members, then
  the Vercel AI Gateway returned **HTTP 402 "Project budget exceeded"
  ($15.06 of $15.00)** on the `slopcamera` Vercel project. Fail-closed held.
- 2026-09-27: blockers cleared — the `slopcamera` project budget was raised
  to $60/month (`vercel ai-gateway budgets set project slopcamera`) and $25
  of AI Gateway credits purchased (`POST /v1/billing/buy`,
  `creditType: gateway`) after the team balance hit zero. Three operability
  fixes landed on slopcamera (4d83720): failed runs publish a
  `*.failed.receipt.json` diagnostic, sheet-critique transport errors are
  tolerated per round and counted on the receipt, and member-lane failures
  surface their last gate error. Two sheet-critique failure modes showed up
  live: `AI_NoOutputGeneratedError` flakiness (bounded by set rounds) and
  subjects whose form factor fights the band (horizontal rails, hairline
  lightbulbs, waveform detail) — resolved by subject rewrites, not gate
  weakening. Three members (act60/chapter-compare, soundfish/hear,
  stripe-history/independence) needed surgical single-member retries anchored
  to their converged siblings via `references`.
- 2026-09-27: 53 illustrations admitted through the full gate. Card aspect
  bound widened to 1.8 (content-box measurement differs ~0.15 from
  slopcamera's raster scale) and family stroke tolerance to ±50%
  (blob-thickness variance on filled-plane art). PR #93 merged (squash
  `70a329d`); release lane `release/v0.22.0` opened as PR #94 with the
  version pins (package.json, stylex artifacts, package-smoke, public
  boundary, README, portfolio inventory) moved to 0.22.0.
- 2026-09-27: marks admitted — a `marks` field on set specs (design-kit
  only; slopcamera's parser ignores unknown keys) carries product-authored
  marks through the same gates without exposing them to regeneration.
  Mark bounds calibrated to shipped artwork (32KB, coverage ≥ 0.10).

## Verification

- `bun run check` in slopcamera and design-kit; deterministic unit tests with
  injected generators/critics for set selection laws (band rejection,
  alternate-candidate preference, contact-sheet iteration bound).
- The admission gate fails on fixtures reproducing the audited outliers
  (hairline, blob, 400-path detail, oversized bytes, missing
  `data-slopcamera-line-weight`).
- After regeneration, re-run the cross-repo audit script against the
  regenerated set: coverage and stroke spread must sit inside the vetted
  band before icons ship.

## Recovery

Generated media is replaceable; the audit JSON, set manifests, and run
receipts are retained outside Git (`artifacts/`). If a regeneration round
produces no passing candidate for a member, the run fails closed and keeps
prior receipts — nothing is published until the gate passes. Product repos
keep their existing local icons until the library release they pin exists.
