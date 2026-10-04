import {
  Avatar,
  MockupGlyph,
  MockupRoot,
  PlaceholderPhoto,
  SampleParagraphs,
  SampleText,
  WindowLights,
  compact
} from "./chunk-kz59614q.js";
// src/mockups/frames.tsx
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
var MOCKUP_EXAMPLE_HOST = /(^|\.)(example(\.(com|net|org))?|test|invalid|localhost)$/u;
function mockupAddress(url) {
  const trimmed = url.trim().replace(/^[a-z]+:\/\//iu, "");
  const slash = trimmed.indexOf("/");
  const host = (slash < 0 ? trimmed : trimmed.slice(0, slash)).toLowerCase();
  const path = slash < 0 ? "" : trimmed.slice(slash);
  if (!MOCKUP_EXAMPLE_HOST.test(host)) {
    throw new RangeError(`Mockup address ${JSON.stringify(url)} must use a reserved example host such as example.com or site.example.`);
  }
  return {
    host,
    path: path === "/" ? "" : path
  };
}
function pageStyle(height) {
  if (height === undefined)
    return;
  if (!(height > 0))
    throw new RangeError("A mockup page height must be positive.");
  return {
    "--hkm-page-height": `${height}px`
  };
}
function optOutProps(optOut) {
  return optOut === undefined ? {} : {
    optOut
  };
}
function BrowserFrame({
  children,
  fade,
  height,
  toolbar,
  url,
  ...root
}) {
  return /* @__PURE__ */ jsx(MockupRoot, {
    ...root,
    kind: "browser",
    children: /* @__PURE__ */ jsx(BrowserWindow, {
      ...fade === undefined ? {} : {
        fade
      },
      ...height === undefined ? {} : {
        height
      },
      toolbar,
      url,
      children
    })
  });
}
function BrowserWindow({
  children,
  fade,
  height,
  toolbar,
  url
}) {
  const {
    host,
    path
  } = mockupAddress(url);
  const fades = fade ?? height !== undefined;
  return /* @__PURE__ */ jsxs("div", {
    className: "hkm-window",
    children: [
      /* @__PURE__ */ jsxs("div", {
        "aria-hidden": "true",
        className: "hkm-browser-bar",
        children: [
          /* @__PURE__ */ jsx(WindowLights, {}),
          /* @__PURE__ */ jsxs("span", {
            className: "hkm-browser-nav",
            children: [
              /* @__PURE__ */ jsx(MockupGlyph, {
                name: "back",
                size: 16
              }),
              /* @__PURE__ */ jsx(MockupGlyph, {
                name: "forward",
                size: 16
              }),
              /* @__PURE__ */ jsx(MockupGlyph, {
                name: "reload",
                size: 15
              })
            ]
          }),
          /* @__PURE__ */ jsxs("span", {
            className: "hkm-address",
            children: [
              /* @__PURE__ */ jsx(MockupGlyph, {
                name: "lock",
                size: 12
              }),
              /* @__PURE__ */ jsx("span", {
                className: "hkm-address-host",
                children: host
              }),
              path === "" ? null : /* @__PURE__ */ jsx("span", {
                className: "hkm-address-path",
                children: path
              })
            ]
          }),
          /* @__PURE__ */ jsx("span", {
            className: "hkm-browser-tools",
            children: toolbar
          })
        ]
      }),
      /* @__PURE__ */ jsx("div", {
        className: "hkm-page",
        "data-hkm-fade": fades ? "" : undefined,
        style: pageStyle(height),
        children
      })
    ]
  });
}
var TERMINAL_KINDS = new Set(["input", "output", "comment"]);
function TerminalFrame({
  density = "standard",
  fade,
  height,
  lines,
  prompt = "$",
  title = "Terminal",
  ...root
}) {
  if (density !== "standard" && density !== "presentation")
    throw new RangeError("Terminal density must be standard or presentation.");
  for (const line of lines) {
    if (!TERMINAL_KINDS.has(line.kind))
      throw new TypeError(`Unknown terminal line kind ${JSON.stringify(line.kind)}.`);
  }
  const fades = fade ?? height !== undefined;
  return /* @__PURE__ */ jsx(MockupRoot, {
    ...root,
    kind: "terminal",
    children: /* @__PURE__ */ jsxs("div", {
      className: "hkm-window",
      children: [
        /* @__PURE__ */ jsxs("div", {
          "aria-hidden": "true",
          className: "hkm-title-bar",
          children: [
            /* @__PURE__ */ jsx(WindowLights, {}),
            /* @__PURE__ */ jsx("span", {
              className: "hkm-title",
              children: title
            }),
            /* @__PURE__ */ jsx("span", {})
          ]
        }),
        /* @__PURE__ */ jsx("div", {
          className: "hkm-page hkm-terminal-body",
          "data-hkm-density": density === "presentation" ? density : undefined,
          "data-hkm-fade": fades ? "" : undefined,
          style: pageStyle(height),
          children: /* @__PURE__ */ jsxs("div", {
            className: "hkm-terminal-lines",
            children: [
              lines.map((line, index) => /* @__PURE__ */ jsxs("div", {
                className: "hkm-terminal-line",
                "data-hkm-beat": line.beat,
                "data-hkm-line": line.kind,
                "data-hkm-tone": line.tone,
                children: [
                  line.kind === "input" ? /* @__PURE__ */ jsx("span", {
                    className: "hkm-terminal-prompt",
                    children: prompt
                  }) : null,
                  line.kind === "comment" ? /* @__PURE__ */ jsx("span", {
                    className: "hkm-terminal-prompt",
                    children: "#"
                  }) : null,
                  /* @__PURE__ */ jsx(SampleText, {
                    ...optOutProps(root.optOut),
                    children: line.text
                  })
                ]
              }, index)),
              /* @__PURE__ */ jsxs("div", {
                "aria-hidden": "true",
                className: "hkm-terminal-line",
                "data-hkm-line": "input",
                children: [
                  /* @__PURE__ */ jsx("span", {
                    className: "hkm-terminal-prompt",
                    children: prompt
                  }),
                  /* @__PURE__ */ jsx("span", {
                    className: "hkm-caret"
                  })
                ]
              })
            ]
          })
        })
      ]
    })
  });
}
function MacWindow({
  children,
  sidebar,
  title,
  toolbar,
  ...root
}) {
  return /* @__PURE__ */ jsx(MockupRoot, {
    ...root,
    kind: "app-window",
    children: /* @__PURE__ */ jsxs("div", {
      className: "hkm-window",
      "data-hkm-sidebar": sidebar === undefined ? undefined : "",
      children: [
        sidebar === undefined ? null : /* @__PURE__ */ jsxs("div", {
          className: "hkm-app-sidebar",
          children: [
            /* @__PURE__ */ jsx(WindowLights, {}),
            /* @__PURE__ */ jsx("div", {
              className: "hkm-app-sidebar-body",
              children: sidebar
            })
          ]
        }),
        /* @__PURE__ */ jsxs("div", {
          className: "hkm-app-main",
          children: [
            /* @__PURE__ */ jsxs("div", {
              className: "hkm-title-bar hkm-app-bar",
              children: [
                sidebar === undefined ? /* @__PURE__ */ jsx(WindowLights, {}) : /* @__PURE__ */ jsx("span", {}),
                /* @__PURE__ */ jsx("span", {
                  className: "hkm-title",
                  children: title
                }),
                /* @__PURE__ */ jsx("span", {
                  className: "hkm-app-tools",
                  children: toolbar
                })
              ]
            }),
            /* @__PURE__ */ jsx("div", {
              className: "hkm-app-content",
              children
            })
          ]
        })
      ]
    })
  });
}
function MenuBarPopover({
  footer,
  items,
  mark,
  title,
  ...root
}) {
  const ids = new Set;
  for (const item of items) {
    if (ids.has(item.id))
      throw new RangeError(`MenuBarPopover item ids must be unique: ${item.id}`);
    ids.add(item.id);
  }
  return /* @__PURE__ */ jsxs(MockupRoot, {
    ...root,
    kind: "menubar",
    children: [
      /* @__PURE__ */ jsxs("div", {
        "aria-hidden": "true",
        className: "hkm-menubar",
        children: [
          /* @__PURE__ */ jsx("span", {
            className: "hkm-menubar-spacer"
          }),
          /* @__PURE__ */ jsx(MockupGlyph, {
            name: "search",
            size: 14
          }),
          /* @__PURE__ */ jsx("span", {
            className: "hkm-menubar-item",
            "data-hkm-open": "",
            children: mark ?? /* @__PURE__ */ jsx("span", {
              className: "hkm-menubar-dot"
            })
          }),
          /* @__PURE__ */ jsx("span", {
            className: "hkm-menubar-clock",
            children: "9:41"
          })
        ]
      }),
      /* @__PURE__ */ jsxs("div", {
        className: "hkm-popover",
        children: [
          title === undefined ? null : /* @__PURE__ */ jsx("div", {
            className: "hkm-popover-title",
            children: title
          }),
          /* @__PURE__ */ jsx("ul", {
            className: "hkm-popover-list",
            children: items.map((item) => /* @__PURE__ */ jsxs("li", {
              className: "hkm-popover-item",
              "data-hkm-selected": item.selected === true ? "" : undefined,
              "data-hkm-tone": item.tone,
              children: [
                /* @__PURE__ */ jsx("span", {
                  className: "hkm-popover-dot"
                }),
                /* @__PURE__ */ jsxs("span", {
                  className: "hkm-popover-text",
                  children: [
                    /* @__PURE__ */ jsx("span", {
                      className: "hkm-popover-label",
                      children: /* @__PURE__ */ jsx(SampleText, {
                        ...optOutProps(root.optOut),
                        children: item.label
                      })
                    }),
                    item.detail === undefined ? null : /* @__PURE__ */ jsx("span", {
                      className: "hkm-popover-detail",
                      children: /* @__PURE__ */ jsx(SampleText, {
                        ...optOutProps(root.optOut),
                        children: item.detail
                      })
                    })
                  ]
                })
              ]
            }, item.id))
          }),
          footer === undefined ? null : /* @__PURE__ */ jsx("div", {
            className: "hkm-popover-footer",
            children: footer
          })
        ]
      })
    ]
  });
}
function PhoneFrame({
  children,
  screenHeight,
  statusTime,
  width,
  ...root
}) {
  return /* @__PURE__ */ jsx(MockupRoot, {
    ...root,
    kind: "phone",
    style: phoneStyle(width, screenHeight),
    children: /* @__PURE__ */ jsx(PhoneShell, {
      ...statusTime === undefined ? {} : {
        statusTime
      },
      children: /* @__PURE__ */ jsx("div", {
        className: "hkm-phone-body",
        children
      })
    })
  });
}
function phoneStyle(width, screenHeight) {
  const style = {};
  if (width !== undefined) {
    if (!(width > 0))
      throw new RangeError("A phone mockup width must be positive.");
    style["--hkm-phone-width"] = `${width}px`;
  }
  if (screenHeight !== undefined) {
    if (!(screenHeight >= 200 && screenHeight <= 844))
      throw new RangeError("A phone mockup screenHeight must be 200 to 844 points.");
    style["--hkm-phone-height"] = String(screenHeight + 22);
  }
  return Object.keys(style).length === 0 ? undefined : style;
}
function PhoneShell({
  children,
  statusTime = "9:41"
}) {
  return /* @__PURE__ */ jsxs("div", {
    className: "hkm-device",
    children: [
      /* @__PURE__ */ jsx("span", {
        "aria-hidden": "true",
        className: "hkm-device-button",
        "data-hkm-button": "action"
      }),
      /* @__PURE__ */ jsx("span", {
        "aria-hidden": "true",
        className: "hkm-device-button",
        "data-hkm-button": "volume-up"
      }),
      /* @__PURE__ */ jsx("span", {
        "aria-hidden": "true",
        className: "hkm-device-button",
        "data-hkm-button": "volume-down"
      }),
      /* @__PURE__ */ jsx("span", {
        "aria-hidden": "true",
        className: "hkm-device-button",
        "data-hkm-button": "power"
      }),
      /* @__PURE__ */ jsx("div", {
        className: "hkm-bezel",
        children: /* @__PURE__ */ jsxs("div", {
          className: "hkm-screen",
          children: [
            /* @__PURE__ */ jsx("div", {
              className: "hkm-screen-content",
              children
            }),
            /* @__PURE__ */ jsxs("div", {
              "aria-hidden": "true",
              className: "hkm-status-bar",
              children: [
                /* @__PURE__ */ jsx("span", {
                  className: "hkm-status-time",
                  children: statusTime
                }),
                /* @__PURE__ */ jsxs("span", {
                  className: "hkm-status-glyphs",
                  children: [
                    /* @__PURE__ */ jsxs("svg", {
                      className: "hkm-status-cell",
                      viewBox: "0 0 19 12",
                      children: [
                        /* @__PURE__ */ jsx("rect", {
                          height: "4.5",
                          rx: "0.9",
                          width: "3.2",
                          x: "0",
                          y: "7.5"
                        }),
                        /* @__PURE__ */ jsx("rect", {
                          height: "6.8",
                          rx: "0.9",
                          width: "3.2",
                          x: "5.1",
                          y: "5.2"
                        }),
                        /* @__PURE__ */ jsx("rect", {
                          height: "9.3",
                          rx: "0.9",
                          width: "3.2",
                          x: "10.2",
                          y: "2.7"
                        }),
                        /* @__PURE__ */ jsx("rect", {
                          height: "12",
                          rx: "0.9",
                          width: "3.2",
                          x: "15.3",
                          y: "0"
                        })
                      ]
                    }),
                    /* @__PURE__ */ jsxs("svg", {
                      className: "hkm-status-wifi",
                      viewBox: "0 0 17 12.3",
                      children: [
                        /* @__PURE__ */ jsx("path", {
                          d: "M8.5 2.6c2.4 0 4.6.9 6.2 2.4.2.2.5.2.7 0l1.2-1.2c.2-.2.2-.5 0-.7C14.5 1.2 11.6 0 8.5 0S2.5 1.2.4 3.1c-.2.2-.2.5 0 .7L1.6 5c.2.2.5.2.7 0C3.9 3.5 6.1 2.6 8.5 2.6Z"
                        }),
                        /* @__PURE__ */ jsx("path", {
                          d: "M8.5 6.4c1.3 0 2.5.5 3.5 1.3.2.2.5.2.7 0l1.2-1.2c.2-.2.2-.5 0-.7-1.4-1.3-3.3-2-5.4-2s-4 .7-5.4 2c-.2.2-.2.5 0 .7l1.2 1.2c.2.2.5.2.7 0 1-.8 2.2-1.3 3.5-1.3Z"
                        }),
                        /* @__PURE__ */ jsx("path", {
                          d: "M11.1 9.4c.2-.2.2-.5 0-.7-.7-.6-1.6-1-2.6-1s-1.9.4-2.6 1c-.2.2-.2.5 0 .7l2.2 2.2c.2.2.5.2.7 0l2.3-2.2Z"
                        })
                      ]
                    }),
                    /* @__PURE__ */ jsxs("svg", {
                      className: "hkm-status-battery",
                      viewBox: "0 0 27.4 13",
                      children: [
                        /* @__PURE__ */ jsx("rect", {
                          fill: "none",
                          height: "12",
                          rx: "3.8",
                          stroke: "currentColor",
                          strokeOpacity: "0.35",
                          width: "24",
                          x: "0.5",
                          y: "0.5"
                        }),
                        /* @__PURE__ */ jsx("rect", {
                          height: "9",
                          rx: "2.5",
                          width: "21",
                          x: "2",
                          y: "2"
                        }),
                        /* @__PURE__ */ jsx("path", {
                          d: "M26 4.4v4.2c.8-.3 1.4-1.1 1.4-2.1S26.8 4.7 26 4.4Z",
                          fillOpacity: "0.4"
                        })
                      ]
                    })
                  ]
                })
              ]
            }),
            /* @__PURE__ */ jsx("span", {
              "aria-hidden": "true",
              className: "hkm-island"
            }),
            /* @__PURE__ */ jsx("span", {
              "aria-hidden": "true",
              className: "hkm-home-indicator"
            })
          ]
        })
      })
    ]
  });
}
function AgentSession({
  agent,
  fade,
  height,
  title,
  turns,
  ...root
}) {
  if (agent !== "generic-cli" && agent !== "generic-chat")
    throw new TypeError(`Unknown agent chrome ${JSON.stringify(agent)}.`);
  const fades = fade ?? height !== undefined;
  const sample = optOutProps(root.optOut);
  return /* @__PURE__ */ jsx(MockupRoot, {
    ...root,
    kind: "agent",
    children: /* @__PURE__ */ jsxs("div", {
      className: "hkm-window",
      "data-hkm-agent": agent,
      children: [
        /* @__PURE__ */ jsxs("div", {
          "aria-hidden": "true",
          className: "hkm-title-bar",
          children: [
            /* @__PURE__ */ jsx(WindowLights, {}),
            /* @__PURE__ */ jsx("span", {
              className: "hkm-title",
              children: title ?? (agent === "generic-cli" ? "Coding agent" : "Assistant")
            }),
            /* @__PURE__ */ jsx("span", {})
          ]
        }),
        /* @__PURE__ */ jsx("div", {
          className: "hkm-page hkm-agent-body",
          "data-hkm-fade": fades ? "" : undefined,
          style: pageStyle(height),
          children: /* @__PURE__ */ jsx("ol", {
            className: "hkm-agent-turns",
            children: turns.map((turn, index) => /* @__PURE__ */ jsx("li", {
              className: "hkm-agent-turn",
              "data-hkm-beat": turn.beat,
              "data-hkm-role": turn.role,
              "data-hkm-tone": turn.status,
              children: turn.role === "tool" ? /* @__PURE__ */ jsxs("span", {
                className: "hkm-agent-tool",
                children: [
                  /* @__PURE__ */ jsxs("span", {
                    className: "hkm-agent-tool-name",
                    children: [
                      /* @__PURE__ */ jsx("span", {
                        className: "hkm-agent-status"
                      }),
                      turn.tool ?? "Tool"
                    ]
                  }),
                  /* @__PURE__ */ jsx("span", {
                    className: "hkm-agent-tool-output",
                    children: /* @__PURE__ */ jsx(SampleText, {
                      ...sample,
                      children: turn.text
                    })
                  })
                ]
              }) : /* @__PURE__ */ jsxs(Fragment, {
                children: [
                  /* @__PURE__ */ jsx("span", {
                    "aria-hidden": "true",
                    className: "hkm-agent-marker",
                    children: turn.role === "user" ? "›" : /* @__PURE__ */ jsx(MockupGlyph, {
                      name: "sparkle",
                      size: 14
                    })
                  }),
                  /* @__PURE__ */ jsx("span", {
                    className: "hkm-agent-text",
                    children: /* @__PURE__ */ jsx(SampleText, {
                      ...sample,
                      children: turn.text
                    })
                  })
                ]
              })
            }, index))
          })
        }),
        agent === "generic-chat" ? /* @__PURE__ */ jsxs("div", {
          "aria-hidden": "true",
          className: "hkm-agent-composer",
          children: [
            /* @__PURE__ */ jsx("span", {
              className: "hkm-agent-composer-field",
              children: "Ask for a change"
            }),
            /* @__PURE__ */ jsx("span", {
              className: "hkm-agent-composer-send",
              children: /* @__PURE__ */ jsx(MockupGlyph, {
                name: "send",
                size: 14
              })
            })
          ]
        }) : null
      ]
    })
  });
}
// src/mockups/surfaces.tsx
import { Fragment as Fragment2 } from "react";
import { jsx as jsx2, jsxs as jsxs2, Fragment as Fragment3 } from "react/jsx-runtime";
function sample(optOut) {
  return optOut === undefined ? {} : {
    optOut
  };
}
function counted(value, noun) {
  return `${compact(value)} ${value === 1 ? noun : `${noun}s`}`;
}
function assertUniqueKeys(keys, component) {
  const seen = new Set;
  for (const key of keys) {
    if (seen.has(key))
      throw new RangeError(`${component} keys must be unique: ${key}`);
    seen.add(key);
  }
}
function chatSide(from) {
  return from === "me" ? "out" : "in";
}
var TAIL_PATH = "M-16 -17.5H0C0 -7.6 1.7 -2.4 6.4 -0.45 6.95 -0.2 6.85 0.45 6.2 0.5 2.6 0.7 -1.2 -0.6 -3.4 -2.5 -4.3 -3.3 -5.2 -4.1 -6 -4.9L-16 -17.5Z";
function isEmojiOnly(text) {
  const trimmed = text.trim();
  if (trimmed === "")
    return false;
  if (!/^(?:[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2300}-\u{23FF}\u{1F1E6}-\u{1F1FF}\u{E0020}-\u{E007F}©®‼⁉™ℹ]|‍|️|⃣|\s)+$/u.test(trimmed))
    return false;
  if (/[0-9#*]/u.test(trimmed))
    return false;
  const segmenter = new Intl.Segmenter(undefined, {
    granularity: "grapheme"
  });
  return [...segmenter.segment(trimmed.replace(/\s+/gu, ""))].length <= 3;
}
function ChatThread({
  contact,
  device = "phone",
  messages,
  screenHeight,
  statusTime,
  typing = false,
  variant = "bubbles",
  via,
  visibleCount,
  width,
  ...root
}) {
  if (variant !== "bubbles" && variant !== "chat")
    throw new TypeError(`Unknown chat variant ${JSON.stringify(variant)}.`);
  const count = visibleCount ?? messages.length;
  if (!Number.isInteger(count) || count < 0 || count > messages.length)
    throw new RangeError("ChatThread visibleCount must be 0 to messages.length.");
  const shown = messages.slice(0, count);
  const sides = shown.map((message) => chatSide(message.from));
  const lastOut = sides.lastIndexOf("out") === sides.length - 1 && !typing ? sides.length - 1 : -1;
  const screen = /* @__PURE__ */ jsxs2("div", {
    className: "hkm-chat",
    "data-hkm-chat": variant,
    "data-hkm-via": via === undefined ? undefined : "",
    children: [
      /* @__PURE__ */ jsx2("div", {
        className: "hkm-chat-thread",
        children: /* @__PURE__ */ jsxs2("div", {
          className: "hkm-chat-inner",
          children: [
            shown.map((message, index) => {
              const side = sides[index] ?? "in";
              const first = index === 0 || sides[index - 1] !== side || message.time !== undefined;
              const next = shown[index + 1];
              const last = index === shown.length - 1 || sides[index + 1] !== side || next?.time !== undefined;
              const emoji = isEmojiOnly(message.text);
              const tail = variant === "chat" ? first ? "top" : undefined : last && !emoji ? "bottom" : undefined;
              return /* @__PURE__ */ jsxs2(Fragment2, {
                children: [
                  message.time === undefined ? null : /* @__PURE__ */ jsx2("div", {
                    className: "hkm-chat-divider",
                    children: /* @__PURE__ */ jsx2(SampleText, {
                      ...sample(root.optOut),
                      children: message.time
                    })
                  }),
                  /* @__PURE__ */ jsxs2("div", {
                    className: "hkm-chat-row",
                    "data-hkm-first": first ? "" : undefined,
                    "data-hkm-from": message.from,
                    "data-hkm-last": last ? "" : undefined,
                    "data-hkm-side": side,
                    children: [
                      /* @__PURE__ */ jsxs2("div", {
                        className: "hkm-bubble",
                        "data-hkm-emoji": emoji ? "" : undefined,
                        "data-hkm-tail": tail,
                        children: [
                          /* @__PURE__ */ jsx2(SampleText, {
                            ...sample(root.optOut),
                            children: message.text
                          }),
                          tail === "bottom" ? /* @__PURE__ */ jsx2("svg", {
                            "aria-hidden": "true",
                            className: "hkm-bubble-tail",
                            focusable: "false",
                            viewBox: "-16 -17.5 23 18",
                            children: /* @__PURE__ */ jsx2("path", {
                              d: TAIL_PATH
                            })
                          }) : null
                        ]
                      }),
                      message.label === undefined ? null : /* @__PURE__ */ jsx2("span", {
                        className: "hkm-chat-label",
                        children: message.label
                      })
                    ]
                  }),
                  index === lastOut && variant === "bubbles" ? /* @__PURE__ */ jsx2("div", {
                    className: "hkm-chat-receipt",
                    children: "Delivered"
                  }) : null
                ]
              }, message.id ?? index);
            }),
            typing ? /* @__PURE__ */ jsx2("div", {
              className: "hkm-chat-row",
              "data-hkm-first": "",
              "data-hkm-last": "",
              "data-hkm-side": "in",
              children: /* @__PURE__ */ jsx2(TypingIndicator, {})
            }) : null
          ]
        })
      }),
      /* @__PURE__ */ jsxs2("div", {
        "aria-hidden": "true",
        className: "hkm-chat-nav",
        children: [
          /* @__PURE__ */ jsx2("span", {
            className: "hkm-chat-back",
            children: /* @__PURE__ */ jsx2(MockupGlyph, {
              name: "back",
              size: 22
            })
          }),
          /* @__PURE__ */ jsxs2("span", {
            className: "hkm-chat-contact",
            children: [
              /* @__PURE__ */ jsx2(Avatar, {
                name: contact ?? "Contact",
                size: variant === "chat" ? 32 : 44
              }),
              /* @__PURE__ */ jsx2("span", {
                className: "hkm-chat-name",
                children: contact ?? "Contact"
              }),
              via === undefined ? null : /* @__PURE__ */ jsx2("span", {
                className: "hkm-chat-via",
                children: via
              })
            ]
          }),
          /* @__PURE__ */ jsx2("span", {
            className: "hkm-chat-call",
            children: /* @__PURE__ */ jsx2(MockupGlyph, {
              name: "comment",
              size: 18
            })
          })
        ]
      }),
      /* @__PURE__ */ jsxs2("div", {
        "aria-hidden": "true",
        className: "hkm-chat-composer",
        children: [
          /* @__PURE__ */ jsx2("span", {
            className: "hkm-chat-plus",
            children: /* @__PURE__ */ jsx2(MockupGlyph, {
              name: "plus",
              size: 16
            })
          }),
          /* @__PURE__ */ jsx2("span", {
            className: "hkm-chat-field",
            children: "Message"
          })
        ]
      })
    ]
  });
  return /* @__PURE__ */ jsx2(MockupRoot, {
    ...root,
    kind: "chat",
    style: device === "phone" ? phoneStyle(width, screenHeight) : undefined,
    children: device === "phone" ? /* @__PURE__ */ jsx2(PhoneShell, {
      ...statusTime === undefined ? {} : {
        statusTime
      },
      children: screen
    }) : /* @__PURE__ */ jsx2("div", {
      className: "hkm-chat-bare",
      children: screen
    })
  });
}
function TypingIndicator() {
  return /* @__PURE__ */ jsxs2("span", {
    "aria-hidden": "true",
    className: "hkm-typing",
    children: [
      /* @__PURE__ */ jsx2("i", {}),
      /* @__PURE__ */ jsx2("i", {}),
      /* @__PURE__ */ jsx2("i", {})
    ]
  });
}
function keyed(posts, postKey, component) {
  const keys = posts.map((post, index) => postKey === undefined ? String(index) : postKey(post, index));
  assertUniqueKeys(keys, component);
  return keys;
}
var SOCIAL_RAIL = [["home", "Home"], ["search", "Explore"], ["bell", "Notifications"], ["mail", "Messages"], ["bookmark", "Saved"], ["user", "Profile"]];
function SocialFeed({
  aside,
  height,
  postKey,
  posts,
  renderPost,
  url = "social.example/home",
  viewer = "Alex Moreno",
  ...root
}) {
  const keys = keyed(posts, postKey, "SocialFeed");
  return /* @__PURE__ */ jsx2(MockupRoot, {
    ...root,
    kind: "social",
    children: /* @__PURE__ */ jsx2(BrowserWindow, {
      ...height === undefined ? {} : {
        height
      },
      url,
      children: /* @__PURE__ */ jsxs2("div", {
        className: "hkm-social",
        children: [
          /* @__PURE__ */ jsxs2("div", {
            "aria-hidden": "true",
            className: "hkm-social-rail",
            children: [
              /* @__PURE__ */ jsx2("span", {
                className: "hkm-social-mark",
                children: /* @__PURE__ */ jsx2(MockupGlyph, {
                  name: "sparkle",
                  size: 22
                })
              }),
              SOCIAL_RAIL.map(([glyph, label], index) => /* @__PURE__ */ jsxs2("span", {
                className: "hkm-rail-item",
                "data-hkm-active": index === 0 ? "" : undefined,
                children: [
                  /* @__PURE__ */ jsx2(MockupGlyph, {
                    filled: index === 0,
                    name: glyph,
                    size: 22
                  }),
                  /* @__PURE__ */ jsx2("span", {
                    className: "hkm-rail-label",
                    children: label
                  })
                ]
              }, label)),
              /* @__PURE__ */ jsxs2("span", {
                className: "hkm-rail-cta",
                children: [
                  /* @__PURE__ */ jsx2("span", {
                    className: "hkm-rail-label",
                    children: "Post"
                  }),
                  /* @__PURE__ */ jsx2(MockupGlyph, {
                    className: "hkm-rail-cta-glyph",
                    name: "pencil",
                    size: 18
                  })
                ]
              }),
              /* @__PURE__ */ jsxs2("span", {
                className: "hkm-rail-me",
                children: [
                  /* @__PURE__ */ jsx2(Avatar, {
                    name: viewer,
                    size: 32
                  }),
                  /* @__PURE__ */ jsx2("span", {
                    className: "hkm-rail-label",
                    children: viewer
                  })
                ]
              })
            ]
          }),
          /* @__PURE__ */ jsxs2("div", {
            className: "hkm-social-main",
            children: [
              /* @__PURE__ */ jsxs2("div", {
                "aria-hidden": "true",
                className: "hkm-social-tabs",
                children: [
                  /* @__PURE__ */ jsx2("span", {
                    "data-hkm-active": "",
                    children: "For you"
                  }),
                  /* @__PURE__ */ jsx2("span", {
                    children: "Following"
                  })
                ]
              }),
              /* @__PURE__ */ jsxs2("div", {
                "aria-hidden": "true",
                className: "hkm-social-compose",
                children: [
                  /* @__PURE__ */ jsx2(Avatar, {
                    name: viewer,
                    size: 36
                  }),
                  /* @__PURE__ */ jsx2("span", {
                    className: "hkm-social-compose-field",
                    children: "Share something"
                  }),
                  /* @__PURE__ */ jsx2("span", {
                    className: "hkm-social-compose-button",
                    children: "Post"
                  })
                ]
              }),
              /* @__PURE__ */ jsx2("div", {
                className: "hkm-feed",
                children: posts.map((post, index) => /* @__PURE__ */ jsx2(Fragment2, {
                  children: renderPost(post, index)
                }, keys[index]))
              })
            ]
          }),
          /* @__PURE__ */ jsx2("div", {
            "aria-hidden": "true",
            className: "hkm-social-aside",
            children: aside ?? /* @__PURE__ */ jsxs2(Fragment3, {
              children: [
                /* @__PURE__ */ jsxs2("span", {
                  className: "hkm-search-field",
                  children: [
                    /* @__PURE__ */ jsx2(MockupGlyph, {
                      name: "search",
                      size: 14
                    }),
                    "Search"
                  ]
                }),
                /* @__PURE__ */ jsxs2("span", {
                  className: "hkm-card hkm-aside-card",
                  children: [
                    /* @__PURE__ */ jsx2("span", {
                      className: "hkm-aside-title",
                      children: "Trending"
                    }),
                    ["Night markets", "Rail timetables", "Sourdough"].map((topic) => /* @__PURE__ */ jsx2("span", {
                      className: "hkm-aside-line",
                      children: topic
                    }, topic))
                  ]
                })
              ]
            })
          })
        ]
      })
    })
  });
}
function SocialPost({
  attributes,
  counts,
  handle,
  name,
  optOut,
  overlay,
  photo,
  text,
  time
}) {
  return /* @__PURE__ */ jsxs2("div", {
    ...attributes,
    className: "hkm-unit hkm-post",
    children: [
      overlay,
      /* @__PURE__ */ jsx2(Avatar, {
        name,
        size: 40
      }),
      /* @__PURE__ */ jsxs2("div", {
        className: "hkm-post-body",
        children: [
          /* @__PURE__ */ jsxs2("div", {
            className: "hkm-post-head",
            children: [
              /* @__PURE__ */ jsx2("b", {
                children: /* @__PURE__ */ jsx2(SampleText, {
                  ...sample(optOut),
                  children: name
                })
              }),
              /* @__PURE__ */ jsx2("span", {
                className: "hkm-muted",
                children: /* @__PURE__ */ jsxs2(SampleText, {
                  ...sample(optOut),
                  children: [
                    "@",
                    handle,
                    " · ",
                    time
                  ]
                })
              }),
              /* @__PURE__ */ jsx2("span", {
                "aria-hidden": "true",
                className: "hkm-muted hkm-post-more",
                children: /* @__PURE__ */ jsx2(MockupGlyph, {
                  name: "more",
                  size: 18
                })
              })
            ]
          }),
          /* @__PURE__ */ jsx2("div", {
            className: "hkm-post-text",
            children: /* @__PURE__ */ jsx2(SampleParagraphs, {
              ...sample(optOut),
              text
            })
          }),
          photo === undefined ? null : /* @__PURE__ */ jsx2(PlaceholderPhoto, {
            className: "hkm-post-photo",
            seed: photo
          }),
          counts === undefined ? null : /* @__PURE__ */ jsxs2("div", {
            "aria-hidden": "true",
            className: "hkm-post-actions hkm-muted",
            children: [
              /* @__PURE__ */ jsxs2("span", {
                children: [
                  /* @__PURE__ */ jsx2(MockupGlyph, {
                    name: "reply",
                    size: 17
                  }),
                  compact(counts[0])
                ]
              }),
              /* @__PURE__ */ jsxs2("span", {
                children: [
                  /* @__PURE__ */ jsx2(MockupGlyph, {
                    name: "repost",
                    size: 17
                  }),
                  compact(counts[1])
                ]
              }),
              /* @__PURE__ */ jsxs2("span", {
                children: [
                  /* @__PURE__ */ jsx2(MockupGlyph, {
                    name: "heart",
                    size: 17
                  }),
                  compact(counts[2])
                ]
              }),
              /* @__PURE__ */ jsxs2("span", {
                children: [
                  /* @__PURE__ */ jsx2(MockupGlyph, {
                    name: "chart",
                    size: 17
                  }),
                  compact(counts[3])
                ]
              }),
              /* @__PURE__ */ jsx2("span", {
                className: "hkm-post-actions-end",
                children: /* @__PURE__ */ jsx2(MockupGlyph, {
                  name: "share",
                  size: 17
                })
              })
            ]
          })
        ]
      })
    ]
  });
}
function WorkFeed({
  aside,
  height,
  postKey,
  posts,
  renderPost,
  url = "network.example/feed",
  viewer = "Alex Moreno",
  ...root
}) {
  const keys = keyed(posts, postKey, "WorkFeed");
  return /* @__PURE__ */ jsx2(MockupRoot, {
    ...root,
    kind: "work",
    children: /* @__PURE__ */ jsxs2(BrowserWindow, {
      ...height === undefined ? {} : {
        height
      },
      url,
      children: [
        /* @__PURE__ */ jsxs2("div", {
          "aria-hidden": "true",
          className: "hkm-work-top",
          children: [
            /* @__PURE__ */ jsx2("span", {
              className: "hkm-work-mark",
              children: /* @__PURE__ */ jsx2(MockupGlyph, {
                name: "grid",
                size: 18
              })
            }),
            /* @__PURE__ */ jsxs2("span", {
              className: "hkm-search-field",
              children: [
                /* @__PURE__ */ jsx2(MockupGlyph, {
                  name: "search",
                  size: 14
                }),
                "Search"
              ]
            }),
            /* @__PURE__ */ jsxs2("span", {
              className: "hkm-work-nav",
              children: [
                ["home", "people", "comment", "bell"].map((glyph, index) => /* @__PURE__ */ jsx2("span", {
                  "data-hkm-active": index === 0 ? "" : undefined,
                  children: /* @__PURE__ */ jsx2(MockupGlyph, {
                    filled: index === 0,
                    name: glyph,
                    size: 20
                  })
                }, glyph)),
                /* @__PURE__ */ jsx2(Avatar, {
                  name: viewer,
                  size: 22
                })
              ]
            })
          ]
        }),
        /* @__PURE__ */ jsxs2("div", {
          className: "hkm-work",
          children: [
            /* @__PURE__ */ jsx2("div", {
              "aria-hidden": "true",
              className: "hkm-work-left",
              children: /* @__PURE__ */ jsxs2("span", {
                className: "hkm-card hkm-work-profile",
                children: [
                  /* @__PURE__ */ jsx2("span", {
                    className: "hkm-work-cover"
                  }),
                  /* @__PURE__ */ jsx2(Avatar, {
                    name: viewer,
                    size: 56
                  }),
                  /* @__PURE__ */ jsx2("b", {
                    children: viewer
                  }),
                  /* @__PURE__ */ jsx2("span", {
                    className: "hkm-muted",
                    children: "Product designer"
                  })
                ]
              })
            }),
            /* @__PURE__ */ jsxs2("div", {
              className: "hkm-work-main",
              children: [
                /* @__PURE__ */ jsxs2("div", {
                  "aria-hidden": "true",
                  className: "hkm-card hkm-work-compose",
                  children: [
                    /* @__PURE__ */ jsx2(Avatar, {
                      name: viewer,
                      size: 40
                    }),
                    /* @__PURE__ */ jsx2("span", {
                      className: "hkm-social-compose-field",
                      children: "Start a post"
                    })
                  ]
                }),
                posts.map((post, index) => /* @__PURE__ */ jsx2(Fragment2, {
                  children: renderPost(post, index)
                }, keys[index]))
              ]
            }),
            /* @__PURE__ */ jsx2("div", {
              "aria-hidden": "true",
              className: "hkm-work-right",
              children: aside ?? /* @__PURE__ */ jsxs2("span", {
                className: "hkm-card hkm-aside-card",
                children: [
                  /* @__PURE__ */ jsx2("span", {
                    className: "hkm-aside-title",
                    children: "Network news"
                  }),
                  ["Teams try shorter weeks", "Bakeries hire for nights", "Fewer meetings, same output"].map((topic) => /* @__PURE__ */ jsx2("span", {
                    className: "hkm-aside-line",
                    children: topic
                  }, topic))
                ]
              })
            })
          ]
        })
      ]
    })
  });
}
function WorkPost({
  attributes,
  comment,
  headline,
  name,
  optOut,
  overlay,
  photo,
  reactions,
  text,
  time
}) {
  return /* @__PURE__ */ jsxs2("div", {
    ...attributes,
    className: "hkm-unit hkm-card hkm-work-post",
    children: [
      overlay,
      /* @__PURE__ */ jsxs2("div", {
        className: "hkm-work-post-head",
        children: [
          /* @__PURE__ */ jsx2(Avatar, {
            name,
            size: 44
          }),
          /* @__PURE__ */ jsxs2("span", {
            className: "hkm-work-who",
            children: [
              /* @__PURE__ */ jsx2("b", {
                children: /* @__PURE__ */ jsx2(SampleText, {
                  ...sample(optOut),
                  children: name
                })
              }),
              /* @__PURE__ */ jsx2("span", {
                className: "hkm-muted",
                children: /* @__PURE__ */ jsx2(SampleText, {
                  ...sample(optOut),
                  children: headline
                })
              }),
              /* @__PURE__ */ jsx2("span", {
                className: "hkm-muted",
                children: time
              })
            ]
          }),
          /* @__PURE__ */ jsx2("span", {
            "aria-hidden": "true",
            className: "hkm-work-follow",
            children: "+ Follow"
          })
        ]
      }),
      /* @__PURE__ */ jsx2("div", {
        className: "hkm-post-text",
        children: /* @__PURE__ */ jsx2(SampleParagraphs, {
          ...sample(optOut),
          text
        })
      }),
      photo === undefined ? null : /* @__PURE__ */ jsx2(PlaceholderPhoto, {
        className: "hkm-work-photo",
        ratio: "1.91 / 1",
        seed: photo
      }),
      reactions === undefined ? null : /* @__PURE__ */ jsxs2("div", {
        "aria-hidden": "true",
        className: "hkm-work-counts hkm-muted",
        children: [
          /* @__PURE__ */ jsx2("span", {
            children: counted(reactions[0], "reaction")
          }),
          /* @__PURE__ */ jsxs2("span", {
            children: [
              counted(reactions[1], "comment"),
              " · ",
              counted(reactions[2], "repost")
            ]
          })
        ]
      }),
      /* @__PURE__ */ jsxs2("div", {
        "aria-hidden": "true",
        className: "hkm-work-actions hkm-muted",
        children: [
          /* @__PURE__ */ jsxs2("span", {
            children: [
              /* @__PURE__ */ jsx2(MockupGlyph, {
                name: "thumb",
                size: 18
              }),
              "Like"
            ]
          }),
          /* @__PURE__ */ jsxs2("span", {
            children: [
              /* @__PURE__ */ jsx2(MockupGlyph, {
                name: "comment",
                size: 18
              }),
              "Comment"
            ]
          }),
          /* @__PURE__ */ jsxs2("span", {
            children: [
              /* @__PURE__ */ jsx2(MockupGlyph, {
                name: "repost",
                size: 18
              }),
              "Repost"
            ]
          }),
          /* @__PURE__ */ jsxs2("span", {
            children: [
              /* @__PURE__ */ jsx2(MockupGlyph, {
                name: "send",
                size: 18
              }),
              "Send"
            ]
          })
        ]
      }),
      comment === undefined ? null : /* @__PURE__ */ jsxs2("div", {
        className: "hkm-work-comment",
        children: [
          /* @__PURE__ */ jsx2(Avatar, {
            name: comment.name,
            size: 30
          }),
          /* @__PURE__ */ jsxs2("div", {
            ...comment.attributes,
            className: "hkm-unit hkm-work-comment-box",
            children: [
              comment.overlay,
              /* @__PURE__ */ jsx2("b", {
                children: /* @__PURE__ */ jsx2(SampleText, {
                  ...sample(optOut),
                  children: comment.name
                })
              }),
              /* @__PURE__ */ jsx2("span", {
                className: "hkm-muted",
                children: /* @__PURE__ */ jsx2(SampleText, {
                  ...sample(optOut),
                  children: comment.headline
                })
              }),
              /* @__PURE__ */ jsx2(SampleParagraphs, {
                ...sample(optOut),
                text: comment.text
              })
            ]
          })
        ]
      })
    ]
  });
}
var FOLDERS = [["inbox", "Inbox"], ["star", "Starred"], ["clock", "Snoozed"], ["send", "Sent"], ["file", "Drafts"], ["archive", "Archive"]];
function Inbox({
  height,
  open,
  renderMessage,
  renderRow,
  rowKey,
  rows,
  unread,
  url = "mail.example/inbox",
  ...root
}) {
  const keys = keyed(rows, rowKey, "Inbox");
  if (open !== undefined && renderMessage === undefined)
    throw new TypeError("Inbox needs renderMessage when open is set.");
  return /* @__PURE__ */ jsx2(MockupRoot, {
    ...root,
    kind: "inbox",
    children: /* @__PURE__ */ jsx2(BrowserWindow, {
      ...height === undefined ? {} : {
        height
      },
      url,
      children: /* @__PURE__ */ jsxs2("div", {
        className: "hkm-inbox",
        "data-hkm-open": open === undefined ? undefined : "",
        children: [
          /* @__PURE__ */ jsxs2("div", {
            "aria-hidden": "true",
            className: "hkm-inbox-folders",
            children: [
              /* @__PURE__ */ jsxs2("span", {
                className: "hkm-inbox-compose",
                children: [
                  /* @__PURE__ */ jsx2(MockupGlyph, {
                    name: "pencil",
                    size: 16
                  }),
                  "Compose"
                ]
              }),
              FOLDERS.map(([glyph, label], index) => /* @__PURE__ */ jsxs2("span", {
                className: "hkm-rail-item",
                "data-hkm-active": index === 0 ? "" : undefined,
                children: [
                  /* @__PURE__ */ jsx2(MockupGlyph, {
                    name: glyph,
                    size: 17
                  }),
                  /* @__PURE__ */ jsx2("span", {
                    className: "hkm-rail-label",
                    children: label
                  }),
                  index === 0 && unread !== undefined ? /* @__PURE__ */ jsx2("span", {
                    className: "hkm-inbox-count",
                    children: compact(unread)
                  }) : null
                ]
              }, label))
            ]
          }),
          /* @__PURE__ */ jsxs2("div", {
            className: "hkm-inbox-list",
            children: [
              /* @__PURE__ */ jsx2("div", {
                "aria-hidden": "true",
                className: "hkm-inbox-toolbar",
                children: /* @__PURE__ */ jsxs2("span", {
                  className: "hkm-search-field",
                  children: [
                    /* @__PURE__ */ jsx2(MockupGlyph, {
                      name: "search",
                      size: 14
                    }),
                    "Search mail"
                  ]
                })
              }),
              /* @__PURE__ */ jsx2("ul", {
                className: "hkm-inbox-rows",
                children: rows.map((row, index) => /* @__PURE__ */ jsx2("li", {
                  children: renderRow(row, index)
                }, keys[index]))
              })
            ]
          }),
          open === undefined || renderMessage === undefined ? null : /* @__PURE__ */ jsx2("div", {
            className: "hkm-inbox-reader",
            children: renderMessage(open)
          })
        ]
      })
    })
  });
}
function InboxRow({
  attributes,
  from,
  optOut,
  overlay,
  preview,
  selected = false,
  starred = false,
  subject,
  time,
  unread = false
}) {
  return /* @__PURE__ */ jsxs2("div", {
    ...attributes,
    className: "hkm-unit hkm-inbox-row",
    "data-hkm-selected": selected ? "" : undefined,
    "data-hkm-unread": unread ? "" : undefined,
    children: [
      overlay,
      /* @__PURE__ */ jsx2("span", {
        "aria-hidden": "true",
        className: "hkm-inbox-star",
        "data-hkm-on": starred ? "" : undefined,
        children: /* @__PURE__ */ jsx2(MockupGlyph, {
          filled: starred,
          name: "star",
          size: 15
        })
      }),
      /* @__PURE__ */ jsx2("span", {
        className: "hkm-inbox-from",
        children: /* @__PURE__ */ jsx2(SampleText, {
          ...sample(optOut),
          children: from
        })
      }),
      /* @__PURE__ */ jsxs2("span", {
        className: "hkm-inbox-line",
        children: [
          /* @__PURE__ */ jsx2("span", {
            className: "hkm-inbox-subject",
            children: /* @__PURE__ */ jsx2(SampleText, {
              ...sample(optOut),
              children: subject
            })
          }),
          /* @__PURE__ */ jsxs2("span", {
            className: "hkm-muted",
            children: [
              " · ",
              /* @__PURE__ */ jsx2(SampleText, {
                ...sample(optOut),
                children: preview
              })
            ]
          })
        ]
      }),
      /* @__PURE__ */ jsx2("span", {
        className: "hkm-inbox-time hkm-muted",
        children: time
      })
    ]
  });
}
function InboxMessage({
  attributes,
  body,
  from,
  optOut,
  overlay,
  subject,
  time,
  to = "me"
}) {
  return /* @__PURE__ */ jsxs2("div", {
    ...attributes,
    className: "hkm-unit hkm-inbox-message",
    children: [
      overlay,
      /* @__PURE__ */ jsx2("div", {
        className: "hkm-inbox-message-subject",
        children: /* @__PURE__ */ jsx2(SampleText, {
          ...sample(optOut),
          children: subject
        })
      }),
      /* @__PURE__ */ jsxs2("div", {
        className: "hkm-inbox-message-head",
        children: [
          /* @__PURE__ */ jsx2(Avatar, {
            name: from,
            size: 36
          }),
          /* @__PURE__ */ jsxs2("span", {
            className: "hkm-inbox-message-who",
            children: [
              /* @__PURE__ */ jsx2("b", {
                children: /* @__PURE__ */ jsx2(SampleText, {
                  ...sample(optOut),
                  children: from
                })
              }),
              /* @__PURE__ */ jsxs2("span", {
                className: "hkm-muted",
                children: [
                  "to ",
                  to
                ]
              })
            ]
          }),
          /* @__PURE__ */ jsx2("span", {
            className: "hkm-muted",
            children: time
          })
        ]
      }),
      /* @__PURE__ */ jsx2("div", {
        className: "hkm-inbox-message-body",
        children: /* @__PURE__ */ jsx2(SampleParagraphs, {
          ...sample(optOut),
          text: body
        })
      })
    ]
  });
}
function ArticlePage({
  byline,
  comments,
  date,
  decorate,
  dek,
  height,
  kicker,
  paragraphs,
  photo,
  site = "The Daily Example",
  title,
  url = "news.example/story",
  ...root
}) {
  if (/^by\s/iu.test(byline.trim()))
    throw new RangeError(`ArticlePage byline is the author's name; the page adds "By".`);
  const opt = sample(root.optOut);
  return /* @__PURE__ */ jsx2(MockupRoot, {
    ...root,
    kind: "article",
    children: /* @__PURE__ */ jsx2(BrowserWindow, {
      ...height === undefined ? {} : {
        height
      },
      url,
      children: /* @__PURE__ */ jsxs2("div", {
        className: "hkm-article",
        children: [
          /* @__PURE__ */ jsxs2("div", {
            "aria-hidden": "true",
            className: "hkm-article-masthead",
            children: [
              /* @__PURE__ */ jsx2(MockupGlyph, {
                name: "menu",
                size: 18
              }),
              /* @__PURE__ */ jsx2("span", {
                className: "hkm-article-site",
                children: site
              }),
              /* @__PURE__ */ jsx2(MockupGlyph, {
                name: "search",
                size: 18
              })
            ]
          }),
          /* @__PURE__ */ jsxs2("div", {
            className: "hkm-article-body",
            children: [
              kicker === undefined ? null : /* @__PURE__ */ jsx2("div", {
                className: "hkm-article-kicker",
                children: kicker
              }),
              /* @__PURE__ */ jsx2("div", {
                className: "hkm-article-title",
                children: /* @__PURE__ */ jsx2(SampleText, {
                  ...opt,
                  children: title
                })
              }),
              dek === undefined ? null : /* @__PURE__ */ jsx2("p", {
                className: "hkm-article-dek",
                children: /* @__PURE__ */ jsx2(SampleText, {
                  ...opt,
                  children: dek
                })
              }),
              /* @__PURE__ */ jsxs2("div", {
                className: "hkm-article-byline",
                children: [
                  /* @__PURE__ */ jsx2(Avatar, {
                    name: byline,
                    size: 28
                  }),
                  /* @__PURE__ */ jsxs2("span", {
                    children: [
                      "By ",
                      /* @__PURE__ */ jsx2(SampleText, {
                        ...opt,
                        children: byline
                      })
                    ]
                  }),
                  date === undefined ? null : /* @__PURE__ */ jsx2("span", {
                    className: "hkm-muted",
                    children: date
                  })
                ]
              }),
              photo === undefined ? null : /* @__PURE__ */ jsx2(PlaceholderPhoto, {
                className: "hkm-article-photo",
                ratio: "3 / 2",
                seed: photo
              }),
              /* @__PURE__ */ jsx2("div", {
                className: "hkm-article-text",
                children: paragraphs.map((paragraph, index) => {
                  const node = /* @__PURE__ */ jsx2("p", {
                    className: "hkm-unit",
                    children: /* @__PURE__ */ jsx2(SampleText, {
                      ...opt,
                      children: paragraph
                    })
                  }, index);
                  return decorate === undefined ? node : /* @__PURE__ */ jsx2(Fragment2, {
                    children: decorate(node, index)
                  }, index);
                })
              }),
              comments === undefined || comments.length === 0 ? null : /* @__PURE__ */ jsxs2("div", {
                className: "hkm-article-comments",
                children: [
                  /* @__PURE__ */ jsx2("div", {
                    className: "hkm-article-comments-title",
                    children: counted(comments.length, "comment")
                  }),
                  comments.map((comment, index) => /* @__PURE__ */ jsxs2("div", {
                    ...comment.attributes,
                    className: "hkm-unit hkm-article-comment",
                    children: [
                      comment.overlay,
                      /* @__PURE__ */ jsx2(Avatar, {
                        name: comment.name,
                        size: 30
                      }),
                      /* @__PURE__ */ jsxs2("span", {
                        className: "hkm-article-comment-body",
                        children: [
                          /* @__PURE__ */ jsx2("b", {
                            children: /* @__PURE__ */ jsx2(SampleText, {
                              ...opt,
                              children: comment.name
                            })
                          }),
                          /* @__PURE__ */ jsxs2("span", {
                            className: "hkm-muted",
                            children: [
                              " ",
                              comment.time
                            ]
                          }),
                          /* @__PURE__ */ jsx2(SampleParagraphs, {
                            ...opt,
                            text: comment.text
                          })
                        ]
                      })
                    ]
                  }, index))
                ]
              })
            ]
          })
        ]
      })
    })
  });
}
export { MOCKUP_EXAMPLE_HOST, mockupAddress, BrowserFrame, BrowserWindow, TerminalFrame, MacWindow, MenuBarPopover, PhoneFrame, phoneStyle, PhoneShell, AgentSession, chatSide, isEmojiOnly, ChatThread, TypingIndicator, SocialFeed, SocialPost, WorkFeed, WorkPost, Inbox, InboxRow, InboxMessage, ArticlePage };
