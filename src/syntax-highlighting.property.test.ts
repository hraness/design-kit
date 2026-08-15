import { expect, test } from "bun:test";
import * as fc from "fast-check";
import { parseHTML } from "linkedom";

import {
  highlightCode,
  resolveSyntaxLanguage,
  syntaxLanguages,
} from "./syntax-highlighting";

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
