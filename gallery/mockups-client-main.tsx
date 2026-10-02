// Browser entry for scripts/mockups-browser.ts: hydrates the built client
// shells over built mockup frames so the check runs what consumers install.
import { createRoot } from "react-dom/client";

// @ts-expect-error The built JavaScript intentionally has no colocated declarations.
import * as builtClient from "../dist/mockups/client.js";
// @ts-expect-error The built JavaScript intentionally has no colocated declarations.
import * as builtMockups from "../dist/mockups/index.js";
import type * as SourceClient from "../src/mockups/client.js";
import type * as SourceMockups from "../src/mockups/index.js";

const { FitToWidth, ModeShowcase, StepThrough } = builtClient as typeof SourceClient;
const { BrowserFrame, PhoneFrame, TerminalFrame } = builtMockups as typeof SourceMockups;

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
  { id: "command", label: "Run", hint: "Choose the first command and inspect its saved result.", render: () => <TerminalFrame density="presentation" describe="A terminal starts a saved job." lines={[
    { kind: "input", text: "relay run" }, { kind: "output", text: "Job saved.", tone: "ok" },
  ]} /> },
  { id: "report", label: "Read", hint: "Review the complete report, including the saved rows and the checks that explain what changed between runs.", render: () => <BrowserFrame describe="A report lists the completed work." height={360} url="https://relay.example/report">
    <div style={{ padding: "1.5rem" }}><p>Completed jobs</p><p>Read the result and choose the next job.</p></div>
  </BrowserFrame> },
  { id: "details", label: "Inspect", hint: "Keep useful context beside the result.", render: () => <TerminalFrame density="presentation" describe="A terminal lists the steps in a completed job." lines={Array.from({ length: 10 }, (_, index) => ({
    kind: "output" as const, text: `Step ${index + 1}: read the saved project notes.`,
  }))} /> },
];
const fillModes = [{ id: "short", label: "Short", hint: "Shows the result." }, { id: "long", label: "Long", hint: "Read the complete saved project context, including each recorded step and the surrounding notes that explain the result." }] as const;
const fillOptions = [{ id: "normal", label: "Normal", hint: "A short summary." }, { id: "full", label: "Full", hint: "Includes all saved steps and the notes used to prepare them." }] as const;
const fillSurfaces = [
  { id: "terminal", label: "Terminal", render: ({ mode, option }: Readonly<{ mode: "short" | "long"; option: "normal" | "full" | undefined }>) => (
    <TerminalFrame density="presentation" describe="A terminal shows the selected amount of saved project context." height={180} lines={mode === "short" ? [
      { kind: "input", text: "relay run" }, { kind: "output", text: "Job saved.", tone: "ok" },
    ] : Array.from({ length: option === "full" ? 12 : 6 }, (_, index) => ({ kind: "output" as const, text: `Step ${index + 1}: read the saved project notes.` }))} />
  ) },
  { id: "report", label: "Report", hint: "See the report beside its source.", render: () => <BrowserFrame describe="A report gives the completed job summary." height={220} url="https://relay.example/report"><p>Completed jobs</p><p>Read the saved result.</p></BrowserFrame> },
];
const mixedSteps = [
  { id: "phone", label: "Phone", render: () => <PhoneFrame describe="A phone shows the saved reading list." screenHeight={600}>
    <div style={{ padding: "3rem 1rem" }}><p>Today’s reading</p><p>A saved story keeps its source and summary.</p></div>
  </PhoneFrame> },
  { id: "graphic", label: "Graphic", render: () => <FitToWidth minWidth={640}>
    <BrowserFrame describe="A deliberately scaled desktop illustration shows a story and its export." url="https://relay.example/story">
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 760, padding: "1.5rem" }}><p>The source and summary stay together.</p>
        <TerminalFrame density="presentation" describe="A terminal drawn inside the desktop illustration." lines={[
          { kind: "input", text: "relay export story" }, { kind: "output", text: "Saved story.md" },
        ]} />
      </div>
    </BrowserFrame>
  </FitToWidth> },
  { id: "terminal", label: "Terminal", render: () => <TerminalFrame density="presentation" describe="A readable terminal exports the saved reading list." lines={[
    { kind: "input", text: "relay export today" }, { kind: "output", text: "Saved reading.md" },
  ]} /> },
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
filledModes.render(<ModeShowcase fit="fill" height={280} initial={{ surface: "report", mode: "long", option: "full" }} modes={fillModes} options={fillOptions} surfaces={fillSurfaces} />);
mount("fill-steps").render(<StepThrough fit="fill" minWidth={280} steps={fillSteps} />);
mount("fill-mixed").render(<StepThrough fit="fill" steps={mixedSteps} />);
mount("fill-mixed-modes").render(<ModeShowcase fit="fill" height={280} modes={[{ id: "saved", label: "Saved" }]} surfaces={mixedSteps} />);
requestAnimationFrame(() => requestAnimationFrame(() => { document.documentElement.dataset.ready = "true"; }));
