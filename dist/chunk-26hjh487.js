// src/syntax-highlighting.ts
import { highlight } from "sugar-high";

// src/syntax-tokens.ts
function escapeHtml(value) {
  return value.replace(/[&<>"']/gu, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return character;
    }
  });
}
function token(kind, value) {
  return `<span class="syntax-token syntax-token--${kind}">${escapeHtml(value)}</span>`;
}

// src/syntax-code-lexers.ts
var rustKeywords = new Set("as async await break const continue crate dyn else enum extern false fn for if impl in let loop match mod move mut pub ref return self Self static struct super trait true type unsafe use where while union yield".split(" "));
var rustTypes = new Set("bool char str usize isize u8 u16 u32 u64 u128 i8 i16 i32 i64 i128 f32 f64".split(" "));
var leanKeywords = new Set("abbrev axiom by case class deriving do else end example exists export false for forall fun have if import in inductive instance let match namespace noncomputable opaque open partial private protected public return section simp simpa structure termination_by theorem then true universe variable where with def".split(" "));
var tlaKeywords = new Set("ACTION ASSUME ASSUMPTION AXIOM BOOLEAN BY CASE CHOOSE CONSTANT CONSTANTS COROLLARY DEF DEFINE DEFS DOMAIN ELSE ENABLED EXCEPT EXTENDS FALSE HAVE HIDE IF IN INSTANCE LAMBDA LEMMA LET LOCAL MODULE NEW OBVIOUS OMITTED ONLY OTHER PICK PROOF PROPOSITION PROVE QED RECURSIVE STATE SUBSET SUFFICES TAKE TEMPORAL THEOREM THEN TRUE UNCHANGED UNION USE VARIABLE VARIABLES WITH WITNESS".split(" "));
function matchAt(pattern, source, cursor) {
  pattern.lastIndex = cursor;
  return pattern.exec(source)?.[0] ?? "";
}
function lineEnd(source, start) {
  let cursor = start;
  while (cursor < source.length && source[cursor] !== `
` && source[cursor] !== "\r")
    cursor += 1;
  return cursor;
}
function blockCommentEnd(source, start, open, close) {
  let cursor = start + open.length;
  let depth = 1;
  while (cursor < source.length) {
    if (source.startsWith(open, cursor)) {
      depth += 1;
      cursor += open.length;
    } else if (source.startsWith(close, cursor)) {
      depth -= 1;
      cursor += close.length;
      if (depth === 0)
        return cursor;
    } else
      cursor += 1;
  }
  return cursor;
}
function rustRawStringEnd(source, start) {
  let cursor = start;
  if (source.startsWith("br", cursor) || source.startsWith("cr", cursor))
    cursor += 1;
  if (source[cursor] !== "r")
    return null;
  cursor += 1;
  const hashesStart = cursor;
  while (source[cursor] === "#")
    cursor += 1;
  const hashes = cursor - hashesStart;
  if (source[cursor] !== '"')
    return null;
  cursor += 1;
  while (cursor < source.length) {
    if (source[cursor++] !== '"')
      continue;
    let seen = 0;
    while (seen < hashes && source[cursor] === "#") {
      seen += 1;
      cursor += 1;
    }
    if (seen === hashes)
      return cursor;
  }
  return cursor;
}
function quotedEnd(source, start, quote, escapes, doubled = false) {
  let cursor = start + 1;
  while (cursor < source.length) {
    const character = source[cursor++];
    if (escapes && character === "\\" && cursor < source.length)
      cursor += 1;
    else if (character === quote) {
      if (doubled && source[cursor] === quote)
        cursor += 1;
      else
        return cursor;
    }
  }
  return cursor;
}
function followingCharacter(source, start) {
  let cursor = start;
  while (/\s/u.test(source[cursor] ?? "") && cursor < source.length)
    cursor += 1;
  return source[cursor] ?? "";
}
function highlightProgram(source, language) {
  const html = [];
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
  const emit = (kind, end) => {
    html.push(token(kind, source.slice(cursor, end)));
    cursor = end;
  };
  while (cursor < source.length) {
    if (source.startsWith(lineComment, cursor)) {
      emit("comment", lineEnd(source, cursor));
      continue;
    }
    if (source.startsWith(openComment, cursor)) {
      emit("comment", blockCommentEnd(source, cursor, openComment, closeComment));
      continue;
    }
    if (language === "rust") {
      const rawEnd = rustRawStringEnd(source, cursor);
      if (rawEnd !== null) {
        emit("string", rawEnd);
        continue;
      }
      const character2 = matchAt(rustCharacters, source, cursor);
      if (character2 !== "") {
        emit("string", cursor + character2.length);
        continue;
      }
      const lifetime = matchAt(lifetimes, source, cursor);
      if (lifetime !== "") {
        emit("variable", cursor + lifetime.length);
        continue;
      }
      if (source.startsWith('b"', cursor) || source.startsWith('c"', cursor)) {
        emit("string", quotedEnd(source, cursor + 1, '"', true));
        continue;
      }
      if (source.startsWith("r#", cursor)) {
        const identifier2 = matchAt(identifiers, source, cursor + 2);
        if (identifier2 !== "") {
          emit("variable", cursor + 2 + identifier2.length);
          continue;
        }
      }
    }
    if (source[cursor] === '"') {
      emit("string", quotedEnd(source, cursor, '"', true));
      continue;
    }
    if (language === "lean" && source[cursor] === "«") {
      const end = source.indexOf("»", cursor + 1);
      emit("variable", end === -1 ? source.length : end + 1);
      continue;
    }
    if (language === "tla") {
      const word = matchAt(tlaWords, source, cursor);
      if (word !== "") {
        emit("keyword", cursor + word.length);
        continue;
      }
    }
    const number = matchAt(numbers, source, cursor);
    if (number !== "") {
      emit("number", cursor + number.length);
      continue;
    }
    const identifier = matchAt(identifiers, source, cursor);
    if (identifier !== "") {
      const end = cursor + identifier.length;
      const next = followingCharacter(source, end);
      const kind = keywords.has(identifier) ? "keyword" : language === "rust" && rustTypes.has(identifier) ? "type" : next === "(" || language === "rust" && source[end] === "!" && source[end + 1] !== "=" ? "function" : /^[A-Z]/u.test(identifier) ? "type" : null;
      if (kind === null) {
        html.push(escapeHtml(identifier));
        cursor = end;
      } else
        emit(kind, end);
      continue;
    }
    const character = source[cursor] ?? "";
    if (/[{}()[\];,.#:+*/%&|!<>=?~^\\'∀∃λ→←↔∧∨¬≤≥≠∈-]/u.test(character))
      emit("operator", cursor + 1);
    else {
      html.push(escapeHtml(character));
      cursor += 1;
    }
  }
  return html.join("");
}
function tomlStringEnd(source, start) {
  const quote = source[start] ?? '"';
  const triple = quote.repeat(3);
  if (!source.startsWith(triple, start))
    return quotedEnd(source, start, quote, quote === '"');
  let cursor = start + 3;
  while (cursor < source.length) {
    if (source[cursor] === "\\" && quote === '"') {
      cursor += Math.min(2, source.length - cursor);
      continue;
    }
    if (source.startsWith(triple, cursor)) {
      cursor += 3;
      for (let extra = 0;extra < 2 && source[cursor] === quote; extra += 1)
        cursor += 1;
      return cursor;
    }
    cursor += 1;
  }
  return cursor;
}
function highlightToml(source) {
  const html = [];
  const bare = /[A-Za-z0-9_-]+/y;
  const scalar = /(?:[+-]?(?:inf|nan)|true|false|[+-]?(?:0x[0-9a-fA-F_]+|0o[0-7_]+|0b[01_]+|[0-9][0-9_]*(?:\.[0-9_]+)?(?:[eE][+-]?[0-9_]+)?))(?![A-Za-z0-9_-])/y;
  const date = /[0-9]{4}-[0-9]{2}-[0-9]{2}(?:[Tt ][0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]+)?(?:[Zz]|[+-][0-9]{2}:[0-9]{2})?)?|[0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]+)?/y;
  let cursor = 0;
  let expectsKey = true;
  let lineStart = true;
  let table = false;
  const containers = [];
  const emit = (kind, end) => {
    html.push(token(kind, source.slice(cursor, end)));
    cursor = end;
  };
  while (cursor < source.length) {
    const character = source[cursor] ?? "";
    if (character === `
` || character === "\r") {
      html.push(character);
      cursor += 1;
      lineStart = true;
      table = false;
      if (containers.length === 0)
        expectsKey = true;
      continue;
    }
    if (/\s/u.test(character)) {
      html.push(escapeHtml(character));
      cursor += 1;
      continue;
    }
    if (character === "#") {
      emit("comment", lineEnd(source, cursor));
      continue;
    }
    if (lineStart && character === "[" && containers.length === 0) {
      table = true;
      expectsKey = true;
    }
    lineStart = false;
    if (character === '"' || character === "'") {
      emit(expectsKey ? "property" : "string", tomlStringEnd(source, cursor));
      continue;
    }
    if (!expectsKey) {
      const value = matchAt(date, source, cursor) || matchAt(scalar, source, cursor);
      if (value !== "") {
        emit(value === "true" || value === "false" ? "keyword" : "number", cursor + value.length);
        continue;
      }
    }
    const word = matchAt(bare, source, cursor);
    if (word !== "") {
      if (expectsKey)
        emit("property", cursor + word.length);
      else {
        html.push(escapeHtml(word));
        cursor += word.length;
      }
      continue;
    }
    if (character === "=")
      expectsKey = false;
    else if (character === "{" || !table && character === "[") {
      containers.push(character);
      expectsKey = character === "{";
    } else if (!table && (character === "}" || character === "]")) {
      containers.pop();
      expectsKey = false;
    } else if (character === ",")
      expectsKey = containers.at(-1) === "{";
    if (/[=.,{}[\]]/u.test(character))
      emit("operator", cursor + 1);
    else {
      html.push(escapeHtml(character));
      cursor += 1;
    }
  }
  return html.join("");
}
function yamlBlockEnd(source, headerEnd, parentIndent, explicitIndent) {
  let cursor = headerEnd;
  let contentIndent = explicitIndent === 0 ? null : parentIndent + explicitIndent;
  while (cursor < source.length) {
    const start = cursor;
    if (source[cursor] === "\r")
      cursor += 1;
    if (source[cursor] === `
`)
      cursor += 1;
    const lineStart = cursor;
    while (source[cursor] === " ")
      cursor += 1;
    const indent = cursor - lineStart;
    const end = lineEnd(source, cursor);
    if (cursor === end) {
      cursor = end;
      continue;
    }
    if (contentIndent === null)
      contentIndent = indent > parentIndent ? indent : null;
    if (contentIndent === null || indent < contentIndent)
      return start;
    cursor = end;
  }
  return cursor;
}
function highlightYaml(source) {
  const html = [];
  const names = /[&*][^\s,[\]{}]+/y;
  const scalar = /(?:true|false|null|~|[+-]?(?:\.inf|\.nan|0x[0-9a-fA-F_]+|0o[0-7_]+|[0-9][0-9_]*(?:\.[0-9_]*)?(?:[eE][+-]?[0-9_]+)?))(?=$|[\s,\]}])/iy;
  let cursor = 0;
  let lineStart = 0;
  let cachedLineEnd = -1;
  const currentLineEnd = () => {
    if (cachedLineEnd < cursor)
      cachedLineEnd = lineEnd(source, cursor);
    return cachedLineEnd;
  };
  const emit = (kind, end) => {
    html.push(token(kind, source.slice(cursor, end)));
    cursor = end;
  };
  while (cursor < source.length) {
    const character = source[cursor] ?? "";
    if (character === `
` || character === "\r") {
      html.push(character);
      cursor += 1;
      lineStart = cursor;
      continue;
    }
    if (/\s/u.test(character)) {
      html.push(escapeHtml(character));
      cursor += 1;
      continue;
    }
    if (character === "#") {
      emit("comment", currentLineEnd());
      continue;
    }
    if (character === '"' || character === "'") {
      const end2 = quotedEnd(source, cursor, character, character === '"', character === "'");
      emit(followingCharacter(source, end2) === ":" ? "property" : "string", end2);
      continue;
    }
    const name = matchAt(names, source, cursor);
    if (name !== "") {
      emit("variable", cursor + name.length);
      continue;
    }
    if ((character === "|" || character === ">") && /^(?:[1-9][+-]?|[+-][1-9]?|)[ \t]*(?:#.*)?$/u.test(source.slice(cursor + 1, currentLineEnd()))) {
      const end2 = currentLineEnd();
      const header = source.slice(cursor, end2);
      const explicit = /[1-9]/u.exec(header)?.[0];
      let indentation = lineStart;
      while (source[indentation] === " ")
        indentation += 1;
      emit("operator", cursor + 1 + (header.slice(1).match(/^[1-9+-]{0,2}/u)?.[0].length ?? 0));
      const comment = source.indexOf("#", cursor);
      if (comment !== -1 && comment < end2) {
        html.push(escapeHtml(source.slice(cursor, comment)));
        cursor = comment;
        emit("comment", end2);
      } else {
        html.push(escapeHtml(source.slice(cursor, end2)));
        cursor = end2;
      }
      const bodyEnd = yamlBlockEnd(source, end2, indentation - lineStart, Number(explicit ?? 0));
      if (bodyEnd > cursor)
        emit("string", bodyEnd);
      continue;
    }
    if ((source.startsWith("---", cursor) || source.startsWith("...", cursor)) && cursor === lineStart && /^\s?$/u.test(source[cursor + 3] ?? "")) {
      emit("marker", cursor + 3);
      continue;
    }
    if (/[{}[\],]/u.test(character) || (character === ":" || character === "-" || character === "?") && /^\s?$/u.test(source[cursor + 1] ?? "")) {
      emit("operator", cursor + 1);
      continue;
    }
    const value = matchAt(scalar, source, cursor);
    if (value !== "") {
      emit(/^(?:true|false|null|~)$/iu.test(value) ? "keyword" : "number", cursor + value.length);
      continue;
    }
    let end = cursor;
    while (end < source.length && source[end] !== `
` && source[end] !== "\r") {
      if (/[{}[\],]/u.test(source[end] ?? "") || source[end] === ":" && /^\s?$/u.test(source[end + 1] ?? "") || source[end] === "#" && end > cursor && /\s/u.test(source[end - 1] ?? ""))
        break;
      end += 1;
    }
    if (end === cursor)
      end += 1;
    const valueEnd = source.slice(cursor, end).trimEnd().length + cursor;
    if (source[end] === ":" && valueEnd > cursor)
      emit("property", valueEnd);
    else {
      html.push(escapeHtml(source.slice(cursor, end)));
      cursor = end;
    }
  }
  return html.join("");
}
function highlightCodeLexer(source, language) {
  if (language === "toml")
    return highlightToml(source);
  if (language === "yaml")
    return highlightYaml(source);
  return highlightProgram(source, language);
}

