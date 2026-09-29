import { expect, test } from "bun:test";
import { parseHTML } from "linkedom";
import { renderToStaticMarkup, renderToString } from "react-dom/server";

import { platformMark } from "../platforms";
import { PlatformBadges, PlatformIcon, PlatformInstall, type PlatformInstallTarget } from "./index";
import * as server from "./server";

const targets: readonly PlatformInstallTarget[] = [
  {
    id: "macos",
    command: "curl -fsSL https://example.test/install.sh | sh",
    shell: "Terminal",
    note: "Apple silicon",
    alternatives: [{ label: "Homebrew", command: "brew install relay" }],
  },
  { id: "linux", command: "curl -fsSL https://example.test/install.sh | sh", shell: "Terminal", note: "x86_64 and ARM64, glibc 2.34+" },
  { id: "windows", unavailable: true, unavailableNote: <p>Runs in WSL2.</p>, command: "wsl --install", shell: "PowerShell" },
];

function render(markup: string) {
  return parseHTML(`<!doctype html><html><body>${markup}</body></html>`).document;
}

test("the server render is deterministic and selects the first platform", () => {
  const first = renderToString(<PlatformInstall id="relay" platforms={targets} />);
  expect(renderToString(<PlatformInstall id="relay" platforms={targets} />)).toBe(first);
  const document = render(first);
  const root = document.querySelector("[data-hraness-platform-install]");
  expect(root?.getAttribute("data-selected-platform")).toBe("macos");
  expect(root?.getAttribute("data-selection-source")).toBe("default");
  expect(root?.classList.contains("hraness-platform-install")).toBe(true);
});

