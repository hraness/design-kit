import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { ComparisonGlyph } from "./article.js";
import { comparisonStyles as styles } from "./marketing-comparison.stylex.js";

export type MarketingComparisonStatus = "yes" | "no" | "partial" | "optional" | "depends";
export type MarketingComparisonValue = boolean | "partial" | string | Readonly<{
  status: MarketingComparisonStatus;
  label?: string;
  detail?: string;
}>;
export interface MarketingComparisonOption { readonly name: string; readonly mark?: string }
export interface MarketingComparisonRow {
  readonly label: string;
  readonly values: readonly MarketingComparisonValue[];
  readonly note?: string;
}
const labels = { yes: "Yes", no: "No", partial: "Partly", optional: "Optional", depends: "Depends" } as const;

function presentation(slot: string, props: ReturnType<typeof stylex.props>) {
  const hook = slot.replace(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`);
  return { ...props, className: `hraness-marketing-comparison__${hook} ${props.className}` };
}

function Value({ value }: Readonly<{ value: MarketingComparisonValue }>) {
  if (typeof value === "string" && value !== "partial") return <span {...presentation("text", stylex.props(styles.text))}>{value}</span>;
  const status = typeof value === "object" ? value.status : value === true ? "yes" : value === false ? "no" : "partial";
  const label = typeof value === "object" ? value.label ?? labels[status] : labels[status];
  const detail = typeof value === "object" ? value.detail : undefined;
  return <div {...presentation("value", stylex.props(styles.value))} data-comparison-status={status}>
    <span {...presentation("label", stylex.props(styles.label))}>
      <ComparisonGlyph className={`hraness-marketing-comparison__glyph ${stylex.props(styles.glyph, status === "yes" ? styles.positive : status === "no" ? styles.negative : styles.conditional).className}`}
        kind={status === "yes" || status === "no" ? status : "partial"} />
      <span>{label}</span>
    </span>
    {detail === undefined ? null : <small {...presentation("detail", stylex.props(styles.detail))}>{detail}</small>}
  </div>;
}

/** Concise product comparisons with visible words for every icon and conditional claim. */
export function MarketingComparison({ caption, className, highlight, id, note, options, rows }: Readonly<{
  caption: string;
  className?: string;
  highlight?: number;
  id?: string;
  note?: ReactNode;
  options: readonly MarketingComparisonOption[];
  rows: readonly MarketingComparisonRow[];
}>) {
  if (caption.trim() === "") throw new RangeError("Marketing comparison needs a caption.");
  if (options.length === 0) throw new RangeError("Marketing comparison needs at least one option.");
  if (highlight !== undefined && (!Number.isInteger(highlight) || highlight < 0 || highlight >= options.length)) throw new RangeError("Marketing comparison highlight must be an option index.");
  for (const row of rows) if (row.values.length !== options.length) throw new RangeError(`Marketing comparison row ${JSON.stringify(row.label)} must have one value per option.`);
  return <figure {...presentation("figure", stylex.props(styles.figure))} className={["hraness-marketing-comparison", stylex.props(styles.figure).className, className].filter(Boolean).join(" ")} id={id}>
    <div {...presentation("scroll", stylex.props(styles.scroll))} aria-label={caption} role="region" tabIndex={0}>
      <table {...presentation("table", stylex.props(styles.table))}>
        <caption {...presentation("caption", stylex.props(styles.caption))}>{caption}</caption>
        <thead><tr><td {...presentation("corner", stylex.props(styles.corner))} />{options.map((option, index) =>
          <th {...presentation("option", stylex.props(styles.option, index === highlight && styles.highlight))} data-highlight={index === highlight ? "" : undefined} key={option.name} scope="col">
            <span {...presentation("optionLabel", stylex.props(styles.optionLabel))}>
              {option.mark === undefined ? null : <img alt="" {...presentation("mark", stylex.props(styles.mark))} height={24} src={option.mark} width={24} />}
              <span>{option.name}</span>
            </span>
          </th>)}</tr></thead>
        <tbody>{rows.map((row) => <tr key={row.label}>
          <th {...presentation("rowLabel", stylex.props(styles.rowLabel))} scope="row">{row.label}{row.note === undefined ? null : <small {...presentation("detail", stylex.props(styles.detail))}>{row.note}</small>}</th>
          {row.values.map((value, index) => <td {...presentation("cell", stylex.props(styles.cell, index === highlight && styles.highlight))} data-highlight={index === highlight ? "" : undefined} key={index}><Value value={value} /></td>)}
        </tr>)}</tbody>
      </table>
    </div>
    {note === undefined || note === null ? null : <figcaption {...presentation("note", stylex.props(styles.note))}>{note}</figcaption>}
  </figure>;
}
