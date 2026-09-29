import { expect, test } from "bun:test";
import { codeLexerLanguages, highlightCodeLexer, type CodeLexerLanguage } from "./syntax-code-lexers";

/** Strip only the lexer's fixed markup, then decode each entity once. */
function textOf(html: string): string {
  const escaped = html.replace(/<span class="syntax-token syntax-token--[a-z]+">|<\/span>/gu, "");
  expect(escaped).not.toMatch(/[<>]/u);
  return escaped.replace(/&(?:amp|lt|gt|quot|#39);/gu, (entity) => {
    switch (entity) {
      case "&amp;": return "&";
      case "&lt;": return "<";
      case "&gt;": return ">";
      case "&quot;": return '"';
      case "&#39;": return "'";
      default: return entity;
    }
  });
}

function assertRoundTrip(source: string, language: CodeLexerLanguage): string {
  const html = highlightCodeLexer(source, language);
  expect(html).not.toMatch(/<[^>]*\s(?:style|on[a-z]+)=/u);
  expect(textOf(html)).toBe(source);
  return html;
}

test("Rust highlights the Oh closure and Gobstopper proof without changing code", () => {
  const source = "// Order keys by UTF-16 code units.\r\nkeys.sort_by(|a, b| a.encode_utf16().cmp(b.encode_utf16()));\n"
    + "#[kani::proof]\npub fn plan_bounds(edits: usize) -> bool { edits < 65 && edits != 0 }\n"
    + "assert_eq!(0..=12, 0..=12);\nlet r#type = 100_000u64;";
  const html = assertRoundTrip(source, "rust");
  for (const [role, value] of [["function", "sort_by"], ["keyword", "fn"], ["type", "usize"], ["number", "100_000u64"], ["variable", "r#type"]]) {
    expect(html).toContain(`syntax-token--${role}">${value}</span>`);
  }
  expect(html).toContain('syntax-token--number">0</span><span class="syntax-token syntax-token--operator">.</span>');
});

test("Rust separates lifetimes, character literals, raw strings, and nested comments", () => {
  const source = "fn borrow<'a>(v: &'a str) -> &'a str { v }\n"
    + "let c = '\\u{1F600}'; let b = b'\\x3c'; let apostrophe = '\\'';\n"
    + 'let s = br##"<script>\\n"# // still the string\n"##;\n'
    + '/* outer /* nested */ <img onerror="bad"> */ let done = true;\n'
    + 'let quote = "escaped \\"; // comment';
  const html = assertRoundTrip(source, "rust");
  expect(html).toContain('syntax-token--variable">&#39;a</span>');
  expect(html).toContain('syntax-token--string">br##&quot;&lt;script&gt;\\n&quot;# // still the string\n&quot;##</span>');
  expect(html).toContain('syntax-token--comment">/* outer /* nested */ &lt;img onerror=&quot;bad&quot;&gt; */</span>');
  expect(html).toContain('syntax-token--keyword">let</span> done');
});

test("Unicode names stay whole beside numbers, lifetimes, and proof operators", () => {
  const rust = "fn café() {} fn borrow<'寿命>(matché: &'寿命 str) { 1.Δ(); r#类型(); 𝒇(); }";
  const html = assertRoundTrip(rust, "rust");
  expect(html).toContain('syntax-token--function">café</span>');
  expect(html).toContain('syntax-token--variable">&#39;寿命</span>');
  expect(html).not.toContain('syntax-token--keyword">match</span>');
  expect(html).toContain('syntax-token--number">1</span><span class="syntax-token syntax-token--operator">.</span>');
  expect(html).toContain('syntax-token--function">Δ</span>');
  expect(html).toContain('syntax-token--variable">r#类型</span>');
  expect(html).toContain('syntax-token--function">𝒇</span>');
  const lean = assertRoundTrip("theorem égalité : ∀ n : ℕ, n≤n := by simp", "lean");
  expect(lean).toContain('syntax-token--operator">∀</span>');
  expect(lean).toContain('syntax-token--operator">≤</span>');
});

test("TOML handles quoted and dotted keys, tables, dates, arrays, and multiline values", () => {
  const source = '[sessions."01a08d7c-…"] # per-session override\r\n'
    + 'strategy = "structured"\ntrigger_tokens = 120_000\nadaptive = true\n'
    + 'at = 2026-09-28T17:00:00Z\npoints = [1, 2.5, -inf]\n'
    + 'inline = { "quoted key" = "# text", nested = { enabled = false } }\n'
    + 'message = """A <tag>\n# still text\nEscaped \\"""; still text\n"""\n'
    + "literal = '''C:\\users\\notes\n# literal'''\n[[products]]\nname = 'one'";
  const html = assertRoundTrip(source, "toml");
  expect(html).toContain('syntax-token--property">trigger_tokens</span>');
  expect(html).toContain('syntax-token--number">120_000</span>');
  expect(html).toContain('syntax-token--keyword">true</span>');
  expect(html).toContain('syntax-token--number">2026-09-28T17:00:00Z</span>');
  expect(html).toContain('# still text\nEscaped');
  expect(html).toContain('syntax-token--property">products</span>');
});