test("tabs and panels use complete tab semantics with a roving tab stop", () => {
  const document = render(renderToStaticMarkup(<PlatformInstall id="relay" label="Install on" platforms={targets} />));
  const tablist = document.querySelector('[role="tablist"]');
  expect(tablist?.getAttribute("aria-label")).toBe("Install on");
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  expect(tabs.map((tab) => tab.textContent)).toEqual(["macOS", "Linux", "Windows"]);
  expect(tabs.map((tab) => tab.getAttribute("aria-selected"))).toEqual(["true", "false", "false"]);
  expect(tabs.map((tab) => tab.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
  expect(tabs.every((tab) => tab.tagName === "BUTTON" && tab.getAttribute("type") === "button")).toBe(true);
  const panels = [...document.querySelectorAll('[role="tabpanel"]')];
  expect(panels).toHaveLength(3);
  panels.forEach((panel, index) => {
    const tab = tabs[index];
    expect(tab?.getAttribute("aria-controls")).toBe(panel.id);
    expect(panel.getAttribute("aria-labelledby")).toBe(tab?.id ?? null);
    expect(panel.hasAttribute("hidden")).toBe(index !== 0);
  });
  expect(tabs[2]?.getAttribute("data-availability")).toBe("unavailable");
  expect(panels[2]?.getAttribute("data-availability")).toBe("unavailable");
});

test("every command is in the markup, so each stays reachable without JavaScript", () => {
  const document = render(renderToStaticMarkup(<PlatformInstall platforms={targets} />));
  const commands = [...document.querySelectorAll("pre.hraness-platform-install__pre > code")].map((code) => code.textContent);
  expect(commands).toEqual([
    "curl -fsSL https://example.test/install.sh | sh",
    "brew install relay",
    "curl -fsSL https://example.test/install.sh | sh",
    "wsl --install",
  ]);
  const labels = [...document.querySelectorAll(".hraness-platform-install__panel-label")].map((label) => label.textContent);
  expect(labels).toEqual(["macOS", "Linux", "Windows"]);
  expect(document.querySelector('[data-platform="windows"] .hraness-platform-install__unavailable')?.textContent).toBe("Runs in WSL2.");
  expect(document.querySelectorAll("script")).toHaveLength(0);
  expect(document.querySelectorAll("[style]")).toHaveLength(0);
});

test("copy buttons name their command and a polite status region announces results", () => {
  const document = render(renderToStaticMarkup(<PlatformInstall platforms={targets} />));
  const buttons = [...document.querySelectorAll("button.hraness-platform-install__copy")];
  expect(buttons.map((button) => button.textContent)).toEqual([
    "Copy macOS install command",
    "Copy macOS Homebrew command",
    "Copy Linux install command",
    "Copy Windows install command",
  ]);
  const status = document.querySelector('[role="status"]');
  expect(status?.getAttribute("aria-live")).toBe("polite");
  expect(status?.textContent).toBe("");
  const shells = [...document.querySelectorAll(".hraness-platform-install__shell")].map((shell) => shell.textContent);
  expect(shells).toEqual(["Terminal", "Homebrew", "Terminal", "PowerShell"]);
  for (const pre of document.querySelectorAll("pre")) expect(pre.getAttribute("tabindex")).toBe("0");
});

test("defaultPlatform picks the server selection", () => {
  const document = render(renderToStaticMarkup(<PlatformInstall defaultPlatform="linux" platforms={targets} />));
  expect(document.querySelector('[aria-selected="true"]')?.textContent).toBe("Linux");
  expect(document.querySelector('[role="tabpanel"]:not([hidden])')?.getAttribute("data-platform")).toBe("linux");
});

test("platform icons are decorative monochrome marks unless labelled", () => {
  const document = render(renderToStaticMarkup(<PlatformInstall platforms={targets} />));
  for (const icon of document.querySelectorAll("svg.hraness-platform-icon")) {
    expect(icon.getAttribute("aria-hidden")).toBe("true");
    expect(icon.getAttribute("fill")).toBe("currentColor");
  }
  const labelled = render(renderToStaticMarkup(<PlatformIcon label="Windows" platform="windows" size="lg" />));
  const svg = labelled.querySelector("svg");
  expect(svg?.getAttribute("role")).toBe("img");
  expect(svg?.getAttribute("aria-label")).toBe("Windows");
  expect(svg?.getAttribute("aria-hidden")).toBeNull();
  const custom = render(renderToStaticMarkup(<PlatformIcon platform="freebsd" />));
  expect(custom.querySelector("svg")?.getAttribute("data-platform")).toBe("freebsd");
});

test("each platform mark is defined once per component and drawn by reference", () => {
  const markup = renderToStaticMarkup(<PlatformInstall id="relay" platforms={targets} />);
  for (const id of ["macos", "linux", "windows"] as const) {
    expect(markup.split(platformMark(id).path)).toHaveLength(2);
  }
  const document = render(markup);
  const symbols = [...document.querySelectorAll("svg.hraness-platform-install__marks symbol")];
  expect(symbols.map((symbol) => symbol.id)).toEqual(["relay-mark-macos", "relay-mark-linux", "relay-mark-windows"]);
  expect(document.querySelector("svg.hraness-platform-install__marks")?.getAttribute("aria-hidden")).toBe("true");
  const uses = [...document.querySelectorAll("svg.hraness-platform-icon use")].map((use) => use.getAttribute("href"));
  // One reference in each tab and one in each no-script panel label.
  expect(uses).toEqual(["#relay-mark-macos", "#relay-mark-linux", "#relay-mark-windows", "#relay-mark-macos", "#relay-mark-linux", "#relay-mark-windows"]);
  // The three marks weigh about 6 KB together. Drawing them in every tab and
  // panel label repeated them six times, about 30 KB more than this bound.
  const marks = targets.reduce((total, target) => total + platformMark(target.id).path.length, 0);
  expect(markup.length).toBeLessThan(marks + 16_000);
});

test("the Runs on row lists each platform with its icon and name", () => {
  const document = render(renderToStaticMarkup(
    <server.PlatformBadges platforms={["macos", { id: "linux", note: "x86_64" }, { id: "freebsd", label: "FreeBSD" }]} />,
  ));
  const list = document.querySelector("ul.hraness-platform-badges__list");
  expect(list?.getAttribute("aria-label")).toBe("Runs on");
  expect([...document.querySelectorAll("li")].map((item) => item.textContent)).toEqual(["macOS", "Linuxx86_64", "FreeBSD"]);
  expect(document.querySelectorAll("li svg[aria-hidden='true']")).toHaveLength(3);
  const unlabeled = render(renderToStaticMarkup(<PlatformBadges label={null} platforms={["windows"]} />));
  expect(unlabeled.querySelector(".hraness-platform-badges__label")).toBeNull();
  expect(unlabeled.querySelector("ul")?.getAttribute("aria-label")).toBe("Supported platforms");
});

test("the server entry exposes icons and badges but not the client install component", () => {
  expect(typeof server.PlatformIcon).toBe("function");
  expect(typeof server.PlatformBadges).toBe("function");
  expect("PlatformInstall" in server).toBe(false);
});

test("invalid platform lists fail before rendering", () => {
  const cases: readonly (readonly PlatformInstallTarget[])[] = [
    [],
    [{ id: "macos", command: "a" }, { id: "macos", command: "b" }],
    [{ id: "Mac OS", command: "a" }],
    [{ id: "freebsd", command: "pkg install relay" }],
    [{ id: "linux", command: "  " }],
    [{ id: "windows", unavailable: true, unavailableNote: "" }],
    [{ id: "linux", command: "a", alternatives: [{ label: "", command: "b" }] }],
  ];
  for (const platforms of cases) expect(() => renderToStaticMarkup(<PlatformInstall platforms={platforms} />)).toThrow(RangeError);
  expect(() => renderToStaticMarkup(<PlatformInstall defaultPlatform="windows" platforms={[{ id: "macos", command: "a" }]} />)).toThrow(RangeError);
  expect(() => renderToStaticMarkup(<PlatformBadges platforms={[]} />)).toThrow(RangeError);
  expect(() => renderToStaticMarkup(<PlatformBadges platforms={["macos", "macos"]} />)).toThrow(RangeError);
  expect(() => renderToStaticMarkup(<PlatformIcon platform="Mac" />)).toThrow(RangeError);
});
