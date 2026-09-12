---
title: Lantern material decision
type: note
tags:
  - architecture
  - presentation
  - accessibility
repository_scopes:
  - LANTERN_MATERIAL.md
  - src/lantern-material.css
  - src/react/lantern-material.stylex.ts
  - src/react/lantern-material-gallery.tsx
  - scripts/lantern-material-snapshot.ts
  - scripts/check-lantern-material-snapshot.mjs
relations:
  informed-by:
    - notes/repository-seams
---

# Lantern material decision

The direction confirmed on 2026-09-12 is quiet application surfaces with luminous edges and warm active states, reserving richer glazing for key moments. Maison Hermès informed the repeated square module, curved enclosure and change from cool daylight to warm interior light. The [material contract](../../LANTERN_MATERIAL.md) owns the current hooks and integration guidance; this note records why those seams were chosen.

Lantern extends presentation independently of palette and typography. Opaque reading planes keep body content clear, while a restrained edge or inset suggests depth. The decorative wall uses a four-rem module behind content. It supplies proportion and light without requiring square cards, grain over text or a new application layout.

The extension follows [[notes/repository-seams|the existing repository seams]]: UI keeps accessible primitives and state; Design Kit owns optional paint; products own content, grouping and actions. Plain HTML uses scoped material classes. Compiled primitives receive `lanternControlStyles` through their existing `controlXstyle` seam because a Button's outer class does not paint its semantic control. Background images supply the narrow edge without replacing the primitive's focus shadow. Selected paint supplies both fill and text colors so warm selection remains readable in either mode.

Material context belongs on each palette island, including the actual host of a portalled overlay. Chrome binds the existing TopBar paint tokens and has an opaque fallback. Reduced transparency and forced colors retain usable content and explicit state. These choices keep material decoration subordinate to focus, errors and unavailable actions.

The immutable CSS snapshot lets older consumers adopt native material hooks without changing their primitive dependency graph. Its finite inventory, source commit and byte checks establish local consistency; they do not authenticate a publisher or prove a consumer's rendered result. Package and consumer admission remain separate, and native gallery evidence must cover both standalone and compiled presentation before delivery claims are made.
