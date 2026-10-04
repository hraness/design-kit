import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { renderMarketingMarqueeHtml, type MarketingMarqueeInput } from "../marketing-marquee";
import { MarketingMarquee } from "./marketing-marquee";
import { MarketingMarquee as ServerMarketingMarquee } from "./server";

const inputs: readonly MarketingMarqueeInput[] = [
  {
    action: { href: "/sources", label: "Every source and its limits" },
    id: "sources",
    items: [
      { mark: "apple", name: "Apple Contacts" },
      { name: "iMessage" },
      { mark: "google", name: "Google Contacts" },
      { name: "LinkedIn" },
      { mark: "csv", name: "Contact CSV" },
      { mark: "vcard", name: "vCard contacts" },
      { mark: "calendar", name: "Calendar invitations" },
      { mark: "apple", name: "Apple Photos" },
    ],
    label: "Imports from {count} sources",
  },
  {
    align: "center",
    className: "product-band",
    id: "services",
    items: [{ name: "X" }, { name: "Bluesky" }, { name: "Tom & Jerry's <Shop>" }],
    label: "{count} services, one command",
    pauseLabel: "Pause the provider list",
  },
  {
    id: "plain",
    items: [{ name: "Example One" }, { name: "Example Two" }],
    label: "Works with {count} examples",
  },
];

test("MarketingMarquee and the static renderer emit the same markup", () => {
  for (const input of inputs) {
    const expected = renderMarketingMarqueeHtml(input);
    expect(renderToStaticMarkup(<MarketingMarquee {...input} />)).toBe(expected);
    expect(renderToStaticMarkup(<ServerMarketingMarquee {...input} />)).toBe(expected);
  }
});

test("MarketingMarquee rejects invalid input before rendering", () => {
  expect(() => renderToStaticMarkup(<MarketingMarquee id="bad" items={[]} label="{count} services" />)).toThrow(RangeError);
  expect(() => renderToStaticMarkup(<MarketingMarquee id="bad" items={[{ name: "X" }]} label="Works with services" />)).toThrow(RangeError);
});
