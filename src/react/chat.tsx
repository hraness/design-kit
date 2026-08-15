"use client";

import { Button, TextAreaField, cn } from "@hraness/ui";
import type { FormEvent, FormHTMLAttributes, ReactNode } from "react";

export type ChatMessageRole = "assistant" | "system" | "user";

export interface ChatMessageProps {
  readonly actions?: ReactNode;
  readonly avatar?: ReactNode;
  readonly children: ReactNode;
  readonly className?: string;
  readonly meta?: ReactNode;
  readonly name?: ReactNode;
  readonly role: ChatMessageRole;
}

export function ChatMessage({
  actions,
  avatar,
  children,
  className,
  meta,
  name,
  role,
}: ChatMessageProps) {
  return (
    <article className={cn("hraness-design-chat-message", className)} data-role={role}>
      {avatar === undefined ? null : <div className="hraness-design-chat-message__avatar">{avatar}</div>}
      <div className="hraness-design-chat-message__content">
        {name === undefined && meta === undefined ? null : (
          <header className="hraness-design-chat-message__header">
            {name === undefined ? null : <strong>{name}</strong>}
            {meta === undefined ? null : <span>{meta}</span>}
          </header>
        )}
        <div className="hraness-design-chat-message__body">{children}</div>
        {actions === undefined ? null : <footer className="hraness-design-chat-message__actions">{actions}</footer>}
      </div>
    </article>
  );
}

export interface ChatComposerProps extends Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit"> {
  readonly isDisabled?: boolean;
  readonly isPending?: boolean;
  readonly label?: ReactNode;
  readonly onSubmit: () => void;
  readonly onValueChange: (value: string) => void;
  readonly placeholder?: string;
  readonly sendLabel?: ReactNode;
  readonly value: string;
}

export function ChatComposer({
  className,
  isDisabled = false,
  isPending = false,
  label = "Message",
  onSubmit,
  onValueChange,
  placeholder,
  sendLabel = "Send",
  value,
  ...props
}: ChatComposerProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (isDisabled || isPending || value.trim().length === 0) return;
    onSubmit();
  };
  return (
    <form {...props} className={cn("hraness-design-chat-composer", className)} onSubmit={handleSubmit}>
      <TextAreaField
        {...(placeholder === undefined ? {} : { placeholder })}
        className="hraness-design-chat-composer__field"
        isDisabled={isDisabled}
        label={label}
        onChange={onValueChange}
        showLabel={false}
        surface="pane"
        textAreaProps={{ rows: 2 }}
        value={value}
      />
      <Button
        className="hraness-design-chat-composer__send"
        isDisabled={isDisabled || value.trim().length === 0}
        isPending={isPending}
        type="submit"
        variant="primary"
      >
        {sendLabel}
      </Button>
    </form>
  );
}