// src/syntax-highlighting.ts
var syntaxLanguages = ["css", "html", "json", "lean", "markdown", "rust", "shell", "text", "tla", "toml", "typescript", "yaml"];
var maximumSyntaxCharacters = 128 * 1024;
function classOnlySyntax(html) {
  const result = html.replace(/<span class="sh__token--(class|comment|entity|identifier|jsxliterals|keyword|property|sign|space|string)" style="color:var\(--sh-\1\)">/gu, '<span class="sh__token--$1">');
  if (/<[A-Za-z][^<>]*\sstyle\s*=/iu.test(result)) {
    throw new Error("Unrecognized inline style in class-only syntax output.");
  }
  return result;
}
var shellKeywords = new Set(["case", "do", "done", "elif", "else", "esac", "fi", "for", "function", "if", "in", "select", "then", "time", "until", "while"]);
var shellKeywordsFollowedByCommand = new Set(["do", "elif", "if", "then", "until", "while"]);
function languageToken(input) {
  const tokens = input.trim().toLowerCase().split(/\s+/u);
  const languageClass = tokens.find((token2) => token2.startsWith("language-"));
  return (languageClass ?? tokens[0] ?? "").replace(/^language-/u, "");
}
function resolveSyntaxLanguage(input) {
  if (typeof input !== "string")
    return "text";
  switch (languageToken(input)) {
    case "css":
      return "css";
    case "htm":
    case "html":
    case "xml":
      return "html";
    case "json":
    case "jsonc":
      return "json";
    case "lean":
    case "lean4":
      return "lean";
    case "rust":
    case "rs":
      return "rust";
    case "tla":
    case "tla+":
    case "tlaplus":
      return "tla";
    case "toml":
      return "toml";
    case "yaml":
    case "yml":
      return "yaml";
    case "markdown":
    case "md":
    case "mdx":
      return "markdown";
    case "bash":
    case "console":
    case "sh":
    case "shell":
    case "zsh":
      return "shell";
    case "javascript":
    case "js":
    case "jsx":
    case "ts":
    case "tsx":
    case "typescript":
      return "typescript";
    case "plaintext":
    case "text":
    case "txt":
    default:
      return "text";
  }
}
function inferSyntaxLanguage(code) {
  if (code.length > maximumSyntaxCharacters)
    return "text";
  const trimmed = code.trim();
  if (trimmed === "")
    return "text";
  if (trimmed[0] === "{" || trimmed[0] === "[") {
    try {
      const value = JSON.parse(trimmed);
      if (value !== null && typeof value === "object")
        return "json";
    } catch {}
  }
  const first = (trimmed.split(`
`, 1)[0] ?? "").slice(0, 2048);
  if (/^#!\s*(?:\/bin\/(?:ba|z)?sh|\/usr\/bin\/env\s+(?:ba|z)?sh)(?:\s|$)/u.test(first) || /^(?:\$\s+)?(?:bun|npm|pnpm|yarn)\s+(?:add|install|run|test|build|remove|update|exec|dlx|create|init|ci|publish|pack)\b/u.test(first) || /^(?:\$\s+)?(?:bunx|npx)\s+(?:skills\s+add\b|create-[\w-]+\b|@[\w-]+\/[\w-]+\b|[\w-]+\s+--?[A-Za-z])/u.test(first) || /^(?:\$\s+)?git\s+(?:clone|status|diff|log|show|fetch|pull|push|checkout|switch|add|commit|branch|tag)\b/u.test(first) || /^(?:\$\s+)?curl\s+(?:--?[A-Za-z]|https?:\/\/)/u.test(first))
    return "shell";
  if (/^(?:export\s+)?(?:const|let|var)\s+[A-Za-z_$][\w$]*(?:\s*:[^=]+)?\s*=/u.test(first) || /^import\s+(?:[\w*{].*\s+from\s+)?["']/u.test(first) || /^(?:export\s+)?(?:async\s+)?function\s+[A-Za-z_$][\w$]*\s*\(/u.test(first))
    return "typescript";
  if (/^#{1,6}\s+\S/u.test(first) || /^`{3,}\w*/u.test(first))
    return "markdown";
  if (/^<!doctype\s+html\b/iu.test(first) || /^<([a-z][\w:-]*)(?:\s[^<>]*|)>(?:[^]*?)<\/\1\s*>/iu.test(trimmed))
    return "html";
  const opening = trimmed.indexOf("{");
  if (opening > 0 && opening < 2048 && /^[.#]?[a-zA-Z_][\w.# :>+~,-]*$/u.test(trimmed.slice(0, opening).trimEnd())) {
    const declaration = trimmed.slice(opening + 1, opening + 2049).trimStart();
    const colon = declaration.indexOf(":");
    if (colon > 0 && /^-{0,2}[a-zA-Z][a-zA-Z-]*$/u.test(declaration.slice(0, colon).trimEnd()) && /^[^{};]+[;}]/u.test(declaration.slice(colon + 1).trimStart()))
      return "css";
  }
  return "text";
}
function tokenHtml(kind, html) {
  return `<span class="syntax-token syntax-token--${kind}">${html}</span>`;
}
function highlightMarkdownInline(value) {
  let html = "";
  let cursor = 0;
  for (const match of value.matchAll(/`[^`\n]+`/gu)) {
    const index = match.index;
    const inlineCode = match[0];
    html += escapeHtml(value.slice(cursor, index));
    html += token("inline", inlineCode);
    cursor = index + inlineCode.length;
  }
  return html + escapeHtml(value.slice(cursor));
}
function isMarkdownWhitespace(codeUnit) {
  return codeUnit === 9 || codeUnit === 10 || codeUnit === 11 || codeUnit === 12 || codeUnit === 13 || codeUnit === 32 || codeUnit === 160 || codeUnit === 5760 || codeUnit >= 8192 && codeUnit <= 8202 || codeUnit === 8232 || codeUnit === 8233 || codeUnit === 8239 || codeUnit === 8287 || codeUnit === 12288 || codeUnit === 65279;
}
function isMarkdownLineTerminator(codeUnit) {
  return codeUnit === 10 || codeUnit === 13 || codeUnit === 8232 || codeUnit === 8233;
}
function isAsciiDigit(codeUnit) {
  return codeUnit >= 48 && codeUnit <= 57;
}
function markdownLineParts(line, kind) {
  let markerStart = 0;
  while (markerStart < line.length && isMarkdownWhitespace(line.charCodeAt(markerStart))) {
    markerStart += 1;
  }
  let markerEnd = markerStart;
  if (kind === "fence") {
    const fence = line.charCodeAt(markerStart);
    if (fence !== 96 && fence !== 126)
      return null;
    while (markerEnd < line.length && line.charCodeAt(markerEnd) === fence) {
      markerEnd += 1;
    }
    if (markerEnd - markerStart < 3)
      return null;
  } else if (kind === "heading") {
    while (markerEnd < line.length && markerEnd - markerStart < 6 && line.charCodeAt(markerEnd) === 35) {
      markerEnd += 1;
    }
    if (markerEnd === markerStart)
      return null;
  } else {
    const first = line.charCodeAt(markerStart);
    if (first === 42 || first === 43 || first === 45) {
      markerEnd += 1;
    } else if (isAsciiDigit(first)) {
      while (markerEnd < line.length && isAsciiDigit(line.charCodeAt(markerEnd))) {
        markerEnd += 1;
      }
      if (line.charCodeAt(markerEnd) !== 46)
        return null;
      markerEnd += 1;
    } else {
      return null;
    }
  }
  const separatorStart = markerEnd;
  if (kind !== "fence") {
    while (markerEnd < line.length && isMarkdownWhitespace(line.charCodeAt(markerEnd))) {
      markerEnd += 1;
    }
    if (markerEnd === separatorStart)
      return null;
  }
  for (let cursor = markerEnd;cursor < line.length; cursor += 1) {
    if (isMarkdownLineTerminator(line.charCodeAt(cursor)))
      return null;
  }
  return {
    content: line.slice(markerEnd),
    indentation: line.slice(0, markerStart),
    marker: line.slice(markerStart, separatorStart),
    separator: line.slice(separatorStart, markerEnd)
  };
}
function highlightMarkdownLine(line) {
  const fence = markdownLineParts(line, "fence");
  if (fence !== null) {
    return `${escapeHtml(fence.indentation)}${token("marker", fence.marker)}${token("keyword", fence.content)}`;
  }
  const heading = markdownLineParts(line, "heading");
  if (heading !== null) {
    return `${escapeHtml(heading.indentation)}${token("marker", heading.marker)}${escapeHtml(heading.separator)}${tokenHtml("heading", highlightMarkdownInline(heading.content))}`;
  }
  const listItem = markdownLineParts(line, "list");
  if (listItem !== null) {
    return `${escapeHtml(listItem.indentation)}${token("marker", listItem.marker)}${escapeHtml(listItem.separator)}${highlightMarkdownInline(listItem.content)}`;
  }
  const quote = /^(\s*)(>)(\s?)(.*)$/u.exec(line);
  if (quote !== null) {
    return `${escapeHtml(quote[1] ?? "")}${token("marker", quote[2] ?? "")}${escapeHtml(quote[3] ?? "")}${highlightMarkdownInline(quote[4] ?? "")}`;
  }
  return highlightMarkdownInline(line);
}
function highlightMarkdown(value) {
  return value.split(`
`).map(highlightMarkdownLine).join(`
`);
}
function isShellOperator(character) {
  return character === "&" || character === "(" || character === ")" || character === ";" || character === "<" || character === ">" || character === "|";
}
function isShellWhitespace(character) {
  return /\s/u.test(character);
}
function isEscaped(line, index) {
  let backslashes = 0;
  for (let cursor = index - 1;cursor >= 0 && line[cursor] === "\\"; cursor -= 1) {
    backslashes += 1;
  }
  return backslashes % 2 === 1;
}
function highlightShellLine(line) {
  let cursor = 0;
  let expectsCommand = true;
  let html = "";
  while (cursor < line.length) {
    const character = line[cursor] ?? "";
    if (isShellWhitespace(character)) {
      html += escapeHtml(character);
      cursor += 1;
      continue;
    }
    if (character === "#") {
      html += token("comment", line.slice(cursor));
      break;
    }
    if (character === "'" || character === '"') {
      const quote = character;
      let end2 = cursor + 1;
      while (end2 < line.length) {
        const next = line[end2] ?? "";
        end2 += 1;
        if (next === quote && (quote === "'" || !isEscaped(line, end2 - 1)))
          break;
      }
      html += token("string", line.slice(cursor, end2));
      cursor = end2;
      expectsCommand = false;
      continue;
    }
    if (character === "$") {
      if (line.slice(0, cursor).trim() === "" && /\s/u.test(line[cursor + 1] ?? "")) {
        html += token("operator", character);
        cursor += 1;
        continue;
      }
      const variable = /^\$(?:\{[^}\n]*\}|[A-Za-z_][A-Za-z0-9_]*|[?$!#*@0-9-])/u.exec(line.slice(cursor))?.[0] ?? "$";
      html += token("variable", variable);
      cursor += variable.length;
      expectsCommand = false;
      continue;
    }
    if (isShellOperator(character)) {
      const pair = line.slice(cursor, cursor + 2);
      const operator = pair === "&&" || pair === "||" || pair === ">>" || pair === "<<" ? pair : character;
      html += token("operator", operator);
      cursor += operator.length;
      expectsCommand = operator === ";" || operator === "&&" || operator === "||" || operator === "|";
      continue;
    }
    let end = cursor + 1;
    while (end < line.length) {
      const next = line[end] ?? "";
      if (isShellWhitespace(next) || isShellOperator(next) || next === "$" || next === "'" || next === '"') {
        break;
      }
      end += 1;
    }
    const word = line.slice(cursor, end);
    if (shellKeywords.has(word)) {
      html += token("keyword", word);
      expectsCommand = shellKeywordsFollowedByCommand.has(word);
    } else if (word.startsWith("-")) {
      html += token("flag", word);
      expectsCommand = false;
    } else if (expectsCommand && !word.includes("=")) {
      html += token("command", word);
      expectsCommand = false;
    } else if (/^[A-Za-z_][A-Za-z0-9_]*=/u.test(word)) {
      html += token("variable", word);
    } else {
      html += escapeHtml(word);
      expectsCommand = false;
    }
    cursor = end;
  }
  return html;
}
function highlightShell(value) {
  return value.split(`
`).map(highlightShellLine).join(`
`);
}
function highlightCode(code, languageHint, options = {}) {
  const styles = options.styles ?? "inline";
  if (styles !== "inline" && styles !== "classes") {
    throw new Error("Syntax styles must be inline or classes.");
  }
  const language = code.length > maximumSyntaxCharacters ? "text" : languageHint === undefined || languageHint.trim() === "" || languageHint === "auto" ? inferSyntaxLanguage(code) : resolveSyntaxLanguage(languageHint);
  const html = language === "text" ? escapeHtml(code) : language === "markdown" ? highlightMarkdown(code) : language === "shell" ? highlightShell(code) : language === "rust" || language === "toml" || language === "yaml" || language === "lean" || language === "tla" ? highlightCodeLexer(code, language) : highlight(code);
  return Object.freeze({
    className: `syntax-code language-${language}`,
    html: styles === "classes" ? classOnlySyntax(html) : html,
    language
  });
}

export { syntaxLanguages, maximumSyntaxCharacters, resolveSyntaxLanguage, inferSyntaxLanguage, highlightCode };
