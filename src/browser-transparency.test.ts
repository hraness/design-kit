import { expect, test } from "bun:test";
import type { Page } from "playwright-core";
import { withTransparencyPreference } from "../scripts/browser-transparency.js";

function fixture(options: { mediaMatches?: boolean; rejectRestore?: boolean; rejectScroll?: boolean; rejectDetach?: boolean } = {}) {
  const initial = {
    scrollX: 13, scrollY: 27,
    features: [
      { name: "prefers-color-scheme", value: "dark" },
      { name: "prefers-reduced-motion", value: "reduce" },
      { name: "prefers-reduced-transparency", value: "reduce" },
      { name: "forced-colors", value: "none" },
    ],
  };
  const messages: { method: string; parameters: unknown }[] = [];
  const evaluations: unknown[] = [];
  let detached = false;
  const page = {
    evaluate: async (_expression: unknown, argument: unknown) => {
      evaluations.push(argument);
      if (evaluations.length === 1) return initial;
      if (Array.isArray(argument)) return options.mediaMatches ?? true;
      if (options.rejectScroll) throw new Error("scroll failed");
      return undefined;
    },
    context: () => ({ newCDPSession: async () => ({
      send: async (method: string, parameters: unknown) => {
        messages.push({ method, parameters });
        if (options.rejectRestore && messages.length === 2) throw new Error("restore failed");
      },
      detach: async () => {
        detached = true;
        if (options.rejectDetach) throw new Error("detach failed");
      },
    }) }),
  } as unknown as Page;
  return { page, initial, messages, evaluations, detached: () => detached };
}

test("transparency inspection preserves unrelated media and restores the original preference and scroll", async () => {
  for (const value of ["no-preference", "reduce"] as const) {
    const state = fixture();
    expect(await withTransparencyPreference(state.page, value, async () => "native evidence")).toBe("native evidence");
    expect(state.messages).toEqual([
      { method: "Emulation.setEmulatedMedia", parameters: { features: state.initial.features.map((feature) =>
        feature.name === "prefers-reduced-transparency" ? { ...feature, value } : feature) } },
      { method: "Emulation.setEmulatedMedia", parameters: { features: state.initial.features } },
    ]);
    expect(state.evaluations).toEqual([undefined, state.initial.features.map((feature) =>
      feature.name === "prefers-reduced-transparency" ? { ...feature, value } : feature), state.initial]);
    expect(state.detached()).toBe(true);
  }
});

test("a failed paint inspection still restores media and scroll and detaches", async () => {
  const state = fixture();
  await expect(withTransparencyPreference(state.page, "no-preference", async () => {
    throw new Error("paint failed");
  })).rejects.toThrow("paint failed");
  expect(state.messages.at(-1)?.parameters).toEqual({ features: state.initial.features });
  expect(state.evaluations.at(-1)).toEqual(state.initial);
  expect(state.detached()).toBe(true);
});

test("one media owner verifies each accessibility transition before restoring the original state", async () => {
  const state = fixture();
  await withTransparencyPreference(state.page, "no-preference", async (select) => {
    await select("reduce");
    await select("no-preference");
  });
  expect(state.evaluations).toEqual([undefined, ...["no-preference", "reduce", "no-preference"].map((value) =>
    state.initial.features.map((feature) => feature.name === "prefers-reduced-transparency"
      ? { ...feature, value } : feature)), state.initial]);
  expect(state.messages).toHaveLength(4);
  expect(state.messages.at(-1)?.parameters).toEqual({ features: state.initial.features });
  expect(state.detached()).toBe(true);
});

test("unsupported emulation cannot certify paint evidence and still restores the fixture", async () => {
  const state = fixture({ mediaMatches: false });
  let inspected = false;
  await expect(withTransparencyPreference(state.page, "no-preference", async () => {
    inspected = true;
  })).rejects.toThrow("Fixture media emulation did not apply");
  expect(inspected).toBe(false);
  expect(state.messages.at(-1)?.parameters).toEqual({ features: state.initial.features });
  expect(state.detached()).toBe(true);
});

test("a failed media restoration cannot skip scroll restoration or session detachment", async () => {
  const state = fixture({ rejectRestore: true });
  await expect(withTransparencyPreference(state.page, "no-preference", async () => undefined)).rejects.toThrow("restore failed");
  expect(state.evaluations.at(-1)).toEqual(state.initial);
  expect(state.detached()).toBe(true);
});

test("a forced-color case keeps ordinary transparency and its selected color scheme in the same verified update", async () => {
  const state = fixture();
  await withTransparencyPreference(state.page, "no-preference", async (select) => {
    await select("no-preference", { forcedColors: "active", colorScheme: "light" });
  });
  const forced = [
    { name: "prefers-color-scheme", value: "light" },
    { name: "prefers-reduced-motion", value: "reduce" },
    { name: "prefers-reduced-transparency", value: "no-preference" },
    { name: "forced-colors", value: "active" },
  ];
  expect(state.messages[1]?.parameters).toEqual({ features: forced });
  expect(state.evaluations[2]).toEqual(forced);
  expect(state.messages.at(-1)?.parameters).toEqual({ features: state.initial.features });
  expect(state.detached()).toBe(true);
});

test("combined inspection and cleanup failures retain the original failure and every cleanup diagnosis", async () => {
  const state = fixture({ rejectRestore: true, rejectScroll: true, rejectDetach: true });
  let failure: unknown;
  try {
    await withTransparencyPreference(state.page, "no-preference", async () => {
      throw new Error("paint failed");
    });
  } catch (error) { failure = error; }
  expect(failure).toBeInstanceOf(AggregateError);
  expect((failure as AggregateError).errors.map((error: Error) => error.message))
    .toEqual(["paint failed", "restore failed", "scroll failed", "detach failed"]);
  expect(state.detached()).toBe(true);
});
