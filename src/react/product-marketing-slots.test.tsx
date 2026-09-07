import { expect, expectTypeOf, test } from "bun:test";
import assert from "node:assert/strict";
import type { ComponentProps, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { parseHTML } from "linkedom";
import * as stylex from "@stylexjs/stylex";
import * as api from "./product-marketing.js";
import * as server from "./server.js";
import type * as PublicReact from "@hraness/design-kit/react";
import type * as PublicServer from "@hraness/design-kit/react/server";
import { marketingClassName, marketingStyles } from "./product-marketing.stylex.js";

const hero = { eyebrow: "Release", heading: "An exact result", headingId: "hero", name: "Relay", summary: "A bounded tool.", boundary: "Local by default." };
const install = { eyebrow: "One command", heading: "Install", headingId: "install" };
const maker = { label: "Built by", heading: "An independent maker", headingId: "maker", links: [{ href: "/source", label: "Source" }, { href: "/about", label: "About" }] };

function required<T>(value: T | null | undefined): T {
  assert.ok(value !== null && value !== undefined, "Missing fixture value");
  return value;
}

test("body size replaces the base property identity rather than retaining competing font atoms", () => {
  const keys = Object.keys(marketingStyles.sectionLabelBody).filter((key) => key !== "$$css");
  expect(keys).toHaveLength(1);
  expect(Object.keys(marketingStyles.section__label)).toContain(required(keys[0]));
  const base = required(stylex.props(marketingStyles.section__label).className).split(" ");
  const override = required(stylex.props(marketingStyles.sectionLabelBody).className).split(" ");
  const composed = required(stylex.props(marketingStyles.section__label, marketingStyles.sectionLabelBody).className).split(" ");
  expect(override).toHaveLength(1);
  expect(base.filter((token) => !composed.includes(token))).toHaveLength(1);
  expect(composed.filter((token) => !base.includes(token))).toEqual(override);
  expect(composed).toHaveLength(base.length);
});

test("additive marketing seams are exported by both public React entries", () => {
  expectTypeOf<ComponentProps<typeof PublicReact.MarketingSectionLabel>>().toEqualTypeOf<ComponentProps<typeof PublicServer.MarketingSectionLabel>>();
  expectTypeOf<ComponentProps<typeof PublicReact.MarketingSectionLabel>["size"]>().toEqualTypeOf<"default" | "body" | undefined>();
  expectTypeOf<PublicReact.ProductHeroProps["notice"]>().toEqualTypeOf<ReactNode>();
  expectTypeOf<ComponentProps<typeof PublicServer.MarketingInstallPanel>["note"]>().toEqualTypeOf<ReactNode>();
  expectTypeOf<ComponentProps<typeof PublicReact.MarketingMaker>["linkClassName"]>().toEqualTypeOf<string | undefined>();
  expect(server.MarketingSectionLabel).toBe(api.MarketingSectionLabel);
});

test("omitted and empty notice or note preserve the complete original markup", () => {
  const plainHero = renderToStaticMarkup(<server.ProductHero {...hero} />);
  const plainInstall = renderToStaticMarkup(<server.MarketingInstallPanel {...install}><code>relay install</code></server.MarketingInstallPanel>);
  for (const empty of [undefined, null, false, ""] as const) {
    expect(renderToStaticMarkup(<server.ProductHero {...hero} notice={empty} />)).toBe(plainHero);
    expect(renderToStaticMarkup(<server.MarketingInstallPanel {...install} note={empty}><code>relay install</code></server.MarketingInstallPanel>)).toBe(plainInstall);
  }
});

test("hero notices preserve native elements immediately after the boundary inside the copy", () => {
  const html = renderToStaticMarkup(<server.ProductHero {...hero} notice={<><aside id="notice">A release prerequisite.</aside><p id="follow-up">Read the runbook.</p></>} frame={<pre>relay run</pre>} />);
  const { document } = parseHTML(html);
  const copy = required(document.querySelector(".hraness-marketing-hero__copy"));
  const notice = required(document.querySelector("#notice"));
  expect(notice.parentElement).toBe(copy);
  expect(notice.previousElementSibling?.classList.contains("hraness-marketing-hero__boundary")).toBe(true);
  expect(notice.nextElementSibling?.id).toBe("follow-up");
  expect(copy.lastElementChild?.id).toBe("follow-up");
  expect(copy.nextElementSibling?.classList.contains("hraness-marketing-hero__frame")).toBe(true);
  expect(document.querySelector("[style],style,script")).toBeNull();
  const { boundary, ...withoutBoundary } = hero;
  const absent = parseHTML(renderToStaticMarkup(<server.ProductHero {...withoutBoundary} notice={<aside id="notice">Visible without a boundary.</aside>} />)).document;
  expect(absent.querySelector("#notice")?.parentElement?.classList.contains("hraness-marketing-hero__copy")).toBe(true);
  expect(absent.querySelector(".hraness-marketing-hero__copy")?.textContent).not.toContain(boundary);
});

test("install notes stay after the heading and before the separate command group", () => {
  const html = renderToStaticMarkup(<server.MarketingInstallPanel {...install} note={<p id="note">Verify the digest first.</p>}><pre id="command">relay install</pre></server.MarketingInstallPanel>);
  const { document } = parseHTML(html);
  const note = required(document.querySelector("#note"));
  expect(note.parentElement?.classList.contains("hraness-marketing-install__heading-group")).toBe(true);
  expect(note.previousElementSibling?.id).toBe("install");
  expect(note.nextElementSibling).toBeNull();
  expect(note.parentElement?.nextElementSibling?.classList.contains("hraness-marketing-install__commands")).toBe(true);
  expect(document.querySelector("#command")?.parentElement).toBe(note.parentElement?.nextElementSibling);
  expect(document.querySelector("[style],style,script")).toBeNull();
});

test("listed maker link classes do not reach biography links or change destinations", () => {
  const bio = <p>A maker with <a href="/bio">an existing bio link</a>.</p>;
  const original = parseHTML(renderToStaticMarkup(<server.MarketingMaker {...maker}>{bio}</server.MarketingMaker>)).document;
  const updated = parseHTML(renderToStaticMarkup(<server.MarketingMaker {...maker} linkClassName="product-link">{bio}</server.MarketingMaker>)).document;
  const links = [...updated.querySelectorAll(".hraness-marketing-maker__links a")];
  expect(links.map((link) => [link.className, link.getAttribute("href"), link.textContent])).toEqual([
    ["product-link", "/source", "Source"], ["product-link", "/about", "About"],
  ]);
  expect(updated.querySelector('a[href="/bio"]')?.hasAttribute("class")).toBe(false);
  links.forEach((link) => link.removeAttribute("class"));
  expect(updated.toString()).toBe(original.toString());
});

test("section label omission is byte-identical to the existing native paragraph recipe", () => {
  const original = renderToStaticMarkup(<p className={marketingClassName("hraness-marketing-section__label")}>Reference</p>);
  expect(renderToStaticMarkup(<server.MarketingSectionLabel>Reference</server.MarketingSectionLabel>)).toBe(original);
  expect(renderToStaticMarkup(<server.MarketingSectionLabel size="default">Reference</server.MarketingSectionLabel>)).toBe(original);
  const section = parseHTML(renderToStaticMarkup(<server.MarketingSection label="Reference" heading="Commands" headingId="commands"><p>Body</p></server.MarketingSection>)).document;
  expect(section.querySelector(".hraness-marketing-section__label")?.outerHTML).toBe(original);
});

test("body labels compose one finite recipe with caller classes last and escaped text", () => {
  const html = renderToStaticMarkup(<server.MarketingSectionLabel className="caller-label" size="body">{'Reference <script>unsafe</script>'}</server.MarketingSectionLabel>);
  const { document } = parseHTML(html);
  const label = required(document.querySelector("p"));
  expect(label.getAttribute("data-size")).toBe("body");
  expect(label.className).toBe(marketingClassName("hraness-marketing-section__label", "caller-label", "body"));
  expect(label.className.split(" ").at(-1)).toBe("caller-label");
  expect(label.textContent).toBe("Reference <script>unsafe</script>");
  expect(document.querySelector("[style],style,script")).toBeNull();
  for (const size of ["large", "", null, 1, {}, []]) {
    expect(() => renderToStaticMarkup(<server.MarketingSectionLabel size={size as "body"}>Reference</server.MarketingSectionLabel>)).toThrow("Marketing label size");
  }
});
