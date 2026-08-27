import { expect, test } from "bun:test";
import { PlayIcon, StopIcon } from "@hugeicons/core-free-icons";
import { Icon, Spinner, ToggleButton } from "@hraness/ui";
import * as stylex from "@stylexjs/stylex";
import {
  Children,
  createRef,
  isValidElement,
  type ReactNode,
} from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  PlaybackTransport,
  type PlaybackTransportStatus,
} from "./playback-transport";
import { playbackTransportStyles } from "./playback-transport.stylex";

const statuses = ["idle", "pending", "playing"] as const satisfies
  readonly PlaybackTransportStatus[];

function renderTransport(status: PlaybackTransportStatus): string {
  return renderToStaticMarkup(
    <PlaybackTransport
      aria-label="Preview controls"
      onPlay={() => undefined}
      onStop={() => undefined}
      status={status}
    />,
  );
}

function semanticButtons(markup: string): readonly string[] {
  return [...markup.matchAll(/<button\b[^>]*>/gu)].map((match) => match[0]);
}

function jellyHosts(markup: string): readonly string[] {
  return [...markup.matchAll(/<jelly-card\b[^>]*>/gu)].map((match) => match[0]);
}

function commandFor(status: PlaybackTransportStatus) {
  const transport = PlaybackTransport({
    "aria-label": "Preview controls",
    onPlay: () => undefined,
    onStop: () => undefined,
    status,
  });
  if (!isValidElement<{ readonly children?: ReactNode }>(transport)) {
    throw new Error("PlaybackTransport did not return its toolbar element.");
  }
  const command = Children.toArray(transport.props.children)[0];
  if (!isValidElement<Record<string, unknown>>(command)) {
    throw new Error("PlaybackTransport did not return its combined command first.");
  }
  return command;
}

test("playback transport renders one stable icon command through every lifecycle state", () => {
  for (const status of statuses) {
    const html = renderTransport(status);
    const buttons = semanticButtons(html);
    const host = jellyHosts(html)[0] ?? "";

    expect(html).toContain('role="toolbar"');
    expect(html).toContain('aria-label="Preview controls"');
    expect(html).toContain(`data-playback-status="${status}"`);
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toContain('class="hraness-icon-button__control"');
    expect(html).toContain("hraness-design-playback-transport__button");
    expect(html).toContain('data-size="large"');
    expect(html).toContain('data-variant="primary"');
    expect(host).toBe("");
    expect(html).not.toContain("hraness-button__label");
  }

  const idle = renderTransport("idle");
  const pending = renderTransport("pending");
  const playing = renderTransport("playing");
  const idleControl = semanticButtons(idle)[0] ?? "";
  const pendingControl = semanticButtons(pending)[0] ?? "";
  const playingControl = semanticButtons(playing)[0] ?? "";

  expect(idleControl).toContain('aria-label="Play"');
  expect(idleControl).toContain('data-playback-command="play"');
  expect(idleControl).not.toContain('disabled=""');
  expect(idleControl).not.toContain('aria-busy="true"');
  expect(pendingControl).toContain('aria-label="Cancel playback start"');
  expect(pendingControl).toContain('data-playback-command="stop"');
  expect(pending).toContain('aria-busy="true"');
  expect(pendingControl).not.toContain('disabled=""');
  expect(pending).toContain("hraness-spinner");
  expect(pending).not.toContain('data-slot="icon"');
  expect(playingControl).toContain('aria-label="Stop"');
  expect(playingControl).toContain('data-playback-command="stop"');
  expect(playingControl).not.toContain('aria-busy="true"');
  expect(playingControl).not.toContain('disabled=""');
  expect(idle).toContain('data-slot="icon"');
  expect(playing).toContain('data-slot="icon"');
});

test("each lifecycle state renders the matching command glyph, label, and logical recipe", () => {
  const idle = commandFor("idle");
  const pending = commandFor("pending");
  const playing = commandFor("playing");
  const idleGlyph = idle.props.children;
  const pendingGlyph = pending.props.children;
  const playingGlyph = playing.props.children;
  const expectedGlyphClassName = stylex.props(
    playbackTransportStyles.glyph,
  ).className;
  const expectedGlyphClasses = expectedGlyphClassName
    ?.split(" ")
    .filter(Boolean) ?? [];

  expect(expectedGlyphClasses).toHaveLength(2);
  for (const [status, glyph] of [
    ["idle", idleGlyph],
    ["pending", pendingGlyph],
    ["playing", playingGlyph],
  ] as const) {
    if (!isValidElement<{ readonly className?: string }>(glyph)) {
      throw new Error(`PlaybackTransport did not render its ${status} glyph.`);
    }
    expect(glyph.props.className).toBe(expectedGlyphClassName);
    expect(glyph.props.className?.split(" ").filter(Boolean)).toEqual(
      expectedGlyphClasses,
    );
  }

  expect(idle.props["aria-label"]).toBe("Play");
  expect(pending.props["aria-label"]).toBe("Cancel playback start");
  expect(playing.props["aria-label"]).toBe("Stop");
  expect(isValidElement(idleGlyph) && idleGlyph.type).toBe(Icon);
  expect(isValidElement(pendingGlyph) && pendingGlyph.type).toBe(Spinner);
  expect(isValidElement(playingGlyph) && playingGlyph.type).toBe(Icon);
  expect(isValidElement<{ readonly icon?: unknown; readonly size?: number }>(idleGlyph)
    && idleGlyph.props.icon).toBe(PlayIcon);
  expect(isValidElement<{ readonly icon?: unknown; readonly size?: number }>(playingGlyph)
    && playingGlyph.props.icon).toBe(StopIcon);
  expect(isValidElement<{ readonly size?: number }>(idleGlyph)
    && idleGlyph.props.size).toBe(24);
  expect(isValidElement<{ readonly size?: number }>(playingGlyph)
    && playingGlyph.props.size).toBe(24);
});

