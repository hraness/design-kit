import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { escapeArticleHtml, renderArticleRelatedHtml, type ArticleRelatedLink } from "../index.js";
import { portfolioProductIds, relatedFor } from "../portfolio.js";
import { MarketingRelated, type MarketingRelatedProduct } from "./product-marketing.js";
import { ArticleRelatedProducts } from "./server.js";

// The portfolio subpath stays data-only; this test proves its items fit the
// related-product components without either side importing the other.
test("relatedFor() items render their mark, name, and role through ArticleRelatedProducts, MarketingRelated, and the static renderer", () => {
  const id = portfolioProductIds.find((candidate) => relatedFor(candidate).length > 0);
  expect(id).toBeDefined();
  if (id === undefined) return;
  const items = relatedFor(id);
  const reactItems: readonly MarketingRelatedProduct[] = items;
  const staticItems: readonly ArticleRelatedLink[] = items;

  const article = renderToStaticMarkup(<ArticleRelatedProducts items={reactItems} />);
  const marketing = renderToStaticMarkup(<MarketingRelated heading="Related" headingId="related" items={reactItems} />);
  const html = renderArticleRelatedHtml({ items: staticItems });
  for (const item of items) {
    for (const markup of [article, marketing, html]) {
      expect(markup).toContain(`href="${escapeArticleHtml(item.href)}"`);
      expect(markup).toContain(escapeArticleHtml(item.name));
      expect(markup).toContain(escapeArticleHtml(item.role));
      expect(markup).toContain(`src="${escapeArticleHtml(item.mark)}"`);
      expect(markup).not.toContain(escapeArticleHtml(item.relationship));
    }
  }
});
