"use client";

import * as stylex from "@stylexjs/stylex";

import { productionDataPreviewNoticeStyles } from "./production-data-preview-notice.stylex.js";

export interface ProductionDataPreviewNoticeProps {
  /** A non-empty deployment origin enables the warning without exposing it in the rendered page. */
  readonly surfaceOrigin?: string | undefined;
}

/** A sticky warning for previews that are connected to production data. */
export function ProductionDataPreviewNotice({
  surfaceOrigin,
}: ProductionDataPreviewNoticeProps) {
  if (surfaceOrigin === undefined || surfaceOrigin === "") return null;

  const noticePresentation = stylex.props(productionDataPreviewNoticeStyles.root);
  const emphasisPresentation = stylex.props(
    productionDataPreviewNoticeStyles.emphasis,
  );

  return (
    <aside
      {...noticePresentation}
      aria-label="Production data preview warning"
      className={`hraness-design-production-data-preview-notice ${noticePresentation.className}`}
      role="alert"
    >
      <strong {...emphasisPresentation}>Production data preview</strong>
      <span>This preview uses production data. Actions are real and affect production.</span>
    </aside>
  );
}