test("accessible naming, caller classes, and button targeting hooks remain exact", () => {
  const buttonRef = createRef<HTMLButtonElement>();
  const transport = PlaybackTransport({
    "aria-labelledby": "transport-label",
    buttonAriaKeyShortcuts: "Space",
    buttonId: "preview-command",
    buttonRef,
    className: "consumer-transport",
    onPlay: () => undefined,
    onStop: () => undefined,
    pendingLabel: "Cancel preview",
    playLabel: "Start preview",
    status: "idle",
    stopLabel: "End preview",
  });
  if (!isValidElement<{ readonly children?: ReactNode }>(transport)) {
    throw new Error("PlaybackTransport did not return its toolbar element.");
  }
  const command = Children.toArray(transport.props.children)[0];
  if (!isValidElement<Record<string, unknown>>(command)) {
    throw new Error("PlaybackTransport did not return its combined command first.");
  }

  expect(command.props.buttonRef).toBe(buttonRef);
  expect(command.props.id).toBe("preview-command");
  expect(command.props["aria-keyshortcuts"]).toBe("Space");
  expect(command.props["aria-label"]).toBe("Start preview");

  const html = renderToStaticMarkup(transport);
  const toolbar = html.match(/<div\b[^>]*role="toolbar"[^>]*>/u)?.[0] ?? "";
  const classes = toolbar.match(/class="(?<classes>[^"]+)"/u)?.groups?.classes
    ?.split(" ") ?? [];
  expect(toolbar).toContain('aria-labelledby="transport-label"');
  expect(toolbar).not.toContain('aria-label="Preview controls"');
  expect(classes[0]).toBe("hraness-toolbar");
  expect(classes[1]).toBe("hraness-design-playback-transport");
  expect(classes.at(-1)).toBe("consumer-transport");
  expect(classes.some((className) => /^x[a-z0-9]+$/u.test(className))).toBe(true);
  expect(toolbar).not.toContain("style=");
  expect(html).toContain('id="preview-command"');
});

test("the combined command starts idle playback and stops pending or active playback", () => {
  let playCount = 0;
  let stopCount = 0;

  for (const status of statuses) {
    const transport = PlaybackTransport({
      "aria-label": "Preview controls",
      onPlay: () => {
        playCount += 1;
      },
      onStop: () => {
        stopCount += 1;
      },
      status,
    });
    if (!isValidElement<{ readonly children?: ReactNode }>(transport)) {
      throw new Error("PlaybackTransport did not return its toolbar element.");
    }
    const command = Children.toArray(transport.props.children)[0];
    if (!isValidElement<{ readonly onPress?: () => void }>(command)) {
      throw new Error("PlaybackTransport did not return its combined command first.");
    }
    command.props.onPress?.();
  }

  expect(playCount).toBe(1);
  expect(stopCount).toBe(2);
});

test("only an unavailable idle Play command is natively disabled", () => {
  const idle = renderToStaticMarkup(
    <PlaybackTransport
      aria-label="Preview controls"
      isPlayDisabled
      onPlay={() => undefined}
      onStop={() => undefined}
      status="idle"
    />,
  );
  const pending = renderToStaticMarkup(
    <PlaybackTransport
      aria-label="Preview controls"
      isPlayDisabled
      onPlay={() => undefined}
      onStop={() => undefined}
      status="pending"
    />,
  );

  expect(semanticButtons(idle)[0]).toContain('disabled=""');
  expect(semanticButtons(pending)[0]).not.toContain('disabled=""');
});

test("the optional trailing slot follows the single lifecycle command", () => {
  const html = renderToStaticMarkup(
    <PlaybackTransport
      aria-label="Loop preview"
      onPlay={() => undefined}
      onStop={() => undefined}
      status="idle"
      trailingControls={<ToggleButton isSelected>Loop</ToggleButton>}
    />,
  );

  const commandIndex = html.indexOf('data-playback-command="play"');
  const loopIndex = html.indexOf(">Loop</button>");

  expect(commandIndex).toBeGreaterThan(-1);
  expect(loopIndex).toBeGreaterThan(commandIndex);
  expect(html).toContain('aria-pressed="true"');
});

test("the transport composes extracted logical presentation with no legacy visual selector", async () => {
  const [components, styles] = await Promise.all([
    Bun.file(new URL("../components.css", import.meta.url)).text(),
    Bun.file(new URL("./playback-transport.stylex.ts", import.meta.url)).text(),
  ]);

  expect(components).not.toContain(".hraness-design-playback-transport {");
  expect(components).not.toContain(
    '.hraness-design-playback-transport__button :is(svg, [data-slot="spinner"])',
  );
  expect(components).not.toContain(".hraness-icon-button__control {");
  expect(styles).toContain('"inline-size": "1.5rem"');
  expect(styles).toContain('"block-size": "1.5rem"');
  expect(styles).not.toMatch(/\b(?:height|width):\s*"1\.5rem"/u);
});

test("the transport owns presentation states but no product playback machinery", async () => {
  const source = await Bun.file(
    new URL("./playback-transport.tsx", import.meta.url),
  ).text();

  for (const productConcern of [
    "AudioContext",
    "requestMIDIAccess",
    "setInterval",
    "setTimeout",
    "requestAnimationFrame",
  ]) {
    expect(source).not.toContain(productConcern);
  }
});
