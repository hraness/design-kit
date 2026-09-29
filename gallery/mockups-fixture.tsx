import type { ReactElement } from "react";

import type * as Mockups from "../src/mockups/index.js";

/**
 * Every mockup frame and surface with invented sample content. Tests render
 * each entry in light and dark; a browser page can mount `MockupsFixture`
 * with `mockups.css`. Names, handles, and addresses are made up and use
 * reserved example domains.
 */
export const mockupFixtureHandles = ["mira", "jonas", "relay"] as const;

export type MockupFixture = Readonly<{ name: string; kind: string; render: (theme: Mockups.MockupTheme) => ReactElement }>;

export function mockupFixtures(api: typeof Mockups): readonly MockupFixture[] {
  const {
    AgentSession, ArticlePage, BrowserFrame, ChatThread, Inbox, InboxMessage, InboxRow, MacWindow, MenuBarPopover,
    PhoneFrame, SocialFeed, SocialPost, TerminalFrame, WorkFeed, WorkPost,
  } = api;
  const optOut = { "data-sample-skip": "" } as const;
  const rows = [
    { from: "Mira Okafor", subject: "Venue for Thursday", preview: "The upstairs room is free after six.", time: "9:14" },
    { from: "Jonas Berg", subject: "Invoice sent", preview: "Paid the same day, thanks.", time: "Mon" },
  ] as const;
  return Object.freeze([
    {
      name: "Browser frame", kind: "browser",
      render: (theme) => (
        <BrowserFrame describe="Illustration of a settings page in a browser window." optOut={optOut} theme={theme} url="https://relay.example/settings">
          <div style={{ display: "grid", gap: 10, padding: "18px 20px 22px" }}>
            <p style={{ fontSize: 17, fontWeight: 600 }}>Settings</p>
            <p style={{ color: "var(--hkm-muted)" }}>Two jobs run each night. Results go to the shared folder.</p>
          </div>
        </BrowserFrame>
      ),
    },
    {
      name: "Terminal frame", kind: "terminal",
      render: (theme) => (
        <TerminalFrame
          describe="Illustration of a terminal running one command."
          lines={[
            { kind: "input", text: "relay run job-01" },
            { kind: "output", text: "complete in 412 ms", tone: "ok" },
            { kind: "comment", text: "sample output" },
          ]}
          optOut={optOut}
          theme={theme}
        />
      ),
    },
    {
      name: "Desktop window", kind: "app-window",
      render: (theme) => (
        <MacWindow describe="Illustration of a desktop window with a sidebar." sidebar={<span>Jobs</span>} theme={theme} title="Relay">
          <p>Two jobs queued.</p>
        </MacWindow>
      ),
    },
    {
      name: "Menu bar", kind: "menubar",
      render: (theme) => (
        <MenuBarPopover
          describe="Illustration of a menu bar item with its menu open."
          footer="Updated just now"
          items={[
            { id: "sync", label: "Synced", detail: "All folders", tone: "ok", selected: true },
            { id: "queue", label: "Two jobs queued", tone: "warn" },
          ]}
          optOut={optOut}
          theme={theme}
          title="Relay"
        />
      ),
    },
    {
      name: "Phone frame", kind: "phone",
      render: (theme) => (
        <PhoneFrame describe="Illustration of a phone showing a list." screenHeight={420} theme={theme} width={220}>
          <div style={{ display: "grid", gap: 8 }}>
            <p style={{ fontSize: 17, fontWeight: 600 }}>Today</p>
            <p style={{ color: "var(--hkm-muted)" }}>Two jobs queued.</p>
          </div>
        </PhoneFrame>
      ),
    },
    {
      name: "Coding agent", kind: "agent",
      render: (theme) => (
        <AgentSession
          agent="generic-cli"
          describe="Illustration of a coding agent running tests."
          optOut={optOut}
          theme={theme}
          turns={[
            { role: "user", text: "Run the tests." },
            { role: "tool", text: "bun test", tool: "Run tests", status: "ok" },
            { role: "agent", text: "All tests pass." },
          ]}
        />
      ),
    },
    {
      name: "Chat thread", kind: "chat",
      render: (theme) => (
        <ChatThread
          contact="Mira"
          describe="Illustration of a short chat about a venue."
          messages={[
            { from: "them", text: "Is the upstairs room free?", time: "Today 9:14" },
            { from: "me", text: "Yes, after six." },
          ]}
          optOut={optOut}
          theme={theme}
        />
      ),
    },
    {
      name: "Social feed", kind: "social",
      render: (theme) => (
        <SocialFeed
          describe="Illustration of a social timeline with one post."
          optOut={optOut}
          posts={[{ name: "Mira Okafor", handle: "mira", time: "2h", text: "Night market opens at six." }]}
          renderPost={(post) => <SocialPost {...post} counts={[3, 1, 12, 240]} optOut={optOut} />}
          theme={theme}
        />
      ),
    },
    {
      name: "Work feed", kind: "work",
      render: (theme) => (
        <WorkFeed
          describe="Illustration of a work network feed with one post."
          optOut={optOut}
          posts={[{ name: "Jonas Berg", headline: "Operations lead", time: "1d", text: "We moved the rota to one shared sheet." }]}
          renderPost={(post) => <WorkPost {...post} optOut={optOut} reactions={[14, 2, 1]} />}
          theme={theme}
        />
      ),
    },
    {
      name: "Inbox", kind: "inbox",
      render: (theme) => (
        <Inbox
          describe="Illustration of a mail inbox with one message open."
          open={rows[0]}
          optOut={optOut}
          renderMessage={(row) => <InboxMessage body={"The upstairs room is free after six.\n\nSee you there."} from={row.from} optOut={optOut} subject={row.subject} time={row.time} />}
          renderRow={(row, index) => <InboxRow {...row} optOut={optOut} selected={index === 0} unread={index === 1} />}
          rows={rows}
          theme={theme}
          unread={2}
        />
      ),
    },
    {
      name: "Article page", kind: "article",
      render: (theme) => (
        <ArticlePage
          byline="Mira Okafor"
          comments={[{ name: "Jonas Berg", time: "1h", text: "The six o'clock start helps." }]}
          describe="Illustration of a news article with one comment."
          dek="Stalls open at six from next week."
          kicker="City"
          optOut={optOut}
          paragraphs={["The market moves to the square.", "Stalls open at six."]}
          theme={theme}
          title="Night market moves to the square"
        />
      ),
    },
  ] satisfies readonly MockupFixture[]);
}

/** All fixtures in light and in dark, side by side. */
export function MockupsFixture({ api }: Readonly<{ api: typeof Mockups }>) {
  const fixtures = mockupFixtures(api);
  return (
    <main data-mockups-fixture="">
      {(["light", "dark"] as const).map((theme) => (
        <section data-hkm-fixture-theme={theme} key={theme}>
          {fixtures.map((fixture) => (
            <figure data-hkm-fixture={fixture.kind} key={fixture.kind}>
              {fixture.render(theme)}
              <figcaption>{fixture.name}, {theme}</figcaption>
            </figure>
          ))}
        </section>
      ))}
    </main>
  );
}
