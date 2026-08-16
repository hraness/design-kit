import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  applyUpdateToManifest,
  chooseDependencyUpdate,
  collectManifestPins,
  immutableStableVersions,
  parseExactHranessSpecifier,
  parseStableVersion,
  type HranessDependencyUpdate,
} from "./propose-hraness-dependency-update";

function version(tag: string) {
  const parsed = parseStableVersion(tag);
  if (parsed === undefined) throw new Error(`Invalid test version ${tag}.`);
  return parsed;
}

describe("Hraness dependency proposal", () => {
  test("keeps the scheduled proposal boundary read-only", () => {
    const repositoryRoot = resolve(import.meta.dir, "..");
    const standalonePath = resolve(
      repositoryRoot,
      ".github/workflows/hraness-dependency-proposal.yml",
    );
    const workflowPath = existsSync(standalonePath)
      ? standalonePath
      : resolve(repositoryRoot, ".github/workflows/renovate-lockfile.yml");
    const workflow = readFileSync(workflowPath, "utf8");
    const hranessJobStart = workflow.indexOf("\n  hraness:\n");
    const scheduledBoundary = hranessJobStart === -1
      ? workflow
      : workflow.slice(hranessJobStart);
    expect(workflow).toContain("schedule:");
    expect(scheduledBoundary).toContain("contents: read");
    expect(scheduledBoundary).toContain(
      "actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02",
    );
    expect(scheduledBoundary).not.toContain("contents: write");
    expect(scheduledBoundary).not.toContain("pull-requests: write");
    expect(scheduledBoundary).not.toContain("git push");
    expect(scheduledBoundary).not.toContain("gh pr");
    expect(scheduledBoundary).toContain("git ls-files --others --exclude-standard");
    expect(scheduledBoundary).toContain(
      "bun install --frozen-lockfile --ignore-scripts --no-progress",
    );
    expect(scheduledBoundary).toContain("baseCommit: process.env.BASE_COMMIT");
    expect(scheduledBoundary).toContain(
      "consumerRepository: process.env.CONSUMER_REPOSITORY",
    );
  });

  test("accepts only exact stable Hraness Git tags", () => {
    expect(parseExactHranessSpecifier("github:hraness/ui#v1.2.3")).toEqual({
      repository: "hraness/ui",
      version: { major: 1, minor: 2, patch: 3, tag: "v1.2.3" },
    });
    for (const rejected of [
      "github:other/ui#v1.2.3",
      "github:hraness/ui#main",
      "github:hraness/ui#v1.2.3-beta.1",
      "github:hraness/ui#v01.2.3",
      "github:hraness/ui#35573565f5abe354499c9538a5d177d9415046df",
      "workspace:*",
    ]) {
      expect(parseExactHranessSpecifier(rejected)).toBeUndefined();
    }
  });

  test("discovers direct and catalog pins without treating ranges as releases", () => {
    const pins = collectManifestPins("package.json", {
      dependencies: {
        "@hraness/design-kit": "github:hraness/design-kit#v0.1.2",
        react: "19.2.3",
      },
      peerDependencies: { "@hraness/ui": ">=0.4.0 <0.5.0" },
      workspaces: {
        catalog: {
          "@hraness/ui-release": "github:hraness/ui#v0.4.0",
        },
      },
    });
    expect(pins.map(({ dependency, repository, section }) => ({
      dependency,
      repository,
      section,
    }))).toEqual([
      {
        dependency: "@hraness/design-kit",
        repository: "hraness/design-kit",
        section: "dependencies",
      },
      {
        dependency: "@hraness/ui-release",
        repository: "hraness/ui",
        section: "workspaces.catalog",
      },
    ]);
  });

  test("trusts only immutable stable GitHub Releases", () => {
    expect(immutableStableVersions([
      { draft: false, immutable: true, prerelease: false, tag_name: "v0.4.1" },
      { draft: false, immutable: false, prerelease: false, tag_name: "v0.5.0" },
      { draft: true, immutable: true, prerelease: false, tag_name: "v0.6.0" },
      { draft: false, immutable: true, prerelease: true, tag_name: "v0.7.0" },
      { draft: false, immutable: true, prerelease: false, tag_name: "latest" },
      { draft: false, immutable: true, prerelease: false, tag_name: "v0.3.0" },
    ]).map(({ tag }) => tag)).toEqual(["v0.3.0", "v0.4.1"]);
    expect(() => immutableStableVersions({})).toThrow(
      "GitHub releases response must be an array",
    );
  });

  test("selects one repository in stable order and aligns all older pins", () => {
    const pins = [
      ...collectManifestPins("package.json", {
        dependencies: {
          "@hraness/ui": "github:hraness/ui#v0.3.0",
          "@hraness/design-kit": "github:hraness/design-kit#v0.1.0",
        },
      }),
      ...collectManifestPins("packages/compat/package.json", {
        devDependencies: {
          "@hraness/ui-release": "github:hraness/ui#v0.4.0",
        },
      }),
    ];
    const selected = chooseDependencyUpdate(pins, new Map([
      ["hraness/design-kit", [version("v0.1.0"), version("v0.1.2")]],
      ["hraness/ui", [version("v0.4.0"), version("v0.4.1")]],
    ]));
    expect(selected).toEqual({
      dependencies: ["@hraness/design-kit"],
      fromTags: ["v0.1.0"],
      repository: "hraness/design-kit",
      target: version("v0.1.2"),
    });

    const uiOnly = chooseDependencyUpdate(
      pins.filter(({ repository }) => repository === "hraness/ui"),
      new Map([["hraness/ui", [version("v0.4.1")]]]),
    );
    expect(uiOnly).toMatchObject({
      dependencies: ["@hraness/ui", "@hraness/ui-release"],
      fromTags: ["v0.3.0", "v0.4.0"],
      repository: "hraness/ui",
    });
  });

  test("updates matching direct and catalog pins without downgrading or moving ranges", () => {
    const plan: HranessDependencyUpdate = {
      dependencies: ["@hraness/ui", "@hraness/ui-release"],
      fromTags: ["v0.3.0", "v0.4.0"],
      repository: "hraness/ui",
      target: version("v0.4.1"),
    };
    const updated = applyUpdateToManifest({
      dependencies: {
        "@hraness/ui": "github:hraness/ui#v0.3.0",
        "@hraness/result": "github:hraness/result#v0.2.1",
      },
      peerDependencies: { "@hraness/ui": ">=0.4.0 <0.5.0" },
      workspaces: {
        catalog: {
          "@hraness/ui-release": "github:hraness/ui#v0.4.0",
        },
      },
    }, plan);
    expect(updated.changes).toBe(2);
    expect(updated.manifest).toEqual({
      dependencies: {
        "@hraness/ui": "github:hraness/ui#v0.4.1",
        "@hraness/result": "github:hraness/result#v0.2.1",
      },
      peerDependencies: { "@hraness/ui": ">=0.4.0 <0.5.0" },
      workspaces: {
        catalog: {
          "@hraness/ui-release": "github:hraness/ui#v0.4.1",
        },
      },
    });
  });
});
