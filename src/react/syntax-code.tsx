import {
  highlightCode,
  type HighlightCodeOptions,
  type SyntaxLanguage,
} from "../syntax-highlighting.js";

export interface SyntaxCodeProps {
  readonly className?: string;
  readonly code: string;
  readonly language: SyntaxLanguage;
  readonly styles?: HighlightCodeOptions["styles"];
}

/** Server-rendered syntax markup with no client runtime or hydration cost. */
export function SyntaxCode({
  className,
  code,
  language,
  styles,
}: SyntaxCodeProps) {
  const highlighted = highlightCode(code, language, styles === undefined ? {} : { styles });
  const classes = className === undefined
    ? highlighted.className
    : `${highlighted.className} ${className}`;

  return (
    <code
      className={classes}
      data-language={highlighted.language}
      dangerouslySetInnerHTML={{ __html: highlighted.html }}
    />
  );
}
