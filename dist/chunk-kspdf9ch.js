// src/syntax-highlighting.ts
import { highlight } from "sugar-high";
var syntaxLanguages = ["css", "html", "json", "markdown", "shell", "text", "typescript"];
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
  const languageClass = tokens.find((token) => token.startsWith("language-"));
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
function tokenHtml(kind, html) {
  return `<span class="syntax-token syntax-token--${kind}">${html}</span>`;
}
function token(kind, value) {
  return tokenHtml(kind, escapeHtml(value));
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
  const html = language === "text" ? escapeHtml(code) : language === "markdown" ? highlightMarkdown(code) : language === "shell" ? highlightShell(code) : highlight(code);
  return Object.freeze({
    className: `syntax-code language-${language}`,
    html: styles === "classes" ? classOnlySyntax(html) : html,
    language
  });
}

export { syntaxLanguages, maximumSyntaxCharacters, resolveSyntaxLanguage, inferSyntaxLanguage, highlightCode };
