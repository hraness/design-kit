<!-- kb:context scopes/repository--cdb4ee2aea69 -->
# Contents

- `src/index.ts` and `src/*.css` define framework-neutral tokens, system-font defaults, syntax highlighting, charts, effects, site grammar, and the ordered presentation stylesheet.
- `src/react/` contains application compositions, appearance persistence, charts, haptics, instruments, decorative effects, optional Jelly paint, and the executable public gallery.
- `src/fonts/geist-mono/` contains the optional Geist Mono webfont, SIL Open Font License, and provenance.
- `vendor/jelly-ui/` contains pinned Jelly runtime artifacts and MIT provenance. `vendor/evilcharts/` retains the chart adaptation's MIT provenance.
- `portfolio-inventory.json` declares the public package, publication, and supported `@hraness/ui` peer edge.
- `kb/` contains authored repository rationale, maintained synthesis, and durable plans.
- `.agents/skills/` contains portable KB and phased-execution workflows.
- `WRITING.md` and `STYLE.md` define internal and public prose contracts.
- `scripts/`, package configuration, and workflows build, smoke-test, verify, release the standalone package, and prepare read-only dependency proposal artifacts.

# Guidelines

- Use Bun 1.3.14. Run `bun run check` before handing off a change.
- Follow `WRITING.md` for internal prose and `STYLE.md` for public prose.
- Apply unreasonably robust programming when agent work is cheap. Prefer coherent cross-file correctness and focused deterministic evidence to a knowingly weaker design.
- Deliver changes to `main` through a current-head pull request. Keep the stable `Required` CI job green, resolve every review thread, and serialize merges. Human approval stays optional while one regular maintainer would otherwise self-review. Never force-push or bypass the gate.
- Keep the installation-optional public `@hraness/ui` peer range at `>=0.4.0 <0.5.0` and the development installation pinned to an exact immutable compatible release tag. Stylesheet and React consumers install the peer explicitly; the framework-neutral root and syntax highlighter do not require it. Portable controls, React Aria behavior, overlays, fields, collections, navigation primitives, and low-level surfaces belong there.
- Keep this package an opinionated presentation and composition layer. Do not add a second primitive barrel or copy public core styles.
- Keep the design seam directional: `@hraness/ui` owns portable accessible primitives and tokens, this optional package owns stable presentation compositions, and each product owns layout, content, state, and its local visual contract. Never import product code here.
- Keep root exports framework-neutral. React runtime belongs behind `@hraness/design-kit/react`; standards-only DOM and browser runtime code belongs behind `@hraness/design-kit/browser`. Do not register custom elements or mutate browser globals on module import.
- Keep persistent appearance selection to one icon-menu control at the final/rightmost product-header action. Do not place appearance controls in footers, navigation lists, route-state action rows, or nested gallery content. Fixed-theme, authentication-only, global-error, and non-HTML surfaces may omit the control.
- Keep default typography on system stacks. Optional open fonts require their exact license, provenance, and integrity evidence.
- Preserve native or React Aria semantics as the interactive layer. Jelly may paint a host but never replace the semantic descendant.
- Keep decorative effects pointer-transparent, reduced-motion aware, forced-color safe, deterministic where seeded, and removable without losing meaningful content.
- Keep chart data and units application-owned. Shared charts own responsive geometry, exact-value accessibility, reduced motion, and forced-color behavior.
- Model public states so invalid combinations cannot exist. Parse foreign values from `unknown` at owned boundaries.
- Keep public class names, properties, events, storage keys, metadata, prose, tests, and Git history on Hraness-neutral identities.
- Update `DesignSystemGallery` and focused regression tests with each public presentation contract change.
- Pair readable deterministic regression examples with property tests for parsers, reducers, ordering, round trips, seeded effects, and other general laws.
- Pin Hraness dependencies to reviewed immutable releases or full commits. Never connect repositories with sibling paths, Git submodules, or coordinated `main` assumptions.
- Extract another shared composition only after two concrete consumers need the same stable interface. Keep this package product-neutral and independently releasable; consumers upgrade on their own validation schedule.
- Keep Direct and other deterministic workbenches development-only and outside every production dependency graph.
- Freeze public interfaces before parallel lanes begin. Give manifests, lockfiles, generated inventories, and other convergence surfaces one owner while lanes edit disjoint paths.
- Keep mandatory rules in the closest `AGENTS.md`, current procedures in `docs/` when needed, executable contracts in types and tests, and pull-based rationale and plans in `kb/`.
- Run `bun run kb:check:lane` in an independent KB lane. The integrating agent runs `bun run kb:refresh` and `bun run kb:check`.
- Scheduled dependency discovery may regenerate the Bun lock only inside its ephemeral checkout and upload a bounded diff for one immutable release. It must never push, open or approve a pull request, merge, move tags, publish, or mutate provider state.
