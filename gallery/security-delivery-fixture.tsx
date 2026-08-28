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
  useRef,
  useState,
} from "react";

import { builtDesignKitReact } from "./built-react.js";

const {
  AnimatedRailStage,
  BottomBar,
  ChatComposer,
  ChatMessage,
  DesignPortalThemeProvider,
  DesignThemeProvider,
  DitherSurface,
  DockedFooter,
  Fader,
  PageCanvas,
  PlaybackTransport,
  ProductionDataPreviewNotice,
  TopBar,
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

const callerFaderStyle = {
  "--hraness-design-fader-thumb-block-size": "20px",
  "--hraness-design-fader-thumb-inline-size": "30px",
  "--hraness-design-fader-track-length": "7rem",
} as CSSProperties;

const callerChatComposerStyle = {
  "--security-chat-caller-form": "ready",
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

export function VerticalWritingLayoutSurfaceMatrix() {
  return (
    <section
      aria-label="Vertical writing layout surface matrix"
      data-security-vertical-layout-matrix=""
    >
      <div className="security-vertical-layout-specimen">
        <TopBar data-security-vertical-layout="top">
          Vertical top bar
        </TopBar>
        <BottomBar data-security-vertical-layout="bottom">
          Vertical bottom bar
        </BottomBar>
      </div>
      <div className="security-vertical-layout-specimen">
        <PageCanvas
          as="div"
          data-security-vertical-layout="page-wide"
          inset="content"
          size="wide"
        >
          Vertical wide page
        </PageCanvas>
        <PageCanvas
          as="div"
          data-security-vertical-layout="page-full"
          inset="none"
          size="full"
        >
          Vertical full page
        </PageCanvas>
      </div>
      <div className="security-vertical-layout-specimen security-vertical-dock-frame">
        <DockedFooter
          data-security-vertical-layout="docked"
          position="absolute"
          size="wide"
        >
          Vertical docked footer
        </DockedFooter>
      </div>
    </section>
  );
}

function LayoutSurfaceDeliveryMatrix() {
  const dockedFooterRef = useRef<HTMLElement>(null);

  useEffect(() => {
    dockedFooterRef.current?.setAttribute("data-security-docked-ref", "ready");
  }, []);

  return (
    <section aria-label="Layout surface delivery matrix" data-security-layout-matrix="">
      <TopBar
        actions={<span>Actions</span>}
        className="security-caller-top-bar"
        data-design-kit-stylex-layout-conflict="true"
        data-security-layout="top"
        leading={<span>Leading</span>}
        position="sticky"
        style={{ zIndex: 321 }}
        surface="glass"
        title="Security top bar"
      >
        Context
      </TopBar>
      <BottomBar
        actions={<span>Actions</span>}
        className="security-caller-bottom-bar"
        data-security-layout="bottom"
        leading={<span>Leading</span>}
      >
        Security bottom bar
      </BottomBar>
      <PageCanvas
        as="div"
        className="security-caller-page-canvas"
        data-security-layout="page"
        inset="none"
        size="wide"
      >
        Security page canvas
      </PageCanvas>
      <div className="security-layout-dock-frame">
        <DockedFooter
          className="security-caller-docked-footer"
          contentClassName="security-caller-docked-content"
          data-security-layout="docked"
          density="compact"
          inset="none"
          position="absolute"
          ref={dockedFooterRef}
          size="wide"
          surface="glass"
        >
          Security docked footer
        </DockedFooter>
      </div>
    </section>
  );
}

function AnimatedRailStageDeliveryMatrix() {
  return (
    <section
      aria-labelledby="security-animated-rail-stage-title"
      data-design-kit-stylex-animated-rail-stage-conflict="true"
      data-security-animated-rail-stage-matrix=""
    >
      <h2 id="security-animated-rail-stage-title">Animated rail stage delivery matrix</h2>
      <AnimatedRailStage
        className="security-caller-animated-rail-stage"
        stageKey="security-stage"
      >
        Animated stage content
      </AnimatedRailStage>
    </section>
  );
}

function PlaybackTransportDeliveryMatrix() {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    buttonRef.current?.setAttribute("data-security-playback-ref", "ready");
  }, []);

  return (
    <section
      aria-labelledby="security-playback-title"
      data-design-kit-stylex-playback-conflict="true"
      data-security-playback-matrix=""
    >
      <h2 id="security-playback-title">Playback delivery matrix</h2>
      <PlaybackTransport
        aria-labelledby="security-playback-title"
        buttonAriaKeyShortcuts="Space"
        buttonId="security-playback-command"
        buttonRef={buttonRef}
        className="security-caller-playback-transport"
        onPlay={() => undefined}
        onStop={() => undefined}
        status="pending"
        trailingControls={<span data-security-playback-trailing="">Trailing control</span>}
      />
    </section>
  );
}

