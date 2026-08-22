import { createRoot, hydrateRoot, type Root } from "react-dom/client";

import {
  DesignThemeProvider,
  GlobalErrorDocument,
  RouteErrorPage,
  ThemeColorSync,
} from "../src/react";
import {
  globalErrorFixtureColors,
  globalErrorFixtureMessage,
} from "./global-error-fixture";

interface ThemeColorLifecycleFixture {
  readonly mount: () => void;
  readonly unmount: () => void;
}

const fixtureWindow = window as typeof window & {
  __hranessThemeColorLifecycle?: ThemeColorLifecycleFixture;
};

const error = new Error(globalErrorFixtureMessage);
const reset = () => undefined;

if (window.location.pathname === "/lifecycle") {
  const target = document.querySelector("#root");
  if (!(target instanceof HTMLElement)) {
    throw new Error("The theme-color lifecycle root is missing.");
  }

  let root: Root | null = null;
  const mount = () => {
    if (root !== null) return;
    root = createRoot(target);
    root.render(
      <DesignThemeProvider>
        <ThemeColorSync
          darkColor={globalErrorFixtureColors.dark}
          lightColor={globalErrorFixtureColors.light}
        />
        <RouteErrorPage
          announce={false}
          autoFocus={false}
          error={error}
          reset={reset}
        />
      </DesignThemeProvider>,
    );
  };
  const unmount = () => {
    root?.unmount();
    root = null;
  };
  fixtureWindow.__hranessThemeColorLifecycle = { mount, unmount };
  mount();
} else {
  hydrateRoot(
    document,
    <GlobalErrorDocument
      darkColor={globalErrorFixtureColors.dark}
      error={error}
      lightColor={globalErrorFixtureColors.light}
      reset={reset}
    />,
  );
}
