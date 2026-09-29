import {
  platformInstallClassName
} from "./chunk-8sd0vqst.js";
import {
  detectPlatform,
  isKnownPlatformId,
  isPlatformId,
  matchDetectedPlatform,
  platformLabel,
  platformMark
} from "./chunk-wzvdn8ey.js";

// src/react/platform-install.tsx
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
var copyResetMilliseconds = 2000;
function assertTargets(platforms, defaultPlatform) {
  if (platforms.length === 0)
    throw new RangeError("PlatformInstall needs at least one platform.");
  const seen = new Set;
  for (const target of platforms) {
    if (!isPlatformId(target.id))
      throw new RangeError(`Platform ids are lowercase slugs; received ${JSON.stringify(target.id)}.`);
    if (seen.has(target.id))
      throw new RangeError(`Duplicate platform id: ${target.id}.`);
    seen.add(target.id);
    if (target.label !== undefined ? target.label.trim() === "" : !isKnownPlatformId(target.id)) {
      throw new RangeError(`Platform ${target.id} needs a label.`);
    }
    if (target.unavailable === true) {
      if (target.unavailableNote === undefined || target.unavailableNote === null || target.unavailableNote === "") {
        throw new RangeError(`Unavailable platform ${target.id} needs an unavailableNote.`);
      }
      if (target.command !== undefined && target.command.trim() === "")
        throw new RangeError(`Platform ${target.id} has a blank command.`);
    } else {
      if (typeof target.command !== "string" || target.command.trim() === "")
        throw new RangeError(`Platform ${target.id} needs a command.`);
    }
    for (const alternative of target.alternatives ?? []) {
      if (alternative.label.trim() === "" || alternative.command.trim() === "") {
        throw new RangeError(`Platform ${target.id} has an alternative without a label or command.`);
      }
    }
  }
  if (defaultPlatform !== undefined && !seen.has(defaultPlatform)) {
    throw new RangeError(`defaultPlatform ${JSON.stringify(defaultPlatform)} is not one of the listed platforms.`);
  }
}
function labelOf(target) {
  return target.label ?? platformLabel(target.id);
}
function selectContents(element) {
  if (element === null)
    return;
  try {
    const selection = element.ownerDocument.defaultView?.getSelection();
    if (selection === null || selection === undefined)
      return;
    const range = element.ownerDocument.createRange();
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
  } catch {}
}
async function writeClipboard(text, fallback) {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard !== undefined) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  selectContents(fallback);
  try {
    return fallback?.ownerDocument.execCommand("copy") === true;
  } catch {
    return false;
  }
}
function PlatformMarkSymbols({
  ids,
  symbolId
}) {
  return /* @__PURE__ */ jsx("svg", {
    "aria-hidden": "true",
    className: platformInstallClassName(["markSymbols"]),
    focusable: "false",
    xmlns: "http://www.w3.org/2000/svg",
    children: ids.map((id) => {
      const mark = platformMark(id);
      return /* @__PURE__ */ jsx("symbol", {
        id: symbolId(id),
        viewBox: mark.viewBox,
        children: /* @__PURE__ */ jsx("path", {
          d: mark.path
        })
      }, id);
    })
  });
}
function PlatformMarkUse({
  platform,
  symbolId
}) {
  return /* @__PURE__ */ jsx("svg", {
    "aria-hidden": "true",
    className: platformInstallClassName(["icon"]),
    "data-platform": platform,
    fill: "currentColor",
    focusable: "false",
    viewBox: platformMark(platform).viewBox,
    xmlns: "http://www.w3.org/2000/svg",
    children: /* @__PURE__ */ jsx("use", {
      href: `#${symbolId}`
    })
  });
}
function CopyGlyph({
  copied
}) {
  return /* @__PURE__ */ jsx("svg", {
    "aria-hidden": "true",
    className: platformInstallClassName(["copyIcon"]),
    fill: "none",
    focusable: "false",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    viewBox: "0 0 24 24",
    children: copied ? /* @__PURE__ */ jsx("path", {
      d: "M5 12.5l4.5 4.5L19 7.5"
    }) : /* @__PURE__ */ jsxs(Fragment, {
      children: [
        /* @__PURE__ */ jsx("rect", {
          height: "12",
          rx: "2",
          width: "12",
          x: "8",
          y: "8"
        }),
        /* @__PURE__ */ jsx("path", {
          d: "M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"
        })
      ]
    })
  });
}
function CommandBlock({
  caption,
  command,
  copyKey,
  onCopy,
  status,
  subject
}) {
  const preRef = useRef(null);
  const state = status?.key === copyKey ? status.ok ? "copied" : "failed" : "idle";
  return /* @__PURE__ */ jsxs("div", {
    className: platformInstallClassName(["command"]),
    "data-copy-state": state,
    children: [
      /* @__PURE__ */ jsxs("div", {
        className: platformInstallClassName(["commandBar", (caption === undefined || caption === "") && "commandBarEmpty"]),
        children: [
          /* @__PURE__ */ jsx("span", {
            className: platformInstallClassName(["shell"]),
            children: caption
          }),
          /* @__PURE__ */ jsxs("button", {
            className: platformInstallClassName(["copy"]),
            "data-copy-state": state,
            onClick: () => onCopy(copyKey, command, subject, preRef.current),
            type: "button",
            children: [
              /* @__PURE__ */ jsx(CopyGlyph, {
                copied: state === "copied"
              }),
              /* @__PURE__ */ jsx("span", {
                children: state === "copied" ? "Copied" : state === "failed" ? "Select to copy" : "Copy"
              }),
              /* @__PURE__ */ jsxs("span", {
                className: platformInstallClassName(["status"]),
                children: [
                  " ",
                  subject
                ]
              })
            ]
          })
        ]
      }),
      /* @__PURE__ */ jsx("pre", {
        "aria-label": subject,
        className: platformInstallClassName(["pre"]),
        ref: preRef,
        tabIndex: 0,
        children: /* @__PURE__ */ jsx("code", {
          className: platformInstallClassName(["code"]),
          children: command
        })
      })
    ]
  });
}
function PlatformInstall({
  className,
  defaultPlatform,
  detect = true,
  id,
  label = "Platform",
  platforms
}) {
  assertTargets(platforms, defaultPlatform);
  const [firstTarget] = platforms;
  if (firstTarget === undefined)
    throw new RangeError("PlatformInstall needs at least one platform.");
  const generatedId = useId();
  const baseId = id ?? `hraness-platform-install${generatedId.replaceAll(/[^A-Za-z0-9_-]/gu, "")}`;
  const initial = defaultPlatform ?? firstTarget.id;
  const [selected, setSelected] = useState(initial);
  const [source, setSource] = useState("default");
  const [status, setStatus] = useState(null);
  const chosen = useRef(false);
  const tabs = useRef(new Map);
  const ids = platforms.map((target) => target.id);
  const idKey = ids.join(`
`);
  const symbolId = (platform) => `${baseId}-mark-${platform}`;
  const current = ids.includes(selected) ? selected : initial;
  useEffect(() => {
    if (!detect || chosen.current)
      return;
    const match = matchDetectedPlatform(detectPlatform(globalThis.navigator), idKey.split(`
`));
    if (match === null)
      return;
    setSelected(match);
    setSource("detected");
  }, [detect, idKey]);
  useEffect(() => {
    if (status === null)
      return;
    const timer = setTimeout(() => setStatus(null), copyResetMilliseconds);
    return () => clearTimeout(timer);
  }, [status]);
  const choose = useCallback((next, focus) => {
    chosen.current = true;
    setSelected(next);
    setSource("chosen");
    if (focus)
      tabs.current.get(next)?.focus();
  }, []);
  const copy = useCallback((key, command, subject, pre) => {
    writeClipboard(command, pre).then((ok) => setStatus({
      key,
      ok,
      subject
    }));
  }, []);
  const onKeyDown = (event) => {
    const index = ids.indexOf(current);
    let next;
    switch (event.key) {
      case "ArrowRight":
        next = (index + 1) % ids.length;
        break;
      case "ArrowLeft":
        next = (index - 1 + ids.length) % ids.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = ids.length - 1;
        break;
      default:
        return;
    }
    const target = ids[next];
    if (target === undefined)
      return;
    event.preventDefault();
    choose(target, true);
  };
  return /* @__PURE__ */ jsxs("div", {
    className: platformInstallClassName(["root"], className),
    "data-hraness-platform-install": "",
    "data-selected-platform": current,
    "data-selection-source": source,
    id,
    children: [
      /* @__PURE__ */ jsx(PlatformMarkSymbols, {
        ids,
        symbolId
      }),
      /* @__PURE__ */ jsx("div", {
        "aria-label": label,
        className: platformInstallClassName(["tablist"]),
        onKeyDown,
        role: "tablist",
        children: platforms.map((target) => {
          const isSelected = target.id === current;
          return /* @__PURE__ */ jsxs("button", {
            "aria-controls": `${baseId}-panel-${target.id}`,
            "aria-selected": isSelected,
            className: platformInstallClassName(["tab", isSelected && "tabSelected"]),
            "data-availability": target.unavailable === true ? "unavailable" : "available",
            "data-platform": target.id,
            id: `${baseId}-tab-${target.id}`,
            onClick: () => choose(target.id, false),
            ref: (element) => {
              if (element === null)
                tabs.current.delete(target.id);
              else
                tabs.current.set(target.id, element);
            },
            role: "tab",
            tabIndex: isSelected ? 0 : -1,
            type: "button",
            children: [
              /* @__PURE__ */ jsx(PlatformMarkUse, {
                platform: target.id,
                symbolId: symbolId(target.id)
              }),
              /* @__PURE__ */ jsx("span", {
                className: platformInstallClassName(["tabLabel"]),
                children: labelOf(target)
              })
            ]
          }, target.id);
        })
      }),
      platforms.map((target) => {
        const name = labelOf(target);
        const alternatives = target.alternatives ?? [];
        return /* @__PURE__ */ jsx("div", {
          "aria-labelledby": `${baseId}-tab-${target.id}`,
          className: platformInstallClassName(["panel"]),
          "data-availability": target.unavailable === true ? "unavailable" : "available",
          "data-platform": target.id,
          hidden: target.id !== current,
          id: `${baseId}-panel-${target.id}`,
          role: "tabpanel",
          children: /* @__PURE__ */ jsxs("div", {
            className: platformInstallClassName(["panelBody"]),
            children: [
              /* @__PURE__ */ jsxs("p", {
                className: platformInstallClassName(["panelLabel"]),
                children: [
                  /* @__PURE__ */ jsx(PlatformMarkUse, {
                    platform: target.id,
                    symbolId: symbolId(target.id)
                  }),
                  /* @__PURE__ */ jsx("span", {
                    children: name
                  })
                ]
              }),
              target.unavailable === true ? /* @__PURE__ */ jsx("div", {
                className: platformInstallClassName(["unavailable"]),
                children: target.unavailableNote
              }) : null,
              target.command === undefined ? null : /* @__PURE__ */ jsx(CommandBlock, {
                caption: target.shell,
                command: target.command,
                copyKey: `${target.id}:primary`,
                onCopy: copy,
                status,
                subject: `${name} install command`
              }),
              alternatives.length === 0 ? null : /* @__PURE__ */ jsx("ul", {
                "aria-label": `Other ways to install on ${name}`,
                className: platformInstallClassName(["alternatives"]),
                children: alternatives.map((alternative, index) => /* @__PURE__ */ jsx("li", {
                  children: /* @__PURE__ */ jsx(CommandBlock, {
                    caption: [alternative.label, alternative.shell].filter(Boolean).join(" · "),
                    command: alternative.command,
                    copyKey: `${target.id}:${index}`,
                    onCopy: copy,
                    status,
                    subject: `${name} ${alternative.label} command`
                  })
                }, `${alternative.label}-${index}`))
              }),
              target.note === undefined ? null : /* @__PURE__ */ jsx("div", {
                className: platformInstallClassName(["note"]),
                children: target.note
              })
            ]
          })
        }, target.id);
      }),
      /* @__PURE__ */ jsx("p", {
        "aria-live": "polite",
        className: platformInstallClassName(["status"]),
        role: "status",
        children: status === null ? "" : status.ok ? `Copied the ${status.subject}.` : `Copying failed. The ${status.subject} is selected; copy it with your keyboard.`
      })
    ]
  });
}

export { PlatformInstall };
