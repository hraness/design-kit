import { expect, test } from "bun:test";
import { parseHTML } from "linkedom";
import { renderToStaticMarkup } from "react-dom/server";
import { MarketingAccount, MarketingAccountActions } from "./marketing-account.js";

test("account access keeps authentication targets, analytics and recovery content", () => {
  const html = renderToStaticMarkup(<MarketingAccount id="join" summary="Sync across your devices.">
    <MarketingAccountActions primary={{ href: "/signup?next=sync", label: "Create account", analyticsEvent: "account", analyticsId: "signup" }} signIn={{ href: "/login?next=sync" }} />
    <form action="/recover"><label>Recovery email<input name="email" type="email" /></label><button type="submit">Recover access</button></form>
  </MarketingAccount>);
  const { document } = parseHTML(html);
  expect(document.querySelector("section")?.getAttribute("aria-labelledby")).toBe("join-heading");
  expect(document.querySelector("#join-heading")?.textContent).toBe("Your account");
  expect(document.querySelector(".hraness-marketing-account__primary")?.getAttribute("href")).toBe("/signup?next=sync");
  expect(document.querySelector(".hraness-marketing-account__primary")?.getAttribute("data-analytics-id")).toBe("signup");
  expect(document.querySelector(".hraness-marketing-account__sign-in")?.getAttribute("href")).toBe("/login?next=sync");
  expect(document.querySelector("form")?.getAttribute("action")).toBe("/recover");
  expect(html).not.toMatch(/<script|onclick=|style=/iu);
});

test("signed-in account action does not expose an unnecessary sign-in link", () => {
  const { document } = parseHTML(renderToStaticMarkup(<MarketingAccountActions primary={{ href: "/account", label: "Open account" }} />));
  expect(document.querySelectorAll("a")).toHaveLength(1);
  expect(document.querySelector("a")?.textContent).toBe("Open account");
});
