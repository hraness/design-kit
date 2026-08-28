import { expect, test } from "bun:test";
import * as stylex from "@stylexjs/stylex";
import {
  Children,
  isValidElement,
  type FormEvent,
  type ReactNode,
} from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  ChatComposer,
  type ChatComposerProps,
  ChatMessage,
  type ChatMessageProps,
  type ChatMessageRole,
} from "./chat";
import { chatStyles } from "./chat.stylex";

const roles = ["assistant", "system", "user"] as const satisfies
  readonly ChatMessageRole[];

const validMessageProps: ChatMessageProps = {
  children: "Hello",
  role: "assistant",
};
const validComposerProps: ChatComposerProps = {
  onSubmit: () => undefined,
  onValueChange: () => undefined,
  value: "Hello",
};

// @ts-expect-error ChatMessage intentionally exposes no public xstyle seam.
const messageWithXstyle: ChatMessageProps = { ...validMessageProps, xstyle: {} };
// @ts-expect-error ChatComposer intentionally exposes no public xstyle seam.
const composerWithXstyle: ChatComposerProps = { ...validComposerProps, xstyle: {} };
// @ts-expect-error ChatMessage intentionally exposes no public ref seam.
const messageWithRef: ChatMessageProps = { ...validMessageProps, ref: null };
void messageWithXstyle;
void composerWithXstyle;
void messageWithRef;

function classTokens(markup: string, stableClass: string): readonly string[] {
  const classValue = [...markup.matchAll(/class="([^"]+)"/gu)]
    .map((match) => match[1] ?? "")
    .find((value) => value.split(" ").includes(stableClass));
  if (classValue === undefined) throw new Error(`Missing ${stableClass} class hook.`);
  return classValue.split(" ").filter(Boolean);
}

function composerElement(props: Partial<ChatComposerProps> = {}) {
  const element = ChatComposer({
    ...validComposerProps,
    ...props,
  });
  if (!isValidElement<{ readonly children?: ReactNode; readonly onSubmit?: unknown }>(element)) {
    throw new Error("ChatComposer did not return its form element.");
  }
  return element;
}

test("ChatMessage keeps every finite role, semantic article, and stable slot order", () => {
  for (const role of roles) {
    const html = renderToStaticMarkup(
      <ChatMessage
        actions={<button type="button">Copy</button>}
        avatar={<span>AI</span>}
        meta={<time>Now</time>}
        name="Assistant"
        role={role}
      >
        <p>Answer</p>
      </ChatMessage>,
    );

    expect(html).toStartWith('<article class="hraness-design-chat-message ');
    expect(html).toContain(`data-role="${role}"`);
    expect(html.indexOf("hraness-design-chat-message__avatar"))
      .toBeLessThan(html.indexOf("hraness-design-chat-message__content"));
    expect(html.indexOf("hraness-design-chat-message__header"))
      .toBeLessThan(html.indexOf("hraness-design-chat-message__body"));
    expect(html.indexOf("hraness-design-chat-message__body"))
      .toBeLessThan(html.indexOf("hraness-design-chat-message__actions"));
    expect(html).not.toContain(' role="');
    expect(html).not.toContain("style=");
  }
});

test("ChatMessage composes stable hooks, atomics, and the caller class in order", () => {
  const html = renderToStaticMarkup(
    <ChatMessage
      actions="Actions"
      avatar="Avatar"
      className="consumer-message"
      meta="Now"
      name="Assistant"
      role="assistant"
    >
      Body
    </ChatMessage>,
  );
  const expectedRoot = stylex.props(chatStyles.message).className?.split(" ") ?? [];
  const expectedMinInline = stylex.props(chatStyles.messageMinInline).className
    ?.split(" ") ?? [];
  const expectedHeader = stylex.props(
    chatStyles.messageRow,
    chatStyles.messageHeader,
  ).className?.split(" ") ?? [];
  const expectedActions = stylex.props(chatStyles.messageRow).className?.split(" ") ?? [];

  expect(classTokens(html, "hraness-design-chat-message")).toEqual([
    "hraness-design-chat-message",
    ...expectedRoot,
    "consumer-message",
  ]);
  expect(classTokens(html, "hraness-design-chat-message__content")).toEqual([
    "hraness-design-chat-message__content",
    ...expectedMinInline,
  ]);
  expect(classTokens(html, "hraness-design-chat-message__body")).toEqual([
    "hraness-design-chat-message__body",
    ...expectedMinInline,
  ]);
  expect(classTokens(html, "hraness-design-chat-message__header")).toEqual([
    "hraness-design-chat-message__header",
    ...expectedHeader,
  ]);
  expect(classTokens(html, "hraness-design-chat-message__actions")).toEqual([
    "hraness-design-chat-message__actions",
    ...expectedActions,
  ]);
});

