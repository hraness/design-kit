# Contents

- `src/index.ts` and `src/*.css` define framework-neutral tokens, system-font defaults, syntax highlighting, charts, effects, site grammar, and the ordered presentation stylesheet.
- `src/react/` contains application compositions, appearance persistence, charts, haptics, instruments, decorative effects, optional Jelly paint, and the executable public gallery.
- `src/fonts/geist-mono/` contains the optional Geist Mono webfont, SIL Open Font License, and provenance.
- `vendor/jelly-ui/` contains pinned Jelly runtime artifacts and MIT provenance. `vendor/evilcharts/` retains the chart adaptation's MIT provenance.
- `portfolio-inventory.json` declares the public package, publication, and supported `@hraness/ui` peer edge.
- `scripts/`, package configuration, and workflows build, smoke-test, verify, release the standalone package, and prepare read-only dependency proposal artifacts.

# Guidelines

- Use Bun 1.3.14. Run `bun run check` before handing off a change.
- Keep the installation-optional public `@hraness/ui` peer range at `>=0.4.0 <0.5.0` and the development installation pinned to an exact immutable compatible release tag. Stylesheet and React consumers install the peer explicitly; the framework-neutral root and syntax highlighter do not require it. Portable controls, React Aria behavior, overlays, fields, collections, navigation primitives, and low-level surfaces belong there.
- Keep this package an opinionated presentation and composition layer. Do not add a second primitive barrel or copy public core styles.
- Keep root exports framework-neutral. React, DOM, custom-element, and browser runtime code belongs behind `@hraness/design-kit/react`.
- Keep default typography on system stacks. Optional open fonts require their exact license, provenance, and integrity evidence.
- Preserve native or React Aria semantics as the interactive layer. Jelly may paint a host but never replace the semantic descendant.
- Keep decorative effects pointer-transparent, reduced-motion aware, forced-color safe, deterministic where seeded, and removable without losing meaningful content.
- Keep chart data and units application-owned. Shared charts own responsive geometry, exact-value accessibility, reduced motion, and forced-color behavior.
- Keep public class names, properties, events, storage keys, metadata, prose, tests, and Git history on Hraness-neutral identities.
- Update `DesignSystemGallery` and focused regression tests with each public presentation contract change.
- Scheduled dependency discovery may regenerate the Bun lock only inside its ephemeral checkout and upload a bounded diff for one immutable release. It must never push, open or approve a pull request, merge, move tags, publish, or mutate provider state.
