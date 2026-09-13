import { expect, test } from "bun:test";
import { parseHTML } from "linkedom";
import { readFile } from "node:fs/promises";
import { highlight, SugarHigh } from "sugar-high";

import {
  highlightCode,
  resolveSyntaxLanguage,
  type HighlightCodeOptions,
} from "./syntax-highlighting";

const sugarTokens = ["class", "comment", "entity", "identifier", "jsxliterals", "keyword", "property", "sign", "space", "string"] as const;

test("class-only syntax is opt-in and preserves default bytes and token/text structure", () => {
  const source = 'const answer = "<script> & quoted";\n// retained comment\n';
  const original = highlightCode(source, "typescript");
  expect(original.html).toBe(highlight(source));
  expect(highlightCode(source, "typescript", { styles: "inline" })).toEqual(original);
  const plain = highlightCode(source, "typescript", { styles: "classes" });
  const before = parseHTML(`<code>${original.html}</code>`).document;
  const after = parseHTML(`<code>${plain.html}</code>`).document;
  expect(after.querySelectorAll("[style]")).toHaveLength(0);
  expect(after.querySelector("script")).toBeNull();
  expect(after.querySelector("code")?.textContent).toBe(source);
  for (const node of before.querySelectorAll("[style]")) node.removeAttribute("style");
  expect(after.querySelector("code")?.outerHTML).toBe(before.querySelector("code")?.outerHTML);
  for (const styles of ["stylesheet", "", false, 1]) {
    expect(() => highlightCode(source, "typescript", { styles } as HighlightCodeOptions)).toThrow("Syntax styles");
  }
});

test("class-only admission accepts all fixed token styles and rejects new or mismatched styles", () => {
  const keyword = SugarHigh.TokenMap.get("keyword");
  if (keyword === undefined) throw new Error("Pinned highlighter lacks keyword token");
  const original = SugarHigh.TokenTypes[keyword];
  if (original === undefined) throw new Error("Pinned keyword token is missing");
  // Synchronous mutation of the dependency's public token table exercises its
  // real serializer. No await can expose this temporary fixture to other work.
  try {
    for (const token of sugarTokens) {
      SugarHigh.TokenTypes[keyword] = token;
      expect(highlightCode("const", "typescript", { styles: "classes" }).html)
        .toBe(`<span class="sh__line"><span class="sh__token--${token}">const</span></span>`);
    }
    SugarHigh.TokenTypes[keyword] = "unexpected";
    expect(() => highlightCode("const", "typescript", { styles: "classes" })).toThrow("Unrecognized inline style");
    let reads = 0;
    SugarHigh.TokenTypes[keyword] = {
      [Symbol.toPrimitive]() { return reads++ === 0 ? "keyword" : "string"; },
    } as unknown as string;
    expect(() => highlightCode("const", "typescript", { styles: "classes" })).toThrow("Unrecognized inline style");
  } finally {
    SugarHigh.TokenTypes[keyword] = original;
  }
  expect(highlightCode("const", "typescript").html).toBe(highlight("const"));
});

test("class token CSS retains semantic roles below native forced-color ownership", async () => {
  const css = await readFile(new URL("./syntax-highlighting.css", import.meta.url), "utf8");
  for (const token of sugarTokens) {
    expect(css).toContain(`.syntax-code :where(.sh__token--${token}) { color: var(--sh-${token}); }`);
  }
  expect(css).toContain(".syntax-code span {\n    color: CanvasText;\n    forced-color-adjust: auto;");
  expect(css.indexOf("@media (forced-colors: active)")).toBeGreaterThan(css.indexOf(".syntax-code :where(.sh__token--string)"));
});