function ChatDeliveryMatrix() {
  const [blockedSubmitCount, setBlockedSubmitCount] = useState(0);
  const [pendingValue, setPendingValue] = useState("Pending message");
  const [readySubmitCaptureCount, setReadySubmitCaptureCount] = useState(0);
  const [readySubmitCount, setReadySubmitCount] = useState(0);
  const [readyValue, setReadyValue] = useState("Ready message");

  const recordBlockedSubmit = (): void => {
    setBlockedSubmitCount((count) => count + 1);
  };

  return (
    <section aria-labelledby="security-chat-title" data-security-chat-matrix="">
      <h2 id="security-chat-title">Chat delivery matrix</h2>
      <div data-security-chat-messages="">
        <div data-design-kit-stylex-chat-message-conflict="true">
          <ChatMessage
            actions={<span data-security-chat-message-actions="">Archive</span>}
            avatar={<span data-security-chat-message-avatar="">A</span>}
            className="security-caller-chat-message"
            meta={<span data-security-chat-message-meta="">Now</span>}
            name="Assistant"
            role="assistant"
          >
            <p data-security-chat-message-body="">Full assistant message</p>
          </ChatMessage>
        </div>
        <ChatMessage role="system">Minimal system message</ChatMessage>
        <ChatMessage
          actions={null}
          avatar={null}
          meta={null}
          name={null}
          role="user"
        >
          Null-slot user message
        </ChatMessage>
      </div>
      <div data-security-chat-composers="">
        <ChatComposer
          action="/security-chat-should-not-navigate"
          aria-label="Ready security chat composer"
          autoComplete="off"
          className="security-caller-chat-composer"
          data-design-kit-stylex-chat-composer-conflict="true"
          data-security-chat-composer="ready"
          id="security-chat-ready"
          label="Security message"
          method="post"
          noValidate
          onSubmit={() => {
            setReadySubmitCount((count) => count + 1);
          }}
          onSubmitCapture={() => {
            setReadySubmitCaptureCount((count) => count + 1);
          }}
          onValueChange={setReadyValue}
          placeholder="Describe the security finding"
          sendLabel="Deliver message"
          style={callerChatComposerStyle}
          value={readyValue}
        />
        <ChatComposer
          aria-label="Blank security chat composer"
          data-security-chat-composer="blank"
          label="Blank message"
          onSubmit={recordBlockedSubmit}
          onValueChange={() => undefined}
          value="   "
        />
        <ChatComposer
          aria-label="Pending security chat composer"
          data-security-chat-composer="pending"
          isPending
          label="Pending message"
          onSubmit={recordBlockedSubmit}
          onValueChange={setPendingValue}
          value={pendingValue}
        />
        <ChatComposer
          aria-label="Disabled security chat composer"
          data-security-chat-composer="disabled"
          isDisabled
          label="Disabled message"
          onSubmit={recordBlockedSubmit}
          onValueChange={() => undefined}
          value="Disabled message"
        />
      </div>
      <output data-security-chat-submit-capture-count="">
        {readySubmitCaptureCount}
      </output>
      <output data-security-chat-submit-count="">{readySubmitCount}</output>
      <output data-security-chat-blocked-submit-count="">
        {blockedSubmitCount}
      </output>
    </section>
  );
}

function FaderDeliveryMatrix() {
  const faderRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    faderRef.current?.setAttribute("data-security-fader-ref", "ready");
    inputRef.current?.setAttribute("data-security-fader-input-ref", "ready");
  }, []);

  return (
    <section aria-labelledby="security-fader-title" data-security-fader-matrix="">
      <h2 id="security-fader-title">Fader delivery matrix</h2>
      <Fader
        aria-label="Security level"
        className="security-caller-fader"
        data-design-kit-stylex-fader-conflict="true"
        defaultValue={40}
        faderRef={faderRef}
        inputRef={inputRef}
        label="Security gain"
        labelAccessory={<span data-security-fader-accessory="">dB</span>}
        maxValue={100}
        minValue={0}
        showLabel
        showOutput
        style={callerFaderStyle}
      />
    </section>
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
        <AnimatedRailStageDeliveryMatrix />
        <LayoutSurfaceDeliveryMatrix />
        <ChatDeliveryMatrix />
        <FaderDeliveryMatrix />
        <PlaybackTransportDeliveryMatrix />
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
