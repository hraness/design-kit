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
  render: () => <TerminalFrame describe={`Illustration of step ${String(n)}.`} lines={Array.from({ length: n * 3 }, (_, line) => ({ kind: "output" as const, text: `step ${String(n)} line ${String(line)}` }))} />,
}));
const fillSteps = [
  { id: "command", label: "Run", render: () => <TerminalFrame density="presentation" describe="A terminal starts a saved job." lines={[
    { kind: "input", text: "relay run" }, { kind: "output", text: "Job saved.", tone: "ok" },
  ]} /> },
  { id: "report", label: "Read", render: () => <BrowserFrame describe="A report lists the completed work." height={360} url="https://relay.example/report">
    <div style={{ padding: "1.5rem" }}><p>Completed jobs</p><p>Read the result and choose the next job.</p></div>
  </BrowserFrame> },
  { id: "details", label: "Inspect", render: () => <TerminalFrame density="presentation" describe="A terminal lists the steps in a completed job." lines={Array.from({ length: 10 }, (_, index) => ({
    kind: "output" as const, text: `Step ${index + 1}: read the saved project notes.`,
  }))} /> },
];
const fillModes = [{ id: "short", label: "Short" }, { id: "long", label: "Long" }] as const;
const fillOptions = [{ id: "normal", label: "Normal" }, { id: "full", label: "Full" }] as const;
const fillSurfaces = [
  { id: "terminal", label: "Terminal", render: ({ mode, option }: Readonly<{ mode: "short" | "long"; option: "normal" | "full" | undefined }>) => (
    <TerminalFrame density="presentation" describe="A terminal shows the selected amount of saved project context." height={180} lines={mode === "short" ? [
      { kind: "input", text: "relay run" }, { kind: "output", text: "Job saved.", tone: "ok" },
    ] : Array.from({ length: option === "full" ? 12 : 6 }, (_, index) => ({ kind: "output" as const, text: `Step ${index + 1}: read the saved project notes.` }))} />
  ) },
  { id: "report", label: "Report", render: () => <BrowserFrame describe="A report gives the completed job summary." height={220} url="https://relay.example/report"><p>Completed jobs</p><p>Read the saved result.</p></BrowserFrame> },
];
const caption = "Illustration. Names and text are made up.";

function mount(id: string) {
  const node = document.getElementById(id);
  if (node === null) throw new Error(`Missing #${id}`);
  return createRoot(node);
}
mount("showcase").render(<ModeShowcase caption={caption} modes={modes} status={({ mode }) => `Showing ${mode}`} surfaces={surfaces} />);
mount("steps").render(<StepThrough caption={caption} steps={steps} />);
const filledModes = mount("fill-modes");
window.addEventListener("mockups:unmount-mode-fill", () => filledModes.unmount(), { once: true });
filledModes.render(<ModeShowcase fit="fill" height={280} modes={fillModes} options={fillOptions} surfaces={fillSurfaces} />);
mount("fill-steps").render(<StepThrough fit="fill" minWidth={280} steps={fillSteps} />);
requestAnimationFrame(() => requestAnimationFrame(() => { document.documentElement.dataset.ready = "true"; }));
