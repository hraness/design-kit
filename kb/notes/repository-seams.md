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

The compiler palette foundation keeps font policy with the application. `compiler-palettes.css` supplies the portable UI foundation and semantic palette bridge for controllers, the appearance menu, and portable controls. The manifest binds that exact file, and the full `compiler-foundation.css` imports it before adding design-kit typography and presentation. Both routes therefore satisfy the same required-foundation check and emit one finalized rule union. This avoids importing webfonts into a product that deliberately uses a system stack while retaining the full presentation route for other consumers.

Forced-color overrides depend on the serialized theme selectors. The pinned StyleX serializer repeats each theme class, so its root selector has the same specificity as the original `:root.hraness-palette[data-theme]` bridge selector. Loading the finalized union after the foundation then lets palette colors replace the operating system's colors. Repeating the stable palette marker in the forced-color boundary gives that boundary higher specificity for both document roots and palette islands. Browser regression coverage must preserve the real foundation-before-union order; inspecting raw manifest selectors alone misses the serializer's added specificity.

## Related

The normative rules remain in the root `AGENTS.md`. [[documentation-ownership|Documentation ownership]] explains how those rules relate to executable contracts and this pull-based context.
