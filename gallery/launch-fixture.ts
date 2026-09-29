import type { LaunchBeat } from "../src/launch.js";

/** Canonical URL of the invented Relay launch post. */
export const launchFixtureUrl = "https://relay.example/blog/introducing-relay";

/** A complete, valid launch for the invented Relay product. Tests and the gallery share it. */
export const launchFixtureBeats: readonly LaunchBeat[] = Object.freeze([
  {
    id: "what",
    part: "what",
    headline: "Relay sends one message to every team channel",
    post: "Relay sends one message to every team channel you connect, and keeps the replies in one thread.",
    visual: { kind: "mockup", id: "inbox", state: { view: "thread" } },
    alt: "Illustration of one message and its replies gathered in one thread.",
  },
  {
    id: "does-inbox",
    part: "does",
    headline: "Replies come back to one place",
    post: "Replies from every connected channel land in one inbox, sorted by the message they answer.",
    visual: { kind: "mockup", id: "inbox", state: { view: "list" } },
    alt: "Illustration of an inbox with replies sorted by message.",
  },
  {
    id: "does-phone",
    part: "does",
    headline: "The phone app shows the same thread",
    post: "The phone app shows the same thread, so a reply can go out from anywhere.",
    visual: { kind: "clip", scene: "phone-reply" },
    alt: "A phone showing a reply being sent from the thread.",
  },
  {
    id: "how",
    part: "how",
    headline: "It connects through each channel's own sign-in",
    post: "Relay connects through each channel's own sign-in and sends {channelCount} message types.",
    visual: { kind: "diagram", src: "/images/relay-flow.svg" },
    alt: "Diagram of Relay between a person and their channels.",
    facts: ["channelCount"],
  },
  {
    id: "who",
    part: "who",
    headline: "Made for small teams with many channels",
    post: "Relay is for small teams that answer customers in several places and want one view of it.",
    visual: { kind: "mockup", id: "team", state: {} },
    alt: "Illustration of a team list with three people.",
  },
  {
    id: "vision",
    part: "vision",
    headline: "Where it goes next",
    post: "Next, Relay will let a team hand a thread to a teammate without copying it anywhere.",
    visual: { kind: "mockup", id: "handoff", state: {} },
    alt: "Illustration of a thread moving from one person to another.",
  },
  {
    id: "limits",
    part: "limits",
    headline: "What it does not do yet",
    post: "Relay does not read voice messages yet, and it keeps history for {historyDays} days.",
    visual: { kind: "mockup", id: "settings", state: { tab: "history" } },
    alt: "Illustration of the history setting.",
    facts: ["historyDays"],
  },
  {
    id: "status",
    part: "status",
    headline: "Relay is in preview",
    post: "Relay is in Preview. Read the full post for setup notes.",
    visual: { kind: "mockup", id: "status", state: {} },
    alt: "Illustration of the Relay settings page with a Preview label.",
  },
]);

export const launchFixtureFacts = Object.freeze({
  channelCount: { value: "6", source: "src/channels.ts" },
  historyDays: { value: "90", source: "release notes v0.4.0" },
});

export const launchFixtureMessaging = Object.freeze({
  names: { name: "Relay" },
  tagline: "One thread for every team channel",
  meta: "Relay sends one message to every team channel you connect and keeps the replies in one thread.",
});
