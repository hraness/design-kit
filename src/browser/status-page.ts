import { parseStatusPageRoutes, suggestStatusRoute } from "../status-page.js";
import { attachFoil } from "./foil.js";
import { attachStatusField } from "./status-field.js";

export { attachStatusField, type StatusFieldOptions } from "./status-field.js";

type NavigationHistory = {
  readonly currentEntry?: { readonly index: number } | null;
  entries?: () => readonly { readonly url: string | null }[];
};

function parseUrl(value: string | null | undefined): URL | undefined {
  if (!value) return undefined;
  try { return new URL(value); } catch { return undefined; }
}

/**
 * The page the reader was on just before this one. The Navigation API sees
 * client-side route changes and lists only same-origin entries; without it,
 * the referrer covers full page loads.
 */
function previousPage(view: Window, document: Document): URL | undefined {
  const navigation = (view as Window & { navigation?: NavigationHistory }).navigation;
  const index = navigation?.currentEntry?.index;
  if (navigation?.entries !== undefined && typeof index === "number") {
    return index < 1 ? undefined : parseUrl(navigation.entries()[index - 1]?.url);
  }
  return view.history.length > 1 ? parseUrl(document.referrer) : undefined;
}

/**
 * Enhance one `.hraness-status-page` root: draw the glyph as a dot field,
 * offer the closest known page for a missing address, show Back only when the
 * reader arrived from another page on this site, and ease the primary action's
 * foil light. Everything works without it. Returns the cleanup function.
 */
export function attachStatusPage(root: HTMLElement): () => void {
  const document = root.ownerDocument;
  const view = document.defaultView;
  if (!view) return () => {};
  const cleanups: (() => void)[] = [];

  const hint = root.querySelector<HTMLElement>(".hraness-status-page__hint");
  const hintLink = hint?.querySelector<HTMLAnchorElement>("a");
  if (hint && hintLink && root.dataset.kind === "not-found") {
    const match = suggestStatusRoute(
      view.location.pathname,
      parseStatusPageRoutes(root.getAttribute("data-hraness-status-routes")),
    );
    if (match) {
      hintLink.href = match.href;
      hintLink.textContent = match.label;
      hint.hidden = false;
      root.dataset.hranessStatusSuggestion = match.href;
      cleanups.push(() => {
        hint.hidden = true;
        hintLink.setAttribute("href", "/");
        hintLink.textContent = "";
        delete root.dataset.hranessStatusSuggestion;
      });
    }
  }

  const back = root.querySelector<HTMLAnchorElement>(".hraness-status-page__back");
  if (back) {
    const previous = previousPage(view, document);
    if (previous && previous.origin === view.location.origin && previous.pathname !== view.location.pathname) {
      back.href = previous.href;
      back.hidden = false;
      const onBack = (event: MouseEvent) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        view.history.back();
      };
      back.addEventListener("click", onBack);
      cleanups.push(() => {
        back.removeEventListener("click", onBack);
        back.hidden = true;
        back.setAttribute("href", "/");
      });
    }
  }

  const code = root.querySelector<HTMLElement>(".hraness-status-page__code");
  if (code) {
    cleanups.push(attachStatusField(code, {
      onLive: (live) => {
        if (live) root.dataset.hranessStatusField = "live";
        else delete root.dataset.hranessStatusField;
      },
    }));
  }
  cleanups.push(attachFoil(root));

  return () => {
    for (const cleanup of cleanups.splice(0).reverse()) cleanup();
  };
}
