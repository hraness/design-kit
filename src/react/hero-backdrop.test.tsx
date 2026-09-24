import { expect, test } from "bun:test";
import { parseHTML } from "linkedom";
import { renderToStaticMarkup } from "react-dom/server";
import { ProductHero } from "./product-marketing.js";
import { HeroBackdrop } from "./hero-backdrop.js";

const content = { heading: "A place for your ideas", headingId: "ideas", name: "Notes", summary: "Keep the context behind your work." };

test("the isolated client entry emits inert SSR and stable raw stylesheet hooks", () => {
  const { document } = parseHTML(renderToStaticMarkup(<HeroBackdrop seed="notes" />));
  const field = document.querySelector(".hraness-marketing-hero-backdrop[inert][aria-hidden=true]");
  expect(field).not.toBeNull();
  expect(field?.querySelector(".hraness-marketing-hero-backdrop__atmosphere[data-variation]")).not.toBeNull();
  expect(field?.querySelector(".hraness-marketing-hero-backdrop__light")).not.toBeNull();
  expect(document.querySelector("[style],style,script")).toBeNull();
});

test("marketing heroes have deterministic inert artwork without inline styles or hidden copy", () => {
  const html = renderToStaticMarkup(<ProductHero {...content} actions={[{ href: "/docs", label: "Read docs" }]} />);
  expect(renderToStaticMarkup(<ProductHero {...content} actions={[{ href: "/docs", label: "Read docs" }]} />)).toBe(html);
  const { document } = parseHTML(html);
  const field = document.querySelector("[data-hraness-hero-backdrop]");
  if (!field) throw new Error("Hero backdrop missing");
  expect(field.getAttribute("aria-hidden")).toBe("true");
  expect(field.hasAttribute("inert")).toBe(true);
  expect(field.querySelector("h1, a, button")).toBeNull();
  expect(document.querySelector("h1")?.textContent).toBe(content.heading);
  expect(document.querySelector('a[href="/docs"]')?.textContent).toBe("Read docs");
  expect(document.querySelector("[style],style,script")).toBeNull();
});

test("product artwork and explicit quiet heroes use the same semantic composition", () => {
  const custom = parseHTML(renderToStaticMarkup(<ProductHero {...content} backdrop={<svg data-product-art="notes" />} />)).document;
  expect(custom.querySelector("[data-hraness-hero-backdrop] [data-product-art]")).not.toBeNull();
  const quiet = parseHTML(renderToStaticMarkup(<ProductHero {...content} backdrop={false} />)).document;
  expect(quiet.querySelector("[data-hraness-hero-backdrop]")).toBeNull();
  expect(quiet.querySelector("h1")?.textContent).toBe(content.heading);
});