test("foreign language names resolve into the closed supported set", () => {
  expect(resolveSyntaxLanguage("language-tsx extra")).toBe("typescript");
  expect(resolveSyntaxLanguage("bash")).toBe("shell");
  expect(resolveSyntaxLanguage("language-mdx")).toBe("markdown");
  expect(resolveSyntaxLanguage("jsonc title=config")).toBe("json");
  expect(resolveSyntaxLanguage("python")).toBe("text");
  expect(resolveSyntaxLanguage({ language: "typescript" })).toBe("text");
});

test("TypeScript, Markdown, and shell use language-aware server markup", () => {
  expect(highlightCode("const answer = 42;", "typescript").html).toContain(
    "var(--sh-keyword)",
  );
  expect(highlightCode("# Read `this`", "markdown").html).toContain(
    "syntax-token--heading",
  );
  expect(highlightCode("# Read `this`", "markdown").html).toContain(
    "syntax-token--inline",
  );
  expect(highlightCode("bun test --watch", "shell").html).toContain(
    "syntax-token--command",
  );
  expect(highlightCode("bun test --watch", "shell").html).toContain(
    "syntax-token--flag",
  );
});

test("Markdown block markers preserve whitespace, escapes, and line endings", () => {
  const marker = (value: string): string =>
    `<span class="syntax-token syntax-token--marker">${value}</span>`;
  const heading = (value: string): string =>
    `<span class="syntax-token syntax-token--heading">${value}</span>`;
  const inline = (value: string): string =>
    `<span class="syntax-token syntax-token--inline">${value}</span>`;
  const keyword = (value: string): string =>
    `<span class="syntax-token syntax-token--keyword">${value}</span>`;

  expect(highlightCode("\u2003````ts", "markdown").html).toBe(
    `\u2003${marker("````")}${keyword("ts")}`,
  );
  expect(highlightCode("\u00a0###\tRead `this`", "markdown").html).toBe(
    `\u00a0${marker("###")}\t${heading(`Read ${inline("`this`")}`)}`,
  );
  expect(highlightCode("\u2003+ \u202fitem", "markdown").html).toBe(
    `\u2003${marker("+")} \u202fitem`,
  );
  expect(highlightCode("000.\titem", "markdown").html).toBe(
    `${marker("000.")}\titem`,
  );
  for (const whitespace of [
    "\t",
    "\v",
    "\f",
    "\r",
    " ",
    "\u00a0",
    "\u1680",
    "\u2000",
    "\u200a",
    "\u2028",
    "\u2029",
    "\u202f",
    "\u205f",
    "\u3000",
    "\ufeff",
  ]) {
    expect(highlightCode(`${whitespace}#${whitespace}heading`, "markdown").html).toBe(
      `${whitespace}${marker("#")}${whitespace}${heading("heading")}`,
    );
  }
  expect(highlightCode("# &lt; \\`code\\`", "markdown").html).toBe(
    `${marker("#")} ${heading("&amp;lt; \\" + inline("`code\\`"))}`,
  );
  expect(highlightCode("# heading\n- item\n", "markdown").html).toBe(
    `${marker("#")} ${heading("heading")}\n${marker("-")} item\n`,
  );
  const nonemptyCrLf = "# heading\r\n- item\r\n";
  expect(highlightCode(nonemptyCrLf, "markdown").html).toBe(nonemptyCrLf);
  expect(highlightCode("# \r\n- \r\n", "markdown").html).toBe(
    `${marker("#")} \r${heading("")}\n${marker("-")} \r\n`,
  );
  expect(highlightCode("\r#\u2028heading", "markdown").html).toBe(
    `\r${marker("#")}\u2028${heading("heading")}`,
  );
  const nonemptyLineSeparator = "# heading\u2028";
  expect(highlightCode(nonemptyLineSeparator, "markdown").html).toBe(
    nonemptyLineSeparator,
  );
  expect(highlightCode("# \u2028", "markdown").html).toBe(
    `${marker("#")} \u2028${heading("")}`,
  );

  for (const source of [
    "####### title",
    "`` code",
    "-item",
    "123x. item",
    "\\# escaped",
    "\\- escaped",
    "\u0085# title",
    "\u180e# title",
    "\u200b# title",
    "\uff11. item",
    "١. item",
    "# body\u2028tail",
    "1. body\u2029tail",
    "```body\rtail",
  ]) {
    const highlighted = highlightCode(source, "markdown");
    const { document } = parseHTML(`<code>${highlighted.html}</code>`);
    expect(highlighted.html).not.toContain("syntax-token--marker");
    expect(document.querySelector("code")?.textContent).toBe(source);
  }
});