test("ChatMessage preserves undefined-only slot omission", () => {
  const omitted = renderToStaticMarkup(
    <ChatMessage role="system">Body</ChatMessage>,
  );
  const nullSlots = renderToStaticMarkup(
    <ChatMessage actions={null} avatar={null} meta={null} name={null} role="system">
      Body
    </ChatMessage>,
  );

  expect(omitted).not.toContain("hraness-design-chat-message__avatar");
  expect(omitted).not.toContain("hraness-design-chat-message__header");
  expect(omitted).not.toContain("hraness-design-chat-message__actions");
  expect(nullSlots).toContain("hraness-design-chat-message__avatar");
  expect(nullSlots).toContain("hraness-design-chat-message__header");
  expect(nullSlots).toContain("hraness-design-chat-message__actions");
});

test("ChatComposer preserves native form, controlled field, and submit-button contracts", () => {
  const html = renderToStaticMarkup(
    <ChatComposer
      action="/messages"
      aria-label="Message composer"
      className="consumer-composer"
      data-consumer="chat"
      label="Reply"
      method="post"
      onSubmit={() => undefined}
      onValueChange={() => undefined}
      placeholder="Write a reply"
      sendLabel="Send reply"
      style={{ alignItems: "stretch" }}
      value="Draft"
    />,
  );
  const expectedAtomic = stylex.props(chatStyles.composer).className?.split(" ") ?? [];

  expect(classTokens(html, "hraness-design-chat-composer")).toEqual([
    "hraness-design-chat-composer",
    ...expectedAtomic,
    "consumer-composer",
  ]);
  expect(html).toStartWith("<form");
  expect(html).toContain('action="/messages"');
  expect(html).toContain('aria-label="Message composer"');
  expect(html).toContain('data-consumer="chat"');
  expect(html).toContain('method="post"');
  expect(html).toContain('style="align-items:stretch"');
  expect(html).toContain("hraness-design-chat-composer__field");
  expect(html).toContain("hraness-design-chat-composer__send");
  expect(html).toContain('rows="2"');
  expect(html).toContain('placeholder="Write a reply"');
  expect(html).toContain(">Draft</textarea>");
  expect(html).toContain('type="submit"');
  expect(html).toContain('data-variant="primary"');
  expect(html).toContain("Reply");
  expect(html).toContain("Send reply");
});

test("ChatComposer always prevents navigation and submits only eligible values", () => {
  for (const scenario of [
    { expected: 1, value: " Ready " },
    { expected: 0, value: "" },
    { expected: 0, value: "   " },
    { expected: 0, isDisabled: true, value: "Ready" },
    { expected: 0, isPending: true, value: "Ready" },
  ] as const) {
    let prevented = 0;
    let submitted = 0;
    const element = composerElement({
      isDisabled: "isDisabled" in scenario ? scenario.isDisabled : false,
      isPending: "isPending" in scenario ? scenario.isPending : false,
      onSubmit: () => {
        submitted += 1;
      },
      value: scenario.value,
    });
    const onSubmit = element.props.onSubmit;
    if (typeof onSubmit !== "function") throw new Error("ChatComposer lost onSubmit.");
    onSubmit({ preventDefault: () => { prevented += 1; } } as FormEvent<HTMLFormElement>);

    expect(prevented).toBe(1);
    expect(submitted).toBe(scenario.expected);
  }
});

test("ChatComposer keeps pending and disabled behavior on the existing primitive seams", () => {
  for (const scenario of [
    { disabled: false, pending: false, value: "Ready" },
    { disabled: true, pending: false, value: "Ready" },
    { disabled: false, pending: true, value: "Ready" },
    { disabled: false, pending: false, value: "  " },
  ] as const) {
    const children = Children.toArray(composerElement({
      isDisabled: scenario.disabled,
      isPending: scenario.pending,
      value: scenario.value,
    }).props.children);
    const field = children[0];
    const button = children[1];
    if (!isValidElement<Record<string, unknown>>(field)
      || !isValidElement<Record<string, unknown>>(button)) {
      throw new Error("ChatComposer lost its field/button child order.");
    }

    expect(field.props.isDisabled).toBe(scenario.disabled);
    expect(field.props.value).toBe(scenario.value);
    expect(field.props.showLabel).toBe(false);
    expect(field.props.surface).toBe("pane");
    expect(field.props.textAreaProps).toEqual({ rows: 2 });
    expect(button.props.isPending).toBe(scenario.pending);
    expect(button.props.isDisabled).toBe(scenario.disabled || scenario.value.trim() === "");
    expect(button.props.type).toBe("submit");
    expect(button.props.variant).toBe("primary");
  }
});

test("the complete Chat recipe leaves no legacy selector or physical substitution", async () => {
  const [components, recipe] = await Promise.all([
    Bun.file(new URL("../components.css", import.meta.url)).text(),
    Bun.file(new URL("./chat.stylex.ts", import.meta.url)).text(),
  ]);

  expect(components).not.toContain(".hraness-design-chat-message");
  expect(components).not.toContain(".hraness-design-chat-composer");
  expect(recipe).toContain('"min-inline-size": 0');
  expect(recipe).toContain('"margin-block-end": "var(--space-1)"');
  expect(recipe).toContain('"@media (max-width: 48rem)"');
  expect(recipe).not.toMatch(/\b(?:marginBottom|minWidth)\b/u);
});
