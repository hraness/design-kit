import { afterEach, expect, test } from "bun:test";
import { parseHTML } from "linkedom";

import {
  buildBlueskyShareIntentUrl,
  buildLinkedInShareIntentUrl,
  buildXShareIntentUrl,
  copyTextToClipboard,
  downloadBlob,
  shareFileNatively,
} from "./artifact-share";

const globalRecord = globalThis as unknown as Record<string, unknown>;
const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, "navigator");
const originalCreateObjectUrl = URL.createObjectURL;
const originalRevokeObjectUrl = URL.revokeObjectURL;

afterEach(() => {
  if (originalDocument === undefined) Reflect.deleteProperty(globalRecord, "document");
  else Object.defineProperty(globalThis, "document", originalDocument);
  if (originalNavigator === undefined) Reflect.deleteProperty(globalRecord, "navigator");
  else Object.defineProperty(globalThis, "navigator", originalNavigator);
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: originalCreateObjectUrl,
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: originalRevokeObjectUrl,
  });
});

test("social intents preserve prepared text and encode one canonical artifact URL", () => {
  const input = {
    text: "Compare ‘Alpha’ & Beta ✨",
    url: " https://example.test/cards/alpha?view=full#foil ",
  };
  const x = new URL(buildXShareIntentUrl(input));
  const bluesky = new URL(buildBlueskyShareIntentUrl(input));
  const linkedIn = new URL(buildLinkedInShareIntentUrl(input.url));

  expect(`${x.origin}${x.pathname}`).toBe("https://x.com/intent/post");
  expect(x.searchParams.get("text")).toBe(input.text);
  expect(x.searchParams.get("url")).toBe(
    "https://example.test/cards/alpha?view=full#foil",
  );
  expect(`${bluesky.origin}${bluesky.pathname}`).toBe(
    "https://bsky.app/intent/compose",
  );
  expect(bluesky.searchParams.get("text")).toBe(
    `${input.text}\nhttps://example.test/cards/alpha?view=full#foil`,
  );
  expect(`${linkedIn.origin}${linkedIn.pathname}`).toBe(
    "https://www.linkedin.com/sharing/share-offsite/",
  );
  expect(linkedIn.searchParams.get("url")).toBe(
    "https://example.test/cards/alpha?view=full#foil",
  );
  expect([...linkedIn.searchParams.keys()]).toEqual(["url"]);
});

test("intent builders reject blank content, relative URLs, and non-web schemes", () => {
  expect(() => buildXShareIntentUrl({ text: " ", url: "https://example.test" }))
    .toThrow("share text must contain");
  expect(() => buildLinkedInShareIntentUrl("/cards/alpha"))
    .toThrow("must be an absolute URL");
  expect(() => buildBlueskyShareIntentUrl({
    text: "Artifact",
    url: "javascript:alert(1)",
  })).toThrow("must use HTTP or HTTPS");
});

test("clipboard copying preserves exact caller-prepared text", async () => {
  const writes: string[] = [];
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      clipboard: {
        writeText: async (text: string) => {
          writes.push(text);
        },
      },
    },
  });
  await copyTextToClipboard("  exact text\nwith spacing  ");
  expect(writes).toEqual(["  exact text\nwith spacing  "]);

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {},
  });
  await expect(copyTextToClipboard("text")).rejects.toThrow("unavailable");
});

test("blob downloads use a temporary hidden anchor and always revoke their URL", async () => {
  const { document } = parseHTML("<!doctype html><html><body></body></html>");
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: document,
  });
  const revoked: string[] = [];
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: () => "blob:https://example.test/artifact",
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: (url: string) => revoked.push(url),
  });

  const clicks: Array<Readonly<{
    download: string;
    hidden: boolean;
    href: string;
  }>> = [];
  document.body.addEventListener("click", (event) => {
    const anchor = event.target as HTMLAnchorElement;
    clicks.push({
      download: anchor.download,
      hidden: Boolean(anchor.hidden),
      href: anchor.href,
    });
    event.preventDefault();
  });
  downloadBlob(new Blob(["image bytes"], { type: "image/png" }), " card.png ");

  expect(clicks).toEqual([{
    download: "card.png",
    hidden: true,
    href: "blob:https://example.test/artifact",
  }]);
  expect(document.body.querySelector("a")).toBeNull();
  expect(revoked).toEqual([]);
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(revoked).toEqual(["blob:https://example.test/artifact"]);
  expect(() => downloadBlob(new Blob(), " \n ")).toThrow(
    "filename must contain",
  );
});

test("native file sharing uses files-only capability and share payloads", async () => {
  const payloads: ShareData[] = [];
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      canShare: (data: ShareData) => {
        payloads.push(data);
        return true;
      },
      share: async (data: ShareData) => {
        payloads.push(data);
      },
    },
  });
  const file = new File(["artifact"], "artifact.png", { type: "image/png" });

  expect(await shareFileNatively(file)).toEqual({ kind: "shared" });
  expect(payloads).toHaveLength(2);
  for (const payload of payloads) {
    expect(Object.keys(payload)).toEqual(["files"]);
    expect(payload.files).toEqual([file]);
  }
});

test("native sharing distinguishes cancellation, unavailability, and failure", async () => {
  const file = new File(["artifact"], "artifact.png", { type: "image/png" });
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {},
  });
  expect(await shareFileNatively(file)).toEqual({ kind: "unavailable" });

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { canShare: () => false, share: async () => {} },
  });
  expect(await shareFileNatively(file)).toEqual({ kind: "unavailable" });

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      canShare: () => true,
      share: async () => {
        throw Object.assign(new Error("dismissed"), { name: "AbortError" });
      },
    },
  });
  expect(await shareFileNatively(file)).toEqual({ kind: "cancelled" });

  const failure = new Error("share failed");
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      canShare: () => true,
      share: async () => {
        throw failure;
      },
    },
  });
  expect(await shareFileNatively(file)).toEqual({ error: failure, kind: "failed" });
});
