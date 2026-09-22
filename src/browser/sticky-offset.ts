export const stickyOffsetCustomProperty = "--hraness-sticky-offset";

export const stickyOffsetHeaderSelector = [
  ".hraness-marketing-header:not([data-position='static'])",
  ".hraness-marketing-header-surface:not([data-position='static'])",
].join(", ");

export interface StickyOffsetSyncOptions {
  readonly header?: Element | string;
  readonly root?: ParentNode;
  readonly target?: HTMLElement;
}

function canQuery(root: ParentNode): boolean {
  return typeof (root as { querySelector?: unknown }).querySelector === "function";
}

function ownerDocumentOf(node: ParentNode | undefined): Document | undefined {
  if (node === undefined) return globalThis.document;
  if (node.nodeType === 9) return node as Document;
  const owner = (node as { ownerDocument?: Document | null }).ownerDocument;
  return owner ?? undefined;
}

function resolveHeader(
  root: ParentNode,
  header: Element | string | undefined,
): Element | null {
  if (typeof header === "object") return header;
  if (!canQuery(root)) return null;
  if (typeof header === "string") return root.querySelector(header);
  return root.querySelector(stickyOffsetHeaderSelector);
}

function resolveTarget(header: Element, target: HTMLElement | undefined): HTMLElement {
  if (target !== undefined) return target;
  const page = header.closest<HTMLElement>(".hraness-marketing-page");
  return page ?? header.ownerDocument.documentElement;
}

/** Border-box height of sticky marketing chrome, as a CSS length. */
export function measureStickyOffset(header: Element): string {
  return `${header.getBoundingClientRect().height}px`;
}

/** Write --hraness-sticky-offset onto the page or document so siblings inherit it. */
export function publishStickyOffset(header: Element, target?: HTMLElement): string {
  const value = measureStickyOffset(header);
  resolveTarget(header, target).style.setProperty(stickyOffsetCustomProperty, value);
  return value;
}

/**
 * Keep --hraness-sticky-offset equal to the live header border box. Safe when
 * ResizeObserver is missing: publishes once. Does not run on import.
 */
export function syncStickyOffset(options: StickyOffsetSyncOptions = {}): () => void {
  const document = typeof options.header === "object"
    ? options.header.ownerDocument
    : ownerDocumentOf(options.root);
  if (document === undefined) return () => {};
  const root = options.root ?? document;
  const header = resolveHeader(root, options.header);
  if (header === null) return () => {};
  const target = resolveTarget(header, options.target);
  const publish = () => {
    publishStickyOffset(header, target);
  };
  publish();
  const view = document.defaultView;
  if (view === null || typeof view.ResizeObserver !== "function") {
    return () => {
      target.style.removeProperty(stickyOffsetCustomProperty);
    };
  }
  const observer = new view.ResizeObserver(publish);
  observer.observe(header);
  return () => {
    observer.disconnect();
    target.style.removeProperty(stickyOffsetCustomProperty);
  };
}
