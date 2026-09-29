/**
 * Code-built mockups: neutral browser, terminal, phone, desktop, chat, feed,
 * inbox, and article frames for product pages, launch posts, and films.
 *
 * Server-safe plain React with one stylesheet, `@hraness/design-kit/mockups.css`.
 * Nothing here uses StyleX, React Aria, hooks, or a client boundary, so a
 * film build can render it with `renderToStaticMarkup` under plain Bun.
 * Interactive shells live in `@hraness/design-kit/mockups/client`.
 */
// `export *` rather than named re-exports: Bun 1.3 emitted named re-exports
// from these side-effect-free modules with no bindings.
export * from "./core.js";
export * from "./frames.js";
export * from "./surfaces.js";
