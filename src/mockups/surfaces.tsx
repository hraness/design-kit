import { Fragment, type ReactNode } from "react";

import {
  Avatar,
  compact,
  MockupGlyph,
  MockupRoot,
  PlaceholderPhoto,
  SampleParagraphs,
  SampleText,
  type MockupGlyphName,
  type MockupOptOut,
  type MockupRootProps,
} from "./core.js";
import { BrowserWindow, PhoneShell, phoneStyle } from "./frames.js";

function sample(optOut: MockupOptOut | undefined): { optOut?: MockupOptOut } {
  return optOut === undefined ? {} : { optOut };
}

function assertUniqueKeys(keys: readonly string[], component: string): void {
  const seen = new Set<string>();
  for (const key of keys) {
    if (seen.has(key)) throw new RangeError(`${component} keys must be unique: ${key}`);
    seen.add(key);
  }
}

/* ------------------------------------------------------------------ */
/* Chat thread                                                         */
/* ------------------------------------------------------------------ */

/** One message in a chat thread. `me` sits on the right; `them` and `agent` on the left. */
export type ChatMessage = Readonly<{
  from: "me" | "them" | "agent";
  text: string;
  /** A day or time divider shown above this message, such as "Today 9:14". */
  time?: string;
  /** A small label under the bubble, such as "Sent by the assistant". */
  label?: string;
  id?: string;
}>;

/** Whether a sender's message sits on the right, from this device's point of view. */
export function chatSide(from: ChatMessage["from"]): "in" | "out" {
  return from === "me" ? "out" : "in";
}

/** The bubble tail: a concave hook off the bottom corner, drawn for the right side and mirrored on the left. */
const TAIL_PATH =
  "M-16 -17.5H0C0 -7.6 1.7 -2.4 6.4 -0.45 6.95 -0.2 6.85 0.45 6.2 0.5 2.6 0.7 -1.2 -0.6 -3.4 -2.5 -4.3 -3.3 -5.2 -4.1 -6 -4.9L-16 -17.5Z";

