<!-- kb:context scopes/repository--cdb4ee2aea69 -->
# Contents

- `src/index.ts`, `src/*.css`, and component-local `*.stylex.ts` files define framework-neutral tokens, default typography, compiled atomic component presentation, syntax highlighting, charts, effects, site grammar, and the ordered presentation stylesheet.
- `src/react/` contains application compositions, appearance persistence, charts, haptics, instruments, decorative effects, optional Jelly paint, and the executable public gallery.
- `src/fonts/geist-mono/` contains the optional Geist Mono webfont, SIL Open Font License, and provenance.
- `src/fonts/nebula-sans/` contains the default Nebula Sans proportional webfont family, generated OTF payloads for deterministic social images, SIL Open Font License, and exact upstream provenance.
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
- Keep the installation-optional public `@hraness/ui` peer range at `>=0.4.7 <0.5.0` and the development installation pinned to an exact immutable compatible release tag or a reviewed full 40-character commit. A full-commit development candidate blocks publication until it is replaced by its reviewed stable tag. Stylesheet and React consumers install the peer explicitly; the framework-neutral root and syntax highlighter do not require it. Portable controls, React Aria behavior, overlays, fields, collections, navigation primitives, and low-level surfaces belong there.
- Keep this package an opinionated presentation and composition layer. Do not add a second primitive barrel or copy public core styles.
- Keep the design seam directional: `@hraness/ui` owns portable accessible primitives and tokens, this optional package owns stable presentation compositions, and each product owns layout, content, state, and its local visual contract. Never import product code here.
- Keep root exports framework-neutral. React runtime belongs behind `@hraness/design-kit/react`; standards-only DOM and browser runtime code belongs behind `@hraness/design-kit/browser`. Do not register custom elements or mutate browser globals on module import.
- Author package-owned atomic component presentation in colocated `*.stylex.ts` files. Compile with the pinned StyleX 0.19.0 and unplugin 2.3.11 family, CommonJS module roots, property specificity, and `runtimeInjection: false`; keep `dist/stylex.css` deterministic and nonempty.
- Keep complete and narrow component delivery aligned: `components.css` imports `dist/stylex.css` exactly once, while `styles.css` reaches it only through `components.css`. `styles.css` imports the UI legacy and StyleX artifacts exactly once before the local component entry. Generated atomic class names are declaration hashes that may legitimately repeat across package layers, so never infer package ownership from a generated name.
- Keep every handwritten component rule inside `components.hraness-design-kit.legacy` and compiled recipes inside `components.hraness-design-kit.priority1`, `priority2`, `priority3`, and `priority4`. The complete stylesheet keeps `base` below `components` and freezes the exact UI legacy-to-priority3 order before the design-kit legacy-to-priority4 order. The narrow component entry must preserve the same local order, and package gates must structurally reject bare or unlayered rules.
- Keep tokens, resets, document grammar, cross-component layout, forced-color/media contracts, and audited vendor fallbacks in the existing global CSS boundary. Verify cross-package ordering against an immutable UI artifact before changing either package's component layers.
- Keep persistent appearance selection to one icon-menu control at the final/rightmost product-header action. Do not place appearance controls in footers, navigation lists, route-state action rows, or nested gallery content. Fixed-theme, authentication-only, global-error, and non-HTML surfaces may omit the control.
- Keep Nebula Sans as the default proportional text and heading family with system fallbacks. Preserve system monospace for explicit mono and code roles. Every vendored open font requires its exact license, provenance, and integrity evidence.
- Regenerate `social-fonts.generated.ts` only from the vendored official Book and Bold OTF files. Keep its decoded hashes equal to those binaries and its combined payload below the `ImageResponse` bundle ceiling.
- Preserve native or React Aria semantics as the interactive layer. Jelly may paint a host but never replace the semantic descendant.
- Keep `PlaybackTransport` as one stable large primary command with an exclusive accessible name, idle-only disablement, pending busy state, play-or-stop callback routing, logical 1.5rem glyph sizing, and its existing caller, id, shortcut, ref, and trailing-control seams. Do not add a public `xstyle` prop without a concrete consumer contract.
- Keep `Fader` as one React Aria single-value slider with its vertical, default-density, hidden-label, and hidden-output defaults. Preserve the full native slider prop surface, label accessory, root and input refs, stable hooks, exact public sizing properties, logical rail geometry, physical thumb cross-axis fallback, state-driven focus ring, caller-last class, and native style seams. Keep decorative rail nodes inert. Do not add a public `xstyle` prop without a concrete consumer contract.
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

<!-- hra-local-efficiency:start -->
- Treat the user's request to change this repository as standing authorization for routine task-owned commits, pushes, pull requests, merges, releases, deployments, and production verification after the repository's required validation, review, identity, and rollout gates pass. Do not ask for another confirmation at each delivery step.
- Use the repository's documented delivery workflow and preserve every runtime-enforced approval, branch protection, environment rule, safety policy, and final gate. Ask for user input only when delivery needs a material product decision, missing credentials or authority, an irreversibly destructive action outside task scope, or resolution of a release failure that cannot be handled safely and autonomously.
- Prefer short-lived repository workload identities such as OIDC trusted publishing, GitHub Apps, and scoped service accounts. Do not add long-lived personal tokens, weaken two-factor authentication, or bypass provider controls to eliminate an interactive prompt. Batch unavoidable human-gated production promotions into intentional stable releases while agents publish validated prerelease or beta channels through workload identities when the repository supports them.
- Preserve useful reasoning fan-out, but avoid unnecessary checkout fan-out. Prefer subagents in the current task for bounded research, review, diagnosis, and focused checks when they can safely share one working tree; create a separate task or worktree only for independently deliverable divergent edits, an isolated verification tree, or a different execution environment.
- Give each expensive focused validation command and external wait one owner. The integration owner reviews that evidence and runs the repository-required aggregate or final gate once after convergence. Reuse evidence only for the exact Git tree, command, lockfiles, toolchain, relevant environment, and validity period, and never to skip a required final integration, merge, release, deployment, or production-verification gate.
- On Hraness development machines, use `$hra-local-efficiency` and the installed host scheduler for heavyweight top-level commands when available. Keep ordinary work in the compute lane; give authenticated browser/dev-server/Chromium work one `browser-auth` owner and Mac-only validation one `mac-native` owner.
- When a CI or policy gate scans complete Git history, check out the exact governed SHA and fetch only the fully qualified governed refs before scanning. Preserve the complete-history gate and reject unexpected refs instead of importing unrelated concurrent heads.
- At closeout, record applicable branch, PR, check, merge, release, deployment, and production evidence. Archive only conclusively finished tasks, never from silence alone, and reclaim only freshly revalidated clean merged worktrees through the guarded exact-path flow.
<!-- hra-local-efficiency:end -->
