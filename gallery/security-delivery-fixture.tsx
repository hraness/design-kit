import { Search01Icon } from "@hugeicons/core-free-icons";
import {
  Button,
  DialogContent,
  DialogTrigger,
  Icon,
  QuietSiteFooter,
} from "@hraness/ui";
import {
  type CSSProperties,
  Suspense,
  useEffect,
} from "react";

import { builtDesignKitReact } from "./built-react.js";

const {
  DesignPortalThemeProvider,
  DesignThemeProvider,
  DitherSurface,
  ProductionDataPreviewNotice,
  useDesignPortalClassName,
  useDesignPortalTheme,
} = builtDesignKitReact;

export const securityDeliveryFallback = "Waiting for the streamed result";
export const securityDeliveryTerminal = "Security delivery complete";
export const securityDeliveryStorageKey = "hraness-design-theme-v1";

const callerDitherStyle = {
  "--hraness-design-dither-size": "11px",
  backgroundSize: "11px 11px",
} as CSSProperties;

export interface SecurityDeliveryResource {
  read(): void;
}

export interface HeldSecurityDeliveryResource {
  readonly release: () => void;
  readonly resource: SecurityDeliveryResource;
}

export function createHeldSecurityDeliveryResource(): HeldSecurityDeliveryResource {
  let releasePromise: (() => void) | undefined;
  let released = false;
  const pending = new Promise<void>((resolve) => {
    releasePromise = resolve;
  });

  return {
    release() {
      if (released) return;
      released = true;
      releasePromise?.();
    },
    resource: {
      read() {
        if (!released) throw pending;
      },
    },
  };
}

export const resolvedSecurityDeliveryResource: SecurityDeliveryResource = {
  read() {},
};

declare global {
  interface Window {
    __hranessSecurityDeliveryHydrationCount?: number;
  }
}

function HydrationMarker() {
  useEffect(() => {
    window.__hranessSecurityDeliveryHydrationCount =
      (window.__hranessSecurityDeliveryHydrationCount ?? 0) + 1;
    document.documentElement.setAttribute("data-security-delivery-hydrated", "");
  }, []);
  return null;
}

function PortalledDialog() {
  const portalClassName = useDesignPortalClassName();
  const portalTheme = useDesignPortalTheme();
  if (portalClassName === undefined || portalTheme === undefined) {
    throw new Error("The security delivery portal contract is unavailable.");
  }
  const themeClassName = portalTheme === "light"
    ? "security-canary-theme-light"
    : "security-canary-theme-dark";

  return (
    <DialogTrigger>
      <Button
        id="security-canary-dialog-trigger"
        leading={<Icon icon={Search01Icon} />}
      >
        Open delivery dialog
      </Button>
      <DialogContent
        closeLabel="Close security delivery dialog"
        overlayClassName={`${themeClassName} ${portalClassName}`}
        title="Portalled delivery dialog"
      >
        <p data-security-canary-dialog-copy="">
          This light dialog is portalled outside the dark application root.
        </p>
      </DialogContent>
    </DialogTrigger>
  );
}

function ReleasedContent({ resource }: Readonly<{ resource: SecurityDeliveryResource }>) {
  resource.read();
  return (
    <section aria-labelledby="security-delivery-title" data-security-delivery-terminal="">
      <h1 id="security-delivery-title">{securityDeliveryTerminal}</h1>
      <DesignPortalThemeProvider
        portalClassName="security-canary-palette"
        theme="light"
      >
        <PortalledDialog />
        <QuietSiteFooter data-security-ui-priority3="">
          UI priority3 delivery canary
        </QuietSiteFooter>
        <div aria-label="Dither delivery matrix" data-security-dither-matrix="">
          <DitherSurface
            data-design-kit-stylex-dither-conflict="true"
            data-security-dither="medium"
            density="medium"
          >
            Medium dither
          </DitherSurface>
          <DitherSurface data-security-dither="coarse" density="coarse">
            Coarse dither
          </DitherSurface>
          <DitherSurface data-security-dither="fine" density="fine">
            Fine dither
          </DitherSurface>
          <DitherSurface
            data-security-dither="caller"
            density="fine"
            style={callerDitherStyle}
          >
            Caller dither
          </DitherSurface>
        </div>
      </DesignPortalThemeProvider>
    </section>
  );
}

export function SecurityDeliveryApplication({
  nonce,
  resource,
}: Readonly<{
  nonce: string;
  resource: SecurityDeliveryResource;
}>) {
  return (
    <DesignThemeProvider nonce={nonce} storageKey={securityDeliveryStorageKey}>
      <HydrationMarker />
      <ProductionDataPreviewNotice surfaceOrigin="https://preview.example.test" />
      <main>
        <Suspense
          fallback={(
            <p aria-live="polite" data-security-delivery-fallback="">
              {securityDeliveryFallback}
            </p>
          )}
        >
          <ReleasedContent resource={resource} />
        </Suspense>
      </main>
    </DesignThemeProvider>
  );
}