test("YAML keeps folded/literal bodies, quoted comments, and URLs intact", () => {
  const source = '---\r\ntitle: "Decision: <keep> # note"\r\n'
    + '"quoted key": true\nurl: https://example.com/a#fragment\n'
    + 'anchor: &ref value\ncopy: *ref\narray: [false, null, 1.5]\n'
    + 'body: |2- # literal\n  <script>\n  # string, not comment\n\n'
    + 'next: >+\n  folded text\n  more text\nlast: 4\n...\n';
  const html = assertRoundTrip(source, "yaml");
  expect(html).toContain('syntax-token--property">&quot;quoted key&quot;</span>');
  expect(html).toContain('syntax-token--keyword">true</span>');
  expect(html).toContain('https://example.com/a#fragment');
  expect(html).toContain('syntax-token--variable">&amp;ref</span>');
  expect(html).toContain('syntax-token--string">\n  &lt;script&gt;\n  # string, not comment\n</span>');
  expect(html).toContain('syntax-token--property">last</span>');
  expect(html).toContain('syntax-token--number">4</span>');
});

test("Lean and TLA+ highlight real proof/model forms and nested comments", () => {
  const lean = '-- Masking twice\ntheorem idempotence (selected : List Nat) :\n'
    + '  mask selected (mask selected records) = mask selected records\n'
    + '/- outer /- inner -/ still comment -/\n'
    + 'def «<& quoted name>» := fun x => x\nexample : ∀ n : Nat, n = n := by simp';
  const leanHtml = assertRoundTrip(lean, "lean");
  expect(leanHtml).toContain('syntax-token--keyword">theorem</span>');
  expect(leanHtml).toContain('syntax-token--comment">/- outer /- inner -/ still comment -/</span>');
  expect(leanHtml).toContain('syntax-token--variable">«&lt;&amp; quoted name&gt;»</span>');
  const tla = '---- MODULE Vault ----\n\\* retained source\n'
    + 'DataValid(s) == s \\in manifests /\\ Parts(s) \\subseteq objects\n'
    + 'IndexedData == \\A s \\in index : DataValid(s)\n'
    + '(* outer (* nested *) comment *)\nNext == IF ready THEN UNCHANGED state ELSE FALSE\n====';
  const tlaHtml = assertRoundTrip(tla, "tla");
  expect(tlaHtml).toContain('syntax-token--keyword">\\subseteq</span>');
  expect(tlaHtml).toContain('syntax-token--keyword">UNCHANGED</span>');
  expect(tlaHtml).toContain('syntax-token--comment">(* outer (* nested *) comment *)</span>');
});

test("all language lexers escape injection and preserve arbitrary code-unit sequences", () => {
  let state = 0x5eed;
  const next = (): number => { state = Math.imul(state, 1664525) + 1013904223 | 0; return state >>> 0; };
  const alphabet = ['<', '>', '&', '"', "'", '\\', '\n', '\r', '\t', '#', '/', '*', '-', ':', '{', '}', '[', ']', '|', '>', '😀', '\ud800', '\0', 'a', 'z', '0', '9', ' ', '∀', 'é'];
  for (const language of codeLexerLanguages) {
    assertRoundTrip('<img src=x onerror="alert(1)"> &lt; </code><script>bad()</script>', language);
    for (let index = 0; index < 120; index += 1) {
      const source = Array.from({ length: next() % 200 }, () => alphabet[next() % alphabet.length] ?? "").join("");
      assertRoundTrip(source, language);
    }
  }
});

test("unterminated strings/comments and long hostile input finish without losing bytes", () => {
  const start = performance.now();
  for (const language of codeLexerLanguages) {
    for (const source of ['"<bad>\\', "'unterminated", "/* ".repeat(10_000), "/- ".repeat(10_000), "(* ".repeat(10_000), 'r' + '#'.repeat(100_000), '|,'.repeat(30_000), 'x: |\n  '.repeat(8_000)]) {
      assertRoundTrip(source, language);
    }
  }
  expect(performance.now() - start).toBeLessThan(4000);
});
