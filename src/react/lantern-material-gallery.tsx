"use client";

import { Button, TextField } from "@hraness/ui";
import { useId, useState } from "react";

import { getDesignPaletteTheme } from "../palette-themes.js";
import { lanternControlStyles } from "./lantern-material.stylex.js";
import { SyntaxCode } from "./syntax-code.js";
import { TopBar } from "./surfaces.js";

const materialPatterns = [
  { pattern: "cells", palette: "paper", label: "Glass cells", description: "Broad planes of light for an opening promise." },
  { pattern: "weave", palette: "gruvbox", label: "Woven paper", description: "A warm, close texture for words and unfinished thoughts." },
  { pattern: "contour", palette: "rose-pine", label: "Sound contours", description: "Gentle rings for creative tools and flowing ideas." },
  { pattern: "mesh", palette: "tokyo-night", label: "Precision mesh", description: "A measured field for technical systems." },
  { pattern: "none", palette: "paper", label: "Reading room", description: "An uninterrupted surface for reference and long reading." },
] as const;

const exampleNotes = [
  { title: "A place for unfinished thoughts", detail: "Personal · edited today" },
  { title: "What we learned on the walk", detail: "Shared · edited yesterday" },
  { title: "Ideas for a slower morning", detail: "Personal · edited Monday" },
] as const;

function MaterialWorkspace({ mode }: Readonly<{ mode: "light" | "dark" }>) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [personalOnly, setPersonalOnly] = useState(false);
  const [saved, setSaved] = useState(false);
  const notes = exampleNotes.filter((note) =>
    note.title.toLowerCase().includes(query.toLowerCase())
      && (!personalOnly || note.detail.startsWith("Personal")),
  );

  return (
    <div
      className={`design-gallery__lantern-wall hraness-material-wall ${getDesignPaletteTheme("paper", mode).className}`}
      data-hraness-material="lantern"
      data-hraness-theme="paper"
      data-palette="paper"
      data-theme={mode}
      data-gallery-lantern={mode}
    >
      <div className="design-gallery__lantern-caption">
        <h3>{mode === "light" ? "Daylight" : "Lamplight"}</h3>
        <p>The same notebook in the Paper palette, light and dark.</p>
      </div>
      <div className="hraness-material-terminal">
        <div className="hraness-material-terminal__bar">notebook · terminal</div>
        <pre className="hraness-material-code" aria-label="Illustrative notebook command" tabIndex={0}><SyntaxCode code={'notebook search "a slower morning" --format markdown\n# One matching note, on your computer.'} language="shell" /></pre>
      </div>
      <div className="design-gallery__lantern-workspace hraness-material-pane" data-depth="raised">
        <TopBar
          className="hraness-material-chrome"
          position="static"
          surface="glass"
          title="Your notebook"
          actions={<span className="design-gallery__lantern-local">Local workspace</span>}
        />
        <div className="design-gallery__lantern-content">
          <TextField
            controlXstyle={lanternControlStyles.inset}
            inputProps={{ id: `${id}-search` }}
            label="Find a note"
            onChange={setQuery}
            placeholder="Search your notes"
            value={query}
          />
          <div className="design-gallery__lantern-filter">
            <Button
              aria-pressed={personalOnly}
              controlXstyle={[lanternControlStyles.edge, personalOnly && lanternControlStyles.selected]}
              data-gallery-lantern-filter=""
              onPress={() => setPersonalOnly(!personalOnly)}
              size="compact"
            >
              Personal only
            </Button>
            <span aria-live="polite">{notes.length} {notes.length === 1 ? "note" : "notes"}</span>
          </div>
          <ul className="hraness-material-rows design-gallery__lantern-notes">
            {notes.map((note) => (
              <li key={note.title}>
                <details className="hraness-material-disclosure">
                  <summary>{note.title}</summary>
                  <p>Illustrative note. Your words and decisions stay together here.</p>
                </details>
                <span>{note.detail}</span>
              </li>
            ))}
          </ul>
          {notes.length === 0 ? <p role="status">No notes match. Try a shorter search or turn off the personal filter.</p> : null}
          <div className="design-gallery__lantern-save">
            <Button
              controlXstyle={lanternControlStyles.edge}
              onPress={() => setSaved(true)}
              variant="primary"
            >
              Save this view
            </Button>
            <span aria-live="polite">{saved ? "View saved for this example." : "Example content. Nothing leaves this page."}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Executable reference, with product-neutral illustrative content. */
export function LanternMaterialGallery() {
  const [plainSelected, setPlainSelected] = useState(true);
  const [removed, setRemoved] = useState(false);
  return (
    <section className="design-gallery__section" id="lantern">
      <h2>Lantern material</h2>
      <p className="design-gallery__lantern-intro">Lantern gives reading surfaces a glowing edge and selected controls a warm fill.</p>
      <div className="design-gallery__lantern-pair">
        <MaterialWorkspace mode="light" />
        <MaterialWorkspace mode="dark" />
      </div>
      <h3>One material, different rhythms</h3>
      <div className="design-gallery__lantern-pair">
        {materialPatterns.map(({ pattern, palette, label, description }) => (
          <div
            className={`design-gallery__lantern-wall hraness-material-wall ${getDesignPaletteTheme(palette, "light").className}`}
            data-gallery-pattern={pattern}
            data-hraness-material="lantern"
            data-hraness-pattern={pattern}
            data-palette={palette}
            data-theme="light"
            key={pattern}
          >
            <div className="design-gallery__lantern-caption"><h4>{label}</h4><p>{description}</p></div>
          </div>
        ))}
      </div>
      <div
        className={`design-gallery__lantern-states hraness-material-pane ${getDesignPaletteTheme("paper", "light").className}`}
        data-hraness-material="lantern"
        data-hraness-theme="paper"
        data-palette="paper"
        data-theme="light"
      >
        <h3>Controls keep their meaning</h3>
        <p>Keyboard focus, errors, and unavailable actions stay clearly marked under Lantern.</p>
        <div className="design-gallery__lantern-state-actions">
          <Button controlXstyle={lanternControlStyles.edge} isDisabled>Unavailable action</Button>
          <Button controlXstyle={lanternControlStyles.edge} isPending>Saving changes</Button>
          <Button controlXstyle={lanternControlStyles.edge} onPress={() => setRemoved(true)} variant="danger">Remove example</Button>
          <button className="design-gallery__lantern-plain hraness-material-choice" aria-pressed={plainSelected} onClick={() => setPlainSelected(!plainSelected)} type="button">HTML selection</button>
        </div>
        <p aria-live="polite">{removed ? "Example removed for this visit." : ""}</p>
        <TextField
          controlXstyle={lanternControlStyles.inset}
          defaultValue=""
          errorMessage="Give the notebook a name before saving."
          isInvalid
          label="Notebook name"
        />
      </div>
    </section>
  );
}
