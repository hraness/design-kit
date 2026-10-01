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

function resolveTargets(header: Element, target: HTMLElement | undefined): readonly HTMLElement[] {
  if (target !== undefined) return [target];
  const targets = new Set<HTMLElement>([header.ownerDocument.documentElement]);
  for (let ancestor: Element | null = header; ancestor !== null; ancestor = ancestor.parentElement) {
    if (ancestor.matches(".hraness-marketing-page, [data-hraness-marketing-preset]")) targets.add(ancestor as HTMLElement);
  }
  return [...targets];
}

/** Border-box height of sticky marketing chrome, as a CSS length. */
export function measureStickyOffset(header: Element): string {
  return `${header.getBoundingClientRect().height}px`;
}

/** Publish on the document and enclosing page/preset scopes so local defaults cannot mask the measurement. */
export function publishStickyOffset(header: Element, target?: HTMLElement): string {
  const value = measureStickyOffset(header);
  for (const destination of resolveTargets(header, target)) destination.style.setProperty(stickyOffsetCustomProperty, value);
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
  const targets = resolveTargets(header, options.target);
  const prior = targets.map(target => ({ target, value: target.style.getPropertyValue(stickyOffsetCustomProperty), priority: typeof target.style.getPropertyPriority === "function" ? target.style.getPropertyPriority(stickyOffsetCustomProperty) : "" }));
  let published: string;
  const publish = () => {
    published = measureStickyOffset(header);
    for (const target of targets) target.style.setProperty(stickyOffsetCustomProperty, published);
  };
  const restore = () => {
    for (const { target, value, priority } of prior) {
      if (target.style.getPropertyValue(stickyOffsetCustomProperty) !== published
        || (typeof target.style.getPropertyPriority === "function" && target.style.getPropertyPriority(stickyOffsetCustomProperty) !== "")) continue;
      if (value) target.style.setProperty(stickyOffsetCustomProperty, value, priority);
      else target.style.removeProperty(stickyOffsetCustomProperty);
    }
  };
  publish();
  const view = document.defaultView;
  if (view === null || typeof view.ResizeObserver !== "function") {
    return restore;
  }
  const observer = new view.ResizeObserver(publish);
  observer.observe(header);
  return () => {
    observer.disconnect();
    restore();
  };
}
