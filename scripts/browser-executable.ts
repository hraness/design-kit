import { execFile } from "node:child_process";
import { constants } from "node:fs";
import { access, realpath } from "node:fs/promises";
import { isAbsolute } from "node:path";
import { promisify } from "node:util";
import { chromium } from "playwright-core";

const execute = promisify(execFile);
const installation = "Run bun run browser:install to provision the Chromium revision pinned by playwright-core.";

export interface BrowserSelectionOptions {
  readonly environment?: Readonly<Record<string, string | undefined>>;
  readonly managedPath?: string;
  readonly resolveExecutable?: (path: string) => Promise<string>;
  readonly readVersion?: (path: string) => Promise<string>;
  readonly report?: (message: string) => void;
}

async function resolveExecutable(path: string): Promise<string> {
  const resolved = await realpath(path);
  await access(resolved, constants.X_OK);
  return resolved;
}

/** Select a provisioned test browser; never discover the user's installed browser. */
export async function provisionedBrowserExecutable(options: BrowserSelectionOptions = {}): Promise<string> {
  const environment = options.environment ?? process.env;
  const configured = environment.CHROMIUM_EXECUTABLE_PATH ?? environment.CHROME_PATH;
  const managedPath = options.managedPath ?? chromium.executablePath();
  const candidate = configured ?? managedPath;
  if (!isAbsolute(candidate)) throw new Error(`Browser executable must be an absolute path. ${installation}`);
  const resolve = options.resolveExecutable ?? resolveExecutable;
  let executable: string;
  try {
    executable = await resolve(candidate);
  } catch (cause) {
    throw new Error(`Browser executable is unavailable: ${candidate}. ${installation}`, { cause });
  }
  // Check the resolved target as well, so a symlink cannot restore system Chrome.
  if (/Google Chrome(?: Beta| Dev| Canary)?\.app\//u.test(executable)
    || /^\/(?:usr|opt)\/(?:.*\/)?(?:google-chrome(?:-stable|-beta|-unstable)?|chromium(?:-browser)?)$/u.test(executable)) {
    throw new Error(`System browser is not allowed for automated verification: ${executable}. ${installation}`);
  }
  const managed = configured === undefined || executable === await resolve(managedPath).catch(() => undefined);
  const readVersion = options.readVersion ?? (async (path: string) => {
    const { stdout } = await execute(path, ["--version"], { timeout: 5_000, maxBuffer: 4_096 });
    return stdout.trim();
  });
  const version = (await readVersion(executable)).trim();
  if (!/^(?:Google Chrome for Testing|Chromium) \d+\.\d+\.\d+\.\d+(?:\s|$)/u.test(version)
    || (!managed && !/^Google Chrome for Testing /u.test(version))) {
    throw new Error(`Browser must be the pinned Playwright browser or an explicitly provisioned Chrome for Testing: ${executable} (${version}). ${installation}`);
  }
  (options.report ?? console.log)(`Verification browser: ${version}; executable: ${executable}; source: ${managed ? "pinned Playwright" : "explicit Chrome for Testing"}`);
  return executable;
}

/** Merge required quiet, clone-free automation flags without discarding caller features. */
export function verificationBrowserArguments(arguments_: readonly string[] = []): string[] {
  const disabled = new Set(["PaintHolding", "MacAppCodeSignClone"]);
  const preserved: string[] = [];
  for (const argument of arguments_) {
    if (argument.startsWith("--disable-features=")) {
      for (const feature of argument.slice("--disable-features=".length).split(",")) {
        if (feature !== "") disabled.add(feature);
      }
    } else if (argument !== "--mute-audio") preserved.push(argument);
  }
  return [...preserved, "--mute-audio", `--disable-features=${[...disabled].join(",")}`];
}
