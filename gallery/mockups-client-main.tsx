// Browser entry for scripts/mockups-browser.ts: hydrates the built client
// shells over built mockup frames so the check runs what consumers install.
import { createRoot } from "react-dom/client";

// @ts-expect-error The built JavaScript intentionally has no colocated declarations.
import * as builtClient from "../dist/mockups/client.js";
// @ts-expect-error The built JavaScript intentionally has no colocated declarations.
import * as builtMockups from "../dist/mockups/index.js";
import type * as SourceClient from "../src/mockups/client.js";
import type * as SourceMockups from "../src/mockups/index.js";

const { ModeShowcase, StepThrough } = builtClient as typeof SourceClient;
const { BrowserFrame, TerminalFrame } = builtMockups as typeof SourceMockups;

type Mode = "plain" | "marked";
const modes = [
  { id: "plain", label: "Plain", hint: "Shows the plain page." },
  { id: "marked", label: "Marked", hint: "Marks each change." },
] as const;
const surfaces = [
  {
    id: "browser",
    label: "Browser",
    render: ({ mode }: Readonly<{ mode: Mode }>) => (
      <BrowserFrame describe={`Illustration of a page in ${mode} mode.`} url={`https://relay.example/${mode}`}>
        <p>Mode {mode}</p>
      </BrowserFrame>
    ),
  },
  {
    id: "terminal",
    label: "Terminal",
    render: ({ mode }: Readonly<{ mode: Mode }>) => (
      <TerminalFrame describe={`Illustration of a terminal in ${mode} mode.`} lines={[{ kind: "input", text: `relay ${mode}` }]} />
    ),
  },
] as const;
const steps = [1, 2, 3].map((n) => ({
  id: `step-${String(n)}`,
  label: `Step ${String(n)}`,
  hint: `Shows step ${String(n)}.`,
  render: () => <TerminalFrame describe={`Illustration of step ${String(n)}.`} lines={[{ kind: "output", text: `step ${String(n)}` }]} />,
}));
const caption = "Illustration. Names and text are made up.";

function mount(id: string) {
  const node = document.getElementById(id);
  if (node === null) throw new Error(`Missing #${id}`);
  return createRoot(node);
}
mount("showcase").render(<ModeShowcase caption={caption} modes={modes} status={({ mode }) => `Showing ${mode}`} surfaces={surfaces} />);
mount("steps").render(<StepThrough caption={caption} steps={steps} />);
requestAnimationFrame(() => requestAnimationFrame(() => { document.documentElement.dataset.ready = "true"; }));
