import { highlight } from "sugar-high";

export const syntaxLanguages = [
  "css",
  "html",
  "json",
  "markdown",
  "shell",
  "text",
  "typescript",
] as const;

export type SyntaxLanguage = (typeof syntaxLanguages)[number];

/** Larger blocks remain escaped plain text rather than entering a tokenizer. */
export const maximumSyntaxCharacters = 128 * 1024;

export interface HighlightedCode {
  readonly className: `syntax-code language-${SyntaxLanguage}`;
  readonly html: string;
  readonly language: SyntaxLanguage;
}

export interface HighlightCodeOptions {
  /** Keep the default inline output, or use the shared stylesheet for strict CSP. */
  readonly styles?: "inline" | "classes";
}

function classOnlySyntax(html: string): string {
  // Sugar High owns this finite serialization. Strip only an exact matching
  // token color; a new or mismatched style must be reviewed before admission.
  const result = html.replace(
    /<span class="sh__token--(class|comment|entity|identifier|jsxliterals|keyword|property|sign|space|string)" style="color:var\(--sh-\1\)">/gu,
    '<span class="sh__token--$1">',
  );
  if (/<[A-Za-z][^<>]*\sstyle\s*=/iu.test(result)) {
    throw new Error("Unrecognized inline style in class-only syntax output.");
  }
  return result;
}

type SyntaxToken =
  | "command"
  | "comment"
  | "flag"
  | "heading"
  | "inline"
  | "keyword"
  | "marker"
  | "operator"
  | "string"
  | "variable";

const shellKeywords = new Set([
  "case",
  "do",
  "done",
  "elif",
  "else",
  "esac",
  "fi",
  "for",
  "function",
  "if",
  "in",
  "select",
  "then",
  "time",
  "until",
  "while",
]);

const shellKeywordsFollowedByCommand = new Set([
  "do",
  "elif",
  "if",
  "then",
  "until",
  "while",
]);

function languageToken(input: string): string {
  const tokens = input.trim().toLowerCase().split(/\s+/u);
  const languageClass = tokens.find((token) => token.startsWith("language-"));
  return (languageClass ?? tokens[0] ?? "").replace(/^language-/u, "");
}

/**
 * Parses Markdown info strings and DOM class names from an untrusted boundary
 * into the finite language set supported by the design kit.
 */