test("Markdown marker parsing handles adversarial ambiguous prefixes", () => {
  const spaces = " ".repeat(50_000);
  const longFence = "`".repeat(50_000);
  const longOrderedMarker = `${"9".repeat(50_000)}.`;
  expect(highlightCode(longFence, "markdown").html).toBe(
    `<span class="syntax-token syntax-token--marker">${longFence}</span>`
      + '<span class="syntax-token syntax-token--keyword"></span>',
  );
  expect(highlightCode(`${longOrderedMarker} item`, "markdown").html).toBe(
    `<span class="syntax-token syntax-token--marker">${longOrderedMarker}</span> item`,
  );
  const cases = [
    `${"`".repeat(50_000)}body\rtail`,
    `${"~".repeat(50_000)}body\u2028tail`,
    `#${spaces}body\u2028tail`,
    `1.${spaces}body\u2029tail`,
    `${"#".repeat(50_000)} title`,
    `${"9".repeat(50_000)}x. item`,
  ];

  for (const source of cases) {
    const highlighted = highlightCode(source, "markdown");
    const { document } = parseHTML(`<code>${highlighted.html}</code>`);
    expect(highlighted.html).not.toContain("syntax-token--marker");
    expect(document.querySelector("code")?.textContent).toBe(source);
  }
});

test("hostile plain text is escaped instead of becoming markup", () => {
  const source = '<script data-state="hostile">alert("x")</script>';
  const highlighted = highlightCode(source, "text");
  const { document } = parseHTML(`<code>${highlighted.html}</code>`);

  expect(document.querySelector("script")).toBeNull();
  expect(document.querySelector("code")?.textContent).toBe(source);
});

test("shell comments and command positions follow shell token boundaries", () => {
  const url = highlightCode("curl https://example.com/#section", "shell").html;
  const conditional = highlightCode(
    "if bun test; then echo yes; fi",
    "shell",
  ).html;

  expect(url).not.toContain("syntax-token--comment");
  expect(url).toContain("https://example.com/#section");
  expect(conditional.match(/syntax-token--command/gu)).toHaveLength(2);
});

test("syntax colors are semantic, theme-aware, and forced-color safe", async () => {
  const [stylesheet, plainSiteStylesheet] = await Promise.all([
    Bun.file(
      new URL("./syntax-highlighting.css", import.meta.url),
    ).text(),
    Bun.file(
      new URL("./plain-site.css", import.meta.url),
    ).text(),
  ]);

  expect(stylesheet).toContain("--syntax-keyword: var(--warning");
  expect(stylesheet).toContain("--syntax-string: var(--success");
  expect(stylesheet).toContain("--sh-keyword: var(--syntax-keyword)");
  expect(stylesheet).toContain("@media (forced-colors: active)");
  expect(stylesheet).toContain("color: CanvasText");
  expect(plainSiteStylesheet).toContain("--plain-syntax-keyword: #785f28");
  expect(plainSiteStylesheet).toContain("--plain-syntax-keyword: #c9ad74");
  expect(plainSiteStylesheet).toContain(".plain-site .syntax-code");
  expect(plainSiteStylesheet).toContain(
    "--syntax-keyword: var(--plain-syntax-keyword)",
  );
  expect(plainSiteStylesheet).toContain(
    "--syntax-string: var(--plain-syntax-string)",
  );
});
