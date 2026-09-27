import { expect, test } from "bun:test";
import { parseHTML } from "linkedom";
import { renderToStaticMarkup } from "react-dom/server";
import { ProductHero } from "./product-marketing.js";
import { HeroBackdrop } from "./hero-backdrop.js";

const content = { heading: "A place for your ideas", headingId: "ideas", name: "Notes", summary: "Keep the context behind your work." };

test("the retired HeroBackdrop client entry renders nothing, with or without artwork", () => {
  expect(renderToStaticMarkup(<HeroBackdrop seed="notes" />)).toBe("");
  expect(renderToStaticMarkup(<HeroBackdrop seed="notes"><svg data-product-art="notes" data-hraness-hero-item="" /></HeroBackdrop>)).toBe("");
});

test("marketing heroes render no decorative backdrop, light field, or artwork", () => {
  const plain = renderToStaticMarkup(<ProductHero {...content} actions={[{ href: "/docs", label: "Read docs" }]} />);
  const variants = [
    renderToStaticMarkup(<ProductHero {...content} actions={[{ href: "/docs", label: "Read docs" }]} backdrop={false} />),
    renderToStaticMarkup(<ProductHero {...content} actions={[{ href: "/docs", label: "Read docs" }]} backdrop={<svg data-product-art="notes" data-hraness-hero-item="" />} />),
  ];
  // The deprecated prop is accepted for compatibility and changes nothing.
  for (const html of variants) expect(html).toBe(plain);
  const { document } = parseHTML(plain);
  expect(document.querySelector("[data-hraness-hero-backdrop], .hraness-marketing-hero-backdrop, [data-product-art], [data-hraness-hero-item], [inert]")).toBeNull();
  expect(document.querySelector("h1")?.textContent).toBe(content.heading);
  expect(document.querySelector('a[href="/docs"]')?.textContent).toBe("Read docs");
  expect(document.querySelector("[style],style,script")).toBeNull();
});