export function resolveSyntaxLanguage(input: unknown): SyntaxLanguage {
  if (typeof input !== "string") return "text";

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

/** Conservative, deterministic defaults for code without a language hint. */
export function inferSyntaxLanguage(code: string): SyntaxLanguage {
  if (code.length > maximumSyntaxCharacters) return "text";
  const trimmed = code.trim();
  if (trimmed === "") return "text";
  if (trimmed[0] === "{" || trimmed[0] === "[") {
    try {
      const value: unknown = JSON.parse(trimmed);
      if (value !== null && typeof value === "object") return "json";
    } catch { /* Other recognizable syntax may also begin with a bracket. */ }
  }
  // Examine only a bounded first line. Unknown commands and prose stay plain.
  const first = (trimmed.split("\n", 1)[0] ?? "").slice(0, 2048);
  if (/^#!\s*(?:\/bin\/(?:ba|z)?sh|\/usr\/bin\/env\s+(?:ba|z)?sh)(?:\s|$)/u.test(first)
    || /^(?:\$\s+)?(?:bun|npm|pnpm|yarn)\s+(?:add|install|run|test|build|remove|update|exec|dlx|create|init|ci|publish|pack)\b/u.test(first)
    || /^(?:\$\s+)?(?:bunx|npx)\s+(?:skills\s+add\b|create-[\w-]+\b|@[\w-]+\/[\w-]+\b|[\w-]+\s+--?[A-Za-z])/u.test(first)
    || /^(?:\$\s+)?git\s+(?:clone|status|diff|log|show|fetch|pull|push|checkout|switch|add|commit|branch|tag)\b/u.test(first)
    || /^(?:\$\s+)?curl\s+(?:--?[A-Za-z]|https?:\/\/)/u.test(first)) return "shell";
  if (/^(?:export\s+)?(?:const|let|var)\s+[A-Za-z_$][\w$]*(?:\s*:[^=]+)?\s*=/u.test(first)
    || /^import\s+(?:[\w*{].*\s+from\s+)?["']/u.test(first)
    || /^(?:export\s+)?(?:async\s+)?function\s+[A-Za-z_$][\w$]*\s*\(/u.test(first)) return "typescript";
  if (/^#{1,6}\s+\S/u.test(first) || /^`{3,}\w*/u.test(first)) return "markdown";
  if (/^<!doctype\s+html\b/iu.test(first) || /^<([a-z][\w:-]*)(?:\s[^<>]*|)>(?:[^]*?)<\/\1\s*>/iu.test(trimmed)) return "html";
  const opening = trimmed.indexOf("{");
  if (opening > 0 && opening < 2048 && /^[.#]?[a-zA-Z_][\w.# :>+~,-]*$/u.test(trimmed.slice(0, opening).trimEnd())) {
    const declaration = trimmed.slice(opening + 1, opening + 2049).trimStart();
    const colon = declaration.indexOf(":");
    if (colon > 0 && /^-{0,2}[a-zA-Z][a-zA-Z-]*$/u.test(declaration.slice(0, colon).trimEnd())
      && /^[^{};]+[;}]/u.test(declaration.slice(colon + 1).trimStart())) return "css";
  }
  return "text";
}

function escapeHtml(value: string): string {
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

function tokenHtml(kind: SyntaxToken, html: string): string {
  return `<span class="syntax-token syntax-token--${kind}">${html}</span>`;
}

function token(kind: SyntaxToken, value: string): string {
  return tokenHtml(kind, escapeHtml(value));
}

function highlightMarkdownInline(value: string): string {
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

interface MarkdownLineParts {
  readonly content: string;
  readonly indentation: string;
  readonly marker: string;
  readonly separator: string;
}

/** Exact ECMAScript `\s` code-unit set used by the former matchers. */
function isMarkdownWhitespace(codeUnit: number): boolean {
  return codeUnit === 0x0009
    || codeUnit === 0x000a
    || codeUnit === 0x000b
    || codeUnit === 0x000c
    || codeUnit === 0x000d
    || codeUnit === 0x0020
    || codeUnit === 0x00a0
    || codeUnit === 0x1680
    || (codeUnit >= 0x2000 && codeUnit <= 0x200a)
    || codeUnit === 0x2028
    || codeUnit === 0x2029
    || codeUnit === 0x202f
    || codeUnit === 0x205f
    || codeUnit === 0x3000
    || codeUnit === 0xfeff;
}

function isMarkdownLineTerminator(codeUnit: number): boolean {
  return codeUnit === 0x000a
    || codeUnit === 0x000d
    || codeUnit === 0x2028
    || codeUnit === 0x2029;
}

function isAsciiDigit(codeUnit: number): boolean {
  return codeUnit >= 0x0030 && codeUnit <= 0x0039;
}

function markdownLineParts(
  line: string,
  kind: "fence" | "heading" | "list",
): MarkdownLineParts | null {
  let markerStart = 0;
  while (
    markerStart < line.length
    && isMarkdownWhitespace(line.charCodeAt(markerStart))
  ) {
    markerStart += 1;
  }

  let markerEnd = markerStart;
  if (kind === "fence") {
    const fence = line.charCodeAt(markerStart);
    if (fence !== 0x0060 && fence !== 0x007e) return null;
    while (markerEnd < line.length && line.charCodeAt(markerEnd) === fence) {
      markerEnd += 1;
    }
    if (markerEnd - markerStart < 3) return null;
  } else if (kind === "heading") {
    while (
      markerEnd < line.length
      && markerEnd - markerStart < 6
      && line.charCodeAt(markerEnd) === 0x0023
    ) {
      markerEnd += 1;
    }
    if (markerEnd === markerStart) return null;
  } else {
    const first = line.charCodeAt(markerStart);
    if (first === 0x002a || first === 0x002b || first === 0x002d) {
      markerEnd += 1;
    } else if (isAsciiDigit(first)) {
      while (markerEnd < line.length && isAsciiDigit(line.charCodeAt(markerEnd))) {
        markerEnd += 1;
      }
      if (line.charCodeAt(markerEnd) !== 0x002e) return null;
      markerEnd += 1;
    } else {
      return null;
    }
  }

  const separatorStart = markerEnd;
  if (kind !== "fence") {
    while (
      markerEnd < line.length
      && isMarkdownWhitespace(line.charCodeAt(markerEnd))
    ) {
      markerEnd += 1;
    }
    if (markerEnd === separatorStart) return null;
  }

  // One final pass preserves `.` without dotAll: content containing any line
  // terminator was never a legacy match, even when the terminator was last.
  for (let cursor = markerEnd; cursor < line.length; cursor += 1) {
    if (isMarkdownLineTerminator(line.charCodeAt(cursor))) return null;
  }

  return {
    content: line.slice(markerEnd),
    indentation: line.slice(0, markerStart),
    marker: line.slice(markerStart, separatorStart),
    separator: line.slice(separatorStart, markerEnd),
  };
}

function highlightMarkdownLine(line: string): string {
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

function highlightMarkdown(value: string): string {
  return value.split("\n").map(highlightMarkdownLine).join("\n");
}

function isShellOperator(character: string): boolean {
  return character === "&"
    || character === "("
    || character === ")"
    || character === ";"
    || character === "<"
    || character === ">"
    || character === "|";
}

function isShellWhitespace(character: string): boolean {
  return /\s/u.test(character);
}

function isEscaped(line: string, index: number): boolean {
  let backslashes = 0;
  for (let cursor = index - 1; cursor >= 0 && line[cursor] === "\\"; cursor -= 1) {
    backslashes += 1;
  }
  return backslashes % 2 === 1;
}

function highlightShellLine(line: string): string {
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
      let end = cursor + 1;
      while (end < line.length) {
        const next = line[end] ?? "";
        end += 1;
        if (next === quote && (quote === "'" || !isEscaped(line, end - 1))) break;
      }
      html += token("string", line.slice(cursor, end));
      cursor = end;
      expectsCommand = false;
      continue;
    }

    if (character === "$") {
      if (line.slice(0, cursor).trim() === "" && /\s/u.test(line[cursor + 1] ?? "")) {
        html += token("operator", character);
        cursor += 1;
        continue;
      }
      const variable = /^\$(?:\{[^}\n]*\}|[A-Za-z_][A-Za-z0-9_]*|[?$!#*@0-9-])/u.exec(
        line.slice(cursor),
      )?.[0] ?? "$";
      html += token("variable", variable);
      cursor += variable.length;
      expectsCommand = false;
      continue;
    }

    if (isShellOperator(character)) {
      const pair = line.slice(cursor, cursor + 2);
      const operator = pair === "&&" || pair === "||" || pair === ">>" || pair === "<<"
        ? pair
        : character;
      html += token("operator", operator);
      cursor += operator.length;
      expectsCommand = operator === ";" || operator === "&&" || operator === "||" || operator === "|";
      continue;
    }

    let end = cursor + 1;
    while (end < line.length) {
      const next = line[end] ?? "";
      if (
        isShellWhitespace(next)
        || isShellOperator(next)
        || next === "$"
        || next === "'"
        || next === '"'
      ) {
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

function highlightShell(value: string): string {
  return value.split("\n").map(highlightShellLine).join("\n");
}

export function highlightCode(
  code: string,
  languageHint?: string,
  options: HighlightCodeOptions = {},
): HighlightedCode {
  const styles = options.styles ?? "inline";
  if (styles !== "inline" && styles !== "classes") {
    throw new Error("Syntax styles must be inline or classes.");
  }
  const language = code.length > maximumSyntaxCharacters
    ? "text"
    : languageHint === undefined || languageHint.trim() === "" || languageHint === "auto"
      ? inferSyntaxLanguage(code)
      : resolveSyntaxLanguage(languageHint);
  const html = language === "text"
    ? escapeHtml(code)
    : language === "markdown"
      ? highlightMarkdown(code)
      : language === "shell"
        ? highlightShell(code)
        : highlight(code);

  return Object.freeze({
    className: `syntax-code language-${language}`,
    html: styles === "classes" ? classOnlySyntax(html) : html,
    language,
  });
}
