import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { SyntaxCode } from "./syntax-code";

test("SyntaxCode highlights recognizable code by default and honors explicit plain text", () => {
  expect(renderToStaticMarkup(<SyntaxCode code="bun test --watch" />)).toContain('data-language="shell"');
  expect(renderToStaticMarkup(<SyntaxCode code="Please run the tests." />)).toContain('data-language="text"');
  const plain = renderToStaticMarkup(<SyntaxCode code="bun test --watch" language="text" />);
  expect(plain).toContain('data-language="text"');
  expect(plain).not.toContain("syntax-token--command");
});

test("SyntaxCode emits typed language metadata and highlighted server markup", () => {
  const html = renderToStaticMarkup(
    <SyntaxCode
      className="product-code"
      code={'const greeting = "hello";'}
      language="typescript"
    />,
  );

  expect(html).toContain(
    'class="syntax-code language-typescript product-code"',
  );
  expect(html).toContain('data-language="typescript"');
  expect(html).toContain("var(--sh-keyword)");
  expect(html).toContain("const");
  expect(html).not.toContain("<script");
});

test("SyntaxCode offers class-only server markup for strict-CSP consumers", () => {
  const html = renderToStaticMarkup(
    <SyntaxCode className="product-code" code={'const greeting = "hello";'} language="typescript" styles="classes" />,
  );
  expect(html).toContain('class="syntax-code language-typescript product-code"');
  expect(html).toContain('data-language="typescript"');
  expect(html).toContain('class="sh__token--keyword"');
  expect(html).not.toMatch(/\sstyle=|<script/u);
});
