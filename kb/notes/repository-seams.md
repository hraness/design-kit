---
title: Repository seams
type: concept
tags:
  - architecture
  - dependencies
  - repositories
repository_scopes:
  - AGENTS.md
  - gallery
  - kb
  - WRITING.md
  - STYLE.md
  - package.json
  - portfolio-inventory.json
  - src
---

# Repository seams

Design Kit publishes an optional presentation and composition layer above `@hraness/ui`. It owns stable shared tokens, typography, charts, effects, site grammar, and React compositions while leaving portable accessible primitives to UI. Products own layout, content, application state, chart data and units, and their local visual specifications.

The dependency seam is directional: `@hraness/ui` primitives feed this optional package, and products may consume either or both at immutable versions. Design Kit never imports product code, and UI never imports Design Kit. Direct workbenches and deterministic galleries remain development-only and outside every production dependency graph.

Consumers pin reviewed immutable releases or full commits and validate upgrades on their own schedule. Do not use sibling paths, Git submodules, or coordinated `main` workflows. Add a shared composition only after two concrete consumers need the same stable interface. Freeze public interfaces before parallel work and give inventories, manifests, locks, generated artifacts, and release convergence surfaces one owner.

Syntax defaults belong in the shared server highlighter. Markdown renderers pass literal code and an optional fence hint; React compositions use `SyntaxCode`. Bounded deterministic selection recognizes distinctive code while uncertain input, unsupported hints, and oversized blocks remain escaped plain text. The narrow marketing stylesheet includes token colors, but importing CSS alone cannot tokenize raw markup. This keeps initial rendering and strict content-security policies compatible without a client pass that mutates the document. Token styles leave component typography in charge.

The compiler palette foundation keeps font policy with the application. `compiler-palettes.css` supplies the portable UI foundation and semantic palette bridge for controllers, the appearance menu, and portable controls. The manifest binds that exact file, and the full `compiler-foundation.css` imports it before adding design-kit typography and presentation. Both routes therefore satisfy the same required-foundation check and emit one finalized rule union. This avoids importing webfonts into a product that deliberately uses a system stack while retaining the full presentation route for other consumers.

Compiler identity includes the property-validation policy. Design Kit v0.6.3 pairs with UI v0.5.12, whose collector rejects unsupported properties rather than silently omitting declarations. This requires a real rebuild of every registered package manifest, even when its existing recipes compile without modification. Supported raw dashed CSS properties retain their native semantics; converting them to unsupported camel-case shorthands changes the authoring contract. Consumers keep compatible manifest identities together and begin a fresh generation after upgrading. The previous rollback pair is Design Kit v0.6.2 with UI v0.5.4; framework-neutral entry points retain their installation-optional UI boundary.

Forced-color overrides depend on the serialized theme selectors. The pinned StyleX serializer repeats each theme class, so its root selector has the same specificity as the original `:root.hraness-palette[data-theme]` bridge selector. Loading the finalized union after the foundation then lets palette colors replace the operating system's colors. Repeating the stable palette marker in the forced-color boundary gives that boundary higher specificity for both document roots and palette islands. Browser regression coverage must preserve the real foundation-before-union order; inspecting raw manifest selectors alone misses the serializer's added specificity.

Product facts are the one data exception to product neutrality. The reserved `./portfolio` subpath will carry generated public portfolio facts for article and marketing consumers, with no product-specific components; [[plans/article-layer-and-portfolio-subpath|the article layer plan]] records its design.

## Related

The normative rules remain in the root `AGENTS.md`. [[documentation-ownership|Documentation ownership]] explains how those rules relate to executable contracts and this pull-based context.

## Portable Paper links

Portable Paper links use `--plain-link`, which follows `--primary` in ordinary light and dark appearance. In forced-colors mode the link alias selects `LinkText`, while filled primary actions and focus retain `Highlight`. These system roles carry different meanings; a selection background color is not a reliable text-link color. The correction preserves portable contract 1, its opt-in boundary and the guard that leaves a selected non-Paper palette in charge of its own colors.

The standalone gallery includes real `href` links at the document root and inside explicit light, dark and nested Paper islands. Its browser regression compares their resolved paint with a `LinkText` reference in forced light and dark modes, with native color adjustment still enabled. The same test checks ordinary link paint against the Paper primary colors and preserves the non-Paper link token. The new paint assertion first failed against the earlier generated stylesheet; checking custom-property names alone had missed the error. The public React gallery also exposes Paper text links.

The patch keeps the existing compiler identity and immutable UI dependency. Consumers adopt the new package or regenerate an intentional snapshot from a reviewed commit on their own schedule, following `PAPER_THEME.md`; a release does not rewrite their pinned snapshots.
