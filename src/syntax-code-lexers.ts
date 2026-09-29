import { escapeHtml, token, type SyntaxToken } from "./syntax-tokens.js";

export const codeLexerLanguages = ["rust", "toml", "yaml", "lean", "tla"] as const;
export type CodeLexerLanguage = (typeof codeLexerLanguages)[number];

const rustKeywords = new Set("as async await break const continue crate dyn else enum extern false fn for if impl in let loop match mod move mut pub ref return self Self static struct super trait true type unsafe use where while union yield".split(" "));
const rustTypes = new Set("bool char str usize isize u8 u16 u32 u64 u128 i8 i16 i32 i64 i128 f32 f64".split(" "));
const leanKeywords = new Set("abbrev axiom by case class deriving do else end example exists export false for forall fun have if import in inductive instance let match namespace noncomputable opaque open partial private protected public return section simp simpa structure termination_by theorem then true universe variable where with def".split(" "));
const tlaKeywords = new Set("ACTION ASSUME ASSUMPTION AXIOM BOOLEAN BY CASE CHOOSE CONSTANT CONSTANTS COROLLARY DEF DEFINE DEFS DOMAIN ELSE ENABLED EXCEPT EXTENDS FALSE HAVE HIDE IF IN INSTANCE LAMBDA LEMMA LET LOCAL MODULE NEW OBVIOUS OMITTED ONLY OTHER PICK PROOF PROPOSITION PROVE QED RECURSIVE STATE SUBSET SUFFICES TAKE TEMPORAL THEOREM THEN TRUE UNCHANGED UNION USE VARIABLE VARIABLES WITH WITNESS".split(" "));

/** Sticky matches consume only at the current cursor; no substring rescanning. */
function matchAt(pattern: RegExp, source: string, cursor: number): string {
  pattern.lastIndex = cursor;
  return pattern.exec(source)?.[0] ?? "";
}

function lineEnd(source: string, start: number): number {
  let cursor = start;
  while (cursor < source.length && source[cursor] !== "\n" && source[cursor] !== "\r") cursor += 1;
  return cursor;
}

/** Rust, Lean and TLA+ all permit nested block comments. */
function blockCommentEnd(source: string, start: number, open: string, close: string): number {
  let cursor = start + open.length;
  let depth = 1;
  while (cursor < source.length) {
    if (source.startsWith(open, cursor)) { depth += 1; cursor += open.length; }
    else if (source.startsWith(close, cursor)) {
      depth -= 1;
      cursor += close.length;
      if (depth === 0) return cursor;
    } else cursor += 1;
  }
  return cursor;
}

/** Quotes in raw Rust strings close only with the opening number of hashes. */
function rustRawStringEnd(source: string, start: number): number | null {
  let cursor = start;
  if (source.startsWith("br", cursor) || source.startsWith("cr", cursor)) cursor += 1;
  if (source[cursor] !== "r") return null;
  cursor += 1;
  const hashesStart = cursor;
  while (source[cursor] === "#") cursor += 1;
  const hashes = cursor - hashesStart;
  if (source[cursor] !== '"') return null;
  cursor += 1;
  while (cursor < source.length) {
    if (source[cursor++] !== '"') continue;
    let seen = 0;
    while (seen < hashes && source[cursor] === "#") { seen += 1; cursor += 1; }
    if (seen === hashes) return cursor;
  }
  return cursor;
}

function quotedEnd(source: string, start: number, quote: string, escapes: boolean, doubled = false): number {
  let cursor = start + 1;
  while (cursor < source.length) {
    const character = source[cursor++];
    if (escapes && character === "\\" && cursor < source.length) cursor += 1;
    else if (character === quote) {
      if (doubled && source[cursor] === quote) cursor += 1;
      else return cursor;
    }
  }
  return cursor;
}

function followingCharacter(source: string, start: number): string {
  let cursor = start;
  while (/\s/u.test(source[cursor] ?? "") && cursor < source.length) cursor += 1;
  return source[cursor] ?? "";
}

