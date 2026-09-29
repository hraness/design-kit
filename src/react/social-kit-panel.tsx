import { useCallback, useId, useState } from "react";
import {
  blueskyPostLength,
  characterLength,
  LAUNCH_LIMITS,
  xPostLength,
  type SocialKit,
} from "../launch.js";

/*
 * Client component: a closed <details> that lists every post in a social kit
 * with its length against the channel limit and a copy button. It is for the
 * person posting, so products render it only on their own post page, never
 * in the article outline.
 */

type Entry = Readonly<{ key: string; label: string; text: string; length: number; limit: number }>;

function kitEntries(kit: SocialKit): readonly Entry[] {
  const thread = (channel: string, label: string, posts: readonly string[], measure: (text: string) => number, limit: number): Entry[] =>
    posts.map((text, index) => ({ key: `${channel}.${index}`, label: `${label} ${index + 1} of ${posts.length}`, text, length: measure(text), limit }));
  return [
    ...thread("x", "X post", kit.x, xPostLength, LAUNCH_LIMITS.x),
    ...thread("bluesky", "Bluesky post", kit.bluesky, blueskyPostLength, LAUNCH_LIMITS.bluesky),
    ...thread("threads", "Threads post", kit.threads, characterLength, LAUNCH_LIMITS.threads),
    { key: "linkedin", label: "LinkedIn post", text: kit.linkedin, length: characterLength(kit.linkedin), limit: LAUNCH_LIMITS.linkedin },
    { key: "productHunt.tagline", label: "Product Hunt tagline", text: kit.productHunt.tagline, length: characterLength(kit.productHunt.tagline), limit: LAUNCH_LIMITS.productHuntTagline },
    {
      key: "productHunt.description",
      label: "Product Hunt description",
      text: kit.productHunt.description,
      length: characterLength(kit.productHunt.description),
      limit: LAUNCH_LIMITS.productHuntDescription,
    },
  ];
}

async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * The social kit for a launch post: each post with a character counter and a
 * copy button, plus the fact sheet for anyone writing their own post.
 * Closed by default.
 */
export function SocialKitPanel({
  className,
  kit,
  summary = "Social posts for this launch",
}: Readonly<{ className?: string; kit: SocialKit; summary?: string }>) {
  const id = useId();
  const [status, setStatus] = useState<Readonly<{ key: string; ok: boolean }> | null>(null);
  const copy = useCallback(async (entry: Entry) => {
    setStatus({ key: entry.key, ok: await writeClipboard(entry.text) });
  }, []);
  const entries = kitEntries(kit);
  return (
    <details className={["plain-publication__social-kit", className].filter(Boolean).join(" ")} data-hraness-social-kit="">
      <summary>{summary}</summary>
      <ol className="plain-publication__social-kit-list">
        {entries.map((entry) => {
          const over = entry.length > entry.limit;
          const counterId = `${id}-${entry.key}-count`;
          return (
            <li className="plain-publication__social-kit-item" data-over={over ? "" : undefined} key={entry.key}>
              <div className="plain-publication__social-kit-head">
                <span className="plain-publication__social-kit-label">{entry.label}</span>
                <span className="plain-publication__social-kit-count" id={counterId}>
                  {entry.length} of {entry.limit}
                </span>
                <button
                  aria-describedby={counterId}
                  className="plain-publication__social-kit-copy"
                  onClick={() => void copy(entry)}
                  type="button"
                >
                  {status?.key === entry.key ? (status.ok ? "Copied" : "Copy failed") : "Copy"}
                  <span className="plain-publication__visually-hidden"> {entry.label}</span>
                </button>
              </div>
              <p className="plain-publication__social-kit-text">{entry.text}</p>
            </li>
          );
        })}
      </ol>
      {kit.showHnFacts.length === 0 ? null : (
        <div className="plain-publication__social-kit-facts">
          <p>Facts for your own post</p>
          <ul>{kit.showHnFacts.map((fact) => <li key={fact}>{fact}</li>)}</ul>
        </div>
      )}
      <p aria-live="polite" className="plain-publication__visually-hidden">
        {status === null ? "" : status.ok ? "Copied to the clipboard." : "Copying failed. Select the text and copy it."}
      </p>
    </details>
  );
}
