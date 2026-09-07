import { expect, test } from "bun:test";
import * as fc from "fast-check";
import { parseHTML } from "linkedom";

import {
  highlightCode,
  resolveSyntaxLanguage,
  syntaxLanguages,
} from "./syntax-highlighting";

const markdownWhitespace = fc.constantFrom(
  " ",
  "\t",
  "\v",
  "\f",
  "\r",
  "\u00a0",
  "\u1680",
  "\u2003",
  "\u2028",
  "\u2029",
  "\u202f",
  "\u205f",
  "\u3000",
  "\ufeff",
);

const markdownIndentation = fc.array(markdownWhitespace, { maxLength: 12 })
  .map((characters) => characters.join(""));
const markdownSeparator = fc.array(markdownWhitespace, { minLength: 1, maxLength: 12 })
  .map((characters) => characters.join(""));
const markdownBody = fc.oneof(
  fc.constant(""),
  fc.tuple(
    fc.constantFrom("a", "Z", "0", "#", "-", "_", "<", ">", "&", "\\"),
    fc.array(
      fc.constantFrom("a", "Z", "0", "#", "-", "_", "<", ">", "&", "\\", " ", "\t", "\u00a0"),
      { maxLength: 40 },
    ),
  ).map(([first, rest]) => first + rest.join("")),
);
const markdownHeadingMarker = fc.integer({ min: 1, max: 6 })
  .map((length) => "#".repeat(length));
const markdownListMarker = fc.oneof(
  fc.constantFrom("-", "*", "+"),
  fc.integer({ min: 0, max: 999_999 }).map((value) => `${String(value)}.`),
);
const markdownFenceMarker = fc.tuple(
  fc.constantFrom("`", "~"),
  fc.integer({ min: 3, max: 24 }),
).map(([marker, length]) => marker.repeat(length));
const markdownFenceContent = fc.array(
  fc.constantFrom("a", "Z", "0", "#", "-", "_", "<", ">", "&", "\\", " ", "\t", "\u00a0"),
  { maxLength: 40 },
).map((characters) => characters.join(""));

function escapeExpectedHtml(value: string): string {
  return value.replace(/[&<>"']/gu, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

function expectedMarker(value: string): string {
  return `<span class="syntax-token syntax-token--marker">${escapeExpectedHtml(value)}</span>`;
}

function expectedHeading(value: string): string {
  return `<span class="syntax-token syntax-token--heading">${escapeExpectedHtml(value)}</span>`;
}

function expectedKeyword(value: string): string {
  return `<span class="syntax-token syntax-token--keyword">${escapeExpectedHtml(value)}</span>`;
}

test("property: highlighted markup preserves the exact source text", () => {
  fc.assert(fc.property(
    fc.string({ maxLength: 1_000 }),
    fc.constantFrom(...syntaxLanguages),
    (source, language) => {
      const highlighted = highlightCode(source, language);
      const { document } = parseHTML(`<code>${highlighted.html}</code>`);

      expect(document.querySelector("code")?.textContent).toBe(source);
      expect(document.querySelector("script")).toBeNull();
    },
  ));
});

test("property: every foreign language label resolves to a supported language", () => {
  fc.assert(fc.property(fc.anything(), (input) => {
    expect(syntaxLanguages).toContain(resolveSyntaxLanguage(input));
  }));
});

test("property: Markdown heading and list token boundaries match the legacy grammar", () => {
  fc.assert(fc.property(
    markdownIndentation,
    markdownSeparator,
    markdownBody,
    fc.oneof(
      markdownHeadingMarker.map((marker) => ({ kind: "heading" as const, marker })),
      markdownListMarker.map((marker) => ({ kind: "list" as const, marker })),
    ),
    (indentation, separator, body, { kind, marker }) => {
      const source = indentation + marker + separator + body;
      const expected = escapeExpectedHtml(indentation)
        + expectedMarker(marker)
        + escapeExpectedHtml(separator)
        + (kind === "heading" ? expectedHeading(body) : escapeExpectedHtml(body));

      expect(highlightCode(source, "markdown").html).toBe(expected);
    },
  ));
});

test("property: Markdown fence token boundaries match the legacy grammar", () => {
  fc.assert(fc.property(
    markdownIndentation,
    markdownFenceMarker,
    markdownFenceContent,
    (indentation, marker, content) => {
      expect(highlightCode(indentation + marker + content, "markdown").html).toBe(
        escapeExpectedHtml(indentation) + expectedMarker(marker) + expectedKeyword(content),
      );
    },
  ));
});

test("property: Markdown rejects line terminators after nonempty content", () => {
  fc.assert(fc.property(
    markdownIndentation,
    markdownSeparator,
    markdownBody.filter((body) => body.length > 0),
    fc.oneof(
      markdownHeadingMarker.map((marker) => ({ kind: "heading" as const, marker })),
      markdownListMarker.map((marker) => ({ kind: "list" as const, marker })),
    ),
    fc.constantFrom("\r", "\u2028", "\u2029"),
    (indentation, separator, body, { marker }, lineSeparator) => {
      const terminal = indentation + marker + separator + body + lineSeparator;
      expect(highlightCode(terminal, "markdown").html).toBe(
        escapeExpectedHtml(terminal),
      );

      const nonterminal = terminal + "tail";
      expect(highlightCode(nonterminal, "markdown").html).toBe(
        escapeExpectedHtml(nonterminal),
      );
    },
  ));
});
