import { setupCopyButtonClassName as cx } from "./setup-copy-button.stylex.js";

/** Presentation only: each setup composition retains its clipboard and recovery behavior. */
export function SetupCopyButton({ className, iconClassName, onCopy, state, subject, failedLabel = "Copy failed" }: Readonly<{
  className?: string;
  iconClassName?: string;
  onCopy: () => void;
  state: "idle" | "copying" | "copied" | "failed";
  subject: string;
  failedLabel?: string;
}>) {
  return (
    <button aria-busy={state === "copying" || undefined} aria-label={`${state === "copied" ? "Copied" : "Copy"} ${subject}`} className={cx("button", className)} data-copy-state={state} disabled={state === "copying"} onClick={onCopy} type="button">
      <svg aria-hidden="true" className={cx("icon", iconClassName)} fill="none" focusable="false" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
        {state === "copied" ? <path d="M5 12.5l4.5 4.5L19 7.5" /> : <><rect height="12" rx="2" width="12" x="8" y="8" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>}
      </svg>
      <span>{state === "copied" ? "Copied" : state === "copying" ? "Copying" : state === "failed" ? failedLabel : "Copy"}</span>
    </button>
  );
}
