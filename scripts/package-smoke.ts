import { mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

async function run(command: string[], cwd: string): Promise<void> {
  const child = Bun.spawn(command, { cwd, stdout: "inherit", stderr: "inherit" });
  const exitCode = await child.exited;
  if (exitCode !== 0) {
    throw new Error(`Command failed (${String(exitCode)}): ${command.join(" ")}`);
  }
}

async function filesBelow(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesBelow(path) : [path];
  }));
  return nested.flat();
}

const repository = process.cwd();
const work = await mkdtemp(join(tmpdir(), "hraness-design-kit-smoke-"));
const uiDevelopmentSpecifier = "github:hraness/ui#v0.4.0";
const uiPeerRange = ">=0.4.0 <0.5.0";
const uiInstallSource = process.env.HRANESS_UI_PACKAGE
  ?? uiDevelopmentSpecifier;

try {
  const archive = join(work, "package.tgz");
  const consumer = join(work, "consumer");
  const neutralConsumer = join(work, "consumer-neutral");
  const unpacked = join(work, "unpacked");
  await mkdir(consumer);
  await mkdir(neutralConsumer);
  await mkdir(unpacked);
  await run([
    process.execPath,
    "pm",
    "pack",
    "--filename",
    archive,
    "--ignore-scripts",
    "--quiet",
  ], repository);
  await run(["tar", "-xzf", archive, "-C", unpacked], repository);
  const packedRoot = join(unpacked, "package");
  const packedPackageJsonPath = join(packedRoot, "package.json");
  const packedPackageJson = await Bun.file(packedPackageJsonPath).json();
  if (packedPackageJson.dependencies?.["@hraness/ui"] !== undefined) {
    throw new Error("Packed package nests @hraness/ui as a runtime dependency.");
  }
  if (packedPackageJson.peerDependencies?.["@hraness/ui"] !== uiPeerRange) {
    throw new Error(`Packed package does not declare the ${uiPeerRange} @hraness/ui peer.`);
  }
  if (packedPackageJson.peerDependenciesMeta?.["@hraness/ui"]?.optional !== true) {
    throw new Error("Packed package does not keep the entry-specific @hraness/ui peer optional at installation.");
  }
  if (packedPackageJson.devDependencies?.["@hraness/ui"] !== uiDevelopmentSpecifier) {
    throw new Error("Packed package does not retain the exact @hraness/ui v0.4.0 development pin.");
  }
  await writeFile(
    join(neutralConsumer, "package.json"),
    JSON.stringify({ private: true, type: "module" }),
  );
  await run([
    process.execPath,
    "add",
    archive,
    "typescript@^6.0.3",
    "--ignore-scripts",
  ], neutralConsumer);
  if (
    await Bun.file(
      join(neutralConsumer, "node_modules", "@hraness", "ui", "package.json"),
    ).exists()
  ) {
    throw new Error("The framework-neutral consumer installed the optional @hraness/ui peer.");
  }
  await run([
    "node",
    "--input-type=module",
    "-e",
    "await Promise.all([import('@hraness/design-kit'), import('@hraness/design-kit/syntax-highlighting')])",
  ], neutralConsumer);
  await writeFile(
    join(neutralConsumer, "index.ts"),
    [
      'import * as core from "@hraness/design-kit";',
      'import * as syntax from "@hraness/design-kit/syntax-highlighting";',
      "void [core, syntax];",
      "",
    ].join("\n"),
  );
  for (const mode of ["Bundler", "NodeNext"] as const) {
    await writeFile(
      join(neutralConsumer, `tsconfig.${mode.toLowerCase()}.json`),
      JSON.stringify({
        compilerOptions: {
          exactOptionalPropertyTypes: true,
          lib: ["ES2023"],
          module: mode === "Bundler" ? "Preserve" : "NodeNext",
          moduleResolution: mode,
          noEmit: true,
          skipLibCheck: true,
          strict: true,
          target: "ES2023",
        },
        include: ["index.ts"],
      }, null, 2),
    );
    await run([
      process.execPath,
      "x",
      "tsc",
      "-p",
      `./tsconfig.${mode.toLowerCase()}.json`,
    ], neutralConsumer);
  }
  await writeFile(
    join(consumer, "package.json"),
    JSON.stringify({ private: true, type: "module" }),
  );
  await run([
    process.execPath,
    "add",
    uiInstallSource,
    "@types/bun@^1.3.14",
    "@types/react@^19.2.14",
    "@types/react-dom@^19.2.3",
    "react@19.2.3",
    "react-dom@19.2.3",
    "typescript@^6.0.3",
    "vite@8.1.5",
    "--ignore-scripts",
  ], consumer);
  await run([process.execPath, "add", archive, "--ignore-scripts"], consumer);
  await run([
    "node",
    "--input-type=module",
    "-e",
    "await Promise.all([import('@hraness/design-kit'), import('@hraness/design-kit/react'), import('@hraness/design-kit/react/server'), import('@hraness/design-kit/syntax-highlighting')])",
  ], consumer);

  const installed = join(consumer, "node_modules/@hraness/design-kit");
  for (const path of [
    "src/styles.css",
    "src/fonts/geist-mono/GeistMono[wght].woff2",
    "vendor/evilcharts/LICENSE",
    "vendor/jelly-ui/LICENSE",
  ]) {
    if (!(await Bun.file(join(installed, path)).exists())) {
      throw new Error(`Packed package is missing ${path}`);
    }
  }
  const packedFiles = await filesBelow(installed);
  if (packedFiles.some((path) => path.includes(".test."))) {
    throw new Error("Packed package contains test sources");
  }
  const clientBundle = await Bun.file(
    join(installed, "dist", "react", "index.js"),
  ).text();
  const clientDirectives = clientBundle.match(/^"use client";\r?$/gmu) ?? [];
  if (
    !clientBundle.startsWith('"use client";\n')
    || clientDirectives.length !== 1
  ) {
    throw new Error(
      "Packed React entry must have one leading use-client directive and no interior directives.",
    );
  }

  await writeFile(
    join(consumer, "index.ts"),
    [
      'import * as core from "@hraness/design-kit";',
      'import * as react from "@hraness/design-kit/react";',
      'import * as serverReact from "@hraness/design-kit/react/server";',
      "void [core, react, serverReact];",
      "",
    ].join("\n"),
  );
  for (const mode of ["Bundler", "NodeNext"] as const) {
    await writeFile(
      join(consumer, `tsconfig.${mode.toLowerCase()}.json`),
      JSON.stringify({
        compilerOptions: {
          exactOptionalPropertyTypes: true,
          jsx: "react-jsx",
          lib: ["ES2023", "DOM", "DOM.Iterable"],
          module: mode === "Bundler" ? "Preserve" : "NodeNext",
          moduleResolution: mode,
          noEmit: true,
          skipLibCheck: true,
          strict: true,
          target: "ES2023",
        },
        include: ["index.ts"],
      }, null, 2),
    );
    await run([
      process.execPath,
      "x",
      "tsc",
      "-p",
      `./tsconfig.${mode.toLowerCase()}.json`,
    ], consumer);
  }

  await mkdir(join(consumer, "src"));
  await writeFile(
    join(consumer, "index.html"),
    '<!doctype html><html><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>',
  );
  await writeFile(
    join(consumer, "src/main.tsx"),
    [
      'import { createElement } from "react";',
      'import { createRoot } from "react-dom/client";',
      'import "@hraness/design-kit/styles.css";',
      'import { JellySurface } from "@hraness/design-kit/react";',
      'const target = document.getElementById("root");',
      'if (target === null) throw new Error("Missing root");',
      'createRoot(target).render(createElement(JellySurface, { interaction: "press" }, createElement("button", { type: "button" }, "Run")));',
      "",
    ].join("\n"),
  );
  await run([process.execPath, "x", "vite", "build"], consumer);
  const builtFiles = await filesBelow(join(consumer, "dist"));
  if (!builtFiles.some((path) => path.endsWith(".css"))) {
    throw new Error("Packed Vite consumer emitted no design stylesheet.");
  }
  if (builtFiles.filter((path) => path.endsWith(".js")).length < 2) {
    throw new Error("Packed Vite consumer did not preserve the dynamic Jelly chunk.");
  }

  const react18Consumer = join(work, "consumer-react18");
  await mkdir(react18Consumer);
  await writeFile(
    join(react18Consumer, "package.json"),
    JSON.stringify({ private: true, type: "module" }),
  );
  await run([
    process.execPath,
    "add",
    uiInstallSource,
    "@types/react@18.3.28",
    "@types/react-dom@18.3.7",
    "react@18.3.1",
    "react-dom@18.3.1",
    "typescript@^6.0.3",
    "--ignore-scripts",
  ], react18Consumer);
  await run([
    process.execPath,
    "add",
    archive,
    "--ignore-scripts",
  ], react18Consumer);
  await run([
    "node",
    "--input-type=module",
    "-e",
    "await Promise.all([import('@hraness/design-kit'), import('@hraness/design-kit/react'), import('@hraness/design-kit/react/server'), import('@hraness/design-kit/syntax-highlighting')])",
  ], react18Consumer);
  await writeFile(
    join(react18Consumer, "index.ts"),
    [
      'import * as clientReact from "@hraness/design-kit/react";',
      'import * as serverReact from "@hraness/design-kit/react/server";',
      "void [clientReact, serverReact];",
      "",
    ].join("\n"),
  );
  for (const mode of ["Bundler", "NodeNext"] as const) {
    await writeFile(
      join(react18Consumer, `tsconfig.${mode.toLowerCase()}.json`),
      JSON.stringify({
        compilerOptions: {
          exactOptionalPropertyTypes: true,
          jsx: "react-jsx",
          lib: ["ES2023", "DOM", "DOM.Iterable"],
          module: mode === "Bundler" ? "Preserve" : "NodeNext",
          moduleResolution: mode,
          noEmit: true,
          skipLibCheck: true,
          strict: true,
          target: "ES2023",
        },
        include: ["index.ts"],
      }, null, 2),
    );
    await run([
      process.execPath,
      "x",
      "tsc",
      "-p",
      `./tsconfig.${mode.toLowerCase()}.json`,
    ], react18Consumer);
  }
} finally {
  await rm(work, { recursive: true, force: true });
}
