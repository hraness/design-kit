/** Fixed token roles shared by the dependency-free language lexers. */
export type SyntaxToken =
  | "command"
  | "comment"
  | "flag"
  | "function"
  | "heading"
  | "inline"
  | "keyword"
  | "marker"
  | "number"
  | "operator"
  | "property"
  | "string"
  | "type"
  | "variable";

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/gu, (character) => {
    switch (character) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      case "'": return "&#39;";
      default: return character;
    }
  });
}

export function token(kind: SyntaxToken, value: string): string {
  return `<span class="syntax-token syntax-token--${kind}">${escapeHtml(value)}</span>`;
}
