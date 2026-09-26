import { expect, test } from "bun:test";
import fc from "fast-check";

import {
  normalizeStatusPath,
  parseStatusPageRoutes,
  statusPageRoutesAttribute,
  suggestStatusRoute,
  type StatusPageLink,
} from "./status-page.js";

const segment = fc.stringMatching(/^[a-z0-9][a-z0-9-]{1,14}$/u);
const path = fc.array(segment, { minLength: 1, maxLength: 4 }).map((parts) => `/${parts.join("/")}`);
const route = fc.record({ href: path, label: fc.string({ minLength: 1, maxLength: 20 }).filter((label) => label.trim() !== "") });
const routeList = fc.uniqueArray(route, { maxLength: 30, selector: (item) => normalizeStatusPath(item.href) });

test("a suggestion is always one of the supplied routes and never home", () => {
  fc.assert(fc.property(fc.string({ maxLength: 60 }), routeList, (missing, routes) => {
    const suggestion = suggestStatusRoute(missing, [{ href: "/", label: "Home" }, ...routes]);
    if (suggestion === undefined) return;
    expect(routes).toContain(suggestion);
    expect(normalizeStatusPath(suggestion.href)).not.toBe("/");
  }));
});

test("route order never changes the suggestion", () => {
  fc.assert(fc.property(path, routeList, fc.nat(), (missing, routes, seed) => {
    const shuffled = [...routes].sort((a, b) => ((a.href.length * 31 + seed) % 7) - ((b.href.length * 31 + seed) % 7) || a.href.localeCompare(b.href));
    expect(suggestStatusRoute(missing, shuffled)?.href).toBe(suggestStatusRoute(missing, routes)?.href);
  }));
});

test("an address that matches a route up to case and trailing slash suggests that route", () => {
  fc.assert(fc.property(routeList.filter((routes) => routes.length > 0), fc.nat(), (routes, pick) => {
    const target = routes[pick % routes.length] as StatusPageLink;
    expect(suggestStatusRoute(`${target.href.toUpperCase()}/`, routes)).toBe(target);
  }));
});

const wordyPath = fc.array(fc.stringMatching(/^[a-z]{5,10}$/u), { minLength: 1, maxLength: 3 })
  .map((parts) => `/${parts.join("/")}`);

test("one dropped letter still finds its page when it is the only candidate", () => {
  fc.assert(fc.property(wordyPath, fc.nat(), (target, at) => {
    const letters = [...target].flatMap((character, index) => character === "/" ? [] : [index]);
    const index = letters[at % letters.length] ?? 1;
    const typo = target.slice(0, index) + target.slice(index + 1);
    expect(suggestStatusRoute(typo, [{ href: target, label: "Target" }])?.href).toBe(target);
  }));
});

test("a different short word in the same slug template is never offered", () => {
  fc.assert(fc.property(fc.stringMatching(/^[a-z0-9]{1,3}$/u), fc.stringMatching(/^[a-z0-9]{1,3}$/u), (first, second) => {
    fc.pre(first !== second);
    const route = { href: `/writing/how-${second}-uses-claude`, label: "Other" };
    expect(suggestStatusRoute(`/writing/how-${first}-uses-claude`, [route])).toBeUndefined();
  }));
});

test("route data round-trips through the markup attribute", () => {
  fc.assert(fc.property(routeList, (routes) => {
    const attribute = statusPageRoutesAttribute(routes);
    expect(parseStatusPageRoutes(attribute)).toEqual(routes.map(({ href, label }) => ({ href, label })));
  }));
});
