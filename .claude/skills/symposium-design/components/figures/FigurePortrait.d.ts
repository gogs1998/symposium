import * as React from "react";

/**
 * A figure's likeness — image when available, otherwise a typographic monogram plate
 * tinted with an era/channel accent.
 * @startingPoint section="Figures" subtitle="Portrait / monogram plate with era or channel tint" viewport="700x220"
 */
export interface FigurePortraitProps {
  /** Portrait image URL. Omit to render the monogram fallback. */
  src?: string;
  /** Full name — drives the monogram initials. */
  name?: string;
  /** Personal accent (creator channel color / era hue) tinting the plate. */
  accentColor?: string;
  /** @default "historical" */
  category?: "historical" | "creator";
  /** @default "portrait" */
  shape?: "portrait" | "square" | "round";
  /** Width in px (height derives from shape). @default 96 */
  size?: number;
  /** Archival grain overlay. @default true */
  grain?: boolean;
  style?: React.CSSProperties;
}

export function FigurePortrait(props: FigurePortraitProps): JSX.Element;