/** One to three emoji and no text render large and without a bubble. */
export function isEmojiOnly(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed === "") return false;
  if (!/^(?:[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2300}-\u{23FF}\u{1F1E6}-\u{1F1FF}\u{E0020}-\u{E007F}©®‼⁉™ℹ]|‍|️|⃣|\s)+$/u.test(trimmed)) return false;
  if (/[0-9#*]/u.test(trimmed)) return false;
  const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  return [...segmenter.segment(trimmed.replace(/\s+/gu, ""))].length <= 3;
}

/**
 * A messaging conversation on a phone. `variant="bubbles"` draws blue bubbles
 * with bottom tails on a plain screen; `variant="chat"` draws green bubbles on a
 * wallpaper. Neither is any one app. `visibleCount` and `typing` let a player
 * or film step the conversation in; the static render shows it finished.
 */
export function ChatThread({
  contact,
  device = "phone",
  messages,
  screenHeight,
  statusTime,
  typing = false,
  variant = "bubbles",
  via,
  visibleCount,
  width,
  ...root
}: MockupRootProps &
  Readonly<{
    messages: readonly ChatMessage[];
    /** Name in the header. */
    contact?: string;
    /** A line under the contact name, such as "via a bridge". */
    via?: string;
    /** Show typing dots from the other side after the visible messages. */
    typing?: boolean;
    variant?: "bubbles" | "chat";
    visibleCount?: number;
    device?: "phone" | "none";
    width?: number;
    screenHeight?: number;
    statusTime?: string;
  }>) {
  if (variant !== "bubbles" && variant !== "chat") throw new TypeError(`Unknown chat variant ${JSON.stringify(variant)}.`);
  const count = visibleCount ?? messages.length;
  if (!Number.isInteger(count) || count < 0 || count > messages.length) throw new RangeError("ChatThread visibleCount must be 0 to messages.length.");
  const shown = messages.slice(0, count);
  const sides = shown.map((message) => chatSide(message.from));
  const lastOut = sides.lastIndexOf("out") === sides.length - 1 && !typing ? sides.length - 1 : -1;
  const screen = (
    <div className="hkm-chat" data-hkm-chat={variant} data-hkm-via={via === undefined ? undefined : ""}>
      <div className="hkm-chat-thread">
        <div className="hkm-chat-inner">
          {shown.map((message, index) => {
            const side = sides[index] ?? "in";
            const first = index === 0 || sides[index - 1] !== side || message.time !== undefined;
            const next = shown[index + 1];
            const last = index === shown.length - 1 || sides[index + 1] !== side || next?.time !== undefined;
            const emoji = isEmojiOnly(message.text);
            const tail = variant === "chat" ? (first ? "top" : undefined) : last && !emoji ? "bottom" : undefined;
            return (
              <Fragment key={message.id ?? index}>
                {message.time === undefined ? null : (
                  <div className="hkm-chat-divider">
                    <SampleText {...sample(root.optOut)}>{message.time}</SampleText>
                  </div>
                )}
                <div className="hkm-chat-row" data-hkm-first={first ? "" : undefined} data-hkm-from={message.from} data-hkm-last={last ? "" : undefined} data-hkm-side={side}>
                  <div className="hkm-bubble" data-hkm-emoji={emoji ? "" : undefined} data-hkm-tail={tail}>
                    <SampleText {...sample(root.optOut)}>{message.text}</SampleText>
                    {tail === "bottom" ? (
                      <svg aria-hidden="true" className="hkm-bubble-tail" focusable="false" viewBox="-16 -17.5 23 18">
                        <path d={TAIL_PATH} />
                      </svg>
                    ) : null}
                  </div>
                  {message.label === undefined ? null : <span className="hkm-chat-label">{message.label}</span>}
                </div>
                {index === lastOut && variant === "bubbles" ? <div className="hkm-chat-receipt">Delivered</div> : null}
              </Fragment>
            );
          })}
          {typing ? (
            <div className="hkm-chat-row" data-hkm-first="" data-hkm-last="" data-hkm-side="in">
              <TypingIndicator />
            </div>
          ) : null}
        </div>
      </div>
      <div aria-hidden="true" className="hkm-chat-nav">
        <span className="hkm-chat-back"><MockupGlyph name="back" size={22} /></span>
        <span className="hkm-chat-contact">
          <Avatar name={contact ?? "Contact"} size={variant === "chat" ? 32 : 44} />
          <span className="hkm-chat-name">{contact ?? "Contact"}</span>
          {via === undefined ? null : <span className="hkm-chat-via">{via}</span>}
        </span>
        <span className="hkm-chat-call"><MockupGlyph name="comment" size={18} /></span>
      </div>
      <div aria-hidden="true" className="hkm-chat-composer">
        <span className="hkm-chat-plus"><MockupGlyph name="plus" size={16} /></span>
        <span className="hkm-chat-field">Message</span>
      </div>
    </div>
  );
  return (
    <MockupRoot {...root} kind="chat" style={device === "phone" ? phoneStyle(width, screenHeight) : undefined}>
      {device === "phone" ? <PhoneShell {...(statusTime === undefined ? {} : { statusTime })}>{screen}</PhoneShell> : <div className="hkm-chat-bare">{screen}</div>}
    </MockupRoot>
  );
}

/** Three pulsing dots in a bubble. Only people type; never show it before an automated message. */
export function TypingIndicator() {
  return (
    <span aria-hidden="true" className="hkm-typing">
      <i />
      <i />
      <i />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Feeds                                                               */
/* ------------------------------------------------------------------ */

type FeedShellProps<T> = MockupRootProps &
  Readonly<{
    posts: readonly T[];
    renderPost: (post: T, index: number) => ReactNode;
    /** Stable key per post. Defaults to the index. */
    postKey?: (post: T, index: number) => string;
    url?: string;
    /** Cap the page area and fade it, like a window onto a longer page. */
    height?: number;
    /** Name of the signed-in sample person in the chrome. */
    viewer?: string;
    /** Content for the side rail; omit it for the default neutral rail. Hidden in narrow containers. */
    aside?: ReactNode;
  }>;

function keyed<T>(posts: readonly T[], postKey: ((post: T, index: number) => string) | undefined, component: string): string[] {
  const keys = posts.map((post, index) => (postKey === undefined ? String(index) : postKey(post, index)));
  assertUniqueKeys(keys, component);
  return keys;
}

const SOCIAL_RAIL: readonly (readonly [MockupGlyphName, string])[] = [
  ["home", "Home"],
  ["search", "Explore"],
  ["bell", "Notifications"],
  ["mail", "Messages"],
  ["bookmark", "Saved"],
  ["user", "Profile"],
];

/**
 * A neutral social timeline: a nav rail, a tabbed column of posts, and a side
 * rail, inside a browser window. Each post comes from `renderPost`; use
 * `SocialPost` for the default card. It copies no one network's logo or name.
 */
export function SocialFeed<T>({ aside, height, postKey, posts, renderPost, url = "social.example/home", viewer = "Alex Moreno", ...root }: FeedShellProps<T>) {
  const keys = keyed(posts, postKey, "SocialFeed");
  return (
    <MockupRoot {...root} kind="social">
      <BrowserWindow {...(height === undefined ? {} : { height })} url={url}>
        <div className="hkm-social">
          <div aria-hidden="true" className="hkm-social-rail">
            <span className="hkm-social-mark"><MockupGlyph name="sparkle" size={22} /></span>
            {SOCIAL_RAIL.map(([glyph, label], index) => (
              <span className="hkm-rail-item" data-hkm-active={index === 0 ? "" : undefined} key={label}>
                <MockupGlyph filled={index === 0} name={glyph} size={22} />
                <span className="hkm-rail-label">{label}</span>
              </span>
            ))}
            <span className="hkm-rail-cta">
              <span className="hkm-rail-label">Post</span>
              <MockupGlyph className="hkm-rail-cta-glyph" name="pencil" size={18} />
            </span>
            <span className="hkm-rail-me">
              <Avatar name={viewer} size={32} />
              <span className="hkm-rail-label">{viewer}</span>
            </span>
          </div>
          <div className="hkm-social-main">
            <div aria-hidden="true" className="hkm-social-tabs">
              <span data-hkm-active="">For you</span>
              <span>Following</span>
            </div>
            <div aria-hidden="true" className="hkm-social-compose">
              <Avatar name={viewer} size={36} />
              <span className="hkm-social-compose-field">Share something</span>
              <span className="hkm-social-compose-button">Post</span>
            </div>
            <div className="hkm-feed">
              {posts.map((post, index) => (
                <Fragment key={keys[index]}>{renderPost(post, index)}</Fragment>
              ))}
            </div>
          </div>
          <div aria-hidden="true" className="hkm-social-aside">
            {aside ?? (
              <>
                <span className="hkm-search-field"><MockupGlyph name="search" size={14} />Search</span>
                <span className="hkm-card hkm-aside-card">
                  <span className="hkm-aside-title">Trending</span>
                  {["Night markets", "Rail timetables", "Sourdough"].map((topic) => (
                    <span className="hkm-aside-line" key={topic}>{topic}</span>
                  ))}
                </span>
              </>
            )}
          </div>
        </div>
      </BrowserWindow>
    </MockupRoot>
  );
}

/** Data attributes a skin sets on a post's unit, such as its own flag state. */
export type MockupUnitAttributes = Readonly<Record<`data-${string}`, string | undefined>>;

/** The default social post card. `attributes` and `overlay` let a skin mark the unit without forking it. */
export function SocialPost({
  attributes,
  counts,
  handle,
  name,
  optOut,
  overlay,
  photo,
  text,
  time,
}: Readonly<{
  name: string;
  handle: string;
  time: string;
  text: string;
  photo?: string;
  counts?: readonly [replies: number, reposts: number, likes: number, views: number];
  attributes?: MockupUnitAttributes;
  overlay?: ReactNode;
  optOut?: MockupOptOut;
}>) {
  return (
    <div {...attributes} className="hkm-unit hkm-post">
      {overlay}
      <Avatar name={name} size={40} />
      <div className="hkm-post-body">
        <div className="hkm-post-head">
          <b><SampleText {...sample(optOut)}>{name}</SampleText></b>
          <span className="hkm-muted"><SampleText {...sample(optOut)}>@{handle} · {time}</SampleText></span>
          <span aria-hidden="true" className="hkm-muted hkm-post-more"><MockupGlyph name="more" size={18} /></span>
        </div>
        <div className="hkm-post-text"><SampleParagraphs {...sample(optOut)} text={text} /></div>
        {photo === undefined ? null : <PlaceholderPhoto className="hkm-post-photo" seed={photo} />}
        {counts === undefined ? null : (
          <div aria-hidden="true" className="hkm-post-actions hkm-muted">
            <span><MockupGlyph name="reply" size={17} />{compact(counts[0])}</span>
            <span><MockupGlyph name="repost" size={17} />{compact(counts[1])}</span>
            <span><MockupGlyph name="heart" size={17} />{compact(counts[2])}</span>
            <span><MockupGlyph name="chart" size={17} />{compact(counts[3])}</span>
            <span className="hkm-post-actions-end"><MockupGlyph name="share" size={17} /></span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * A neutral professional-network feed: a top bar, a profile card, a column of
 * posts, and a news rail. Use `WorkPost` for the default card.
 */
export function WorkFeed<T>({ aside, height, postKey, posts, renderPost, url = "network.example/feed", viewer = "Alex Moreno", ...root }: FeedShellProps<T>) {
  const keys = keyed(posts, postKey, "WorkFeed");
  return (
    <MockupRoot {...root} kind="work">
      <BrowserWindow {...(height === undefined ? {} : { height })} url={url}>
        <div aria-hidden="true" className="hkm-work-top">
          <span className="hkm-work-mark"><MockupGlyph name="grid" size={18} /></span>
          <span className="hkm-search-field"><MockupGlyph name="search" size={14} />Search</span>
          <span className="hkm-work-nav">
            {(["home", "people", "comment", "bell"] as const).map((glyph, index) => (
              <span data-hkm-active={index === 0 ? "" : undefined} key={glyph}><MockupGlyph filled={index === 0} name={glyph} size={20} /></span>
            ))}
            <Avatar name={viewer} size={22} />
          </span>
        </div>
        <div className="hkm-work">
          <div aria-hidden="true" className="hkm-work-left">
            <span className="hkm-card hkm-work-profile">
              <span className="hkm-work-cover" />
              <Avatar name={viewer} size={56} />
              <b>{viewer}</b>
              <span className="hkm-muted">Product designer</span>
            </span>
          </div>
          <div className="hkm-work-main">
            <div aria-hidden="true" className="hkm-card hkm-work-compose">
              <Avatar name={viewer} size={40} />
              <span className="hkm-social-compose-field">Start a post</span>
            </div>
            {posts.map((post, index) => (
              <Fragment key={keys[index]}>{renderPost(post, index)}</Fragment>
            ))}
          </div>
          <div aria-hidden="true" className="hkm-work-right">
            {aside ?? (
              <span className="hkm-card hkm-aside-card">
                <span className="hkm-aside-title">Network news</span>
                {["Teams try shorter weeks", "Bakeries hire for nights", "Fewer meetings, same output"].map((topic) => (
                  <span className="hkm-aside-line" key={topic}>{topic}</span>
                ))}
              </span>
            )}
          </div>
        </div>
      </BrowserWindow>
    </MockupRoot>
  );
}

/** The default work-network post card, with an optional reply. */
export function WorkPost({
  attributes,
  comment,
  headline,
  name,
  optOut,
  overlay,
  photo,
  reactions,
  text,
  time,
}: Readonly<{
  name: string;
  headline: string;
  time: string;
  text: string;
  photo?: string;
  reactions?: readonly [reactions: number, comments: number, reposts: number];
  comment?: Readonly<{ name: string; headline: string; text: string; attributes?: MockupUnitAttributes; overlay?: ReactNode }>;
  attributes?: MockupUnitAttributes;
  overlay?: ReactNode;
  optOut?: MockupOptOut;
}>) {
  return (
    <div {...attributes} className="hkm-unit hkm-card hkm-work-post">
      {overlay}
      <div className="hkm-work-post-head">
        <Avatar name={name} size={44} />
        <span className="hkm-work-who">
          <b><SampleText {...sample(optOut)}>{name}</SampleText></b>
          <span className="hkm-muted"><SampleText {...sample(optOut)}>{headline}</SampleText></span>
          <span className="hkm-muted">{time}</span>
        </span>
        <span aria-hidden="true" className="hkm-work-follow">+ Follow</span>
      </div>
      <div className="hkm-post-text"><SampleParagraphs {...sample(optOut)} text={text} /></div>
      {photo === undefined ? null : <PlaceholderPhoto className="hkm-work-photo" ratio="1.91 / 1" seed={photo} />}
      {reactions === undefined ? null : (
        <div aria-hidden="true" className="hkm-work-counts hkm-muted">
          <span>{compact(reactions[0])} reactions</span>
          <span>{compact(reactions[1])} comments · {compact(reactions[2])} reposts</span>
        </div>
      )}
      <div aria-hidden="true" className="hkm-work-actions hkm-muted">
        <span><MockupGlyph name="thumb" size={18} />Like</span>
        <span><MockupGlyph name="comment" size={18} />Comment</span>
        <span><MockupGlyph name="repost" size={18} />Repost</span>
        <span><MockupGlyph name="send" size={18} />Send</span>
      </div>
      {comment === undefined ? null : (
        <div className="hkm-work-comment">
          <Avatar name={comment.name} size={30} />
          <div {...comment.attributes} className="hkm-unit hkm-work-comment-box">
            {comment.overlay}
            <b><SampleText {...sample(optOut)}>{comment.name}</SampleText></b>
            <span className="hkm-muted"><SampleText {...sample(optOut)}>{comment.headline}</SampleText></span>
            <SampleParagraphs {...sample(optOut)} text={comment.text} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Inbox                                                               */
/* ------------------------------------------------------------------ */

const FOLDERS: readonly (readonly [MockupGlyphName, string])[] = [
  ["inbox", "Inbox"],
  ["star", "Starred"],
  ["clock", "Snoozed"],
  ["send", "Sent"],
  ["file", "Drafts"],
  ["archive", "Archive"],
];

/**
 * A neutral mail client: folders, a message list, and an optional open
 * message. Rows come from `renderRow` (use `InboxRow`); the open message from
 * `renderMessage` (use `InboxMessage`).
 */
export function Inbox<T>({
  height,
  open,
  renderMessage,
  renderRow,
  rowKey,
  rows,
  unread,
  url = "mail.example/inbox",
  ...root
}: MockupRootProps &
  Readonly<{
    rows: readonly T[];
    renderRow: (row: T, index: number) => ReactNode;
    rowKey?: (row: T, index: number) => string;
    open?: T;
    renderMessage?: (row: T) => ReactNode;
    /** Unread count by the Inbox folder. Invented; never a real metric. */
    unread?: number;
    url?: string;
    height?: number;
  }>) {
  const keys = keyed(rows, rowKey, "Inbox");
  if (open !== undefined && renderMessage === undefined) throw new TypeError("Inbox needs renderMessage when open is set.");
  return (
    <MockupRoot {...root} kind="inbox">
      <BrowserWindow {...(height === undefined ? {} : { height })} url={url}>
        <div className="hkm-inbox" data-hkm-open={open === undefined ? undefined : ""}>
          <div aria-hidden="true" className="hkm-inbox-folders">
            <span className="hkm-inbox-compose"><MockupGlyph name="pencil" size={16} />Compose</span>
            {FOLDERS.map(([glyph, label], index) => (
              <span className="hkm-rail-item" data-hkm-active={index === 0 ? "" : undefined} key={label}>
                <MockupGlyph name={glyph} size={17} />
                <span className="hkm-rail-label">{label}</span>
                {index === 0 && unread !== undefined ? <span className="hkm-inbox-count">{compact(unread)}</span> : null}
              </span>
            ))}
          </div>
          <div className="hkm-inbox-list">
            <div aria-hidden="true" className="hkm-inbox-toolbar">
              <span className="hkm-search-field"><MockupGlyph name="search" size={14} />Search mail</span>
            </div>
            <ul className="hkm-inbox-rows">
              {rows.map((row, index) => (
                <li key={keys[index]}>{renderRow(row, index)}</li>
              ))}
            </ul>
          </div>
          {open === undefined || renderMessage === undefined ? null : <div className="hkm-inbox-reader">{renderMessage(open)}</div>}
        </div>
      </BrowserWindow>
    </MockupRoot>
  );
}

/** The default inbox row. */
export function InboxRow({
  attributes,
  from,
  optOut,
  overlay,
  preview,
  selected = false,
  starred = false,
  subject,
  time,
  unread = false,
}: Readonly<{
  from: string;
  subject: string;
  preview: string;
  time: string;
  unread?: boolean;
  starred?: boolean;
  selected?: boolean;
  attributes?: MockupUnitAttributes;
  overlay?: ReactNode;
  optOut?: MockupOptOut;
}>) {
  return (
    <div {...attributes} className="hkm-unit hkm-inbox-row" data-hkm-selected={selected ? "" : undefined} data-hkm-unread={unread ? "" : undefined}>
      {overlay}
      <span aria-hidden="true" className="hkm-inbox-star" data-hkm-on={starred ? "" : undefined}><MockupGlyph filled={starred} name="star" size={15} /></span>
      <span className="hkm-inbox-from"><SampleText {...sample(optOut)}>{from}</SampleText></span>
      <span className="hkm-inbox-line">
        <span className="hkm-inbox-subject"><SampleText {...sample(optOut)}>{subject}</SampleText></span>
        <span className="hkm-muted"> · <SampleText {...sample(optOut)}>{preview}</SampleText></span>
      </span>
      <span className="hkm-inbox-time hkm-muted">{time}</span>
    </div>
  );
}

/** The default open message in the reading pane. */
export function InboxMessage({
  attributes,
  body,
  from,
  optOut,
  overlay,
  subject,
  time,
  to = "me",
}: Readonly<{ from: string; subject: string; body: string; time: string; to?: string; attributes?: MockupUnitAttributes; overlay?: ReactNode; optOut?: MockupOptOut }>) {
  return (
    <div {...attributes} className="hkm-unit hkm-inbox-message">
      {overlay}
      <div className="hkm-inbox-message-subject"><SampleText {...sample(optOut)}>{subject}</SampleText></div>
      <div className="hkm-inbox-message-head">
        <Avatar name={from} size={36} />
        <span className="hkm-inbox-message-who">
          <b><SampleText {...sample(optOut)}>{from}</SampleText></b>
          <span className="hkm-muted">to {to}</span>
        </span>
        <span className="hkm-muted">{time}</span>
      </div>
      <div className="hkm-inbox-message-body"><SampleParagraphs {...sample(optOut)} text={body} /></div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Article                                                             */
/* ------------------------------------------------------------------ */

/** A reader comment under an article. */
export type ArticleComment = Readonly<{ name: string; time: string; text: string; attributes?: MockupUnitAttributes; overlay?: ReactNode }>;

/**
 * A neutral news or blog article: masthead, kicker, title, dek, byline, a
 * lead picture, paragraphs, and optional comments. The title is styled text,
 * not a heading, so the host page's outline stays its own. `decorate` wraps
 * each paragraph so a skin can mark it.
 */
export function ArticlePage({
  byline,
  comments,
  date,
  decorate,
  dek,
  height,
  kicker,
  paragraphs,
  photo,
  site = "The Daily Example",
  title,
  url = "news.example/story",
  ...root
}: MockupRootProps &
  Readonly<{
    title: string;
    byline: string;
    paragraphs: readonly string[];
    dek?: string;
    kicker?: string;
    date?: string;
    site?: string;
    photo?: string;
    comments?: readonly ArticleComment[];
    decorate?: (paragraph: ReactNode, index: number) => ReactNode;
    url?: string;
    height?: number;
  }>) {
  const opt = sample(root.optOut);
  return (
    <MockupRoot {...root} kind="article">
      <BrowserWindow {...(height === undefined ? {} : { height })} url={url}>
        <div className="hkm-article">
          <div aria-hidden="true" className="hkm-article-masthead">
            <MockupGlyph name="menu" size={18} />
            <span className="hkm-article-site">{site}</span>
            <MockupGlyph name="search" size={18} />
          </div>
          <div className="hkm-article-body">
            {kicker === undefined ? null : <div className="hkm-article-kicker">{kicker}</div>}
            <div className="hkm-article-title"><SampleText {...opt}>{title}</SampleText></div>
            {dek === undefined ? null : <p className="hkm-article-dek"><SampleText {...opt}>{dek}</SampleText></p>}
            <div className="hkm-article-byline">
              <Avatar name={byline} size={28} />
              <span>By <SampleText {...opt}>{byline}</SampleText></span>
              {date === undefined ? null : <span className="hkm-muted">{date}</span>}
            </div>
            {photo === undefined ? null : <PlaceholderPhoto className="hkm-article-photo" ratio="3 / 2" seed={photo} />}
            <div className="hkm-article-text">
              {paragraphs.map((paragraph, index) => {
                const node = (
                  <p className="hkm-unit" key={index}>
                    <SampleText {...opt}>{paragraph}</SampleText>
                  </p>
                );
                return decorate === undefined ? node : <Fragment key={index}>{decorate(node, index)}</Fragment>;
              })}
            </div>
            {comments === undefined || comments.length === 0 ? null : (
              <div className="hkm-article-comments">
                <div className="hkm-article-comments-title">{comments.length} comments</div>
                {comments.map((comment, index) => (
                  <div key={index} {...comment.attributes} className="hkm-unit hkm-article-comment">
                    {comment.overlay}
                    <Avatar name={comment.name} size={30} />
                    <span className="hkm-article-comment-body">
                      <b><SampleText {...opt}>{comment.name}</SampleText></b>
                      <span className="hkm-muted"> {comment.time}</span>
                      <SampleParagraphs {...opt} text={comment.text} />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </BrowserWindow>
    </MockupRoot>
  );
}
