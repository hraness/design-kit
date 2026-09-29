import type { ReactNode } from "react";
import { assertLaunchBeats, type LaunchBeat } from "../launch.js";
import { ArticleFigure, type ArticleFigureKind } from "./article.js";

/*
 * Server-safe launch post body: one section per beat, each with its own
 * anchor, heading, paragraph, and visual. Styled by plain-publication.css
 * inside a MarketingArticle.
 */

const HEADING_TAGS = { 2: "h2", 3: "h3", 4: "h4" } as const;

function figureKind(beat: LaunchBeat): ArticleFigureKind {
  switch (beat.visual.kind) {
    case "mockup":
      return "illustration";
    case "clip":
      return "recording";
    case "diagram":
      return "diagram";
  }
}

/** The anchor id a beat renders, such as `beat-status`. Social posts can deep-link to it. */
export function launchBeatAnchor(beat: Pick<LaunchBeat, "id">): string {
  return `beat-${beat.id}`;
}

/**
 * The beats of an "Introducing a product" post, in order. Each beat renders
 * as a section with a `#beat-<id>` anchor, its headline, its post as the
 * paragraph, and exactly one visual from `renderVisual`, captioned with the
 * beat's alt text and labelled by kind. Pass beats already resolved against
 * the launch facts.
 */
export function LaunchBeats({
  beats,
  className,
  detailLabel = "More on this",
  headingLevel = 2,
  renderVisual,
}: Readonly<{
  beats: readonly LaunchBeat[];
  className?: string;
  /** Link text for a beat's `detailHref`. */
  detailLabel?: string;
  headingLevel?: 2 | 3 | 4;
  /** Returns the one visual for a beat: a mockup, a video, or a diagram image. */
  renderVisual: (beat: LaunchBeat) => ReactNode;
}>) {
  assertLaunchBeats(beats);
  const Heading = HEADING_TAGS[headingLevel];
  if (Heading === undefined) throw new RangeError("Launch beat heading level must be 2 to 4.");
  return (
    <div className={["plain-publication__beats", className].filter(Boolean).join(" ")} data-hraness-launch-beats="">
      {beats.map((beat) => {
        const anchor = launchBeatAnchor(beat);
        const visual = renderVisual(beat);
        if (visual === null || visual === undefined || visual === false) throw new RangeError(`Launch beat ${JSON.stringify(beat.id)} needs a visual.`);
        return (
          <section aria-labelledby={`${anchor}-heading`} className="plain-publication__beat" data-part={beat.part} id={anchor} key={beat.id}>
            <Heading id={`${anchor}-heading`}>{beat.headline}</Heading>
            <p>{beat.post}</p>
            <ArticleFigure caption={beat.alt} kind={figureKind(beat)}>{visual}</ArticleFigure>
            {beat.detailHref === undefined ? null : (
              <p className="plain-publication__beat-detail"><a href={beat.detailHref}>{detailLabel}</a></p>
            )}
          </section>
        );
      })}
    </div>
  );
}
