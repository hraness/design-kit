export interface ArtifactShareIntent {
  readonly text: string;
  readonly url: string;
}

export type NativeFileShareResult =
  | Readonly<{ kind: "shared" }>
  | Readonly<{ kind: "cancelled" }>
  | Readonly<{ kind: "unavailable" }>
  | Readonly<{ error: unknown; kind: "failed" }>;

function nonblank(value: string, label: string): string {
  if (value.trim().length === 0) {
    throw new RangeError(`${label} must contain a non-whitespace character.`);
  }
  return value;
}

function publicWebUrl(value: string): string {
  const normalized = nonblank(value, "An artifact share URL").trim();
  let url: URL;
  try {
    url = new URL(normalized);
  } catch {
    throw new RangeError("An artifact share URL must be an absolute URL.");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new RangeError("An artifact share URL must use HTTP or HTTPS.");
  }
  return url.href;
}

function normalizedIntent(input: ArtifactShareIntent): ArtifactShareIntent {
  return {
    text: nonblank(input.text, "Artifact share text"),
    url: publicWebUrl(input.url),
  };
}

/** Builds an X compose intent without opening a window or posting content. */
export function buildXShareIntentUrl(input: ArtifactShareIntent): string {
  const { text, url } = normalizedIntent(input);
  const intent = new URL("https://x.com/intent/post");
  intent.searchParams.set("text", text);
  intent.searchParams.set("url", url);
  return intent.href;
}

/** Builds LinkedIn's URL-only offsite share dialog. */
export function buildLinkedInShareIntentUrl(url: string): string {
  const intent = new URL("https://www.linkedin.com/sharing/share-offsite/");
  intent.searchParams.set("url", publicWebUrl(url));
  return intent.href;
}

/** Builds a Bluesky compose intent with the URL on its own editable line. */
export function buildBlueskyShareIntentUrl(input: ArtifactShareIntent): string {
  const { text, url } = normalizedIntent(input);
  const intent = new URL("https://bsky.app/intent/compose");
  intent.searchParams.set("text", `${text}\n${url}`);
  return intent.href;
}

/** Copies exact caller-prepared text through the secure-context Clipboard API. */
export async function copyTextToClipboard(text: string): Promise<void> {
  const clipboard = globalThis.navigator?.clipboard;
  if (clipboard === undefined || typeof clipboard.writeText !== "function") {
    throw new Error("Clipboard text writing is unavailable in this environment.");
  }
  await clipboard.writeText(text);
}

/**
 * Starts a browser download and releases the temporary object URL in the next
 * task, after the synthetic link activation has been dispatched.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const normalizedFilename = nonblank(filename, "A download filename").trim();
  const document = globalThis.document;
  if (
    document === undefined
    || typeof URL.createObjectURL !== "function"
    || typeof URL.revokeObjectURL !== "function"
  ) {
    throw new Error("Blob downloads are unavailable in this environment.");
  }

  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.download = normalizedFilename;
  anchor.hidden = true;
  anchor.href = objectUrl;
  anchor.rel = "noopener";
  document.body.append(anchor);
  try {
    anchor.click();
  } finally {
    anchor.remove();
    globalThis.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
  }
}

function isAbortError(error: unknown): boolean {
  return typeof error === "object"
    && error !== null
    && "name" in error
    && error.name === "AbortError";
}

function filesOnlyShareData(file: File): ShareData {
  return { files: [file] };
}

function nativeFileShareNavigator(): Navigator | undefined {
  const shareNavigator = globalThis.navigator;
  if (
    shareNavigator === undefined
    || typeof shareNavigator.canShare !== "function"
    || typeof shareNavigator.share !== "function"
  ) {
    return undefined;
  }
  return shareNavigator;
}

function canShareFileWithNavigator(
  shareNavigator: Navigator,
  file: File,
): boolean {
  try {
    return shareNavigator.canShare(filesOnlyShareData(file));
  } catch {
    return false;
  }
}

/** Checks native file-share support using a files-only Web Share payload. */
export function canShareFileNatively(file: File): boolean {
  const shareNavigator = nativeFileShareNavigator();
  return shareNavigator !== undefined
    && canShareFileWithNavigator(shareNavigator, file);
}

/**
 * Opens the native share sheet with one already-prepared file. No text, title,
 * or URL is added to either capability detection or the share call.
 */
export async function shareFileNatively(file: File): Promise<NativeFileShareResult> {
  const shareNavigator = nativeFileShareNavigator();
  if (
    shareNavigator === undefined
    || !canShareFileWithNavigator(shareNavigator, file)
  ) {
    return { kind: "unavailable" };
  }

  try {
    await shareNavigator.share(filesOnlyShareData(file));
    return { kind: "shared" };
  } catch (error) {
    if (isAbortError(error)) return { kind: "cancelled" };
    return { error, kind: "failed" };
  }
}
