/** Inspect complete source color-mix expressions without confusing nested var() commas. */
export function colorMixExpressions(source: string) {
  const expressions: { start: number; end: number; expression: string; space: string; operands: readonly string[] }[] = [];
  for (const match of source.matchAll(/color-mix\(/gu)) {
    const start = match.index;
    let depth = 1, end = start + match[0].length;
    while (end < source.length && depth > 0) {
      if (source[end] === "(") depth++;
      if (source[end] === ")") depth--;
      end++;
    }
    if (depth !== 0) throw new Error("Incomplete color-mix source expression");
    const expression = source.slice(start, end), content = expression.slice(match[0].length, -1);
    const parts: string[] = [];
    let beginning = 0;
    for (let index = 0, nesting = 0; index < content.length; index++) {
      if (content[index] === "(") nesting++;
      if (content[index] === ")") nesting--;
      if (content[index] === "," && nesting === 0) { parts.push(content.slice(beginning, index).trim()); beginning = index + 1; }
    }
    parts.push(content.slice(beginning).trim());
    const [interpolation, ...operands] = parts;
    if (interpolation === undefined || !interpolation.startsWith("in ") || operands.length !== 2) throw new Error("Malformed color-mix source expression");
    expressions.push({ start, end, expression, space: interpolation.slice(3).trim(), operands });
  }
  return expressions;
}

export function isOpacityOnlyMix(mix: ReturnType<typeof colorMixExpressions>[number]) {
  return mix.operands.some((operand) => /^transparent(?:\s+(?:\d+(?:\.\d+)?|\.\d+)%)?$/iu.test(operand));
}

export function requireHuePreservingOpacity(source: string, label: string) {
  const opacity = colorMixExpressions(source).filter(isOpacityOnlyMix);
  for (const mix of opacity) {
    if (mix.space !== "srgb") throw new Error(`${label}: opacity-only color-mix must use srgb: ${mix.expression}`);
  }
  return opacity;
}
