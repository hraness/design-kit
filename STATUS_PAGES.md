# Status pages

Every Hraness site uses one page for missing addresses and recoverable errors. A reader who reaches it followed a link that promised something. The page gets them to that thing, or to the product's main action, in one step.

## What the page shows

| Slot | Write | Limit | Avoid |
| --- | --- | --- | --- |
| `title` | Keep the default ("We can’t find that page") unless the site's voice needs a different sentence. | 60 characters | Jokes, stock metaphors, and blame ("You broke it"). |
| `summary` | Keep the default ("The link may be out of date or mistyped."). | 160 characters | Apologies and explanations of HTTP. |
| `primaryAction` | The product's main next step: the same action as the homepage hero, such as "Start your library" or "Install xcb". Without it, the page offers "Go to {siteName}". | 48 characters | "Return home" when the product has a better action. |
| `next` | Up to three pages a new reader would want, each with a one-line `description`. Link the product page, the docs, and pricing or install. | Three links; description 90 characters | Sitemaps, `llms.txt`, legal pages, and links to other products. |
| `routes` | Known internal pages. They are never listed. The page compares them with the missing address and offers the closest one as "Did you mean …?". Pass the site's sitemap entries or its article index. | 2,000 | External URLs; they are ignored. |
| `agentIndexHref` | `/llms.txt` when the site serves one. It renders as one quiet line for AI agents. | | Using it for anything a person needs. |

The glyph ("404", or "!" for errors) is decorative. The browser enhancement draws it as dots that gather on load, move away from the pointer, scatter on a click or tap, and light up in the site's accent while they move. The animation stops once the dots settle, so an idle page does no work. Reduced motion shows the settled dots; forced colors and browsers without WebGL show the text glyph.

The Back link appears only when the reader came from another page on the same site.

## Next.js

```tsx
// app/not-found.tsx
import { RouteNotFoundPage } from "@hraness/design-kit/react";

export default function NotFound() {
  return (
    <RouteNotFoundPage
      siteName="Sponge"
      primaryAction={{ href: "/start", label: "Start your library" }}
      next={[
        { href: "/product", label: "How Sponge works", description: "Save pages; your agent reads and cites them." },
        { href: "/docs", label: "Docs", description: "Connect Claude, ChatGPT, or any MCP client." },
        { href: "/pricing", label: "Pricing", description: "Free to start." },
      ]}
      routes={knownPages}
      agentIndexHref="/llms.txt"
    />
  );
}
```

`RouteErrorPage` (for `app/error.tsx`) and `GlobalErrorDocument` (for `app/global-error.tsx`) render the same page with a Try again button. Pass `siteName` so the home action names the product.

Load `styles.css` or `compiler-foundation.css`, which include `status-page.css`, or import `@hraness/design-kit/status-page.css` directly. Keep the site header and footer around the page. Answer missing pages with HTTP status 404; a missing page that returns 200 is indexed as a real page.

## Static sites

```ts
import { renderStatusPageHtml } from "@hraness/design-kit";

const body = renderStatusPageHtml({ siteName: "Ghostget", primaryAction: { href: "/#install", label: "Install Ghostget" } });
// Write body into 404.html between the site header and footer.
```

```html
<script type="module">
  import { attachStatusPage } from "/assets/design-kit-browser.js";
  attachStatusPage(document.querySelector(".hraness-status-page"));
</script>
```

The markup is identical to `RouteNotFoundPage`'s, so the same stylesheet and browser enhancement apply. Render one status page per document; its next-links heading has a fixed id.

## Theming

The page follows the palette tokens. Override `--hraness-status-ink`, `--hraness-status-muted`, `--hraness-status-accent`, `--hraness-status-line`, `--hraness-status-radius`, or `--hraness-status-glyph-font` on `.hraness-status-page` when the site needs to. The glyph uses the site's heading face, so an editorial site gets serif dots.