function highlightProgram(source: string, language: "rust" | "lean" | "tla"): string {
  const html: string[] = [];
  const identifiers = /[_\p{ID_Start}][_\p{ID_Continue}]*/uy;
  const numbers = /(?:0[xX][0-9a-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|[0-9][0-9_]*(?:\.(?![.\p{ID_Start}_])[0-9_]*)?(?:[eE][+-]?[0-9_]+)?)(?:[iu](?:8|16|32|64|128|size)|f(?:32|64))?/uy;
  const rustCharacters = /b?'(?:\\(?:[nrt0\\'"]|x[0-9a-fA-F]{2}|u\{[0-9a-fA-F_]{1,6}\})|[^'\\\r\n])'/uy;
  const lifetimes = /'[_\p{ID_Start}][_\p{ID_Continue}]*/uy;
  const tlaWords = /\\[A-Za-z]+/y;
  const keywords = language === "rust" ? rustKeywords : language === "lean" ? leanKeywords : tlaKeywords;
  const lineComment = language === "rust" ? "//" : language === "lean" ? "--" : "\\*";
  const openComment = language === "rust" ? "/*" : language === "lean" ? "/-" : "(*";
  const closeComment = language === "rust" ? "*/" : language === "lean" ? "-/" : "*)";
  let cursor = 0;
  const emit = (kind: SyntaxToken, end: number): void => {
    html.push(token(kind, source.slice(cursor, end)));
    cursor = end;
  };

  while (cursor < source.length) {
    if (source.startsWith(lineComment, cursor)) { emit("comment", lineEnd(source, cursor)); continue; }
    if (source.startsWith(openComment, cursor)) { emit("comment", blockCommentEnd(source, cursor, openComment, closeComment)); continue; }
    if (language === "rust") {
      const rawEnd = rustRawStringEnd(source, cursor);
      if (rawEnd !== null) { emit("string", rawEnd); continue; }
      const character = matchAt(rustCharacters, source, cursor);
      if (character !== "") { emit("string", cursor + character.length); continue; }
      const lifetime = matchAt(lifetimes, source, cursor);
      if (lifetime !== "") { emit("variable", cursor + lifetime.length); continue; }
      if (source.startsWith('b"', cursor) || source.startsWith('c"', cursor)) { emit("string", quotedEnd(source, cursor + 1, '"', true)); continue; }
      if (source.startsWith("r#", cursor)) {
        const identifier = matchAt(identifiers, source, cursor + 2);
        if (identifier !== "") { emit("variable", cursor + 2 + identifier.length); continue; }
      }
    }
    if (source[cursor] === '"') { emit("string", quotedEnd(source, cursor, '"', true)); continue; }
    if (language === "lean" && source[cursor] === "«") {
      const end = source.indexOf("»", cursor + 1);
      emit("variable", end === -1 ? source.length : end + 1); continue;
    }
    if (language === "tla") {
      const word = matchAt(tlaWords, source, cursor);
      if (word !== "") { emit("keyword", cursor + word.length); continue; }
    }
    const number = matchAt(numbers, source, cursor);
    if (number !== "") { emit("number", cursor + number.length); continue; }
    const identifier = matchAt(identifiers, source, cursor);
    if (identifier !== "") {
      const end = cursor + identifier.length;
      const next = followingCharacter(source, end);
      const kind = keywords.has(identifier) ? "keyword"
        : language === "rust" && rustTypes.has(identifier) ? "type"
          : next === "(" || (language === "rust" && source[end] === "!" && source[end + 1] !== "=") ? "function"
            : /^[A-Z]/u.test(identifier) ? "type" : null;
      if (kind === null) { html.push(escapeHtml(identifier)); cursor = end; }
      else emit(kind, end);
      continue;
    }
    const character = source[cursor] ?? "";
    if (/[{}()[\];,.#:+*/%&|!<>=?~^\\'∀∃λ→←↔∧∨¬≤≥≠∈-]/u.test(character)) emit("operator", cursor + 1);
    else { html.push(escapeHtml(character)); cursor += 1; }
  }
  return html.join("");
}

function tomlStringEnd(source: string, start: number): number {
  const quote = source[start] ?? '"';
  const triple = quote.repeat(3);
  if (!source.startsWith(triple, start)) return quotedEnd(source, start, quote, quote === '"');
  let cursor = start + 3;
  while (cursor < source.length) {
    if (source[cursor] === "\\" && quote === '"') { cursor += Math.min(2, source.length - cursor); continue; }
    if (source.startsWith(triple, cursor)) {
      cursor += 3;
      // TOML permits one or two quote characters just before the closing three.
      for (let extra = 0; extra < 2 && source[cursor] === quote; extra += 1) cursor += 1;
      return cursor;
    }
    cursor += 1;
  }
  return cursor;
}

function highlightToml(source: string): string {
  const html: string[] = [];
  const bare = /[A-Za-z0-9_-]+/y;
  const scalar = /(?:[+-]?(?:inf|nan)|true|false|[+-]?(?:0x[0-9a-fA-F_]+|0o[0-7_]+|0b[01_]+|[0-9][0-9_]*(?:\.[0-9_]+)?(?:[eE][+-]?[0-9_]+)?))(?![A-Za-z0-9_-])/y;
  const date = /[0-9]{4}-[0-9]{2}-[0-9]{2}(?:[Tt ][0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]+)?(?:[Zz]|[+-][0-9]{2}:[0-9]{2})?)?|[0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]+)?/y;
  let cursor = 0;
  let expectsKey = true;
  let lineStart = true;
  let table = false;
  const containers: string[] = [];
  const emit = (kind: SyntaxToken, end: number): void => { html.push(token(kind, source.slice(cursor, end))); cursor = end; };

  while (cursor < source.length) {
    const character = source[cursor] ?? "";
    if (character === "\n" || character === "\r") {
      html.push(character); cursor += 1; lineStart = true; table = false;
      if (containers.length === 0) expectsKey = true;
      continue;
    }
    if (/\s/u.test(character)) { html.push(escapeHtml(character)); cursor += 1; continue; }
    if (character === "#") { emit("comment", lineEnd(source, cursor)); continue; }
    if (lineStart && character === "[" && containers.length === 0) { table = true; expectsKey = true; }
    lineStart = false;
    if (character === '"' || character === "'") {
      emit(expectsKey ? "property" : "string", tomlStringEnd(source, cursor)); continue;
    }
    if (!expectsKey) {
      const value = matchAt(date, source, cursor) || matchAt(scalar, source, cursor);
      if (value !== "") { emit(value === "true" || value === "false" ? "keyword" : "number", cursor + value.length); continue; }
    }
    const word = matchAt(bare, source, cursor);
    if (word !== "") {
      if (expectsKey) emit("property", cursor + word.length);
      else { html.push(escapeHtml(word)); cursor += word.length; }
      continue;
    }
    if (character === "=") expectsKey = false;
    else if (character === "{" || (!table && character === "[")) { containers.push(character); expectsKey = character === "{"; }
    else if (!table && (character === "}" || character === "]")) { containers.pop(); expectsKey = false; }
    else if (character === ",") expectsKey = containers.at(-1) === "{";
    if (/[=.,{}[\]]/u.test(character)) emit("operator", cursor + 1);
    else { html.push(escapeHtml(character)); cursor += 1; }
  }
  return html.join("");
}

/** A YAML block scalar owns indented lines, including comment-looking text. */
function yamlBlockEnd(source: string, headerEnd: number, parentIndent: number, explicitIndent: number): number {
  let cursor = headerEnd;
  let contentIndent = explicitIndent === 0 ? null : parentIndent + explicitIndent;
  while (cursor < source.length) {
    const start = cursor;
    if (source[cursor] === "\r") cursor += 1;
    if (source[cursor] === "\n") cursor += 1;
    const lineStart = cursor;
    while (source[cursor] === " ") cursor += 1;
    const indent = cursor - lineStart;
    const end = lineEnd(source, cursor);
    if (cursor === end) { cursor = end; continue; }
    if (contentIndent === null) contentIndent = indent > parentIndent ? indent : null;
    if (contentIndent === null || indent < contentIndent) return start;
    cursor = end;
  }
  return cursor;
}

function highlightYaml(source: string): string {
  const html: string[] = [];
  const names = /[&*][^\s,[\]{}]+/y;
  const scalar = /(?:true|false|null|~|[+-]?(?:\.inf|\.nan|0x[0-9a-fA-F_]+|0o[0-7_]+|[0-9][0-9_]*(?:\.[0-9_]*)?(?:[eE][+-]?[0-9_]+)?))(?=$|[\s,\]}])/iy;
  let cursor = 0;
  let lineStart = 0;
  let cachedLineEnd = -1;
  const currentLineEnd = (): number => {
    if (cachedLineEnd < cursor) cachedLineEnd = lineEnd(source, cursor);
    return cachedLineEnd;
  };
  const emit = (kind: SyntaxToken, end: number): void => { html.push(token(kind, source.slice(cursor, end))); cursor = end; };
  while (cursor < source.length) {
    const character = source[cursor] ?? "";
    if (character === "\n" || character === "\r") { html.push(character); cursor += 1; lineStart = cursor; continue; }
    if (/\s/u.test(character)) { html.push(escapeHtml(character)); cursor += 1; continue; }
    if (character === "#") { emit("comment", currentLineEnd()); continue; }
    if (character === '"' || character === "'") {
      const end = quotedEnd(source, cursor, character, character === '"', character === "'");
      emit(followingCharacter(source, end) === ":" ? "property" : "string", end); continue;
    }
    const name = matchAt(names, source, cursor);
    if (name !== "") { emit("variable", cursor + name.length); continue; }
    if ((character === "|" || character === ">") && /^(?:[1-9][+-]?|[+-][1-9]?|)[ \t]*(?:#.*)?$/u.test(source.slice(cursor + 1, currentLineEnd()))) {
      const end = currentLineEnd();
      const header = source.slice(cursor, end);
      const explicit = /[1-9]/u.exec(header)?.[0];
      let indentation = lineStart;
      while (source[indentation] === " ") indentation += 1;
      emit("operator", cursor + 1 + (header.slice(1).match(/^[1-9+-]{0,2}/u)?.[0].length ?? 0));
      const comment = source.indexOf("#", cursor);
      if (comment !== -1 && comment < end) {
        html.push(escapeHtml(source.slice(cursor, comment))); cursor = comment; emit("comment", end);
      } else { html.push(escapeHtml(source.slice(cursor, end))); cursor = end; }
      const bodyEnd = yamlBlockEnd(source, end, indentation - lineStart, Number(explicit ?? 0));
      if (bodyEnd > cursor) emit("string", bodyEnd);
      continue;
    }
    if ((source.startsWith("---", cursor) || source.startsWith("...", cursor)) && cursor === lineStart && /^\s?$/u.test(source[cursor + 3] ?? "")) { emit("marker", cursor + 3); continue; }
    if (/[{}[\],]/u.test(character) || ((character === ":" || character === "-" || character === "?") && /^\s?$/u.test(source[cursor + 1] ?? ""))) { emit("operator", cursor + 1); continue; }
    const value = matchAt(scalar, source, cursor);
    if (value !== "") { emit(/^(?:true|false|null|~)$/iu.test(value) ? "keyword" : "number", cursor + value.length); continue; }
    // Plain YAML scalars can contain spaces and URL colons. Stop only at a
    // mapping separator, flow punctuation, or a whitespace-delimited comment.
    let end = cursor;
    while (end < source.length && source[end] !== "\n" && source[end] !== "\r") {
      if (/[{}[\],]/u.test(source[end] ?? "")
        || (source[end] === ":" && /^\s?$/u.test(source[end + 1] ?? ""))
        || (source[end] === "#" && end > cursor && /\s/u.test(source[end - 1] ?? ""))) break;
      end += 1;
    }
    if (end === cursor) end += 1;
    const valueEnd = source.slice(cursor, end).trimEnd().length + cursor;
    if (source[end] === ":" && valueEnd > cursor) emit("property", valueEnd);
    else { html.push(escapeHtml(source.slice(cursor, end))); cursor = end; }
  }
  return html.join("");
}

/** Token presentation only: these scanners do not validate or execute code. */
export function highlightCodeLexer(source: string, language: CodeLexerLanguage): string {
  if (language === "toml") return highlightToml(source);
  if (language === "yaml") return highlightYaml(source);
  return highlightProgram(source, language);
}
