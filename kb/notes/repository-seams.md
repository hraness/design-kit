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

## Related

The normative rules remain in the root `AGENTS.md`. [[documentation-ownership|Documentation ownership]] explains how those rules relate to executable contracts and this pull-based context.
